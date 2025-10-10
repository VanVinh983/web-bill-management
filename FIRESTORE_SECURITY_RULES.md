# Firestore Security Rules với Authentication

## Rules cho Production (Với Authentication)

Sau khi đã implement Firebase Authentication, bạn nên cập nhật Security Rules để chỉ cho phép authenticated users truy cập data.

### Bước 1: Vào Firebase Console

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Chọn project của bạn
3. Vào **Firestore Database** > **Rules** tab

### Bước 2: Copy Rules sau đây

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Categories collection - Chỉ authenticated users
    match /categories/{categoryId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated();
    }
    
    // Products collection - Chỉ authenticated users
    match /products/{productId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated();
    }
    
    // Invoices collection - Chỉ authenticated users
    match /invoices/{invoiceId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated();
    }
    
    // Counters collection - Chỉ authenticated users
    match /counters/{counterId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated();
    }
  }
}
```

### Bước 3: Publish Rules

Click nút **"Publish"** để apply rules.

---

## Rules cho Development/Testing

Nếu bạn đang development và chưa setup authentication, dùng rules này tạm:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

⚠️ **CẢNH BÁO**: Rules này cho phép tất cả mọi người đọc/ghi. CHỈ dùng cho testing!

---

## Advanced Rules (Multi-user với Ownership)

Nếu muốn mỗi user chỉ thấy data của mình:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    // Categories - User specific
    match /categories/{categoryId} {
      allow read: if isAuthenticated() && 
                     resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() && 
                              resource.data.userId == request.auth.uid;
    }
    
    // Products - User specific
    match /products/{productId} {
      allow read: if isAuthenticated() && 
                     resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() && 
                              resource.data.userId == request.auth.uid;
    }
    
    // Invoices - User specific
    match /invoices/{invoiceId} {
      allow read: if isAuthenticated() && 
                     resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() && 
                              resource.data.userId == request.auth.uid;
    }
    
    // Counters - User specific
    match /counters/{counterId} {
      allow read, write: if isAuthenticated() && 
                            resource.data.userId == request.auth.uid;
    }
  }
}
```

**Lưu ý**: Để dùng rules này, bạn cần thêm field `userId` vào tất cả documents khi tạo.

---

## Testing Rules

### Test trong Firebase Console

1. Vào **Firestore Database** > **Rules** tab
2. Click **"Rules Playground"** ở góc trên
3. Chọn operation (get, list, create, update, delete)
4. Nhập path (ví dụ: `/categories/1`)
5. Simulate authentication nếu cần
6. Click **"Run"**

### Test trong Code

Sau khi apply rules, test bằng cách:

1. Đăng xuất → Thử truy cập app → Nên redirect về login
2. Đăng nhập → Thử CRUD operations → Nên hoạt động bình thường
3. Logout → Check Firestore data không load được

---

## Common Errors & Solutions

### Error: "Missing or insufficient permissions"

**Nguyên nhân**:
- User chưa đăng nhập
- Rules không cho phép operation
- Token hết hạn

**Giải pháp**:
1. Kiểm tra user đã login chưa (`useAuth()`)
2. Kiểm tra rules có đúng không
3. Refresh page để refresh token

### Error: "PERMISSION_DENIED"

**Nguyên nhân**:
- Rules quá strict
- User không có quyền

**Giải pháp**:
1. Check rules trong Console
2. Verify authentication state
3. Check userId trong document (nếu dùng ownership)

---

## Best Practices

1. **Development**: Dùng test mode cho nhanh
2. **Staging**: Dùng authenticated rules
3. **Production**: Dùng authenticated + ownership rules
4. **Always**: Test rules trước khi deploy
5. **Monitor**: Check Firebase Console > Usage tab thường xuyên

---

## Rollback nếu có vấn đề

Nếu sau khi apply rules mà app bị lỗi:

1. Vào Firebase Console > Firestore > Rules
2. Click "Version history" ở góc trên
3. Chọn version trước đó
4. Click "Restore"

---

## Next Steps

Sau khi setup authentication và rules:

- [ ] Test thoroughly với nhiều users
- [ ] Setup error monitoring (Firebase Crashlytics)
- [ ] Implement proper error messages cho users
- [ ] Consider adding roles (admin, user, etc.)
- [ ] Setup backup strategy

