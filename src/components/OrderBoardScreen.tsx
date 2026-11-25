import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Utensils } from 'lucide-react';
import { Order } from '../types';
import { OfficialLogo } from './OfficialLogo';
import { sound } from '../utils/audio';

interface OrderBoardScreenProps {
  onBackToKiosk: () => void;
}

export const OrderBoardScreen: React.FC<OrderBoardScreenProps> = ({ onBackToKiosk }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [time, setTime] = useState('');
  const prevReadySet = useRef<Set<string>>(new Set());

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (!res.ok) return;
      const data = await res.json();
      const list: Order[] = data.orders || [];

      const currentReady = new Set(
        list.filter((o) => o.kitchenStatus === 'ready').map((o) => o.orderNumber)
      );
      let newlyReady = false;
      currentReady.forEach((num) => {
        if (!prevReadySet.current.has(num)) {
          newlyReady = true;
        }
      });
      if (newlyReady && prevReadySet.current.size > 0) {
        sound.playSuccess();
      }
      prevReadySet.current = currentReady;
      setOrders(list);
    } catch (err) {
      console.warn('OrderBoard fetch error:', err);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const updateClock = () => {
      setTime(new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }));
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  const preparingOrders = orders.filter((o) => (o.kitchenStatus || 'preparing') === 'preparing');
  const readyOrders = orders.filter((o) => o.kitchenStatus === 'ready');

  return (
    <div className="w-screen h-screen bg-white text-[#292929] flex flex-col overflow-hidden select-none">
      {/* Top Bar (Same Crisp White McDonald's Header) */}
      <header className="h-16 px-8 bg-white border-b border-[#E5E5E5] flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3.5">
          <OfficialLogo className="w-10 h-9" />
          <h1 className="text-xl font-extrabold text-[#111] tracking-tight">
            Status Zamówień
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <span className="px-3.5 py-1.5 rounded border border-[#D4D4D4] bg-[#FAFAFA] text-xs font-extrabold text-[#111]">
            {time}
          </span>

          <button
            onClick={() => {
              sound.playTap();
              onBackToKiosk();
            }}
            className="px-4 py-1.5 rounded border border-[#D4D4D4] bg-white hover:bg-[#FAFAFA] text-[#111] font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kiosk</span>
          </button>
        </div>
      </header>

      {/* Main Split Board */}
      <div className="flex-1 grid grid-cols-2 divide-x divide-[#E5E5E5] overflow-hidden">
        {/* Left: W przygotowaniu */}
        <div className="flex flex-col bg-white overflow-hidden">
          <div className="px-8 py-4 bg-[#FAFAFA] border-b border-[#E5E5E5] flex items-center justify-between">
            <h2 className="text-2xl font-black uppercase tracking-tight text-[#292929]">
              W przygotowaniu
            </h2>
            <span className="px-3 py-0.5 rounded bg-[#E5E5E5] text-[#111] text-sm font-black">
              {preparingOrders.length}
            </span>
          </div>

          <div className="flex-1 p-7 overflow-y-auto">
            {preparingOrders.length === 0 ? (
              <div className="h-full flex items-center justify-center text-[#9CA3AF] font-semibold text-base">
                Brak zamówień w przygotowaniu
              </div>
            ) : (
              <div className="grid grid-cols-3 lg:grid-cols-4 gap-4 content-start">
                {preparingOrders.map((order) => (
                  <div
                    key={order.orderNumber}
                    className="py-5 px-3 rounded-lg bg-white border border-[#E5E5E5] text-center"
                  >
                    <span className="text-5xl font-black tracking-tight text-[#111] block leading-none">
                      {order.orderNumber}
                    </span>
                    {order.tableNumber && (
                      <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-[#6B7280]">
                        <Utensils className="w-3 h-3 text-[#FFBC0D]" /> Stolik {order.tableNumber}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Gotowe do odbioru */}
        <div className="flex flex-col bg-white overflow-hidden">
          <div className="px-8 py-4 bg-[#004F25] text-white border-b border-[#004F25] flex items-center justify-between">
            <h2 className="text-2xl font-black uppercase tracking-tight">
              Gotowe do odbioru
            </h2>
            <span className="px-3 py-0.5 rounded bg-[#FFBC0D] text-[#111] text-sm font-black">
              {readyOrders.length}
            </span>
          </div>

          <div className="flex-1 p-7 overflow-y-auto bg-[#F8FBF9]">
            {readyOrders.length === 0 ? (
              <div className="h-full flex items-center justify-center text-[#9CA3AF] font-semibold text-base">
                Oczekiwanie na gotowe zamówienia
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 content-start">
                {readyOrders.map((order) => (
                  <div
                    key={order.orderNumber}
                    className="rounded-lg bg-white border-2 border-[#008837] overflow-hidden text-center"
                  >
                    <div className="h-2 bg-[#008837]" />
                    <div className="py-5 px-3">
                      <span className="text-6xl font-black tracking-tight text-[#111] block leading-none">
                        {order.orderNumber}
                      </span>
                      <span className="mt-2 inline-block text-xs font-extrabold text-[#008837]">
                        {order.tableNumber ? `Stolik #${order.tableNumber}` : 'Zapraszamy do lady'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
