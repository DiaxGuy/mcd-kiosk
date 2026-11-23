import React from 'react';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { CartItem, Language } from '../types';
import { translations } from '../utils/translations';
import { sound } from '../utils/audio';

interface CartTrayProps {
  items: CartItem[];
  onUpdateQuantity: (cartId: string, delta: number) => void;
  onRemoveItem: (cartId: string) => void;
  onClearCart: () => void;
  onCheckout: () => void;
  language: Language;
}

export const CartTray: React.FC<CartTrayProps> = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
  language,
}) => {
  const t = translations[language];

  const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <aside className="w-80 lg:w-96 bg-[#161616] border-l border-[#282828] flex flex-col h-full select-none shrink-0 shadow-2xl z-10">
      {/* Header */}
      <div className="h-14 px-5 border-b border-[#282828] flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2">
          <ShoppingBag className="w-5 h-5 text-mcd-yellow" />
          <h2 className="font-extrabold text-base text-white">{t.yourOrder}</h2>
          {totalItemsCount > 0 && (
            <span className="bg-mcd-yellow text-black font-black text-xs px-2 py-0.5 rounded-full">
              {totalItemsCount}
            </span>
          )}
        </div>

        {items.length > 0 && (
          <button
            onClick={() => {
              sound.playTap();
              onClearCart();
            }}
            className="text-xs text-[#9E9E9E] hover:text-mcd-red font-semibold transition-colors"
          >
            {t.clearOrder}
          </button>
        )}
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#7E7E7E]">
            <div className="w-20 h-20 rounded-full bg-[#202020] flex items-center justify-center text-[#555] mb-4">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <p className="font-bold text-sm text-white mb-1">Twoja tacka jest pusta</p>
            <p className="text-xs max-w-xs">{t.emptyOrder}</p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.cartId}
              className="bg-[#202020] border border-[#2F2F2F] rounded-2xl p-3.5 flex flex-col space-y-2.5 transition-all shadow-md"
            >
              {/* Item Top: Name, Image, Price */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                  <img
                    src={item.menuItem.image}
                    alt={item.menuItem.name}
                    className="w-12 h-12 object-contain shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-sm text-white leading-tight truncate">
                      {item.menuItem.name}
                    </h4>
                    {item.mealSize !== 'single' && (
                      <span className="inline-block mt-0.5 text-[10px] font-black px-1.5 py-0.2 rounded bg-mcd-yellow/20 text-mcd-yellow border border-mcd-yellow/30">
                        {item.mealSize === 'large' ? 'ZESTAW POWIĘKSZONY' : 'MCZESTAW'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-black text-sm text-white block">
                    {item.totalPrice.toFixed(2).replace('.', ',')} zł
                  </span>
                </div>
              </div>

              {/* Customizations tags */}
              <div className="text-[11px] space-y-0.5 text-[#B0B0B0] bg-[#1A1A1A] rounded-xl p-2 border border-[#282828]">
                {item.selectedSide && (
                  <div className="flex items-center justify-between">
                    <span>🍟 {item.selectedSide.name}</span>
                    {item.selectedSide.extraPrice > 0 && (
                      <span className="text-mcd-yellow">+{item.selectedSide.extraPrice.toFixed(2)} zł</span>
                    )}
                  </div>
                )}
                {item.selectedDrink && (
                  <div className="flex items-center justify-between">
                    <span>🥤 {item.selectedDrink.name}</span>
                    {item.selectedDrink.extraPrice > 0 && (
                      <span className="text-mcd-yellow">+{item.selectedDrink.extraPrice.toFixed(2)} zł</span>
                    )}
                  </div>
                )}
                {item.customIngredients.map((ci) => (
                  <div key={ci.id} className="flex items-center justify-between text-xs">
                    <span className={ci.type === 'remove' ? 'text-red-400' : 'text-emerald-400'}>
                      {ci.type === 'remove' ? '✖ ' : '✚ '} {ci.name}
                    </span>
                    {ci.price > 0 && <span className="text-mcd-yellow">+{ci.price.toFixed(2)} zł</span>}
                  </div>
                ))}
                {item.selectedSauces.map(({ sauce, quantity }) => (
                  <div key={sauce.id} className="flex items-center justify-between text-xs">
                    <span>🥫 {quantity}x {sauce.name}</span>
                  </div>
                ))}
              </div>

              {/* Bottom: Quantity Controls & Delete */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => {
                    sound.playTap();
                    onRemoveItem(item.cartId);
                  }}
                  className="p-1.5 rounded-lg text-[#888] hover:text-mcd-red hover:bg-[#2A2A2A] transition-colors"
                  title="Usuń pozycję"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="flex items-center space-x-2 bg-[#2A2A2A] rounded-xl p-1 border border-[#383838]">
                  <button
                    onClick={() => {
                      sound.playTap();
                      onUpdateQuantity(item.cartId, -1);
                    }}
                    className="w-7 h-7 rounded-lg bg-[#333] hover:bg-[#444] text-white flex items-center justify-center font-bold text-sm transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-6 text-center font-black text-sm text-white">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => {
                      sound.playTap();
                      onUpdateQuantity(item.cartId, 1);
                    }}
                    className="w-7 h-7 rounded-lg bg-[#333] hover:bg-[#444] text-white flex items-center justify-center font-bold text-sm transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer / Checkout */}
      {items.length > 0 && (
        <div className="p-4 bg-[#1A1A1A] border-t border-[#2A2A2A] space-y-3 shrink-0">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-xs uppercase font-extrabold text-[#9E9E9E] block">{t.total}</span>
              <span className="text-[10px] text-[#737373]">{t.vatIncluded} (8%/23%)</span>
            </div>
            <div className="text-right">
              <span className="text-2xl lg:text-3xl font-black text-mcd-yellow">
                {totalAmount.toFixed(2).replace('.', ',')} <span className="text-base text-white">zł</span>
              </span>
            </div>
          </div>

          {/* Big Green Checkout Button */}
          <button
            onClick={() => {
              sound.playTap();
              onCheckout();
            }}
            className="w-full py-4 px-5 rounded-2xl bg-[#008837] hover:bg-[#009b3f] active:bg-[#00702e] text-white font-black text-base lg:text-lg flex items-center justify-between shadow-glow-green transition-all transform active:scale-98 shadow-xl"
          >
            <span>{t.orderAndPay}</span>
            <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-xl">
              <span>{totalAmount.toFixed(2).replace('.', ',')} zł</span>
              <ArrowRight className="w-5 h-5 ml-1" />
            </div>
          </button>
        </div>
      )}
    </aside>
  );
};
