import React, { useState, useEffect, useMemo } from 'react';
import {
  MenuItem,
  Category,
  MealSizeOption,
  SideChoice,
  DrinkChoice,
  CustomIngredient,
  SauceChoice,
  UpsellItem,
  CartItem,
  Order,
  Language,
  OrderType,
  PaymentMethod,
} from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ProductCard } from './components/ProductCard';
import { CartTray } from './components/CartTray';
import { CustomizationModal } from './components/CustomizationModal';
import { UpsellModal } from './components/UpsellModal';
import { PaymentModal } from './components/PaymentModal';
import { OrderConfirmationScreen } from './components/OrderConfirmationScreen';
import { AttractScreen } from './components/AttractScreen';
import { translations } from './utils/translations';
import { sound } from './utils/audio';
import { Search, Flame, Sparkles } from 'lucide-react';

export const App: React.FC = () => {
  // Navigation & View states
  const [view, setView] = useState<'attract' | 'menu' | 'confirmed'>('attract');
  const [orderType, setOrderType] = useState<OrderType>('dine_in');
  const [language, setLanguage] = useState<Language>('pl');
  const [selectedCategory, setSelectedCategory] = useState<string>('co-nowego');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Data
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [mealSizes, setMealSizes] = useState<MealSizeOption[]>([]);
  const [sides, setSides] = useState<SideChoice[]>([]);
  const [drinks, setDrinks] = useState<DrinkChoice[]>([]);
  const [ingredients, setIngredients] = useState<CustomIngredient[]>([]);
  const [sauces, setSauces] = useState<SauceChoice[]>([]);
  const [upsellItems, setUpsellItems] = useState<UpsellItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Cart & Modal states
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [showUpsell, setShowUpsell] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const t = translations[language];

  // Fetch menu from Express API
  useEffect(() => {
    fetch('/api/menu')
      .then((res) => res.json())
      .then((data) => {
        setCategories(data.categories || []);
        setMenuItems(data.items || []);
        setMealSizes(data.mealSizes || []);
        setSides(data.sides || []);
        setDrinks(data.drinks || []);
        setIngredients(data.ingredients || []);
        setSauces(data.sauces || []);
        setUpsellItems(data.upsellItems || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load menu from API:', err);
        setLoading(false);
      });
  }, []);

  // Filtered products for current view
  const filteredProducts = useMemo(() => {
    return menuItems.filter((item) => {
      // Category match
      const inCategory = selectedCategory === 'all' || item.category === selectedCategory;
      // Search query match
      const inSearch =
        !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

      return inCategory && inSearch;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  // Cart actions
  const handleAddToCart = (item: CartItem) => {
    setCart((prev) => [...prev, item]);
  };

  const handleUpdateQuantity = (cartId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.cartId === cartId) {
            const nextQty = item.quantity + delta;
            if (nextQty <= 0) return null;
            return {
              ...item,
              quantity: nextQty,
              totalPrice: item.unitPrice * nextQty,
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveFromCart = (cartId: string) => {
    sound.playTap();
    setCart((prev) => prev.filter((i) => i.cartId !== cartId));
  };

  const handleClearCart = () => {
    sound.playTap();
    setCart([]);
  };

  // Product Selection: open customization modal or direct add
  const handleProductSelect = (item: MenuItem) => {
    if (item.isCustomizable || item.isBoxOrNuggets) {
      setCustomizingItem(item);
    } else {
      sound.playAdd();
      const directCartItem: CartItem = {
        cartId: `${item.id}_${Date.now()}`,
        menuItem: item,
        quantity: 1,
        mealSize: 'single',
        customIngredients: [],
        selectedSauces: [],
        unitPrice: item.price,
        totalPrice: item.price,
      };
      setCart((prev) => [...prev, directCartItem]);
    }
  };

  // Checkout flow: Cart -> Upsell -> Payment Modal -> Server order -> Confirmation
  const handleStartCheckout = () => {
    sound.playTap();
    if (upsellItems.length > 0) {
      setShowUpsell(true);
    } else {
      setShowPayment(true);
    }
  };

  const handleUpsellSkip = () => {
    setShowUpsell(false);
    setShowPayment(true);
  };

  const handleUpsellAddAndProceed = (extraItems: CartItem[]) => {
    setCart((prev) => [...prev, ...extraItems]);
    setShowUpsell(false);
    setShowPayment(true);
  };

  const handlePaymentSuccess = async (paymentMethod: PaymentMethod) => {
    setShowPayment(false);

    const totalAmount = cart.reduce((sum, i) => sum + i.totalPrice, 0);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          orderType,
          paymentMethod,
          totalAmount,
        }),
      });

      if (response.ok) {
        const orderData: Order = await response.json();
        setCompletedOrder(orderData);
        setView('confirmed');
      } else {
        throw new Error('Server returned error on order creation');
      }
    } catch (err) {
      console.warn('API error, creating local fallback order:', err);
      // Fallback local order
      const fallbackOrder: Order = {
        orderNumber: String(Math.floor(10 + Math.random() * 89)),
        receiptNumber: 'PAR/' + Math.floor(100000 + Math.random() * 900000) + '/2026',
        orderType,
        items: cart,
        totalAmount,
        paymentMethod,
        paymentStatus: 'completed',
        kioskId: 'K-04',
        createdAt: new Date().toISOString(),
      };
      setCompletedOrder(fallbackOrder);
      setView('confirmed');
    }
  };

  const handleResetKiosk = () => {
    setCart([]);
    setCustomizingItem(null);
    setShowUpsell(false);
    setShowPayment(false);
    setCompletedOrder(null);
    setSearchQuery('');
    setSelectedCategory('co-nowego');
    setView('attract');
  };

  // 1. ATTRACT SCREEN (Idle)
  if (view === 'attract') {
    return (
      <AttractScreen
        onStart={(chosenOrderType) => {
          setOrderType(chosenOrderType);
          setView('menu');
        }}
        language={language}
        setLanguage={setLanguage}
      />
    );
  }

  // 2. ORDER CONFIRMATION SCREEN
  if (view === 'confirmed' && completedOrder) {
    return (
      <OrderConfirmationScreen
        order={completedOrder}
        onFinish={handleResetKiosk}
        language={language}
      />
    );
  }

  // Current category name
  const currentCategoryObj = categories.find((c) => c.id === selectedCategory);
  const currentCategoryTitle = currentCategoryObj
    ? language === 'en'
      ? currentCategoryObj.nameEn
      : language === 'ua'
      ? currentCategoryObj.nameUa
      : currentCategoryObj.name
    : 'Menu';

  // 3. MAIN HORIZONTAL KIOSK SCREEN
  return (
    <div className="w-screen h-screen bg-[#121212] text-white flex flex-col overflow-hidden select-none">
      {/* Top Header */}
      <Header
        orderType={orderType}
        setOrderType={setOrderType}
        language={language}
        setLanguage={setLanguage}
        onReset={handleResetKiosk}
        itemsCount={cart.reduce((s, i) => s + i.quantity, 0)}
      />

      {/* Main Body: Horizontal 3-Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Category Sidebar */}
        <Sidebar
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={(catId) => {
            setSelectedCategory(catId);
            setSearchQuery('');
          }}
          language={language}
        />

        {/* Center Column: Product Grid */}
        <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#121212]">
          {/* Subheader: Category Title & Quick Search */}
          <div className="h-16 px-6 border-b border-[#222222] flex items-center justify-between shrink-0 bg-[#161616]/60 backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <h2 className="text-xl lg:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                {currentCategoryTitle}
              </h2>
              <span className="text-xs font-bold text-[#8E8E8E] bg-[#222222] px-2.5 py-1 rounded-full border border-[#333333]">
                {filteredProducts.length} pozycji
              </span>
            </div>

            {/* Search Input Bar */}
            <div className="relative w-64 lg:w-80">
              <Search className="w-4 h-4 text-[#888] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Szukaj w menu..."
                className="w-full bg-[#202020] border border-[#333333] focus:border-mcd-yellow rounded-xl py-2 pl-10 pr-4 text-xs font-semibold text-white placeholder-[#737373] outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#888] hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-12 h-12 border-4 border-mcd-yellow border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm font-bold text-[#A0A0A0]">Ładowanie pysznego menu...</span>
                </div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-[#7E7E7E]">
                <p className="text-lg font-bold text-white mb-1">Brak wyników wyszukiwania</p>
                <p className="text-xs">Spróbuj wpisać inną frazę lub wybierz inną kategorię z lewego menu.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 pb-8">
                {filteredProducts.map((item) => (
                  <ProductCard
                    key={item.id}
                    item={item}
                    onSelect={handleProductSelect}
                    language={language}
                  />
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Right Column: Order Cart Tray */}
        <CartTray
          items={cart}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveFromCart}
          onClearCart={handleClearCart}
          onCheckout={handleStartCheckout}
          language={language}
        />
      </div>

      {/* MODALS */}
      {/* 1. Customization Modal */}
      {customizingItem && (
        <CustomizationModal
          item={customizingItem}
          mealSizes={mealSizes}
          availableSides={sides}
          availableDrinks={drinks}
          availableIngredients={ingredients}
          availableSauces={sauces}
          onClose={() => setCustomizingItem(null)}
          onAddToCart={handleAddToCart}
          language={language}
        />
      )}

      {/* 2. Upsell Modal */}
      {showUpsell && (
        <UpsellModal
          upsellItems={upsellItems}
          onSkip={handleUpsellSkip}
          onAddAndProceed={handleUpsellAddAndProceed}
          language={language}
        />
      )}

      {/* 3. Payment Modal */}
      {showPayment && (
        <PaymentModal
          totalAmount={cart.reduce((sum, item) => sum + item.totalPrice, 0)}
          onPaymentSuccess={handlePaymentSuccess}
          onCancel={() => setShowPayment(false)}
          language={language}
        />
      )}
    </div>
  );
};
