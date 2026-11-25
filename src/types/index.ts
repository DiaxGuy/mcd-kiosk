export type Language = 'pl' | 'en' | 'ua';
export type OrderType = 'dine_in' | 'take_away';
export type PaymentMethod = 'blik' | 'cashier';

export interface Category {
  id: string;
  name: string;
  nameEn: string;
  nameUa: string;
  icon: string;
  featured?: boolean;
  tag?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  kcal?: number;
  image: string;
  badge?: string | null;
  isCustomizable?: boolean;
  isBoxOrNuggets?: boolean;
  description?: string;
}

export interface MealSizeOption {
  id: 'single' | 'medium' | 'large';
  name: string;
  nameEn: string;
  desc: string;
  priceDelta: number;
}

export interface SideChoice {
  id: string;
  name: string;
  extraPrice: number;
  image?: string;
}

export interface DrinkChoice {
  id: string;
  name: string;
  extraPrice: number;
  image?: string;
}

export interface CustomIngredient {
  id: string;
  name: string;
  type: 'add' | 'remove';
  price: number;
}

export interface SauceChoice {
  id: string;
  name: string;
  price: number;
  image?: string;
}

export interface UpsellItem {
  id: string;
  name: string;
  price: number;
  image: string;
  desc: string;
}

export interface CartItem {
  cartId: string;
  menuItem: MenuItem;
  quantity: number;
  mealSize: 'single' | 'medium' | 'large';
  selectedSide?: SideChoice;
  selectedDrink?: DrinkChoice;
  customIngredients: CustomIngredient[];
  selectedSauces: { sauce: SauceChoice; quantity: number }[];
  unitPrice: number;
  totalPrice: number;
}

export interface AppliedCoupon {
  code: string;
  title: string;
  discountAmount: number;
  pointsEarned?: number;
}

export interface Order {
  orderNumber: string;
  orderType: OrderType;
  tableNumber?: string | null;
  kitchenStatus?: 'preparing' | 'ready' | 'completed';
  appliedCoupon?: AppliedCoupon | null;
  items: CartItem[];
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentIntentId?: string | null;
  paymentStatus: 'completed' | 'pending';
  kioskId: string;
  createdAt: string;
  receiptNumber: string;
}
