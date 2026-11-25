import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, Printer, ArrowRight, Utensils, ShoppingBag, QrCode } from 'lucide-react';
import { Order, Language } from '../types';
import { translations } from '../utils/translations';
import { sound } from '../utils/audio';
import { OfficialLogo } from './OfficialLogo';

interface OrderConfirmationScreenProps {
  order: Order;
  onFinish: () => void;
  language: Language;
}

export const OrderConfirmationScreen: React.FC<OrderConfirmationScreenProps> = ({
  order,
  onFinish,
  language,
}) => {
  const t = translations[language];
  const [countdown, setCountdown] = useState(15);

  useEffect(() => {
    sound.playSuccess();
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#FFBC0D', '#DB0007', '#008837', '#1F1F1F']
      });
    } catch {}

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-screen h-screen bg-[#F4F4F6] text-[#1F1F1F] flex flex-col justify-between p-8 select-none overflow-hidden animate-fadeIn">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-mcd-yellow/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="w-full max-w-6xl mx-auto flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          <OfficialLogo className="w-12 h-11" />
          <div>
            <h1 className="text-2xl font-black text-[#111]">McDonald's</h1>
            <span className="text-xs text-[#6B7280]">{order.kioskId} • {t.paymentApproved}</span>
          </div>
        </div>

        {/* Dining mode badge */}
        <div className="px-5 py-2 rounded-full bg-white border border-[#E5E7EB] shadow-sm flex items-center gap-2 text-sm font-black text-[#111]">
          {order.orderType === 'dine_in' ? (
            <>
              <Utensils className="w-4 h-4 text-mcd-yellow" />
              <span>{t.eatIn}</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4 text-mcd-yellow" />
              <span>{t.takeAway}</span>
            </>
          )}
        </div>
      </div>

      {/* Main Center Area: Huge Order Number + Animated Receipt */}
      <div className="flex-1 w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10 my-4 z-10 overflow-hidden">
        {/* Left Side: Massive Order Number & Instructions */}
        <div className="flex-1 flex flex-col justify-center space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-black uppercase tracking-widest text-mcd-red block">
              {t.thankYou}
            </span>
            <h2 className="text-xl lg:text-2xl font-bold text-[#4B5563]">
              {t.yourOrderNumber}
            </h2>
          </div>

          {/* Huge Order Number Card */}
          <div className="w-full max-w-md bg-white border-4 border-mcd-yellow rounded-3xl p-8 text-center shadow-xl relative overflow-hidden">
            <div className="text-7xl lg:text-9xl font-black text-[#111] tracking-tighter leading-none py-2 drop-shadow-sm">
              #{order.orderNumber}
            </div>
            <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-mcd-yellow text-black font-black text-sm">
              {order.tableNumber ? (
                <>
                  <Utensils className="w-4 h-4" />
                  <span>Gdzie odebrać: Dostawa do stolika #{order.tableNumber}</span>
                </>
              ) : order.orderType === 'take_away' ? (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Gdzie odebrać: Przy ladzie (Na wynos)</span>
                </>
              ) : (
                <>
                  <Utensils className="w-4 h-4" />
                  <span>Gdzie odebrać: Przy ladzie (Na miejscu)</span>
                </>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-[#F3F4F6] flex items-center justify-center gap-2 text-xs font-bold text-[#374151] uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Status: Przygotowywane w kuchni</span>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-3 max-w-md">
            <div className="flex items-start space-x-3 bg-white border border-[#E5E7EB] p-4 rounded-2xl shadow-sm">
              <Printer className="w-6 h-6 text-mcd-yellow shrink-0 mt-0.5" />
              <p className="text-sm text-[#4B5563] leading-snug">
                {t.takeReceipt}
              </p>
            </div>
            <div className="flex items-start space-x-3 bg-white border border-[#E5E7EB] p-4 rounded-2xl shadow-sm">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-sm text-[#4B5563] leading-snug">
                {t.watchScreen} Twój numer pojawi się na ekranie nad ladą.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Virtual Thermal Receipt sliding down */}
        <div className="w-80 lg:w-96 flex flex-col items-center">
          {/* Printer Slot Graphic */}
          <div className="w-full h-4 bg-[#262626] border-2 border-[#111] rounded-t-lg shadow-inner z-20 flex items-center justify-center">
            <div className="w-48 h-1 bg-black rounded-full" />
          </div>

          {/* Paper Receipt */}
          <div className="w-full bg-[#FFFFFF] text-[#111111] p-6 font-mono text-xs shadow-2xl rounded-b-lg border-x-2 border-b-2 border-[#D1D5DB] receipt-slide-in max-h-[500px] overflow-y-auto scrollbar-thin">
            {/* Receipt Header */}
            <div className="text-center border-b-2 border-dashed border-[#888] pb-3 mb-3">
              <h3 className="font-black text-sm uppercase tracking-wider text-black">McDonald's Polska</h3>
              <p className="text-[10px] text-[#555]">Spółka z o.o. • NIP 521-008-81-22</p>
              <p className="text-[10px] text-[#555]">Restauracja #04 • Warszawa Centralna</p>
              <p className="text-[10px] text-[#555] mt-1 font-bold">
                {new Date(order.createdAt).toLocaleString('pl-PL')}
              </p>
              <div className="mt-2 inline-block bg-black text-white px-3 py-1 font-black text-lg rounded">
                ZAMÓWIENIE #{order.orderNumber}
              </div>
              {order.tableNumber && (
                <div className="mt-1 font-black text-xs text-black">
                  OBSŁUGA STOLIKA: #{order.tableNumber}
                </div>
              )}
            </div>

            {/* Receipt Items List */}
            <div className="space-y-2 border-b-2 border-dashed border-[#888] pb-3 mb-3">
              {order.items.map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex justify-between font-bold text-black">
                    <span>
                      {item.quantity}x {item.menuItem.name}
                    </span>
                    <span>{item.totalPrice.toFixed(2).replace('.', ',')} zł</span>
                  </div>

                  {item.mealSize !== 'single' && (
                    <div className="text-[10px] text-[#555] pl-3">
                      • {item.mealSize === 'large' ? 'McZestaw Powiększony' : 'McZestaw'}
                    </div>
                  )}

                  {item.selectedSide && (
                    <div className="text-[10px] text-[#555] pl-3">• {item.selectedSide.name}</div>
                  )}

                  {item.selectedDrink && (
                    <div className="text-[10px] text-[#555] pl-3">• {item.selectedDrink.name}</div>
                  )}

                  {item.customIngredients.map((ci) => (
                    <div key={ci.id} className="text-[10px] text-[#444] pl-3">
                      • {ci.name}
                    </div>
                  ))}

                  {item.selectedSauces.map(({ sauce, quantity }) => (
                    <div key={sauce.id} className="text-[10px] text-[#444] pl-3">
                      • {quantity}x {sauce.name}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Receipt Summary */}
            <div className="space-y-1 mb-3">
              <div className="flex justify-between text-base font-black text-black">
                <span>SUMA PLN:</span>
                <span>{order.totalAmount.toFixed(2).replace('.', ',')} zł</span>
              </div>
              <div className="flex justify-between text-[10px] text-[#555]">
                <span>W tym PTU A (23%):</span>
                <span>{(order.totalAmount * 0.187).toFixed(2)} zł</span>
              </div>
              <div className="flex justify-between text-[10px] text-[#555]">
                <span>Płatność:</span>
                <span className="font-bold uppercase">
                  {order.paymentMethod === 'stripe'
                    ? 'KARTA STRIPE (ZATWIERDZONA)'
                    : order.paymentMethod === 'cashier'
                    ? 'PŁATNOŚĆ PRZY KASIE'
                    : order.paymentMethod}
                </span>
              </div>
              <div className="text-[9px] text-[#777] pt-1">
                Nr transakcji: {order.receiptNumber}
                {order.paymentIntentId && ` • Stripe: ${order.paymentIntentId.slice(0, 16)}...`}
              </div>
            </div>

            {/* Receipt Footer & QR code */}
            <div className="text-center pt-2 border-t-2 border-dashed border-[#888] space-y-2">
              <p className="text-[10px] font-bold">Zbieraj punkty w aplikacji McDonald's!</p>
              <div className="flex justify-center py-1">
                <div className="p-2 bg-white border border-[#999] rounded">
                  <QrCode className="w-16 h-16 text-black" />
                </div>
              </div>
              <p className="text-[9px] text-[#777]">*** DZIĘKUJEMY I ZAPRASZAMY PONOWNIE ***</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Auto-return timer & Finish Button */}
      <div className="w-full max-w-6xl mx-auto flex items-center justify-between border-t border-[#E5E7EB] pt-4 z-10 text-xs text-[#6B7280]">
        <div className="flex items-center gap-2">
          <span>{t.autoReturn}:</span>
          <span className="font-black text-[#111] text-sm">{countdown} s</span>
        </div>

        <button
          onClick={() => {
            sound.playTap();
            onFinish();
          }}
          className="px-8 py-3.5 rounded-2xl bg-mcd-yellow hover:bg-[#EAB308] text-black font-black text-sm flex items-center gap-2 shadow-sm transition-all transform active:scale-95"
        >
          <span>{t.finishNow}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
