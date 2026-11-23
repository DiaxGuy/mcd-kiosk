import React, { useState, useEffect } from 'react';
import { Clock, Globe, Utensils, ShoppingBag, Eye, Sparkles } from 'lucide-react';
import { Language, OrderType } from '../types';
import { translations } from '../utils/translations';
import { sound } from '../utils/audio';

interface HeaderProps {
  orderType: OrderType;
  setOrderType: (type: OrderType) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  onReset: () => void;
  itemsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  orderType,
  setOrderType,
  language,
  setLanguage,
  onReset,
  itemsCount,
}) => {
  const t = translations[language];
  const [time, setTime] = useState('');
  const [accessibleMode, setAccessibleMode] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleOrderType = () => {
    sound.playTap();
    setOrderType(orderType === 'dine_in' ? 'take_away' : 'dine_in');
  };

  const toggleAccessible = () => {
    sound.playTap();
    setAccessibleMode(!accessibleMode);
    document.documentElement.classList.toggle('kiosk-accessible');
  };

  return (
    <header className="h-16 bg-[#181818] border-b border-[#2C2C2C] px-6 flex items-center justify-between select-none z-20 shrink-0">
      {/* Left: McDonald's Golden Arches & Kiosk badge */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => {
            sound.playTap();
            onReset();
          }}
          className="flex items-center space-x-3 group transition-transform active:scale-95"
          title="Powrót do ekranu głównego"
        >
          {/* McDonald's Iconic Golden Arches Logo */}
          <div className="w-10 h-10 bg-mcd-red rounded-lg flex items-center justify-center p-1.5 shadow-md group-hover:brightness-110">
            <svg viewBox="0 0 109 100" className="w-full h-full fill-mcd-yellow">
              <path d="M54.3 98.7C42 36.6 24.3 6.6 20.3 0c-4 6.6-21.7 36.6-34 98.7h18.3c8.1-42.5 15.7-72.3 15.7-72.3s7.6 29.8 15.7 72.3h18.3zm34.4 0c-12.3-62.1-30-92.1-34-98.7-4 6.6-21.7 36.6-34 98.7h18.3c8.1-42.5 15.7-72.3 15.7-72.3s7.6 29.8 15.7 72.3h18.3z" transform="translate(14, 0) scale(0.9)"/>
            </svg>
          </div>
          <div className="text-left">
            <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1.5">
              McDonald's <span className="text-xs px-2 py-0.5 rounded bg-mcd-yellow text-black font-black uppercase">KIOSK</span>
            </span>
            <span className="text-xs text-[#8E8E8E] block">{t.kioskId}</span>
          </div>
        </button>

        {/* Order Mode Switcher */}
        <button
          onClick={toggleOrderType}
          className="ml-4 px-4 py-1.5 rounded-full bg-[#262626] border border-[#3A3A3A] hover:border-mcd-yellow text-xs font-bold text-white flex items-center gap-2 transition-all active:scale-95"
        >
          {orderType === 'dine_in' ? (
            <>
              <Utensils className="w-3.5 h-3.5 text-mcd-yellow" />
              <span>{t.eatIn}</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-3.5 h-3.5 text-mcd-yellow" />
              <span>{t.takeAway}</span>
            </>
          )}
          <span className="text-[10px] text-mcd-yellow underline ml-1">Zmień</span>
        </button>
      </div>

      {/* Center: Promo / Season Banner */}
      <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-[#222222] border border-[#333333] text-xs text-white">
        <Sparkles className="w-3.5 h-3.5 text-mcd-yellow animate-pulse" />
        <span className="font-medium">Zimowa edycja: <strong className="text-mcd-yellow">Burger Drwala</strong> i rozgrzewające McCafé!</span>
      </div>

      {/* Right: Controls & Info */}
      <div className="flex items-center space-x-3">
        {/* Clock */}
        <div className="hidden sm:flex items-center space-x-1.5 text-sm font-semibold text-[#D1D1D1] bg-[#222222] px-3 py-1.5 rounded-lg border border-[#333333]">
          <Clock className="w-4 h-4 text-mcd-yellow" />
          <span>{time}</span>
        </div>

        {/* Accessibility Button */}
        <button
          onClick={toggleAccessible}
          className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            accessibleMode ? 'bg-mcd-yellow text-black border-mcd-yellow' : 'bg-[#222222] text-[#D1D1D1] border-[#333333] hover:border-[#555]'
          }`}
          title="Tryb ułatwienia dostępu"
        >
          <Eye className="w-4 h-4" />
          <span className="hidden md:inline">Ułatwienia</span>
        </button>

        {/* Language Selector */}
        <div className="flex items-center bg-[#222222] rounded-lg border border-[#333333] p-0.5">
          <button
            onClick={() => { sound.playTap(); setLanguage('pl'); }}
            className={`px-2.5 py-1 text-xs font-bold rounded flex items-center gap-1 transition-colors ${
              language === 'pl' ? 'bg-mcd-yellow text-black' : 'text-[#A0A0A0] hover:text-white'
            }`}
          >
            🇵🇱 PL
          </button>
          <button
            onClick={() => { sound.playTap(); setLanguage('en'); }}
            className={`px-2.5 py-1 text-xs font-bold rounded flex items-center gap-1 transition-colors ${
              language === 'en' ? 'bg-mcd-yellow text-black' : 'text-[#A0A0A0] hover:text-white'
            }`}
          >
            🇬🇧 EN
          </button>
          <button
            onClick={() => { sound.playTap(); setLanguage('ua'); }}
            className={`px-2.5 py-1 text-xs font-bold rounded flex items-center gap-1 transition-colors ${
              language === 'ua' ? 'bg-mcd-yellow text-black' : 'text-[#A0A0A0] hover:text-white'
            }`}
          >
            🇺🇦 UA
          </button>
        </div>
      </div>
    </header>
  );
};
