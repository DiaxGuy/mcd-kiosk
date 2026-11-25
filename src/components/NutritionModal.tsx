import React from 'react';
import { X, Info, Flame, Wheat, Milk, Egg, AlertTriangle } from 'lucide-react';
import { MenuItem } from '../types';
import { sound } from '../utils/audio';

interface NutritionModalProps {
  item: MenuItem;
  onClose: () => void;
}

export const NutritionModal: React.FC<NutritionModalProps> = ({ item, onClose }) => {
  const kcal = item.kcal || 420;
  const kj = Math.round(kcal * 4.184);
  const fat = Math.round(kcal * 0.045);
  const satFat = Math.round(fat * 0.38);
  const carbs = Math.round(kcal * 0.105);
  const sugars = Math.round(carbs * 0.22);
  const protein = Math.round(kcal * 0.048);
  const salt = (kcal * 0.0042).toFixed(1).replace('.', ',');

  const isDrinkOrDessert = item.category === 'napoje' || item.category === 'desery' || item.category === 'mccafe';
  const allergens = isDrinkOrDessert
    ? ['Mleko (laktoza)', 'Może zawierać soję i orzechy']
    : ['Gluten (pszenica)', 'Mleko (laktoza)', 'Sezam', 'Gorczyca', 'Jaja'];

  return (
    <div className="fixed inset-0 z-[65] flex items-center justify-center p-6 bg-black/75 backdrop-blur-sm select-none animate-fadeIn">
      <div className="w-full max-w-xl bg-white border border-[#E5E7EB] rounded-3xl shadow-2xl overflow-hidden text-[#1F1F1F]">
        {/* Header */}
        <div className="p-5 bg-[#F9FAFB] border-b border-[#E5E7EB] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-mcd-yellow/20 text-[#92400E] flex items-center justify-center">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#111]">{item.name}</h3>
              <p className="text-xs text-[#6B7280] font-medium">Wartości odżywcze i alergeny</p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-[#E5E7EB] hover:bg-mcd-red hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Product Preview + Energy */}
          <div className="flex items-center gap-5 bg-[#FAFAFA] p-4 rounded-2xl border border-[#E5E7EB]">
            <img src={item.image} alt={item.name} className="w-20 h-20 object-contain shrink-0" />
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mcd-yellow/25 text-[#92400E] font-black text-xs">
                <Flame className="w-3.5 h-3.5" />
                <span>{kcal} kcal / {kj} kJ</span>
              </div>
              {item.description && <p className="text-xs text-[#4B5563] leading-relaxed">{item.description}</p>}
            </div>
          </div>

          {/* Macro Grid */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-[#6B7280] mb-2.5">
              Wartość odżywcza w 1 porcji
            </h4>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
              {[
                { label: 'Energia', value: `${kcal} kcal`, sub: `${Math.round((kcal / 2000) * 100)}% RWS` },
                { label: 'Tłuszcz', value: `${fat} g`, sub: `kwasy nas. ${satFat} g` },
                { label: 'Węglowodany', value: `${carbs} g`, sub: `cukry ${sugars} g` },
                { label: 'Białko', value: `${protein} g`, sub: `${Math.round((protein / 50) * 100)}% RWS` },
                { label: 'Sól', value: `${salt} g`, sub: 'na porcję' },
                { label: 'Błonnik', value: `${Math.max(1, Math.round(carbs * 0.08))} g`, sub: 'szac.' },
              ].map((stat) => (
                <div key={stat.label} className="p-2.5 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB]">
                  <span className="text-[10px] font-bold text-[#6B7280] block">{stat.label}</span>
                  <span className="text-sm font-black text-[#111] block mt-0.5">{stat.value}</span>
                  <span className="text-[9px] text-[#9CA3AF] block">{stat.sub}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Allergens */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
            <div className="flex items-center gap-2 text-xs font-black text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Informacja o alergenach:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {allergens.map((a) => (
                <span
                  key={a}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-amber-200 text-[11px] font-bold text-amber-950"
                >
                  {a.includes('Gluten') && <Wheat className="w-3 h-3 text-amber-600" />}
                  {a.includes('Mleko') && <Milk className="w-3 h-3 text-blue-500" />}
                  {a.includes('Jaja') && <Egg className="w-3 h-3 text-amber-500" />}
                  <span>{a}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
