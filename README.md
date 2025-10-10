# Invoice Management Web App

A complete Invoice Management application built with Next.js 15, TypeScript, TailwindCSS, and shadcn/ui. Data is stored and persisted in **Firebase Firestore** (with migration support from localStorage).

## 🚀 Features

### 1. Authentication & Security 🔐
- **Firebase Authentication**: Secure email/password authentication
- **Protected Routes**: All routes require login
- **Session Management**: Automatic token refresh
- **User Management**: Register, login, logout functionality
- **Security Rules**: Firestore rules enforce authentication

### 2. Dashboard
- **Summary Cards**: Display total categories, products, invoices, and revenue
- **Monthly Revenue Chart**: Visual representation of revenue trends over the last 6 months
- Real-time statistics updated from Firestore

### 2. Categories Management
- ✅ Create new categories
- ✅ Edit existing categories
- ✅ Delete categories with confirmation
- Simple ID and Name display in table format

### 3. Products Management
- ✅ Full CRUD operations
- **Product Fields**:
  - Name
  - Category (dropdown selection)
  - Cost Price & Sale Price
  - Stock Quantity
  - Expiration Date
  - Notes
- **Validations**:
  - Name required
  - Sale price ≥ cost price
  - Expiration date ≥ today
  - Proper number validation

### 4. Invoices Management
- ✅ List all invoices with customer info and totals
- ✅ View detailed invoice information
- ✅ Create new invoices
- ✅ Edit existing invoices
- ✅ Delete invoices (restores stock quantities)
- **Auto-calculated totals**: Subtotal + Ship Fee - Discount/Deposit

### 5. Invoice Creation/Editing
- **Customer Information**: Name, phone, address, order date
- **Dynamic Product Selection**: 
  - Select from available products
  - Auto-fill unit prices
  - Real-time stock validation
  - Quantity adjustment
- **Payment Details**:
  - Ship fee
  - Discount/Deposit
  - Auto-calculated total amount
- **Stock Management**: Automatically deducts/restores stock quantities

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS v4
- **UI Components**: shadcn/ui
- **Charts**: Recharts
- **Date Utilities**: date-fns
- **Icons**: Lucide React
- **Database**: Firebase Firestore
- **Backend**: Firebase (serverless)

## 📦 Installation & Setup

### 1. Install Dependencies

```bash
# Install dependencies
yarn install
```

### 2. Firebase Configuration

**Quan trọng**: Bạn cần cấu hình Firebase trước khi chạy ứng dụng.

1. Xem hướng dẫn chi tiết trong [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)
2. Tạo Firebase project
3. Tạo Firestore database
4. **Enable Authentication** (Email/Password)
5. Tạo file `.env.local` với cấu hình Firebase:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Run Application

```bash
# Run development server
yarn dev

# Build for production
yarn build

# Start production server
yarn start
```

The application will be available at `http://localhost:3002` (or port specified in package.json)

### 4. Create First User

1. Truy cập `http://localhost:3002`
2. Bạn sẽ được redirect đến trang login
3. Click "Chưa có tài khoản? Đăng ký ngay"
4. Điền thông tin và đăng ký
5. Đăng nhập và bắt đầu sử dụng!

### 5. Migration từ LocalStorage (Nếu cần)

Nếu bạn đã có dữ liệu cũ trong localStorage, xem hướng dẫn migration trong [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)

## 📊 Data Models

### Category
```typescript
{
  id: number;          // Auto-increment
  name: string;
}
```

### Product
```typescript
{
  id: number;          // Auto-increment
  name: string;
  categoryId: number;
  note: string;
  expirationDate: string;  // ISO date
  costPrice: number;
  salePrice: number;
  stockQuantity: number;
  createdAt: string;       // ISO date
}
```

### Invoice
```typescript
{
  id: number;              // Auto-increment (Order Code)
  orderDate: string;       // ISO datetime
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  shipFee: number;
  discountOrDeposit: number;
  totalAmount: number;
  items: InvoiceItem[];
}
```

### InvoiceItem
```typescript
{
  id: number;              // Auto-increment per invoice
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subTotal: number;
}
```

## 🗄️ Database Structure (Firestore)

### Collections

- **categories** - Category documents
- **products** - Product documents
- **invoices** - Invoice documents
- **counters** - ID counter documents for auto-increment

### ID Management

Each collection maintains an auto-increment ID using Firestore transactions to ensure uniqueness and sequential ordering.

## 🎨 Features Highlights

### Auto-increment ID System
Each entity (categories, products, invoices) maintains its own counter in Firestore, ensuring unique sequential IDs across all clients.

### Stock Management
- Stock quantities are automatically deducted when creating invoices
- Stock is restored when editing or deleting invoices
- Real-time stock validation when adding products to invoices

### Vietnamese Formatting
- Currency formatted as VND (Vietnamese Dong)
- Dates formatted as `dd/MM/yyyy HH:mm`
- Invoice ID displayed as "Mã đơn hàng" (Order Code)

### User Experience
- Confirmation required for deletions
- Form validations with helpful error messages
- Responsive design for all screen sizes
- Clean, modern UI with shadcn/ui components
- Intuitive navigation with sidebar

## 📁 Project Structure

```
src/
├── app/
│   ├── categories/         # Categories CRUD page
│   ├── products/          # Products CRUD page
│   ├── invoices/          # Invoices list and detail pages
│   │   ├── [id]/         # Invoice detail page
│   │   │   └── edit/     # Edit invoice page
│   │   └── new/          # Create invoice page
│   ├── layout.tsx        # Root layout with sidebar
│   ├── page.tsx          # Dashboard page
│   └── globals.css       # Global styles
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── Sidebar.tsx       # Navigation sidebar
│   └── InvoiceForm.tsx   # Invoice creation/editing form
├── lib/
│   ├── firebase.ts       # Firebase configuration
│   ├── firestoreService.ts # Firestore CRUD utilities
│   ├── categoryService.ts
│   ├── productService.ts
│   ├── invoiceService.ts
│   ├── migrationUtils.ts # Migration from localStorage
│   ├── localStorage.ts   # Legacy localStorage utilities
│   ├── formatters.ts     # Date and currency formatters
│   └── utils.ts          # Utility functions
└── types/
    └── models.ts         # TypeScript interfaces
```

## 🔧 Development Notes

### Adding Sample Data

The app starts with an empty state. You can:

1. Create categories first (e.g., "Electronics", "Clothing", "Food")
2. Add products with category assignments
3. Create invoices with customer information and products

### Clearing Data

**Firestore**: Vào Firebase Console > Firestore Database và xóa các documents

**LocalStorage** (legacy): Open browser DevTools Console and run:
```javascript
localStorage.clear();
location.reload();
```

## 🌟 Best Practices Implemented

- ✅ TypeScript for type safety
- ✅ Client-side component architecture with async/await
- ✅ Reusable service layer for data operations
- ✅ Firebase Firestore for scalable cloud database
- ✅ Proper form validation
- ✅ Responsive design
- ✅ Clean code organization
- ✅ User-friendly error handling
- ✅ Confirmation dialogs for destructive actions
- ✅ Transaction support for data consistency

## 📚 Additional Documentation

- [Firebase Setup Guide](./FIREBASE_SETUP.md) - Chi tiết cấu hình Firebase
- [Authentication Guide](./AUTHENTICATION_GUIDE.md) - Hướng dẫn về authentication
- [Firestore Security Rules](./FIRESTORE_SECURITY_RULES.md) - Security rules chi tiết
- [Migration Guide](./MIGRATION_GUIDE.md) - Hướng dẫn migration từ localStorage
- [Features Documentation](./FEATURES.md) - Chi tiết các tính năng

## 📝 License

This project is open source and available for personal and commercial use.

---

Built with ❤️ using Next.js 15 and shadcn/ui
