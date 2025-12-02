'use client';

import { useState, useEffect } from 'react';

interface Category {
  id: string;
  name: string;
  description: string;
}

export default function Home() {
  const [joke, setJoke] = useState('');
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [mode, setMode] = useState<'quick' | 'custom'>('quick');

  // Fetch categories on mount
  useEffect(() => {
    fetch('/api/joke/categories')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCategories(data.categories);
        }
      })
      .catch(err => console.error('Error fetching categories:', err));
  }, []);

  const getRandomJoke = async (category?: string) => {
    setLoading(true);
    try {
      const url = category
        ? `/api/joke?category=${category}`
        : '/api/joke';

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setJoke(data.joke);
      }
    } catch (error) {
      console.error('Error fetching joke:', error);
      setJoke('Oops! Failed to fetch a joke. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateCustomJoke = async () => {
    if (!customPrompt.trim()) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/joke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: customPrompt,
          category: selectedCategory || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setJoke(data.joke);
      }
    } catch (error) {
      console.error('Error generating joke:', error);
      setJoke('Oops! Failed to generate a joke. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-900 dark:to-pink-900">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            🎭 Joke Generator
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            AI-powered humor at your fingertips. Get ready to laugh!
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-lg bg-white dark:bg-gray-800 p-1 shadow-lg">
            <button
              onClick={() => {
                setMode('quick');
                setSelectedCategory('');
              }}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                mode === 'quick'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Quick Joke
            </button>
            <button
              onClick={() => {
                setMode('custom');
                setSelectedCategory('');
              }}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                mode === 'custom'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Custom Joke
            </button>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 mb-8">
          {mode === 'quick' ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                  Choose a Category
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button
                    onClick={() => {
                      setSelectedCategory('');
                      getRandomJoke();
                    }}
                    className="px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
                  >
                    Random 🎲
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        getRandomJoke(cat.id);
                      }}
                      className="px-4 py-3 rounded-xl bg-white dark:bg-gray-700 border-2 border-purple-200 dark:border-purple-700 text-gray-700 dark:text-gray-200 font-medium hover:border-purple-500 dark:hover:border-purple-400 hover:shadow-lg transform hover:-translate-y-1 transition-all"
                      title={cat.description}
                    >
                      {cat.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                  Custom Joke Request
                </h3>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Tell me a joke about..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none transition-colors resize-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Optional: Select a category {selectedCategory && <span className="text-purple-600 dark:text-purple-400">✓</span>}
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none transition-colors cursor-pointer hover:border-purple-300 dark:hover:border-purple-500"
                  disabled={loading}
                >
                  <option value="">No specific category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {selectedCategory && (
                  <p className="mt-2 text-xs text-purple-600 dark:text-purple-400">
                    Selected: {categories.find(c => c.id === selectedCategory)?.name}
                  </p>
                )}
              </div>

              <button
                onClick={generateCustomJoke}
                disabled={loading || !customPrompt.trim()}
                className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? 'Generating...' : 'Generate Joke 🎭'}
              </button>
            </div>
          )}
        </div>

        {/* Joke Display */}
        {joke && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 animate-[fadeIn_0.5s_ease-in-out]">
            <div className="flex items-start gap-4">
              <div className="text-4xl">😄</div>
              <div className="flex-1">
                <p className="text-xl text-gray-800 dark:text-gray-100 leading-relaxed">
                  {joke}
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => navigator.clipboard.writeText(joke)}
                className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                📋 Copy
              </button>
              <button
                onClick={() => {
                  const text = `Check out this joke: ${joke}`;
                  if (navigator.share) {
                    navigator.share({ text });
                  } else {
                    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`);
                  }
                }}
                className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                🐦 Share
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && !joke && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 animate-pulse">
            <div className="flex items-center justify-center gap-4">
              <div className="text-4xl animate-bounce">🤔</div>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Crafting the perfect joke...
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 text-gray-600 dark:text-gray-400">
          <p className="text-sm">
            Powered by AI • Made with{' '}
            <span className="text-red-500">❤️</span> using Mastra
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
