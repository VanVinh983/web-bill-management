'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { invoiceService } from '@/lib/invoiceService';
import { Invoice } from '@/types/models';
import { formatCurrency } from '@/lib/formatters';
import { format } from 'date-fns';
import { ArrowLeft, Printer, Share2, Facebook, Phone, Home, Calendar, User } from 'lucide-react';

export default function PrintInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isIOS, setIsIOS] = useState(false);

  const formatOrderCode = (id: number) => id.toString().padStart(3, '0');
  
  const formatOrderDateTime = (dateString: string): string => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy - HH:mm:ss');
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

  if (!invoice) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Invoice Content */}
      <div className="max-w-4xl mx-auto p-3 sm:p-4 print:p-4 space-y-4 sm:space-y-6 print:space-y-4">
        {/* Store Information Section - Separate Container */}
        <div 
          className="bg-white border-2 border-[#7c2d12] rounded-lg p-4 sm:p-6 print:p-6"
          style={{
            backgroundImage: 'url(/background-invoice.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div className="flex items-start gap-3 mb-3">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl print:text-2xl font-bold text-[#7c2d12] mb-2 sm:mb-3">
                NGOCVY STORE
              </h1>
              <div className="border border-[#7c2d12] rounded-lg p-2 sm:p-3 space-y-1.5 text-xs sm:text-sm print:text-xs">
                <div className="flex items-center gap-2 text-[#7c2d12]">
                  <Facebook className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span>Ngọc Vy (Store)</span>
                </div>
                <div className="flex items-center gap-2 text-[#7c2d12]">
                  <Phone className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span>0777809378 (Zalo sỉ)</span>
                </div>
                <div className="flex items-start gap-2 text-[#7c2d12]">
                  <Home className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <p>Số 14 Phạm Ngũ Lão, TT.Cái Dầu, H.Châu Phú, T.An Giang</p>
                    <p className="text-[#7c2d12]/70 mt-0.5">[Search Maps Ngọc Vy Cái Dầu]</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Header & Customer Info Section */}
        <div 
          className="bg-white border-2 border-[#7c2d12] rounded-lg p-4 sm:p-6 print:p-6"
          style={{
            backgroundImage: 'url(/background-invoice.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          {/* Invoice Header */}
          <div className="text-center mb-4 sm:mb-6 print:mb-6">
            <h2 className="text-lg sm:text-xl print:text-xl font-bold text-red-600 mb-2">
              HÓA ĐƠN BÁN HÀNG
            </h2>
            <p className="text-base sm:text-lg print:text-base text-gray-700">
              Mã đơn: <span className="font-bold text-lg sm:text-xl print:text-lg text-red-600">{formatOrderCode(invoice.id)}</span>
            </p>
          </div>

          {/* Customer Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm sm:text-base print:text-sm">
              <Calendar className="h-4 w-4 text-gray-600 flex-shrink-0" />
              <span className="text-gray-600">Ngày đặt:</span>
              <span className="font-semibold">{formatOrderDateTime(invoice.orderDate)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm sm:text-base print:text-sm">
              <User className="h-4 w-4 text-gray-600 flex-shrink-0" />
              <span className="text-gray-600">FB:</span>
              <span className="font-semibold">{invoice.customerName}</span>
            </div>
            {invoice.customerPhone && (
              <div className="flex items-center gap-2 text-sm sm:text-base print:text-sm">
                <Phone className="h-4 w-4 text-gray-600 flex-shrink-0" />
                <span className="text-gray-600">SĐT:</span>
                <span className="font-semibold">{invoice.customerPhone}</span>
              </div>
            )}
            {invoice.customerAddress && (
              <div className="flex items-start gap-2 text-sm sm:text-base print:text-sm">
                <Home className="h-4 w-4 text-gray-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-600">Địa chỉ:</span>
                <span className="font-semibold">{invoice.customerAddress}</span>
              </div>
            )}
          </div>

          {/* Mobile View - Cards */}
          <div className="block sm:hidden print:hidden space-y-2 mt-4">
            {invoice.items.map((item) => (
              <div key={item.id} className="border border-[#7c2d12] rounded p-2 bg-white/50">
                <div className="flex justify-between items-start mb-1">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#7c2d12]">{item.productName}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#7c2d12] text-xs">
                  <div>
                    <p className="text-gray-500">SL:</p>
                    <p className="font-medium">{item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500">Đơn giá:</p>
                    <p className="font-medium">{formatCurrency(item.unitPrice)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500">Thành tiền:</p>
                    <p className="font-semibold">{formatCurrency(item.subTotal)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop/Print View - Table */}
          <div className="hidden sm:block">
            <div className="overflow-x-auto print:overflow-visible">
              <table className="w-full border-collapse">
                <thead>
                  <tr style={{ backgroundColor: 'rgba(243, 244, 246, 0.5)' }}>
                    <th className="border border-[#7c2d12] px-2 sm:px-3 py-1.5 sm:py-2 text-left text-xs sm:text-sm print:text-xs font-semibold text-[#7c2d12]">
                      SẢN PHẨM
                    </th>
                    <th className="border border-[#7c2d12] px-2 sm:px-3 py-1.5 sm:py-2 text-center text-xs sm:text-sm print:text-xs font-semibold text-[#7c2d12]">
                      SL
                    </th>
                    <th className="border border-[#7c2d12] px-2 sm:px-3 py-1.5 sm:py-2 text-right text-xs sm:text-sm print:text-xs font-semibold text-[#7c2d12]">
                      ĐƠN GIÁ
                    </th>
                    <th className="border border-[#7c2d12] px-2 sm:px-3 py-1.5 sm:py-2 text-right text-xs sm:text-sm print:text-xs font-semibold text-[#7c2d12]">
                      THÀNH TIỀN
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item) => (
                    <tr key={item.id} style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}>
                      <td className="border border-[#7c2d12] px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm print:text-xs font-medium">
                        {item.productName}
                      </td>
                      <td className="border border-[#7c2d12] px-2 sm:px-3 py-1.5 sm:py-2 text-center text-xs sm:text-sm print:text-xs">
                        {item.quantity}
                      </td>
                      <td className="border border-[#7c2d12] px-2 sm:px-3 py-1.5 sm:py-2 text-right text-xs sm:text-sm print:text-xs">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="border border-[#7c2d12] px-2 sm:px-3 py-1.5 sm:py-2 text-right text-xs sm:text-sm print:text-xs font-semibold">
                        {formatCurrency(item.subTotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="ml-auto max-w-full sm:max-w-xs mt-4">
            <div className="space-y-1.5 sm:space-y-2 print:space-y-1 text-right">
              <div className="flex justify-between text-xs sm:text-sm print:text-xs">
                <span className="text-[#7c2d12] font-semibold">PHÍ SHIP:</span>
                <span className="font-semibold">{formatCurrency(invoice.shipFee)}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm print:text-xs">
                <span className="text-[#7c2d12] font-semibold">GIẢM GIÁ/CỌC:</span>
                <span className="font-semibold text-red-600">
                  -{formatCurrency(invoice.discountOrDeposit)}
                </span>
              </div>
              <div className="border-t border-[#7c2d12] pt-2 mt-2"></div>
              <div className="flex justify-between text-base sm:text-lg print:text-base font-bold text-[#7c2d12]">
                <span>TỔNG CỘNG:</span>
                <span>{formatCurrency(invoice.totalAmount)}</span>
              </div>
            </div>
          </div>
          <h3 className="text-sm sm:text-base print:text-sm font-bold text-[#7c2d12] mb-2 mt-6">
            THÔNG TIN TÀI KHOẢN
          </h3>
          <div className="space-y-1 text-xs sm:text-sm print:text-xs text-[#7c2d12]">
            <p><span className="font-semibold">STK:</span> 1049639535</p>
            <p><span className="font-semibold">Ngân hàng:</span> VCB (Vietcombank)</p>
            <p><span className="font-semibold">Chủ sở hữu:</span> TRƯƠNG NGỌC THÚY VY</p>
            <p><span className="font-semibold">MOMO:</span> 0777809378</p>
          </div>
          <h3 className="text-sm sm:text-base print:text-sm font-bold text-[#7c2d12] mb-2">
            Lưu ý:
          </h3>
          <ul className="space-y-1 text-xs sm:text-sm print:text-xs text-[#7c2d12] list-disc list-inside">
            <li>Đơn hàng giữ tối đa 3 ngày, sau đó sẽ hủy nếu chưa chuyển khoản.</li>
            <li>Chuyển khoản xong vui lòng gửi ảnh chụp màn hình để xác nhận.</li>
            <li>Hàng sẽ được gửi sau 1-2 ngày làm việc kể từ khi xác nhận thanh toán.</li>
            <li>Vui lòng kiểm tra hàng khi nhận, shop không chịu trách nhiệm sau khi khách đã nhận hàng.</li>
            <li>Không hỗ trợ đổi trả, chỉ đổi size nếu còn hàng.</li>
          </ul>
        </div>
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
              onClick={handlePrint}
              className="flex-1 sm:flex-none h-10 touch-manipulation active:opacity-70 cursor-pointer"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <Printer className="h-4 w-4 mr-2" />
              In hóa đơn
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
