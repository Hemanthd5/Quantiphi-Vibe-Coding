import { useEffect, useMemo, useState } from 'react';

const CATEGORY_OPTIONS = ['Electronics', 'Footwear', 'Accessories', 'Apparel', 'Home'];
const DEFAULT_MIN_PRICE = 0;
const DEFAULT_MAX_PRICE = 250;
const DEFAULT_MIN_RATING = 0;
const DEFAULT_SORT = 'featured';

// Theme detection
const getInitialTheme = () => {
  const stored = localStorage.getItem('marketplace-theme');
  if (stored) return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export default function ProductCatalog() {
  const [categories, setCategories] = useState([]);
  const [minPrice, setMinPrice] = useState(DEFAULT_MIN_PRICE);
  const [maxPrice, setMaxPrice] = useState(DEFAULT_MAX_PRICE);
  const [minRating, setMinRating] = useState(DEFAULT_MIN_RATING);
  const [sortBy, setSortBy] = useState(DEFAULT_SORT);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [theme, setTheme] = useState(getInitialTheme());

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (categories.length) count += 1;
    if (minPrice > DEFAULT_MIN_PRICE) count += 1;
    if (maxPrice < DEFAULT_MAX_PRICE) count += 1;
    if (minRating > DEFAULT_MIN_RATING) count += 1;
    if (sortBy !== DEFAULT_SORT) count += 1;
    return count;
  }, [categories.length, minPrice, maxPrice, minRating, sortBy]);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');

    try {
      const normalizedMinPrice = Number.isFinite(minPrice) ? minPrice : DEFAULT_MIN_PRICE;
      const normalizedMaxPrice = Number.isFinite(maxPrice) ? maxPrice : DEFAULT_MAX_PRICE;
      const normalizedMinRating = Number.isFinite(minRating) ? minRating : DEFAULT_MIN_RATING;
      const response = await fetch('http://127.0.0.1:5000/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categories,
          min_price: normalizedMinPrice,
          max_price: normalizedMaxPrice,
          min_rating: normalizedMinRating,
          sort_by: sortBy,
        }),
      });

      if (!response.ok) {
        throw new Error('Unable to load products');
      }

      const data = await response.json();
      setProducts(data.products || []);
    } catch (err) {
      setError(err.message || 'Something went wrong');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    localStorage.setItem('marketplace-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    fetchProducts();
  }, [categories, minPrice, maxPrice, minRating, sortBy]);

  // Sync filters to URL query parameters
  useEffect(() => {
    const params = new URLSearchParams();
    if (categories.length) params.set('categories', categories.join(','));
    if (minPrice > DEFAULT_MIN_PRICE) params.set('minPrice', minPrice);
    if (maxPrice < DEFAULT_MAX_PRICE) params.set('maxPrice', maxPrice);
    if (minRating > DEFAULT_MIN_RATING) params.set('minRating', minRating);
    if (sortBy !== DEFAULT_SORT) params.set('sortBy', sortBy);
    
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  }, [categories, minPrice, maxPrice, minRating, sortBy]);

  // Load filters from URL query parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('categories')) {
      setCategories(params.get('categories').split(','));
    }
    if (params.has('minPrice')) {
      setMinPrice(Number(params.get('minPrice')));
    }
    if (params.has('maxPrice')) {
      setMaxPrice(Number(params.get('maxPrice')));
    }
    if (params.has('minRating')) {
      setMinRating(Number(params.get('minRating')));
    }
    if (params.has('sortBy')) {
      setSortBy(params.get('sortBy'));
    }
  }, []);

  const toggleCategory = (category) => {
    setCategories((current) =>
      current.includes(category) ? current.filter((item) => item !== category) : [...current, category]
    );
  };

  const resetFilters = () => {
    setCategories([]);
    setMinPrice(DEFAULT_MIN_PRICE);
    setMaxPrice(DEFAULT_MAX_PRICE);
    setMinRating(DEFAULT_MIN_RATING);
    setSortBy(DEFAULT_SORT);
  };

  const handleMinPriceChange = (value) => {
    const nextValue = Number(value);
    setMinPrice(Math.min(nextValue, maxPrice));
  };

  const handleMaxPriceChange = (value) => {
    const nextValue = Number(value);
    setMaxPrice(Math.max(nextValue, minPrice));
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark'
        ? 'bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_transparent_28%),linear-gradient(135deg,_#020617_0%,_#0f172a_60%,_#111827_100%)] text-slate-100'
        : 'bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.08),_transparent_28%),linear-gradient(135deg,_#f8fafc_0%,_#f1f5f9_60%,_#e2e8f0_100%)] text-slate-900'
    }`}>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className={`mb-8 overflow-hidden rounded-[32px] border transition-all duration-300 p-6 shadow-[0_32px_140px] backdrop-blur-xl ${
          theme === 'dark'
            ? 'border-white/10 bg-slate-900/75 shadow-[0_32px_140px_rgba(0,0,0,0.45)]'
            : 'border-slate-200/50 bg-white/80 shadow-[0_32px_140px_rgba(0,0,0,0.08)]'
        }`}>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4 flex-1">
              <p className={`text-sm font-semibold uppercase tracking-[0.35em] ${
                theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'
              }`}>Marketplace Explorer</p>
              <h1 className={`max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl ${
                theme === 'dark' ? 'text-white' : 'text-slate-900'
              }`}>
                Browse top-rated products with thoughtful server-side filtering.
              </h1>
              <p className={`max-w-2xl text-sm sm:text-base ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Powered by an API-first catalog, the best items load instantly from the backend while the UI stays polished and intuitive.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                className={`rounded-full p-2.5 transition-all duration-300 ${
                  theme === 'dark'
                    ? 'bg-slate-800/60 hover:bg-slate-700/60 text-yellow-400'
                    : 'bg-slate-200/60 hover:bg-slate-300/60 text-slate-700'
                }`}
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
              <div className={`rounded-full border px-4 py-3 text-sm font-medium transition-all duration-300 shadow-[0_15px_50px] ${
                theme === 'dark'
                  ? 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200 shadow-[0_15px_50px_rgba(34,211,238,0.12)]'
                  : 'border-cyan-600/20 bg-cyan-600/10 text-cyan-700 shadow-[0_15px_50px_rgba(34,211,238,0.08)]'
              }`}>
                {loading ? 'Refreshing product list…' : `${products.length} curated items ready`}
              </div>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-4 lg:self-start">
            <div className={`space-y-5 rounded-[28px] border transition-all duration-300 p-5 shadow-[0_25px_90px] backdrop-blur-xl ${
              theme === 'dark'
                ? 'border-white/10 bg-slate-900/75 shadow-[0_25px_90px_rgba(0,0,0,0.35)]'
                : 'border-slate-200/50 bg-white/80 shadow-[0_25px_90px_rgba(0,0,0,0.08)]'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm uppercase tracking-[0.28em] ${
                    theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                  }`}>Refine</p>
                  <h2 className={`text-2xl font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-slate-900'
                  }`}>Filter shelf</h2>
                </div>
                <button
                  type="button"
                  onClick={resetFilters}
                  aria-label="Reset all filters"
                  className={`rounded-full border transition-all duration-300 px-3 py-2 text-sm ${
                    theme === 'dark'
                      ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20'
                      : 'border-cyan-600/30 bg-cyan-600/10 text-cyan-700 hover:bg-cyan-600/20'
                  }`}
                >
                  Reset
                </button>
              </div>

              <div className={`rounded-[24px] border transition-all duration-300 p-4 shadow-[inset_0_2px_12px] ${
                theme === 'dark'
                  ? 'border-slate-800/80 bg-slate-950/70 shadow-[inset_0_2px_12px_rgba(0,0,0,0.3)]'
                  : 'border-slate-300/50 bg-slate-100/50 shadow-[inset_0_2px_12px_rgba(0,0,0,0.04)]'
              }`}>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className={`text-sm font-semibold uppercase tracking-[0.2em] ${
                    theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                  }`}>📦 Category</h3>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.15em] transition-all duration-300 ${
                    categories.length > 0
                      ? theme === 'dark'
                        ? 'bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-500/30'
                        : 'bg-cyan-600/20 text-cyan-700 ring-1 ring-cyan-600/30'
                      : theme === 'dark'
                        ? 'bg-slate-800/50 text-slate-500'
                        : 'bg-slate-200/50 text-slate-500'
                  }`}>{categories.length ? `${categories.length} active` : 'Any'}</span>
                </div>
                <div className="space-y-1.5">
                  {CATEGORY_OPTIONS.map((category) => (
                    <label key={category} className={`group flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition-all duration-300 ${
                      categories.includes(category)
                        ? theme === 'dark'
                          ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-200 shadow-[0_4px_16px_rgba(34,211,238,0.15)]'
                          : 'border-cyan-600/40 bg-cyan-600/10 text-cyan-800 shadow-[0_4px_16px_rgba(34,211,238,0.12)]'
                        : theme === 'dark'
                          ? 'border-transparent text-slate-400 hover:border-slate-700/50 hover:bg-slate-800/60 hover:text-slate-200'
                          : 'border-transparent text-slate-600 hover:border-slate-300/50 hover:bg-slate-200/40 hover:text-slate-800'
                    }`}>
                      <input
                        type="checkbox"
                        checked={categories.includes(category)}
                        onChange={() => toggleCategory(category)}
                        aria-label={`Filter by ${category}`}
                        className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-cyan-500 transition-all focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-950"
                      />
                      <span className="flex-1">{category}</span>
                      {categories.includes(category) && (
                        <span className="text-[10px]">✓</span>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              <div className={`rounded-[24px] border transition-all duration-300 p-4 shadow-[inset_0_2px_12px] ${
                theme === 'dark'
                  ? 'border-slate-800/80 bg-slate-950/70 shadow-[inset_0_2px_12px_rgba(0,0,0,0.3)]'
                  : 'border-slate-300/50 bg-slate-100/50 shadow-[inset_0_2px_12px_rgba(0,0,0,0.04)]'
              }`}>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className={`text-sm font-semibold uppercase tracking-[0.2em] ${
                    theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                  }`}>💰 Price range</h3>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold transition-all duration-300 ${
                    (minPrice > DEFAULT_MIN_PRICE || maxPrice < DEFAULT_MAX_PRICE)
                      ? theme === 'dark'
                        ? 'bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-500/30'
                        : 'bg-cyan-600/20 text-cyan-700 ring-1 ring-cyan-600/30'
                      : theme === 'dark'
                        ? 'bg-slate-800/50 text-slate-400'
                        : 'bg-slate-200/50 text-slate-600'
                  }`}>${minPrice} - ${maxPrice}</span>
                </div>
                <div className="space-y-5">
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className={`text-xs font-medium uppercase tracking-[0.2em] ${
                        theme === 'dark' ? 'text-slate-500' : 'text-slate-600'
                      }`}>Min: ${minPrice}</label>
                      <div className={`h-1 w-16 rounded-full ${
                        theme === 'dark' ? 'bg-slate-800' : 'bg-slate-300'
                      }`}>
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-300"
                          style={{ width: `${(minPrice / 250) * 100}%` }}
                        />
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="250"
                      step="5"
                      value={minPrice}
                      onChange={(event) => handleMinPriceChange(event.target.value)}
                      aria-label="Minimum price filter"
                      className="w-full accent-cyan-500 transition-all"
                    />
                  </div>
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className={`text-xs font-medium uppercase tracking-[0.2em] ${
                        theme === 'dark' ? 'text-slate-500' : 'text-slate-600'
                      }`}>Max: ${maxPrice}</label>
                      <div className={`h-1 w-16 rounded-full ${
                        theme === 'dark' ? 'bg-slate-800' : 'bg-slate-300'
                      }`}>
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-cyan-500 transition-all duration-300"
                          style={{ width: `${(maxPrice / 250) * 100}%` }}
                        />
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="250"
                      step="5"
                      value={maxPrice}
                      onChange={(event) => handleMaxPriceChange(event.target.value)}
                      aria-label="Maximum price filter"
                      className="w-full accent-cyan-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className={`rounded-[24px] border transition-all duration-300 p-4 shadow-[inset_0_2px_12px] ${
                theme === 'dark'
                  ? 'border-slate-800/80 bg-slate-950/70 shadow-[inset_0_2px_12px_rgba(0,0,0,0.3)]'
                  : 'border-slate-300/50 bg-slate-100/50 shadow-[inset_0_2px_12px_rgba(0,0,0,0.04)]'
              }`}>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className={`text-sm font-semibold uppercase tracking-[0.2em] ${
                    theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                  }`}>⭐ Rating</h3>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.15em] transition-all duration-300 ${
                    minRating > 0
                      ? theme === 'dark'
                        ? 'bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-500/30'
                        : 'bg-cyan-600/20 text-cyan-700 ring-1 ring-cyan-600/30'
                      : theme === 'dark'
                        ? 'bg-slate-800/50 text-slate-500'
                        : 'bg-slate-200/50 text-slate-500'
                  }`}>{minRating > 0 ? `${minRating}+` : 'Any'}</span>
                </div>
                <div className="space-y-1.5">
                  {[0, 3, 4, 4.5, 5].map((value) => (
                    <label key={value} className={`group flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition-all duration-300 ${
                      minRating === value
                        ? theme === 'dark'
                          ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-200 shadow-[0_4px_16px_rgba(34,211,238,0.15)]'
                          : 'border-cyan-600/40 bg-cyan-600/10 text-cyan-800 shadow-[0_4px_16px_rgba(34,211,238,0.12)]'
                        : theme === 'dark'
                          ? 'border-transparent text-slate-400 hover:border-slate-700/50 hover:bg-slate-800/60 hover:text-slate-200'
                          : 'border-transparent text-slate-600 hover:border-slate-300/50 hover:bg-slate-200/40 hover:text-slate-800'
                    }`}>
                      <input
                        type="radio"
                        name="min-rating"
                        value={value}
                        checked={minRating === value}
                        onChange={() => setMinRating(value)}
                        aria-label={`Filter by ${value === 0 ? 'any rating' : `${value}+ stars`}`}
                        className="h-4 w-4 border-slate-600 bg-slate-900 text-cyan-500 transition-all focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-950"
                      />
                      <span className="flex-1">{value === 0 ? 'Any rating' : `${value}+ stars`}</span>
                      {minRating === value && value > 0 && (
                        <span className="text-xs">{'★'.repeat(Math.floor(value))}{value % 1 !== 0 ? '☆' : ''}</span>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              <div className={`rounded-[24px] border transition-all duration-300 p-4 text-sm ${
                theme === 'dark'
                  ? 'border-slate-800/80 bg-slate-950/70 text-slate-400'
                  : 'border-slate-300/50 bg-slate-100/50 text-slate-600'
              }`}>
                <p>{activeFiltersCount > 0 ? `${activeFiltersCount} active filter settings` : 'No filters applied'}</p>
              </div>
            </div>
          </aside>

          <main>
            {loading ? (
              <div className={`flex h-72 items-center justify-center rounded-[24px] border transition-all duration-300 shadow-[0_25px_90px] backdrop-blur-xl ${
                theme === 'dark'
                  ? 'border-white/10 bg-slate-900/70 text-slate-300 shadow-[0_25px_90px_rgba(0,0,0,0.35)]'
                  : 'border-slate-200/50 bg-white/70 text-slate-600 shadow-[0_25px_90px_rgba(0,0,0,0.08)]'
              }`}>
                Loading products...
              </div>
            ) : error ? (
              <div className={`flex h-72 items-center justify-center rounded-[24px] border transition-all duration-300 shadow-[0_25px_90px] backdrop-blur-xl ${
                theme === 'dark'
                  ? 'border-rose-800/70 bg-rose-950/40 text-rose-200 shadow-[0_25px_90px_rgba(0,0,0,0.35)]'
                  : 'border-rose-300/50 bg-rose-50/70 text-rose-700 shadow-[0_25px_90px_rgba(0,0,0,0.08)]'
              }`}>
                {error}
              </div>
            ) : products.length === 0 ? (
              <div className={`flex min-h-[420px] flex-col items-center justify-center rounded-[24px] border transition-all duration-300 px-6 py-12 text-center shadow-[0_25px_90px] backdrop-blur-xl ${
                theme === 'dark'
                  ? 'border-white/10 bg-slate-900/70 shadow-[0_25px_90px_rgba(0,0,0,0.35)]'
                  : 'border-slate-200/50 bg-white/70 shadow-[0_25px_90px_rgba(0,0,0,0.08)]'
              }`}>
                <h2 className={`text-2xl font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-slate-900'
                }`}>No items match your criteria.</h2>
                <p className={`mt-3 max-w-md ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                }`}>Try widening your search, changing the sort order, or reset the filters to see the full catalog again.</p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-6 rounded-full bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <div>
                <div className={`mb-5 flex flex-col gap-3 rounded-[24px] border transition-all duration-300 px-5 py-5 shadow-[0_20px_75px] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between ${
                  theme === 'dark'
                    ? 'border-white/10 bg-slate-900/70 shadow-[0_20px_75px_rgba(0,0,0,0.28)]'
                    : 'border-slate-200/50 bg-white/70 shadow-[0_20px_75px_rgba(0,0,0,0.08)]'
                }`}>
                  <div>
                    <p className={`text-sm font-semibold uppercase tracking-[0.25em] ${
                      theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'
                    }`}>Inventory</p>
                    <h2 className={`text-xl font-semibold ${
                      theme === 'dark' ? 'text-white' : 'text-slate-900'
                    }`}>Curated just for your browsing flow</h2>
                  </div>
                  <label className={`flex items-center gap-3 rounded-full border transition-all duration-300 px-3 py-2 text-sm ${
                    theme === 'dark'
                      ? 'border-slate-700 bg-slate-950/60 text-slate-300'
                      : 'border-slate-300 bg-slate-100/60 text-slate-700'
                  }`}>
                    <span className={theme === 'dark' ? 'text-slate-500' : 'text-slate-600'}>Sort by</span>
                    <select
                      value={sortBy}
                      onChange={(event) => setSortBy(event.target.value)}
                      aria-label="Sort products by"
                      className={`bg-transparent text-sm outline-none ${
                        theme === 'dark' ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      <option value="featured">Featured</option>
                      <option value="price_low_to_high">Price: Low to High</option>
                      <option value="top_rated_first">Top Rated First</option>
                    </select>
                  </label>
                </div>

                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {products.map((product) => (
                    <article key={product.id} className={`group overflow-hidden rounded-[28px] border transition-all duration-300 shadow-[0_20px_90px] hover:-translate-y-1 ${
                      theme === 'dark'
                        ? 'border-white/10 bg-slate-900/75 shadow-[0_20px_90px_rgba(0,0,0,0.25)] hover:border-cyan-500/50'
                        : 'border-slate-200/50 bg-white/75 shadow-[0_20px_90px_rgba(0,0,0,0.08)] hover:border-cyan-600/50'
                    }`}>
                      <div className="relative overflow-hidden">
                        <img src={product.image_thumbnail} alt={product.name} className="h-56 w-full object-cover transition duration-500 group-hover:scale-105" />
                        <div className="absolute inset-x-0 top-4 flex justify-between px-4">
                          <span className="rounded-full bg-cyan-500/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-950">Best seller</span>
                          <span className={`rounded-full px-3 py-1 text-xs ${
                            theme === 'dark'
                              ? 'bg-slate-950/75 text-slate-300'
                              : 'bg-slate-200/75 text-slate-700'
                          }`}>{product.category}</span>
                        </div>
                        <div className={`absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t ${
                          theme === 'dark'
                            ? 'from-slate-950 via-transparent to-transparent'
                            : 'from-slate-50 via-transparent to-transparent'
                        }`} />
                      </div>

                      <div className="space-y-4 p-5">
                        <div className="space-y-2">
                          <h3 className={`text-lg font-semibold line-clamp-2 ${
                            theme === 'dark' ? 'text-white' : 'text-slate-900'
                          }`}>{product.name}</h3>
                          <p className={`text-sm ${
                            theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                          }`}>Premium selection for everyday use, curated from live product inventory.</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-sm">
                          <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-slate-200 ${
                            theme === 'dark'
                              ? 'bg-slate-950/80'
                              : 'bg-slate-200/80 text-slate-800'
                          }`}>
                            <strong className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>{product.rating.toFixed(1)}</strong>
                            <span>★</span>
                          </span>
                          <span className={`rounded-full border px-3 py-1 ${
                            theme === 'dark'
                              ? 'border-slate-700/80 bg-slate-950/80 text-slate-300'
                              : 'border-slate-300/80 bg-slate-100/80 text-slate-700'
                          }`}>Free delivery</span>
                          <span className={`rounded-full border px-3 py-1 ${
                            theme === 'dark'
                              ? 'border-slate-700/80 bg-slate-950/80 text-slate-300'
                              : 'border-slate-300/80 bg-slate-100/80 text-slate-700'
                          }`}>In stock</span>
                        </div>

                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className={`text-2xl font-semibold ${
                              theme === 'dark' ? 'text-white' : 'text-slate-900'
                            }`}>${product.price.toFixed(2)}</p>
                            <p className={`text-xs uppercase tracking-[0.2em] ${
                              theme === 'dark' ? 'text-slate-500' : 'text-slate-600'
                            }`}>Inclusive of GST</p>
                          </div>
                          <button className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
                            View
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

