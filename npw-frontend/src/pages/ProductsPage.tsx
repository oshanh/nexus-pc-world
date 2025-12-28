
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useProducts } from '../contexts/ProductContext';
import ProductCard from '../components/ProductCard';
import type { Product } from '../types';
import GamingButton from '../components/GamingButton';
import { categoryService } from '../services/categoryService';

type CategoryRecord = {
  id: string;
  name: string;
  subcategories: string[];
};

interface ProductsPageProps {
  onViewDetails: (product: Product) => void;
}

const FilterPanel: React.FC<{
  categories: CategoryRecord[];
  activeCategory: string;
  setActiveCategory: (c: string) => void;
    searchTerm: string;
    setSearchTerm: (s: string) => void;
    expandedCategories: string[];
    toggleCategory: (category: string) => void;
    onClearFilters: () => void;
    suggestions: Product[];
    onSuggestionClick: (product: Product) => void;
    searchContainerRef: React.RefObject<HTMLDivElement>;
    isSearching: boolean;
}> = ({
  categories,
  activeCategory, setActiveCategory,
    searchTerm, setSearchTerm, 
    expandedCategories, toggleCategory, 
    onClearFilters, 
    suggestions, onSuggestionClick, searchContainerRef, isSearching 
}) => {
    
    // Collapsible sections state
    const [sectionsOpen, setSectionsOpen] = useState({
        category: true,
    });

    const toggleSection = (section: keyof typeof sectionsOpen) => {
        setSectionsOpen(prev => ({ ...prev, [section]: !prev[section] }));
    };

    return (
        <div className="space-y-6 pr-2">
            {/* Search */}
            <div className="relative" ref={searchContainerRef}>
                <input 
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-nexus-dark border border-nexus-purple/30 rounded-md py-2 pl-10 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-nexus-blue placeholder-gray-500"
                    autoComplete="off"
                />
                <svg className="w-5 h-5 text-gray-400 absolute top-1/2 left-3 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                {isSearching ? (
                    <div className="absolute top-1/2 right-3 -translate-y-1/2">
                        <svg className="animate-spin h-5 w-5 text-nexus-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                ) : searchTerm.length > 0 && (
                    <button
                        onClick={() => setSearchTerm('')}
                        className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                        aria-label="Clear search"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                )}
                 {suggestions.length > 0 && searchTerm.length > 0 && (
                    <ul className="absolute z-20 w-full mt-1 bg-nexus-dark border border-nexus-purple/50 rounded-md shadow-lg max-h-80 overflow-auto">
                        {suggestions.map(suggestion => (
                            <li
                                key={suggestion.id}
                                onClick={() => onSuggestionClick(suggestion)}
                                className="px-3 py-2 text-sm text-white cursor-pointer hover:bg-nexus-blue/20 flex items-center gap-3 transition-colors border-b border-nexus-gray/50 last:border-0"
                            >
                                <img src={suggestion.imageUrls[0]} alt={suggestion.name} className="w-10 h-10 object-cover rounded bg-nexus-gray border border-nexus-gray" />
                                <div className="flex-grow min-w-0">
                                    <div className="font-bold truncate text-white">{suggestion.name}</div>
                                    <div className="text-xs text-gray-400 truncate">{suggestion.subCategory || suggestion.category}</div>
                                </div>
                                <div className="text-nexus-blue font-bold text-xs whitespace-nowrap">{suggestion.price}</div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Category */}
            <div className="border-b border-nexus-purple/20 pb-4">
                <button onClick={() => toggleSection('category')} className="flex justify-between items-center w-full mb-3">
                    <h3 className="font-exo font-bold text-lg text-white">Category</h3>
                    <svg className={`w-4 h-4 text-nexus-light transition-transform ${sectionsOpen.category ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </button>
                {sectionsOpen.category && (
                    <ul className="space-y-1">
                      <li key="All">
                        <button
                          onClick={() => setActiveCategory('All')}
                          className={`w-full text-left py-2 px-3 rounded-md text-sm transition-colors duration-200 ${
                            activeCategory === 'All' ? 'bg-nexus-blue text-white font-semibold' : 'text-nexus-light hover:bg-nexus-dark'
                          }`}
                        >
                          All Products
                        </button>
                      </li>

                      {categories.map((cat) => {
                        const hasSubs = Array.isArray(cat.subcategories) && cat.subcategories.length > 0;

                        if (!hasSubs) {
                          return (
                            <li key={cat.id}>
                              <button
                                onClick={() => setActiveCategory(cat.name)}
                                className={`w-full text-left py-2 px-3 rounded-md text-sm transition-colors duration-200 ${
                                  activeCategory === cat.name ? 'bg-nexus-blue text-white font-semibold' : 'text-nexus-light hover:bg-nexus-dark'
                                }`}
                              >
                                {cat.name}
                              </button>
                            </li>
                          );
                        }

                        const isExpanded = expandedCategories.includes(cat.name);
                        return (
                          <li key={cat.id}>
                            <button
                              onClick={() => toggleCategory(cat.name)}
                              className="w-full flex justify-between items-center text-left py-2 px-3 rounded-md text-sm font-semibold text-nexus-light hover:bg-nexus-dark transition-colors duration-200"
                            >
                              <span>{cat.name}</span>
                              <svg className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                            </button>

                            {isExpanded && (
                              <ul className="pt-2 pl-4 space-y-1 border-l border-nexus-purple/20 ml-2">
                                <li>
                                  <button
                                    onClick={() => setActiveCategory(cat.name)}
                                    className={`w-full text-left py-2 px-3 rounded-md text-sm transition-colors duration-200 ${
                                      activeCategory === cat.name ? 'bg-nexus-blue text-white font-semibold' : 'text-nexus-light hover:bg-nexus-dark'
                                    }`}
                                  >
                                    All {cat.name}
                                  </button>
                                </li>

                                {cat.subcategories.map((sub) => (
                                  <li key={sub}>
                                    <button
                                      onClick={() => setActiveCategory(sub)}
                                      className={`w-full text-left py-2 px-3 rounded-md text-sm transition-colors duration-200 ${
                                        activeCategory === sub ? 'bg-nexus-blue text-white font-semibold' : 'text-nexus-light hover:bg-nexus-dark'
                                      }`}
                                    >
                                      {sub}
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                )}
            </div>
            
            {/* Clear Filters Button */}
            <div className="pt-4 border-t border-nexus-purple/20">
                <GamingButton
                    onClick={onClearFilters}
                    variant="danger"
                    size="sm"
                    className="w-full"
                >
                    Clear All Filters
                </GamingButton>
            </div>
        </div>
    );
};

const ProductsPage: React.FC<ProductsPageProps> = ({ onViewDetails }) => {
  const { products } = useProducts();
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [isFiltering, setIsFiltering] = useState(false);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await categoryService.getCategories();
        const loaded = Array.isArray(res?.categories) ? res.categories : [];
        setCategories(loaded);
        setCategoriesError(null);
      } catch (err) {
        console.error(err);
        setCategories([]);
        setCategoriesError('Failed to load categories');
      }
    };
    loadCategories();
  }, []);

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
        setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    return () => {
        clearTimeout(handler);
    };
  }, [searchTerm]);

  const isSearching = debouncedSearchTerm !== searchTerm;

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };
  
  const handleFilterChange = (callback: (...args: any[]) => void) => (...args: any[]): void => {
      callback(...args);
      setIsFiltering(true);
      setTimeout(() => setIsFiltering(false), 300); // Brief feedback duration
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (value.trim().length > 0) {
      const lowerValue = value.toLowerCase();
      const filteredSuggestions = products
        .filter(p => 
            p.name.toLowerCase().includes(lowerValue) || 
            p.category.toLowerCase().includes(lowerValue) ||
            p.subCategory?.toLowerCase().includes(lowerValue)
        )
        .slice(0, 5);
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (product: Product) => {
    setSearchTerm(product.name);
    setDebouncedSearchTerm(product.name); // Immediate update
    setSuggestions([]);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleClearFilters = handleFilterChange(() => {
    setActiveCategory('All');
    setSearchTerm('');
    setSuggestions([]);
  });

  const categoryNameSet = useMemo(() => new Set(categories.map(c => c.name)), [categories]);

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products;

    // Category Filter
    if (activeCategory !== 'All') {
        if (categoryNameSet.has(activeCategory)) {
          filtered = filtered.filter(p => p.category === activeCategory);
        } else {
          filtered = filtered.filter(p => p.subCategory === activeCategory);
        }
    }

    // Text Search
    if (debouncedSearchTerm) {
        const lowercasedTerm = debouncedSearchTerm.toLowerCase();
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(lowercasedTerm) || 
            p.shortDescription.toLowerCase().includes(lowercasedTerm) ||
            p.specs.some(spec => spec.value.toLowerCase().includes(lowercasedTerm))
        );
    }

    return filtered;
  }, [activeCategory, categoryNameSet, debouncedSearchTerm, products]);

  return (
    <section className="py-20 min-h-screen">
      <div className="container mx-auto px-6">
        <div className="text-center">
            <h1 className="text-4xl font-exo font-bold mb-2">Our Full Arsenal</h1>
            <p className="text-nexus-light mb-12 max-w-3xl mx-auto">
                Browse our complete collection of high-performance gaming hardware.
            </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className={`sticky top-24 bg-nexus-gray p-6 rounded-lg border border-nexus-purple/20 transition-all duration-300 ${isFiltering ? 'opacity-50 pointer-events-none' : ''}`}>
                <FilterPanel 
                    categories={categories}
                    activeCategory={activeCategory}
                    setActiveCategory={handleFilterChange(setActiveCategory)}
                    searchTerm={searchTerm}
                    setSearchTerm={handleSearchChange}
                    expandedCategories={expandedCategories}
                    toggleCategory={toggleCategory}
                    onClearFilters={handleClearFilters}
                    suggestions={suggestions}
                    onSuggestionClick={handleSuggestionClick}
                    searchContainerRef={searchContainerRef}
                    isSearching={isSearching}
                />
                {categoriesError && (
                  <p className="mt-4 text-xs text-red-400">{categoriesError}</p>
                )}
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            {/* Mobile Controls */}
            <div className="lg:hidden mb-6">
                <GamingButton onClick={() => setIsFiltersOpen(true)} className="w-full">
                    Search & Filters
                </GamingButton>
            </div>
            
            {/* Mobile Filter Panel (Off-canvas) */}
            <div className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${isFiltersOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                {/* Backdrop */}
                <div className="absolute inset-0 bg-nexus-dark/80 backdrop-blur-sm" onClick={() => setIsFiltersOpen(false)}></div>
                {/* Panel */}
                <div className={`absolute top-0 left-0 h-full w-11/12 max-w-sm bg-nexus-gray p-6 shadow-2xl transition-transform duration-300 transform ${isFiltersOpen ? 'translate-x-0' : '-translate-x-full'} overflow-y-auto`}>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="font-exo text-xl font-bold">Filters</h2>
                        <GamingButton onClick={() => setIsFiltersOpen(false)} iconOnly={true} size="sm" variant="secondary" aria-label="Close filters">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </GamingButton>
                    </div>
                    <div className={`transition-opacity duration-300 ${isFiltering ? 'opacity-50 pointer-events-none' : ''}`}>
                        <FilterPanel
                          categories={categories}
                            activeCategory={activeCategory}
                            setActiveCategory={(c) => { 
                                handleFilterChange(setActiveCategory)(c); 
                                // Keep mobile panel open for multiple selections
                            }}
                            searchTerm={searchTerm}
                            setSearchTerm={handleSearchChange}
                            expandedCategories={expandedCategories}
                            toggleCategory={toggleCategory}
                            onClearFilters={() => {
                                handleClearFilters();
                                setIsFiltersOpen(false);
                            }}
                            suggestions={suggestions}
                            onSuggestionClick={(p) => {
                                handleSuggestionClick(p);
                                setIsFiltersOpen(false);
                            }}
                            searchContainerRef={searchContainerRef}
                            isSearching={isSearching}
                        />
                         <div className="mt-8">
                             <GamingButton onClick={() => setIsFiltersOpen(false)} className="w-full" variant="primary">
                                Show {filteredAndSortedProducts.length} Results
                             </GamingButton>
                         </div>
                    </div>
                </div>
            </div>
            
            <div className="relative">
                {isFiltering && (
                    <div className="absolute inset-0 bg-nexus-gray/50 flex items-center justify-center z-10 rounded-lg">
                        <svg className="animate-spin h-8 w-8 text-nexus-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                )}
                <div className={`transition-opacity duration-300 ${isFiltering ? 'opacity-30' : ''}`}>
                    {/* Active Filters Summary */}
                    {(activeCategory !== 'All' || searchTerm) && (
                        <div className="mb-6 flex flex-wrap gap-2 items-center">
                            <span className="text-sm text-gray-400 mr-2">Active Filters:</span>
                            {activeCategory !== 'All' && (
                                <span className="bg-nexus-blue/20 text-nexus-blue px-3 py-1 rounded-full text-xs font-bold border border-nexus-blue/30 flex items-center">
                                    {activeCategory}
                                    <button onClick={() => setActiveCategory('All')} className="ml-2 hover:text-white">×</button>
                                </span>
                            )}
                            <button onClick={handleClearFilters} className="text-xs text-red-400 hover:text-red-300 underline ml-2">Clear All</button>
                        </div>
                    )}

                    <div className="flex justify-between items-center mb-6">
                        <p className="text-nexus-light">
                            Showing {filteredAndSortedProducts.length} of {products.length} products
                        </p>
                    </div>
                    
                    {filteredAndSortedProducts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredAndSortedProducts.map(product => (
                        <ProductCard key={product.id} product={product} onViewDetails={onViewDetails} context="products" />
                        ))}
                    </div>
                    ) : (
                    <div className="text-center py-20 bg-nexus-dark/50 rounded-lg border border-nexus-gray">
                        <svg className="mx-auto h-16 w-16 text-nexus-blue opacity-50 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <h3 className="text-2xl font-exo text-white font-bold">No Products Match Your Search</h3>
                        <p className="text-gray-400 mt-2 max-w-md mx-auto">
                            We couldn't find any items matching your specific filters. Try searching for something else.
                        </p>
                        <GamingButton onClick={handleClearFilters} variant="secondary" className="mt-6">
                            Reset Filters
                        </GamingButton>
                    </div>
                    )}
                </div>
            </div>
          </main>
        </div>
      </div>
    </section>
  );
};

export default ProductsPage;
