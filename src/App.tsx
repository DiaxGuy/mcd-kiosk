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
  AppliedCoupon,
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
import { AddedToOrderModal } from './components/AddedToOrderModal';
import { TableServiceModal } from './components/TableServiceModal';
import { CouponsModal } from './components/CouponsModal';
import { OrderBoardScreen } from './components/OrderBoardScreen';
import { InactivityModal } from './components/InactivityModal';
import { NutritionModal } from './components/NutritionModal';
import { KitchenScreen } from './components/KitchenScreen';
import { translations } from './utils/translations';
import { sound } from './utils/audio';
import { Search, Sparkles, QrCode, Smartphone, ShoppingBag, ArrowRight, RotateCcw, Accessibility } from 'lucide-react';

export const App: React.FC = () => {
  // Navigation & View states
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
  const initialView =
    pathname === '/kuchnia'
      ? 'kitchen'
      : pathname === '/ekran' || pathname === '/board'
      ? 'board'
      : 'attract';
  const [view, setView] = useState<'attract' | 'menu' | 'confirmed' | 'board' | 'kitchen'>(
    initialView
  );
  const [orderType, setOrderType] = useState<OrderType>('dine_in');
  const [language, setLanguage] = useState<Language>('pl');
  const [selectedCategory, setSelectedCategory] = useState<string>('co-nowego');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSubFilter, setActiveSubFilter] = useState<string>('all');

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
  const [editingCartItem, setEditingCartItem] = useState<CartItem | null>(null);
  const [nutritionItem, setNutritionItem] = useState<MenuItem | null>(null);
  const [showUpsell, setShowUpsell] = useState(false);
  const [showTableService, setShowTableService] = useState(false);
  const [tableNumber, setTableNumber] = useState<string | null>(null);
  const [showCoupons, setShowCoupons] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [lastAddedItem, setLastAddedItem] = useState<CartItem | null>(null);
  const [showAddedModal, setShowAddedModal] = useState(false);
  const [accessibleMode, setAccessibleMode] = useState(false);
  const [showInactivity, setShowInactivity] = useState(false);

  const t = translations[language];

  // Handle return from Stripe Checkout hosted page
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stripeStatus = params.get('stripe_status');
    const sessionId = params.get('session_id');

    if (!stripeStatus) return;

    // Clean URL query params
    window.history.replaceState({}, '', '/');

    if (stripeStatus === 'success' && sessionId) {
      fetch(`/api/checkout-session/${encodeURIComponent(sessionId)}`)
        .then(async (res) => {
          if (!res.ok) throw new Error('Failed to verify Stripe session');
          return res.json();
        })
        .then((orderData: Order) => {
          sessionStorage.removeItem('mcd_pending_checkout');
          setCart([]);
          setCompletedOrder(orderData);
          setView('confirmed');
        })
        .catch((err) => {
          console.error('Stripe return verification failed:', err);
        });
    } else if (stripeStatus === 'cancelled') {
      try {
        const saved = sessionStorage.getItem('mcd_pending_checkout');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed.cart) && parsed.cart.length > 0) {
            setCart(parsed.cart);
          }
          if (parsed.orderType) {
            setOrderType(parsed.orderType);
          }
          if (parsed.tableNumber) {
            setTableNumber(parsed.tableNumber);
          }
          if (parsed.appliedCoupon) {
            setAppliedCoupon(parsed.appliedCoupon);
          }
        }
      } catch (e) {
        console.warn('Could not restore pending cart:', e);
      }
      setView('menu');
      setShowPayment(true);
    }
  }, []);

  // Inactivity timeout: 45s without touch/pointer/keyboard while browsing menu
  useEffect(() => {
    if (view !== 'menu' || showPayment || showInactivity) return;

    let timer: ReturnType<typeof setTimeout>;
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        setShowInactivity(true);
      }, 45000);
    };

    resetTimer();
    const events = ['pointerdown', 'keydown', 'touchstart', 'scroll'];
    events.forEach((ev) => window.addEventListener(ev, resetTimer, { passive: true }));
    return () => {
      clearTimeout(timer);
      events.forEach((ev) => window.removeEventListener(ev, resetTimer));
    };
  }, [view, showPayment, showInactivity]);

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

  // Sub-filter tabs based on category (All, Burger, Chicken, Beef, Vege, etc.)
  const subFilters = useMemo(() => {
    if (selectedCategory === 'burgery' || selectedCategory === 'co-nowego') {
      return [
        { id: 'all', label: 'Wszystkie' },
        { id: 'drwal', label: 'Drwal' },
        { id: 'beef', label: 'Wołowina' },
        { id: 'chicken', label: 'Drób' },
        { id: 'vege', label: 'Wege' },
      ];
    }
    if (selectedCategory === 'kurczak') {
      return [
        { id: 'all', label: 'Wszystkie' },
        { id: 'nuggets', label: 'McNuggets' },
        { id: 'strips', label: 'McCrispy Strips' },
        { id: 'box', label: 'Chicken Box' },
      ];
    }
    if (selectedCategory === 'lody-i-desery') {
      return [
        { id: 'all', label: 'Wszystkie' },
        { id: 'mcflurry', label: 'McFlurry®' },
        { id: 'shake', label: 'Shake' },
        { id: 'ciastka', label: 'Ciastka i Muffiny' },
      ];
    }
    return [
      { id: 'all', label: 'Wszystkie' },
      { id: 'popular', label: 'Popularne' },
    ];
  }, [selectedCategory]);

  // Filtered products for current view
  const filteredProducts = useMemo(() => {
    return menuItems.filter((item) => {
      // Category match
      const inCategory = selectedCategory === 'all' || item.category === selectedCategory;

      // Sub-filter match
      let inSubFilter = true;
      if (activeSubFilter !== 'all') {
        const name = item.name.toLowerCase();
        if (activeSubFilter === 'drwal') inSubFilter = name.includes('drwal');
        else if (activeSubFilter === 'beef') inSubFilter = !name.includes('kurczak') && !name.includes('chikker') && !name.includes('veggie');
        else if (activeSubFilter === 'chicken') inSubFilter = name.includes('kurczak') || name.includes('chicken') || name.includes('chikker') || name.includes('crispy');
        else if (activeSubFilter === 'vege') inSubFilter = name.includes('veggie') || name.includes('wege');
        else if (activeSubFilter === 'nuggets') inSubFilter = name.includes('nuggets');
        else if (activeSubFilter === 'strips') inSubFilter = name.includes('strips');
        else if (activeSubFilter === 'box') inSubFilter = name.includes('box');
        else if (activeSubFilter === 'mcflurry') inSubFilter = name.includes('mcflurry');
        else if (activeSubFilter === 'shake') inSubFilter = name.includes('shake');
        else if (activeSubFilter === 'ciastka') inSubFilter = name.includes('ciastko') || name.includes('muffin') || name.includes('ciacho');
        else if (activeSubFilter === 'popular') inSubFilter = item.badge !== null;
      }

      // Search query match
      const inSearch =
        !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

      return inCategory && inSubFilter && inSearch;
    });
  }, [menuItems, selectedCategory, activeSubFilter, searchQuery]);

  // Cart actions
  const handleAddToCart = (item: CartItem) => {
    if (editingCartItem) {
      setCart((prev) => prev.map((c) => (c.cartId === item.cartId ? item : c)));
      setEditingCartItem(null);
    } else {
      setCart((prev) => [...prev, item]);
      setLastAddedItem(item);
      setShowAddedModal(true);
    }
  };

  const handleEditCartItem = (cartItem: CartItem) => {
    setEditingCartItem(cartItem);
    setCustomizingItem(cartItem.menuItem);
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
      setLastAddedItem(directCartItem);
      setShowAddedModal(true);
    }
  };

  const proceedAfterUpsell = () => {
    if (orderType === 'dine_in') {
      setShowTableService(true);
    } else {
      setTableNumber(null);
      setShowPayment(true);
    }
  };

  // Checkout flow: Cart -> Upsell -> Table Service (if dine_in) -> Payment Modal -> Server order -> Confirmation
  const handleStartCheckout = () => {
    sound.playTap();
    if (cart.length === 0) return;
    if (upsellItems.length > 0) {
      setShowUpsell(true);
    } else {
      proceedAfterUpsell();
    }
  };

  const handleUpsellSkip = () => {
    setShowUpsell(false);
    proceedAfterUpsell();
  };

  const handleUpsellAddAndProceed = (extraItems: CartItem[]) => {
    setCart((prev) => [...prev, ...extraItems]);
    setShowUpsell(false);
    proceedAfterUpsell();
  };

  const handlePaymentSuccess = async (paymentMethod: PaymentMethod, paymentIntentId?: string) => {
    setShowPayment(false);

    const rawTotal = cart.reduce((sum, i) => sum + i.totalPrice, 0);
    const discount = appliedCoupon ? Math.min(rawTotal, appliedCoupon.discountAmount) : 0;
    const totalAmount = Math.max(0, rawTotal - discount);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          orderType,
          tableNumber,
          appliedCoupon,
          paymentMethod,
          paymentIntentId,
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
      const fallbackOrder: Order = {
        orderNumber: String(Math.floor(10 + Math.random() * 89)),
        receiptNumber: 'PAR/' + Math.floor(100000 + Math.random() * 900000) + '/2026',
        orderType,
        tableNumber,
        appliedCoupon,
        items: cart,
        totalAmount,
        paymentMethod,
        paymentIntentId,
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
    setEditingCartItem(null);
    setNutritionItem(null);
    setShowUpsell(false);
    setShowTableService(false);
    setTableNumber(null);
    setShowCoupons(false);
    setAppliedCoupon(null);
    setShowPayment(false);
    setShowInactivity(false);
    setAccessibleMode(false);
    setCompletedOrder(null);
    setSearchQuery('');
    setSelectedCategory('co-nowego');
    setActiveSubFilter('all');
    if (window.location.pathname !== '/') {
      window.history.replaceState({}, '', '/');
    }
    setView('attract');
  };

  // 0a. KITCHEN KDS (/kuchnia - PIN protected, unreachable from regular UI)
  if (view === 'kitchen') {
    return <KitchenScreen />;
  }

  // 0b. ORDER STATUS BOARD (/ekran)
  if (view === 'board') {
    return (
      <OrderBoardScreen
        onBackToKiosk={() => {
          window.history.replaceState({}, '', '/');
          setView('attract');
        }}
      />
    );
  }

  // 1. ATTRACT SCREEN (Idle)
  if (view === 'attract') {
    return (
      <AttractScreen
        onStart={(chosenOrderType) => {
          setOrderType(chosenOrderType);
          setView('menu');
        }}
        onOpenBoard={() => {
          window.history.replaceState({}, '', '/ekran');
          setView('board');
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
    : 'Burgery i Zestawy';

  const rawCartTotalAmount = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const couponDiscount = appliedCoupon ? Math.min(rawCartTotalAmount, appliedCoupon.discountAmount) : 0;
  const cartTotalAmount = Math.max(0, rawCartTotalAmount - couponDiscount);
  const cartTotalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  // 3. MAIN HORIZONTAL KIOSK SCREEN (Supports Reachability Mode!)
  return (
    <div className={`w-screen h-screen flex flex-col overflow-hidden select-none transition-all duration-300 ${accessibleMode ? 'bg-[#111111]' : 'bg-[#F4F4F6]'}`}>
      {accessibleMode && (
        <div className="h-[34vh] flex flex-col items-center justify-center text-white px-6 text-center space-y-3 shrink-0">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-mcd-yellow text-black font-black text-xs uppercase">
            <Accessibility className="w-4 h-4" />
            <span>Tryb ułatwionego dostępu aktywny</span>
          </div>
          <p className="text-xs text-gray-400 max-w-md">
            Interfejs został obniżony do dolnej części ekranu, aby ułatwić obsługę.
          </p>
          <button
            onClick={() => {
              sound.playTap();
              setAccessibleMode(false);
            }}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20"
          >
            Przywróć pełny ekran
          </button>
        </div>
      )}

      <div className={`bg-[#F4F4F6] text-[#1F1F1F] flex flex-col overflow-hidden transition-all duration-300 ${accessibleMode ? 'h-[66vh] rounded-t-3xl border-t-4 border-mcd-yellow shadow-2xl' : 'w-full h-full'}`}>
      {/* Top Header */}
      <Header
        orderType={orderType}
        setOrderType={setOrderType}
        language={language}
        setLanguage={setLanguage}
        onReset={handleResetKiosk}
        currentCategoryTitle={currentCategoryTitle}
        accessibleMode={accessibleMode}
        onToggleAccessible={() => setAccessibleMode((v) => !v)}
      />

      {/* Main Body: Horizontal 3-Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Category Sidebar (as in photo) */}
        <Sidebar
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={(catId) => {
            setSelectedCategory(catId);
            setSearchQuery('');
            setActiveSubFilter('all');
          }}
          language={language}
        />

        {/* Center Column: Product Grid (Snow White EOTF Canvas) */}
        <main className="flex-1 flex flex-col h-full overflow-hidden bg-white">
          {/* Subheader: Category Sub-filters (Horizontal pills as in photo) & Search */}
          <div className="h-14 px-6 border-b border-[#E5E7EB] flex items-center justify-between shrink-0 bg-white">
            {/* Filter Pills (All, Burger, Chicken, Vege...) */}
            <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none py-1">
              {subFilters.map((pill) => {
                const isActive = activeSubFilter === pill.id;
                return (
                  <button
                    key={pill.id}
                    onClick={() => {
                      sound.playTap();
                      setActiveSubFilter(pill.id);
                    }}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                      isActive
                        ? 'bg-[#111111] text-white'
                        : 'bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB]'
                    }`}
                  >
                    {pill.label}
                  </button>
                );
              })}
            </div>

            {/* Search Input Bar */}
            <div className="relative w-60 lg:w-72">
              <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Szukaj w menu..."
                className="w-full bg-[#F3F4F6] border border-[#E5E7EB] focus:border-[#FFBC0D] rounded-full py-1.5 pl-10 pr-4 text-xs font-semibold text-[#111] placeholder-[#9CA3AF] outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#9CA3AF] hover:text-[#111]"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Product Cards Grid & Promo Banner */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin bg-white">
            {/* Top Promotional Banner (Flat clean official banner as on kiosk photo) */}
            <div className="mb-5 rounded-xl bg-[#F3F7FA] border border-[#E5E7EB] px-6 py-4 flex items-center justify-between relative overflow-hidden">
              <div className="space-y-1 z-10 max-w-md">
                <span className="text-[10px] font-black uppercase tracking-wider text-white bg-[#DB0007] px-2 py-0.5 rounded-sm inline-block">
                  Zima 2026
                </span>
                <h3 className="text-xl lg:text-2xl font-black text-[#111111] leading-tight">
                  Chrupiący, złocisty &amp; kultowy
                </h3>
                <p className="text-xs text-[#4B5563] font-semibold">
                  Dotknij, aby zamówić Burgera Drwala lub chrupiące McNuggets® z sosem
                </p>
              </div>

              <div className="h-20 lg:h-24 flex items-center gap-2 z-10 shrink-0">
                <img
                  src="https://cdn.mcdonalds.pl/uploads/20210609095435/347406-supreme-crispy-chicken-strips-i-chicken-box-na-www-1090x664px-3.png"
                  alt="McNuggets"
                  className="h-16 lg:h-20 object-contain hidden sm:block"
                />
                <img
                  src="https://cdn.mcdonalds.pl/uploads/20261104143818/pl10-p00001662-drwal-2026-na-www-1090x664px-burger-drwala-klasyczny.png"
                  alt="Promo Drwal"
                  className="h-full object-contain"
                />
              </div>
            </div>

            {loading ? (
              <div className="h-48 flex items-center justify-center">
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-10 h-10 border-4 border-mcd-yellow border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-bold text-[#6B7280]">Ładowanie pysznego menu...</span>
                </div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-center p-8 text-[#9CA3AF]">
                <p className="text-base font-bold text-[#374151] mb-1">Brak wyników</p>
                <p className="text-xs">Spróbuj wybrać inny filtr lub inną kategorię.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 pb-20">
                {filteredProducts.map((item) => (
                  <ProductCard
                    key={item.id}
                    item={item}
                    onSelect={handleProductSelect}
                    onShowNutrition={setNutritionItem}
                    language={language}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Official Bottom Bar (Matches the bottom bar on the photo!) */}
          <div className="h-20 bg-white border-t border-[#E5E7EB] px-6 flex items-center justify-between shrink-0 z-10">
            {/* Left: Yellow "MojeM" Login/Coupon Tile (as on photo) */}
            <button
              onClick={() => {
                sound.playTap();
                setShowCoupons(true);
              }}
              className="flex items-center space-x-3 bg-[#FFBC0D] hover:bg-[#F5B300] rounded-lg px-4 py-2.5 text-black cursor-pointer transition-colors active:scale-95"
            >
              <Smartphone className="w-6 h-6 shrink-0" />
              <div className="text-left leading-tight">
                <span className="text-[10px] font-black uppercase tracking-wider block">
                  {appliedCoupon ? `Kupon: ${appliedCoupon.code}` : 'MojeM'}
                </span>
                <span className="text-xs font-extrabold block">
                  {appliedCoupon ? `-${appliedCoupon.discountAmount.toFixed(2).replace('.', ',')} zł` : 'Zaloguj / Kupony'}
                </span>
              </div>
            </button>

            {/* Center: Takeaway Bag with Red Counter Badge + Total Amount (as on photo) */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <ShoppingBag className="w-7 h-7 text-[#92400E]" />
                {cartTotalQuantity > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#DB0007] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                    {cartTotalQuantity}
                  </span>
                )}
              </div>
              <span className="text-2xl font-black text-[#111111] tracking-tight">
                {cartTotalAmount.toFixed(2).replace('.', ',')} zł
              </span>
            </div>

            {/* Right: Start Over + Flat Yellow Checkout Button (as on photo) */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  sound.playTap();
                  handleClearCart();
                }}
                className="text-xs font-bold text-[#6B7280] hover:text-[#111] flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Zacznij od nowa</span>
              </button>

              <button
                onClick={handleStartCheckout}
                disabled={cart.length === 0}
                className={`px-8 py-3 rounded-lg font-black text-sm flex items-center gap-2 transition-colors ${
                  cart.length > 0
                    ? 'bg-[#FFBC0D] hover:bg-[#F5B300] text-[#111111] active:scale-98'
                    : 'bg-[#F3F4F6] text-[#9CA3AF] cursor-not-allowed'
                }`}
              >
                <span>{t.orderAndPay}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </main>

        {/* Right Column: Order Cart Tray */}
        <CartTray
          items={cart}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveFromCart}
          onEditItem={handleEditCartItem}
          onClearCart={handleClearCart}
          onCheckout={handleStartCheckout}
          appliedCoupon={appliedCoupon}
          onOpenCoupons={() => setShowCoupons(true)}
          language={language}
        />
      </div>
      </div>

      {/* MODALS */}
      {/* 1. Customization Modal */}
      {customizingItem && (
        <CustomizationModal
          item={customizingItem}
          editingCartItem={editingCartItem}
          mealSizes={mealSizes}
          availableSides={sides}
          availableDrinks={drinks}
          availableIngredients={ingredients}
          availableSauces={sauces}
          onClose={() => {
            setCustomizingItem(null);
            setEditingCartItem(null);
          }}
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

      {/* 2b. Table Service Modal (Dine-in table tent locator) */}
      {showTableService && (
        <TableServiceModal
          onSelectTable={(chosenTable) => {
            setTableNumber(chosenTable);
            setShowTableService(false);
            setShowPayment(true);
          }}
          onCancel={() => setShowTableService(false)}
        />
      )}

      {/* 3. Payment Modal */}
      {showPayment && (
        <PaymentModal
          totalAmount={cartTotalAmount}
          onPaymentSuccess={handlePaymentSuccess}
          onCancel={() => setShowPayment(false)}
          language={language}
        />
      )}

      {/* 4. Added to Order Modal (Torba z cyferką + Happy mascot) */}
      {showAddedModal && lastAddedItem && (
        <AddedToOrderModal
          lastAddedItem={lastAddedItem}
          totalCartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
          totalAmount={cartTotalAmount}
          onContinue={() => setShowAddedModal(false)}
          onCheckout={() => {
            setShowAddedModal(false);
            handleStartCheckout();
          }}
          language={language}
        />
      )}

      {/* 5. MojeM / Coupons Modal */}
      {showCoupons && (
        <CouponsModal
          cartTotal={rawCartTotalAmount}
          appliedCoupon={appliedCoupon}
          onApplyCoupon={setAppliedCoupon}
          onClose={() => setShowCoupons(false)}
        />
      )}

      {/* 6. Nutrition & Allergens Modal */}
      {nutritionItem && (
        <NutritionModal
          item={nutritionItem}
          onClose={() => setNutritionItem(null)}
        />
      )}

      {/* 7. Inactivity Timeout Modal */}
      {showInactivity && (
        <InactivityModal
          onContinue={() => setShowInactivity(false)}
          onTimeoutReset={handleResetKiosk}
        />
      )}
    </div>
  );
};
