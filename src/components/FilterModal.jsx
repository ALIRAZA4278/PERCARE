'use client';

import { X } from 'lucide-react';
import { useState } from 'react';

const SORT_OPTIONS = [
  'Relevance',
  'Price: Low to High',
  'Price: High to Low',
  'Rating',
  'Most Reviews',
];
const PET_TYPES = ['All Pets', 'Dog', 'Cat', 'Bird'];
const PETS = ['None', 'Buddy', 'Whiskers', 'Coco'];

const chip = (active) =>
  `h-8 px-3 rounded-full text-xs font-medium btn-press transition-expo ${
    active ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground hover:bg-muted-foreground/10'
  }`;

export default function FilterModal({ isOpen, onClose, onApplyFilters }) {
  const [sortBy, setSortBy] = useState('Relevance');
  const [petType, setPetType] = useState('All Pets');
  const [recommendFor, setRecommendFor] = useState('None');
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(100000);

  if (!isOpen) return null;

  const handleClear = () => {
    setSortBy('Relevance');
    setPetType('All Pets');
    setRecommendFor('None');
    setPriceMin(0);
    setPriceMax(100000);
  };

  const handleApply = () => {
    onApplyFilters({ sortBy, petType, recommendFor, priceMin, priceMax });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-card rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md max-h-[85vh] overflow-y-auto shadow-elevated">
        <div className="sticky top-0 bg-card z-10 p-4 border-b border-border flex items-center justify-between rounded-t-3xl sm:rounded-t-2xl">
          <h2 className="text-base font-bold text-foreground">Filters &amp; Sort</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center btn-press"
          >
            <X className="h-4 w-4 text-foreground" />
          </button>
        </div>

        <div className="p-4 space-y-5">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Sort By
            </p>
            <div className="flex flex-wrap gap-2">
              {SORT_OPTIONS.map((option) => (
                <button key={option} onClick={() => setSortBy(option)} className={chip(sortBy === option)}>
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Pet Type
            </p>
            <div className="flex flex-wrap gap-2">
              {PET_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setPetType(type);
                    setRecommendFor('None');
                  }}
                  className={chip(petType === type && recommendFor === 'None')}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Recommend for My Pet
            </p>
            <div className="flex flex-wrap gap-2">
              {PETS.map((pet) => (
                <button
                  key={pet}
                  onClick={() => {
                    setRecommendFor(pet);
                    if (pet !== 'None') setPetType('All Pets');
                  }}
                  className={
                    pet === 'None'
                      ? `h-8 px-3 rounded-full text-xs font-medium btn-press ${
                          recommendFor === 'None'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground'
                        }`
                      : `h-8 px-3 rounded-full text-xs font-medium btn-press ${
                          recommendFor === pet ? 'bg-amber text-white' : 'bg-muted text-foreground'
                        }`
                  }
                >
                  {pet}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Price Range
            </p>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={priceMin}
                onChange={(e) => setPriceMin(Number(e.target.value))}
                placeholder="Min"
                className="w-full h-10 px-3 rounded-xl bg-muted border border-border text-sm text-foreground focus:outline-none"
              />
              <span className="text-muted-foreground">–</span>
              <input
                type="number"
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                placeholder="Max"
                className="w-full h-10 px-3 rounded-xl bg-muted border border-border text-sm text-foreground focus:outline-none"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                handleClear();
                onClose();
              }}
              className="flex-1 h-11 rounded-xl border border-border text-sm font-semibold text-foreground btn-press hover:bg-muted"
            >
              Clear
            </button>
            <button
              onClick={handleApply}
              className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground text-sm font-semibold btn-press"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
