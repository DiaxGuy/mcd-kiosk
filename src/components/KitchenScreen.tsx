import React, { useState, useEffect } from 'react';
import {
  ChefHat,
  Lock,
  Delete,
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
      setTime(new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }));
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

  // PIN LOCK SCREEN (Clean White McDonald's EOTF Style)
  if (!unlocked) {
    return (
      <div className="w-screen h-screen bg-[#FAFAFA] text-[#292929] flex items-center justify-center p-6 select-none">
        <div className="w-full max-w-sm bg-white border border-[#D4D4D4] rounded-xl p-8 text-center space-y-6">
          <div className="flex flex-col items-center space-y-2.5">
            <OfficialLogo className="w-12 h-11" />
            <div>
              <h1 className="text-xl font-extrabold text-[#111]">Panel Kuchni</h1>
              <p className="text-xs text-[#6B7280] font-semibold mt-0.5">
                Wpisz 4-cyfrowy kod PIN
              </p>
            </div>
          </div>

          {/* 4 Individual PIN Boxes */}
          <div className="flex items-center justify-center gap-2.5">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className={`w-12 h-14 rounded border-2 flex items-center justify-center font-black text-2xl ${
                  pinError
                    ? 'border-[#DB0007] bg-[#FEF2F2] text-[#DB0007]'
                    : idx < pinInput.length
                    ? 'border-[#FFBC0D] bg-[#FFFDF5] text-[#111]'
                    : 'border-[#D4D4D4] bg-white'
                }`}
              >
                {idx < pinInput.length ? '•' : ''}
              </div>
            ))}
          </div>

          {pinError && (
            <p className="text-xs font-bold text-[#DB0007]">Nieprawidłowy kod PIN</p>
          )}

          {/* Clean Flat Keypad */}
          <div className="grid grid-cols-3 gap-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
              <button
                key={d}
                onClick={() => handleDigit(d)}
                className="h-12 rounded border border-[#D4D4D4] bg-[#FAFAFA] hover:bg-[#FFFDF5] active:bg-[#FFBC0D] font-extrabold text-xl text-[#111] transition-colors"
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
              className="h-12 rounded border border-[#D4D4D4] bg-white hover:bg-[#F5F5F5] text-[#6B7280] font-bold text-xs"
            >
              Wyczyść
            </button>
            <button
              onClick={() => handleDigit('0')}
              className="h-12 rounded border border-[#D4D4D4] bg-[#FAFAFA] hover:bg-[#FFFDF5] active:bg-[#FFBC0D] font-extrabold text-xl text-[#111] transition-colors"
            >
              0
            </button>
            <button
              onClick={() => {
                sound.playTap();
                setPinInput((p) => p.slice(0, -1));
              }}
              className="h-12 rounded border border-[#D4D4D4] bg-white hover:bg-[#F5F5F5] text-[#111] flex items-center justify-center"
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
      return { label: 'Gotowe do odbioru', bar: 'bg-[#008837]', cls: 'bg-[#E6F4EA] text-[#008837] border-[#008837]/30' };
    }
    if (status === 'completed') {
      return { label: 'Wydane', bar: 'bg-[#9CA3AF]', cls: 'bg-[#F5F5F5] text-[#4A4A4A] border-[#D4D4D4]' };
    }
    return { label: 'W przygotowaniu', bar: 'bg-[#FFBC0D]', cls: 'bg-[#FFF8E1] text-[#8A5A00] border-[#FFBC0D]' };
  };

  return (
    <div className="w-screen h-screen bg-white text-[#292929] flex flex-col overflow-hidden select-none">
      {/* Top Bar */}
      <header className="h-16 px-6 bg-white border-b border-[#E5E5E5] flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3.5">
          <OfficialLogo className="w-10 h-9" />
          <div>
            <h1 className="text-xl font-extrabold text-[#111] leading-none">
              Kuchnia — Zamówienia
            </h1>
            <span className="text-[11px] text-[#6B7280] font-semibold">
              Kliknij zamówienie, aby zobaczyć szczegóły i zmienić status
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          {/* Flat Tabs */}
          <div className="flex items-center space-x-1.5">
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
                className={`px-3.5 py-1.5 rounded border text-xs transition-colors ${
                  statusFilter === tab.id
                    ? 'bg-[#FFFDF5] border-[#FFBC0D] border-b-2 text-[#111] font-extrabold'
                    : 'bg-white border-[#D4D4D4] text-[#4A4A4A] font-semibold hover:bg-[#FAFAFA]'
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
            className="w-9 h-9 rounded border border-[#D4D4D4] bg-white hover:bg-[#FAFAFA] text-[#292929] flex items-center justify-center"
            title="Odśwież"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#D4D4D4] bg-[#FAFAFA] text-xs font-extrabold text-[#111]">
            <Clock className="w-3.5 h-3.5 text-[#FFBC0D]" />
            <span>{time}</span>
          </div>

          <button
            onClick={() => {
              sound.playTap();
              setUnlocked(false);
              setPinInput('');
            }}
            className="px-3.5 py-1.5 rounded border border-[#D4D4D4] bg-white hover:bg-[#FEF2F2] text-[#DB0007] text-xs font-bold flex items-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Zablokuj</span>
          </button>
        </div>
      </header>

      {/* Orders Grid */}
      <div className="flex-1 overflow-y-auto p-6 bg-[#FAFAFA]">
        {filteredOrders.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-[#9CA3AF] space-y-2">
            <ChefHat className="w-10 h-10 opacity-40" />
            <p className="text-sm font-bold">Brak zamówień w tej kategorii</p>
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
                  className="bg-white border border-[#E5E5E5] hover:border-[#FFBC0D] rounded-lg overflow-hidden flex flex-col justify-between cursor-pointer transition-colors"
                >
                  <div className={`h-2 ${badge.bar}`} />

                  <div className="p-4 flex flex-col flex-1 justify-between space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-3xl font-black text-[#111] tracking-tight leading-none block">
                          #{order.orderNumber}
                        </span>
                        <span className="text-[11px] font-semibold text-[#6B7280] block mt-1">
                          {new Date(order.createdAt).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })} • {order.orderType === 'dine_in' ? 'Na miejscu' : 'Na wynos'}
                          {order.tableNumber ? ` • Stolik #${order.tableNumber}` : ''}
                        </span>
                      </div>

                      <span className={`px-2 py-0.5 rounded border text-[10px] font-extrabold ${badge.cls}`}>
                        {badge.label}
                      </span>
                    </div>

                    <div className="space-y-1 border-t border-[#F0F0F0] pt-2.5 text-xs">
                      {order.items.slice(0, 4).map((item, i) => (
                        <div key={i} className="font-bold text-[#292929] truncate">
                          {item.quantity}x {item.menuItem.name}
                          {item.mealSize !== 'single' ? ` (${item.mealSize === 'large' ? 'Powiększony' : 'Zestaw'})` : ''}
                        </div>
                      ))}
                      {order.items.length > 4 && (
                        <span className="text-[11px] text-[#6B7280] block">+ {order.items.length - 4} więcej</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#F0F0F0] text-xs">
                      <span className="text-[#6B7280] font-bold uppercase">
                        {order.paymentMethod === 'blik' ? 'BLIK' : 'Przy kasie'}
                      </span>
                      <span className="font-black text-[#111] text-sm">
                        {order.totalAmount.toFixed(2).replace('.', ',')} zł
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FULL ORDER DETAIL MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 select-none">
          <div className="w-full max-w-2xl bg-white border border-[#D4D4D4] rounded-xl overflow-hidden text-[#292929] flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-white border-b border-[#E5E5E5] flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="px-3.5 py-1.5 rounded bg-[#FFBC0D] text-[#111] font-black text-2xl">
                  #{selectedOrder.orderNumber}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-extrabold text-[#111]">Szczegóły zamówienia</h2>
                    <span className={`px-2 py-0.5 rounded border text-[11px] font-extrabold ${getStatusBadge(selectedOrder.kitchenStatus).cls}`}>
                      {getStatusBadge(selectedOrder.kitchenStatus).label}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B7280] font-semibold mt-0.5">
                    {new Date(selectedOrder.createdAt).toLocaleString('pl-PL')} • Kiosk {selectedOrder.kioskId} • {selectedOrder.receiptNumber}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  sound.playTap();
                  setSelectedOrder(null);
                }}
                className="w-9 h-9 rounded-md border border-[#D4D4D4] bg-white hover:bg-[#FAFAFA] text-[#4B5563] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 bg-white">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-[#FAFAFA] border border-[#E5E5E5]">
                  <span className="text-[#6B7280] block mb-1 flex items-center gap-1 font-semibold">
                    {selectedOrder.orderType === 'dine_in' ? <Utensils className="w-3.5 h-3.5" /> : <ShoppingBag className="w-3.5 h-3.5" />}
                    Typ
                  </span>
                  <strong className="font-extrabold text-sm text-[#111]">
                    {selectedOrder.orderType === 'dine_in' ? 'Na miejscu' : 'Na wynos'}
                  </strong>
                </div>

                <div className="p-3 rounded-lg bg-[#FAFAFA] border border-[#E5E5E5]">
                  <span className="text-[#6B7280] block mb-1 font-semibold">Odbiór</span>
                  <strong className="font-extrabold text-sm text-[#111]">
                    {selectedOrder.tableNumber ? `Stolik #${selectedOrder.tableNumber}` : 'Przy ladzie'}
                  </strong>
                </div>

                <div className="p-3 rounded-lg bg-[#FAFAFA] border border-[#E5E5E5]">
                  <span className="text-[#6B7280] block mb-1 flex items-center gap-1 font-semibold">
                    <CreditCard className="w-3.5 h-3.5" />
                    Płatność
                  </span>
                  <strong className="font-extrabold text-sm uppercase text-[#111]">
                    {selectedOrder.paymentMethod === 'blik' ? 'BLIK' : 'Przy kasie'}
                  </strong>
                </div>

                <div className="p-3 rounded-lg bg-[#FAFAFA] border border-[#E5E5E5]">
                  <span className="text-[#6B7280] block mb-1 flex items-center gap-1 font-semibold">
                    <Receipt className="w-3.5 h-3.5" />
                    Suma
                  </span>
                  <strong className="font-black text-sm text-[#008837]">
                    {selectedOrder.totalAmount.toFixed(2).replace('.', ',')} zł
                  </strong>
                </div>
              </div>

              {selectedOrder.appliedCoupon && (
                <div className="p-3 rounded-lg bg-[#E6F4EA] border border-[#008837]/30 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 font-bold text-[#008837]">
                    <Tag className="w-4 h-4" />
                    Kupon: {selectedOrder.appliedCoupon.code} ({selectedOrder.appliedCoupon.title})
                  </span>
                  <span className="font-black text-[#008837]">
                    -{selectedOrder.appliedCoupon.discountAmount.toFixed(2).replace('.', ',')} zł
                  </span>
                </div>
              )}

              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#6B7280]">
                  Pozycje do przygotowania ({selectedOrder.items.length})
                </h3>
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-[#FAFAFA] border border-[#E5E5E5] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-[#111]">
                        {item.quantity}x {item.menuItem.name}
                      </span>
                      <span className="font-black text-sm text-[#111]">
                        {item.totalPrice.toFixed(2).replace('.', ',')} zł
                      </span>
                    </div>

                    <div className="text-xs text-[#4A4A4A] space-y-1 pl-3 border-l-2 border-[#FFBC0D]">
                      {item.mealSize !== 'single' && (
                        <div>Rozmiar: <strong>{item.mealSize === 'large' ? 'McZestaw Powiększony' : 'McZestaw'}</strong></div>
                      )}
                      {item.selectedSide && <div>Dodatek: <strong>{item.selectedSide.name}</strong></div>}
                      {item.selectedDrink && <div>Napój: <strong>{item.selectedDrink.name}</strong></div>}
                      {item.customIngredients?.map((ci) => (
                        <div key={ci.id} className={ci.type === 'remove' ? 'text-[#DB0007] font-bold' : 'text-[#008837] font-bold'}>
                          {ci.type === 'remove' ? 'Bez: ' : 'Dodatkowo: '} {ci.name}
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

            <div className="px-6 py-4 bg-[#FAFAFA] border-t border-[#E5E5E5] flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-[#6B7280] font-bold">Zmień status:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleStatusChange(selectedOrder.orderNumber, 'preparing')}
                  className={`px-4 py-2 rounded-md text-xs font-extrabold border transition-colors ${
                    selectedOrder.kitchenStatus === 'preparing'
                      ? 'bg-[#FFBC0D] border-[#FFBC0D] text-[#111]'
                      : 'bg-white border-[#D4D4D4] hover:bg-[#F5F5F5] text-[#292929]'
                  }`}
                >
                  W przygotowaniu
                </button>
                <button
                  onClick={() => handleStatusChange(selectedOrder.orderNumber, 'ready')}
                  className={`px-4 py-2 rounded-md text-xs font-extrabold border transition-colors ${
                    selectedOrder.kitchenStatus === 'ready'
                      ? 'bg-[#008837] border-[#008837] text-white'
                      : 'bg-white border-[#008837] text-[#008837] hover:bg-[#E6F4EA]'
                  }`}
                >
                  Gotowe do odbioru
                </button>
                <button
                  onClick={() => handleStatusChange(selectedOrder.orderNumber, 'completed')}
                  className={`px-4 py-2 rounded-md text-xs font-extrabold border transition-colors ${
                    selectedOrder.kitchenStatus === 'completed'
                      ? 'bg-[#111] border-[#111] text-white'
                      : 'bg-white border-[#D4D4D4] hover:bg-[#F5F5F5] text-[#292929]'
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
