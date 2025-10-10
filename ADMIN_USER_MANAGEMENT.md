# Hướng dẫn Quản lý Users cho Admin

## 📝 Tổng quan

Chức năng đăng ký đã được ẩn. **Chỉ admin** có thể tạo tài khoản mới cho users thông qua Firebase Console.

## 👤 Cách tạo User mới

### Option 1: Qua Firebase Console (Khuyến nghị)

1. Vào [Firebase Console](https://console.firebase.google.com/)
2. Chọn project của bạn
3. Vào **Authentication** > **Users** tab
4. Click **"Add user"**
5. Nhập thông tin:
   - **Email**: Email của user
   - **Password**: Tạo password mạnh (tối thiểu 6 ký tự)
   - **User ID**: Để trống (auto-generate)
6. Click **"Add user"**
7. **Quan trọng**: Gửi email và password cho user qua kênh bảo mật (không qua email thường)

### Option 2: Tạo nhiều users cùng lúc

Nếu cần tạo nhiều users:

1. Vào Firebase Console > Authentication > Users
2. Click **"Import users"**
3. Download template CSV
4. Điền thông tin users vào CSV:
   ```
   email,password,displayName
   user1@example.com,Password123,Nguyễn Văn A
   user2@example.com,Password456,Trần Thị B
   ```
5. Upload CSV file
6. Click "Import"

## 🔐 Best Practices

### Khi tạo user mới:

1. **Password mạnh**: Tối thiểu 8 ký tự, có chữ hoa, chữ thường, số
2. **Temporary password**: Tạo password tạm, yêu cầu user đổi sau lần đầu login
3. **Secure delivery**: Gửi credentials qua Zalo/SMS, KHÔNG qua email
4. **Document**: Ghi lại user nào được tạo khi nào

### Ví dụ password mạnh:
- ✅ `NgocVy2024!`
- ✅ `QuanLy#2025`
- ❌ `123456` (quá yếu)
- ❌ `password` (quá yếu)

## 📊 Quản lý Users

### Xem danh sách users

1. Firebase Console > Authentication > Users
2. Xem tất cả users, email, UID, created date

### Disable user

1. Vào Firebase Console > Authentication > Users
2. Click vào user cần disable
3. Click **"Disable account"**
4. User không thể login nhưng data vẫn còn

### Enable lại user

1. Vào user đã disabled
2. Click **"Enable account"**

### Reset password cho user

**Option A: User tự reset (Khi có password reset UI)**
- User click "Quên mật khẩu?"
- Nhập email
- Nhận link reset qua email

**Option B: Admin reset thủ công**
1. Vào Firebase Console > Authentication > Users
2. Click vào user
3. Click **"Reset password"**
4. Firebase gửi email reset password cho user

**Option C: Admin tạo password mới**
1. Vào Firebase Console > Authentication > Users
2. Click vào user
3. Xóa user
4. Tạo lại user với password mới
5. ⚠️ **Cảnh báo**: Cách này sẽ mất data liên kết với UID cũ

### Xóa user

1. Firebase Console > Authentication > Users
2. Click vào user
3. Click **"Delete account"**
4. Confirm deletion
5. ⚠️ **Lưu ý**: 
   - User data trong Firestore KHÔNG tự động xóa
   - Cân nhắc xóa data manual nếu cần

## 🔄 Workflow cấp tài khoản

```
1. Nhận yêu cầu tạo account từ user
   ↓
2. Admin tạo account trong Firebase Console
   ↓
3. Gửi email + password cho user (qua Zalo/SMS)
   ↓
4. User đăng nhập lần đầu
   ↓
5. (Tùy chọn) User đổi password
   ↓
6. Hoàn tất
```

## 📧 Template Email/Message cho User mới

### Tiếng Việt:

```
Chào [Tên User],

Tài khoản của bạn đã được tạo:

🌐 Link: http://your-app-url.com
📧 Email: [email]
🔑 Password: [temporary_password]

⚠️ Lưu ý:
- Đổi password ngay sau khi đăng nhập lần đầu
- Không chia sẻ thông tin đăng nhập
- Liên hệ admin nếu quên password

Trân trọng,
Admin
```

## 🛡️ Security Tips

1. **Không share credentials qua email** - Dùng Zalo, SMS, hoặc gặp trực tiếp
2. **Dùng temporary passwords** - Yêu cầu user đổi ngay
3. **Review users định kỳ** - Disable users không còn active
4. **Monitor login activity** - Check Firebase Console > Authentication > Activity
5. **Enable 2FA cho admin** - Bảo vệ Firebase Console account

## 📝 Checklist khi tạo user mới

- [ ] Verify yêu cầu hợp lệ
- [ ] Tạo user với email đúng
- [ ] Generate strong temporary password
- [ ] Gửi credentials qua kênh bảo mật
- [ ] Ghi log (ai tạo, khi nào, cho ai)
- [ ] Test login với credentials mới
- [ ] Hướng dẫn user đổi password

## 🔮 Future Enhancements

Có thể thêm sau:

- [ ] Admin dashboard trong app để tạo users
- [ ] Email verification tự động
- [ ] Force password change on first login
- [ ] Password expiry policy
- [ ] Role-based access control
- [ ] Audit logs

## ❓ FAQs

**Q: User quên password thì sao?**  
A: Admin có thể reset password qua Firebase Console hoặc implement password reset UI.

**Q: Có thể tạo user không cần email?**  
A: Không. Firebase Auth yêu cầu email. Có thể dùng phone auth nhưng cần setup thêm.

**Q: Giới hạn số lượng users?**  
A: Firebase free plan: 10,000 users. Paid plans: unlimited.

**Q: User có thể tự đổi email?**  
A: Có thể implement feature này, nhưng hiện tại chưa có UI.

**Q: Làm sao biết user nào đang active?**  
A: Firebase Console > Authentication > Users > Xem "Last sign-in" timestamp.

---

**Lưu ý**: Document này dành cho admin. Không share cho users thường.

