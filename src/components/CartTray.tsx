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
    <aside className="w-76 lg:w-84 bg-white border-l border-[#E5E5E5] flex flex-col h-full select-none shrink-0 z-10">
      {/* Header */}
      <div className="h-14 px-5 border-b border-[#E5E5E5] flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2">
          <h2 className="font-extrabold text-sm text-[#111111] uppercase tracking-wide">{t.yourOrder}</h2>
          {totalItemsCount > 0 && (
            <span className="bg-[#FFBC0D] text-[#111111] font-black text-xs px-2 py-0.5 rounded">
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
            className="text-xs text-[#6B7280] hover:text-[#DB0007] font-bold transition-colors"
          >
            {t.clearOrder}
          </button>
        )}
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 scrollbar-thin bg-white">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#9CA3AF]">
            <p className="font-bold text-sm text-[#374151] mb-1">Twoja tacka jest pusta</p>
            <p className="text-xs max-w-xs">{t.emptyOrder}</p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.cartId}
              className="bg-white border border-[#E5E5E5] rounded-lg p-3 flex flex-col space-y-2"
            >
              {/* Item Top: Name, Image, Price */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                  <img
                    src={item.menuItem.image}
                    alt={item.menuItem.name}
                    className="w-11 h-11 object-contain shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-[#111111] leading-tight truncate">
                      {item.menuItem.name}
                    </h4>
                    {item.mealSize !== 'single' && (
                      <span className="inline-block mt-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#FFF8E1] text-[#8A5A00] border border-[#FFBC0D]/40">
                        {item.mealSize === 'large' ? 'McZestaw Powiększony' : 'McZestaw'}
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

              {/* Clean plain-text Customizations (no emojis) */}
              {(item.selectedSide || item.selectedDrink || item.customIngredients.length > 0 || item.selectedSauces.length > 0) && (
                <div className="text-[11px] space-y-0.5 text-[#4A4A4A] bg-[#FAFAFA] rounded p-2 border border-[#F0F0F0]">
                  {item.selectedSide && (
                    <div className="flex items-center justify-between font-medium">
                      <span>• {item.selectedSide.name}</span>
                      {item.selectedSide.extraPrice > 0 && (
                        <span className="font-bold">+{item.selectedSide.extraPrice.toFixed(2)} zł</span>
                      )}
                    </div>
                  )}
                  {item.selectedDrink && (
                    <div className="flex items-center justify-between font-medium">
                      <span>• {item.selectedDrink.name}</span>
                      {item.selectedDrink.extraPrice > 0 && (
                        <span className="font-bold">+{item.selectedDrink.extraPrice.toFixed(2)} zł</span>
                      )}
                    </div>
                  )}
                  {item.customIngredients.map((ci) => (
                    <div key={ci.id} className="flex items-center justify-between font-semibold">
                      <span className={ci.type === 'remove' ? 'text-[#DB0007]' : 'text-[#008837]'}>
                        {ci.type === 'remove' ? 'Bez: ' : 'Dodatkowo: '} {ci.name}
                      </span>
                      {ci.price > 0 && <span className="font-bold text-[#111]">+{ci.price.toFixed(2)} zł</span>}
                    </div>
                  ))}
                  {item.selectedSauces.map(({ sauce, quantity }) => (
                    <div key={sauce.id} className="flex items-center justify-between font-medium">
                      <span>• {quantity}x {sauce.name}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Bottom: Quantity Controls, Edit & Delete */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => {
                      sound.playTap();
                      onRemoveItem(item.cartId);
                    }}
                    className="p-1.5 rounded text-[#9CA3AF] hover:text-[#DB0007] hover:bg-[#F5F5F5] transition-colors"
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
                      className="px-2 py-1 rounded border border-[#E5E5E5] text-[#4A4A4A] hover:text-[#111] hover:bg-[#FAFAFA] text-[11px] font-bold flex items-center gap-1 transition-colors"
                    >
                      <Pencil className="w-3 h-3" />
                      <span>Edytuj</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center space-x-1.5 bg-[#F5F5F5] rounded p-0.5 border border-[#E5E5E5]">
                  <button
                    onClick={() => {
                      sound.playTap();
                      onUpdateQuantity(item.cartId, -1);
                    }}
                    className="w-7 h-7 rounded bg-white hover:bg-[#EBEBEB] text-[#111] flex items-center justify-center font-bold text-sm transition-colors"
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
                    className="w-7 h-7 rounded bg-white hover:bg-[#EBEBEB] text-[#111] flex items-center justify-center font-bold text-sm transition-colors"
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
        <div className="p-3.5 bg-white border-t border-[#E5E5E5] space-y-2.5 shrink-0">
          {appliedCoupon ? (
            <button
              onClick={() => {
                sound.playTap();
                onOpenCoupons?.();
              }}
              className="w-full px-3 py-2 rounded bg-[#E6F4EA] border border-[#008837]/30 flex items-center justify-between text-xs"
            >
              <span className="font-bold text-[#008837] flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                <span>Kupon {appliedCoupon.code}</span>
              </span>
              <span className="font-black text-[#008837]">
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
                className="w-full px-3 py-1.5 rounded border border-[#D4D4D4] hover:border-[#FFBC0D] bg-white text-xs font-bold text-[#292929] flex items-center justify-center gap-1.5 transition-colors"
              >
                <Tag className="w-3.5 h-3.5 text-[#FFBC0D]" />
                <span>Dodaj kod MojeM</span>
              </button>
            )
          )}

          <button
            onClick={() => {
              sound.playTap();
              onCheckout();
            }}
            className="w-full py-3.5 px-4 rounded-md bg-[#FFBC0D] hover:bg-[#F5B300] text-[#111111] font-extrabold text-sm flex items-center justify-between transition-colors"
          >
            <span>{t.orderAndPay}</span>
            <span className="font-black">{totalAmount.toFixed(2).replace('.', ',')} zł</span>
          </button>
        </div>
      )}
    </aside>
  );
};
