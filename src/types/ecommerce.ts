export type ProductCategory = 
  | 'Kanchipuram Silk'
  | 'Dharmavaram Pattu'
  | 'Banarasi Katan'
  | 'Pochampally Ikkat'
  | 'Gadwal Silk'
  | 'Bridal Collection';

export interface ProductVariant {
  id: string;
  productId: string;
  colorName: string;
  colorHex: string;
  sku: string;
  priceOverride?: number | null;
  stock: number;
  images: string[];
  isDefault?: boolean;
}

export interface ProductSpecifications {
  dimensions: string;
  strapDrop: string;
  material: string;
  hardware: string;
  lining: string;
  weight?: string;
  origin: string;
  careGuide: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  authorName: string;
  rating: number; // 1-5
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  date: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  tagline: string;
  description: string;
  basePrice: number;
  salePrice?: number | null;
  baseSku: string;
  isFeatured: boolean;
  isActive: boolean;
  specifications: ProductSpecifications;
  variants: ProductVariant[];
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string; // unique item id in cart (e.g. `${productId}-${variantId}`)
  productId: string;
  variantId: string;
  name: string;
  category: ProductCategory;
  colorName: string;
  colorHex: string;
  sku: string;
  unitPrice: number;
  salePrice?: number | null;
  quantity: number;
  image: string;
  stockAvailable: number;
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export type PaymentMethod = 'cod' | 'card';
export type PaymentStatus = 'Pending' | 'Paid' | 'Failed' | 'Refunded';
export type OrderStatus = 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface OrderItemSnapshot {
  productId: string;
  variantId: string;
  name: string;
  category: ProductCategory;
  colorName: string;
  colorHex: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  image: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: ShippingAddress;
  deliveryMethod: 'standard' | 'express';
  deliveryFee: number;
  items: OrderItemSnapshot[];
  subtotal: number;
  discountAmount: number;
  couponCode?: string;
  tax: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  minSpend: number;
  isActive: boolean;
  expiresAt?: string;
  description: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'inventory_manager';
}

export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  lowStockCount: number;
  totalProducts: number;
  revenueByDay: { date: string; amount: number }[];
  popularCategories: { category: string; orderCount: number }[];
}
