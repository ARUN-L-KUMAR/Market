import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Star, 
  Users, 
  Award, 
  Globe, 
  Heart, 
  Zap,
  Shield,
  Target,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Mail,
  Phone
} from 'lucide-react';
import Button from '../components/ui/Button';

const AboutUs = () => {
  const navigate = useNavigate();

  const stats = [
    { label: "Years of Experience", value: "10+", icon: <Award className="w-8 h-8" /> },
    { label: "Happy Customers", value: "500K+", icon: <Users className="w-8 h-8" /> },
    { label: "Countries Served", value: "150+", icon: <Globe className="w-8 h-8" /> },
    { label: "Products Sold", value: "5M+", icon: <TrendingUp className="w-8 h-8" /> }
  ];

  const values = [
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Customer First",
      description: "Every decision we make is centered around delivering exceptional customer experiences and satisfaction.",
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-200"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Trust & Security",
      description: "We prioritize the security of your data and transactions with industry-leading protection measures.",
      color: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-200"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Innovation",
      description: "We continuously evolve our platform with cutting-edge technology to serve you better.",
      color: "text-yellow-600",
      bg: "bg-yellow-50",
      border: "border-yellow-200"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Excellence",
      description: "We strive for perfection in every aspect of our service, from product quality to customer support.",
      color: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-200"
    }
  ];

  const team = [
    {
      name: "Sarah Johnson",
      role: "CEO & Founder",
      description: "Visionary leader with 15+ years in e-commerce",
      avatar: "SJ",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      name: "Michael Chen",
      role: "CTO",
      description: "Tech expert passionate about scalable solutions",
      avatar: "MC",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      name: "Emma Davis",
      role: "Head of Design",
      description: "Creative mind focused on user experience",
      avatar: "ED",
      gradient: "from-green-500 to-teal-500"
    },
    {
      name: "David Wilson",
      role: "Head of Operations",
      description: "Operations specialist ensuring smooth delivery",
      avatar: "DW",
      gradient: "from-orange-500 to-red-500"
    }
  ];

  const milestones = [
    {
      year: "2014",
      title: "Company Founded",
      description: "Started with a vision to revolutionize online shopping"
    },
    {
      year: "2016",
      title: "Global Expansion",
      description: "Expanded to serve customers in 50+ countries"
    },
    {
      year: "2019",
      title: "1M Customers",
      description: "Reached the milestone of 1 million happy customers"
    },
    {
      year: "2022",
      title: "AI Integration",
      description: "Launched AI-powered recommendations and real-time inventory"
    },
    {
      year: "2024",
      title: "Sustainability Focus",
      description: "Committed to carbon-neutral shipping and eco-friendly packaging"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full text-purple-700 font-medium mb-6"
            >
              <Star className="w-5 h-5 mr-2" />
              About Our Journey
            </motion.div>

            <h1 className="text-5xl lg:text-7xl font-black leading-tight bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent mb-8">
              Building the Future of Commerce
            </h1>

            <p className="text-xl text-gray-600 leading-relaxed max-w-4xl mx-auto mb-12">
              We're more than just an e-commerce platform. We're a team of passionate innovators 
              dedicated to creating exceptional shopping experiences that connect people with the 
              products they love, when they need them most.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={() => navigate('/contact')}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl"
                >
                  Get in Touch
                  <Mail className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/products')}
                className="flex items-center px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-purple-500 hover:text-purple-600 transition-all duration-200 font-semibold"
              >
                <ArrowRight className="w-5 h-5 mr-2" />
                Explore Products
              </motion.button>
            </div>
          </motion.div>
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
                className="text-center bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20"
              >
                <div className="flex justify-center mb-6 text-purple-600">
                  {stat.icon}
                </div>
                <div className="text-4xl font-bold text-gray-800 mb-3">{stat.value}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-800 to-pink-800 bg-clip-text text-transparent mb-8">
                Our Story
              </h2>
              <div className="space-y-6 text-gray-700 leading-relaxed">
                <p className="text-lg">
                  Founded in 2014 with a simple yet powerful vision: to make online shopping 
                  more personal, more efficient, and more enjoyable for everyone.
                </p>
                <p>
                  What started as a small team of passionate entrepreneurs has grown into a 
                  global platform serving millions of customers worldwide. We've never lost 
                  sight of our core mission - putting customers first in everything we do.
                </p>
                <p>
                  Today, we're proud to offer real-time inventory management, AI-powered 
                  recommendations, and lightning-fast delivery to over 150 countries. 
                  But we're just getting started.
                </p>
              </div>
              
              <div className="mt-8 flex flex-wrap gap-4">
                <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full font-medium">Innovation</span>
                <span className="px-4 py-2 bg-pink-100 text-pink-700 rounded-full font-medium">Global Reach</span>
                <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-medium">Customer-Centric</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl p-16 text-center text-white shadow-2xl">
                <div className="text-8xl mb-6">🚀</div>
                <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
                <p className="text-lg opacity-90">
                  To democratize commerce and empower businesses of all sizes to reach global audiences.
                </p>
              </div>
              
              {/* Floating Elements */}
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-6 -right-6 w-20 h-20 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-lg"
              >
                <Star className="w-10 h-10 text-white" />
              </motion.div>
              
              <motion.div
                animate={{ y: [10, -10, 10] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -bottom-6 -left-6 w-16 h-16 bg-green-400 rounded-xl flex items-center justify-center shadow-lg"
              >
                <CheckCircle className="w-8 h-8 text-white" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-800 to-pink-800 bg-clip-text text-transparent mb-6">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These principles guide everything we do and shape how we serve our customers and community
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.03 }}
                className={`${value.bg} ${value.border} border-2 rounded-3xl p-8 text-center transition-all duration-300 shadow-lg hover:shadow-xl`}
              >
                <div className={`${value.color} mb-6 flex justify-center`}>
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
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
              Our Journey
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Key milestones that have shaped our company and defined our growth
            </p>
          </motion.div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-purple-400 to-pink-400 rounded-full"></div>

            <div className="space-y-16">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                >
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-12 text-right' : 'pl-12 text-left'}`}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20"
                    >
                      <div className="text-3xl font-bold text-purple-600 mb-2">{milestone.year}</div>
                      <h3 className="text-xl font-bold text-gray-800 mb-3">{milestone.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{milestone.description}</p>
                    </motion.div>
                  </div>

                  {/* Timeline Dot */}
                  <div className="relative z-10">
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.2 + 0.3, type: "spring" }}
                      className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full border-4 border-white shadow-lg"
                    />
                  </div>

                  <div className="w-1/2"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
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
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The passionate people behind our success, working tirelessly to serve you better
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 text-center shadow-xl border border-white/20"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className={`w-20 h-20 bg-gradient-to-r ${member.gradient} rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-6 shadow-lg`}
                >
                  {member.avatar}
                </motion.div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{member.name}</h3>
                <p className="text-purple-600 font-semibold mb-3">{member.role}</p>
                <p className="text-gray-600 text-sm leading-relaxed">{member.description}</p>
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
              Join Our Community
            </h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Become part of our growing family and experience the future of online shopping
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
                  Start Shopping
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/contact')}
                className="border-2 border-white text-white hover:bg-white hover:text-purple-600 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200"
              >
                <Phone className="w-5 h-5 mr-2 inline" />
                Contact Us
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

export default AboutUs;
