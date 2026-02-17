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
  CheckCircle
} from 'lucide-react';
import RealTimeStock from '../components/RealTimeStock';
import ProductList from '../components/ProductList';
import Button from '../components/ui/Button';

const Home = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [hoveredCard, setHoveredCard] = useState(null);

  const heroSlides = [
    {
      title: "Premium Collection 2024",
      subtitle: "Discover the latest trends",
      description: "Explore our curated selection of premium products with unbeatable quality and style.",
      image: "🏆"
    },
    {
      title: "Flash Sale Today",
      subtitle: "Up to 70% Off",
      description: "Limited time offers on your favorite brands. Don't miss out on these incredible deals!",
      image: "⚡"
    },
    {
      title: "Global Shipping",
      subtitle: "Worldwide delivery",
      description: "Fast, secure, and reliable shipping to over 150 countries. Your order, delivered with care.",
      image: "🌍"
    }
  ];

  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast",
      description: "Real-time inventory updates and instant order processing",
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-200"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure & Safe",
      description: "Bank-level security for all your transactions and data",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-200"
    },
    {
      icon: <Truck className="w-8 h-8" />,
      title: "Free Shipping",
      description: "Complimentary shipping on orders over ₹4000 worldwide",
      color: "text-sky-600",
      bg: "bg-sky-50",
      border: "border-sky-200"
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Best Quality",
      description: "Premium products with lifetime warranty and support",
      color: "text-slate-600",
      bg: "bg-slate-50",
      border: "border-slate-200"
    }
  ];

  const stats = [
    { label: "Happy Customers", value: "50K+", icon: <Users className="w-6 h-6" /> },
    { label: "Products Sold", value: "2M+", icon: <ShoppingBag className="w-6 h-6" /> },
    { label: "Countries Served", value: "150+", icon: <Globe className="w-6 h-6" /> },
    { label: "Success Rate", value: "99.9%", icon: <TrendingUp className="w-6 h-6" /> }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Fashion Designer",
      comment: "Amazing quality and lightning-fast delivery! Best shopping experience ever.",
      rating: 5,
      avatar: "SJ"
    },
    {
      name: "Mike Chen",
      role: "Tech Entrepreneur",
      comment: "The real-time inventory system is incredible. Never had stock issues!",
      rating: 5,
      avatar: "MC"
    },
    {
      name: "Emma Davis",
      role: "Interior Designer",
      comment: "Premium products at competitive prices. My go-to marketplace!",
      rating: 5,
      avatar: "ED"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-16 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="inline-flex items-center px-4 py-2 bg-indigo-50 rounded-full text-indigo-700 font-medium"
                >
                  <Star className="w-4 h-4 mr-2" />
                  {heroSlides[currentSlide].subtitle}
                </motion.div>

                <h1 className="text-5xl lg:text-7xl font-black leading-tight text-slate-900">
                  {heroSlides[currentSlide].title}
                </h1>

                <p className="text-xl text-slate-500 leading-relaxed max-w-lg">
                  {heroSlides[currentSlide].description}
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={() => navigate('/products')}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 text-lg font-semibold shadow-sm transform transition-all duration-200"
                    >
                      Shop Now
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </motion.div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/about')}
                    className="flex items-center px-8 py-4 border-2 border-slate-300 text-slate-700 rounded-lg hover:border-slate-500 hover:text-slate-800 transition-all duration-200 font-semibold"
                  >
                    <PlayCircle className="w-5 h-5 mr-2" />
                    Learn More
                  </motion.button>
                </div>
              </motion.div>

              {/* Slide Indicators */}
              <div className="flex space-x-2">
                {heroSlides.map((_, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide
                      ? 'bg-indigo-600 w-8'
                      : 'bg-slate-200 hover:bg-slate-400'
                      }`}
                    whileHover={{ scale: 1.2 }}
                  />
                ))}
              </div>
            </motion.div>

            {/* Hero Visual */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="relative bg-indigo-600 rounded-lg p-16 shadow-sm"
              >
                <div className="text-9xl text-center text-white/90">
                  {heroSlides[currentSlide].image}
                </div>

                {/* Floating Elements */}
                <motion.div
                  animate={{ y: [-10, 10, -10] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center"
                >
                  <Star className="w-8 h-8 text-white" />
                </motion.div>

                <motion.div
                  animate={{ y: [10, -10, 10] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -bottom-4 -left-4 w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center"
                >
                  <Heart className="w-6 h-6 text-white" />
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="text-center bg-white rounded-lg p-6 shadow-sm border border-slate-200"
              >
                <div className="flex justify-center mb-4 text-slate-700">
                  {stat.icon}
                </div>
                <div className="text-3xl font-semibold text-slate-900 mb-2">{stat.value}</div>
                <div className="text-slate-500 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-semibold text-slate-900 mb-6">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-slate-500 max-w-3xl mx-auto">
              Experience the future of online shopping with our cutting-edge features designed for your convenience
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                onHoverStart={() => setHoveredCard(index)}
                onHoverEnd={() => setHoveredCard(null)}
                className={`${feature.bg} ${feature.border} border-2 rounded-lg p-8 text-center transition-all duration-300 ${hoveredCard === index ? 'shadow-sm' : 'shadow-sm'
                  }`}
              >
                <div className={`${feature.color} mb-6 flex justify-center`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-4">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>

                <AnimatePresence>
                  {hoveredCard === index && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      className="mt-4"
                    >
                      <CheckCircle className="w-6 h-6 text-emerald-500 mx-auto" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Sidebar */}
            <motion.aside
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-3 space-y-8"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden"
              >
                <RealTimeStock />
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-slate-50 rounded-lg shadow-sm border border-slate-200 p-6"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mr-4">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800">About Market App</h3>
                </div>
                <p className="text-slate-600 leading-relaxed mb-6">
                  Welcome to our real-time market platform where innovation meets convenience.
                  Experience lightning-fast inventory updates and seamless shopping like never before.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-slate-200 text-slate-700 rounded-full text-sm font-medium">Real-time</span>
                  <span className="px-3 py-1 bg-slate-200 text-slate-700 rounded-full text-sm font-medium">Secure</span>
                  <span className="px-3 py-1 bg-slate-200 text-slate-700 rounded-full text-sm font-medium">Global</span>
                </div>
              </motion.div>

              {/* Quick Links */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-lg shadow-sm border border-slate-200 p-6"
              >
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Links</h3>
                <div className="space-y-3">
                  <motion.button
                    whileHover={{ x: 5 }}
                    onClick={() => navigate('/about')}
                    className="flex items-center text-slate-600 hover:text-indigo-600 transition-colors duration-200 w-full text-left"
                  >
                    <ArrowRight className="w-4 h-4 mr-3" />
                    About Us
                  </motion.button>
                  <motion.button
                    whileHover={{ x: 5 }}
                    onClick={() => navigate('/contact')}
                    className="flex items-center text-slate-600 hover:text-indigo-600 transition-colors duration-200 w-full text-left"
                  >
                    <ArrowRight className="w-4 h-4 mr-3" />
                    Contact Us
                  </motion.button>
                  <motion.button
                    whileHover={{ x: 5 }}
                    onClick={() => navigate('/faq')}
                    className="flex items-center text-slate-600 hover:text-indigo-600 transition-colors duration-200 w-full text-left"
                  >
                    <ArrowRight className="w-4 h-4 mr-3" />
                    FAQ
                  </motion.button>
                </div>
              </motion.div>
            </motion.aside>

            {/* Main Content */}
            <motion.main
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-9"
            >
              <motion.div
                className="bg-indigo-600 rounded-lg shadow-sm p-8 mb-12 text-white relative overflow-hidden"
              >
                <div className="relative z-10">
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-4xl lg:text-5xl font-semibold mb-4"
                  >
                    Featured Products
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-xl opacity-80 mb-6"
                  >
                    Discover our handpicked collection of premium items crafted for excellence
                  </motion.p>
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/products')}
                    className="bg-white text-slate-800 px-6 py-3 rounded-lg font-semibold hover:shadow-sm transition-all duration-200"
                  >
                    View All Products
                  </motion.button>
                </div>
              </motion.div>

              <ProductList />
            </motion.main>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-semibold text-slate-900 mb-6">
              What Our Customers Say
            </h2>
            <p className="text-xl text-slate-500 max-w-3xl mx-auto">
              Join thousands of satisfied customers who trust our platform for their shopping needs
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ y: -10 }}
                className="bg-white rounded-lg p-8 shadow-sm border border-slate-200"
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">{testimonial.name}</h4>
                    <p className="text-slate-500 text-sm">{testimonial.role}</p>
                  </div>
                </div>

                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-amber-400 fill-current" />
                  ))}
                </div>

                <p className="text-slate-600 italic leading-relaxed">
                  "{testimonial.comment}"
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-4xl lg:text-6xl font-semibold mb-6">
              Ready to Start Shopping?
            </h2>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Join millions of happy customers and discover why we're the #1 choice for online shopping
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => navigate('/products')}
                  className="bg-white text-slate-900 hover:bg-slate-100 px-8 py-4 text-lg font-semibold shadow-sm hover:shadow-sm"
                >
                  Start Shopping Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/contact')}
                className="border-2 border-white/30 text-white hover:bg-white hover:text-slate-900 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200"
              >
                Contact Support
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;