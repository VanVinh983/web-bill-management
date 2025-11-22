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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { categoryService } from '@/lib/categoryService';
import { Category } from '@/types/models';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formName, setFormName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const data = await categoryService.getAll();
    // Sort by id descending (newest first)
    const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name));
    setCategories(sorted);
  };

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormName(category.name);
    } else {
      setEditingCategory(null);
      setFormName('');
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      alert('Category name is required');
      return;
    }

    if (editingCategory) {
      await categoryService.update(editingCategory.id, { name: formName });
    } else {
      await categoryService.create({ name: formName });
    }

    setIsDialogOpen(false);
    setFormName('');
    setEditingCategory(null);
    await loadCategories();
  };

  const handleDelete = async (id: number) => {
    if (deleteConfirm === id) {
      await categoryService.delete(id);
      setDeleteConfirm(null);
      await loadCategories();
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4 lg:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--color-orange-900)]">Danh mục sản phẩm</h1>
        <Button onClick={() => handleOpenDialog()} size="default" className="h-11 sm:h-10 lg:h-10">
          <Plus className="mr-1 lg:mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Thêm</span>
        </Button>
      </div>

      {categories.length === 0 ? (
        <Card>
          <CardContent className="p-8 lg:p-12 text-center">
            <p className="text-gray-500">Chưa có danh mục nào. Tạo danh mục để bắt đầu.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Mobile View - Cards */}
          <div className="block lg:hidden space-y-2 sm:space-y-3">
            {categories.map((category, index) => (
              <Card 
                key={category.id} 
                className="shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/products?categoryId=${category.id}`)}
              >
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">STT: {index + 1}</p>
                      <p className="text-base font-semibold">{category.name}</p>
                    </div>
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDialog(category)}
                        className="h-10 w-10 p-0"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={deleteConfirm === category.id ? 'destructive' : 'outline'}
                        size="sm"
                        onClick={() => handleDelete(category.id)}
                        className="h-10 px-3"
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
              <CardTitle>Tất cả danh mục</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">STT</TableHead>
                    <TableHead>Tên danh mục</TableHead>
                    <TableHead className="w-32 text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category, index) => (
                    <TableRow 
                      key={category.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => router.push(`/products?categoryId=${category.id}`)}
                    >
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{category.name}</TableCell>
                      <TableCell className="text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(category)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={deleteConfirm === category.id ? 'destructive' : 'outline'}
                          size="sm"
                          onClick={() => handleDelete(category.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          {deleteConfirm === category.id && <span className="ml-1">Xác nhận?</span>}
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[95%] max-w-md rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-lg lg:text-xl">
              {editingCategory ? 'Sửa danh mục' : 'Thêm danh mục'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">Tên danh mục</Label>
              <Input
                id="name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Nhập tên danh mục"
                className="h-11 text-base"
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

