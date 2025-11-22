// Data Models

export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  name: string;
  categoryId: number;
  note: string;
  expirationDate?: string; // ISO date, optional when not provided
  costPrice: number;
  salePrice: number;
  stockQuantity: number;
  createdAt: string; // ISO date
}

export interface InvoiceItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subTotal: number;
}

export interface Invoice {
  id: number;
  orderDate: string; // ISO datetime
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  shipFee: number;
  discountOrDeposit: number;
  totalAmount: number;
  items: InvoiceItem[];
  note?: string; // Optional note field
}

