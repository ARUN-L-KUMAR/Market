import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  HelpCircle, 
  MessageCircle,
  Phone,
  Mail,
  Star,
  User,
  ShoppingCart,
  Truck,
  CreditCard,
  Shield,
  Settings,
  ArrowRight
} from 'lucide-react';
import Button from '../components/ui/Button';

const FAQ = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedItems, setExpandedItems] = useState(new Set());

  const categories = [
    { id: 'all', name: 'All Topics', icon: <HelpCircle className="w-5 h-5" /> },
    { id: 'orders', name: 'Orders & Shipping', icon: <Truck className="w-5 h-5" /> },
    { id: 'payments', name: 'Payments & Billing', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'account', name: 'Account & Profile', icon: <User className="w-5 h-5" /> },
    { id: 'products', name: 'Products & Inventory', icon: <ShoppingCart className="w-5 h-5" /> },
    { id: 'security', name: 'Security & Privacy', icon: <Shield className="w-5 h-5" /> },
    { id: 'technical', name: 'Technical Support', icon: <Settings className="w-5 h-5" /> }
  ];

  const faqData = [
    {
      id: 1,
      category: 'orders',
      question: 'How long does shipping usually take?',
      answer: 'Standard shipping typically takes 3-5 business days within the US. Express shipping options are available for 1-2 day delivery. International shipping varies by location, usually 7-14 business days. You\'ll receive tracking information once your order ships.'
    },
    {
      id: 2,
      category: 'orders',
      question: 'Can I modify or cancel my order after placing it?',
      answer: 'You can modify or cancel your order within 1 hour of placing it, provided it hasn\'t been processed for shipping. Go to your account dashboard and click on "Order History" to make changes. After processing begins, modifications aren\'t possible, but you can return items following our return policy.'
    },
    {
      id: 3,
      category: 'orders',
      question: 'What is your return policy?',
      answer: 'We offer a 30-day return policy for most items. Items must be in original condition with tags attached. Digital products and personalized items are non-returnable. Return shipping is free for defective items, while customer-initiated returns may incur shipping charges.'
    },
    {
      id: 4,
      category: 'payments',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express, Discover), PayPal, Apple Pay, Google Pay, and bank transfers. For large orders, we also offer payment plans through our financing partners.'
    },
    {
      id: 5,
      category: 'payments',
      question: 'Is my payment information secure?',
      answer: 'Yes, absolutely. We use industry-standard SSL encryption and are PCI DSS compliant. We never store your full credit card information on our servers. All transactions are processed through secure payment gateways with multiple layers of protection.'
    },
    {
      id: 6,
      category: 'payments',
      question: 'When will I be charged for my order?',
      answer: 'Your payment method is charged immediately when you place an order. For pre-orders, you\'re charged when the item ships. If using payment plans, the first installment is charged at checkout, with subsequent payments according to your selected schedule.'
    },
    {
      id: 7,
      category: 'account',
      question: 'How do I create an account?',
      answer: 'Click "Sign Up" in the top right corner, fill in your email, create a password, and verify your email address. You can also sign up using your Google or Facebook account for faster registration. Having an account allows you to track orders, save favorites, and get personalized recommendations.'
    },
    {
      id: 8,
      category: 'account',
      question: 'I forgot my password. How can I reset it?',
      answer: 'Click "Forgot Password" on the login page, enter your email address, and we\'ll send you a reset link. Follow the instructions in the email to create a new password. If you don\'t receive the email, check your spam folder or contact support.'
    },
    {
      id: 9,
      category: 'account',
      question: 'How do I update my shipping address?',
      answer: 'Go to your account settings and click on "Addresses." You can add, edit, or delete shipping addresses there. Changes to your default address will apply to future orders. For pending orders, contact support immediately to update the shipping address.'
    },
    {
      id: 10,
      category: 'products',
      question: 'How do I know if an item is in stock?',
      answer: 'Our inventory is updated in real-time. If an item is available, you\'ll see "In Stock" or the quantity available. Out-of-stock items show "Notify Me" - click this to get an email when it\'s back. We also show estimated restock dates when available.'
    },
    {
      id: 11,
      category: 'products',
      question: 'Do you offer product warranties?',
      answer: 'Yes, most products come with manufacturer warranties. Additionally, we offer our own Market Protection Plan for extra coverage. Warranty terms vary by product and are clearly listed on each product page. Extended warranties are available for electronics and appliances.'
    },
    {
      id: 12,
      category: 'products',
      question: 'Can I get notified when items go on sale?',
      answer: 'Absolutely! Add items to your wishlist to receive notifications about price drops and sales. You can also follow your favorite brands and categories to get alerted about new arrivals and promotions. Enable push notifications in your account settings for instant alerts.'
    },
    {
      id: 13,
      category: 'security',
      question: 'How do you protect my personal information?',
      answer: 'We take privacy seriously and follow strict data protection protocols. Your information is encrypted, stored securely, and never sold to third parties. We only share necessary details with shipping partners and payment processors. You can review our full privacy policy for complete details.'
    },
    {
      id: 14,
      category: 'security',
      question: 'What should I do if I suspect unauthorized account access?',
      answer: 'Immediately change your password and contact our support team. Review your recent orders and payment methods for any unauthorized activity. Enable two-factor authentication for added security. We\'ll help investigate and secure your account.'
    },
    {
      id: 15,
      category: 'technical',
      question: 'The website is loading slowly. What should I do?',
      answer: 'Try clearing your browser cache and cookies, then refresh the page. Ensure you\'re using the latest version of your browser. If issues persist, try a different browser or device. Our technical team monitors site performance 24/7, but contact us if problems continue.'
    },
    {
      id: 16,
      category: 'technical',
      question: 'I\'m having trouble with the mobile app. How can I get help?',
      answer: 'First, try closing and reopening the app, or restart your device. Make sure you have the latest app version from your app store. Clear the app cache if the problem persists. Contact our technical support team with your device model and app version for personalized assistance.'
    }
  ];

  const popularQuestions = [
    { id: 1, question: 'How long does shipping take?', category: 'orders' },
    { id: 4, question: 'What payment methods do you accept?', category: 'payments' },
    { id: 7, question: 'How do I create an account?', category: 'account' },
    { id: 10, question: 'How do I know if an item is in stock?', category: 'products' }
  ];

  const toggleExpanded = (id) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const filteredFAQs = faqData.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-100 to-blue-100 rounded-full text-green-700 font-medium mb-6"
            >
              <HelpCircle className="w-5 h-5 mr-2" />
              Frequently Asked Questions
            </motion.div>

            <h1 className="text-5xl lg:text-7xl font-black leading-tight bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-8">
              How Can We Help?
            </h1>

            <p className="text-xl text-gray-600 leading-relaxed max-w-4xl mx-auto mb-12">
              Find answers to common questions about shopping, orders, payments, and more. 
              If you can't find what you're looking for, our support team is here to help.
            </p>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="max-w-2xl mx-auto relative"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search for answers..."
                  className="w-full pl-14 pr-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm shadow-lg"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Background Elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
            className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-r from-green-200/30 to-blue-200/30 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-r from-purple-200/30 to-pink-200/30 rounded-full blur-3xl"
          />
        </div>
      </section>

      {/* Popular Questions */}
      <section className="py-16 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold bg-gradient-to-r from-green-800 to-blue-800 bg-clip-text text-transparent mb-4">
              Popular Questions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Quick answers to the most commonly asked questions
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularQuestions.map((item, index) => {
              const faq = faqData.find(f => f.id === item.id);
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 cursor-pointer"
                  onClick={() => {
                    setActiveCategory(item.category);
                    setExpandedItems(new Set([item.id]));
                    document.getElementById('faq-section').scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <h3 className="font-semibold text-gray-800 mb-3">{item.question}</h3>
                  <p className="text-gray-600 text-sm line-clamp-3">
                    {faq?.answer.substring(0, 100)}...
                  </p>
                  <div className="mt-4 flex items-center text-blue-600 text-sm font-medium">
                    Learn more <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq-section" className="py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {/* Category Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-1"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20 sticky top-8">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Categories</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <motion.button
                      key={category.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveCategory(category.id)}
                      className={`w-full flex items-center px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                        activeCategory === category.id
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                      }`}
                    >
                      <span className="mr-3">{category.icon}</span>
                      <span className="font-medium">{category.name}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* FAQ Content */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-3"
            >
              <div className="space-y-4">
                {filteredFAQs.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20"
                  >
                    <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No results found</h3>
                    <p className="text-gray-500 mb-6">Try adjusting your search or browse different categories</p>
                    <Button onClick={() => navigate('/contact')} variant="primary">
                      Contact Support
                    </Button>
                  </motion.div>
                ) : (
                  filteredFAQs.map((faq, index) => (
                    <motion.div
                      key={faq.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden"
                    >
                      <motion.button
                        onClick={() => toggleExpanded(faq.id)}
                        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50/50 transition-colors duration-200"
                        whileHover={{ x: 5 }}
                      >
                        <h3 className="text-lg font-semibold text-gray-800 pr-4">
                          {faq.question}
                        </h3>
                        <motion.div
                          animate={{ rotate: expandedItems.has(faq.id) ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex-shrink-0"
                        >
                          <ChevronDown className="w-6 h-6 text-gray-400" />
                        </motion.div>
                      </motion.button>
                      
                      <AnimatePresence>
                        {expandedItems.has(faq.id) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 pb-6 pt-2 border-t border-gray-100">
                              <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Support CTA */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600 text-white relative overflow-hidden">
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-4xl lg:text-6xl font-bold mb-6">
              Still Need Help?
            </h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Can't find the answer you're looking for? Our support team is here to assist you 24/7
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => navigate('/contact')}
                  className="bg-white text-green-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl"
                >
                  Contact Support
                  <MessageCircle className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = 'tel:+15551234567'}
                className="border-2 border-white text-white hover:bg-white hover:text-green-600 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200"
              >
                <Phone className="w-5 h-5 mr-2 inline" />
                Call Now
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = 'mailto:support@market.com'}
                className="border-2 border-white text-white hover:bg-white hover:text-green-600 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200"
              >
                <Mail className="w-5 h-5 mr-2 inline" />
                Email Us
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

export default FAQ;
