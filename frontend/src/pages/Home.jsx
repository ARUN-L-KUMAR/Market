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
      image: "🏆",
      gradient: "from-purple-600 via-pink-600 to-red-600"
    },
    {
      title: "Flash Sale Today",
      subtitle: "Up to 70% Off",
      description: "Limited time offers on your favorite brands. Don't miss out on these incredible deals!",
      image: "⚡",
      gradient: "from-blue-600 via-cyan-600 to-teal-600"
    },
    {
      title: "Global Shipping",
      subtitle: "Worldwide delivery",
      description: "Fast, secure, and reliable shipping to over 150 countries. Your order, delivered with care.",
      image: "🌍",
      gradient: "from-green-600 via-emerald-600 to-cyan-600"
    }
  ];

  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast",
      description: "Real-time inventory updates and instant order processing",
      color: "text-yellow-600",
      bg: "bg-yellow-50",
      border: "border-yellow-200"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure & Safe",
      description: "Bank-level security for all your transactions and data",
      color: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-200"
    },
    {
      icon: <Truck className="w-8 h-8" />,
      title: "Free Shipping",
      description: "Complimentary shipping on orders over ₹4000 worldwide",
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200"
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Best Quality",
      description: "Premium products with lifetime warranty and support",
      color: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-200"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-12 max-w-7xl">
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
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full text-purple-700 font-medium"
                >
                  <Star className="w-4 h-4 mr-2" />
                  {heroSlides[currentSlide].subtitle}
                </motion.div>

                <h1 className={`text-5xl lg:text-7xl font-black leading-tight bg-gradient-to-r ${heroSlides[currentSlide].gradient} bg-clip-text text-transparent`}>
                  {heroSlides[currentSlide].title}
                </h1>

                <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                  {heroSlides[currentSlide].description}
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      onClick={() => navigate('/products')}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transform transition-all duration-200"
                    >
                      Shop Now
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </motion.div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/about')}
                    className="flex items-center px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-purple-500 hover:text-purple-600 transition-all duration-200 font-semibold"
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
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentSlide 
                        ? 'bg-purple-600 w-8' 
                        : 'bg-gray-300 hover:bg-purple-400'
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
                initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.6 }}
                className={`relative bg-gradient-to-br ${heroSlides[currentSlide].gradient} rounded-3xl p-16 shadow-2xl transform hover:scale-105 transition-transform duration-300`}
              >
                <div className="text-9xl text-center text-white/90">
                  {heroSlides[currentSlide].image}
                </div>
                
                {/* Floating Elements */}
                <motion.div
                  animate={{ y: [-10, 10, -10] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -top-4 -right-4 w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center"
                >
                  <Star className="w-8 h-8 text-white" />
                </motion.div>
                
                <motion.div
                  animate={{ y: [10, -10, 10] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -bottom-4 -left-4 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center"
                >
                  <Heart className="w-6 h-6 text-white" />
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Background Elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
            className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-r from-purple-200/30 to-pink-200/30 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-r from-blue-200/30 to-cyan-200/30 rounded-full blur-3xl"
          />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/50 backdrop-blur-sm">
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
                className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
              >
                <div className="flex justify-center mb-4 text-purple-600">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-800 mb-2">{stat.value}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
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
            <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-800 to-pink-800 bg-clip-text text-transparent mb-6">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
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
                whileHover={{ y: -10, scale: 1.05 }}
                onHoverStart={() => setHoveredCard(index)}
                onHoverEnd={() => setHoveredCard(null)}
                className={`${feature.bg} ${feature.border} border-2 rounded-3xl p-8 text-center transition-all duration-300 ${
                  hoveredCard === index ? 'shadow-2xl' : 'shadow-lg'
                }`}
              >
                <motion.div
                  animate={hoveredCard === index ? { rotate: 360 } : { rotate: 0 }}
                  transition={{ duration: 0.5 }}
                  className={`${feature.color} mb-6 flex justify-center`}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                
                <AnimatePresence>
                  {hoveredCard === index && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      className="mt-4"
                    >
                      <CheckCircle className="w-6 h-6 text-green-500 mx-auto" />
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
                className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden"
              >
                <RealTimeStock />
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl shadow-xl border border-purple-100 p-6"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-4">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-purple-800">About Market App</h3>
                </div>
                <p className="text-gray-700 leading-relaxed mb-6">
                  Welcome to our real-time market platform where innovation meets convenience. 
                  Experience lightning-fast inventory updates and seamless shopping like never before.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">Real-time</span>
                  <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-medium">Secure</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">Global</span>
                </div>
              </motion.div>

              {/* Quick Links */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6"
              >
                <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Links</h3>
                <div className="space-y-3">
                  <motion.button
                    whileHover={{ x: 5 }}
                    onClick={() => navigate('/about')}
                    className="flex items-center text-gray-600 hover:text-purple-600 transition-colors duration-200 w-full text-left"
                  >
                    <ArrowRight className="w-4 h-4 mr-3" />
                    About Us
                  </motion.button>
                  <motion.button
                    whileHover={{ x: 5 }}
                    onClick={() => navigate('/contact')}
                    className="flex items-center text-gray-600 hover:text-purple-600 transition-colors duration-200 w-full text-left"
                  >
                    <ArrowRight className="w-4 h-4 mr-3" />
                    Contact Us
                  </motion.button>
                  <motion.button
                    whileHover={{ x: 5 }}
                    onClick={() => navigate('/faq')}
                    className="flex items-center text-gray-600 hover:text-purple-600 transition-colors duration-200 w-full text-left"
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
                whileHover={{ scale: 1.01 }}
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl shadow-2xl p-8 mb-12 text-white relative overflow-hidden"
              >
                <div className="relative z-10">
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-4xl lg:text-5xl font-bold mb-4"
                  >
                    Featured Products
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-xl opacity-90 mb-6"
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
                    className="bg-white text-purple-600 px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
                  >
                    View All Products
                  </motion.button>
                </div>

                {/* Background Animation */}
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360]
                  }}
                  transition={{ duration: 20, repeat: Infinity }}
                  className="absolute -top-16 -right-16 w-48 h-48 bg-white/10 rounded-full"
                />
                <motion.div
                  animate={{ 
                    scale: [1.2, 1, 1.2],
                    rotate: [360, 180, 0]
                  }}
                  transition={{ duration: 15, repeat: Infinity }}
                  className="absolute -bottom-16 -left-16 w-48 h-48 bg-white/10 rounded-full"
                />
              </motion.div>

              <ProductList />
            </motion.main>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-800 to-pink-800 bg-clip-text text-transparent mb-6">
              What Our Customers Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
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
                className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20"
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <p className="text-gray-700 italic leading-relaxed">
                  "{testimonial.comment}"
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600 text-white relative overflow-hidden">
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-4xl lg:text-6xl font-bold mb-6">
              Ready to Start Shopping?
            </h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Join millions of happy customers and discover why we're the #1 choice for online shopping
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => navigate('/products')}
                  className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl"
                >
                  Start Shopping Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/contact')}
                className="border-2 border-white text-white hover:bg-white hover:text-purple-600 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200"
              >
                Contact Support
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Background Animation */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full"
        />
      </section>
    </div>
  );
};

export default Home; 