import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Zap,
  Clock,
  TrendingUp,
  ShoppingBag,
  ArrowRight,
  Timer,
  Calendar,
  Star,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import CurrencyPrice from '../components/CurrencyPrice';

const DealsOfTheDay = () => {
  const navigate = useNavigate();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({});
  const [currentDealIndex, setCurrentDealIndex] = useState(0);

  useEffect(() => {
    fetchDeals();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      updateCountdown();
    }, 1000);

    return () => clearInterval(timer);
  }, [deals.length]);

  useEffect(() => {
    if (deals.length === 0) return;

    const slideTimer = setInterval(() => {
      setCurrentDealIndex((prev) => (prev + 1) % Math.min(deals.length, 5));
    }, 8000);

    return () => clearInterval(slideTimer);
  }, [deals.length]);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await axios.get(`${apiUrl}/api/products?limit=40`);
      const products = response.data.products || [];

      const dealsWithOffers = products.map((product, index) => {
        // Distribute deals: first 12 are flash, then daily/weekly
        let dealType = 'flash';
        if (index >= 12) {
          dealType = index % 2 === 0 ? 'daily' : 'weekly';
        }

        const discountPercentage = [25, 30, 40, 50, 20, 35, 45, 15, 55, 10][index % 10];
        const originalPrice = product.price;
        const discountedPrice = originalPrice * (1 - discountPercentage / 100);

        return {
          ...product,
          originalPrice,
          discountedPrice,
          discountPercentage,
          dealEndTime: new Date(Date.now() + (Math.random() * 24 + 1) * 60 * 60 * 1000),
          dealType,
          soldCount: Math.floor(Math.random() * 40) + 10,
          totalStock: 100
        };
      });

      setDeals(dealsWithOffers);
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
    return <LoadingSpinner text="Curating Limited Offers..." />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section - Nexus Style */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.03),transparent)] -z-10" />
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center text-center space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-600 border border-primary-100/50 shadow-sm transition-all duration-300">
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Priority Archive</span>
            </div>
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight font-outfit">
                Deals of the <span className="text-primary-600">Day</span>
              </h1>
              <p className="text-lg text-slate-500 max-w-2xl font-medium leading-relaxed">
                Premium assets curated for immediate acquisition. High-tier procurement at unprecedented value.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 pb-24 space-y-32">
        {/* Featured Deal - Modern Hero Slider */}
        <section className="relative">
          <AnimatePresence mode="wait">
            {deals.length > 0 && featuredDeal && (
              <motion.div
                key={currentDealIndex}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative overflow-hidden rounded-[3rem] bg-white border border-slate-100 shadow-premium-lg group min-h-[500px] flex flex-col lg:flex-row"
              >
                {/* Content Side */}
                <div className="lg:w-7/12 p-8 md:p-16 flex flex-col justify-center space-y-8 relative z-10">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center gap-3 text-primary-600">
                      <div className="h-px w-6 bg-current" />
                      <span className="text-[10px] font-bold tracking-widest uppercase">
                        Priority Offer {currentDealIndex + 1} of {Math.min(deals.length, 5)}
                      </span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold font-outfit text-slate-900 leading-tight">
                      {featuredDeal.title}
                    </h2>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-wrap items-center gap-6"
                  >
                    <CurrencyPrice
                      price={featuredDeal.discountedPrice}
                      size="6xl"
                      variant="nexus"
                      weight="bold"
                      showDecimals={false}
                    />
                    <div className="flex flex-col justify-center border-l border-slate-200 pl-6 h-12">
                      <CurrencyPrice
                        price={featuredDeal.originalPrice}
                        size="sm"
                        color="text-slate-400"
                        weight="bold"
                        className="line-through"
                        showDecimals={false}
                      />
                      <span className="text-primary-600 text-xs font-bold uppercase tracking-widest mt-1">
                        Save {Math.round(featuredDeal.originalPrice - featuredDeal.discountedPrice).toLocaleString()} Credits
                      </span>
                    </div>
                  </motion.div>

                  {/* Refined Countdown */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center gap-6 p-1 bg-slate-50 rounded-2xl border border-slate-100 max-w-fit pr-6"
                  >
                    <div className="flex flex-col items-center justify-center bg-white rounded-xl px-4 py-2 shadow-sm border border-slate-100">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Time Limit</span>
                      <div className="text-xl font-bold font-mono text-primary-600">
                        {formatCountdown(timeLeft[currentDealIndex])}
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Allocation</span>
                      <div className="flex items-center gap-2">
                        <div className="text-lg font-bold text-slate-900">
                          {getProgressPercentage(featuredDeal.soldCount, featuredDeal.totalStock).toFixed(0)}%
                        </div>
                        <div className="text-[10px] font-medium text-slate-400">Claimed</div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="pt-4 flex flex-wrap items-center gap-8"
                  >
                    <button
                      onClick={() => navigate(`/products/${featuredDeal._id}`)}
                      className="h-14 px-10 bg-slate-950 text-white rounded-2xl font-bold text-sm tracking-widest uppercase hover:bg-primary-600 transition-all duration-300 shadow-xl hover:shadow-primary-600/20 group flex items-center gap-3"
                    >
                      Secure Resource
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>

                    {/* Navigation Dots */}
                    <div className="flex items-center gap-3">
                      {[...Array(Math.min(deals.length, 5))].map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentDealIndex(index)}
                          className={`h-1.5 rounded-full transition-all duration-500 ${index === currentDealIndex ? 'w-8 bg-primary-600' : 'w-2 bg-slate-200 hover:bg-slate-300'
                            }`}
                        />
                      ))}
                    </div>
                  </motion.div>
                </div>

                {/* Image Side */}
                <div className="lg:w-5/12 relative min-h-[400px] overflow-hidden">
                  <motion.img
                    key={`img-${currentDealIndex}`}
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.2 }}
                    src={featuredDeal.images?.[0]?.url || 'https://placehold.co/800x800?text=Premium+Deal'}
                    alt={featuredDeal.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-transparent opacity-60 lg:block hidden" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Flash Sales Section */}
        <section className="space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-100 pb-10">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary-600">
                <Timer className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Active Operations</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold font-outfit text-slate-900">
                Flash <span className="text-primary-600">Sales</span>
              </h2>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {deals.filter(d => d.dealType === 'flash').length} Units Active
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <AnimatePresence>
              {deals
                .filter(deal => deal.dealType === 'flash')
                .slice(0, 8)
                .map((deal, idx) => (
                  <motion.div
                    key={deal._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <div
                      onClick={() => navigate(`/products/${deal._id}`)}
                      className="group relative bg-white rounded-[2rem] border border-slate-100 shadow-premium hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col h-full cursor-pointer"
                    >
                      <div className="relative aspect-square overflow-hidden bg-slate-50">
                        <img
                          src={deal.images?.[0]?.url || 'https://placehold.co/400x400?text=Deal'}
                          alt={deal.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                        />
                        <div className="absolute top-4 left-4">
                          <div className="px-3 py-1.5 bg-rose-500/90 backdrop-blur-md text-white font-bold text-[10px] rounded-full shadow-lg shadow-rose-500/10">
                            -{deal.discountPercentage}%
                          </div>
                        </div>
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="px-3 py-2 bg-slate-900/80 backdrop-blur-md rounded-xl flex items-center justify-between text-white border border-white/10">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-white/60">Limit</span>
                            <span className="text-xs font-bold font-mono">{formatCountdown(timeLeft[deals.indexOf(deal)])}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 flex-1 flex flex-col space-y-5">
                        <div className="space-y-3">
                          <h3 className="font-bold text-slate-800 text-sm group-hover:text-primary-600 transition-colors line-clamp-1">
                            {deal.title}
                          </h3>
                          <div className="flex flex-col space-y-1">
                            <div className="flex items-center gap-2">
                              <CurrencyPrice
                                price={deal.discountedPrice}
                                size="xl"
                                variant="nexus"
                                weight="bold"
                                showDecimals={false}
                              />
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                                -{deal.discountPercentage}%
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                              Reg. <CurrencyPrice price={deal.originalPrice} size="xs" showDecimals={false} color="text-slate-400" />
                            </span>
                          </div>
                        </div>

                        {/* Progress Tracker */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-slate-400">
                            <span>Depletion</span>
                            <span className="text-slate-900">{getProgressPercentage(deal.soldCount, deal.totalStock).toFixed(0)}%</span>
                          </div>
                          <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: `${getProgressPercentage(deal.soldCount, deal.totalStock)}%` }}
                              className="h-full bg-primary-600 rounded-full"
                            />
                          </div>
                        </div>

                        <button
                          className="w-full h-10 bg-slate-50 text-slate-900 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-950 hover:text-white transition-all duration-300"
                        >
                          Access Asset
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>
        </section>

        {/* Daily and Weekly Combined */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* Daily Selection */}
          <div className="space-y-10">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-600">
                <Calendar className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">24H Selection</span>
              </div>
              <h2 className="text-3xl font-bold font-outfit text-slate-900">Daily Archive</h2>
            </div>

            <div className="space-y-4">
              {deals
                .filter(deal => deal.dealType === 'daily')
                .slice(0, 4)
                .map((deal, idx) => (
                  <motion.div
                    key={deal._id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <div
                      onClick={() => navigate(`/products/${deal._id}`)}
                      className="group bg-white p-4 rounded-3xl border border-slate-100 hover:shadow-premium transition-all cursor-pointer flex gap-6 items-center"
                    >
                      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-50 shrink-0">
                        <img src={deal.images?.[0]?.url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <h3 className="font-bold text-slate-800 group-hover:text-primary-600 transition-colors line-clamp-1">{deal.title}</h3>
                        <div className="flex items-center gap-3">
                          <CurrencyPrice price={deal.discountedPrice} variant="nexus" weight="bold" showDecimals={false} size="lg" />
                          <div className="px-2 py-0.5 bg-emerald-50 text-emerald-600 font-bold text-[9px] rounded-full">-{deal.discountPercentage}%</div>
                        </div>
                        <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                          <Timer className="w-3 h-3" /> {formatCountdown(timeLeft[deals.indexOf(deal)])} Remaining
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>

          {/* Weekly showcase */}
          <div className="space-y-10">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-indigo-600">
                <Star className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Weekly Showcase</span>
              </div>
              <h2 className="text-3xl font-bold font-outfit text-slate-900">Curation Tier</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {deals
                .filter(deal => deal.dealType === 'weekly')
                .slice(0, 2)
                .map((deal, idx) => (
                  <motion.div
                    key={deal._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.2 }}
                  >
                    <ProductCard
                      product={{
                        ...deal,
                        price: deal.discountedPrice,
                        originalPrice: deal.originalPrice
                      }}
                    />
                  </motion.div>
                ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="relative overflow-hidden rounded-[3rem] bg-slate-900 p-12 md:p-20 text-center group">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.1),transparent)]" />
            <div className="max-w-2xl mx-auto space-y-10 relative z-10">
              <div className="space-y-4">
                <h3 className="text-3xl md:text-4xl font-bold font-outfit text-white">Never miss a priority offer.</h3>
                <p className="text-slate-400 font-medium leading-relaxed">
                  Join our distribution network for real-time notifications on unreleased deals and private tier sales.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Professional email address"
                  className="flex-1 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:bg-white/10 focus:border-primary-500 transition-all font-medium text-sm"
                />
                <button className="h-14 px-10 rounded-2xl bg-white text-slate-950 font-bold text-xs uppercase tracking-widest hover:bg-primary-500 hover:text-white transition-all shadow-xl">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DealsOfTheDay;
