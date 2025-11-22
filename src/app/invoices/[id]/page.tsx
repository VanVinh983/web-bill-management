'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import { invoiceService } from '@/lib/invoiceService';
import { Invoice } from '@/types/models';
import { formatCurrency, formatDateTime } from '@/lib/formatters';
import { ArrowLeft, Pencil, Printer } from 'lucide-react';

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);

  const formatOrderCode = (id: number) => id.toString().padStart(3, '0');

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

  if (!invoice) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const subtotal = invoice.items.reduce((sum, item) => sum + item.subTotal, 0);

  return (
    <div>
      <div className="flex flex-col justify-between items-start gap-3 mb-4 lg:mb-8">
        <div className="flex items-center gap-2 lg:gap-4 w-full">
          <Button variant="outline" size="sm" onClick={() => router.push('/invoices')} className="h-10 lg:h-10">
            <ArrowLeft className="h-4 w-4 mr-1 lg:mr-2" />
            <span className="hidden sm:inline">Quay lại</span>
          </Button>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-extrabold text-red-600">Mã đơn: {formatOrderCode(invoice.id)}</h1>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            type="button"
            variant="outline" 
            onClick={() => {
              router.push(`/invoices/${invoice.id}/print`);
            }} 
            className="flex-1 sm:flex-none h-10 lg:h-10 touch-manipulation active:opacity-70 cursor-pointer"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <Printer className="h-4 w-4 mr-2" />
            In hóa đơn
          </Button>
          <Button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              router.push(`/invoices/${invoice.id}/edit`);
            }} 
            className="flex-1 sm:flex-none h-10 lg:h-10 touch-manipulation"
          >
            <Pencil className="h-4 w-4 mr-2" />
            Sửa
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:gap-6">
        <Card>
          <CardHeader className="p-3 sm:p-4 lg:p-6">
            <CardTitle className="text-sm sm:text-base lg:text-lg">Thông tin hóa đơn</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 lg:p-6 pt-0">
            <div>
              <p className="text-xs lg:text-sm text-gray-500 mb-1">Mã đơn hàng</p>
              <p className="text-2xl lg:text-4xl font-extrabold text-red-600">{formatOrderCode(invoice.id)}</p>
            </div>
            <div>
              <p className="text-xs lg:text-sm text-gray-500 mb-1">Ngày đặt</p>
              <p className="text-base lg:text-lg font-semibold">{formatDateTime(invoice.orderDate)}</p>
            </div>
            <div>
              <p className="text-xs lg:text-sm text-gray-500 mb-1">Tên khách hàng</p>
              <p className="text-base lg:text-lg font-semibold">{invoice.customerName}</p>
            </div>
            <div>
              <p className="text-xs lg:text-sm text-gray-500 mb-1">Số điện thoại</p>
              <p className="text-base lg:text-lg font-semibold">{invoice.customerPhone}</p>
            </div>
            <div className="col-span-1 sm:col-span-2">
              <p className="text-xs lg:text-sm text-gray-500 mb-1">Địa chỉ</p>
              <p className="text-base lg:text-lg font-semibold">{invoice.customerAddress}</p>
            </div>
            {invoice.note && (
              <div className="col-span-1 sm:col-span-2">
                <p className="text-xs lg:text-sm text-gray-500 mb-1">Ghi chú</p>
                <p className="text-base lg:text-lg font-semibold whitespace-pre-wrap">{invoice.note}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-3 sm:p-4 lg:p-6">
            <CardTitle className="text-sm sm:text-base lg:text-lg">Danh sách sản phẩm</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
            {/* Mobile View - Cards */}
            <div className="block lg:hidden space-y-3">
              {invoice.items.map((item) => (
                <div key={item.id} className="border rounded-lg p-3 bg-gray-50">
                  <p className="font-semibold text-base mb-2">{item.productName}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs">Số lượng</p>
                      <p className="font-medium">{item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500 text-xs">Đơn giá</p>
                      <p className="font-medium">{formatCurrency(item.unitPrice)}</p>
                    </div>
                    <div className="col-span-2 pt-2 border-t">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Thành tiền:</span>
                        <span className="font-semibold">{formatCurrency(item.subTotal)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="mt-4 space-y-2 border-t pt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tạm tính:</span>
                  <span className="font-semibold">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Phí ship:</span>
                  <span className="font-semibold">{formatCurrency(invoice.shipFee)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Giảm giá/Cọc:</span>
                  <span className="font-semibold text-red-600">-{formatCurrency(invoice.discountOrDeposit)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Tổng cộng:</span>
                  <span className="text-red-600">{formatCurrency(invoice.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Desktop View - Table */}
            <div className="hidden lg:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sản phẩm</TableHead>
                      <TableHead className="text-right">Số lượng</TableHead>
                      <TableHead className="text-right">Đơn giá</TableHead>
                      <TableHead className="text-right">Thành tiền</TableHead>
                    </TableRow>
                  </TableHeader>
                <TableBody>
                  {invoice.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.productName}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.subTotal)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={3} className="text-right font-medium">
                      Tạm tính
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(subtotal)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={3} className="text-right font-medium">
                      Phí ship
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(invoice.shipFee)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={3} className="text-right font-medium">
                      Giảm giá/Cọc
                    </TableCell>
                    <TableCell className="text-right font-semibold text-red-600">
                      -{formatCurrency(invoice.discountOrDeposit)}
                    </TableCell>
                  </TableRow>
                  <TableRow className="bg-slate-50">
                    <TableCell colSpan={3} className="text-right font-bold text-lg">
                      Tổng cộng
                    </TableCell>
                    <TableCell className="text-right font-bold text-lg text-red-600">
                      {formatCurrency(invoice.totalAmount)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

