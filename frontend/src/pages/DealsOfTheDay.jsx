import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Button from '../components/ui/Button';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import CurrencyPrice from '../components/CurrencyPrice';

const DealsOfTheDay = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({});
  const [currentDealIndex, setCurrentDealIndex] = useState(0);

  useEffect(() => {
    fetchDeals();
    
    // Update countdown every second
    const timer = setInterval(() => {
      updateCountdown();
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      
      // Fetch products with deals/discounts
      const response = await axios.get(`${apiUrl}/api/products?deals=true&limit=20`);
      const products = response.data.products || [];
      
      // Mock deal data with different discount percentages and end times
      const dealsWithOffers = products.map((product, index) => ({
        ...product,
        originalPrice: product.price,
        discountPercentage: [20, 30, 40, 50, 15, 25, 35][index % 7],
        dealEndTime: new Date(Date.now() + (Math.random() * 24 + 1) * 60 * 60 * 1000), // Random 1-24 hours
        dealType: ['flash', 'daily', 'weekly'][index % 3],
        soldCount: Math.floor(Math.random() * 100),
        totalStock: Math.floor(Math.random() * 50) + 50
      }));

      // Calculate discounted prices
      const processedDeals = dealsWithOffers.map(deal => ({
        ...deal,
        discountedPrice: deal.originalPrice * (1 - deal.discountPercentage / 100)
      }));

      setDeals(processedDeals);
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateCountdown = () => {
    const now = new Date().getTime();
    const newTimeLeft = {};

    deals.forEach((deal, index) => {
      const endTime = new Date(deal.dealEndTime).getTime();
      const difference = endTime - now;

      if (difference > 0) {
        newTimeLeft[index] = {
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        };
      } else {
        newTimeLeft[index] = { hours: 0, minutes: 0, seconds: 0 };
      }
    });

    setTimeLeft(newTimeLeft);
  };

  const formatCountdown = (time) => {
    if (!time) return '00:00:00';
    const { hours = 0, minutes = 0, seconds = 0 } = time;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = (soldCount, totalStock) => {
    return Math.min((soldCount / totalStock) * 100, 100);
  };

  const featuredDeal = deals[currentDealIndex];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          🔥 Deals of the Day
        </h1>
        <p className="text-xl text-gray-600 mb-6">
          Amazing discounts that won't last long!
        </p>
        <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">Limited Time Offers</span>
        </div>
      </div>

      {/* Featured Deal Hero */}
      {featuredDeal && (
        <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-3xl overflow-hidden mb-12 text-white">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center">
            <div className="p-8 lg:p-12">
              <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-sm font-medium mb-4">
                <span className="animate-pulse w-2 h-2 bg-white rounded-full"></span>
                Featured Deal
              </div>
              
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                {featuredDeal.title}
              </h2>
              
              <div className="flex items-center gap-4 mb-6">
                <span className="text-4xl font-bold">
                  <CurrencyPrice price={featuredDeal.discountedPrice} />
                </span>
                <div className="text-lg">
                  <span className="line-through text-white/70">
                    <CurrencyPrice price={featuredDeal.originalPrice} />
                  </span>
                  <span className="ml-2 bg-white/20 px-2 py-1 rounded text-sm font-bold">
                    {featuredDeal.discountPercentage}% OFF
                  </span>
                </div>
              </div>

              {/* Countdown Timer */}
              <div className="bg-white/10 rounded-xl p-4 mb-6">
                <p className="text-sm font-medium mb-2">Deal ends in:</p>
                <div className="text-2xl font-bold font-mono">
                  {formatCountdown(timeLeft[currentDealIndex])}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span>Sold: {featuredDeal.soldCount}</span>
                  <span>Available: {featuredDeal.totalStock - featuredDeal.soldCount}</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-white h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getProgressPercentage(featuredDeal.soldCount, featuredDeal.totalStock)}%` }}
                  ></div>
                </div>
              </div>

              <Link to={`/products/${featuredDeal._id}`}>
                <Button size="lg" className="bg-white text-red-500 hover:bg-gray-100">
                  Shop Now
                </Button>
              </Link>
            </div>

            <div className="p-8 lg:p-12">
              <img
                src={featuredDeal.images?.[0]?.url || '/placeholder-image.jpg'}
                alt={featuredDeal.title}
                className="w-full h-64 lg:h-80 object-cover rounded-2xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* Flash Sales Section */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            ⚡ Flash Sales
          </h2>
          <div className="text-sm text-gray-600">
            {deals.filter(deal => deal.dealType === 'flash').length} items
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {deals
            .filter(deal => deal.dealType === 'flash')
            .slice(0, 8)
            .map((deal, index) => (
            <div key={deal._id} className="bg-white rounded-2xl shadow-subtle border border-gray-200 overflow-hidden group hover:shadow-lg transition-all duration-300">
              {/* Deal Badge */}
              <div className="relative">
                <img
                  src={deal.images?.[0]?.url || '/placeholder-image.jpg'}
                  alt={deal.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                  -{deal.discountPercentage}%
                </div>
                <div className="absolute top-3 right-3 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
                  {formatCountdown(timeLeft[deals.indexOf(deal)])}
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                  {deal.title}
                </h3>
                
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg font-bold text-red-600">
                    <CurrencyPrice price={deal.discountedPrice} />
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    <CurrencyPrice price={deal.originalPrice} />
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Sold: {deal.soldCount}</span>
                    <span>{deal.totalStock - deal.soldCount} left</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-red-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${getProgressPercentage(deal.soldCount, deal.totalStock)}%` }}
                    ></div>
                  </div>
                </div>

                <Link to={`/products/${deal._id}`}>
                  <Button size="sm" className="w-full">
                    Buy Now
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Deals Section */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            📅 Daily Deals
          </h2>
          <div className="text-sm text-gray-600">
            Valid for 24 hours
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deals
            .filter(deal => deal.dealType === 'daily')
            .slice(0, 6)
            .map((deal) => (
            <div key={deal._id} className="bg-white rounded-2xl shadow-subtle border border-gray-200 overflow-hidden">
              <div className="flex">
                <img
                  src={deal.images?.[0]?.url || '/placeholder-image.jpg'}
                  alt={deal.title}
                  className="w-24 h-24 object-cover"
                />
                <div className="flex-1 p-4">
                  <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 text-sm">
                    {deal.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-bold text-orange-600">
                      <CurrencyPrice price={deal.discountedPrice} />
                    </span>
                    <span className="text-xs text-gray-500 line-through">
                      <CurrencyPrice price={deal.originalPrice} />
                    </span>
                    <span className="text-xs bg-orange-100 text-orange-700 px-1 py-0.5 rounded">
                      -{deal.discountPercentage}%
                    </span>
                  </div>

                  <div className="text-xs text-gray-500">
                    Ends: {formatCountdown(timeLeft[deals.indexOf(deal)])}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Specials */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            🗓️ Weekly Specials
          </h2>
          <Link to="/products?deals=true" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View All Deals →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {deals
            .filter(deal => deal.dealType === 'weekly')
            .slice(0, 4)
            .map((deal) => (
            <ProductCard
              key={deal._id}
              product={{
                ...deal,
                price: deal.discountedPrice,
                originalPrice: deal.originalPrice,
                discount: deal.discountPercentage
              }}
              showDiscount={true}
            />
          ))}
        </div>
      </div>

      {/* Newsletter Signup */}
      <div className="mt-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-8 text-center text-white">
        <h3 className="text-2xl font-bold mb-4">
          Never Miss a Deal!
        </h3>
        <p className="text-lg mb-6 text-blue-100">
          Subscribe to get notified about exclusive offers and flash sales
        </p>
        <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 px-4 py-3 rounded-lg text-gray-800"
          />
          <Button className="bg-white text-blue-600 hover:bg-gray-100">
            Subscribe
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DealsOfTheDay;
