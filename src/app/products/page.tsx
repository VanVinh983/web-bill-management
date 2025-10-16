'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { productService } from '@/lib/productService';
import { categoryService } from '@/lib/categoryService';
import { Product, Category } from '@/types/models';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { formatNumberInput, handleNumberInputChange } from '@/lib/numberFormat';
import { Plus, Pencil, Trash2, Package, Filter } from 'lucide-react';

function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [filterCategoryId, setFilterCategoryId] = useState<string>('all');

  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    note: '',
    expirationDate: '',
    costPrice: '',
    salePrice: '',
    stockQuantity: '',
  });

  useEffect(() => {
    loadData();
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = async () => {
    await loadProducts();
    const cats = await categoryService.getAll();
    setCategories(cats);
    
    // Check if there's a categoryId in URL params
    const categoryIdParam = searchParams.get('categoryId');
    if (categoryIdParam) {
      setFilterCategoryId(categoryIdParam);
    }
  };

  const loadProducts = async () => {
    const data = await productService.getAll();
    // Sort by id descending (newest first)
    const sorted = [...data].sort((a, b) => b.id - a.id);
    setProducts(sorted);
  };

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        categoryId: product.categoryId.toString(),
        note: product.note,
        expirationDate: product.expirationDate ? product.expirationDate.split('T')[0] : '',
        costPrice: product.costPrice.toString(),
        salePrice: product.salePrice.toString(),
        stockQuantity: product.stockQuantity.toString(),
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        categoryId: '',
        note: '',
        expirationDate: '',
        costPrice: '',
        salePrice: '',
        stockQuantity: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    // Validation
    if (!formData.name.trim()) {
      alert('Product name is required');
      return;
    }

    if (!formData.categoryId) {
      alert('Category is required');
      return;
    }

    const costPrice = parseFloat(formData.costPrice);
    const salePrice = parseFloat(formData.salePrice);

    if (isNaN(costPrice) || costPrice < 0) {
      alert('Invalid cost price');
      return;
    }

    if (isNaN(salePrice) || salePrice < 0) {
      alert('Invalid sale price');
      return;
    }

    if (salePrice < costPrice) {
      alert('Sale price must be greater than or equal to cost price');
      return;
    }

    if (formData.expirationDate) {
      const expirationDate = new Date(formData.expirationDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (expirationDate < today) {
        alert('Expiration date must be today or later');
        return;
      }
    }

    const stockQuantity = parseInt(formData.stockQuantity);
    if (isNaN(stockQuantity) || stockQuantity < 0) {
      alert('Invalid stock quantity');
      return;
    }

    const productData: Omit<Product, 'id' | 'createdAt'> = {
      name: formData.name,
      categoryId: parseInt(formData.categoryId),
      note: formData.note,
      costPrice,
      salePrice,
      stockQuantity,
    };

    if (formData.expirationDate) {
      productData.expirationDate = new Date(formData.expirationDate).toISOString();
    }

    if (editingProduct) {
      await productService.update(editingProduct.id, productData);
    } else {
      await productService.create(productData);
    }

    setIsDialogOpen(false);
    await loadProducts();
  };

  const handleDelete = async (id: number) => {
    if (deleteConfirm === id) {
      await productService.delete(id);
      setDeleteConfirm(null);
      await loadProducts();
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const getCategoryName = (categoryId: number) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || 'Unknown';
  };

  // Filter products by category
  const filteredProducts = filterCategoryId === 'all' 
    ? products 
    : products.filter(p => p.categoryId === parseInt(filterCategoryId));

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Sản phẩm</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <Select value={filterCategoryId} onValueChange={setFilterCategoryId}>
            <SelectTrigger className="h-10 w-full sm:w-[200px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Lọc theo danh mục" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả danh mục</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => handleOpenDialog()} className="h-10">
            <Plus className="mr-1 lg:mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Thêm</span>
          </Button>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="p-8 lg:p-12 text-center">
            <Package className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500">
              {products.length === 0 
                ? 'Chưa có sản phẩm nào. Tạo sản phẩm để bắt đầu.' 
                : 'Không tìm thấy sản phẩm nào trong danh mục này.'}
            </p>
            {filterCategoryId !== 'all' && products.length > 0 && (
              <Button 
                variant="outline" 
                onClick={() => setFilterCategoryId('all')} 
                className="mt-4"
              >
                Xem tất cả sản phẩm
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Mobile View - Cards */}
          <div className="block lg:hidden space-y-3">
            {filteredProducts.map((product, index) => (
              <Card key={product.id} className="shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-1">STT: {index + 1}</p>
                        <h3 className="font-semibold text-base mb-1">{product.name}</h3>
                        <p className="text-sm text-gray-600">{getCategoryName(product.categoryId)}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                      <div>
                        <p className="text-xs text-gray-500">Giá vốn</p>
                        <p className="text-sm font-semibold text-red-600">{formatCurrency(product.costPrice)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Tồn kho</p>
                        <p className="text-sm font-semibold">{product.stockQuantity}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-gray-500">HSD</p>
                        <p className="text-sm font-medium">{product.expirationDate ? formatDate(product.expirationDate) : '-'}</p>
                      </div>
                      {product.note && (
                        <div className="col-span-2">
                          <p className="text-xs text-gray-500">Ghi chú</p>
                          <p className="text-sm">{product.note}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDialog(product)}
                        className="flex-1 h-9"
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        Sửa
                      </Button>
                      <Button
                        variant={deleteConfirm === product.id ? 'destructive' : 'outline'}
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                        className="flex-1 h-9"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        {deleteConfirm === product.id ? 'Xác nhận?' : 'Xóa'}
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
              <CardTitle>Tất cả sản phẩm</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">STT</TableHead>
                      <TableHead>Tên sản phẩm</TableHead>
                      <TableHead>Danh mục</TableHead>
                      <TableHead className="text-right">Giá vốn</TableHead>
                      <TableHead className="text-right">Tồn kho</TableHead>
                      <TableHead>HSD</TableHead>
                      <TableHead>Ghi chú</TableHead>
                      <TableHead className="w-32 text-right">Thao tác</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product, index) => (
                      <TableRow key={product.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{getCategoryName(product.categoryId)}</TableCell>
                        <TableCell className="text-right text-red-600">{formatCurrency(product.costPrice)}</TableCell>
                        <TableCell className="text-right">{product.stockQuantity}</TableCell>
                        <TableCell>{product.expirationDate ? formatDate(product.expirationDate) : '-'}</TableCell>
                        <TableCell className="max-w-xs truncate">{product.note || '-'}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDialog(product)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={deleteConfirm === product.id ? 'destructive' : 'outline'}
                            size="sm"
                            onClick={() => handleDelete(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[95%] max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-lg lg:text-xl">
              {editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">Tên sản phẩm *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nhập tên sản phẩm"
                  className="h-11 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoryId" className="text-sm font-medium">Danh mục *</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
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
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="costPrice" className="text-sm font-medium">Giá vốn *</Label>
                <Input
                  id="costPrice"
                  type="text"
                  inputMode="numeric"
                  value={formatNumberInput(formData.costPrice)}
                  onChange={(e) => handleNumberInputChange(e.target.value, (val: string) => setFormData({ ...formData, costPrice: val }))}
                  placeholder="0"
                  className="h-11 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salePrice" className="text-sm font-medium">Giá bán *</Label>
                <Input
                  id="salePrice"
                  type="text"
                  inputMode="numeric"
                  value={formatNumberInput(formData.salePrice)}
                  onChange={(e) => handleNumberInputChange(e.target.value, (val: string) => setFormData({ ...formData, salePrice: val }))}
                  placeholder="0"
                  className="h-11 text-base"
                />
              </div>

              <div className="space-y-2 col-span-2 lg:col-span-1">
                <Label htmlFor="stockQuantity" className="text-sm font-medium">Tồn kho *</Label>
                <Input
                  id="stockQuantity"
                  type="text"
                  inputMode="numeric"
                  value={formatNumberInput(formData.stockQuantity)}
                  onChange={(e) => handleNumberInputChange(e.target.value, (val: string) => setFormData({ ...formData, stockQuantity: val }))}
                  placeholder="0"
                  className="h-11 text-base"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expirationDate" className="text-sm font-medium">Hạn sử dụng</Label>
              <Input
                id="expirationDate"
                type="date"
                value={formData.expirationDate}
                onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                className="h-11 text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="note" className="text-sm font-medium">Ghi chú</Label>
              <Textarea
                id="note"
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                placeholder="Nhập ghi chú về sản phẩm"
                rows={3}
                className="text-base resize-none"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1 sm:flex-none h-11">
              Hủy
            </Button>
            <Button onClick={handleSave} className="flex-1 sm:flex-none h-11">Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Đang tải...</p>
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
