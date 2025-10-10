# Hướng dẫn Authentication với Firebase

## 🔐 Tổng quan

Web app giờ đã có hệ thống authentication hoàn chỉnh sử dụng Firebase Authentication. Users phải đăng nhập mới có thể sử dụng app.

## ✨ Tính năng

- ✅ Đăng nhập với email/password
- ✅ Đăng ký tài khoản mới
- ✅ Đăng xuất
- ✅ Route protection (bắt buộc login)
- ✅ Session management tự động
- ✅ User info hiển thị trong sidebar
- ✅ Error messages bằng tiếng Việt
- ✅ Loading states
- ✅ Responsive design

## 🚀 Setup

### Bước 1: Enable Authentication trong Firebase

1. Vào [Firebase Console](https://console.firebase.google.com/)
2. Chọn project của bạn
3. Vào **Authentication** từ menu bên trái
4. Click **"Get started"** nếu chưa enable
5. Vào tab **"Sign-in method"**
6. Enable **"Email/Password"**:
   - Click vào "Email/Password"
   - Toggle ON "Enable"
   - Click "Save"

### Bước 2: Cập nhật Firestore Security Rules

Vào **Firestore Database** > **Rules** và copy rules từ file `FIRESTORE_SECURITY_RULES.md`.

**Recommended for production:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }
    
    match /categories/{categoryId} {
      allow read, write: if isAuthenticated();
    }
    
    match /products/{productId} {
      allow read, write: if isAuthenticated();
    }
    
    match /invoices/{invoiceId} {
      allow read, write: if isAuthenticated();
    }
    
    match /counters/{counterId} {
      allow read, write: if isAuthenticated();
    }
  }
}
```

Click **"Publish"** để apply.

### Bước 3: Tạo user đầu tiên

1. Chạy app: `yarn dev`
2. Truy cập: `http://localhost:3002`
3. Bạn sẽ được redirect đến `/login`
4. Click "Chưa có tài khoản? Đăng ký ngay"
5. Điền thông tin:
   - Tên của bạn
   - Email
   - Mật khẩu (tối thiểu 6 ký tự)
   - Xác nhận mật khẩu
6. Click "Đăng ký"
7. Bạn sẽ được tự động đăng nhập và redirect về dashboard

## 📱 Sử dụng

### Đăng nhập

1. Truy cập `/login`
2. Nhập email và password
3. Click "Đăng nhập"
4. Redirect về dashboard

### Đăng ký

1. Từ trang login, click "Chưa có tài khoản? Đăng ký ngay"
2. Điền form đăng ký
3. Click "Đăng ký"
4. Tự động đăng nhập

### Đăng xuất

1. Click button "Đăng xuất" ở cuối sidebar (desktop)
2. Hoặc mở menu trên mobile và click "Đăng xuất"
3. Confirm logout
4. Redirect về trang login

### User Info

Tên và email của user hiển thị ở cuối sidebar.

## 🔒 Security Features

### Route Protection

Tất cả routes đều được protect:
- Nếu chưa login → Redirect về `/login`
- Nếu đã login và truy cập `/login` → Redirect về `/`
- Session tự động refresh

### Password Security

- Firebase tự động hash passwords với bcrypt/scrypt
- Passwords không bao giờ được lưu plain text
- Không thể retrieve password (chỉ có thể reset)

### Token Management

- Firebase tự động quản lý tokens
- Tokens tự động refresh khi cần
- Secure HTTP-only cookies (nếu dùng SSR)

## 🛠️ Technical Details

### Files Structure

```
src/
├── lib/
│   └── authService.ts          # Firebase auth operations
├── contexts/
│   └── AuthContext.tsx         # Auth state management
├── components/
│   ├── ProtectedRoute.tsx      # Route protection
│   ├── Sidebar.tsx             # Updated với logout
│   └── LayoutWrapper.tsx       # Conditional sidebar
├── app/
│   ├── login/
│   │   └── page.tsx           # Login page
│   ├── register/
│   │   └── page.tsx           # Register page
│   └── layout.tsx             # Wrapped với AuthProvider
```

### Auth Flow

1. **App loads** → AuthProvider subscribes to auth state
2. **No user** → ProtectedRoute redirects to `/login`
3. **User logs in** → Firebase returns user object
4. **Auth state updates** → ProtectedRoute allows access
5. **User logs out** → Auth state clears → Redirect to `/login`

### State Management

Auth state được quản lý bởi `AuthContext`:

```typescript
const { user, loading } = useAuth();

// user: Firebase User object hoặc null
// loading: true khi đang check auth state
```

## 🧪 Testing

### Test Login

1. Tạo test account qua register page
2. Logout
3. Login lại với credentials
4. Verify redirect về dashboard
5. Check user info trong sidebar

### Test Route Protection

1. Logout
2. Try truy cập `/categories` trực tiếp
3. Verify redirect về `/login`
4. Login
5. Verify có thể access protected routes

### Test Logout

1. Login
2. Click logout
3. Confirm
4. Verify redirect về `/login`
5. Try back button → Still at login

## 🐛 Common Issues

### Lỗi: "Email already in use"

**Nguyên nhân**: Email đã được đăng ký

**Giải pháp**: Dùng email khác hoặc login với account đã có

### Lỗi: "Wrong password"

**Nguyên nhân**: Sai password

**Giải pháp**: 
- Kiểm tra lại password
- Hoặc implement password reset (TODO)

### Lỗi: "Network error"

**Nguyên nhân**: Không kết nối được Firebase

**Giải pháp**:
- Kiểm tra internet
- Kiểm tra `.env.local` có đúng không
- Restart dev server

### Lỗi: "Missing or insufficient permissions"

**Nguyên nhân**: Firestore rules chưa được update

**Giải pháp**: Update rules theo `FIRESTORE_SECURITY_RULES.md`

## 👥 User Management

### Xem danh sách users

1. Vào Firebase Console
2. Authentication > Users tab
3. Xem tất cả users đã đăng ký

### Disable user

1. Vào Firebase Console > Authentication > Users
2. Click vào user cần disable
3. Click "Disable account"

### Delete user

1. Vào Firebase Console > Authentication > Users
2. Click vào user
3. Click "Delete account"

## 🔄 Password Reset (Future Enhancement)

Hiện tại chưa có UI cho password reset, nhưng function đã có:

```typescript
import { resetPassword } from '@/lib/authService';

await resetPassword('user@email.com');
```

Có thể implement sau:
- Thêm "Quên mật khẩu?" link ở login page
- Tạo page `/forgot-password`
- Gửi reset email
- User click link trong email để reset

## 📊 Analytics (Optional)

Firebase cung cấp analytics về authentication:

1. Vào Firebase Console > Authentication > Users
2. Xem số lượng users
3. Xem sign-in methods
4. Xem providers used

## 🚀 Next Steps

Tính năng có thể thêm:

- [ ] Password reset functionality
- [ ] Email verification
- [ ] Social login (Google, Facebook)
- [ ] Multi-factor authentication (MFA)
- [ ] User profile management
- [ ] Role-based access control
- [ ] User activity logging

## 📝 Best Practices

1. **Passwords**: Yêu cầu strong passwords (hiện tại min 6 chars)
2. **Validation**: Validate tất cả inputs trước khi submit
3. **Error handling**: Show user-friendly error messages
4. **Loading states**: Hiển thị loading khi processing
5. **Confirmation**: Confirm destructive actions (logout, delete)

---

**Lưu ý**: Authentication đã hoàn toàn functional. Bạn có thể bắt đầu sử dụng ngay!

