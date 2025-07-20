import React from 'react';

const Footer = () => (
  <footer className="bg-gradient-to-r from-primary-700 to-primary-900 text-white py-8 mt-16 rounded-t-2xl shadow-inner">
    <div className="container mx-auto px-4 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between">
        <div className="mb-6 md:mb-0">
          <h2 className="text-xl font-bold mb-4">Market App</h2>
          <p className="text-primary-100">Your one-stop shop for all products</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-2">Shop</h3>
            <ul className="space-y-1 text-primary-100">
              <li><a href="#" className="hover:text-white">Products</a></li>
              <li><a href="#" className="hover:text-white">Categories</a></li>
              <li><a href="#" className="hover:text-white">Sales</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Company</h3>
            <ul className="space-y-1 text-primary-100">
              <li><a href="#" className="hover:text-white">About</a></li>
              <li><a href="#" className="hover:text-white">Contact</a></li>
              <li><a href="#" className="hover:text-white">Careers</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Legal</h3>
            <ul className="space-y-1 text-primary-100">
              <li><a href="#" className="hover:text-white">Privacy</a></li>
              <li><a href="#" className="hover:text-white">Terms</a></li>
              <li><a href="#" className="hover:text-white">Returns</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="mt-8 pt-8 border-t border-primary-800 text-center text-primary-200 text-sm">
        <p>&copy; {new Date().getFullYear()} Market App. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default Footer; 