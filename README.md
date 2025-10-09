# Invoice Management Web App

A complete client-side Invoice Management application built with Next.js 15, TypeScript, TailwindCSS, and shadcn/ui. All data is stored and persisted in localStorage.

## 🚀 Features

### 1. Dashboard
- **Summary Cards**: Display total categories, products, invoices, and revenue
- **Monthly Revenue Chart**: Visual representation of revenue trends over the last 6 months
- Real-time statistics updated from localStorage

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
- **Storage**: localStorage (client-side only)

## 📦 Installation

```bash
# Install dependencies
yarn install

# Run development server
yarn dev

# Build for production
yarn build

# Start production server
yarn start
```

The application will be available at `http://localhost:3000`

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

## 🗄️ LocalStorage Keys

- `invoiceApp_categories` - Categories data
- `invoiceApp_products` - Products data
- `invoiceApp_invoices` - Invoices data
- `invoiceApp_categories_counter` - Category ID counter
- `invoiceApp_products_counter` - Product ID counter
- `invoiceApp_invoices_counter` - Invoice ID counter

## 🎨 Features Highlights

### Auto-increment ID System
Each entity (categories, products, invoices) maintains its own counter in localStorage, ensuring unique sequential IDs.

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
│   ├── localStorage.ts   # LocalStorage utilities
│   ├── categoryService.ts
│   ├── productService.ts
│   ├── invoiceService.ts
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

To reset all data, open browser DevTools Console and run:
```javascript
localStorage.clear();
location.reload();
```

## 🌟 Best Practices Implemented

- ✅ TypeScript for type safety
- ✅ Client-side component architecture
- ✅ Reusable service layer for data operations
- ✅ Proper form validation
- ✅ Responsive design
- ✅ Clean code organization
- ✅ User-friendly error handling
- ✅ Confirmation dialogs for destructive actions

## 📝 License

This project is open source and available for personal and commercial use.

---

Built with ❤️ using Next.js 15 and shadcn/ui
