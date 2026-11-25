import React, { useState, useEffect } from 'react';
import { Printer, ArrowRight, Utensils, ShoppingBag, QrCode, Check } from 'lucide-react';
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
    <div className="w-screen h-screen bg-white text-[#292929] flex flex-col justify-between select-none overflow-hidden">
      {/* Top Bar */}
      <header className="h-16 px-8 border-b border-[#E5E5E5] flex items-center justify-between shrink-0 bg-white">
        <div className="flex items-center space-x-3">
          <OfficialLogo className="w-10 h-9" />
          <span className="text-lg font-extrabold text-[#111]">McDonald&apos;s</span>
        </div>

        <div className="px-4 py-1.5 rounded border border-[#D4D4D4] bg-[#FAFAFA] flex items-center gap-2 text-xs font-extrabold text-[#111]">
          {order.orderType === 'dine_in' ? (
            <>
              <Utensils className="w-4 h-4 text-[#FFBC0D]" />
              <span>{t.eatIn}</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4 text-[#FFBC0D]" />
              <span>{t.takeAway}</span>
            </>
          )}
        </div>
      </header>

      {/* Main Content: Crisp Order Number Ticket + Complete Clean Receipt */}
      <div className="flex-1 w-full max-w-6xl mx-auto px-8 py-6 grid grid-cols-1 md:grid-cols-12 gap-10 items-center overflow-hidden">
        {/* Left: Massive Order Number */}
        <div className="md:col-span-7 flex flex-col justify-center space-y-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#008837]">
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{t.thankYou}</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black text-[#111] tracking-tight">
              {t.yourOrderNumber}
            </h1>
          </div>

          {/* Official Flat Order Ticket Box */}
          <div className="w-full max-w-md border-2 border-[#E5E5E5] rounded-xl overflow-hidden bg-white">
            <div className="h-3 bg-[#FFBC0D]" />
            <div className="p-8 text-center">
              <span className="text-8xl lg:text-9xl font-black text-[#111] tracking-tight leading-none block">
                {order.orderNumber}
              </span>

              <div className="mt-5 pt-4 border-t border-[#F0F0F0] flex items-center justify-center gap-2 text-sm font-extrabold text-[#111]">
                {order.tableNumber ? (
                  <span>Dostawa do stolika #{order.tableNumber}</span>
                ) : order.orderType === 'take_away' ? (
                  <span>Odbiór przy ladzie (Na wynos)</span>
                ) : (
                  <span>Odbiór przy ladzie (Na miejscu)</span>
                )}
              </div>
            </div>
          </div>

          {/* Clean Instruction Lines */}
          <div className="space-y-2.5 max-w-md text-sm text-[#4A4A4A] font-semibold">
            <div className="flex items-center gap-3 py-2 border-b border-[#F0F0F0]">
              <Printer className="w-5 h-5 text-[#111] shrink-0" />
              <span>{t.takeReceipt}</span>
            </div>
            <div className="flex items-center gap-3 py-2">
              <Utensils className="w-5 h-5 text-[#111] shrink-0" />
              <span>Obserwuj swój numer na tablicy nad ladą odbioru.</span>
            </div>
          </div>
        </div>

        {/* Right: Complete Thermal Receipt (No clipping, clean printer top) */}
        <div className="md:col-span-5 flex flex-col items-center justify-center h-full overflow-hidden">
          <div className="w-full max-w-sm flex flex-col">
            {/* Thermal Printer Slot */}
            <div className="w-full h-3 bg-[#222222] rounded-t flex items-center justify-center">
              <div className="w-3/4 h-1 bg-black rounded-full" />
            </div>

            {/* Paper Receipt */}
            <div className="w-full bg-[#FAFAFA] text-[#111111] p-5 font-mono text-xs border-x border-b border-[#D4D4D4] max-h-[62vh] overflow-y-auto scrollbar-thin">
              <div className="text-center border-b border-dashed border-[#9CA3AF] pb-3 mb-3">
                <h3 className="font-black text-sm uppercase tracking-wider">McDonald&apos;s Polska</h3>
                <p className="text-[10px] text-[#555]">Restauracja #04 • Warszawa Centralna</p>
                <p className="text-[10px] text-[#555] mt-0.5">
                  {new Date(order.createdAt).toLocaleString('pl-PL')}
                </p>
                <div className="mt-2 inline-block bg-[#111] text-white px-3 py-1 font-black text-base rounded-sm">
                  NUMER {order.orderNumber}
                </div>
                {order.tableNumber && (
                  <p className="mt-1 font-black text-xs">STOLIK #{order.tableNumber}</p>
                )}
              </div>

              {/* Items */}
              <div className="space-y-2 border-b border-dashed border-[#9CA3AF] pb-3 mb-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex justify-between font-bold">
                      <span>{item.quantity}x {item.menuItem.name}</span>
                      <span>{item.totalPrice.toFixed(2).replace('.', ',')} zł</span>
                    </div>
                    {item.mealSize !== 'single' && (
                      <div className="text-[10px] text-[#555] pl-3">
                        {item.mealSize === 'large' ? 'McZestaw Powiększony' : 'McZestaw'}
                      </div>
                    )}
                    {item.selectedSide && (
                      <div className="text-[10px] text-[#555] pl-3">{item.selectedSide.name}</div>
                    )}
                    {item.selectedDrink && (
                      <div className="text-[10px] text-[#555] pl-3">{item.selectedDrink.name}</div>
                    )}
                    {item.customIngredients.map((ci) => (
                      <div key={ci.id} className="text-[10px] text-[#555] pl-3">
                        {ci.type === 'remove' ? 'Bez: ' : '+ '} {ci.name}
                      </div>
                    ))}
                    {item.selectedSauces.map(({ sauce, quantity }) => (
                      <div key={sauce.id} className="text-[10px] text-[#555] pl-3">
                        {quantity}x {sauce.name}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="space-y-1 mb-3">
                <div className="flex justify-between text-sm font-black">
                  <span>SUMA PLN:</span>
                  <span>{order.totalAmount.toFixed(2).replace('.', ',')} zł</span>
                </div>
                <div className="flex justify-between text-[10px] text-[#555]">
                  <span>Płatność:</span>
                  <span className="font-bold uppercase">
                    {order.paymentMethod === 'blik' ? 'BLIK' : 'PRZY KASIE'}
                  </span>
                </div>
                <div className="text-[9px] text-[#6B7280] pt-1">
                  Paragon: {order.receiptNumber}
                </div>
              </div>

              <div className="text-center pt-2 border-t border-dashed border-[#9CA3AF] space-y-1.5">
                <div className="flex justify-center">
                  <QrCode className="w-12 h-12 text-[#111]" />
                </div>
                <p className="text-[9px] text-[#6B7280]">Dziękujemy i zapraszamy ponownie</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer Bar */}
      <footer className="h-16 px-8 border-t border-[#E5E5E5] flex items-center justify-between shrink-0 bg-white">
        <span className="text-xs font-semibold text-[#6B7280]">
          {t.autoReturn}: <strong className="text-[#111] font-black">{countdown} s</strong>
        </span>

        <button
          onClick={() => {
            sound.playTap();
            onFinish();
          }}
          className="px-7 py-2.5 rounded-md bg-[#FFBC0D] hover:bg-[#F5B300] text-[#111] font-extrabold text-sm flex items-center gap-2 transition-colors"
        >
          <span>{t.finishNow}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </footer>
    </div>
  );
};
