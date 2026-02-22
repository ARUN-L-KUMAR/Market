import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, FileText } from 'lucide-react';

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-slate-50 py-20">
            <div className="container mx-auto px-4 max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden"
                >
                    <div className="bg-slate-900 p-12 text-white">
                        <div className="inline-flex items-center px-4 py-2 bg-indigo-500/20 rounded-full text-indigo-300 font-medium mb-6">
                            <Shield className="w-5 h-5 mr-2" />
                            Privacy Matters
                        </div>
                        <h1 className="text-4xl font-black mb-4">Privacy Policy</h1>
                        <p className="text-slate-400">Last Updated: February 22, 2026</p>
                    </div>

                    <div className="p-12 prose prose-slate max-w-none">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-900 border-b pb-4">
                            <Lock className="w-6 h-6 text-indigo-600" />
                            1. Information We Collect
                        </h2>
                        <p className="text-slate-600 mb-8 leading-relaxed">
                            We collect information you provide directly to us when you create an account, make a purchase, or communicate with us. This includes your name, email address, shipping address, and payment information.
                        </p>

                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-900 border-b pb-4">
                            <Eye className="w-6 h-6 text-indigo-600" />
                            2. How We Use Your Information
                        </h2>
                        <p className="text-slate-600 mb-8 leading-relaxed">
                            We use the information we collect to process your orders, maintain your account, and provide you with personalized recommendations. We also use it to communicate with you about promotions and updates.
                        </p>

                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-900 border-b pb-4">
                            <Shield className="w-6 h-6 text-indigo-600" />
                            3. Data Security
                        </h2>
                        <p className="text-slate-600 mb-8 leading-relaxed">
                            We implement industry-standard security measures to protect your personal information. Your payment data is encrypted and processed through secure third-party payment gateways.
                        </p>

                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-900 border-b pb-4">
                            <FileText className="w-6 h-6 text-indigo-600" />
                            4. Your Choices
                        </h2>
                        <p className="text-slate-600 mb-12 leading-relaxed">
                            You can update your account information at any time through your profile settings. You also have the right to request the deletion of your personal data.
                        </p>

                        <div className="bg-indigo-50 p-8 rounded-2xl border border-indigo-100">
                            <h3 className="text-indigo-900 font-bold mb-4">Questions about our policy?</h3>
                            <p className="text-indigo-700 mb-0">
                                If you have any questions or concerns about our privacy practices, please contact our data protection officer at
                                <a href="mailto:privacy@market.com" className="font-bold underline ml-1">privacy@market.com</a>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
