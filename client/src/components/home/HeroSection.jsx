import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiArrowRight } from 'react-icons/fi';
import cameraImage from '../../assets/camera.png';
import tentImage from '../../assets/tant.png';
import chairImage from '../../assets/chair.png';
import shoesImage from '../../assets/shoes.png';
import cam2 from '../../assets/camera2.png'
import { getApiBaseUrl, getImageUrl } from '../../utils/productHelpers';

const heroSlides = [
  cameraImage,
  tentImage,
  chairImage,
  shoesImage,
  cam2,
];
const baseUrl = getApiBaseUrl();

const HeroSection = () => {
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState(0);
  const [allProducts, setAllProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${baseUrl}/api/products`);
        const products = response?.data?.products || [];
        setAllProducts(products.filter((item) => item?.available !== false));
      } catch (error) {
        setAllProducts([]);
      }
    };
    fetchProducts();
  }, []);

  const suggestions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];
    return allProducts
      .filter((product) => (product?.name || '').toLowerCase().includes(query))
      .slice(0, 6);
  }, [allProducts, searchQuery]);

  const handleSuggestionClick = (productId) => {
    setShowSuggestions(false);
    setSearchQuery('');
    navigate(`/product/${productId}`);
  };

  const handleSearchSubmit = () => {
    const firstSuggestion = suggestions[0];
    if (firstSuggestion?._id) {
      handleSuggestionClick(firstSuggestion._id);
      return;
    }
    navigate('/products');
  };

  return (
    <div className="relative overflow-hidden bg-white pt-20 pb-20 lg:pt-32 lg:pb-32">
      {/* Premium Background Mesh Gradient Subtlety */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-100 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-50 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="max-w-2xl">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-sm font-semibold mb-8 border border-indigo-100">
              <span className="relative flex h-2 w-2 mr-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              Trusted by 10,000+ happy renters
            </div>
            <h1 className="text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 mb-8 leading-[1.1]">
              Everything you need, <br />
              <span className="text-indigo-600">just a rent away.</span>
            </h1>
            <p className="text-lg text-slate-600 mb-10 max-w-lg leading-relaxed">
              Why buy when you can experience? Join India's premium rental marketplace for cameras, drones, camping gear and more.
            </p>

            <div className="relative max-w-xl">
              <div className="flex flex-col sm:flex-row gap-3 p-2 bg-white rounded-2xl shadow-premium border border-slate-100">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <FiSearch className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-11 pr-4 py-3.5 border-none bg-transparent placeholder-slate-400 focus:ring-0 text-slate-900"
                    placeholder="Search for cameras, drones, more..."
                    value={searchQuery}
                    onChange={(event) => {
                      setSearchQuery(event.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        handleSearchSubmit();
                      }
                    }}
                  />
                  {showSuggestions && searchQuery.trim() && (
                    <div className="absolute top-[calc(100%+12px)] left-0 right-0 bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden z-20">
                      {suggestions.length > 0 ? (
                        suggestions.map((product) => (
                          <button
                            key={product._id}
                            type="button"
                            onClick={() => handleSuggestionClick(product._id)}
                            className="w-full px-4 py-3 text-left hover:bg-slate-50 flex items-center gap-4 transition-colors"
                          >
                            <img
                              src={getImageUrl(product?.images?.[0]) || 'https://via.placeholder.com/60?text=Item'}
                              alt={product?.name}
                              className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-100"
                            />
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-slate-900">{product?.name}</span>
                              <span className="text-xs text-slate-500 truncate max-w-[200px]">{product?.description}</span>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-slate-500">No matching products found</div>
                      )}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleSearchSubmit}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-8 py-3.5 rounded-xl transition-all flex items-center justify-center shadow-lg shadow-slate-200"
                >
                  Explore Now
                  <FiArrowRight className="ml-2" />
                </button>
              </div>
            </div>

            <div className="mt-10 flex items-center gap-4 text-sm font-medium text-slate-500">
              <span className="text-slate-400">Popular:</span>
              <div className="flex gap-2">
                {['Cameras', 'Drones', 'Camping', 'Party'].map(tag => (
                  <span key={tag} className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-full cursor-pointer hover:bg-white hover:border-indigo-400 hover:text-indigo-600 transition-all">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="relative group">
            {/* Main Visual Composition */}
            <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl bg-slate-100 border-[8px] border-white max-w-lg mx-auto aspect-[4/5] transform group-hover:scale-[1.01] transition-transform duration-700">
              {heroSlides.map((slideUrl, index) => (
                <div
                  key={slideUrl}
                  className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out scale-110 ${index === activeSlide ? "opacity-100 scale-100" : "opacity-0"
                    }`}
                  style={{ backgroundImage: `url('${slideUrl}')` }}
                />
              ))}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-60" />
            </div>

            {/* Premium Achievement Badge */}
            <div className="absolute -bottom-6 -right-6 lg:-right-12 bg-white p-6 rounded-3xl shadow-premium border border-slate-50 transform hover:-translate-y-1 transition-transform">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200" />
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 text-yellow-500 mb-0.5">
                    {[1, 2, 3, 4, 5].map(i => (
                      <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                    ))}
                  </div>
                  <p className="text-xs font-bold text-slate-900">4.9/5 Average Rating</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
