'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { productService } from '@/lib/productService';
import { invoiceService } from '@/lib/invoiceService';
import { Product, Invoice, InvoiceItem } from '@/types/models';
import { formatCurrency } from '@/lib/formatters';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

interface InvoiceFormProps {
  invoice?: Invoice;
}

export function InvoiceForm({ invoice }: InvoiceFormProps) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  
  const [formData, setFormData] = useState({
    orderDate: invoice?.orderDate 
      ? format(new Date(invoice.orderDate), "yyyy-MM-dd'T'HH:mm")
      : format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    customerName: invoice?.customerName || '',
    customerPhone: invoice?.customerPhone || '',
    customerAddress: invoice?.customerAddress || '',
    shipFee: invoice?.shipFee.toString() || '0',
    discountOrDeposit: invoice?.discountOrDeposit.toString() || '0',
  });

  const [items, setItems] = useState<InvoiceItem[]>(
    invoice?.items || []
  );

  const [newItem, setNewItem] = useState({
    productId: '',
    quantity: '1',
  });

  useEffect(() => {
    setProducts(productService.getAll());
  }, []);

  const handleAddItem = () => {
    if (!newItem.productId) {
      alert('Please select a product');
      return;
    }

    const product = products.find((p) => p.id === parseInt(newItem.productId));
    if (!product) {
      alert('Product not found');
      return;
    }

    const quantity = parseInt(newItem.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      alert('Invalid quantity');
      return;
    }

    if (quantity > product.stockQuantity && !invoice) {
      alert(`Not enough stock. Available: ${product.stockQuantity}`);
      return;
    }

    const existingItemIndex = items.findIndex((item) => item.productId === product.id);
    
    if (existingItemIndex !== -1) {
      const updatedItems = [...items];
      updatedItems[existingItemIndex].quantity += quantity;
      updatedItems[existingItemIndex].subTotal = 
        updatedItems[existingItemIndex].quantity * updatedItems[existingItemIndex].unitPrice;
      setItems(updatedItems);
    } else {
      const newInvoiceItem: InvoiceItem = {
        id: items.length + 1,
        productId: product.id,
        productName: product.name,
        quantity,
        unitPrice: product.salePrice,
        subTotal: quantity * product.salePrice,
      };
      setItems([...items, newInvoiceItem]);
    }

    setNewItem({ productId: '', quantity: '1' });
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleQuantityChange = (index: number, newQuantity: string) => {
    const quantity = parseInt(newQuantity);
    if (isNaN(quantity) || quantity <= 0) return;

    const updatedItems = [...items];
    updatedItems[index].quantity = quantity;
    updatedItems[index].subTotal = quantity * updatedItems[index].unitPrice;
    setItems(updatedItems);
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.subTotal, 0);
    const shipFee = parseFloat(formData.shipFee) || 0;
    const discountOrDeposit = parseFloat(formData.discountOrDeposit) || 0;
    const total = subtotal + shipFee - discountOrDeposit;

    return { subtotal, shipFee, discountOrDeposit, total };
  };

  const handleSubmit = () => {
    // Validation
    if (!formData.customerName.trim()) {
      alert('Customer name is required');
      return;
    }

    if (!formData.customerPhone.trim()) {
      alert('Customer phone is required');
      return;
    }

    if (!formData.customerAddress.trim()) {
      alert('Customer address is required');
      return;
    }

    if (items.length === 0) {
      alert('Please add at least one product');
      return;
    }

    const { total } = calculateTotals();

    const invoiceData = {
      orderDate: new Date(formData.orderDate).toISOString(),
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      customerAddress: formData.customerAddress,
      shipFee: parseFloat(formData.shipFee) || 0,
      discountOrDeposit: parseFloat(formData.discountOrDeposit) || 0,
      totalAmount: total,
      items,
    };

    try {
      if (invoice) {
        invoiceService.update(invoice.id, invoiceData);
        alert('Invoice updated successfully!');
      } else {
        const newInvoice = invoiceService.create(invoiceData);
        alert(`Invoice created successfully! Invoice ID: ${newInvoice.id}`);
      }
      router.push('/invoices');
    } catch (error) {
      alert('Error saving invoice: ' + error);
    }
  };

  const { subtotal, shipFee, discountOrDeposit, total } = calculateTotals();

  return (
    <div>
      <div className="flex items-center gap-2 lg:gap-4 mb-4 lg:mb-8">
        <Button variant="outline" onClick={() => router.push('/invoices')} size="sm" className="h-9 lg:h-10">
          <ArrowLeft className="h-4 w-4 mr-1 lg:mr-2" />
          <span className="hidden sm:inline">Quay lại</span>
        </Button>
        <h1 className="text-xl lg:text-3xl font-bold text-gray-900">
          {invoice ? 'Sửa hóa đơn' : 'Tạo hóa đơn mới'}
        </h1>
      </div>

      <div className="grid gap-4 lg:gap-6">
        {/* Customer Information */}
        <Card>
          <CardHeader className="p-4 lg:p-6">
            <CardTitle className="text-base lg:text-lg">Thông tin khách hàng</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 p-4 lg:p-6 pt-0">
            <div className="space-y-2">
              <Label htmlFor="customerName" className="text-sm font-medium">Tên khách hàng *</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                placeholder="Nhập tên khách hàng"
                className="h-11 lg:h-10 text-base"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerPhone" className="text-sm font-medium">Số điện thoại *</Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  placeholder="Nhập số điện thoại"
                  className="h-11 lg:h-10 text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="orderDate" className="text-sm font-medium">Ngày đặt *</Label>
                <Input
                  id="orderDate"
                  type="datetime-local"
                  value={formData.orderDate}
                  onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                  className="h-11 lg:h-10 text-base"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerAddress" className="text-sm font-medium">Địa chỉ *</Label>
              <Input
                id="customerAddress"
                value={formData.customerAddress}
                onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                placeholder="Nhập địa chỉ khách hàng"
                className="h-11 lg:h-10 text-base"
              />
            </div>
          </CardContent>
        </Card>

        {/* Products */}
        <Card>
          <CardHeader className="p-4 lg:p-6">
            <CardTitle className="text-base lg:text-lg">Sản phẩm</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4 lg:p-6 pt-0">
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-2">
                <Label htmlFor="product" className="text-sm font-medium">Sản phẩm</Label>
                <Select
                  value={newItem.productId}
                  onValueChange={(value) => setNewItem({ ...newItem, productId: value })}
                >
                  <SelectTrigger className="h-11 text-base">
                    <SelectValue placeholder="Chọn sản phẩm" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.name} - {formatCurrency(product.salePrice)} (Tồn: {product.stockQuantity})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="quantity" className="text-sm font-medium">Số lượng</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                    className="h-11 text-base"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleAddItem} className="w-full h-11">
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm
                  </Button>
                </div>
              </div>
            </div>

            {items.length > 0 ? (
              <>
                {/* Mobile View - Cards */}
                <div className="block lg:hidden space-y-3">
                  {items.map((item, index) => (
                    <div key={index} className="border rounded-lg p-3 bg-gray-50">
                      <p className="font-semibold text-base mb-2">{item.productName}</p>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <Label className="text-xs text-gray-500">Số lượng</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(index, e.target.value)}
                          className="h-9 text-base"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Đơn giá</Label>
                        <p className="text-sm font-medium pt-2">{formatCurrency(item.unitPrice)}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                      <div>
                        <span className="text-xs text-gray-500">Thành tiền:</span>
                        <p className="font-semibold">{formatCurrency(item.subTotal)}</p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveItem(index)}
                        className="h-9"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Xóa
                      </Button>
                    </div>
                    </div>
                  ))}
                </div>

                {/* Desktop View - Table */}
                <div className="hidden lg:block">
                  <Table>
                    <TableHeader>
                    <TableRow>
                      <TableHead>Sản phẩm</TableHead>
                      <TableHead className="w-32">Số lượng</TableHead>
                      <TableHead className="text-right">Đơn giá</TableHead>
                      <TableHead className="text-right">Thành tiền</TableHead>
                      <TableHead className="w-20"></TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.productName}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(index, e.target.value)}
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.subTotal)}</TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveItem(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            ) : (
              <p className="text-gray-500 text-center py-6 text-sm">Chưa có sản phẩm nào</p>
            )}
          </CardContent>
        </Card>

        {/* Total Calculation */}
        <Card>
          <CardHeader className="p-4 lg:p-6">
            <CardTitle className="text-base lg:text-lg">Thanh toán</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4 lg:p-6 pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shipFee" className="text-sm font-medium">Phí ship</Label>
                <Input
                  id="shipFee"
                  type="number"
                  min="0"
                  value={formData.shipFee}
                  onChange={(e) => setFormData({ ...formData, shipFee: e.target.value })}
                  className="h-11 lg:h-10 text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discountOrDeposit" className="text-sm font-medium">Giảm giá/Cọc</Label>
                <Input
                  id="discountOrDeposit"
                  type="number"
                  min="0"
                  value={formData.discountOrDeposit}
                  onChange={(e) => setFormData({ ...formData, discountOrDeposit: e.target.value })}
                  className="h-11 lg:h-10 text-base"
                />
              </div>
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm lg:text-base">
                <span className="text-gray-600">Tạm tính:</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm lg:text-base">
                <span className="text-gray-600">Phí ship:</span>
                <span className="font-medium">{formatCurrency(shipFee)}</span>
              </div>
              <div className="flex justify-between text-sm lg:text-base">
                <span className="text-gray-600">Giảm giá/Cọc:</span>
                <span className="font-medium text-red-600">-{formatCurrency(discountOrDeposit)}</span>
              </div>
              <div className="flex justify-between text-lg lg:text-xl font-bold border-t pt-3 mt-2">
                <span>Tổng cộng:</span>
                <span className="text-green-600">{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => router.push('/invoices')} className="h-11 lg:h-10 order-2 sm:order-1">
                Hủy
              </Button>
              <Button onClick={handleSubmit} className="h-11 lg:h-10 order-1 sm:order-2">
                {invoice ? 'Cập nhật' : 'Tạo hóa đơn'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

