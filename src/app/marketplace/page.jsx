'use client';

import { Search, ShoppingCart, SlidersHorizontal, Store, Star, BadgeCheck, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import FilterModal from '@/components/FilterModal';
import { useCart } from '@/context/CartContext';

export default function MarketplacePage() {
  const { addToCart, getCartCount } = useCart();
  const [activeCategory, setActiveCategory] = useState('All');
  const cartCount = getCartCount();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    sortBy: 'Relevance',
    petType: 'All Pets',
    recommendFor: 'None',
    priceMin: 0,
    priceMax: 10000,
  });

  const categories = [
    { id: 'All', label: 'All', type: null },
    { id: 'Food', label: 'Food', type: 'Food' },
    { id: 'Accessories', label: 'Accessories', type: 'Accessories' },
    { id: 'Hygiene', label: 'Hygiene', type: 'Hygiene' },
    { id: 'Medicine', label: 'Medicine', type: 'Medicine' },
    { id: 'Toys', label: 'Toys', type: 'Toys' },
    { id: 'Clothes', label: 'Clothes', type: 'Clothes' },
    { id: 'Grooming', label: 'Grooming', type: 'Grooming' },
    { id: 'Bowls', label: 'Bowls', type: 'Bowls' },
    { id: 'Houses', label: 'Houses', type: 'Houses' },
    { id: 'Collars', label: 'Collars', type: 'Collars' },
    { id: 'Beds', label: 'Beds', type: 'Beds' },
  ];

  const allProducts = [
    {
      id: 1,
      category: 'PETNUTRA',
      name: 'Premium Dog Food - Chicken',
      seller: 'PetCare by Saad',
      verified: true,
      rating: 4.8,
      reviews: 45,
      price: 2500,
      petType: 'Dog',
      categoryType: 'Food',
    },
    {
      id: 2,
      category: 'FURCARE',
      name: 'Cat Grooming Brush',
      seller: 'FurCare by Saad',
      verified: true,
      rating: 4.6,
      reviews: 32,
      price: 850,
      petType: 'Cat',
      categoryType: 'Grooming',
    },
    {
      id: 3,
      category: 'AVIHOME',
      name: 'Bird Cage - Large',
      seller: 'FurCare by Saad',
      verified: true,
      rating: 4.9,
      reviews: 18,
      price: 4200,
      petType: 'Bird',
      categoryType: 'Houses',
    },
    {
      id: 4,
      category: 'CLEANPAWS',
      name: 'Flea & Tick Shampoo',
      seller: 'PetCare Clinic Store',
      verified: true,
      rating: 4.5,
      reviews: 67,
      price: 650,
      petType: 'Dog',
      categoryType: 'Hygiene',
    },
    {
      id: 5,
      category: 'PLAYPET',
      name: 'Chew Toys Pack (5)',
      seller: 'FurCare by Saad',
      verified: true,
      rating: 4.7,
      reviews: 89,
      price: 1200,
      petType: 'Dog',
      categoryType: 'Toys',
    },
    {
      id: 6,
      category: 'PETNUTRA',
      name: 'Kitten Milk Replacer',
      seller: 'PetNutra Official',
      verified: true,
      rating: 4.4,
      reviews: 23,
      price: 950,
      petType: 'Cat',
      categoryType: 'Food',
    },
    {
      id: 7,
      category: 'PETSTYLE',
      name: 'Dog Collar - Leather',
      seller: 'PetCare by Saad',
      verified: true,
      rating: 4.8,
      reviews: 34,
      price: 1100,
      petType: 'Dog',
      categoryType: 'Collars',
    },
    {
      id: 8,
      category: 'COMFYPAWS',
      name: 'Cat Bed - Premium',
      seller: 'FurNutra Official',
      verified: true,
      rating: 4.8,
      reviews: 56,
      price: 3200,
      petType: 'Cat',
      categoryType: 'Beds',
    },
    {
      id: 9,
      category: 'PETESSENTIALS',
      name: 'Steel Feeding Bowl Set',
      seller: 'PetCare Clinic Store',
      verified: true,
      rating: 4.3,
      reviews: 41,
      price: 750,
      petType: 'Dog',
      categoryType: 'Bowls',
    },
    {
      id: 10,
      category: 'PETSTYLE',
      name: 'Dog Raincoat - Medium',
      seller: 'FurCare by Saad',
      verified: true,
      rating: 4.5,
      reviews: 29,
      price: 1800,
      petType: 'Dog',
      categoryType: 'Clothes',
    },
  ];

  // Filter and sort products
  const getFilteredProducts = () => {
    let filtered = [...allProducts];

    // Filter by category
    const selectedCategory = categories.find(c => c.id === activeCategory);
    if (selectedCategory && selectedCategory.type) {
      filtered = filtered.filter(p => p.categoryType === selectedCategory.type);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by pet type
    if (filters.petType !== 'All Pets') {
      filtered = filtered.filter(p => p.petType === filters.petType);
    }

    // Filter by price range
    filtered = filtered.filter(p => p.price >= filters.priceMin && p.price <= filters.priceMax);

    // Sort
    switch (filters.sortBy) {
      case 'Price: Low to High':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'Price: High to Low':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'Rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'Most Reviews':
        filtered.sort((a, b) => b.reviews - a.reviews);
        break;
      default:
        // Relevance - keep default order
        break;
    }

    return filtered;
  };

  const products = getFilteredProducts();

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Pet Shop</h1>
            
            {/* Cart Icon */}
            <Link href="/cart" className="relative">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ShoppingCart size={22} className="text-gray-700 sm:w-6 sm:h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </Link>
          </div>

          {/* Search and Filter */}
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-2.5 rounded-lg border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-gray-900 text-sm"
              />
            </div>
            <button 
              onClick={() => setIsFilterOpen(true)}
              className="p-2 sm:p-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex-shrink-0"
            >
              <SlidersHorizontal size={18} className="text-gray-700 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm whitespace-nowrap transition-colors flex-shrink-0 ${
                  activeCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/marketplace/${product.id}`}
              className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all group"
            >
              {/* Product Image Placeholder */}
              <div className="aspect-square bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                <ShoppingBag size={48} className="text-gray-300 sm:w-16 sm:h-16" />
              </div>

              {/* Product Info */}
              <div className="p-3 sm:p-4">
                {/* Category Label */}
                <p className="text-[10px] sm:text-xs font-semibold text-blue-600 mb-1 uppercase tracking-wide">
                  {product.category}
                </p>

                {/* Product Name */}
                <h3 className="font-semibold text-gray-900 mb-1.5 sm:mb-2 text-xs sm:text-sm leading-tight line-clamp-2">
                  {product.name}
                </h3>

                {/* Seller Info */}
                <div className="flex items-center gap-1 mb-1.5 sm:mb-2">
                  <Store size={10} className="text-gray-400 sm:w-3 sm:h-3" />
                  <span className="text-[10px] sm:text-xs text-gray-600 truncate">{product.seller}</span>
                  {product.verified && (
                    <BadgeCheck size={12} className="text-blue-600 flex-shrink-0 sm:w-3.5 sm:h-3.5" />
                  )}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-2 sm:mb-3">
                  <Star size={12} className="text-yellow-500 fill-yellow-500 sm:w-3.5 sm:h-3.5" />
                  <span className="text-xs sm:text-sm font-semibold text-gray-900">{product.rating}</span>
                  <span className="text-[10px] sm:text-xs text-gray-500">({product.reviews})</span>
                </div>

                {/* Price and Add Button */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm sm:text-lg font-bold text-gray-900">
                    Rs. {product.price.toLocaleString()}
                  </span>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      addToCart(product);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium px-3 sm:px-5 py-1.5 sm:py-2 rounded-lg transition-colors flex-shrink-0"
                  >
                    Add
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Filter Modal */}
      <FilterModal 
        isOpen={isFilterOpen} 
        onClose={() => setIsFilterOpen(false)}
        onApplyFilters={handleApplyFilters}
      />
    </div>
  );
}
