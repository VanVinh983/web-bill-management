# 📋 Complete Features List

## ✅ All Implemented Features

### 1️⃣ Dashboard (`/`)
**Summary Cards:**
- 📊 Total Categories (with blue icon)
- 📦 Total Products (with green icon)
- 📄 Total Invoices (with purple icon)
- 💰 Total Revenue in VND (with orange icon)

**Charts:**
- 📈 Monthly Revenue Bar Chart (last 6 months)
- Uses Recharts library
- Formatted in VND currency
- Auto-updates when invoices change

---

### 2️⃣ Categories Management (`/categories`)

**Table Display:**
| Column | Description |
|--------|-------------|
| ID | Auto-increment number |
| Name | Category name |
| Actions | Edit & Delete buttons |

**Operations:**
- ➕ **Create**: Modal dialog with name input
- ✏️ **Edit**: Update category name
- 🗑️ **Delete**: Requires confirmation (2-click safety)

**Storage Key:** `invoiceApp_categories`

---

### 3️⃣ Products Management (`/products`)

**Table Display:**
| Column | Description |
|--------|-------------|
| ID | Auto-increment number |
| Name | Product name |
| Category | Category name (resolved) |
| Sale Price | Formatted in VND |
| Stock | Available quantity |
| Expiration | Date (dd/MM/yyyy) |
| Note | Optional notes |
| Actions | Edit & Delete buttons |

**Form Fields:**
- 📝 Product Name (required)
- 📁 Category (dropdown, required)
- 💵 Cost Price (required, number)
- 💰 Sale Price (required, number, must be ≥ cost)
- 📦 Stock Quantity (required, number ≥ 0)
- 📅 Expiration Date (required, must be ≥ today)
- 📄 Note (optional, textarea)

**Validations:**
- ✅ Name cannot be empty
- ✅ Sale price ≥ cost price
- ✅ Expiration date ≥ today
- ✅ All numbers must be valid

**Storage Key:** `invoiceApp_products`

---

### 4️⃣ Invoices List (`/invoices`)

**Table Display:**
| Column | Description |
|--------|-------------|
| ID | Invoice/Order ID |
| Customer | Customer name |
| Phone | Customer phone |
| Date | Order date (dd/MM/yyyy HH:mm) |
| Total Amount | Formatted in VND |
| Actions | View, Edit, Delete buttons |

**Operations:**
- 👁️ **View**: Navigate to detail page
- ✏️ **Edit**: Navigate to edit form
- 🗑️ **Delete**: Requires confirmation (restores stock)
- ➕ **Create**: Navigate to new invoice form

**Storage Key:** `invoiceApp_invoices`

---

### 5️⃣ Invoice Detail (`/invoices/[id]`)

**Header Information:**
- 🔢 Mã đơn hàng (Order Code): Invoice ID
- 📅 Order Date: dd/MM/yyyy HH:mm
- 👤 Customer Name
- 📞 Phone
- 📍 Address

**Items Table:**
| Column | Description |
|--------|-------------|
| Product | Product name |
| Quantity | Item quantity |
| Unit Price | Price per unit (VND) |
| Subtotal | Quantity × Unit Price (VND) |

**Payment Summary:**
- 💵 **Subtotal**: Sum of all item subtotals
- 🚚 **Ship Fee**: Delivery charge
- 🎁 **Discount/Deposit**: Amount to subtract (shown in red)
- ✅ **Total Amount**: Subtotal + Ship - Discount (green, bold)

**Formula:** `Total = Subtotal + ShipFee - DiscountOrDeposit`

**Actions:**
- ⬅️ Back to list
- ✏️ Edit invoice

---

### 6️⃣ Create Invoice (`/invoices/new`)

**Customer Information Card:**
- 📅 Order Date (datetime picker, default = now)
- 👤 Customer Name (required)
- 📞 Phone (required)
- 📍 Address (required)

**Products Card:**
- **Add Products Section:**
  - Product dropdown (shows: name, price, stock)
  - Quantity input (default = 1)
  - ➕ Add button
  
- **Items Table:**
  - Product name
  - Editable quantity input
  - Unit price (auto-filled from product)
  - Subtotal (auto-calculated)
  - 🗑️ Remove button per item

**Payment Details Card:**
- 💵 Ship Fee (number input, default = 0)
- 🎁 Discount/Deposit (number input, default = 0)
- **Summary Display:**
  - Subtotal
  - Ship Fee
  - Discount/Deposit (red)
  - **Total Amount** (large, green, bold)

**Smart Features:**
- ✅ Real-time total calculation
- ✅ Stock validation (cannot exceed available stock)
- ✅ Duplicate product handling (adds to existing quantity)
- ✅ Auto-deducts stock on save
- ✅ Success alert with invoice ID

---

### 7️⃣ Edit Invoice (`/invoices/[id]/edit`)

**Same as Create, but:**
- Pre-filled with existing data
- ✅ Restores old stock quantities
- ✅ Deducts new stock quantities
- ✅ Updates invoice in localStorage
- Shows "Edit Invoice" title

---

## 🔧 Technical Implementation

### Auto-Increment ID System

Each entity type has its own counter:
```typescript
getNextId(counterKey: string): number
```

**Counter Keys:**
- `invoiceApp_categories_counter`
- `invoiceApp_products_counter`
- `invoiceApp_invoices_counter`

**How it works:**
1. Read current counter from localStorage
2. Increment by 1
3. Save new counter
4. Return new ID

---

### Stock Management System

**On Invoice Create:**
```
For each item:
  product.stock -= item.quantity
```

**On Invoice Edit:**
```
1. Restore old quantities: product.stock += old_item.quantity
2. Deduct new quantities: product.stock -= new_item.quantity
```

**On Invoice Delete:**
```
For each item:
  product.stock += item.quantity
```

---

### Data Services

**categoryService.ts:**
- `getAll()` - Get all categories
- `getById(id)` - Get single category
- `create(data)` - Create new category
- `update(id, data)` - Update category
- `delete(id)` - Delete category

**productService.ts:**
- All above + `updateStock(id, change)` - Adjust stock

**invoiceService.ts:**
- All CRUD operations + `getTotalRevenue()` - Calculate total

---

### Formatters

**formatCurrency(amount):**
```
Input:  1000000
Output: ₫1.000.000
```

**formatDate(dateString):**
```
Input:  2025-10-09T00:00:00.000Z
Output: 09/10/2025
```

**formatDateTime(dateString):**
```
Input:  2025-10-09T14:30:00.000Z
Output: 09/10/2025 14:30
```

---

## 🎨 UI Components Used

### shadcn/ui Components:
- ✅ Button
- ✅ Card (CardHeader, CardTitle, CardContent)
- ✅ Input
- ✅ Label
- ✅ Table (TableHeader, TableBody, TableRow, TableCell, TableFooter)
- ✅ Dialog (DialogContent, DialogHeader, DialogTitle, DialogFooter)
- ✅ Select (SelectTrigger, SelectValue, SelectContent, SelectItem)
- ✅ Textarea
- ✅ DropdownMenu

### Lucide React Icons:
- 📊 LayoutDashboard
- 📁 FolderTree
- 📦 Package
- 📄 FileText
- 💰 DollarSign
- ➕ Plus
- ✏️ Pencil
- 🗑️ Trash2
- 👁️ Eye
- ⬅️ ArrowLeft

---

## 🌐 Routing Structure

```
/                           → Dashboard
/categories                 → Categories list
/products                   → Products list
/invoices                   → Invoices list
/invoices/new              → Create invoice
/invoices/[id]             → View invoice detail
/invoices/[id]/edit        → Edit invoice
```

---

## 📊 Data Flow

```
User Action
    ↓
Component (React State)
    ↓
Service Layer (lib/)
    ↓
localStorage (Browser)
    ↓
Component Re-render
    ↓
UI Update
```

---

## 🎯 Validation Rules

### Products:
- Name: Required, non-empty string
- Category: Required, must be valid category ID
- Cost Price: Required, number ≥ 0
- Sale Price: Required, number ≥ cost price
- Stock: Required, integer ≥ 0
- Expiration: Required, date ≥ today

### Invoices:
- Customer Name: Required, non-empty
- Customer Phone: Required, non-empty
- Customer Address: Required, non-empty
- Items: At least 1 product required
- Quantities: Must not exceed available stock (on create)

---

## 🎉 Bonus Features

- 🎨 **Modern UI**: Beautiful, clean design
- 📱 **Responsive**: Works on all screen sizes
- ⚡ **Real-time**: Instant updates and calculations
- 🔒 **Safe Deletes**: 2-click confirmation
- 📈 **Visual Analytics**: Charts and statistics
- 🎯 **Smart Forms**: Auto-fill and validation
- 🔄 **Stock Sync**: Automatic inventory management
- 🇻🇳 **Localized**: Vietnamese currency and date formats

---

**All features are fully functional and tested!** 🚀

