import React, { useState, useEffect } from 'react';
import {
  ChefHat,
  Lock,
  Delete,
  CheckCircle2,
  Clock,
  Utensils,
  ShoppingBag,
  X,
  RefreshCw,
  CreditCard,
  Tag,
  Receipt,
} from 'lucide-react';
import { Order } from '../types';
import { OfficialLogo } from './OfficialLogo';
import { sound } from '../utils/audio';

const KITCHEN_PIN = '3452';

export const KitchenScreen: React.FC = () => {
  const [unlocked, setUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'preparing' | 'ready' | 'completed'>('all');
  const [time, setTime] = useState('');

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (!res.ok) return;
      const data = await res.json();
      const list: Order[] = data.orders || [];
      setOrders(list);
      if (selectedOrder) {
        const updated = list.find((o) => o.orderNumber === selectedOrder.orderNumber);
        if (updated) setSelectedOrder(updated);
      }
    } catch (err) {
      console.warn('Kitchen fetch orders error:', err);
    }
  };

  useEffect(() => {
    if (!unlocked) return;
    fetchOrders();
    const interval = setInterval(fetchOrders, 2500);
    return () => clearInterval(interval);
  }, [unlocked]);

  useEffect(() => {
    const updateClock = () => {
      setTime(new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleDigit = (digit: string) => {
    sound.playTap();
    setPinError(false);
    if (pinInput.length < 4) {
      const next = pinInput + digit;
      setPinInput(next);
      if (next.length === 4) {
        if (next === KITCHEN_PIN) {
          sound.playSuccess();
          setUnlocked(true);
        } else {
          setPinError(true);
          setTimeout(() => setPinInput(''), 500);
        }
      }
    }
  };

  const handleStatusChange = async (orderNumber: string, kitchenStatus: 'preparing' | 'ready' | 'completed') => {
    sound.playTap();
    if (kitchenStatus === 'ready') sound.playSuccess();
    try {
      const res = await fetch(`/api/orders/${orderNumber}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kitchenStatus }),
      });
      if (res.ok) {
        const updated: Order = await res.json();
        setOrders((prev) => prev.map((o) => (o.orderNumber === orderNumber ? updated : o)));
        if (selectedOrder?.orderNumber === orderNumber) {
          setSelectedOrder(updated);
        }
      }
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  // PIN LOCK SCREEN
  if (!unlocked) {
    return (
      <div className="w-screen h-screen bg-[#111111] text-white flex items-center justify-center p-6 select-none">
        <div className="w-full max-w-sm bg-[#1A1A1A] border border-white/10 rounded-3xl p-8 shadow-2xl text-center space-y-6">
          <div className="flex flex-col items-center space-y-3">
            <OfficialLogo className="w-14 h-12" />
            <div className="w-12 h-12 rounded-2xl bg-mcd-yellow/15 text-mcd-yellow flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight">Panel Kuchni (KDS)</h1>
              <p className="text-xs text-gray-400 mt-1">Wpisz 4-cyfrowy kod PIN, aby uzyskać dostęp</p>
            </div>
          </div>

          {/* PIN Dots */}
          <div className="flex items-center justify-center gap-4 py-2">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full transition-all ${
                  pinError
                    ? 'bg-mcd-red scale-110'
                    : idx < pinInput.length
                    ? 'bg-mcd-yellow scale-110'
                    : 'bg-white/15'
                }`}
              />
            ))}
          </div>

          {pinError && (
            <p className="text-xs font-bold text-mcd-red">Nieprawidłowy kod PIN</p>
          )}

          {/* Numeric Keypad */}
          <div className="grid grid-cols-3 gap-2.5">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
              <button
                key={d}
                onClick={() => handleDigit(d)}
                className="h-14 rounded-2xl bg-white/5 hover:bg-mcd-yellow hover:text-black font-black text-xl transition-all active:scale-95 border border-white/10"
              >
                {d}
              </button>
            ))}
            <button
              onClick={() => {
                sound.playTap();
                setPinInput('');
                setPinError(false);
              }}
              className="h-14 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs"
            >
              WYCZYŚĆ
            </button>
            <button
              onClick={() => handleDigit('0')}
              className="h-14 rounded-2xl bg-white/5 hover:bg-mcd-yellow hover:text-black font-black text-xl transition-all active:scale-95 border border-white/10"
            >
              0
            </button>
            <button
              onClick={() => {
                sound.playTap();
                setPinInput((p) => p.slice(0, -1));
              }}
              className="h-14 rounded-2xl bg-white/5 hover:bg-white/15 text-white flex items-center justify-center border border-white/10"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const filteredOrders = orders.filter((o) => {
    const st = o.kitchenStatus || 'preparing';
    return statusFilter === 'all' ? true : st === statusFilter;
  });

  const getStatusBadge = (status?: string) => {
    if (status === 'ready') {
      return { label: 'Gotowe do odbioru', cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
    }
    if (status === 'completed') {
      return { label: 'Wydane', cls: 'bg-white/10 text-gray-300 border-white/20' };
    }
    return { label: 'W przygotowaniu', cls: 'bg-mcd-yellow/20 text-mcd-yellow border-mcd-yellow/40' };
  };

  return (
    <div className="w-screen h-screen bg-[#111111] text-white flex flex-col overflow-hidden select-none">
      {/* Top Header */}
      <header className="h-20 px-8 bg-[#1A1A1A] border-b border-white/10 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-4">
          <OfficialLogo className="w-11 h-10" />
          <div>
            <h1 className="text-xl font-black flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-mcd-yellow" />
              <span>Kuchnia KDS — Zamówienia</span>
            </h1>
            <p className="text-xs text-gray-400">Kliknij dowolne zamówienie, aby zobaczyć pełne szczegóły i zmienić status</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Status Filter Pills */}
          <div className="flex items-center bg-black/40 p-1 rounded-xl border border-white/10 text-xs font-bold">
            {[
              { id: 'all', label: `Wszystkie (${orders.length})` },
              { id: 'preparing', label: 'W przygotowaniu' },
              { id: 'ready', label: 'Gotowe' },
              { id: 'completed', label: 'Wydane' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  sound.playTap();
                  setStatusFilter(tab.id as any);
                }}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  statusFilter === tab.id ? 'bg-mcd-yellow text-black font-black' : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              sound.playTap();
              fetchOrders();
            }}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-gray-300"
            title="Odśwież"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono font-bold">
            <Clock className="w-4 h-4 text-mcd-yellow" />
            <span>{time}</span>
          </div>

          <button
            onClick={() => {
              sound.playTap();
              setUnlocked(false);
              setPinInput('');
            }}
            className="px-3.5 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 text-xs font-bold flex items-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Zablokuj</span>
          </button>
        </div>
      </header>

      {/* Orders Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredOrders.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-2">
            <ChefHat className="w-12 h-12 opacity-40" />
            <p className="text-base font-bold">Brak zamówień w tej kategorii</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredOrders.map((order) => {
              const badge = getStatusBadge(order.kitchenStatus);
              return (
                <div
                  key={order.orderNumber + order.createdAt}
                  onClick={() => {
                    sound.playTap();
                    setSelectedOrder(order);
                  }}
                  className="bg-[#1A1A1A] hover:bg-[#222222] border border-white/10 hover:border-mcd-yellow rounded-2xl p-5 flex flex-col justify-between cursor-pointer transition-all space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-4xl font-black text-white tracking-tight">
                        #{order.orderNumber}
                      </span>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                        <span>{new Date(order.createdAt).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}</span>
                        <span>•</span>
                        <span>{order.orderType === 'dine_in' ? 'Na miejscu' : 'Na wynos'}</span>
                        {order.tableNumber && (
                          <span className="px-1.5 py-0.5 rounded bg-mcd-yellow/20 text-mcd-yellow font-bold">
                            Stolik #{order.tableNumber}
                          </span>
                        )}
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-black border ${badge.cls}`}>
                      {badge.label}
                    </span>
                  </div>

                  {/* Items Preview */}
                  <div className="space-y-1.5 border-t border-white/10 pt-3 text-xs">
                    {order.items.slice(0, 4).map((item, i) => (
                      <div key={i} className="flex justify-between text-gray-200 font-semibold">
                        <span className="truncate pr-2">
                          {item.quantity}x {item.menuItem.name}
                          {item.mealSize !== 'single' ? ` (${item.mealSize === 'large' ? 'Powiększony' : 'Zestaw'})` : ''}
                        </span>
                      </div>
                    ))}
                    {order.items.length > 4 && (
                      <span className="text-[11px] text-gray-400 block">+ {order.items.length - 4} więcej pozycji...</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                    <span className="text-gray-400 font-bold uppercase">
                      {order.paymentMethod === 'blik' ? 'BLIK' : 'Przy kasie'}
                    </span>
                    <span className="font-black text-mcd-yellow text-sm">
                      {order.totalAmount.toFixed(2).replace('.', ',')} zł
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FULL ORDER DETAIL MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl bg-[#1A1A1A] border border-white/15 rounded-3xl shadow-2xl overflow-hidden text-white flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 bg-[#222222] border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="px-4 py-2 rounded-2xl bg-mcd-yellow text-black font-black text-3xl">
                  #{selectedOrder.orderNumber}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black">Szczegóły zamówienia</h2>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${getStatusBadge(selectedOrder.kitchenStatus).cls}`}>
                      {getStatusBadge(selectedOrder.kitchenStatus).label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(selectedOrder.createdAt).toLocaleString('pl-PL')} • Kiosk {selectedOrder.kioskId} • {selectedOrder.receiptNumber}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  sound.playTap();
                  setSelectedOrder(null);
                }}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-mcd-red text-white flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metadata Grid */}
            <div className="p-6 overflow-y-auto space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-gray-400 block mb-1 flex items-center gap-1">
                    {selectedOrder.orderType === 'dine_in' ? <Utensils className="w-3.5 h-3.5 text-mcd-yellow" /> : <ShoppingBag className="w-3.5 h-3.5 text-mcd-yellow" />}
                    Typ zamówienia
                  </span>
                  <strong className="font-black text-sm">
                    {selectedOrder.orderType === 'dine_in' ? 'Na miejscu' : 'Na wynos'}
                  </strong>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-gray-400 block mb-1">Gdzie odebrać</span>
                  <strong className="font-black text-sm text-mcd-yellow">
                    {selectedOrder.tableNumber ? `Stolik #${selectedOrder.tableNumber}` : 'Przy ladzie'}
                  </strong>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-gray-400 block mb-1 flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-mcd-yellow" />
                    Płatność
                  </span>
                  <strong className="font-black text-sm uppercase">
                    {selectedOrder.paymentMethod === 'blik' ? 'BLIK' : 'Przy kasie'}
                  </strong>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-gray-400 block mb-1 flex items-center gap-1">
                    <Receipt className="w-3.5 h-3.5 text-mcd-yellow" />
                    Suma
                  </span>
                  <strong className="font-black text-sm text-emerald-400">
                    {selectedOrder.totalAmount.toFixed(2).replace('.', ',')} zł
                  </strong>
                </div>
              </div>

              {selectedOrder.appliedCoupon && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 font-bold text-emerald-300">
                    <Tag className="w-4 h-4" />
                    Kupon: {selectedOrder.appliedCoupon.code} ({selectedOrder.appliedCoupon.title})
                  </span>
                  <span className="font-black text-emerald-300">
                    -{selectedOrder.appliedCoupon.discountAmount.toFixed(2).replace('.', ',')} zł
                  </span>
                </div>
              )}

              {/* Full Item Breakdown */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">
                  Pozycje do przygotowania ({selectedOrder.items.length})
                </h3>
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-base text-white">
                        {item.quantity}x {item.menuItem.name}
                      </span>
                      <span className="font-bold text-sm text-mcd-yellow">
                        {item.totalPrice.toFixed(2).replace('.', ',')} zł
                      </span>
                    </div>

                    <div className="text-xs text-gray-300 space-y-1 pl-3 border-l-2 border-mcd-yellow/50">
                      {item.mealSize !== 'single' && (
                        <div>Rozmiar: <strong>{item.mealSize === 'large' ? 'McZestaw Powiększony' : 'McZestaw'}</strong></div>
                      )}
                      {item.selectedSide && <div>Dodatek: <strong>{item.selectedSide.name}</strong></div>}
                      {item.selectedDrink && <div>Napój: <strong>{item.selectedDrink.name}</strong></div>}
                      {item.customIngredients?.map((ci) => (
                        <div key={ci.id} className={ci.type === 'remove' ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                          {ci.type === 'remove' ? '✖ BEZ: ' : '✚ EKSTRA: '} {ci.name}
                        </div>
                      ))}
                      {item.selectedSauces?.map(({ sauce, quantity }) => (
                        <div key={sauce.id}>Sos: <strong>{quantity}x {sauce.name}</strong></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons: Change Status */}
            <div className="p-6 bg-[#222222] border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-gray-400 font-bold">Zmień status zamówienia:</span>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => handleStatusChange(selectedOrder.orderNumber, 'preparing')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
                    selectedOrder.kitchenStatus === 'preparing'
                      ? 'bg-mcd-yellow text-black'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  W przygotowaniu
                </button>
                <button
                  onClick={() => handleStatusChange(selectedOrder.orderNumber, 'ready')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                    selectedOrder.kitchenStatus === 'ready'
                      ? 'bg-emerald-500 text-black'
                      : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Gotowe do odbioru</span>
                </button>
                <button
                  onClick={() => handleStatusChange(selectedOrder.orderNumber, 'completed')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
                    selectedOrder.kitchenStatus === 'completed'
                      ? 'bg-white text-black'
                      : 'bg-white/10 hover:bg-white/20 text-gray-300'
                  }`}
                >
                  Wydane
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
