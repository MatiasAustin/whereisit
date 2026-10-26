export type ProductCategory = 
  | 'Small Furniture' 
  | 'Desk Objects' 
  | 'Home & Decor' 
  | 'Character & Collectibles';

export type ProductBadge = 'popular' | 'profitably' | 'premium' | 'limited' | 'signature' | 'new';

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  price: number;
  compareAtPrice?: number;
  badge?: ProductBadge;
  description: string;
  shortDescription: string;
  materials: string;
  dimensions: string;
  weight: string;
  layerResolution: string;
  colorOptions: string[];
  images: string[];
  featured: boolean;
  stock: number;
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
  rating: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  selectedColor?: string;
  note?: string;
}

export interface CustomDesignInquiry {
  id: string;
  clientName: string;
  email: string;
  phone: string;
  projectType: 'Home Decor' | 'Small Furniture' | 'Desk Object' | 'Functional Hardware' | 'Other';
  dimensionConstraints?: string;
  estimatedBudget?: string;
  description: string;
  desiredTimeline?: string;
  status: 'NEW' | 'IN_REVIEW' | 'QUOTED' | 'IN_PRODUCTION' | 'COMPLETED';
  createdAt: string;
}

export interface CustomCharacterInquiry {
  id: string;
  clientName: string;
  email: string;
  phone: string;
  characterType: 'Self / Portrait' | 'Couple' | 'Pet' | 'Custom Mascot';
  style: 'Chibi Petite' | 'Minimalist Line' | 'Comic Stylized' | 'Mascot Costume';
  plaqueText?: string;
  photoUrl?: string;
  referenceNotes: string;
  status: 'NEW' | '3D_MODELING' | 'REVISION' | 'PRINTING' | 'SHIPPED';
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  selectedColor?: string;
  image: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    notes?: string;
  };
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  shippingCarrier: string;
  paymentMethod: string;
  paymentStatus: 'PENDING' | 'PAID' | 'VERIFIED';
  orderStatus: 'PENDING' | 'PROCESSING' | 'PRINTING' | 'SHIPPED' | 'DELIVERED';
  createdAt: string;
}
