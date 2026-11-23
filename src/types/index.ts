export type Language = 'pl' | 'en' | 'ua';
export type OrderType = 'dine_in' | 'take_away';
export type PaymentMethod = 'stripe' | 'cashier' | 'card' | 'blik';

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

export interface Order {
  orderNumber: string;
  orderType: OrderType;
  items: CartItem[];
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentIntentId?: string | null;
  paymentStatus: 'completed' | 'pending';
  kioskId: string;
  createdAt: string;
  receiptNumber: string;
}
