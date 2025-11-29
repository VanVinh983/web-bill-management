'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Nunito } from 'next/font/google';
import { Button } from '@/components/ui/button';
import { invoiceService } from '@/lib/invoiceService';
import { Invoice } from '@/types/models';
import { formatCurrency } from '@/lib/formatters';
import { format } from 'date-fns';
import { Share2, Facebook, Phone, Home, Calendar, User, Download, Notebook } from 'lucide-react';
import { toPng } from 'html-to-image';

const nunito = Nunito({
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-nunito',
});

export default function PrintInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  const formatOrderCode = (id: number) => id.toString().padStart(3, '0');
  
  const formatOrderDateTime = (dateString: string): string => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch {
      return dateString;
    }
  };

  useEffect(() => {
    // Detect iOS
    if (typeof window !== 'undefined') {
      const checkIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                       (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      setIsIOS(checkIOS);

      // Preload Nunito font from Google Fonts to avoid CORS issues when exporting
      const fontLink = document.querySelector('link[href*="fonts.googleapis.com/css2?family=Nunito"]');
      if (!fontLink) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700;800;900&display=swap';
        document.head.appendChild(link);
      }
    }
  }, []);

  useEffect(() => {
    const loadInvoice = async () => {
      const id = parseInt(params.id as string);
      const foundInvoice = await invoiceService.getById(id);
      if (foundInvoice) {
        setInvoice(foundInvoice);
      } else {
        router.push('/invoices');
      }
    };
    loadInvoice();
  }, [params.id, router]);

  const handlePrint = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // On iOS, window.print() may not work well, but we still try it
    if (typeof window !== 'undefined' && window.print) {
      try {
        window.print();
      } catch (error) {
        console.error('Print error:', error);
        if (isIOS) {
          alert('Trên iPhone, vui lòng sử dụng nút "Chia sẻ" bên dưới và chọn "In" hoặc "Lưu vào Files"');
        }
      }
    } else {
      alert('Vui lòng sử dụng chức năng in của trình duyệt (Menu > In hoặc Ctrl+P)');
    }
  };

  const handleShare = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Use Web Share API if available (works well on iOS)
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Hóa đơn ${formatOrderCode(invoice?.id || 0)}`,
          text: `Hóa đơn bán hàng - Mã đơn: ${formatOrderCode(invoice?.id || 0)}`,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled or error occurred
        if ((error as Error).name !== 'AbortError') {
          console.error('Share error:', error);
        }
      }
    } else {
      // Fallback: try to copy URL or show instructions
      if (navigator.clipboard) {
        try {
          await navigator.clipboard.writeText(window.location.href);
          alert('Đã sao chép link! Vui lòng sử dụng nút Chia sẻ (□↑) ở dưới màn hình Safari và chọn "In" hoặc "Lưu vào Files"');
        } catch {
          alert('Vui lòng sử dụng nút Chia sẻ (□↑) ở dưới màn hình Safari và chọn "In" hoặc "Lưu vào Files"');
        }
      } else {
        alert('Vui lòng sử dụng nút Chia sẻ (□↑) ở dưới màn hình Safari và chọn "In" hoặc "Lưu vào Files"');
      }
    }
  };

  const handleExportImage = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!invoiceRef.current || !invoice) {
      return;
    }

    setIsExporting(true);

    try {
      // Ensure Nunito font is loaded from Google Fonts
      let fontLink = document.querySelector('link[href*="fonts.googleapis.com/css2?family=Nunito"]') as HTMLLinkElement;
      if (!fontLink) {
        fontLink = document.createElement('link');
        fontLink.rel = 'stylesheet';
        fontLink.href = 'https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700;800;900&display=swap';
        document.head.appendChild(fontLink);
      }

      // Wait for fonts to load
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
      
      // Check if Nunito font is loaded
      const checkFont = async () => {
        try {
          await document.fonts.load('400 16px Nunito');
          await document.fonts.load('700 16px Nunito');
        } catch (e) {
          console.warn('Font loading check failed:', e);
        }
      };
      await checkFont();
      
      // Additional wait to ensure font is fully loaded and rendered
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Font is already loaded in the DOM, so html-to-image should use it
      // We'll catch any CORS errors that might occur during font parsing
      let dataUrl: string;
      try {
        dataUrl = await toPng(invoiceRef.current, {
          quality: 1.0,
          pixelRatio: 2,
          backgroundColor: '#ffffff',
          cacheBust: true,
        });
      } catch (error) {
        // If there's a CORS error with fonts, try again with a longer wait
        // The font should be fully loaded by now
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('cross-origin') || errorMessage.includes('stylesheet')) {
          console.warn('Font CORS warning, retrying with font already loaded...');
          await new Promise(resolve => setTimeout(resolve, 500));
          dataUrl = await toPng(invoiceRef.current, {
            quality: 1.0,
            pixelRatio: 2,
            backgroundColor: '#ffffff',
            cacheBust: true,
          });
        } else {
          throw error;
        }
      }

      // Create download link
      const link = document.createElement('a');
      link.download = `hoa-don-${formatOrderCode(invoice.id)}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error exporting image:', error);
      alert('Có lỗi xảy ra khi xuất hình ảnh. Vui lòng thử lại.');
    } finally {
      setIsExporting(false);
    }
  };

  if (!invoice) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Đang tải...</p>
      </div>
    );
  }

  return (
    <div 
      className={`min-h-screen bg-white ${nunito.className}`}
      style={{ fontFamily: "'Nunito', sans-serif" }}
    >
      {/* Invoice Content */}
      <div 
        ref={invoiceRef}
        className="max-w-4xl mx-auto p-3 sm:p-4 print:p-4 space-y-4 sm:space-y-6 print:space-y-4"
      >
        {/* Store Information Section - Separate Container */}
        <div 
          className="bg-white border-2 border-[#7c2d12] rounded-lg p-4 sm:p-6 print:p-6"
          style={{
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 sm:mb-3">
                <h1 className="text-4xl sm:text-5xl print:text-5xl font-extrabold text-[#7c2d12] text-center mx-auto">
                  <b className="text-center">NGOCVY STORE</b>
                </h1>
              </div>
              <div className="p-2 sm:p-3 space-y-1.5 text-sm sm:text-base print:text-sm">
                <div className="flex items-center gap-2 text-[#7c2d12]">
                  <Facebook className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                  <span className="font-bold">Ngọc Vy (Store)</span>
                </div>
                <div className="flex items-center gap-2 text-[#7c2d12]">
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                  <span className="font-bold">0777809378 (Zalo sỉ)</span>
                </div>
                <div className="flex items-start gap-2 text-[#7c2d12]">
                  <Home className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">958/3 Âu Cơ, P.14, Q.Tân Bình, TPHCM</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-[#7c2d12]">
                  <Home className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">
                      Số 14 Phạm Ngũ Lão, TT.Cái Dầu, H.Châu Phú, T.An Giang 
                      <span className="text-[#7c2d12]/70 mt-0.5 text-xs italic font-bold ml-1">
                        [Search Maps Ngọc Vy Cái Dầu]
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Header & Customer Info Section */}
        <div 
          className="bg-white border-2 border-[#7c2d12] rounded-lg p-5 sm:p-8 print:p-8 relative"
          style={{
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div 
            className="absolute inset-0 bg-white/60 rounded-lg pointer-events-none"
            style={{ zIndex: 0 }}
          ></div>
          <div className="relative z-10">
          {/* Invoice Header */}
          <p className="text-xl sm:text-2xl print:text-xl text-red-600 text-left font-bold">
            MÃ ĐƠN HÀNG: {formatOrderCode(invoice.id)}
          </p>

          {/* Customer Info */}
          <div className="space-y-3 mt-3">
            <div className="flex items-center gap-2 text-base sm:text-lg print:text-base">
              <Calendar className="h-5 w-5 text-[#7c2d12] flex-shrink-0" />
              <span className="font-bold">Ngày đặt:</span>
              <span>{formatOrderDateTime(invoice.orderDate)}</span>
            </div>
            <div className="flex items-center gap-2 text-base sm:text-lg print:text-base">
              <User className="h-5 w-5 text-[#7c2d12] flex-shrink-0" />
              <span>{invoice.customerName}</span>
            </div>
            {invoice.customerPhone && (
              <div className="flex items-center gap-2 text-base sm:text-lg print:text-base">
                <Phone className="h-5 w-5 text-[#7c2d12] flex-shrink-0" />
                <span>{invoice.customerPhone}</span>
              </div>
            )}
            {invoice.customerAddress && (
              <div className="flex items-start gap-2 text-base sm:text-lg print:text-base">
                <Home className="h-5 w-5 text-[#7c2d12] flex-shrink-0 mt-0.5" />
                <span className="break-words flex-1 min-w-0" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>{invoice.customerAddress}</span>
              </div>
            )}
            {invoice.note && (
              <div className="flex items-start gap-2 text-base sm:text-lg print:text-base">
                <Notebook className="h-5 w-5 text-[#7c2d12] flex-shrink-0 mt-0.5" />
                <span className="whitespace-pre-wrap break-words flex-1 min-w-0" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>{invoice.note}</span>
              </div>
            )}
          </div>

          {/* Mobile View - Table */}
          <div className="block sm:hidden print:hidden mt-6">
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-gray-100/50">
                    <th className="border-y border-[#7c2d12] px-2 py-4 text-left text-xs font-bold text-[#7c2d12]">
                      SẢN PHẨM
                    </th>
                    <th className="border-y border-[#7c2d12] px-2 py-4 text-center text-xs font-bold text-[#7c2d12]" style={{ width: '40px' }}>
                      SL
                    </th>
                    <th className="border-y border-[#7c2d12] px-2 py-4 text-right text-xs font-bold text-[#7c2d12]" style={{ width: '70px' }}>
                      ĐƠN GIÁ
                    </th>
                    <th className="border-y border-[#7c2d12] px-2 py-4 text-right text-xs font-bold text-[#7c2d12]" style={{ width: '100px' }}>
                      THÀNH TIỀN
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item) => (
                    <tr key={item.id} className="bg-white/50">
                      <td className="border-y border-[#7c2d12] px-2 py-4 text-xs font-bold break-words" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                        {item.productName}
                      </td>
                      <td className="border-y border-[#7c2d12] px-2 py-4 text-center text-xs font-semibold" style={{ width: '40px' }}>
                        {item.quantity}
                      </td>
                      <td className="border-y border-[#7c2d12] px-2 py-4 text-right text-xs font-semibold" style={{ width: '70px' }}>
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="border-y border-[#7c2d12] px-2 py-4 text-right text-xs font-extrabold" style={{ width: '100px' }}>
                        {formatCurrency(item.subTotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Desktop/Print View - Table */}
          <div className="hidden sm:block">
            <div className="overflow-x-auto print:overflow-visible">
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-gray-100/50">
                    <th className="border-y border-[#7c2d12] px-3 sm:px-4 py-4 sm:py-5 text-left text-sm sm:text-base print:text-sm font-bold text-[#7c2d12]">
                      SẢN PHẨM
                    </th>
                    <th className="border-y border-[#7c2d12] px-3 sm:px-4 py-4 sm:py-5 text-center text-sm sm:text-base print:text-sm font-bold text-[#7c2d12]" style={{ width: '80px' }}>
                      SL
                    </th>
                    <th className="border-y border-[#7c2d12] px-3 sm:px-4 py-4 sm:py-5 text-right text-sm sm:text-base print:text-sm font-bold text-[#7c2d12]" style={{ width: '130px' }}>
                      ĐƠN GIÁ
                    </th>
                    <th className="border-y border-[#7c2d12] px-3 sm:px-4 py-4 sm:py-5 text-right text-sm sm:text-base print:text-sm font-bold text-[#7c2d12]" style={{ width: '150px' }}>
                      THÀNH TIỀN
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item) => (
                    <tr key={item.id} className="bg-white/50">
                      <td className="border-y border-[#7c2d12] px-3 sm:px-4 py-4 sm:py-5 text-sm sm:text-base print:text-sm font-bold break-words" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                        {item.productName}
                      </td>
                      <td className="border-y border-[#7c2d12] px-3 sm:px-4 py-4 sm:py-5 text-center text-sm sm:text-base print:text-sm font-semibold" style={{ width: '80px' }}>
                        {item.quantity}
                      </td>
                      <td className="border-y border-[#7c2d12] px-3 sm:px-4 py-4 sm:py-5 text-right text-sm sm:text-base print:text-sm font-semibold" style={{ width: '130px' }}>
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="border-y border-[#7c2d12] px-3 sm:px-4 py-4 sm:py-5 text-right text-sm sm:text-base print:text-sm font-extrabold" style={{ width: '150px' }}>
                        {formatCurrency(item.subTotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div
            className="ml-auto mt-6"
            style={{ width: '70%' }}
          >
            <div className="space-y-2 sm:space-y-3 print:space-y-2 text-right">
              <div className="flex justify-between text-sm sm:text-base print:text-sm">
                <span className="text-[#7c2d12] font-bold">PHÍ SHIP:</span>
                <span className="font-bold">{formatCurrency(invoice.shipFee)}</span>
              </div>
              <div className="flex justify-between text-sm sm:text-base print:text-sm">
                <span className="text-[#7c2d12] font-bold">GIẢM GIÁ/CỌC:</span>
                <span className="font-bold text-red-600">
                  -{formatCurrency(invoice.discountOrDeposit)}
                </span>
              </div>
              <div className="border-t border-[#7c2d12] pt-3 mt-3"></div>
              <div className="flex justify-between text-sm sm:text-base print:text-sm">
                <span className="text-[#7c2d12] font-bold" style={{fontSize: '1.1rem'}}>TỔNG CỘNG:</span>
                <span className="font-bold" style={{fontSize: '1.1rem'}}>{formatCurrency(invoice.totalAmount)}</span>
              </div>
            </div>
          </div>
          <h3 className="font-extrabold text-[#7c2d12] mb-3 mt-10" style={{ fontSize: '1.1rem' }}>
            THÔNG TIN TÀI KHOẢN
          </h3>
          <div className="space-y-2 text-sm sm:text-base print:text-sm text-[#7c2d12]">
            <p><span className="font-bold">STK:</span> 1049639535</p>
            <p><span className="font-bold">Ngân hàng:</span> VCB (Vietcombank)</p>
            <p><span className="font-bold">Chủ sở hữu:</span> TRƯƠNG NGỌC THÚY VY</p>
            <p><span className="font-bold">MOMO:</span> 0777809378</p>
            <p className="font-bold">NHẬN THANH TOÁN TIỀN HÀNG VÍ TRẢ SAU MOMO</p>
            <p className="font-bold">NHẬN RÚT TIỀN VÍ TRẢ SAU MOMO (Có phí)</p>
                  
          </div>
          <h3 className="font-extrabold text-[#7c2d12] mb-3 mt-10" style={{ fontSize: '1.1rem' }}>
            LƯU Ý:
          </h3>
          <ul className="space-y-1.5 text-sm sm:text-base print:text-sm text-[#7c2d12] list-disc list-inside font-medium">
            <li>Giữ đơn tối đa 1 tuần kể từ khi có hàng</li>
            <li>CK tiền hàng = Giữ đơn dài hạn (Áp dụng cho ĐH gửi ĐVVC & Khách đến Shop lấy)</li>
            <li>Đơn gửi ĐVVC: CK trước tiền hàng Shop hỗ trợ phí ship 5k - 15k</li>
            <li>Được đồng kiểm</li>
          </ul>
          </div>
        </div>
        <p className="font-bold text-center" style={{ fontSize: '1rem' }}>CẢM ƠN VÌ SỰ LỰA CHỌN VÀ HẸN GẶP LẠI BẠN!</p>
      </div>
      <div className="no-print p-3 sm:p-4 bg-gray-50 border-b">
        <div className="flex flex-col gap-2 sm:gap-3 justify-end">
          <div className="flex gap-2 sm:gap-3">
            {isIOS && (
              <Button 
                type="button"
                variant="outline"
                onClick={handleShare}
                className="flex-1 sm:flex-none h-10 touch-manipulation active:opacity-70 cursor-pointer"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Chia sẻ
              </Button>
            )}
            <Button 
              type="button"
              variant="outline"
              onClick={handleExportImage}
              disabled={isExporting}
              className="flex-1 sm:flex-none h-10 touch-manipulation active:opacity-70 cursor-pointer"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? 'Đang xuất...' : 'Tải hình ảnh'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
