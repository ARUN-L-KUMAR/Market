import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send,
  MessageCircle,
  Headphones,
  Globe,
  Star,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import Button from '../components/ui/Button';
import { toast } from 'react-toastify';

const ContactUs = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contactMethods = [
    {
      icon: <Mail className="w-8 h-8" />,
      title: "Email Support",
      description: "Get in touch via email for detailed inquiries",
      value: "support@market.com",
      action: "mailto:support@market.com",
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200"
    },
    {
      icon: <Phone className="w-8 h-8" />,
      title: "Phone Support",
      description: "Call us for immediate assistance",
      value: "+1 (555) 123-4567",
      action: "tel:+15551234567",
      color: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-200"
    },
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: "Live Chat",
      description: "Chat with our support team in real-time",
      value: "Available 24/7",
      action: "#",
      color: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-200"
    },
    {
      icon: <Headphones className="w-8 h-8" />,
      title: "Help Center",
      description: "Browse our comprehensive knowledge base",
      value: "Self-service portal",
      action: "/help",
      color: "text-orange-600",
      bg: "bg-orange-50",
      border: "border-orange-200"
    }
  ];

  const officeLocations = [
    {
      city: "New York",
      address: "123 Commerce St, NY 10001",
      phone: "+1 (555) 123-4567",
      timezone: "EST"
    },
    {
      city: "London",
      address: "45 Tech Square, London EC1A 1BB",
      phone: "+44 20 1234 5678",
      timezone: "GMT"
    },
    {
      city: "Tokyo",
      address: "1-2-3 Shibuya, Tokyo 150-0002",
      phone: "+81 3 1234 5678",
      timezone: "JST"
    }
  ];

  const supportHours = [
    { day: "Monday - Friday", hours: "9:00 AM - 6:00 PM EST" },
    { day: "Saturday", hours: "10:00 AM - 4:00 PM EST" },
    { day: "Sunday", hours: "Closed" }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full text-blue-700 font-medium mb-6"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Get in Touch
            </motion.div>

            <h1 className="text-5xl lg:text-7xl font-black leading-tight bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-8">
              We're Here to Help
            </h1>

            <p className="text-xl text-gray-600 leading-relaxed max-w-4xl mx-auto mb-12">
              Have questions, feedback, or need assistance? Our dedicated support team is ready to help you 
              with anything you need. Reach out to us through any of the channels below.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={() => document.getElementById('contact-form').scrollIntoView({ behavior: 'smooth' })}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl"
                >
                  Send Message
                  <Send className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/faq')}
                className="flex items-center px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-blue-500 hover:text-blue-600 transition-all duration-200 font-semibold"
              >
                <ArrowRight className="w-5 h-5 mr-2" />
                Check FAQ
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Background Elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
            className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-r from-blue-200/30 to-purple-200/30 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-r from-pink-200/30 to-cyan-200/30 rounded-full blur-3xl"
          />
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
              Choose Your Preferred Contact Method
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Multiple ways to reach us - pick the one that works best for you
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactMethods.map((method, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.03 }}
                className={`${method.bg} ${method.border} border-2 rounded-3xl p-8 text-center transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer`}
                onClick={() => {
                  if (method.action.startsWith('mailto:') || method.action.startsWith('tel:')) {
                    window.location.href = method.action;
                  } else if (method.action === '#') {
                    toast.info('Live chat feature coming soon!');
                  } else {
                    navigate(method.action);
                  }
                }}
              >
                <div className={`${method.color} mb-6 flex justify-center`}>
                  {method.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">{method.title}</h3>
                <p className="text-gray-600 mb-4">{method.description}</p>
                <p className={`${method.color} font-semibold`}>{method.value}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form and Info */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              id="contact-form"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-800 to-purple-800 bg-clip-text text-transparent mb-8">
                  Send us a Message
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div
                      whileFocus={{ scale: 1.02 }}
                      className="relative"
                    >
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Your Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm text-gray-800 font-medium"
                        placeholder="Enter your full name"
                      />
                    </motion.div>

                    <motion.div
                      whileFocus={{ scale: 1.02 }}
                      className="relative"
                    >
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm text-gray-800 font-medium"
                        placeholder="your.email@example.com"
                      />
                    </motion.div>
                  </div>

                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                    className="relative"
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm text-gray-800 font-medium"
                      placeholder="What's this about?"
                    />
                  </motion.div>

                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                    className="relative"
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows="6"
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm text-gray-800 font-medium resize-none"
                      placeholder="Tell us how we can help you..."
                    />
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl ${
                        isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Message
                          <Send className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>
                  </motion.div>
                </form>
              </div>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-8"
            >
              {/* Support Hours */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 border border-blue-100">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-4">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">Support Hours</h3>
                </div>
                
                <div className="space-y-4">
                  {supportHours.map((schedule, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-blue-200 last:border-b-0">
                      <span className="font-medium text-gray-700">{schedule.day}</span>
                      <span className="text-blue-600 font-semibold">{schedule.hours}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Office Locations */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center mr-4">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">Our Offices</h3>
                </div>

                <div className="space-y-6">
                  {officeLocations.map((office, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      className="p-4 bg-gray-50 rounded-2xl border border-gray-200 hover:border-blue-300 transition-all duration-200"
                    >
                      <h4 className="font-bold text-gray-800 mb-2">{office.city}</h4>
                      <p className="text-gray-600 mb-1">{office.address}</p>
                      <p className="text-blue-600 font-medium mb-1">{office.phone}</p>
                      <p className="text-sm text-gray-500">{office.timezone}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-6">Response Times</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">&lt; 1 hour</div>
                    <div className="text-green-100">Email Response</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">24/7</div>
                    <div className="text-green-100">Live Chat</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="py-20 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
              Common Questions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Can't find what you're looking for? Check out our comprehensive FAQ section
            </p>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => navigate('/faq')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl"
              >
                View All FAQs
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white relative overflow-hidden">
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-4xl lg:text-6xl font-bold mb-6">
              Still Have Questions?
            </h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Our customer success team is standing by to help you succeed
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => window.location.href = 'mailto:support@market.com'}
                  className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl"
                >
                  Email Support
                  <Mail className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/about')}
                className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200"
              >
                <Globe className="w-5 h-5 mr-2 inline" />
                Learn More About Us
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

export default ContactUs;
