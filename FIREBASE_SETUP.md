# Hướng dẫn Cấu hình Firebase

## Bước 1: Tạo Firebase Project

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" hoặc "Thêm dự án"
3. Nhập tên dự án (ví dụ: "web-ngoc-vy-bill")
4. Tắt Google Analytics nếu không cần (tùy chọn)
5. Click "Create project"

## Bước 2: Tạo Web App

1. Trong Firebase Console, click vào icon Web (</>) để thêm app
2. Nhập tên app (ví dụ: "Web App")
3. Click "Register app"
4. Copy các thông tin cấu hình (apiKey, authDomain, projectId, etc.)

## Bước 3: Tạo Firestore Database

1. Trong Firebase Console, vào "Firestore Database" từ menu bên trái
2. Click "Create database"
3. Chọn "Start in production mode" hoặc "Start in test mode":
   - **Production mode**: Yêu cầu cấu hình security rules (an toàn hơn)
   - **Test mode**: Cho phép đọc/ghi tự do (chỉ dùng để phát triển)
4. Chọn location gần nhất (ví dụ: asia-southeast1 cho Việt Nam)
5. Click "Enable"

## Bước 4: Cấu hình Security Rules (Quan trọng!)

Vào tab "Rules" trong Firestore và cập nhật rules:

### Cho môi trường phát triển (Test mode):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### Cho môi trường production (Khuyến nghị):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Categories collection
    match /categories/{categoryId} {
      allow read: if true;
      allow write: if true; // Thay đổi theo nhu cầu authentication
    }
    
    // Products collection
    match /products/{productId} {
      allow read: if true;
      allow write: if true; // Thay đổi theo nhu cầu authentication
    }
    
    // Invoices collection
    match /invoices/{invoiceId} {
      allow read: if true;
      allow write: if true; // Thay đổi theo nhu cầu authentication
    }
    
    // Counters collection
    match /counters/{counterId} {
      allow read, write: if true;
    }
  }
}
```

**Lưu ý**: Rules trên cho phép tất cả mọi người đọc/ghi. Trong production thực tế, bạn nên thêm authentication và phân quyền.

## Bước 5: Cấu hình môi trường

1. Tạo file `.env.local` trong thư mục root của dự án:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

2. Thay thế các giá trị `your_*` bằng thông tin từ Firebase Console
3. **Quan trọng**: Thêm `.env.local` vào `.gitignore` để không commit lên Git

## Bước 6: Chạy Migration (Nếu có dữ liệu cũ từ localStorage)

Nếu bạn đã có dữ liệu trong localStorage và muốn chuyển sang Firestore:

1. Mở Developer Console trong trình duyệt (F12)
2. Vào tab Console
3. Copy và paste script migration từ file `MIGRATION_GUIDE.md`
4. Chạy script và đợi hoàn thành

## Bước 7: Khởi động ứng dụng

```bash
yarn dev
```

Ứng dụng sẽ tự động kết nối với Firestore!

## Kiểm tra kết nối

1. Tạo một category mới trong ứng dụng
2. Vào Firebase Console > Firestore Database
3. Bạn sẽ thấy collection "categories" với dữ liệu mới

## Troubleshooting

### Lỗi: Firebase config is missing
- Kiểm tra file `.env.local` đã được tạo chưa
- Kiểm tra các biến môi trường có prefix `NEXT_PUBLIC_` không
- Restart server sau khi tạo `.env.local`

### Lỗi: Permission denied
- Kiểm tra Firestore Security Rules
- Đảm bảo rules cho phép đọc/ghi cho collections cần thiết

### Lỗi: Network error
- Kiểm tra kết nối internet
- Kiểm tra Firebase project có active không
- Kiểm tra firewall/proxy có block Firebase không

## Các tính năng nâng cao

### 1. Backup dữ liệu
Firebase cung cấp tính năng backup tự động. Vào Firebase Console > Firestore Database > Backups

### 2. Monitoring
Vào Firebase Console > Firestore Database > Usage để xem thống kê sử dụng

### 3. Indexes
Nếu query phức tạp, bạn có thể cần tạo composite indexes trong tab "Indexes"

## Lưu ý về chi phí

- Firebase có gói miễn phí (Spark Plan) với:
  - 1 GB storage
  - 10 GB/tháng bandwidth
  - 50,000 reads/ngày
  - 20,000 writes/ngày
  - 20,000 deletes/ngày

- Với ứng dụng nhỏ, gói miễn phí là đủ
- Theo dõi usage để tránh vượt quota

