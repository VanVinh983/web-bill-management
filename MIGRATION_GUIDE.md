# Hướng dẫn Migration từ LocalStorage sang Firestore

## Tổng quan

Nếu bạn đã có dữ liệu trong localStorage (phiên bản cũ) và muốn chuyển sang Firestore, làm theo các bước dưới đây.

## Chuẩn bị

1. **Backup dữ liệu hiện tại** (Rất quan trọng!)
   - Mở Developer Console (F12)
   - Vào tab Application > Local Storage
   - Copy tất cả dữ liệu hoặc export bằng script

2. **Cấu hình Firebase** 
   - Đảm bảo đã làm theo hướng dẫn trong `FIREBASE_SETUP.md`
   - File `.env.local` đã được tạo với đầy đủ thông tin

## Cách 1: Sử dụng Migration UI (Khuyến nghị)

### Bước 1: Thêm trang Migration

Tạo file `/src/app/migration/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { migrateAllData, exportLocalStorageData, clearLocalStorageData, MigrationStatus } from '@/lib/migrationUtils';
import { Download, Upload, Trash2, AlertTriangle } from 'lucide-react';

export default function MigrationPage() {
  const [status, setStatus] = useState<MigrationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleMigrate = async () => {
    if (!confirm('Bạn có chắc chắn muốn chuyển dữ liệu từ localStorage sang Firestore?')) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await migrateAllData();
      setStatus(result);
      alert('Migration hoàn thành! Kiểm tra kết quả bên dưới.');
    } catch (error) {
      alert('Migration thất bại: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    exportLocalStorageData();
    alert('Dữ liệu đã được tải xuống!');
  };

  const handleClear = () => {
    clearLocalStorageData();
    alert('LocalStorage đã được xóa!');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Migration Tool</h1>

      <div className="grid gap-6">
        {/* Warning Card */}
        <Card className="border-yellow-500 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              Cảnh báo quan trọng
            </CardTitle>
          </CardHeader>
          <CardContent className="text-yellow-800">
            <ul className="list-disc list-inside space-y-2">
              <li>Backup dữ liệu trước khi migration</li>
              <li>Đảm bảo đã cấu hình Firebase đúng</li>
              <li>Migration chỉ nên chạy một lần</li>
              <li>Không xóa localStorage cho đến khi xác nhận migration thành công</li>
            </ul>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Các bước thực hiện</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Bước 1: Backup dữ liệu</h3>
              <Button onClick={handleExport} variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Tải xuống backup
              </Button>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Bước 2: Chạy Migration</h3>
              <Button 
                onClick={handleMigrate} 
                disabled={isLoading}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                {isLoading ? 'Đang migration...' : 'Bắt đầu Migration'}
              </Button>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Bước 3: Xóa LocalStorage (Sau khi xác nhận)</h3>
              <Button 
                onClick={handleClear} 
                variant="destructive"
                className="w-full"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa LocalStorage
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        {status && (
          <Card>
            <CardHeader>
              <CardTitle>Kết quả Migration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>✅ Categories: {status.categoriesMigrated}</p>
                <p>✅ Products: {status.productsMigrated}</p>
                <p>✅ Invoices: {status.invoicesMigrated}</p>
                
                {status.errors.length > 0 && (
                  <div className="mt-4 p-4 bg-red-50 rounded">
                    <p className="font-semibold text-red-800">Errors:</p>
                    <ul className="list-disc list-inside text-red-700">
                      {status.errors.map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
```

### Bước 2: Truy cập trang Migration

1. Khởi động ứng dụng: `yarn dev`
2. Truy cập: `http://localhost:3002/migration`
3. Làm theo các bước trên UI

## Cách 2: Sử dụng Console (Cho developer)

### Bước 1: Backup

Mở Developer Console (F12) và chạy:

```javascript
// Export và download backup
const data = {
  categories: JSON.parse(localStorage.getItem('ngoc-vy-categories') || '[]'),
  products: JSON.parse(localStorage.getItem('ngoc-vy-products') || '[]'),
  invoices: JSON.parse(localStorage.getItem('ngoc-vy-invoices') || '[]'),
};

console.log('Backup data:', data);

// Download as file
const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'backup-' + new Date().toISOString() + '.json';
document.body.appendChild(a);
a.click();
document.body.removeChild(a);
```

### Bước 2: Import Migration Utils

```javascript
// Import trong Console không được, phải dùng UI hoặc tạo script riêng
// Xem Cách 1 để sử dụng Migration UI
```

## Kiểm tra sau Migration

1. Vào Firebase Console > Firestore Database
2. Kiểm tra các collections:
   - `categories` - Có đủ categories không?
   - `products` - Có đủ products không?
   - `invoices` - Có đủ invoices không?
   - `counters` - Có đủ counters không?

3. Kiểm tra trong ứng dụng:
   - Vào trang Categories - Hiển thị đúng không?
   - Vào trang Products - Hiển thị đúng không?
   - Vào trang Invoices - Hiển thị đúng không?
   - Tạo mới một category/product/invoice - Hoạt động không?

## Xử lý lỗi

### Lỗi: "Permission denied"
- Kiểm tra Firestore Security Rules
- Đảm bảo rules cho phép write

### Lỗi: "Already exists"
- Dữ liệu đã tồn tại trong Firestore
- Migration script sẽ skip các items đã tồn tại

### Lỗi: "Network error"
- Kiểm tra kết nối internet
- Kiểm tra Firebase config trong `.env.local`

## Rollback

Nếu migration thất bại và cần rollback:

1. Xóa tất cả collections trong Firestore
2. Restore từ backup file đã tải
3. Hoặc giữ nguyên localStorage (nếu chưa xóa)

## Lưu ý

- **CHỈ CHẠY MIGRATION MỘT LẦN**
- Backup trước khi migration
- Xác nhận dữ liệu đã đúng trong Firestore trước khi xóa localStorage
- Nếu có lỗi, giữ nguyên localStorage để có thể retry

