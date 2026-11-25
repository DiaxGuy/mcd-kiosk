import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, CheckCircle2, Clock, Volume2, Utensils } from 'lucide-react';
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
      setTime(new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  const preparingOrders = orders.filter((o) => (o.kitchenStatus || 'preparing') === 'preparing');
  const readyOrders = orders.filter((o) => o.kitchenStatus === 'ready');

  return (
    <div className="w-screen h-screen bg-[#111111] text-white flex flex-col overflow-hidden select-none">
      {/* Top Bar */}
      <header className="h-20 px-8 bg-[#1A1A1A] border-b border-white/10 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-4">
          <OfficialLogo className="w-12 h-11" />
          <div>
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
              <span>Status Zamówień</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-mcd-yellow text-black font-black uppercase">
                Na żywo
              </span>
            </h1>
            <p className="text-xs text-gray-400">Odbierz swoje zamówienie, gdy numer pojawi się po prawej stronie</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-mono font-bold">
            <Clock className="w-4 h-4 text-mcd-yellow" />
            <span>{time}</span>
          </div>

          <button
            onClick={() => {
              sound.playTap();
              onBackToKiosk();
            }}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Wróć do Kiosku</span>
          </button>
        </div>
      </header>

      {/* Main Split Board */}
      <div className="flex-1 grid grid-cols-2 divide-x divide-white/10 overflow-hidden">
        {/* Left: W przygotowaniu */}
        <div className="flex flex-col p-8 bg-[#141414]">
          <div className="flex items-center justify-between pb-5 border-b border-white/10 mb-6">
            <h2 className="text-3xl font-black uppercase tracking-wider text-gray-200">
              W przygotowaniu
            </h2>
            <span className="px-3.5 py-1 rounded-full bg-white/10 text-sm font-black">
              {preparingOrders.length}
            </span>
          </div>

          {preparingOrders.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-500 font-bold text-lg">
              Brak zamówień w przygotowaniu
            </div>
          ) : (
            <div className="grid grid-cols-3 lg:grid-cols-4 gap-4 content-start overflow-y-auto">
              {preparingOrders.map((order) => (
                <div
                  key={order.orderNumber}
                  className="p-5 rounded-2xl bg-[#1F1F1F] border border-white/10 text-center"
                >
                  <span className="text-5xl font-black tracking-tight text-white block">
                    {order.orderNumber}
                  </span>
                  {order.tableNumber && (
                    <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-mcd-yellow/20 text-mcd-yellow">
                      <Utensils className="w-3 h-3" /> Stolik {order.tableNumber}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Gotowe do odbioru */}
        <div className="flex flex-col p-8 bg-[#0D1A12]">
          <div className="flex items-center justify-between pb-5 border-b border-emerald-500/20 mb-6">
            <h2 className="text-3xl font-black uppercase tracking-wider text-mcd-yellow flex items-center gap-3">
              <span>Gotowe do odbioru</span>
              <Volume2 className="w-7 h-7 text-emerald-400" />
            </h2>
            <span className="px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-sm font-black">
              {readyOrders.length}
            </span>
          </div>

          {readyOrders.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-emerald-800 font-bold text-lg">
              Oczekiwanie na gotowe zamówienia...
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 content-start overflow-y-auto">
              {readyOrders.map((order) => (
                <div
                  key={order.orderNumber}
                  className="p-6 rounded-3xl bg-emerald-600 text-white text-center shadow-xl border-2 border-emerald-400 animate-fadeIn"
                >
                  <span className="text-6xl font-black tracking-tight block">
                    {order.orderNumber}
                  </span>
                  {order.tableNumber ? (
                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-full bg-black/25 text-mcd-yellow">
                      <Utensils className="w-3.5 h-3.5" /> Obsługa stolika #{order.tableNumber}
                    </span>
                  ) : (
                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-emerald-100">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Zapraszamy do lady
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
