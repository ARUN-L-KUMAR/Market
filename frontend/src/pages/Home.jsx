import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Star,
  Zap,
  Shield,
  Truck,
  ArrowRight,
  PlayCircle,
  TrendingUp,
  Users,
  ShoppingBag,
  Heart,
  Award,
  Globe,
  Clock,
  CheckCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  ZapOff,
  Cpu,
  Activity
} from 'lucide-react';
import RealTimeStock from '../components/RealTimeStock';
import ProductList from '../components/ProductList';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

const Home = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      title: "The Nexus Evolution",
      highlight: "Excellence",
      subtitle: "Tier-1 Procurement",
      description: "Harness the power of global logistics and certified authenticity. Curated for those who define the standard.",
      image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=1200",
      accent: "from-primary-600 to-indigo-600",
      stats: { label: "System Latency", value: "< 12ms" }
    },
    {
      title: "Quantum Technology",
      highlight: "Innovation",
      subtitle: "Next-Gen Protocol",
      description: "Architecting the future of consumer tech. Experience performance that transcends boundaries.",
      image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=1200",
      accent: "from-emerald-600 to-teal-600",
      stats: { label: "Active Nodes", value: "1,204" }
    },
    {
      title: "Global Distribution",
      highlight: "Reach",
      subtitle: "Synchronized Logistics",
      description: "A seamless worldwide network ensuring your flagship orders arrive with mathematical precision.",
      image: "https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&q=80&w=1200",
      accent: "from-slate-700 to-slate-900",
      stats: { label: "Uptime Status", value: "99.98%" }
    }
  ];

  const categories = [
    {
      name: 'Hardware',
      items: '2.4k Items',
      color: 'bg-primary-500',
      size: 'lg',
      icon: <Cpu className="w-8 h-8" />,
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200'
    },
    {
      name: 'Wearables',
      items: '840 Items',
      color: 'bg-rose-500',
      size: 'sm',
      icon: <Activity className="w-5 h-5" />,
      image: 'https://images.unsplash.com/photo-1544117518-30df578096a4?auto=format&fit=crop&q=80&w=800'
    },
    {
      name: 'Systems',
      items: '1.1k Items',
      color: 'bg-emerald-500',
      size: 'sm',
      icon: <Layers className="w-5 h-5" />,
      image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=800'
    },
    {
      name: 'Peripherals',
      items: '3k Items',
      color: 'bg-indigo-500',
      size: 'md',
      icon: <ShoppingBag className="w-6 h-6" />,
      image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=1200'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Nexus Hero Section */}
      <section className="relative h-screen flex items-center overflow-hidden bg-slate-950 pt-20">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary-600/20 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/10 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/4" />
        </div>

        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">

            {/* Intel Context */}
            <div className="lg:col-span-7 space-y-12">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-8"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-px bg-primary-500" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary-400">
                      {heroSlides[currentSlide].subtitle}
                    </span>
                  </div>

                  <h1 className="text-7xl lg:text-[100px] font-black leading-[0.9] text-white tracking-tighter font-outfit">
                    {heroSlides[currentSlide].title.split(' ').map((word, i) => (
                      <span key={i} className="block last:text-primary-500 last:premium-gradient-text">
                        {word}
                      </span>
                    ))}
                  </h1>

                  <p className="text-xl text-slate-400 leading-relaxed max-w-xl font-medium">
                    {heroSlides[currentSlide].description}
                  </p>

                  <div className="flex flex-wrap gap-6 pt-6">
                    <button
                      onClick={() => navigate('/products')}
                      className="inline-flex items-center justify-center rounded-2xl px-12 py-5 bg-white text-slate-950 font-black font-outfit uppercase tracking-widest text-lg hover:scale-105 hover:bg-primary-50 transition-all duration-300 shadow-xl"
                    >
                      Initialize Catalog
                    </button>
                    <div className="flex items-center gap-6 px-6 border-l border-white/10">
                      <div className="space-y-1">
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">{heroSlides[currentSlide].stats.label}</p>
                        <p className="text-sm font-black text-white font-outfit uppercase">{heroSlides[currentSlide].stats.value}</p>
                      </div>
                      <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center">
                        <Activity className="w-4 h-4 text-primary-500 animate-pulse" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Progress Indicators */}
              <div className="flex items-center gap-4 pt-10">
                {heroSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className="group relative h-12 w-1 flex items-center"
                  >
                    <div className={`w-full transition-all duration-700 rounded-full ${index === currentSlide ? 'bg-primary-500 h-full' : 'bg-white/10 h-4 group-hover:bg-white/30'
                      }`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Manifest */}
            <div className="lg:col-span-5 relative hidden lg:block">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 1.1, rotate: 5 }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                  className="relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/5"
                >
                  <img
                    src={heroSlides[currentSlide].image}
                    alt=""
                    className="w-full h-full object-cover transition-transform duration-[8s] scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />

                  <div className="absolute bottom-12 left-12 right-12 glass-morphism p-8 rounded-[2rem] border border-white/10 shadow-2xl">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <h4 className="text-sm font-black text-white font-outfit uppercase tracking-wider">Certified Asset</h4>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                      Every item undergoes multi-stage verification before listing.
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Category Bento Section */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-20">
            <div className="space-y-6">
              <Badge variant="neutral" className="bg-slate-50 text-slate-400 font-black border-none uppercase tracking-widest px-4">Sector Analysis</Badge>
              <h2 className="text-5xl lg:text-6xl font-black text-slate-950 tracking-tight font-outfit">
                Strategic <span className="premium-gradient-text">Verticals</span>
              </h2>
            </div>
            <p className="text-slate-500 font-medium max-w-sm">
              Systematic categorization for high-efficiency procurement across entire product ecosystems.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 min-h-[600px]">
            {categories.map((cat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                onClick={() => navigate(`/products?category=${cat.name.toLowerCase()}`)}
                className={`relative rounded-[2.5rem] overflow-hidden group cursor-pointer shadow-premium ${cat.size === 'lg' ? 'md:col-span-2 md:row-span-2' :
                  cat.size === 'md' ? 'md:col-span-2' : ''
                  }`}
              >
                {/* Background Image */}
                <div className="absolute inset-0">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className={`absolute inset-0 ${cat.color} opacity-20 group-hover:opacity-10 transition-opacity`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80" />
                </div>

                <div className="absolute inset-x-8 bottom-8 z-10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center group-hover:bg-primary-500 group-hover:border-primary-400 transition-all duration-500">
                      <div className="text-white group-hover:scale-110 transition-transform">
                        {cat.icon}
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-x-4 group-hover:translate-x-0">
                      <ArrowRight className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-3xl font-black font-outfit uppercase tracking-tighter text-white group-hover:text-primary-400 transition-colors">
                      {cat.name}
                    </h3>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">
                        {cat.items}
                      </span>
                      <div className="h-px w-8 bg-white/20" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Display + Pulse Section */}
      <section className="py-32 bg-slate-50 relative overflow-hidden">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            {/* Pulse Feed Sidebar */}
            <aside className="lg:col-span-3 space-y-8 h-fit lg:sticky lg:top-32">
              <div className="space-y-2 mb-8">
                <h3 className="text-xl font-black font-outfit text-slate-950 uppercase tracking-tight">System Pulse</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Real-time Node Status</p>
              </div>
              <Card className="border-none shadow-premium bg-white p-0 rounded-[2.5rem] overflow-hidden">
                <RealTimeStock />
              </Card>
              <div className="p-8 bg-slate-950 rounded-[2.5rem] space-y-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary-600/30 blur-3xl rounded-full" />
                <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary-400" /> Member Insights
                </h4>
                <p className="text-[10px] font-medium text-slate-400 leading-relaxed uppercase tracking-widest">
                  Access deep analytics and tiered procurement options for registered nodes.
                </p>
                <Button variant="link" className="text-primary-400 p-0 h-auto font-black uppercase tracking-widest text-[9px]">
                  Access Interface <ArrowRight className="ml-2 w-3 h-3" />
                </Button>
              </div>
            </aside>

            {/* Master Collection Feed */}
            <main className="lg:col-span-9 space-y-16">
              <div className="flex items-end justify-between border-b border-slate-200 pb-10">
                <div className="space-y-4">
                  <h2 className="text-4xl lg:text-5xl font-black text-slate-950 font-outfit tracking-tighter uppercase">
                    Master <span className="premium-gradient-text">Intelligence</span>
                  </h2>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Active Inventory Sync</span>
                  </div>
                </div>
                <Button variant="outline" className="rounded-2xl border-slate-200 font-black uppercase tracking-widest text-[10px] h-12">
                  Expand Archives
                </Button>
              </div>
              <ProductList />
            </main>
          </div>
        </div>
      </section>

      {/* Elite CTA */}
      <section className="py-40 bg-slate-950 relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-grid-white opacity-[0.03] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-primary-600/10 blur-[150px] rounded-full" />

        <div className="container mx-auto px-6 max-w-4xl relative z-10 space-y-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <Badge variant="primary" className="bg-primary-500/10 text-primary-400 border-primary-500/20 font-black tracking-[0.4em] px-6">Mission Critical</Badge>
            <h2 className="text-6xl lg:text-[110px] font-black text-white tracking-tighter leading-[0.85] font-outfit uppercase">
              Secure Your <br />
              <span className="premium-gradient-text">Succession.</span>
            </h2>
            <p className="text-xl lg:text-2xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed text-balance">
              The most sophisticated procurement framework for the modern technical elite.
            </p>
          </motion.div>

          <div className="flex flex-col sm:flex-row gap-8 justify-center pt-8">
            <button
              onClick={() => navigate('/products')}
              className="inline-flex items-center justify-center lg:min-w-[300px] px-10 py-5 rounded-[2rem] bg-white text-slate-950 font-black font-outfit uppercase tracking-widest text-lg shadow-[0_20px_50px_rgba(255,255,255,0.1)] hover:scale-105 hover:bg-primary-50 transition-all duration-300"
            >
              Join the Circle
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="inline-flex items-center justify-center lg:min-w-[240px] px-10 py-5 rounded-[2rem] bg-slate-900 text-white border border-white/10 font-black font-outfit uppercase tracking-widest text-lg hover:bg-slate-800 transition-colors"
            >
              Support Node
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
