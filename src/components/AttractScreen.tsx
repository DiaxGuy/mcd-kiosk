import React from 'react';
import { Utensils, ShoppingBag, Sparkles, ChevronRight } from 'lucide-react';
import { Language, OrderType } from '../types';
import { translations } from '../utils/translations';
import { sound } from '../utils/audio';
import { OfficialLogo } from './OfficialLogo';

interface AttractScreenProps {
  onStart: (orderType: OrderType) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const AttractScreen: React.FC<AttractScreenProps> = ({
  onStart,
  language,
  setLanguage,
}) => {
  const t = translations[language];

  const handleSelect = (type: OrderType) => {
    sound.playAdd();
    onStart(type);
  };

  return (
    <div className="relative w-screen h-screen bg-[#F4F4F6] text-[#1F1F1F] overflow-hidden flex flex-col justify-between p-8 select-none">
      {/* Background ambient lighting */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-mcd-yellow/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-mcd-red/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar: Official McDonald's Logo & Language Switcher */}
      <div className="flex items-center justify-between z-10 w-full max-w-7xl mx-auto">
        <div className="flex items-center space-x-4">
          {/* Official Golden Arches */}
          <OfficialLogo className="w-16 h-14 drop-shadow-md" />
          <div>
            <h1 className="text-3xl font-black tracking-tight text-[#111] flex items-center gap-2">
              McDonald's
            </h1>
            <p className="text-xs text-[#6B7280] font-semibold">Oficjalny Kiosk Zamówień Samoobsługowych</p>
          </div>
        </div>

        {/* Touch-friendly Language Flags */}
        <div className="flex items-center space-x-2 bg-white shadow-sm p-1.5 rounded-full border border-[#E5E7EB]">
          <button
            onClick={() => { sound.playTap(); setLanguage('pl'); }}
            className={`px-4 py-2 rounded-full font-black text-xs flex items-center gap-2 transition-all ${
              language === 'pl'
                ? 'bg-mcd-yellow text-black shadow-sm'
                : 'text-[#6B7280] hover:text-[#111]'
            }`}
          >
            <span className="text-base">🇵🇱</span>
            <span>Polski</span>
          </button>
          <button
            onClick={() => { sound.playTap(); setLanguage('en'); }}
            className={`px-4 py-2 rounded-full font-black text-xs flex items-center gap-2 transition-all ${
              language === 'en'
                ? 'bg-mcd-yellow text-black shadow-sm'
                : 'text-[#6B7280] hover:text-[#111]'
            }`}
          >
            <span className="text-base">🇬🇧</span>
            <span>English</span>
          </button>
          <button
            onClick={() => { sound.playTap(); setLanguage('ua'); }}
            className={`px-4 py-2 rounded-full font-black text-xs flex items-center gap-2 transition-all ${
              language === 'ua'
                ? 'bg-mcd-yellow text-black shadow-sm'
                : 'text-[#6B7280] hover:text-[#111]'
            }`}
          >
            <span className="text-base">🇺🇦</span>
            <span>Українська</span>
          </button>
        </div>
      </div>

      {/* Main Center Content: Landscape Hero + Dining Mode Buttons */}
      <div className="flex-1 flex items-center justify-between w-full max-w-7xl mx-auto my-4 gap-12 z-10">
        {/* Left Side: Campaign Hero Visual */}
        <div className="flex-1 flex flex-col justify-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-mcd-red text-white font-black text-xs uppercase tracking-wider w-fit shadow-md">
            <Sparkles className="w-4 h-4 text-mcd-yellow animate-spin" />
            <span>Królowa Zimy powróciła!</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-5xl lg:text-6xl font-black text-[#111] tracking-tight leading-none">
              BURGER <span className="text-mcd-yellow drop-shadow-sm">DRWALA</span>
            </h2>
            <p className="text-base lg:text-lg text-[#4B5563] max-w-lg font-medium leading-relaxed">
              Kotlet wołowy 100%, gruby chrupiący ser w złocistej panierce, bekon i sos z prażoną cebulką w puszystej bułce z posypką z sera i bekonu.
            </p>
          </div>

          {/* High-res Image of Burger Drwala */}
          <div className="relative w-full max-w-md h-56 flex items-center justify-center">
            <img
              src="https://cdn.mcdonalds.pl/uploads/20261104143818/pl10-p00001662-drwal-2026-na-www-1090x664px-burger-drwala-klasyczny.png"
              alt="Burger Drwala"
              className="max-h-56 object-contain drop-shadow-2xl transform hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>

        {/* Right Side: Dine In vs Take Away Cards */}
        <div className="w-[440px] flex flex-col space-y-5 justify-center">
          <div className="text-center mb-1">
            <span className="text-xs font-black tracking-widest text-[#6B7280] uppercase block mb-1">
              {t.touchToStart}
            </span>
            <h3 className="text-3xl font-black text-[#111]">Gdzie zjesz posiłek?</h3>
          </div>

          {/* Eat in Button */}
          <button
            onClick={() => handleSelect('dine_in')}
            className="group relative bg-white hover:bg-[#FAFAFA] border-2 border-[#E5E7EB] hover:border-mcd-yellow rounded-3xl p-6 flex items-center justify-between text-left shadow-lg hover:shadow-xl transition-all duration-200 transform active:scale-98"
          >
            <div className="flex items-center space-x-5">
              <div className="w-16 h-16 rounded-2xl bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center text-mcd-yellow group-hover:bg-mcd-yellow group-hover:text-black transition-colors shadow-inner">
                <Utensils className="w-8 h-8" />
              </div>
              <div>
                <span className="text-2xl font-black text-[#111] block group-hover:text-mcd-red transition-colors">
                  {t.eatIn}
                </span>
                <span className="text-xs text-[#6B7280] block mt-0.5 font-semibold">
                  Zjesz wygodnie na sali w restauracji
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#F3F4F6] group-hover:bg-mcd-yellow group-hover:text-black flex items-center justify-center text-[#111] transition-colors">
              <ChevronRight className="w-6 h-6" />
            </div>
          </button>

          {/* Take out Button */}
          <button
            onClick={() => handleSelect('take_away')}
            className="group relative bg-white hover:bg-[#FAFAFA] border-2 border-[#E5E7EB] hover:border-mcd-yellow rounded-3xl p-6 flex items-center justify-between text-left shadow-lg hover:shadow-xl transition-all duration-200 transform active:scale-98"
          >
            <div className="flex items-center space-x-5">
              <div className="w-16 h-16 rounded-2xl bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center text-mcd-yellow group-hover:bg-mcd-yellow group-hover:text-black transition-colors shadow-inner">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div>
                <span className="text-2xl font-black text-[#111] block group-hover:text-mcd-red transition-colors">
                  {t.takeAway}
                </span>
                <span className="text-xs text-[#6B7280] block mt-0.5 font-semibold">
                  Spakujemy Twoje zamówienie w torbę
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#F3F4F6] group-hover:bg-mcd-yellow group-hover:text-black flex items-center justify-center text-[#111] transition-colors">
              <ChevronRight className="w-6 h-6" />
            </div>
          </button>
        </div>
      </div>

      {/* Bottom Bar: Touch prompt */}
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between border-t border-[#E5E7EB] pt-4 z-10 text-xs text-[#6B7280]">
        <div>
          <span>McDonald's Polska • Kiosk samoobsługowy najnowszej generacji</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="font-bold text-[#111]">Dotknij wybraną opcję, aby rozpocząć zamówienie</span>
        </div>
      </div>
    </div>
  );
};
