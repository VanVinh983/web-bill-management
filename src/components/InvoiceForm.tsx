'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { productService } from '@/lib/productService';
import { categoryService } from '@/lib/categoryService';
import { invoiceService } from '@/lib/invoiceService';
import { Product, Invoice, InvoiceItem, Category } from '@/types/models';
import { formatCurrency } from '@/lib/formatters';
import { formatNumberInput, handleNumberInputChange } from '@/lib/numberFormat';
import { Plus, Trash2, ArrowLeft, PackagePlus } from 'lucide-react';
import { format } from 'date-fns';

interface InvoiceFormProps {
  invoice?: Invoice;
}

export function InvoiceForm({ invoice }: InvoiceFormProps) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isQuickAddDialogOpen, setIsQuickAddDialogOpen] = useState(false);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  
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

  const [quickProductForm, setQuickProductForm] = useState({
    name: '',
    categoryId: '',
    salePrice: '',
    costPrice: '',
  });

  // Search term for filtering products within the dropdown options
  const [productSearch, setProductSearch] = useState('');
  const [isProductSelectOpen, setIsProductSelectOpen] = useState(false);
  const productSearchInputRef = useRef<HTMLInputElement | null>(null);

  const filteredProducts = useMemo(() => {
    const term = productSearch.trim().toLowerCase();
    if (!term) return products;
    return products.filter((p) => p.name.toLowerCase().includes(term));
  }, [products, productSearch]);

  useEffect(() => {
    const loadData = async () => {
      const [productsData, categoriesData] = await Promise.all([
        productService.getAll(),
        categoryService.getAll()
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    };
    loadData();
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

  const handleQuickAddProduct = async () => {
    // Validation
    if (!quickProductForm.name.trim()) {
      alert('Vui lòng nhập tên sản phẩm');
      return;
    }

    if (!quickProductForm.categoryId) {
      alert('Vui lòng chọn danh mục');
      return;
    }

    const salePrice = parseFloat(quickProductForm.salePrice);
    if (isNaN(salePrice) || salePrice <= 0) {
      alert('Vui lòng nhập giá bán hợp lệ');
      return;
    }

    const costPrice = parseFloat(quickProductForm.costPrice);
    if (isNaN(costPrice) || costPrice <= 0) {
      alert('Vui lòng nhập giá gốc hợp lệ');
      return;
    }

    setIsCreatingProduct(true);

    try {
      // Create product with minimal required fields
      const newProduct = await productService.create({
        name: quickProductForm.name.trim(),
        categoryId: parseInt(quickProductForm.categoryId),
        salePrice,
        costPrice,
        stockQuantity: 1, // Default stock quantity
        note: '',
        expirationDate: '',
      });

      // Refresh products list
      const updatedProducts = await productService.getAll();
      setProducts(updatedProducts);

      // Auto-select the newly created product
      setNewItem({ ...newItem, productId: newProduct.id.toString() });

      // Reset form and close dialog
      setQuickProductForm({
        name: '',
        categoryId: '',
        salePrice: '',
        costPrice: '',
      });
      setIsQuickAddDialogOpen(false);

      alert('Tạo sản phẩm thành công!');
    } catch (error) {
      alert('Lỗi khi tạo sản phẩm: ' + error);
    } finally {
      setIsCreatingProduct(false);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.customerName.trim()) {
      alert('Vui lòng nhập tên khách hàng');
      return;
    }

    if (items.length === 0) {
      alert('Vui lòng thêm ít nhất một sản phẩm');
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
        await invoiceService.update(invoice.id, invoiceData);
        alert('Invoice updated successfully!');
      } else {
        const newInvoice = await invoiceService.create(invoiceData);
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
                <Label htmlFor="customerPhone" className="text-sm font-medium">Số điện thoại</Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  placeholder="Nhập số điện thoại (không bắt buộc)"
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
              <Label htmlFor="customerAddress" className="text-sm font-medium">Địa chỉ</Label>
              <Input
                id="customerAddress"
                value={formData.customerAddress}
                onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                placeholder="Nhập địa chỉ khách hàng (không bắt buộc)"
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
                <div className="flex gap-3">
                  <Select
                    open={isProductSelectOpen}
                    onOpenChange={(open) => {
                      setIsProductSelectOpen(open);
                      if (open) {
                        // Defer focus to the search input when panel opens
                        setTimeout(() => {
                          productSearchInputRef.current?.focus();
                        }, 0);
                      } else {
                        // Optionally reset search when closing
                        setProductSearch('');
                      }
                    }}
                    value={newItem.productId}
                    onValueChange={(value) => setNewItem({ ...newItem, productId: value })}
                  >
                    <SelectTrigger className="h-11 text-base w-full sm:w-[200px]" style={{ height: '100%', maxWidth: 'calc(100% - 56px)' }}>
                      <SelectValue placeholder="Chọn sản phẩm" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Search input inside dropdown, above options */}
                      <div className="sticky top-0 z-10 bg-popover">
                        <Input
                          style={{ zIndex: 1000 }}
                          id="productSearch"
                          ref={productSearchInputRef}
                          value={productSearch}
                          onChange={(e) => {
                            const val = e.target.value;
                            setProductSearch(val);
                            // Keep focus after re-render
                            requestAnimationFrame(() => {
                              productSearchInputRef.current?.focus();
                            });
                          }}
                          onKeyDown={(e) => {
                            // Prevent Radix Select from hijacking keyboard events
                            e.stopPropagation();
                          }}
                          onPointerDown={(e) => {
                            // Prevent focus loss when clicking inside input
                            e.stopPropagation();
                          }}
                          placeholder="Tìm theo tên sản phẩm"
                          className="h-9 text-sm"
                        />
                      </div>

                      {filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                          <SelectItem key={product.id} value={product.id.toString()}>
                            {product.name} - {formatCurrency(product.salePrice)} (Tồn: {product.stockQuantity})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem disabled value="__no_result__">Không có sản phẩm phù hợp</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsQuickAddDialogOpen(true)}
                    className="h-11 shrink-0"
                    title="Tạo sản phẩm nhanh"
                  >
                    <PackagePlus className="h-4 w-4" />
                  </Button>
                </div>
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
                  type="text"
                  inputMode="numeric"
                  value={formatNumberInput(formData.shipFee)}
                  onChange={(e) => handleNumberInputChange(e.target.value, (val: string) => setFormData({ ...formData, shipFee: val }))}
                  placeholder="0"
                  className="h-11 lg:h-10 text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discountOrDeposit" className="text-sm font-medium">Giảm giá/Cọc</Label>
                <Input
                  id="discountOrDeposit"
                  type="text"
                  inputMode="numeric"
                  value={formatNumberInput(formData.discountOrDeposit)}
                  onChange={(e) => handleNumberInputChange(e.target.value, (val: string) => setFormData({ ...formData, discountOrDeposit: val }))}
                  placeholder="0"
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
                <span className="text-red-600">{formatCurrency(total)}</span>
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

      {/* Quick Add Product Dialog */}
      <Dialog open={isQuickAddDialogOpen} onOpenChange={setIsQuickAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Tạo sản phẩm nhanh</DialogTitle>
            <DialogDescription>
              Nhập thông tin cơ bản để tạo sản phẩm mới. Bạn có thể cập nhật đầy đủ thông tin sau.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="quickProductName" className="text-sm font-medium">
                Tên sản phẩm <span className="text-red-500">*</span>
              </Label>
              <Input
                id="quickProductName"
                value={quickProductForm.name}
                onChange={(e) => setQuickProductForm({ ...quickProductForm, name: e.target.value })}
                placeholder="Nhập tên sản phẩm"
                className="h-11 text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quickProductCategory" className="text-sm font-medium">
                Danh mục <span className="text-red-500">*</span>
              </Label>
              <Select
                value={quickProductForm.categoryId}
                onValueChange={(value) => setQuickProductForm({ ...quickProductForm, categoryId: value })}
              >
                <SelectTrigger className="h-11 text-base">
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quickProductSalePrice" className="text-sm font-medium">
                  Giá bán <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="quickProductSalePrice"
                  type="text"
                  inputMode="numeric"
                  value={formatNumberInput(quickProductForm.salePrice)}
                  onChange={(e) => handleNumberInputChange(
                    e.target.value, 
                    (val: string) => setQuickProductForm({ ...quickProductForm, salePrice: val })
                  )}
                  placeholder="0"
                  className="h-11 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quickProductCostPrice" className="text-sm font-medium">
                  Giá gốc <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="quickProductCostPrice"
                  type="text"
                  inputMode="numeric"
                  value={formatNumberInput(quickProductForm.costPrice)}
                  onChange={(e) => handleNumberInputChange(
                    e.target.value, 
                    (val: string) => setQuickProductForm({ ...quickProductForm, costPrice: val })
                  )}
                  placeholder="0"
                  className="h-11 text-base"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsQuickAddDialogOpen(false);
                setQuickProductForm({
                  name: '',
                  categoryId: '',
                  salePrice: '',
                  costPrice: '',
                });
              }}
              disabled={isCreatingProduct}
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={handleQuickAddProduct}
              disabled={isCreatingProduct}
            >
              {isCreatingProduct ? 'Đang tạo...' : 'Tạo sản phẩm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

