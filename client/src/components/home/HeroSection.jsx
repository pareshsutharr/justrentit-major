import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiArrowRight } from 'react-icons/fi';
import cameraImage from '../../assets/camera.png';
import tentImage from '../../assets/tant.png';
import chairImage from '../../assets/chair.png';
import shoesImage from '../../assets/shoes.png';
import { getApiBaseUrl, getImageUrl } from '../../utils/productHelpers';

const heroSlides = [
  cameraImage,
  tentImage,
  chairImage,
  shoesImage,
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
    }, 3200);

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
    <div className="relative overflow-hidden bg-white">
      {/* Background decoration */}
      <div className="absolute inset-y-0 right-0 w-1/2 bg-gray-50 rounded-l-[100px] -z-10 hidden lg:block" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 lg:pb-40">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="max-w-2xl">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-primary mr-2" />
              Rent over 10,000+ items locally
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-gray-900 mb-6 leading-tight">
              Rent <span className="text-primary">anything</span>, <br className="hidden md:block" /> 
              anywhere, anytime.
            </h1>
            <p className="text-xl text-gray-500 mb-10 max-w-lg leading-relaxed">
              Why buy when you can rent? Access premium cameras, power tools, party supplies, and more from people in your neighborhood.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input 
                  type="text" 
                  className="block w-full pl-11 pr-4 py-4 border-none rounded-xl bg-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-primary focus:bg-white transition-shadow text-base"
                  placeholder="What are you looking for today?"
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      handleSearchSubmit();
                    }
                  }}
                />
                {showSuggestions && searchQuery.trim() && (
                  <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-20">
                    {suggestions.length > 0 ? (
                      suggestions.map((product) => (
                        <button
                          key={product._id}
                          type="button"
                          onClick={() => handleSuggestionClick(product._id)}
                          className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                        >
                          <img
                            src={getImageUrl(product?.images?.[0]) || 'https://via.placeholder.com/60?text=Item'}
                            alt={product?.name || 'Product'}
                            className="w-10 h-10 rounded-md object-cover bg-gray-100"
                          />
                          <span className="text-sm text-gray-800 truncate">{product?.name || 'Untitled Product'}</span>
                        </button>
                      ))
                    ) : (
                      <p className="px-3 py-2 text-sm text-gray-500">No matching products found</p>
                    )}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handleSearchSubmit}
                className="flex-shrink-0 bg-gray-900 hover:bg-gray-800 text-white font-medium px-8 py-4 rounded-xl transition-colors flex items-center justify-center"
              >
                Search Now
                <FiArrowRight className="ml-2" />
              </button>
            </div>
            
            <div className="mt-10 flex items-center gap-6 text-sm text-gray-500">
              <span>Popular:</span>
              <div className="flex gap-3">
                <span className="px-3 py-1 bg-white border border-gray-200 rounded-full cursor-pointer hover:border-primary hover:text-primary transition-colors">Cameras</span>
                <span className="px-3 py-1 bg-white border border-gray-200 rounded-full cursor-pointer hover:border-primary hover:text-primary transition-colors">Drones</span>
                <span className="px-3 py-1 bg-white border border-gray-200 rounded-full cursor-pointer hover:border-primary hover:text-primary transition-colors">Projectors</span>
              </div>
            </div>
          </div>
          
          <div className="relative lg:h-[750px] flex items-center justify-center">
            {/* Image Placeholder - A polished modern composition */}
            <div className="relative w-full aspect-square md:aspect-[4/3] lg:aspect-auto lg:h-full rounded-3xl overflow-hidden " > 
               {heroSlides.map((slideUrl, index) => (
                 <div
                   key={slideUrl} 
                   className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
                     index === activeSlide ? "opacity-100" : "opacity-0"
                   }`}
                   style={{ backgroundImage: `url('${slideUrl}')` }}
                 />
               ))}
               <div className="absolute inset-0 bg-black/10" style={{background:"none"}} />
            </div>
            
            {/* Floating UI Elements */}
            {/* <div className="absolute -left-8 top-1/4 bg-white p-4 rounded-2xl shadow-xl animate-bounce-slow">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">
                  ₹450
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Saved today</p>
                  <p className="text-sm font-bold text-gray-900">Sony A7III</p>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
