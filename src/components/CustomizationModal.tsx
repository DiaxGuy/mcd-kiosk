import React, { useState } from 'react';
import { X, Check, Plus, Minus, CheckCircle2, ChevronRight } from 'lucide-react';
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
  mealSizes: MealSizeOption[];
  availableSides: SideChoice[];
  availableDrinks: DrinkChoice[];
  availableIngredients: CustomIngredient[];
  availableSauces: SauceChoice[];
  onClose: () => void;
  onAddToCart: (cartItem: CartItem) => void;
  language: Language;
}

export const CustomizationModal: React.FC<CustomizationModalProps> = ({
  item,
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

  // State
  const [selectedMealSize, setSelectedMealSize] = useState<'single' | 'medium' | 'large'>(
    item.isCustomizable ? 'medium' : 'single'
  );
  const [selectedSide, setSelectedSide] = useState<SideChoice>(availableSides[0]);
  const [selectedDrink, setSelectedDrink] = useState<DrinkChoice>(availableDrinks[0]);
  const [selectedIngredients, setSelectedIngredients] = useState<CustomIngredient[]>([]);
  const [selectedSauces, setSelectedSauces] = useState<{ [sauceId: string]: number }>({});
  const [activeTab, setActiveTab] = useState<'meal' | 'ingredients' | 'side' | 'drink' | 'sauces'>(
    item.isCustomizable ? 'meal' : item.isBoxOrNuggets ? 'sauces' : 'ingredients'
  );

  // Compute prices
  const mealSizeOption = mealSizes.find((m) => m.id === selectedMealSize);
  const mealDelta = selectedMealSize !== 'single' && mealSizeOption ? mealSizeOption.priceDelta : 0;
  const sideExtra = selectedMealSize !== 'single' ? selectedSide.extraPrice : 0;
  const drinkExtra = selectedMealSize !== 'single' ? selectedDrink.extraPrice : 0;
  const ingredientsPrice = selectedIngredients.reduce((sum, ing) => sum + ing.price, 0);

  const unitPrice = item.price + mealDelta + sideExtra + drinkExtra + ingredientsPrice;

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

    const cartItem: CartItem = {
      cartId: `${item.id}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      menuItem: item,
      quantity: 1,
      mealSize: selectedMealSize,
      selectedSide: selectedMealSize !== 'single' ? selectedSide : undefined,
      selectedDrink: selectedMealSize !== 'single' ? selectedDrink : undefined,
      customIngredients: selectedIngredients,
      selectedSauces: sauceList,
      unitPrice,
      totalPrice: unitPrice,
    };

    onAddToCart(cartItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none animate-fadeIn">
      <div className="w-full max-w-5xl h-[85vh] bg-[#1A1A1A] border-2 border-[#333333] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Top Header */}
        <div className="h-20 px-8 bg-[#202020] border-b border-[#303030] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-5">
            <img src={item.image} alt={item.name} className="w-16 h-16 object-contain" />
            <div>
              <h2 className="text-xl lg:text-2xl font-black text-white">{item.name}</h2>
              <span className="text-sm text-mcd-yellow font-bold">
                Cena bazowa: {item.price.toFixed(2)} zł
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="w-11 h-11 rounded-full bg-[#2E2E2E] hover:bg-mcd-red text-white flex items-center justify-center transition-colors shadow-md"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Horizontal Navigation Tabs */}
        <div className="px-8 py-3 bg-[#181818] border-b border-[#2A2A2A] flex items-center space-x-3 shrink-0 overflow-x-auto scrollbar-none">
          {item.isCustomizable && (
            <button
              onClick={() => { sound.playTap(); setActiveTab('meal'); }}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                activeTab === 'meal'
                  ? 'bg-mcd-yellow text-black shadow-lg scale-102'
                  : 'bg-[#242424] text-[#A0A0A0] hover:text-white'
              }`}
            >
              <span>Rozmiar zestawu</span>
              {selectedMealSize !== 'single' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            </button>
          )}

          {item.isCustomizable && (
            <button
              onClick={() => { sound.playTap(); setActiveTab('ingredients'); }}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                activeTab === 'ingredients'
                  ? 'bg-mcd-yellow text-black shadow-lg scale-102'
                  : 'bg-[#242424] text-[#A0A0A0] hover:text-white'
              }`}
            >
              <span>Modyfikacja składników</span>
              {selectedIngredients.length > 0 && (
                <span className="bg-mcd-red text-white text-xs px-1.5 py-0.2 rounded-full font-black">
                  {selectedIngredients.length}
                </span>
              )}
            </button>
          )}

          {item.isCustomizable && selectedMealSize !== 'single' && (
            <>
              <button
                onClick={() => { sound.playTap(); setActiveTab('side'); }}
                className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                  activeTab === 'side'
                    ? 'bg-mcd-yellow text-black shadow-lg scale-102'
                    : 'bg-[#242424] text-[#A0A0A0] hover:text-white'
                }`}
              >
                <span>Wybór dodatku</span>
                <span className="text-xs opacity-75">({selectedSide.name.split(' ')[0]})</span>
              </button>

              <button
                onClick={() => { sound.playTap(); setActiveTab('drink'); }}
                className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                  activeTab === 'drink'
                    ? 'bg-mcd-yellow text-black shadow-lg scale-102'
                    : 'bg-[#242424] text-[#A0A0A0] hover:text-white'
                }`}
              >
                <span>Wybór napoju</span>
                <span className="text-xs opacity-75">({selectedDrink.name.split(' ')[0]})</span>
              </button>
            </>
          )}

          {item.isBoxOrNuggets && (
            <button
              onClick={() => { sound.playTap(); setActiveTab('sauces'); }}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                activeTab === 'sauces'
                  ? 'bg-mcd-yellow text-black shadow-lg scale-102'
                  : 'bg-[#242424] text-[#A0A0A0] hover:text-white'
              }`}
            >
              <span>Wybór sosów do kurczaka</span>
            </button>
          )}
        </div>

        {/* Tab Body Content */}
        <div className="flex-1 overflow-y-auto p-8 scrollbar-thin">
          {/* TAB 1: MEAL SIZE */}
          {activeTab === 'meal' && (
            <div className="space-y-4">
              <h3 className="text-lg font-black text-white mb-2">{t.chooseVariant}</h3>
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
                      className={`relative bg-[#222222] border-2 rounded-3xl p-6 cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-mcd-yellow bg-[#282828] shadow-glow-yellow'
                          : 'border-[#383838] hover:border-[#555]'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-mcd-yellow text-black flex items-center justify-center font-bold">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                      )}

                      <div className="space-y-2">
                        <span className="text-xl font-black text-white block">{size.name}</span>
                        <p className="text-xs text-[#A0A0A0] leading-relaxed">{size.desc}</p>
                      </div>

                      <div className="mt-8 pt-4 border-t border-[#333] flex items-baseline justify-between">
                        <span className="text-xs text-[#888] font-bold">Cena razem:</span>
                        <span className="text-xl font-black text-white">
                          {price.toFixed(2).replace('.', ',')} zł
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: CUSTOMIZE INGREDIENTS */}
          {activeTab === 'ingredients' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-black text-white">{t.customizeIngredients}</h3>
                <p className="text-xs text-[#A0A0A0] mt-0.5">
                  Dodaj ulubione składniki lub usuń te, za którymi nie przepadasz!
                </p>
              </div>

              {/* Add extras section */}
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 block mb-3">
                  ✚ Dodatkowe składniki (Ekstra)
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
                          className={`p-4 rounded-2xl border-2 text-left flex items-center justify-between transition-all ${
                            isSelected
                              ? 'border-emerald-500 bg-emerald-950/30 text-white'
                              : 'border-[#333] bg-[#222] text-[#CCC] hover:border-[#555]'
                          }`}
                        >
                          <div>
                            <span className="font-bold text-sm block">{ing.name}</span>
                            <span className="text-xs font-black text-mcd-yellow">
                              +{ing.price.toFixed(2)} zł
                            </span>
                          </div>
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                              isSelected ? 'bg-emerald-500 text-black' : 'bg-[#333] text-white'
                            }`}
                          >
                            {isSelected ? '✓' : '+'}
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Remove components section */}
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-red-400 block mb-3">
                  ✖ Usuń składnik
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
                          className={`p-4 rounded-2xl border-2 text-left flex items-center justify-between transition-all ${
                            isSelected
                              ? 'border-red-500 bg-red-950/30 text-white'
                              : 'border-[#333] bg-[#222] text-[#CCC] hover:border-[#555]'
                          }`}
                        >
                          <div>
                            <span className="font-bold text-sm block">{ing.name}</span>
                            <span className="text-xs text-[#888]">Standardowo w kanapce</span>
                          </div>
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                              isSelected ? 'bg-red-500 text-white' : 'bg-[#333] text-[#888]'
                            }`}
                          >
                            {isSelected ? '✖' : '−'}
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SIDE CHOICE */}
          {activeTab === 'side' && (
            <div className="space-y-4">
              <h3 className="text-lg font-black text-white">{t.chooseSide}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableSides.map((side) => {
                  const isSelected = selectedSide.id === side.id;
                  return (
                    <div
                      key={side.id}
                      onClick={() => {
                        sound.playTap();
                        setSelectedSide(side);
                      }}
                      className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'border-mcd-yellow bg-[#282828] shadow-glow-yellow'
                          : 'border-[#333] bg-[#222] hover:border-[#555]'
                      }`}
                    >
                      <div>
                        <span className="font-bold text-sm text-white block">{side.name}</span>
                        <span className="text-xs font-bold text-mcd-yellow">
                          {side.extraPrice > 0 ? `+${side.extraPrice.toFixed(2)} zł` : 'W cenie zestawu'}
                        </span>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                          isSelected ? 'bg-mcd-yellow text-black' : 'bg-[#333]'
                        }`}
                      >
                        {isSelected && '✓'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: DRINK CHOICE */}
          {activeTab === 'drink' && (
            <div className="space-y-4">
              <h3 className="text-lg font-black text-white">{t.chooseDrink}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableDrinks.map((drink) => {
                  const isSelected = selectedDrink.id === drink.id;
                  return (
                    <div
                      key={drink.id}
                      onClick={() => {
                        sound.playTap();
                        setSelectedDrink(drink);
                      }}
                      className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'border-mcd-yellow bg-[#282828] shadow-glow-yellow'
                          : 'border-[#333] bg-[#222] hover:border-[#555]'
                      }`}
                    >
                      <div>
                        <span className="font-bold text-sm text-white block">{drink.name}</span>
                        <span className="text-xs font-bold text-mcd-yellow">
                          {drink.extraPrice > 0 ? `+${drink.extraPrice.toFixed(2)} zł` : 'W cenie zestawu'}
                        </span>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                          isSelected ? 'bg-mcd-yellow text-black' : 'bg-[#333]'
                        }`}
                      >
                        {isSelected && '✓'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: SAUCES */}
          {activeTab === 'sauces' && (
            <div className="space-y-4">
              <h3 className="text-lg font-black text-white">{t.chooseSauces}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableSauces.map((sauce) => {
                  const count = selectedSauces[sauce.id] || 0;
                  return (
                    <div
                      key={sauce.id}
                      className="p-4 rounded-2xl border border-[#333] bg-[#222] flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-sm text-white block">{sauce.name}</span>
                        <span className="text-xs text-[#888]">{sauce.price.toFixed(2)} zł / szt.</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateSauceCount(sauce.id, -1)}
                          className="w-7 h-7 rounded-lg bg-[#333] hover:bg-[#444] text-white flex items-center justify-center font-bold text-sm"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-5 text-center font-black text-sm text-white">{count}</span>
                        <button
                          onClick={() => updateSauceCount(sauce.id, 1)}
                          className="w-7 h-7 rounded-lg bg-mcd-yellow text-black flex items-center justify-center font-bold text-sm"
                        >
                          <Plus className="w-3.5 h-3.5" />
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
        <div className="h-24 px-8 bg-[#202020] border-t border-[#303030] flex items-center justify-between shrink-0">
          <div>
            <span className="text-xs uppercase font-extrabold text-[#888] block">Łączna kwota</span>
            <span className="text-2xl lg:text-3xl font-black text-mcd-yellow">
              {unitPrice.toFixed(2).replace('.', ',')} zł
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                sound.playTap();
                onClose();
              }}
              className="px-6 py-3.5 rounded-2xl bg-[#2E2E2E] hover:bg-[#3E3E3E] text-white font-bold text-sm transition-colors"
            >
              {t.cancel}
            </button>

            <button
              onClick={handleConfirm}
              className="px-8 py-3.5 rounded-2xl bg-mcd-yellow hover:bg-[#e5a80b] active:scale-98 text-black font-black text-base flex items-center gap-2 shadow-glow-yellow transition-all"
            >
              <span>{t.addToOrder}</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
