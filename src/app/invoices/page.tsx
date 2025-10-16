'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { invoiceService } from '@/lib/invoiceService';
import { Invoice } from '@/types/models';
import { formatCurrency, formatDateTime } from '@/lib/formatters';
import { Plus, Eye, Trash2, Pencil, FileText, User, Phone, Calendar, Search, X } from 'lucide-react';

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: '',
  });

  const formatOrderCode = (id: number) => `${id.toString().padStart(3, '0')}`;

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    const data = await invoiceService.getAll();
    setInvoices(data.sort((a, b) => b.id - a.id));
  };

  const handleDelete = async (id: number) => {
    if (deleteConfirm === id) {
      await invoiceService.delete(id);
      setDeleteConfirm(null);
      await loadInvoices();
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  // Filter and search invoices
  const filteredInvoices = invoices.filter((invoice) => {
    // Search by customer name or phone
    const matchesSearch = 
      searchQuery === '' ||
      invoice.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.customerPhone.includes(searchQuery);

    // Filter by date range
    const invoiceDate = new Date(invoice.orderDate);
    const matchesDateFilter = 
      (!dateFilter.startDate || invoiceDate >= new Date(dateFilter.startDate)) &&
      (!dateFilter.endDate || invoiceDate <= new Date(dateFilter.endDate + 'T23:59:59'));

    return matchesSearch && matchesDateFilter;
  });

  const handleClearFilters = () => {
    setSearchQuery('');
    setDateFilter({ startDate: '', endDate: '' });
  };

  const hasActiveFilters = searchQuery || dateFilter.startDate || dateFilter.endDate;

  return (
    <div>
      <div className="flex flex-col gap-4 mb-4 lg:mb-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl lg:text-3xl font-bold text-[var(--color-orange-900)]">Hóa đơn</h1>
          <Button onClick={() => router.push('/invoices/new')} className="h-10">
            <Plus className="mr-1 lg:mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Tạo</span>
          </Button>
        </div>

        {/* Search and Filter Bar */}
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm theo tên hoặc SĐT..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 text-base"
                />
              </div>

              {/* Date Range */}
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="date"
                  placeholder="Từ ngày"
                  value={dateFilter.startDate}
                  onChange={(e) => setDateFilter({ ...dateFilter, startDate: e.target.value })}
                  className="pl-10 h-10 text-base"
                />
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="date"
                    placeholder="Đến ngày"
                    value={dateFilter.endDate}
                    onChange={(e) => setDateFilter({ ...dateFilter, endDate: e.target.value })}
                    className="pl-10 h-10 text-base"
                  />
                </div>
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearFilters}
                    className="h-10 px-3"
                    title="Xóa bộ lọc"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Filter Summary */}
            {hasActiveFilters && (
              <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                <span>Hiển thị {filteredInvoices.length} / {invoices.length} hóa đơn</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {filteredInvoices.length === 0 ? (
        <Card>
          <CardContent className="p-8 lg:p-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500">
              {invoices.length === 0 
                ? 'Chưa có hóa đơn nào. Tạo hóa đơn để bắt đầu.'
                : 'Không tìm thấy hóa đơn nào phù hợp.'}
            </p>
            {hasActiveFilters && invoices.length > 0 && (
              <Button 
                variant="outline" 
                onClick={handleClearFilters} 
                className="mt-4"
              >
                Xóa bộ lọc
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Mobile View - Cards */}
          <div className="block lg:hidden space-y-3">
            {filteredInvoices.map((invoice, index) => (
              <Card 
                key={invoice.id} 
                className="shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/invoices/${invoice.id}`)}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-lg font-bold text-red-600 mb-1">Mã đơn: {formatOrderCode(invoice.id)}</p>
                        <div className="flex items-center gap-1.5 mb-1">
                          <User className="h-3.5 w-3.5 text-gray-500" />
                          <p className="font-semibold text-base">{invoice.customerName}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-gray-500" />
                          <p className="text-sm text-gray-600">{invoice.customerPhone}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-red-600">{formatCurrency(invoice.totalAmount)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5 pt-2 border-t">
                      <Calendar className="h-3.5 w-3.5 text-gray-500" />
                      <p className="text-sm text-gray-600">{formatDateTime(invoice.orderDate)}</p>
                    </div>

                    <div className="flex gap-2 pt-2 border-t" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/invoices/${invoice.id}`)}
                        className="flex-1 h-9"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Xem
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/invoices/${invoice.id}/edit`)}
                        className="h-9 px-3"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={deleteConfirm === invoice.id ? 'destructive' : 'outline'}
                        size="sm"
                        onClick={() => handleDelete(invoice.id)}
                        className="h-9 px-3"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop View - Table */}
          <Card className="hidden lg:block">
            <CardHeader>
              <CardTitle>Tất cả hóa đơn</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-36">Mã đơn hàng</TableHead>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead>Số điện thoại</TableHead>
                    <TableHead>Ngày</TableHead>
                    <TableHead className="text-right">Tổng tiền</TableHead>
                    <TableHead className="w-48 text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-mono text-sm">{formatOrderCode(invoice.id)}</TableCell>
                      <TableCell>{invoice.customerName}</TableCell>
                      <TableCell>{invoice.customerPhone}</TableCell>
                      <TableCell>{formatDateTime(invoice.orderDate)}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(invoice.totalAmount)}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/invoices/${invoice.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Xem
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/invoices/${invoice.id}/edit`)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={deleteConfirm === invoice.id ? 'destructive' : 'outline'}
                          size="sm"
                          onClick={() => handleDelete(invoice.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

