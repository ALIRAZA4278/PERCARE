'use client';

import { X } from 'lucide-react';
import { useState } from 'react';

export default function FilterModal({ isOpen, onClose, onApplyFilters }) {
  const [sortBy, setSortBy] = useState('Relevance');
  const [petType, setPetType] = useState('All Pets');
  const [recommendFor, setRecommendFor] = useState('None');
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(10000);

  const sortOptions = ['Relevance', 'Price: Low to High', 'Price: High to Low', 'Rating', 'Most Reviews'];
  const petTypes = ['All Pets', 'Dog', 'Cat', 'Bird'];
  const pets = ['None', 'Buddy', 'Whiskers', 'Coco'];

  const handleClear = () => { setSortBy('Relevance'); setPetType('All Pets'); setRecommendFor('None'); setPriceMin(0); setPriceMax(10000); };
  const handleApply = () => { onApplyFilters({ sortBy, petType, recommendFor, priceMin, priceMax }); onClose(); };

  if (!isOpen) return null;

  const chip = (active) => `px-3 py-2 sm:px-4 rounded-lg text-xs sm:text-sm font-medium transition-colors ${active ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
        <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-xl shadow-2xl max-h-[90vh] sm:max-h-[85vh] flex flex-col">
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Filters & Sort</h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors"><X size={20} className="text-gray-700" /></button>
          </div>
          <div className="p-4 sm:p-6 overflow-y-auto flex-1">
            <div className="mb-5 sm:mb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 sm:mb-3">Sort By</h3>
              <div className="flex flex-wrap gap-2">{sortOptions.map((o) => (<button key={o} onClick={() => setSortBy(o)} className={chip(sortBy === o)}>{o}</button>))}</div>
            </div>
            <div className="mb-5 sm:mb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 sm:mb-3">Pet Type</h3>
              <div className="flex flex-wrap gap-2">{petTypes.map((t) => (<button key={t} onClick={() => setPetType(t)} className={chip(petType === t)}>{t}</button>))}</div>
            </div>
            <div className="mb-5 sm:mb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 sm:mb-3">Recommend for My Pet</h3>
              <div className="flex flex-wrap gap-2">{pets.map((p) => (<button key={p} onClick={() => setRecommendFor(p)} className={chip(recommendFor === p)}>{p}</button>))}</div>
            </div>
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 sm:mb-3">Price Range</h3>
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <input type="number" value={priceMin} onChange={(e) => setPriceMin(Number(e.target.value))} placeholder="0" className="flex-1 px-3 py-2 sm:px-4 sm:py-3 rounded-lg border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-gray-900 font-medium text-sm sm:text-base" />
                <span className="text-gray-400">—</span>
                <input type="number" value={priceMax} onChange={(e) => setPriceMax(Number(e.target.value))} placeholder="10000" className="flex-1 px-3 py-2 sm:px-4 sm:py-3 rounded-lg border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-gray-900 font-medium text-sm sm:text-base" />
              </div>
              <div className="relative h-2 mb-2">
                <div className="absolute w-full h-2 bg-gray-200 rounded-full" />
                <div className="absolute h-2 bg-blue-600 rounded-full" style={{ left: `${(priceMin / 10000) * 100}%`, right: `${100 - (priceMax / 10000) * 100}%` }} />
                <input type="range" min="0" max="10000" step="100" value={priceMin} onChange={(e) => setPriceMin(Number(e.target.value))} className="range-slider" />
                <input type="range" min="0" max="10000" step="100" value={priceMax} onChange={(e) => setPriceMax(Number(e.target.value))} className="range-slider" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 p-4 sm:p-6 border-t border-gray-200 flex-shrink-0">
            <button onClick={handleClear} className="flex-1 px-4 py-2.5 sm:px-6 sm:py-3 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors text-sm sm:text-base">Clear</button>
            <button onClick={handleApply} className="flex-1 px-4 py-2.5 sm:px-6 sm:py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors text-sm sm:text-base">Apply Filters</button>
          </div>
        </div>
      </div>
      <style jsx>{`
        .range-slider { position: absolute; width: 100%; height: 8px; background: transparent; pointer-events: none; }
        .range-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 20px; height: 20px; border-radius: 50%; background: #3B82F6; cursor: pointer; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.2); pointer-events: all; position: relative; z-index: 10; }
        .range-slider::-moz-range-thumb { width: 20px; height: 20px; border-radius: 50%; background: #3B82F6; cursor: pointer; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.2); pointer-events: all; }
        .range-slider::-webkit-slider-runnable-track { background: transparent; }
        .range-slider::-moz-range-track { background: transparent; }
      `}</style>
    </>
  );
}
