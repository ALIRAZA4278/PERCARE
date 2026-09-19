'use client';

import {
  BadgeCheck,
  Search,
  ShoppingBag,
  ShoppingCart,
  SlidersHorizontal,
  Star,
  Store,
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import FilterModal from '@/components/FilterModal';
import FeatureDisabled from '@/components/FeatureDisabled';
import { useCart } from '@/context/CartContext';
import { useFeatureFlags } from '@/context/FeatureFlagsContext';
import { supabase } from '@/lib/supabase';

const CATEGORIES = [
  'All',
  'Food',
  'Accessories',
  'Hygiene',
  'Medicine',
  'Toys',
  'Clothes',
  'Grooming',
  'Bowls',
  'Houses',
  'Collars',
  'Beds',
];

const DEFAULT_FILTERS = {
  sortBy: 'Relevance',
  petType: 'All Pets',
  recommendFor: 'None',
  priceMin: 0,
  priceMax: 100000,
};

function ShopContent() {
  const searchParams = useSearchParams();
  const { marketplaceEnabled, loading: flagsLoading } = useFeatureFlags();
  const { addToCart, getCartCount } = useCart();

  const [activeCategory, setActiveCategory] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') ?? '');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const cartCount = getCartCount();

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase
        .from('products')
        .select(
          '*, category:product_categories(name, slug), store:stores(id, name, is_approved, owner:profiles(full_name))'
        )
        .eq('is_active', true)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });
      setProducts(data || []);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const filtersActive =
    filters.sortBy !== DEFAULT_FILTERS.sortBy ||
    filters.petType !== DEFAULT_FILTERS.petType ||
    filters.recommendFor !== DEFAULT_FILTERS.recommendFor ||
    filters.priceMin > DEFAULT_FILTERS.priceMin ||
    filters.priceMax < DEFAULT_FILTERS.priceMax;

  const displayProducts = products
    .filter((p) => {
      // Category now matches the joined product_categories row rather than
      // fuzzy-matching the product name.
      const matchesCategory =
        activeCategory === 'All' ||
        p.category?.name?.toLowerCase() === activeCategory.toLowerCase() ||
        p.category?.slug?.toLowerCase() === activeCategory.toLowerCase();
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q || p.name.toLowerCase().includes(q) || (p.brand || '').toLowerCase().includes(q);
      const matchesPrice = p.price >= filters.priceMin && p.price <= filters.priceMax;
      return matchesCategory && matchesSearch && matchesPrice;
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case 'Price: Low to High':
          return a.price - b.price;
        case 'Price: High to Low':
          return b.price - a.price;
        case 'Rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'Most Reviews':
          return (b.total_reviews || 0) - (a.total_reviews || 0);
        default:
          return 0;
      }
    });

  if (!flagsLoading && !marketplaceEnabled) {
    return <FeatureDisabled title="Marketplace" />;
  }

  return (
    <div className="min-h-screen overflow-x-hidden">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="px-4 md:px-8 py-4 max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-foreground">Pet Shop</h1>
            <Link
              href="/cart"
              className="relative h-10 w-10 rounded-xl bg-card border border-border flex items-center justify-center btn-press transition-expo hover:bg-muted"
            >
              <ShoppingCart className="h-5 w-5 text-foreground" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-card border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-expo"
              />
            </div>
            <button
              onClick={() => setIsFilterOpen(true)}
              aria-label="Filters and sort"
              className={`h-11 w-11 rounded-xl border flex items-center justify-center btn-press transition-expo ${
                filtersActive ? 'bg-primary border-primary' : 'bg-card border-border hover:bg-muted'
              }`}
            >
              <SlidersHorizontal
                className={`h-4 w-4 ${filtersActive ? 'text-primary-foreground' : 'text-foreground'}`}
              />
            </button>
          </div>

          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 -mx-4 px-4 no-scrollbar">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`shrink-0 h-8 px-4 rounded-full text-xs font-medium btn-press transition-expo ${
                  category === activeCategory
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-4 max-w-6xl mx-auto">
        {filtersActive && (
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="text-xs text-muted-foreground">Filters:</span>
            {filters.sortBy !== DEFAULT_FILTERS.sortBy && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                {filters.sortBy}
              </span>
            )}
            {filters.petType !== DEFAULT_FILTERS.petType && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                {filters.petType}
              </span>
            )}
            <button
              onClick={() => setFilters(DEFAULT_FILTERS)}
              className="text-[10px] text-emergency font-medium btn-press"
            >
              Clear all
            </button>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-12">Loading products...</p>
        ) : displayProducts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">No products found.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {displayProducts.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="block rounded-2xl bg-card shadow-card hover:shadow-card-hover transition-all duration-300 btn-press cursor-pointer overflow-hidden group"
              >
                <div className="aspect-square bg-muted flex items-center justify-center">
                  {product.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ShoppingBag className="h-8 w-8 text-muted-foreground/40" />
                  )}
                </div>

                <div className="p-3">
                  {product.brand && (
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                      {product.brand}
                    </p>
                  )}
                  <h3 className="text-sm font-semibold text-foreground mt-0.5 line-clamp-2 leading-tight">
                    {product.name}
                  </h3>

                  <span className="flex items-center gap-1 mt-1.5">
                    <Store className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span className="text-[10px] text-muted-foreground truncate">
                      {product.store?.name || 'Store'}
                    </span>
                    {product.store?.is_approved && (
                      <BadgeCheck className="h-3 w-3 text-primary shrink-0" />
                    )}
                  </span>

                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-3 w-3 text-amber fill-amber" />
                    <span className="text-xs font-medium tabular-nums">{product.rating || 0}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      ({product.total_reviews || 0})
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-bold text-foreground tabular-nums">
                      Rs. {product.price.toLocaleString()}
                    </span>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        addToCart({
                          id: product.id,
                          name: product.name,
                          price: product.price,
                          store: product.store?.name,
                        });
                      }}
                      className="h-7 px-2.5 rounded-lg bg-primary text-primary-foreground text-[10px] font-semibold inline-flex items-center btn-press transition-expo hover:opacity-90"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApplyFilters={(f) => setFilters(f)}
      />
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={null}>
      <ShopContent />
    </Suspense>
  );
}
