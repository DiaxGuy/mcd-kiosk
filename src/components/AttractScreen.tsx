import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Language, OrderType } from '../types';
import { translations } from '../utils/translations';
import { sound } from '../utils/audio';
import { OfficialLogo } from './OfficialLogo';

interface AttractScreenProps {
  onStart: (orderType: OrderType) => void;
  onOpenBoard?: () => void;
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
    <div className="w-screen h-screen bg-[#FFFFFF] text-[#111111] overflow-hidden flex flex-col select-none">
      {/* TOP POSTER AREA (Authentic McDonald's Forest Green Campaign Screen) */}
      <div className="relative flex-1 bg-[#004F25] text-white flex flex-col justify-between px-10 py-7 overflow-hidden">
        {/* Top Row: Official Golden Arches + Language Pills */}
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center space-x-4">
            <OfficialLogo className="w-14 h-12" />
            <div className="h-8 w-px bg-white/20" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">
              Restauracja #04 • Zamówienia samoobsługowe
            </span>
          </div>

          {/* Language Selector */}
          <div className="flex items-center space-x-1.5 bg-black/25 p-1 rounded-full border border-white/15">
            {[
              { code: 'pl' as Language, flag: '🇵🇱', label: 'Polski' },
              { code: 'en' as Language, flag: '🇬🇧', label: 'English' },
              { code: 'ua' as Language, flag: '🇺🇦', label: 'Українська' },
            ].map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  sound.playTap();
                  setLanguage(lang.code);
                }}
                className={`px-4 py-1.5 rounded-full font-bold text-xs flex items-center gap-1.5 transition-colors ${
                  language === lang.code
                    ? 'bg-[#FFBC0D] text-black font-black'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Center Hero Poster: Bold Typography + Massive Real Food Packshots */}
        <div className="flex-1 flex items-center justify-between max-w-6xl w-full mx-auto gap-8 z-10 my-2">
          <div className="flex-1 space-y-4">
            <div className="inline-block px-3.5 py-1 bg-[#DB0007] text-white font-black text-xs uppercase tracking-widest rounded">
              Edycja Limitowana • Zima
            </div>

            <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-[0.95] uppercase">
              Królowa Zimy
              <span className="block text-[#FFBC0D] mt-1">Burger Drwala</span>
            </h1>

            <p className="text-base lg:text-lg text-white/85 max-w-md font-medium leading-snug">
              Soczysta wołowina, chrupiący placek serowy, wędzony bekon i kultowy sos z prażoną cebulką.
            </p>

            <div className="pt-2 flex items-center gap-3">
              <span className="px-4 py-2 bg-white text-[#111111] font-black text-lg rounded-lg">
                od 26,90 zł
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-[#FFBC0D]">
                {t.touchToStart} ↓
              </span>
            </div>
          </div>

          {/* Right Poster Packshots */}
          <div className="relative flex-1 flex items-center justify-center h-full max-h-[340px]">
            <img
              src="https://cdn.mcdonalds.pl/uploads/20261104150358/pl10-p00001662-drwal-2026-na-www-1090x664px-frytki-zakrecone-z-sosem.png"
              alt="Frytki Zakręcone"
              className="absolute -right-4 bottom-2 h-48 lg:h-56 object-contain opacity-95"
            />
            <img
              src="https://cdn.mcdonalds.pl/uploads/20261104143818/pl10-p00001662-drwal-2026-na-www-1090x664px-burger-drwala-klasyczny.png"
              alt="Burger Drwala"
              className="relative z-10 h-60 lg:h-72 object-contain drop-shadow-[0_18px_24px_rgba(0,0,0,0.45)]"
            />
          </div>
        </div>

        {/* Bottom Subtle Brand Strip */}
        <div className="flex items-center justify-between text-[11px] text-white/60 font-semibold z-10">
          <span>McDonald&apos;s Polska • i&apos;m lovin&apos; it</span>
          <span>Obsługa dotykowa 24/7</span>
        </div>
      </div>

      {/* BOTTOM ACTION BAR (Snow White Official EOTF Dine-In vs Take-Away Panel) */}
      <div className="bg-white border-t-4 border-[#FFBC0D] px-10 py-6 shrink-0">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#6B7280] block">
              Rozpocznij zamówienie
            </span>
            <h2 className="text-2xl lg:text-3xl font-black text-[#111111] tracking-tight">
              Gdzie zjesz posiłek?
            </h2>
          </div>

          <div className="flex-1 max-w-3xl grid grid-cols-2 gap-5 w-full">
            {/* Na miejscu (Tray Illustration) */}
            <button
              onClick={() => handleSelect('dine_in')}
              className="group bg-white hover:bg-[#FFFDF5] border-2 border-[#D1D5DB] hover:border-[#FFBC0D] rounded-xl px-6 py-4 flex items-center justify-between transition-all active:scale-[0.98]"
            >
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 64 64" className="w-14 h-14">
                    <rect x="6" y="42" width="52" height="8" rx="3" fill="#292929" />
                    <rect x="10" y="40" width="44" height="3" rx="1" fill="#FFBC0D" />
                    <path d="M16 40 L20 20 L34 20 L38 40 Z" fill="#DB0007" />
                    <rect x="22" y="13" width="3" height="8" rx="1" fill="#FFBC0D" />
                    <rect x="26" y="11" width="3" height="10" rx="1" fill="#FFBC0D" />
                    <rect x="30" y="14" width="3" height="7" rx="1" fill="#FFBC0D" />
                    <circle cx="44" cy="33" r="7" fill="#D97706" />
                    <rect x="37" y="32" width="14" height="3" rx="1" fill="#16A34A" />
                  </svg>
                </div>
                <div className="text-left">
                  <span className="text-xl lg:text-2xl font-black text-[#111111] block">
                    {t.eatIn}
                  </span>
                  <span className="text-xs text-[#6B7280] font-semibold block">
                    Podamy na tacy lub do stolika
                  </span>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-[#9CA3AF] group-hover:text-[#111111] group-hover:translate-x-1 transition-all" />
            </button>

            {/* Na wynos (Takeaway Bag Illustration) */}
            <button
              onClick={() => handleSelect('take_away')}
              className="group bg-white hover:bg-[#FFFDF5] border-2 border-[#D1D5DB] hover:border-[#FFBC0D] rounded-xl px-6 py-4 flex items-center justify-between transition-all active:scale-[0.98]"
            >
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 64 64" className="w-14 h-14">
                    <path d="M22 18 C22 10, 42 10, 42 18" fill="none" stroke="#92400E" strokeWidth="3" strokeLinecap="round" />
                    <rect x="14" y="18" width="36" height="38" rx="3" fill="#D99B52" stroke="#B47B38" strokeWidth="2" />
                    <path d="M24 31 C24 25, 29 25, 29 31 L29 41 M29 31 C29 25, 34 25, 34 31 L34 41 M34 31 C34 25, 39 25, 39 31 L39 41" fill="none" stroke="#FFBC0D" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="text-left">
                  <span className="text-xl lg:text-2xl font-black text-[#111111] block">
                    {t.takeAway}
                  </span>
                  <span className="text-xs text-[#6B7280] font-semibold block">
                    Spakujemy wygodnie w torbę
                  </span>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-[#9CA3AF] group-hover:text-[#111111] group-hover:translate-x-1 transition-all" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
