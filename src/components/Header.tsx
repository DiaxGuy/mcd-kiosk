import React, { useState, useEffect } from 'react';
import { Clock, Globe, Utensils, ShoppingBag, Accessibility } from 'lucide-react';
import { Language, OrderType } from '../types';
import { translations } from '../utils/translations';
import { sound } from '../utils/audio';
import { OfficialLogo } from './OfficialLogo';

interface HeaderProps {
  orderType: OrderType;
  setOrderType: (type: OrderType) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  onReset: () => void;
  currentCategoryTitle: string;
}

export const Header: React.FC<HeaderProps> = ({
  orderType,
  setOrderType,
  language,
  setLanguage,
  onReset,
  currentCategoryTitle,
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
    <header className="h-20 bg-white border-b border-[#E5E7EB] px-8 flex items-center justify-between select-none z-20 shrink-0 shadow-sm">
      {/* Left: Official McDonald's Golden Arches & Category Header (as in photo) */}
      <div className="flex items-center space-x-6">
        <button
          onClick={() => {
            sound.playTap();
            onReset();
          }}
          className="flex items-center space-x-3 transition-transform active:scale-95 group"
          title="Powrót do ekranu startowego"
        >
          {/* Official Golden Arches "M" */}
          <OfficialLogo className="w-12 h-11 text-mcd-yellow filter drop-shadow-sm group-hover:scale-105 transition-transform" />
        </button>

        <div className="border-l border-[#E5E7EB] pl-6 py-1">
          <h1 className="text-2xl font-black text-[#1F1F1F] tracking-tight leading-tight">
            {currentCategoryTitle}
          </h1>
          <p className="text-xs text-[#6B7280] font-medium">
            Wybierz swoje ulubione pozycje z menu poniżej
          </p>
        </div>
      </div>

      {/* Right: Controls (Dining type, Language, Accessibility, Clock) */}
      <div className="flex items-center space-x-3">
        {/* Dining Mode Button */}
        <button
          onClick={toggleOrderType}
          className="px-4 py-2 rounded-full bg-[#F3F4F6] hover:bg-[#E5E7EB] border border-[#D1D5DB] text-xs font-bold text-[#1F1F1F] flex items-center gap-2 transition-all active:scale-95"
        >
          {orderType === 'dine_in' ? (
            <>
              <Utensils className="w-4 h-4 text-mcd-yellow" />
              <span>{t.eatIn}</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4 text-mcd-yellow" />
              <span>{t.takeAway}</span>
            </>
          )}
          <span className="text-[10px] text-[#4B5563] underline ml-1">Zmień</span>
        </button>

        {/* Accessibility Button (Icon with circle as on photo) */}
        <button
          onClick={toggleAccessible}
          className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors ${
            accessibleMode
              ? 'bg-mcd-yellow text-black border-mcd-yellow shadow-md'
              : 'bg-[#F3F4F6] text-[#4B5563] border-[#D1D5DB] hover:bg-[#E5E7EB]'
          }`}
          title="Ułatwienia dostępu"
        >
          <Accessibility className="w-5 h-5 stroke-[2.2]" />
        </button>

        {/* Language Selector */}
        <div className="flex items-center bg-[#F3F4F6] rounded-full border border-[#D1D5DB] p-1">
          <button
            onClick={() => { sound.playTap(); setLanguage('pl'); }}
            className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${
              language === 'pl' ? 'bg-mcd-yellow text-black shadow-sm' : 'text-[#6B7280] hover:text-[#111]'
            }`}
          >
            🇵🇱 PL
          </button>
          <button
            onClick={() => { sound.playTap(); setLanguage('en'); }}
            className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${
              language === 'en' ? 'bg-mcd-yellow text-black shadow-sm' : 'text-[#6B7280] hover:text-[#111]'
            }`}
          >
            🇬🇧 EN
          </button>
          <button
            onClick={() => { sound.playTap(); setLanguage('ua'); }}
            className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${
              language === 'ua' ? 'bg-mcd-yellow text-black shadow-sm' : 'text-[#6B7280] hover:text-[#111]'
            }`}
          >
            🇺🇦 UA
          </button>
        </div>

        {/* Clock */}
        <div className="hidden sm:flex items-center space-x-1.5 text-xs font-bold text-[#4B5563] bg-[#F3F4F6] px-3.5 py-2 rounded-full border border-[#D1D5DB]">
          <Clock className="w-3.5 h-3.5 text-mcd-yellow" />
          <span>{time}</span>
        </div>
      </div>
    </header>
  );
};
