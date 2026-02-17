import React from 'react';

const Footer = () => (
  <footer className="bg-slate-900 text-white py-12 mt-20 border-t border-slate-800">
    <div className="container mx-auto px-6 max-w-7xl">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
        <div className="md:col-span-4">
          <div className="flex items-center mb-6">
            <div className="bg-indigo-600 p-1.5 rounded-lg mr-3 shadow-lg shadow-indigo-500/10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight">Market<span className="text-indigo-400">Live</span></span>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Experience the future of e-commerce with our professional, highly curated product selections and a seamless shopping experience.
          </p>
        </div>

        <div className="md:col-span-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest mb-5 text-slate-500">Shop</h3>
              <ul className="space-y-3 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-indigo-400 transition-colors">All Products</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Categories</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">New Arrivals</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Sales</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest mb-5 text-slate-500">Company</h3>
              <ul className="space-y-3 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-indigo-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Our Blog</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Careers</a></li>
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <h3 className="text-xs font-bold uppercase tracking-widest mb-5 text-slate-500">Support</h3>
              <ul className="space-y-3 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Returns & Refunds</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">FAQ</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16 pt-8 border-t border-slate-800/50 flex flex-col sm:flex-row justify-between items-center text-slate-500 text-xs gap-4">
        <p>&copy; {new Date().getFullYear()} Market Live. All rights reserved.</p>
        <div className="flex space-x-6">
          <a href="#" className="hover:text-slate-300 transition-colors">Twitter</a>
          <a href="#" className="hover:text-slate-300 transition-colors">Instagram</a>
          <a href="#" className="hover:text-slate-300 transition-colors">GitHub</a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;