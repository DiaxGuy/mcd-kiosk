import React, { useState } from 'react';
import { X, Check, Plus, Minus, ChevronRight } from 'lucide-react';
import {
  MenuItem,
  MealSizeOption,
  SideChoice,
  DrinkChoice,
  CustomIngredient,
  SauceChoice,
  CartItem,
  Language,
} from '../types';
import { translations } from '../utils/translations';
import { sound } from '../utils/audio';

interface CustomizationModalProps {
  item: MenuItem;
  editingCartItem?: CartItem | null;
  mealSizes: MealSizeOption[];
  availableSides: SideChoice[];
  availableDrinks: DrinkChoice[];
  availableIngredients: CustomIngredient[];
  availableSauces: SauceChoice[];
  onClose: () => void;
  onAddToCart: (cartItem: CartItem) => void;
  language: Language;
}

const FRIES_IMG =
  'https://cdn.mcdonalds.pl/uploads/20241104114431/354308-nowe-frytki-2024-na-www-1090x664px-2-frytki-srednie.png';
const DRINK_IMG =
  'https://cdn.mcdonalds.pl/uploads/20230919154152/1090x664kubek.png';

export const CustomizationModal: React.FC<CustomizationModalProps> = ({
  item,
  editingCartItem,
  mealSizes,
  availableSides,
  availableDrinks,
  availableIngredients,
  availableSauces,
  onClose,
  onAddToCart,
  language,
}) => {
  const t = translations[language];

  const [selectedMealSize, setSelectedMealSize] = useState<'single' | 'medium' | 'large'>(
    editingCartItem ? editingCartItem.mealSize : item.isCustomizable ? 'medium' : 'single'
  );
  const [selectedSide, setSelectedSide] = useState<SideChoice>(
    editingCartItem?.selectedSide || availableSides[0]
  );
  const [selectedDrink, setSelectedDrink] = useState<DrinkChoice>(
    editingCartItem?.selectedDrink || availableDrinks[0]
  );
  const [selectedIngredients, setSelectedIngredients] = useState<CustomIngredient[]>(
    editingCartItem?.customIngredients || []
  );
  const [selectedSauces, setSelectedSauces] = useState<{ [sauceId: string]: number }>(() => {
    if (!editingCartItem) return {};
    const map: { [id: string]: number } = {};
    editingCartItem.selectedSauces.forEach(({ sauce, quantity }) => {
      map[sauce.id] = quantity;
    });
    return map;
  });
  const [activeTab, setActiveTab] = useState<'meal' | 'ingredients' | 'side' | 'drink' | 'sauces'>(
    item.isCustomizable ? 'meal' : item.isBoxOrNuggets ? 'sauces' : 'ingredients'
  );

  // Free sauce allowance: 2 free for Chicken Box/Nuggets, 1 free for McZestaw
  const freeSauceQuota = item.isBoxOrNuggets ? 2 : selectedMealSize !== 'single' ? 1 : 0;
  const totalSelectedSauces = Object.values(selectedSauces).reduce((s, q) => s + q, 0);
  const paidSaucesCount = Math.max(0, totalSelectedSauces - freeSauceQuota);
  const extraSaucePrice = paidSaucesCount * (availableSauces[0]?.price || 2.5);

  const mealSizeOption = mealSizes.find((m) => m.id === selectedMealSize);
  const mealDelta = selectedMealSize !== 'single' && mealSizeOption ? mealSizeOption.priceDelta : 0;
  const sideExtra = selectedMealSize !== 'single' ? selectedSide.extraPrice : 0;
  const drinkExtra = selectedMealSize !== 'single' ? selectedDrink.extraPrice : 0;
  const ingredientsPrice = selectedIngredients.reduce((sum, ing) => sum + ing.price, 0);

  const unitPrice = item.price + mealDelta + sideExtra + drinkExtra + ingredientsPrice + extraSaucePrice;

  // Ordered step-by-step wizard tabs
  const wizardSteps: Array<'meal' | 'side' | 'drink' | 'sauces' | 'ingredients'> = (() => {
    if (item.isCustomizable && selectedMealSize !== 'single') {
      return item.isBoxOrNuggets
        ? ['meal', 'side', 'drink', 'sauces', 'ingredients']
        : ['meal', 'side', 'drink', 'ingredients'];
    }
    if (item.isCustomizable) {
      return item.isBoxOrNuggets ? ['meal', 'sauces', 'ingredients'] : ['meal', 'ingredients'];
    }
    return item.isBoxOrNuggets ? ['sauces', 'ingredients'] : ['ingredients'];
  })();

  const currentStepIdx = wizardSteps.indexOf(activeTab);
  const hasNextStep = !editingCartItem && currentStepIdx >= 0 && currentStepIdx < wizardSteps.length - 1;

  const toggleIngredient = (ing: CustomIngredient) => {
    sound.playTap();
    const exists = selectedIngredients.find((i) => i.id === ing.id);
    if (exists) {
      setSelectedIngredients(selectedIngredients.filter((i) => i.id !== ing.id));
    } else {
      setSelectedIngredients([...selectedIngredients, ing]);
    }
  };

  const updateSauceCount = (sauceId: string, delta: number) => {
    sound.playTap();
    const current = selectedSauces[sauceId] || 0;
    const next = Math.max(0, current + delta);
    setSelectedSauces({ ...selectedSauces, [sauceId]: next });
  };

  const handleConfirm = () => {
    sound.playAdd();

    const sauceList = Object.entries(selectedSauces)
      .filter(([_, qty]) => qty > 0)
      .map(([sauceId, qty]) => ({
        sauce: availableSauces.find((s) => s.id === sauceId)!,
        quantity: qty,
      }))
      .filter((s) => s.sauce);

    const qty = editingCartItem?.quantity || 1;
    const cartItem: CartItem = {
      cartId: editingCartItem?.cartId || `${item.id}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      menuItem: item,
      quantity: qty,
      mealSize: selectedMealSize,
      selectedSide: selectedMealSize !== 'single' ? selectedSide : undefined,
      selectedDrink: selectedMealSize !== 'single' ? selectedDrink : undefined,
      customIngredients: selectedIngredients,
      selectedSauces: sauceList,
      unitPrice,
      totalPrice: unitPrice * qty,
    };

    onAddToCart(cartItem);
    onClose();
  };

  const handleNextStep = () => {
    sound.playTap();
    if (hasNextStep) {
      setActiveTab(wizardSteps[currentStepIdx + 1]);
    } else {
      handleConfirm();
    }
  };

  const tabMeta: Record<'meal' | 'side' | 'drink' | 'sauces' | 'ingredients', { label: string; sub?: string }> = {
    meal: { label: 'Rozmiar' },
    side: { label: 'Dodatek', sub: selectedSide?.name.split(' ')[0] },
    drink: { label: 'Napój', sub: selectedDrink?.name.split(' ')[0] },
    sauces: { label: 'Sosy' },
    ingredients: {
      label: 'Składniki',
      sub: selectedIngredients.length > 0 ? `${selectedIngredients.length}` : undefined,
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 select-none">
      <div className="w-full max-w-5xl h-[86vh] bg-white border border-[#D4D4D4] rounded-xl flex flex-col overflow-hidden text-[#292929]">
        {/* Modal Top Header */}
        <div className="h-20 px-7 bg-white border-b border-[#E5E5E5] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-4">
            <img src={item.image} alt={item.name} className="w-16 h-14 object-contain" />
            <div>
              <h2 className="text-xl lg:text-2xl font-extrabold text-[#111] tracking-tight">{item.name}</h2>
              <span className="text-xs text-[#6B7280] font-semibold">
                Cena bazowa: {item.price.toFixed(2).replace('.', ',')} zł
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="w-9 h-9 rounded-md border border-[#D4D4D4] bg-white hover:bg-[#FAFAFA] text-[#4B5563] hover:text-[#111] flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Clean Step Tabs (Flat underline bar, no bubbly pills) */}
        <div className="px-7 bg-[#FAFAFA] border-b border-[#E5E5E5] flex items-stretch space-x-1 shrink-0 overflow-x-auto scrollbar-none">
          {wizardSteps.map((stepKey, idx) => {
            const isActive = activeTab === stepKey;
            const meta = tabMeta[stepKey];
            return (
              <button
                key={stepKey}
                onClick={() => {
                  sound.playTap();
                  setActiveTab(stepKey);
                }}
                className={`relative px-5 py-3.5 text-sm transition-colors flex items-center gap-2 whitespace-nowrap ${
                  isActive
                    ? 'text-[#111111] font-extrabold bg-white'
                    : 'text-[#6B7280] hover:text-[#111111] font-semibold'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full text-[11px] font-black flex items-center justify-center ${
                    isActive ? 'bg-[#FFBC0D] text-[#111]' : 'bg-[#E5E5E5] text-[#4B5563]'
                  }`}
                >
                  {idx + 1}
                </span>
                <span>{meta.label}</span>
                {meta.sub && (
                  <span className="text-[11px] text-[#6B7280] font-normal">({meta.sub})</span>
                )}
                {isActive && (
                  <div className="absolute left-0 right-0 bottom-0 h-[3px] bg-[#FFBC0D]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Body Content */}
        <div className="flex-1 overflow-y-auto p-7 scrollbar-thin bg-white">
          {/* TAB 1: MEAL SIZE */}
          {activeTab === 'meal' && (
            <div className="space-y-4">
              <h3 className="text-lg font-extrabold text-[#111]">{t.chooseVariant}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {mealSizes.map((size) => {
                  const isSelected = selectedMealSize === size.id;
                  const price = item.price + size.priceDelta;

                  return (
                    <div
                      key={size.id}
                      onClick={() => {
                        sound.playTap();
                        setSelectedMealSize(size.id);
                      }}
                      className={`relative bg-white border-2 rounded-lg p-5 cursor-pointer transition-colors flex flex-col justify-between overflow-hidden ${
                        isSelected
                          ? 'border-[#FFBC0D] bg-[#FFFDF5]'
                          : 'border-[#E5E5E5] hover:border-[#BDBDBD]'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#FFBC0D] text-black flex items-center justify-center z-20">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}

                      {/* Bounded Meal Packshot (Strictly contained inside card!) */}
                      <div className="w-full h-28 flex items-end justify-center overflow-hidden my-2">
                        {size.id === 'single' ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-24 w-auto max-w-[75%] object-contain"
                          />
                        ) : (
                          <div className="w-full max-w-[210px] h-24 flex items-end justify-center px-2">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-[44%] h-20 object-contain z-10 shrink-0"
                            />
                            <img
                              src={FRIES_IMG}
                              alt="Frytki"
                              className={`w-[30%] object-contain -ml-3 shrink-0 ${
                                size.id === 'large' ? 'h-22' : 'h-18'
                              }`}
                            />
                            <img
                              src={DRINK_IMG}
                              alt="Napój"
                              className={`w-[28%] object-contain -ml-2 shrink-0 ${
                                size.id === 'large' ? 'h-24' : 'h-20'
                              }`}
                            />
                          </div>
                        )}
                      </div>

                      <div className="space-y-1 text-center mt-1">
                        <span className="text-lg font-extrabold text-[#111] block">{size.name}</span>
                        <p className="text-xs text-[#6B7280] leading-snug">{size.desc}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#F0F0F0] flex items-baseline justify-between">
                        <span className="text-xs text-[#6B7280] font-semibold">Cena:</span>
                        <span className="text-lg font-black text-[#111]">
                          {price.toFixed(2).replace('.', ',')} zł
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: INGREDIENTS */}
          {activeTab === 'ingredients' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-extrabold text-[#111]">{t.customizeIngredients}</h3>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  Dodaj dodatkowe składniki lub usuń te, których nie chcesz
                </p>
              </div>

              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#008837] block mb-3">
                  Dodatkowe składniki
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {availableIngredients
                    .filter((ing) => ing.type === 'add')
                    .map((ing) => {
                      const isSelected = selectedIngredients.some((i) => i.id === ing.id);
                      return (
                        <button
                          key={ing.id}
                          onClick={() => toggleIngredient(ing)}
                          className={`p-3.5 rounded-lg border text-left flex items-center justify-between transition-colors ${
                            isSelected
                              ? 'border-[#008837] bg-[#F2FBF5] text-[#111]'
                              : 'border-[#E5E5E5] bg-white text-[#292929] hover:border-[#BDBDBD]'
                          }`}
                        >
                          <div>
                            <span className="font-bold text-sm block">{ing.name}</span>
                            <span className="text-xs font-bold text-[#6B7280]">
                              +{ing.price.toFixed(2).replace('.', ',')} zł
                            </span>
                          </div>
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                              isSelected ? 'bg-[#008837] text-white' : 'bg-[#F3F4F6] text-[#6B7280]'
                            }`}
                          >
                            {isSelected ? '✓' : '+'}
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>

              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#DB0007] block mb-3">
                  Usuń składnik
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {availableIngredients
                    .filter((ing) => ing.type === 'remove')
                    .map((ing) => {
                      const isSelected = selectedIngredients.some((i) => i.id === ing.id);
                      return (
                        <button
                          key={ing.id}
                          onClick={() => toggleIngredient(ing)}
                          className={`p-3.5 rounded-lg border text-left flex items-center justify-between transition-colors ${
                            isSelected
                              ? 'border-[#DB0007] bg-[#FEF2F2] text-[#111]'
                              : 'border-[#E5E5E5] bg-white text-[#292929] hover:border-[#BDBDBD]'
                          }`}
                        >
                          <div>
                            <span className="font-bold text-sm block">{ing.name}</span>
                            <span className="text-xs text-[#6B7280]">Standardowo w kanapce</span>
                          </div>
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                              isSelected ? 'bg-[#DB0007] text-white' : 'bg-[#F3F4F6] text-[#9CA3AF]'
                            }`}
                          >
                            {isSelected ? '✕' : '−'}
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SIDE */}
          {activeTab === 'side' && (
            <div className="space-y-4">
              <h3 className="text-lg font-extrabold text-[#111]">{t.chooseSide}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {availableSides.map((side) => {
                  const isSelected = selectedSide.id === side.id;
                  return (
                    <div
                      key={side.id}
                      onClick={() => {
                        sound.playTap();
                        setSelectedSide(side);
                      }}
                      className={`relative p-4 rounded-lg border-2 flex flex-col items-center text-center cursor-pointer transition-colors ${
                        isSelected
                          ? 'border-[#FFBC0D] bg-[#FFFDF5]'
                          : 'border-[#E5E5E5] bg-white hover:border-[#BDBDBD]'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#FFBC0D] text-black flex items-center justify-center font-bold text-[11px]">
                          ✓
                        </div>
                      )}
                      {side.image && (
                        <img
                          src={side.image}
                          alt={side.name}
                          className="h-24 w-full object-contain my-2"
                        />
                      )}
                      <span className="font-bold text-sm text-[#111] block leading-tight">{side.name}</span>
                      <span className="text-xs font-semibold text-[#6B7280] mt-1">
                        {side.extraPrice > 0 ? `+${side.extraPrice.toFixed(2).replace('.', ',')} zł` : 'W cenie zestawu'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: DRINK */}
          {activeTab === 'drink' && (
            <div className="space-y-4">
              <h3 className="text-lg font-extrabold text-[#111]">{t.chooseDrink}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {availableDrinks.map((drink) => {
                  const isSelected = selectedDrink.id === drink.id;
                  return (
                    <div
                      key={drink.id}
                      onClick={() => {
                        sound.playTap();
                        setSelectedDrink(drink);
                      }}
                      className={`relative p-4 rounded-lg border-2 flex flex-col items-center text-center cursor-pointer transition-colors ${
                        isSelected
                          ? 'border-[#FFBC0D] bg-[#FFFDF5]'
                          : 'border-[#E5E5E5] bg-white hover:border-[#BDBDBD]'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#FFBC0D] text-black flex items-center justify-center font-bold text-[11px]">
                          ✓
                        </div>
                      )}
                      <img
                        src={drink.image || DRINK_IMG}
                        alt={drink.name}
                        className="h-24 w-full object-contain my-2"
                      />
                      <span className="font-bold text-sm text-[#111] block leading-tight">{drink.name}</span>
                      <span className="text-xs font-semibold text-[#6B7280] mt-1">
                        {drink.extraPrice > 0 ? `+${drink.extraPrice.toFixed(2).replace('.', ',')} zł` : 'W cenie zestawu'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: SAUCES */}
          {activeTab === 'sauces' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-lg font-extrabold text-[#111]">{t.chooseSauces}</h3>
                {freeSauceQuota > 0 && (
                  <span className="px-3 py-1 rounded bg-[#E6F4EA] text-[#008837] text-xs font-extrabold">
                    Darmowe sosy w zestawie: {Math.min(totalSelectedSauces, freeSauceQuota)} / {freeSauceQuota}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {availableSauces.map((sauce) => {
                  const count = selectedSauces[sauce.id] || 0;
                  return (
                    <div
                      key={sauce.id}
                      className={`p-4 rounded-lg border-2 flex flex-col items-center text-center justify-between space-y-2 transition-colors ${
                        count > 0 ? 'border-[#FFBC0D] bg-[#FFFDF5]' : 'border-[#E5E5E5] bg-white'
                      }`}
                    >
                      {sauce.image && (
                        <img
                          src={sauce.image}
                          alt={sauce.name}
                          className="h-20 w-full object-contain"
                        />
                      )}
                      <div>
                        <span className="font-bold text-sm text-[#111] block leading-tight">{sauce.name}</span>
                        <span className="text-xs text-[#6B7280] font-semibold">
                          {sauce.price.toFixed(2).replace('.', ',')} zł / szt.
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 pt-1">
                        <button
                          onClick={() => updateSauceCount(sauce.id, -1)}
                          className="w-8 h-8 rounded border border-[#D4D4D4] bg-white hover:bg-[#F5F5F5] text-[#111] flex items-center justify-center font-bold text-sm"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-5 text-center font-black text-base text-[#111]">{count}</span>
                        <button
                          onClick={() => updateSauceCount(sauce.id, 1)}
                          className="w-8 h-8 rounded bg-[#FFBC0D] hover:bg-[#F5B300] text-black flex items-center justify-center font-bold text-sm"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Action Bar */}
        <div className="h-20 px-7 bg-white border-t border-[#E5E5E5] flex items-center justify-between shrink-0">
          <div>
            <span className="text-[11px] uppercase font-bold text-[#6B7280] block">Łączna kwota</span>
            <span className="text-2xl font-black text-[#111]">
              {unitPrice.toFixed(2).replace('.', ',')} zł
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                sound.playTap();
                onClose();
              }}
              className="px-6 py-3 rounded-md border border-[#D4D4D4] bg-white hover:bg-[#FAFAFA] text-[#292929] font-bold text-sm transition-colors"
            >
              {t.cancel}
            </button>

            <button
              onClick={handleNextStep}
              className="px-8 py-3 rounded-md bg-[#FFBC0D] hover:bg-[#F5B300] text-[#111111] font-extrabold text-sm flex items-center gap-2 transition-colors active:scale-[0.98]"
            >
              <span>
                {editingCartItem
                  ? 'Zapisz zmiany'
                  : hasNextStep
                  ? `Dalej (Krok ${currentStepIdx + 2}/${wizardSteps.length})`
                  : t.addToOrder}
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
