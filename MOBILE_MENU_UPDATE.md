# 📱 Mobile Menu Update

## ✅ Cập nhật hoàn tất

Menu đã được cập nhật để hỗ trợ responsive trên mobile với khả năng thu gọn/mở rộng.

---

## 🎯 Tính năng mới

### Desktop (màn hình lớn ≥ 1024px):
- ✅ Sidebar cố định bên trái (như cũ)
- ✅ Luôn hiển thị, không ẩn được

### Mobile (màn hình nhỏ < 1024px):
- ✅ **Hamburger menu button** (☰) góc phải trên
- ✅ Sidebar ẩn mặc định
- ✅ Click nút menu → Sidebar trượt từ bên trái
- ✅ Click item menu → Tự động đóng sidebar
- ✅ Click overlay (ngoài menu) → Đóng sidebar

---

## 🔧 Thay đổi kỹ thuật

### Files được cập nhật:

1. **`src/components/Sidebar.tsx`**
   - Thêm prop `onNavigate` để đóng menu khi click link
   - Hỗ trợ callback khi navigate trên mobile

2. **`src/components/LayoutWrapper.tsx`** (mới)
   - Component client-side chứa logic mobile menu
   - Quản lý state `mobileMenuOpen`
   - Sử dụng shadcn/ui Sheet component
   - Responsive breakpoint: `lg` (1024px)

3. **`src/app/layout.tsx`**
   - Giữ nguyên server component (để export metadata)
   - Sử dụng LayoutWrapper cho client logic

### Components sử dụng:
- ✅ **Sheet** (từ shadcn/ui) - Drawer/Slide panel
- ✅ **SheetTrigger** - Nút mở menu
- ✅ **SheetContent** - Nội dung menu
- ✅ **Menu icon** (từ Lucide React) - Icon hamburger

---

## 🎨 UI/UX

### Mobile Header:
```
┌─────────────────────────────┐
│ Invoice Manager      [☰]    │  ← Dark header
└─────────────────────────────┘
```

### Khi mở menu:
```
┌──────────┐
│ SIDEBAR  │ ← Trượt từ trái
│          │
│ - Dash   │
│ - Cat    │
│ - Prod   │
│ - Inv    │
└──────────┘
    [Overlay tối]
```

---

## 📱 Responsive Breakpoints

| Screen Size | Behavior |
|-------------|----------|
| < 1024px (mobile/tablet) | Hamburger menu + collapsible sidebar |
| ≥ 1024px (desktop) | Fixed sidebar always visible |

---

## ✨ Tính năng UX tốt

1. **Auto-close on navigate** - Menu tự đóng khi chọn trang
2. **Smooth animation** - Hiệu ứng trượt mượt mà
3. **Overlay backdrop** - Nền tối khi menu mở
4. **Click outside to close** - Click ngoài để đóng
5. **Proper z-index** - Menu luôn hiển thị trên cùng

---

## 🧪 Cách test

### Desktop:
1. Mở trình duyệt ở kích thước lớn (> 1024px)
2. Sidebar hiển thị cố định bên trái
3. Không có nút hamburger menu

### Mobile:
1. Thu nhỏ cửa sổ (< 1024px) hoặc mở DevTools mobile mode
2. Sidebar ẩn đi
3. Header xuất hiện với nút ☰
4. Click nút → Menu trượt ra
5. Click một item → Menu đóng + chuyển trang
6. Click ngoài menu → Menu đóng

---

## 🎯 Tailwind Classes sử dụng

- `hidden lg:block` - Ẩn trên mobile, hiện trên desktop
- `lg:hidden` - Hiện trên mobile, ẩn trên desktop  
- `flex-1 flex-col` - Layout flexible
- `p-4 lg:p-8` - Padding responsive

---

## ✅ Checklist hoàn thành

- [x] Cài đặt Sheet component từ shadcn/ui
- [x] Tạo LayoutWrapper client component
- [x] Thêm mobile header với hamburger button
- [x] Sidebar ẩn trên mobile, hiện trên desktop
- [x] Sheet menu trượt từ bên trái
- [x] Auto-close khi click menu item
- [x] Responsive padding (p-4 mobile, p-8 desktop)
- [x] Không có linter errors
- [x] Giữ nguyên metadata export

---

## 📸 Demo

### Desktop view:
```
┌────────┬───────────────────┐
│        │                   │
│ SIDEBAR│   MAIN CONTENT    │
│        │                   │
│ - Dash │                   │
│ - Cat  │                   │
│ - Prod │                   │
│ - Inv  │                   │
│        │                   │
└────────┴───────────────────┘
```

### Mobile view (closed):
```
┌───────────────────────────┐
│ Invoice Manager    [☰]    │
├───────────────────────────┤
│                           │
│   MAIN CONTENT            │
│                           │
│                           │
└───────────────────────────┘
```

### Mobile view (open):
```
┌─────────┐
│ SIDEBAR │ ← Sheet overlay
│         │
│ - Dash  │
│ - Cat   │
│ - Prod  │
│ - Inv   │
└─────────┘
  [Backdrop]
```

---

## 🚀 Sẵn sàng sử dụng!

App đã được cập nhật và đang chạy. Hãy:

1. Thu nhỏ cửa sổ trình duyệt
2. Thấy nút hamburger menu xuất hiện
3. Click để mở/đóng menu
4. Trải nghiệm responsive design mới!

**Hoạt động hoàn hảo trên mọi thiết bị! 📱 💻 🖥️**

