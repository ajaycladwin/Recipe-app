import { useState, useEffect, useMemo, useCallback } from 'react';

function Recepieapp() {
  const [recipes, setRecipes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLetter, setSelectedLetter] = useState('');
  const [ingredientFilter, setIngredientFilter] = useState('');

  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState([]);

  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  // Load favorites
  useEffect(() => {
    const saved = localStorage.getItem('recipeFavorites');
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('recipeFavorites', JSON.stringify(favorites));
  }, [favorites]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch Categories
  useEffect(() => {
    fetch('https://www.themealdb.com/api/json/v1/1/categories.php')
      .then(res => res.json())
      .then(data => setCategories(data.categories || []))
      .catch(() => {});
  }, []);

  // Main Fetch Function
  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let url = '';

      if (debouncedSearch) {
        url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${debouncedSearch}`;
      } else if (selectedLetter) {
        url = `https://www.themealdb.com/api/json/v1/1/search.php?f=${selectedLetter}`;
      } else if (selectedCategory) {
        url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${selectedCategory}`;
      } else {
        url = `https://www.themealdb.com/api/json/v1/1/search.php?f=a`;
      }

      const res = await fetch(url);
      const data = await res.json();
      setRecipes(data.meals || []);
    } catch (err) {
      setError('Failed to fetch recipes. Please try again.');
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedCategory, selectedLetter]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  // Client-side filters
  const displayedRecipes = useMemo(() => {
    let result = showFavoritesOnly ? favorites : recipes;

    if (ingredientFilter.trim()) {
      const term = ingredientFilter.toLowerCase().trim();
      result = result.filter((meal) => {
        if (!meal.strIngredient1) return false;
        for (let i = 1; i <= 20; i++) {
          const ing = meal[`strIngredient${i}`];
          if (ing && typeof ing === 'string' && ing.toLowerCase().includes(term)) return true;
        }
        return false;
      });
    }

    return result;
  }, [recipes, favorites, showFavoritesOnly, ingredientFilter]);

  const toggleFavorite = (meal) => {
    const isFav = favorites.some(f => f.idMeal === meal.idMeal);
    if (isFav) {
      setFavorites(favorites.filter(f => f.idMeal !== meal.idMeal));
    } else {
      setFavorites([...favorites, meal]);
    }
  };

  const isFavorite = (id) => favorites.some(f => f.idMeal === id);

  const openRecipeDetails = async (mealId) => {
    setModalLoading(true);
    setSelectedRecipe(null);

    try {
      const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`);
      const data = await res.json();
      setSelectedRecipe(data.meals?.[0] || null);
    } catch {
      const fallback = recipes.find(m => m.idMeal === mealId) ||
        favorites.find(m => m.idMeal === mealId);
      setSelectedRecipe(fallback);
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => setSelectedRecipe(null);

  const getIngredients = (meal) => {
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ing = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      if (ing && ing.trim()) {
        ingredients.push({ ingredient: ing.trim(), measure: measure?.trim() || '' });
      }
    }
    return ingredients;
  };

  const getInstructions = (text) =>
    text ? text.split(/\r?\n/).filter(line => line.trim().length > 0) : [];

  const getRandomMeal = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
      const data = await res.json();
      if (data.meals?.[0]) {
        setRecipes(data.meals);
        setSelectedLetter('');
        setDebouncedSearch('');
        setSearchTerm('');
        setSelectedCategory('');
      }
    } catch {
      alert('Failed to get random meal');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setSelectedCategory('');
    setSelectedLetter('');
    setIngredientFilter('');
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Navbar */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 flex items-center justify-center text-white font-bold">R</div>
            <h1 className="text-3xl font-bold tracking-tighter">RecipeApp</h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={getRandomMeal}
              className="px-4 py-2 bg-black text-white text-sm"
            >
              Surprise Me
            </button>
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`px-4 py-2 text-sm border ${showFavoritesOnly ? 'bg-gray-200 text-black' : 'bg-white'}`}
            >
              Favorites {favorites.length > 0 && `(${favorites.length})`}
            </button>
          </div>
        </div>

        {/* Search Bar - Centered */}
        <div className="max-w-7xl mx-auto px-6 pb-5 flex justify-center">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSelectedCategory('');
              setSelectedLetter('');
            }}
            placeholder="Search meals by name..."
            className="w-full max-w-lg border border-gray-300 px-4 py-2"
          />
        </div>
      </nav>

      {/* Filters Section */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        
        {/* A-Z Letter Filter - CENTERED */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-zinc-500 tracking-widest">BROWSE BY LETTER</h3>
            {selectedLetter && (
              <button onClick={() => setSelectedLetter('')} className="text-xs text-orange-600">Clear</button>
            )}
          </div>
          <div className="flex flex-wrap gap-1 justify-center">
            {alphabet.map(letter => (
              <button
                key={letter}
                onClick={() => {
                  setSelectedLetter(letter);
                  setSearchTerm('');
                  setDebouncedSearch('');
                }}
                className={`w-8 h-8 text-sm border ${selectedLetter === letter ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'}`}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>

        {/* Categories - CENTERED */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-zinc-500 tracking-widest">CATEGORIES</h3>
            {selectedCategory && <button onClick={() => setSelectedCategory('')} className="text-xs text-orange-600">Clear</button>}
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            <button 
              onClick={() => setSelectedCategory('')} 
              className={`px-4 py-1 text-sm border ${selectedCategory === '' ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'}`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat.strCategory}
                onClick={() => {
                  setSelectedCategory(cat.strCategory);
                  setSelectedLetter('');
                  setSearchTerm('');
                  setDebouncedSearch('');
                }}
                className={`px-4 py-1 text-sm border ${selectedCategory === cat.strCategory ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'}`}
              >
                {cat.strCategory}
              </button>
            ))}
          </div>
        </div>

        {/* Ingredient Filter - CENTERED */}
        <div className="max-w-xs mx-auto mb-6">
          <input
            type="text"
            value={ingredientFilter}
            onChange={(e) => setIngredientFilter(e.target.value)}
            placeholder="Filter by ingredient..."
            className="w-full border border-gray-300 px-4 py-2 text-sm"
          />
        </div>

      </div>

      {/* Recipe Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        {loading && <div className="text-center py-10 text-lg">Loading recipes...</div>}
        {error && <div className="text-center text-red-500 py-10">{error}</div>}

        {!loading && !error && (
          <div className="grid grid-cols-4 gap-4">
            {displayedRecipes.length > 0 ? (
              displayedRecipes.map((meal) => (
                <div
                  key={meal.idMeal}
                  onClick={() => openRecipeDetails(meal.idMeal)}
                  className="bg-white border border-gray-300 cursor-pointer"
                >
                  <div className="relative">
                    <img
                      src={meal.strMealThumb}
                      alt={meal.strMeal}
                      className="w-full h-32 object-cover"
                    />
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(meal); }}
                      className="absolute top-2 right-2 bg-white px-2 py-1 border border-gray-400 text-xs"
                    >
                      {isFavorite(meal.idMeal) ? 'Unfavorite' : 'Favorite'}
                    </button>
                  </div>
                  <div className="p-2">
                    <h3 className="font-semibold text-sm leading-tight line-clamp-2">{meal.strMeal}</h3>
                    <p className="text-xs text-zinc-500 mt-1">{meal.strCategory} • {meal.strArea}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-16 text-zinc-500">
                No recipes found. Try different filters.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4" onClick={closeModal}>
          <div className="bg-white w-full max-w-5xl overflow-auto max-h-[90vh] flex flex-col border border-gray-400" onClick={e => e.stopPropagation()}>
            <div className="p-8 overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-4xl font-bold pr-8">{selectedRecipe.strMeal}</h2>
                <button onClick={closeModal} className="text-4xl leading-none">×</button>
              </div>

              <img src={selectedRecipe.strMealThumb} alt="" className="w-full mb-8" />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10">
                {/* Ingredients */}
                <div>
                  <h3 className="font-semibold text-xl mb-4">Ingredients</h3>
                  <div className="grid grid-cols-1 gap-y-2 text-sm">
                    {getIngredients(selectedRecipe).map((item, index) => (
                      <div key={index} className="flex gap-3 border-b pb-2">
                        <span className="font-mono text-orange-600 w-20 shrink-0">{item.measure}</span>
                        <span>{item.ingredient}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instructions */}
                <div>
                  <h3 className="font-semibold text-xl mb-4">Instructions</h3>
                  <div className="space-y-4 text-[15px] leading-relaxed text-zinc-700">
                    {getInstructions(selectedRecipe.strInstructions).map((step, index) => (
                      <p key={index}>{step}</p>
                    ))}
                  </div>
                </div>
              </div>

              {selectedRecipe.strYoutube && (
                <a
                  href={selectedRecipe.strYoutube}
                  target="_blank"
                  className="mt-8 inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
                >
                  Watch on YouTube
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Recepieapp;