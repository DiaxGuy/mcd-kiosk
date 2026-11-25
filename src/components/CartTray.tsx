import React from 'react';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Pencil, Tag } from 'lucide-react';
import { CartItem, Language, AppliedCoupon } from '../types';
import { translations } from '../utils/translations';
import { sound } from '../utils/audio';

interface CartTrayProps {
  items: CartItem[];
  onUpdateQuantity: (cartId: string, delta: number) => void;
  onRemoveItem: (cartId: string) => void;
  onEditItem?: (item: CartItem) => void;
  onClearCart: () => void;
  onCheckout: () => void;
  appliedCoupon?: AppliedCoupon | null;
  onOpenCoupons?: () => void;
  language: Language;
}

export const CartTray: React.FC<CartTrayProps> = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onEditItem,
  onClearCart,
  onCheckout,
  appliedCoupon,
  onOpenCoupons,
  language,
}) => {
  const t = translations[language];

  const rawTotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const discountAmount = appliedCoupon ? Math.min(rawTotal, appliedCoupon.discountAmount) : 0;
  const totalAmount = Math.max(0, rawTotal - discountAmount);
  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <aside className="w-80 lg:w-96 bg-white border-l border-[#E5E7EB] flex flex-col h-full select-none shrink-0 shadow-sm z-10">
      {/* Header */}
      <div className="h-16 px-5 border-b border-[#E5E7EB] flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2">
          <ShoppingBag className="w-5 h-5 text-mcd-yellow" />
          <h2 className="font-black text-base text-[#111111]">{t.yourOrder}</h2>
          {totalItemsCount > 0 && (
            <span className="bg-mcd-yellow text-black font-black text-xs px-2 py-0.5 rounded-full shadow-sm">
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
            className="text-xs text-[#6B7280] hover:text-mcd-red font-bold transition-colors"
          >
            {t.clearOrder}
          </button>
        )}
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin bg-[#FAFAFA]">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#9CA3AF]">
            <div className="w-16 h-16 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#9CA3AF] mb-3 border border-[#E5E7EB]">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <p className="font-extrabold text-sm text-[#374151] mb-1">Twoja tacka jest pusta</p>
            <p className="text-xs max-w-xs">{t.emptyOrder}</p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.cartId}
              className="bg-white border border-[#E5E7EB] rounded-2xl p-3.5 flex flex-col space-y-2.5 transition-all shadow-sm"
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
                    <h4 className="font-extrabold text-sm text-[#111111] leading-tight truncate">
                      {item.menuItem.name}
                    </h4>
                    {item.mealSize !== 'single' && (
                      <span className="inline-block mt-0.5 text-[10px] font-black px-1.5 py-0.2 rounded bg-mcd-yellow/20 text-[#92400E] border border-mcd-yellow/40">
                        {item.mealSize === 'large' ? 'ZESTAW POWIĘKSZONY' : 'MCZESTAW'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-black text-sm text-[#111111] block">
                    {item.totalPrice.toFixed(2).replace('.', ',')} zł
                  </span>
                </div>
              </div>

              {/* Customizations tags */}
              <div className="text-[11px] space-y-0.5 text-[#4B5563] bg-[#F9FAFB] rounded-xl p-2 border border-[#F3F4F6]">
                {item.selectedSide && (
                  <div className="flex items-center justify-between font-medium">
                    <span>🍟 {item.selectedSide.name}</span>
                    {item.selectedSide.extraPrice > 0 && (
                      <span className="font-bold text-mcd-yellow">+{item.selectedSide.extraPrice.toFixed(2)} zł</span>
                    )}
                  </div>
                )}
                {item.selectedDrink && (
                  <div className="flex items-center justify-between font-medium">
                    <span>🥤 {item.selectedDrink.name}</span>
                    {item.selectedDrink.extraPrice > 0 && (
                      <span className="font-bold text-mcd-yellow">+{item.selectedDrink.extraPrice.toFixed(2)} zł</span>
                    )}
                  </div>
                )}
                {item.customIngredients.map((ci) => (
                  <div key={ci.id} className="flex items-center justify-between text-xs font-semibold">
                    <span className={ci.type === 'remove' ? 'text-red-600' : 'text-emerald-700'}>
                      {ci.type === 'remove' ? '✖ ' : '✚ '} {ci.name}
                    </span>
                    {ci.price > 0 && <span className="font-bold text-black">+{ci.price.toFixed(2)} zł</span>}
                  </div>
                ))}
                {item.selectedSauces.map(({ sauce, quantity }) => (
                  <div key={sauce.id} className="flex items-center justify-between text-xs font-medium">
                    <span>🥫 {quantity}x {sauce.name}</span>
                  </div>
                ))}
              </div>

              {/* Bottom: Quantity Controls, Edit & Delete */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => {
                      sound.playTap();
                      onRemoveItem(item.cartId);
                    }}
                    className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-mcd-red hover:bg-[#F3F4F6] transition-colors"
                    title="Usuń pozycję"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {onEditItem && (
                    <button
                      onClick={() => {
                        sound.playTap();
                        onEditItem(item);
                      }}
                      className="px-2 py-1 rounded-lg text-[#4B5563] hover:text-black hover:bg-[#F3F4F6] text-[11px] font-bold flex items-center gap-1 transition-colors"
                      title="Edytuj pozycję"
                    >
                      <Pencil className="w-3 h-3" />
                      <span>Edytuj</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center space-x-2 bg-[#F3F4F6] rounded-xl p-1 border border-[#E5E7EB]">
                  <button
                    onClick={() => {
                      sound.playTap();
                      onUpdateQuantity(item.cartId, -1);
                    }}
                    className="w-7 h-7 rounded-lg bg-white hover:bg-[#E5E7EB] text-[#111] flex items-center justify-center font-bold text-sm shadow-sm transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-6 text-center font-black text-sm text-[#111]">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => {
                      sound.playTap();
                      onUpdateQuantity(item.cartId, 1);
                    }}
                    className="w-7 h-7 rounded-lg bg-white hover:bg-[#E5E7EB] text-[#111] flex items-center justify-center font-bold text-sm shadow-sm transition-colors"
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
        <div className="p-4 bg-white border-t border-[#E5E7EB] space-y-3 shrink-0 shadow-sm">
          {/* Coupon / MojeM Summary */}
          {appliedCoupon ? (
            <button
              onClick={() => {
                sound.playTap();
                onOpenCoupons?.();
              }}
              className="w-full px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs"
            >
              <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                <span>Kupon {appliedCoupon.code}</span>
              </span>
              <span className="font-black text-emerald-700">
                -{discountAmount.toFixed(2).replace('.', ',')} zł
              </span>
            </button>
          ) : (
            onOpenCoupons && (
              <button
                onClick={() => {
                  sound.playTap();
                  onOpenCoupons();
                }}
                className="w-full px-3 py-1.5 rounded-xl bg-[#FFFBEB] hover:bg-mcd-yellow/20 border border-mcd-yellow/40 text-xs font-bold text-[#92400E] flex items-center justify-center gap-1.5 transition-colors"
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Masz kod lub kupon MojeM?</span>
              </button>
            )
          )}

          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-xs uppercase font-extrabold text-[#6B7280] block">{t.total}</span>
              <span className="text-[10px] text-[#9CA3AF]">{t.vatIncluded} (8%/23%)</span>
            </div>
            <div className="text-right">
              <span className="text-2xl lg:text-3xl font-black text-[#111111]">
                {totalAmount.toFixed(2).replace('.', ',')} <span className="text-base text-[#6B7280]">zł</span>
              </span>
            </div>
          </div>

          {/* Big Yellow / Green Official Checkout Button */}
          <button
            onClick={() => {
              sound.playTap();
              onCheckout();
            }}
            className="w-full py-4 px-5 rounded-2xl bg-mcd-yellow hover:bg-[#EAB308] active:bg-[#CA8A04] text-black font-black text-base lg:text-lg flex items-center justify-between shadow-glow-yellow transition-all transform active:scale-98 shadow-md"
          >
            <span>{t.orderAndPay}</span>
            <div className="flex items-center gap-1.5 bg-black/10 px-3 py-1 rounded-xl">
              <span>{totalAmount.toFixed(2).replace('.', ',')} zł</span>
              <ArrowRight className="w-5 h-5 ml-1" />
            </div>
          </button>
        </div>
      )}
    </aside>
  );
};
