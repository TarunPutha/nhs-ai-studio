import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type { 
  Product, 
  Order, 
  Coupon, 
  AdminUser, 
  AdminStats, 
  OrderStatus, 
  PaymentStatus, 
  ShippingAddress,
  OrderItemSnapshot
} from '../src/types/ecommerce';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'store.json');

interface DatabaseSchema {
  products: Product[];
  orders: Order[];
  coupons: Coupon[];
  admins: (AdminUser & { passwordHash: string; salt: string })[];
  version: number;
}

function hashPassword(password: string, salt: string): string {
  return crypto.createHmac('sha256', salt).update(password).digest('hex');
}

// Authentic Handloom Sarees Seed Data
const SEED_PRODUCTS: Product[] = [
  {
    id: 'prod-saree-001',
    slug: 'royal-mayura-kanchipuram-silk',
    name: 'The Royal Mayura Kanchipuram Pure Silk Saree',
    category: 'Kanchipuram Silk',
    tagline: 'Pure mulberry silk handwoven with authentic 2-ply solid gold zari',
    description: 'An heirloom bridal masterpiece handwoven on traditional wooden pit looms in Kanchipuram by generational master weavers. Features 100% pure mulberry silk, a magnificent temple gopuram motif zari pallu, and intricately woven Mayura (peacock) borders with traditional Korvai interlock weaving. Includes Silk Mark Certification.',
    basePrice: 24500,
    salePrice: 21999,
    baseSku: 'NLS-KPC-01',
    isFeatured: true,
    isActive: true,
    rating: 4.95,
    reviewCount: 42,
    createdAt: new Date('2026-01-10T10:00:00Z').toISOString(),
    updatedAt: new Date().toISOString(),
    specifications: {
      dimensions: 'Length: 6.3 meters (includes 80 cm unstitched contrast blouse piece), Width: 1.18 meters (46 inches)',
      strapDrop: 'Certified Silk Mark Organization of India authentic',
      material: '100% Pure Mulberry Silk (3-Ply heavy warp and weft)',
      hardware: 'Authentic 2-Ply Gold dipped Zari with sacred temple motifs',
      lining: 'Unstitched matching silk blouse fabric included with ornate border',
      weight: '860 grams',
      origin: 'Kanchipuram, Tamil Nadu — Handloom Weavers Guild',
      careGuide: 'Strictly dry clean only. Wrap in soft unbleached muslin cloth. Air out in shade once every 4 months.'
    },
    variants: [
      {
        id: 'var-kpc-crimson',
        productId: 'prod-saree-001',
        colorName: 'Imperial Crimson & Temple Gold',
        colorHex: '#8E1624',
        sku: 'NLS-KPC-01-CRM',
        priceOverride: null,
        stock: 7,
        isDefault: true,
        images: [
          '/src/assets/images/saree_kanchipuram_crimson_1793221388969.jpg',
          '/src/assets/images/hero_nagalakshmi_saree_1793221388793.jpg'
        ]
      },
      {
        id: 'var-kpc-emerald',
        productId: 'prod-saree-001',
        colorName: 'Sacred Emerald Green',
        colorHex: '#145A32',
        sku: 'NLS-KPC-01-EMR',
        priceOverride: 22499,
        stock: 4,
        isDefault: false,
        images: [
          '/src/assets/images/saree_dharmavaram_emerald_1793221389681.jpg',
          '/src/assets/images/hero_nagalakshmi_saree_1793221388793.jpg'
        ]
      },
      {
        id: 'var-kpc-sapphire',
        productId: 'prod-saree-001',
        colorName: 'Royal Sapphire Blue',
        colorHex: '#1B3F8B',
        sku: 'NLS-KPC-01-BLU',
        priceOverride: null,
        stock: 3,
        isDefault: false,
        images: [
          '/src/assets/images/saree_banarasi_sapphire_1793221391616.jpg'
        ]
      }
    ]
  },
  {
    id: 'prod-saree-002',
    slug: 'dharmavaram-antique-brocade-pattu',
    name: 'Dharmavaram Antique Brocade Bridal Pattu Saree',
    category: 'Dharmavaram Pattu',
    tagline: 'Heritage Dharmavaram double-warp silk with heavy brocade pallu',
    description: 'Renowned for its unparalleled softness and resplendent royal luster. Crafted in the historic weaving cluster of Dharmavaram, this pattu saree showcases heavy gold zari brocade along the grand pallu and exquisite floral mango buttis hand-spread across the body.',
    basePrice: 18900,
    salePrice: 16500,
    baseSku: 'NLS-DVM-02',
    isFeatured: true,
    isActive: true,
    rating: 4.88,
    reviewCount: 31,
    createdAt: new Date('2026-01-15T12:00:00Z').toISOString(),
    updatedAt: new Date().toISOString(),
    specifications: {
      dimensions: 'Length: 6.25 meters (includes 80 cm running blouse), Width: 1.16 meters',
      strapDrop: 'Handloom Mark & Silk Mark certified',
      material: '100% Pure Fine Twisted Mulberry Silk',
      hardware: 'Rich Antique Finish Gold Zari with floral jaal',
      lining: 'Contrast blouse with heavy zari border included',
      weight: '740 grams',
      origin: 'Dharmavaram, Andhra Pradesh',
      careGuide: 'Dry clean only. Roll fold along zari borders; never press directly with hot iron.'
    },
    variants: [
      {
        id: 'var-dvm-emerald',
        productId: 'prod-saree-002',
        colorName: 'Temple Emerald & Antique Zari',
        colorHex: '#12613B',
        sku: 'NLS-DVM-02-EMR',
        priceOverride: null,
        stock: 8,
        isDefault: true,
        images: [
          '/src/assets/images/saree_dharmavaram_emerald_1793221389681.jpg',
          '/src/assets/images/hero_nagalakshmi_saree_1793221388793.jpg'
        ]
      },
      {
        id: 'var-dvm-crimson',
        productId: 'prod-saree-002',
        colorName: 'Vermillion Crimson',
        colorHex: '#9E1A29',
        sku: 'NLS-DVM-02-VRM',
        priceOverride: null,
        stock: 5,
        isDefault: false,
        images: [
          '/src/assets/images/saree_kanchipuram_crimson_1793221388969.jpg'
        ]
      },
      {
        id: 'var-dvm-mustard',
        productId: 'prod-saree-002',
        colorName: 'Turmeric Haldi & Pink',
        colorHex: '#C68B17',
        sku: 'NLS-DVM-02-MST',
        priceOverride: 16999,
        stock: 4,
        isDefault: false,
        images: [
          '/src/assets/images/saree_pochampally_ikkat_1793221390799.jpg'
        ]
      }
    ]
  },
  {
    id: 'prod-saree-003',
    slug: 'varanasi-kadwa-jaal-katan-silk',
    name: 'Varanasi Kadwa Jaal Pure Katan Silk Banarasi Saree',
    category: 'Banarasi Katan',
    tagline: 'Hand-spun Katan silk with intricate hand-woven gold & silver kadwa jaal',
    description: 'A peerless Banarasi heirloom taking over 45 days of intense master artisan loom craftsmanship. The legendary Kadwa technique weaves each floral motif individually without loose threads on the reverse side. The drape is liquid gold silk elegance personified.',
    basePrice: 26000,
    salePrice: 23500,
    baseSku: 'NLS-BNS-03',
    isFeatured: true,
    isActive: true,
    rating: 5.0,
    reviewCount: 38,
    createdAt: new Date('2026-01-20T09:00:00Z').toISOString(),
    updatedAt: new Date().toISOString(),
    specifications: {
      dimensions: 'Length: 6.4 meters (includes 90 cm brocade blouse), Width: 1.15 meters',
      strapDrop: 'Varanasi Handloom Weavers Society Certificate',
      material: '100% Pure Katan Silk with hand-spun threads',
      hardware: 'Ganga-Jamuna (Gold & Silver dual electroplated zari)',
      lining: 'Heavy Kadwa weave unstitched blouse piece',
      weight: '920 grams',
      origin: 'Varanasi, Uttar Pradesh',
      careGuide: 'Professional dry cleaning only. Store horizontally with muslin separator.'
    },
    variants: [
      {
        id: 'var-bns-blue',
        productId: 'prod-saree-003',
        colorName: 'Royal Sapphire Blue',
        colorHex: '#1C3B87',
        sku: 'NLS-BNS-03-BLU',
        priceOverride: null,
        stock: 6,
        isDefault: true,
        images: [
          '/src/assets/images/saree_banarasi_sapphire_1793221391616.jpg'
        ]
      },
      {
        id: 'var-bns-crimson',
        productId: 'prod-saree-003',
        colorName: 'Deep Rani Crimson',
        colorHex: '#7B1826',
        sku: 'NLS-BNS-03-CRM',
        priceOverride: 24200,
        stock: 3,
        isDefault: false,
        images: [
          '/src/assets/images/saree_kanchipuram_crimson_1793221388969.jpg'
        ]
      }
    ]
  },
  {
    id: 'prod-saree-004',
    slug: 'pochampally-double-ikkat-silk',
    name: 'Pochampally Double Ikkat Pure Silk Saree',
    category: 'Pochampally Ikkat',
    tagline: 'GI-tagged geometric precision hand-tied and dyed in pure silk',
    description: 'Celebrated worldwide for mathematical precision and traditional resist-dye artistry. Hand-tied and dyed in warp and weft before weaving to create captivating traditional Pasapalli, chevron, and temple motifs framed by a contrasting Rani Pink woven zari border.',
    basePrice: 14500,
    salePrice: 12800,
    baseSku: 'NLS-PCH-04',
    isFeatured: true,
    isActive: true,
    rating: 4.85,
    reviewCount: 22,
    createdAt: new Date('2026-02-01T15:00:00Z').toISOString(),
    updatedAt: new Date().toISOString(),
    specifications: {
      dimensions: 'Length: 6.2 meters (includes 80 cm Ikkat blouse), Width: 1.15 meters',
      strapDrop: 'Pochampally Handloom Weavers Cooperative Certification',
      material: '100% Pure Hand-spun Mulberry Silk',
      hardware: 'Fine tested gold zari patti border',
      lining: 'Blouse fabric with Ikkat motifs included',
      weight: '590 grams',
      origin: 'Bhoodan Pochampally, Telangana',
      careGuide: 'Dry clean recommended. Gentle cold hand wash with mild reetha nut solution.'
    },
    variants: [
      {
        id: 'var-pch-haldi',
        productId: 'prod-saree-004',
        colorName: 'Haldi Turmeric & Rani Pink',
        colorHex: '#D28C1B',
        sku: 'NLS-PCH-04-HLD',
        priceOverride: null,
        stock: 7,
        isDefault: true,
        images: [
          '/src/assets/images/saree_pochampally_ikkat_1793221390799.jpg'
        ]
      },
      {
        id: 'var-pch-emerald',
        productId: 'prod-saree-004',
        colorName: 'Peacock Green & Red',
        colorHex: '#1A5C38',
        sku: 'NLS-PCH-04-EMR',
        priceOverride: 13200,
        stock: 4,
        isDefault: false,
        images: [
          '/src/assets/images/saree_dharmavaram_emerald_1793221389681.jpg'
        ]
      }
    ]
  },
  {
    id: 'prod-saree-005',
    slug: 'gadwal-contrast-border-handcrafted-silk',
    name: 'Gadwal Contrast Border Handcrafted Pure Silk Saree',
    category: 'Gadwal Silk',
    tagline: 'Kupadam interlocking weft technique with light body and rich zari border',
    description: 'Renowned for the exquisite Kupadam weaving tradition where the lightweight pure silk body is interlocked seamlessly with heavy silk zari borders and a breathtaking pallu. Feather-light drape with grand festive elegance, beloved by brides and connoisseurs.',
    basePrice: 16800,
    salePrice: 14999,
    baseSku: 'NLS-GDW-05',
    isFeatured: false,
    isActive: true,
    rating: 4.8,
    reviewCount: 19,
    createdAt: new Date('2026-02-10T11:00:00Z').toISOString(),
    updatedAt: new Date().toISOString(),
    specifications: {
      dimensions: 'Length: 6.3 meters with contrast blouse piece, Width: 1.16 meters',
      strapDrop: 'Gadwal Handloom GI Tag Verified',
      material: 'Body: Pure Fine Silk; Border & Pallu: Heavy Tussar Silk with Zari',
      hardware: 'Traditional Kupadam interlocking gold zari border',
      lining: 'Unstitched contrast blouse piece',
      weight: '640 grams',
      origin: 'Gadwal, Telangana',
      careGuide: 'Dry clean only. Store wrapped in cotton saree covers.'
    },
    variants: [
      {
        id: 'var-gdw-gold',
        productId: 'prod-saree-005',
        colorName: 'Warm Ochre & Rani Pink',
        colorHex: '#CCA028',
        sku: 'NLS-GDW-05-GLD',
        priceOverride: null,
        stock: 5,
        isDefault: true,
        images: [
          '/src/assets/images/saree_pochampally_ikkat_1793221390799.jpg'
        ]
      },
      {
        id: 'var-gdw-blue',
        productId: 'prod-saree-005',
        colorName: 'Royal Indigo & Crimson',
        colorHex: '#1D428A',
        sku: 'NLS-GDW-05-BLU',
        priceOverride: null,
        stock: 4,
        isDefault: false,
        images: [
          '/src/assets/images/saree_banarasi_sapphire_1793221391616.jpg'
        ]
      }
    ]
  },
  {
    id: 'prod-saree-006',
    slug: 'nagalakshmi-heritage-bridal-fusion',
    name: 'Nagalakshmi Heritage Maharanis Muhurtham Bridal Pattu',
    category: 'Bridal Collection',
    tagline: 'Grand bridal statement with pure silver & real gold dip zari',
    description: 'The crown jewel of Nagalakshmi Handloom Sarees. Specially woven for sacred wedding Muhurtham ceremonies, featuring 3-ply heavy mulberry silk, real gold dip zari, and sacred temple Gopuram and Annapakshi motifs blessed for lifelong prosperity and matrimonial harmony.',
    basePrice: 32000,
    salePrice: 28500,
    baseSku: 'NLS-BDL-06',
    isFeatured: true,
    isActive: true,
    rating: 5.0,
    reviewCount: 54,
    createdAt: new Date('2026-02-18T14:00:00Z').toISOString(),
    updatedAt: new Date().toISOString(),
    specifications: {
      dimensions: 'Length: 6.4 meters with heavy grand bridal blouse, Width: 1.2 meters',
      strapDrop: 'Exclusive Master Weaver Certificate & Silk Mark Registered',
      material: 'Grade A+++ Heavy Kanchipuram Raw Mulberry Silk',
      hardware: 'Hand-twisted real silver wire with 24k gold bath zari',
      lining: 'Grand bridal blouse with all-over kadwa buttis and sleeve border',
      weight: '1050 grams',
      origin: 'Nagalakshmi Master Handlooms, Kanchipuram Atelier',
      careGuide: 'Professional heirloom silk dry cleaning only. Avoid perfumes on zari work.'
    },
    variants: [
      {
        id: 'var-bdl-crimson',
        productId: 'prod-saree-006',
        colorName: 'Auspicious Sindoor Crimson & Gold',
        colorHex: '#961826',
        sku: 'NLS-BDL-06-SND',
        priceOverride: null,
        stock: 5,
        isDefault: true,
        images: [
          '/src/assets/images/saree_kanchipuram_crimson_1793221388969.jpg',
          '/src/assets/images/hero_nagalakshmi_saree_1793221388793.jpg'
        ]
      },
      {
        id: 'var-bdl-emerald',
        productId: 'prod-saree-006',
        colorName: 'Temple Emerald & Antique Zari',
        colorHex: '#125934',
        sku: 'NLS-BDL-06-EMR',
        priceOverride: 29500,
        stock: 3,
        isDefault: false,
        images: [
          '/src/assets/images/saree_dharmavaram_emerald_1793221389681.jpg'
        ]
      }
    ]
  }
];

const SEED_COUPONS: Coupon[] = [
  {
    code: 'UTSAV10',
    discountType: 'percentage',
    value: 10,
    minSpend: 5000,
    isActive: true,
    description: '10% festive weaver appreciation discount on orders above ₹5,000'
  },
  {
    code: 'SILK1000',
    discountType: 'fixed',
    value: 1000,
    minSpend: 15000,
    isActive: true,
    description: 'Flat ₹1,000 off on pure silk bridal collections above ₹15,000'
  },
  {
    code: 'NAGALAKSHMI15',
    discountType: 'percentage',
    value: 15,
    minSpend: 25000,
    isActive: true,
    description: '15% grand wedding celebration discount on orders above ₹25,000'
  }
];

// Admin: admin@nagalakshmihandlooms.com / nagalakshmi2026!
const ADMIN_SALT = 'nagalakshmi_salt_2026_silk';
const ADMIN_PASSWORD_HASH = hashPassword('nagalakshmi2026!', ADMIN_SALT);

const SEED_ADMINS: (AdminUser & { passwordHash: string; salt: string })[] = [
  {
    id: 'adm-001',
    email: 'admin@nagalakshmihandlooms.com',
    name: 'Nagalakshmi Ammal',
    role: 'super_admin',
    passwordHash: ADMIN_PASSWORD_HASH,
    salt: ADMIN_SALT
  }
];

const SEED_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    orderNumber: 'NLS-2026-7814',
    customerName: 'Ananya Seshadri',
    customerEmail: 'ananya.seshadri@gmail.com',
    customerPhone: '+91 98401 22345',
    shippingAddress: {
      fullName: 'Ananya Seshadri',
      email: 'ananya.seshadri@gmail.com',
      phone: '+91 98401 22345',
      addressLine1: 'Flat 4B, Heritage Towers, Karpagam Avenue',
      city: 'Chennai',
      state: 'Tamil Nadu',
      postalCode: '600028',
      country: 'India'
    },
    deliveryMethod: 'express',
    deliveryFee: 250,
    items: [
      {
        productId: 'prod-saree-001',
        variantId: 'var-kpc-crimson',
        name: 'The Royal Mayura Kanchipuram Pure Silk Saree',
        category: 'Kanchipuram Silk',
        colorName: 'Imperial Crimson & Temple Gold',
        colorHex: '#8E1624',
        sku: 'NLS-KPC-01-CRM',
        unitPrice: 21999,
        quantity: 1,
        subtotal: 21999,
        image: '/src/assets/images/saree_kanchipuram_crimson_1793221388969.jpg'
      }
    ],
    subtotal: 21999,
    discountAmount: 1000,
    couponCode: 'SILK1000',
    tax: 0,
    totalAmount: 21249,
    paymentMethod: 'card',
    paymentStatus: 'Paid',
    orderStatus: 'Shipped',
    notes: 'Please pack in special festive wooden gift box for wedding muhurtham',
    createdAt: new Date('2026-02-24T10:14:00Z').toISOString(),
    updatedAt: new Date('2026-02-25T08:30:00Z').toISOString()
  },
  {
    id: 'ord-1002',
    orderNumber: 'NLS-2026-7815',
    customerName: 'Sujatha Reddy',
    customerEmail: 'sujatha.reddy@hyderabad.in',
    customerPhone: '+91 99890 33441',
    shippingAddress: {
      fullName: 'Sujatha Reddy',
      email: 'sujatha.reddy@hyderabad.in',
      phone: '+91 99890 33441',
      addressLine1: 'Plot 18, Road No. 12, Banjara Hills',
      city: 'Hyderabad',
      state: 'Telangana',
      postalCode: '500034',
      country: 'India'
    },
    deliveryMethod: 'standard',
    deliveryFee: 0,
    items: [
      {
        productId: 'prod-saree-002',
        variantId: 'var-dvm-emerald',
        name: 'Dharmavaram Antique Brocade Bridal Pattu Saree',
        category: 'Dharmavaram Pattu',
        colorName: 'Temple Emerald & Antique Zari',
        colorHex: '#12613B',
        sku: 'NLS-DVM-02-EMR',
        unitPrice: 16500,
        quantity: 1,
        subtotal: 16500,
        image: '/src/assets/images/saree_dharmavaram_emerald_1793221389681.jpg'
      },
      {
        productId: 'prod-saree-004',
        variantId: 'var-pch-haldi',
        name: 'Pochampally Double Ikkat Pure Silk Saree',
        category: 'Pochampally Ikkat',
        colorName: 'Haldi Turmeric & Rani Pink',
        colorHex: '#D28C1B',
        sku: 'NLS-PCH-04-HLD',
        unitPrice: 12800,
        quantity: 1,
        subtotal: 12800,
        image: '/src/assets/images/saree_pochampally_ikkat_1793221390799.jpg'
      }
    ],
    subtotal: 29300,
    discountAmount: 4395,
    couponCode: 'NAGALAKSHMI15',
    tax: 0,
    totalAmount: 24905,
    paymentMethod: 'card',
    paymentStatus: 'Paid',
    orderStatus: 'Processing',
    notes: 'Include Silk Mark physical tags and authentic handloom authenticity card',
    createdAt: new Date('2026-02-26T14:45:00Z').toISOString(),
    updatedAt: new Date('2026-02-26T14:45:00Z').toISOString()
  },
  {
    id: 'ord-1003',
    orderNumber: 'NLS-2026-7816',
    customerName: 'Meenakshi Iyer',
    customerEmail: 'meenakshi.iyer@bangalore.co',
    customerPhone: '+91 97412 88990',
    shippingAddress: {
      fullName: 'Meenakshi Iyer',
      email: 'meenakshi.iyer@bangalore.co',
      phone: '+91 97412 88990',
      addressLine1: 'Villa 14, Palm Meadows, Whitefield',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560066',
      country: 'India'
    },
    deliveryMethod: 'standard',
    deliveryFee: 0,
    items: [
      {
        productId: 'prod-saree-004',
        variantId: 'var-pch-haldi',
        name: 'Pochampally Double Ikkat Pure Silk Saree',
        category: 'Pochampally Ikkat',
        colorName: 'Haldi Turmeric & Rani Pink',
        colorHex: '#D28C1B',
        sku: 'NLS-PCH-04-HLD',
        unitPrice: 12800,
        quantity: 1,
        subtotal: 12800,
        image: '/src/assets/images/saree_pochampally_ikkat_1793221390799.jpg'
      }
    ],
    subtotal: 12800,
    discountAmount: 1280,
    couponCode: 'UTSAV10',
    tax: 0,
    totalAmount: 11520,
    paymentMethod: 'cod',
    paymentStatus: 'Pending',
    orderStatus: 'Confirmed',
    createdAt: new Date('2026-02-27T18:20:00Z').toISOString(),
    updatedAt: new Date('2026-02-27T18:20:00Z').toISOString()
  }
];

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDataDir();
    this.data = this.readDb();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private readDb(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Ensure valid schema
        if (parsed && Array.isArray(parsed.products) && parsed.products.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.error('Error reading db file, falling back to seed data:', err);
    }

    const initial: DatabaseSchema = {
      products: SEED_PRODUCTS,
      orders: SEED_ORDERS,
      coupons: SEED_COUPONS,
      admins: SEED_ADMINS,
      version: 2
    };
    this.writeDb(initial);
    return initial;
  }

  public resetToSareeSeed() {
    this.data = {
      products: SEED_PRODUCTS,
      orders: SEED_ORDERS,
      coupons: SEED_COUPONS,
      admins: SEED_ADMINS,
      version: 2
    };
    this.writeDb(this.data);
  }

  private writeDb(data: DatabaseSchema) {
    try {
      const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tempFile, DB_FILE);
    } catch (err) {
      console.error('Critical database write error:', err);
    }
  }

  // --- Products ---
  public getProducts(filters?: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    color?: string;
    inStockOnly?: boolean;
    search?: string;
    sort?: string;
    featuredOnly?: boolean;
  }): Product[] {
    let list = this.data.products.filter(p => p.isActive);

    if (filters?.featuredOnly) {
      list = list.filter(p => p.isFeatured);
    }

    if (filters?.category && filters.category !== 'All') {
      list = list.filter(p => p.category.toLowerCase() === filters.category!.toLowerCase());
    }

    if (filters?.minPrice !== undefined) {
      list = list.filter(p => (p.salePrice ?? p.basePrice) >= filters.minPrice!);
    }

    if (filters?.maxPrice !== undefined) {
      list = list.filter(p => (p.salePrice ?? p.basePrice) <= filters.maxPrice!);
    }

    if (filters?.color) {
      list = list.filter(p => 
        p.variants.some(v => v.colorName.toLowerCase().includes(filters.color!.toLowerCase()))
      );
    }

    if (filters?.inStockOnly) {
      list = list.filter(p => p.variants.some(v => v.stock > 0));
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.category.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q) ||
        p.variants.some(v => v.colorName.toLowerCase().includes(q) || v.sku.toLowerCase().includes(q))
      );
    }

    if (filters?.sort) {
      switch (filters.sort) {
        case 'price-asc':
          list.sort((a, b) => (a.salePrice ?? a.basePrice) - (b.salePrice ?? b.basePrice));
          break;
        case 'price-desc':
          list.sort((a, b) => (b.salePrice ?? b.basePrice) - (a.salePrice ?? a.basePrice));
          break;
        case 'rating':
          list.sort((a, b) => b.rating - a.rating);
          break;
        case 'newest':
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        default:
          list.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
          break;
      }
    }

    return list;
  }

  public getAllAdminProducts(): Product[] {
    return this.data.products;
  }

  public getProductByIdOrSlug(idOrSlug: string): Product | undefined {
    return this.data.products.find(p => p.id === idOrSlug || p.slug === idOrSlug);
  }

  public createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const id = `prod-saree-${Date.now()}`;
    const newProduct: Product = {
      ...productData,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.products.unshift(newProduct);
    this.writeDb(this.data);
    return newProduct;
  }

  public updateProduct(id: string, updates: Partial<Product>): Product | null {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx === -1) return null;

    this.data.products[idx] = {
      ...this.data.products[idx],
      ...updates,
      id,
      updatedAt: new Date().toISOString()
    };
    this.writeDb(this.data);
    return this.data.products[idx];
  }

  public deleteProduct(id: string): boolean {
    const initialLen = this.data.products.length;
    this.data.products = this.data.products.filter(p => p.id !== id);
    if (this.data.products.length !== initialLen) {
      this.writeDb(this.data);
      return true;
    }
    return false;
  }

  // --- Inventory & Stock ---
  public updateVariantStock(variantId: string, newStock: number): boolean {
    for (const product of this.data.products) {
      const v = product.variants.find(item => item.id === variantId);
      if (v) {
        v.stock = Math.max(0, newStock);
        product.updatedAt = new Date().toISOString();
        this.writeDb(this.data);
        return true;
      }
    }
    return false;
  }

  // --- Coupons ---
  public getCoupons(): Coupon[] {
    return this.data.coupons;
  }

  public getCouponByCode(code: string): Coupon | undefined {
    return this.data.coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase() && c.isActive);
  }

  public createCoupon(coupon: Coupon): Coupon {
    this.data.coupons.push(coupon);
    this.writeDb(this.data);
    return coupon;
  }

  public toggleCoupon(code: string): boolean {
    const c = this.data.coupons.find(item => item.code.toUpperCase() === code.toUpperCase());
    if (c) {
      c.isActive = !c.isActive;
      this.writeDb(this.data);
      return true;
    }
    return false;
  }

  // --- Orders ---
  public getOrders(filters?: { status?: string; search?: string }): Order[] {
    let list = [...this.data.orders];

    if (filters?.status && filters.status !== 'all') {
      list = list.filter(o => o.orderStatus.toLowerCase() === filters.status!.toLowerCase());
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(o => 
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q) ||
        o.customerPhone.includes(q)
      );
    }

    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  }

  public getOrderById(id: string): Order | undefined {
    return this.data.orders.find(o => o.id === id || o.orderNumber === id);
  }

  public findOrderByTracking(orderNumber: string, email: string): Order | undefined {
    const cleanNum = orderNumber.trim().toUpperCase();
    const cleanEmail = email.trim().toLowerCase();
    return this.data.orders.find(
      o => o.orderNumber.toUpperCase() === cleanNum && o.customerEmail.toLowerCase() === cleanEmail
    );
  }

  public createOrder(payload: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    shippingAddress: ShippingAddress;
    deliveryMethod: 'standard' | 'express';
    items: { productId: string; variantId: string; quantity: number }[];
    couponCode?: string;
    paymentMethod: 'cod' | 'card';
    cardDetails?: { cardNumber: string; expMonth: string; expYear: string; cvc: string };
    notes?: string;
  }): { success: boolean; order?: Order; error?: string } {
    const itemSnapshots: OrderItemSnapshot[] = [];
    let subtotal = 0;

    for (const reqItem of payload.items) {
      const product = this.data.products.find(p => p.id === reqItem.productId);
      if (!product) {
        return { success: false, error: `Saree not found in collection: ${reqItem.productId}` };
      }
      const variant = product.variants.find(v => v.id === reqItem.variantId);
      if (!variant) {
        return { success: false, error: `Color variant not found for ${product.name}` };
      }
      if (variant.stock < reqItem.quantity) {
        return {
          success: false,
          error: `Insufficient stock for ${product.name} (${variant.colorName}). Only ${variant.stock} left in loom collection.`
        };
      }

      const unitPrice = variant.priceOverride ?? product.salePrice ?? product.basePrice;
      const lineSubtotal = unitPrice * reqItem.quantity;
      subtotal += lineSubtotal;

      itemSnapshots.push({
        productId: product.id,
        variantId: variant.id,
        name: product.name,
        category: product.category,
        colorName: variant.colorName,
        colorHex: variant.colorHex,
        sku: variant.sku,
        unitPrice,
        quantity: reqItem.quantity,
        subtotal: lineSubtotal,
        image: variant.images[0] || ''
      });
    }

    let discountAmount = 0;
    if (payload.couponCode) {
      const coupon = this.getCouponByCode(payload.couponCode);
      if (coupon && subtotal >= coupon.minSpend) {
        if (coupon.discountType === 'percentage') {
          discountAmount = (subtotal * coupon.value) / 100;
        } else {
          discountAmount = Math.min(coupon.value, subtotal);
        }
      }
    }

    // Complimentary delivery above ₹5000, express ₹250
    const deliveryFee = payload.deliveryMethod === 'express' ? 250 : (subtotal >= 5000 ? 0 : 150);
    const tax = 0; // GST included in display price
    const totalAmount = Math.max(0, subtotal - discountAmount + deliveryFee + tax);

    let paymentStatus: PaymentStatus = 'Pending';
    let orderStatus: OrderStatus = 'Pending';

    if (payload.paymentMethod === 'card') {
      if (!payload.cardDetails?.cardNumber || payload.cardDetails.cardNumber.replace(/\s+/g, '').length < 15) {
        return { success: false, error: 'Invalid card details provided for payment gateway authorization.' };
      }
      paymentStatus = 'Paid';
      orderStatus = 'Confirmed';
    } else {
      paymentStatus = 'Pending';
      orderStatus = 'Confirmed';
    }

    // Deduct inventory atomically
    for (const snap of itemSnapshots) {
      const product = this.data.products.find(p => p.id === snap.productId)!;
      const variant = product.variants.find(v => v.id === snap.variantId)!;
      variant.stock -= snap.quantity;
      product.updatedAt = new Date().toISOString();
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `NLS-2026-${randomSuffix}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customerName: payload.customerName,
      customerEmail: payload.customerEmail,
      customerPhone: payload.customerPhone,
      shippingAddress: payload.shippingAddress,
      deliveryMethod: payload.deliveryMethod,
      deliveryFee,
      items: itemSnapshots,
      subtotal,
      discountAmount,
      couponCode: payload.couponCode,
      tax,
      totalAmount,
      paymentMethod: payload.paymentMethod,
      paymentStatus,
      orderStatus,
      notes: payload.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data.orders.unshift(newOrder);
    this.writeDb(this.data);

    return { success: true, order: newOrder };
  }

  public updateOrderStatus(orderId: string, newStatus: OrderStatus): Order | null {
    const order = this.data.orders.find(o => o.id === orderId);
    if (!order) return null;

    const previousStatus = order.orderStatus;
    order.orderStatus = newStatus;
    order.updatedAt = new Date().toISOString();

    if (newStatus === 'Cancelled' && previousStatus !== 'Cancelled') {
      for (const item of order.items) {
        for (const product of this.data.products) {
          const v = product.variants.find(varItem => varItem.id === item.variantId);
          if (v) {
            v.stock += item.quantity;
            product.updatedAt = new Date().toISOString();
          }
        }
      }
    }

    this.writeDb(this.data);
    return order;
  }

  public updatePaymentStatus(orderId: string, newStatus: PaymentStatus): Order | null {
    const order = this.data.orders.find(o => o.id === orderId);
    if (!order) return null;

    order.paymentStatus = newStatus;
    if (newStatus === 'Paid' && order.orderStatus === 'Pending') {
      order.orderStatus = 'Confirmed';
    }
    order.updatedAt = new Date().toISOString();
    this.writeDb(this.data);
    return order;
  }

  public verifyAdminCredentials(email: string, passwordPlain: string): AdminUser | null {
    const admin = this.data.admins.find(a => a.email.toLowerCase() === email.trim().toLowerCase());
    if (!admin) return null;

    const computed = hashPassword(passwordPlain, admin.salt);
    if (computed === admin.passwordHash) {
      return {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      };
    }
    return null;
  }

  public getAdminStats(): AdminStats {
    let totalRevenue = 0;
    let pendingOrders = 0;

    for (const order of this.data.orders) {
      if (order.orderStatus !== 'Cancelled') {
        totalRevenue += order.totalAmount;
      }
      if (order.orderStatus === 'Pending') {
        pendingOrders += 1;
      }
    }

    let lowStockCount = 0;
    for (const product of this.data.products) {
      for (const variant of product.variants) {
        if (variant.stock <= 5) {
          lowStockCount += 1;
        }
      }
    }

    const revenueByDay: { [dateStr: string]: number } = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const str = d.toISOString().split('T')[0];
      revenueByDay[str] = 0;
    }

    for (const order of this.data.orders) {
      if (order.orderStatus !== 'Cancelled') {
        const orderDay = order.createdAt.split('T')[0];
        if (revenueByDay[orderDay] !== undefined) {
          revenueByDay[orderDay] += order.totalAmount;
        }
      }
    }

    const categoryMap: { [cat: string]: number } = {};
    for (const order of this.data.orders) {
      for (const item of order.items) {
        categoryMap[item.category] = (categoryMap[item.category] || 0) + item.quantity;
      }
    }

    return {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalOrders: this.data.orders.length,
      pendingOrders,
      lowStockCount,
      totalProducts: this.data.products.length,
      revenueByDay: Object.entries(revenueByDay).map(([date, amount]) => ({
        date,
        amount: Math.round(amount * 100) / 100
      })),
      popularCategories: Object.entries(categoryMap).map(([category, orderCount]) => ({
        category,
        orderCount
      }))
    };
  }
}

export const db = new Database();
// Ensure database is initialized with handloom saree data
if (db.getAllAdminProducts().length === 0 || !db.getAllAdminProducts()[0]?.name.includes('Saree')) {
  db.resetToSareeSeed();
}
