'use client';

import { Search, ShoppingCart, SlidersHorizontal, Store, Star, BadgeCheck, ShoppingBag } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import FilterModal from '@/components/FilterModal';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';

export default function MarketplacePage() {
  const { addToCart, getCartCount } = useCart();
  const [activeCategory, setActiveCategory] = useState('All');
  const cartCount = getCartCount();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    sortBy: 'Relevance',
    petType: 'All Pets',
    recommendFor: 'None',
    priceMin: 0,
    priceMax: 100000,
  });

  const categories = [
    { id: 'All', label: 'All' },
    { id: 'Food', label: 'Food' },
    { id: 'Accessories', label: 'Accessories' },
    { id: 'Hygiene', label: 'Hygiene' },
    { id: 'Medicine', label: 'Medicine' },
    { id: 'Toys', label: 'Toys' },
    { id: 'Clothes', label: 'Clothes' },
    { id: 'Grooming', label: 'Grooming' },
    { id: 'Bowls', label: 'Bowls' },
    { id: 'Houses', label: 'Houses' },
    { id: 'Collars', label: 'Collars' },
    { id: 'Beds', label: 'Beds' },
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*, store:stores(name, owner:profiles(full_name), is_approved)')
      .eq('is_active', true)
      .eq('is_approved', true)
      .order('created_at', { ascending: false });
    setProducts(data || []);
    setLoading(false);
  };

  const getFilteredProducts = () => {
    let filtered = [...products];
    if (activeCategory !== 'All') {
      filtered = filtered.filter(p => {
        const catName = p.category_id ? '' : '';
        return p.name?.toLowerCase().includes(activeCategory.toLowerCase()) || p.brand?.toLowerCase().includes(activeCategory.toLowerCase());
      });
    }
    if (searchQuery.trim()) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    filtered = filtered.filter(p => p.price >= filters.priceMin && p.price <= filters.priceMax);
    switch (filters.sortBy) {
      case 'Price: Low to High': filtered.sort((a, b) => a.price - b.price); break;
      case 'Price: High to Low': filtered.sort((a, b) => b.price - a.price); break;
      case 'Rating': filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
      default: break;
    }
    return filtered;
  };

  const displayProducts = getFilteredProducts();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Pet Shop</h1>
            <Link href="/cart" className="relative">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ShoppingCart size={22} className="text-gray-700" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">{cartCount}</span>
                )}
              </button>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-2.5 rounded-lg border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-gray-900 text-sm" />
            </div>
            <button onClick={() => setIsFilterOpen(true)} className="p-2 sm:p-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex-shrink-0">
              <SlidersHorizontal size={18} className="text-gray-700" />
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <button key={category.id} onClick={() => setActiveCategory(category.id)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm whitespace-nowrap transition-colors flex-shrink-0 ${
                  activeCategory === category.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}>
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {loading ? (
          <div className="text-center py-16"><p className="text-gray-500">Loading products...</p></div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {displayProducts.map((product) => (
              <Link key={product.id} href={`/marketplace/${product.id}`}
                className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all group">
                <div className="aspect-square bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <ShoppingBag size={48} className="text-gray-300" />
                  )}
                </div>
                <div className="p-3 sm:p-4">
                  {product.brand && (
                    <p className="text-[10px] sm:text-xs font-semibold text-blue-600 mb-1 uppercase tracking-wide">{product.brand}</p>
                  )}
                  <h3 className="font-semibold text-gray-900 mb-1.5 sm:mb-2 text-xs sm:text-sm leading-tight line-clamp-2">{product.name}</h3>
                  <div className="flex items-center gap-1 mb-1.5 sm:mb-2">
                    <Store size={10} className="text-gray-400" />
                    <span className="text-[10px] sm:text-xs text-gray-600 truncate">{product.store?.name || 'Store'}</span>
                    {product.store?.is_approved && <BadgeCheck size={12} className="text-blue-600 flex-shrink-0" />}
                  </div>
                  <div className="flex items-center gap-1 mb-2 sm:mb-3">
                    <Star size={12} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-xs sm:text-sm font-semibold text-gray-900">{product.rating || 0}</span>
                    <span className="text-[10px] sm:text-xs text-gray-500">({product.total_reviews || 0})</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="text-sm sm:text-lg font-bold text-gray-900">Rs. {product.price.toLocaleString()}</span>
                      {product.sale_price && (
                        <span className="text-xs text-gray-400 line-through ml-1">Rs. {product.sale_price.toLocaleString()}</span>
                      )}
                    </div>
                    <button onClick={(e) => { e.preventDefault(); addToCart({ id: product.id, name: product.name, price: product.price, store: product.store?.name }); }}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium px-3 sm:px-5 py-1.5 sm:py-2 rounded-lg transition-colors flex-shrink-0">
                      Add
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && displayProducts.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🛍️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">Try changing your search or filters.</p>
          </div>
        )}
      </div>

      <FilterModal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} onApplyFilters={(f) => setFilters(f)} />
    </div>
  );
}
