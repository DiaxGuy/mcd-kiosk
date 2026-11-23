import React from 'react';
import { Utensils, ShoppingBag, Sparkles, ChevronRight } from 'lucide-react';
import { Language, OrderType } from '../types';
import { translations } from '../utils/translations';
import { sound } from '../utils/audio';

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
    <div className="relative w-screen h-screen bg-[#0F0F0F] text-white overflow-hidden flex flex-col justify-between p-8 select-none">
      {/* Background ambient lighting effects */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-mcd-red/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-mcd-yellow/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[600px] h-[600px] bg-[#1A1A1A] rounded-full blur-2xl pointer-events-none -z-10"></div>

      {/* Top Bar: Brand & Language Switcher */}
      <div className="flex items-center justify-between z-10 w-full max-w-7xl mx-auto">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 bg-mcd-red rounded-2xl flex items-center justify-center p-2 shadow-2xl">
            <svg viewBox="0 0 109 100" className="w-full h-full fill-mcd-yellow drop-shadow">
              <path d="M54.3 98.7C42 36.6 24.3 6.6 20.3 0c-4 6.6-21.7 36.6-34 98.7h18.3c8.1-42.5 15.7-72.3 15.7-72.3s7.6 29.8 15.7 72.3h18.3zm34.4 0c-12.3-62.1-30-92.1-34-98.7-4 6.6-21.7 36.6-34 98.7h18.3c8.1-42.5 15.7-72.3 15.7-72.3s7.6 29.8 15.7 72.3h18.3z" transform="translate(14, 0) scale(0.9)"/>
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-2">
              McDonald's
            </h1>
            <p className="text-sm text-[#9E9E9E] font-medium">Oficjalny Kiosk Zamówień Samoobsługowych</p>
          </div>
        </div>

        {/* Big Touch-friendly Language Flags */}
        <div className="flex items-center space-x-3 bg-[#1C1C1C]/80 backdrop-blur-md p-1.5 rounded-2xl border border-[#333333]">
          <button
            onClick={() => { sound.playTap(); setLanguage('pl'); }}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-sm flex items-center gap-2 transition-all ${
              language === 'pl'
                ? 'bg-mcd-yellow text-black shadow-lg scale-105'
                : 'text-[#A0A0A0] hover:text-white'
            }`}
          >
            <span className="text-xl">🇵🇱</span>
            <span>Polski</span>
          </button>
          <button
            onClick={() => { sound.playTap(); setLanguage('en'); }}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-sm flex items-center gap-2 transition-all ${
              language === 'en'
                ? 'bg-mcd-yellow text-black shadow-lg scale-105'
                : 'text-[#A0A0A0] hover:text-white'
            }`}
          >
            <span className="text-xl">🇬🇧</span>
            <span>English</span>
          </button>
          <button
            onClick={() => { sound.playTap(); setLanguage('ua'); }}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-sm flex items-center gap-2 transition-all ${
              language === 'ua'
                ? 'bg-mcd-yellow text-black shadow-lg scale-105'
                : 'text-[#A0A0A0] hover:text-white'
            }`}
          >
            <span className="text-xl">🇺🇦</span>
            <span>Українська</span>
          </button>
        </div>
      </div>

      {/* Main Center Content: Landscape Hero + Dining Mode Buttons */}
      <div className="flex-1 flex items-center justify-between w-full max-w-7xl mx-auto my-4 gap-12 z-10">
        {/* Left Side: Campaign Hero Visual */}
        <div className="flex-1 flex flex-col justify-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-mcd-red/90 text-white font-extrabold text-xs uppercase tracking-wider w-fit shadow-lg">
            <Sparkles className="w-4 h-4 text-mcd-yellow animate-spin" />
            <span>Królowa Zimy powróciła!</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-5xl lg:text-6xl font-black text-white tracking-tight leading-none">
              BURGER <span className="text-mcd-yellow">DRWALA</span>
            </h2>
            <p className="text-lg text-[#C4C4C4] max-w-lg font-normal leading-relaxed">
              Kultowy kotlet wołowy, gruby chrupiący ser w złocistej panierce, chrupiący bekon i sos z prażoną cebulką w puszystej bułce z posypką z sera i bekonu.
            </p>
          </div>

          {/* High-res Image of Burger Drwala */}
          <div className="relative w-full max-w-md h-56 flex items-center justify-center">
            <img
              src="https://cdn.mcdonalds.pl/uploads/20261104143818/pl10-p00001662-drwal-2026-na-www-1090x664px-burger-drwala-klasyczny.png"
              alt="Burger Drwala"
              className="max-h-56 object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.8)] transform hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>

        {/* Right Side: Dine In vs Take Away Cards */}
        <div className="w-[460px] flex flex-col space-y-5 justify-center">
          <div className="text-center mb-2">
            <span className="text-xs font-bold tracking-widest text-mcd-yellow uppercase block mb-1">
              Wybierz opcję
            </span>
            <h3 className="text-3xl font-black text-white">Gdzie zjesz posiłek?</h3>
          </div>

          {/* Eat in Button */}
          <button
            onClick={() => handleSelect('dine_in')}
            className="group relative bg-[#1E1E1E] hover:bg-[#282828] border-2 border-[#383838] hover:border-mcd-yellow rounded-3xl p-6 flex items-center justify-between text-left shadow-2xl transition-all duration-300 transform active:scale-98 hover:-translate-y-1"
          >
            <div className="flex items-center space-x-5">
              <div className="w-18 h-18 w-[72px] h-[72px] rounded-2xl bg-[#2A2A2A] border border-[#444] flex items-center justify-center text-mcd-yellow group-hover:bg-mcd-yellow group-hover:text-black transition-colors shadow-inner">
                <Utensils className="w-10 h-10" />
              </div>
              <div>
                <span className="text-2xl font-black text-white block group-hover:text-mcd-yellow transition-colors">
                  {t.eatIn}
                </span>
                <span className="text-sm text-[#A0A0A0] block mt-0.5 font-medium">
                  Zjesz wygodnie na sali w restauracji
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#2A2A2A] group-hover:bg-mcd-yellow group-hover:text-black flex items-center justify-center text-white transition-colors">
              <ChevronRight className="w-6 h-6" />
            </div>
          </button>

          {/* Take out Button */}
          <button
            onClick={() => handleSelect('take_away')}
            className="group relative bg-[#1E1E1E] hover:bg-[#282828] border-2 border-[#383838] hover:border-mcd-yellow rounded-3xl p-6 flex items-center justify-between text-left shadow-2xl transition-all duration-300 transform active:scale-98 hover:-translate-y-1"
          >
            <div className="flex items-center space-x-5">
              <div className="w-18 h-18 w-[72px] h-[72px] rounded-2xl bg-[#2A2A2A] border border-[#444] flex items-center justify-center text-mcd-yellow group-hover:bg-mcd-yellow group-hover:text-black transition-colors shadow-inner">
                <ShoppingBag className="w-10 h-10" />
              </div>
              <div>
                <span className="text-2xl font-black text-white block group-hover:text-mcd-yellow transition-colors">
                  {t.takeAway}
                </span>
                <span className="text-sm text-[#A0A0A0] block mt-0.5 font-medium">
                  Spakujemy Twoje zamówienie w torbę
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#2A2A2A] group-hover:bg-mcd-yellow group-hover:text-black flex items-center justify-center text-white transition-colors">
              <ChevronRight className="w-6 h-6" />
            </div>
          </button>
        </div>
      </div>

      {/* Bottom Bar: Touch prompt */}
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between border-t border-[#222222] pt-4 z-10 text-xs text-[#7A7A7A]">
        <div>
          <span>McDonald's Polska • Kiosk samoobsługowy najnowszej generacji</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping"></span>
          <span className="font-semibold text-white">Dotknij wybraną opcję, aby rozpocząć zamówienie</span>
        </div>
      </div>
    </div>
  );
};
