import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCcw, Truck, ShieldCheck, HelpCircle, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

const ReturnsRefunds = () => {
    const navigate = useNavigate();

    const steps = [
        {
            icon: <RefreshCcw className="w-8 h-8" />,
            title: "Request a Return",
            description: "Log in to your account, go to your orders, and select the item you wish to return within 30 days of delivery."
        },
        {
            icon: <Truck className="w-8 h-8" />,
            title: "Pack & Ship",
            description: "Print your pre-paid shipping label and pack the items in their original packaging. Drop it off at any authorized carrier location."
        },
        {
            icon: <ShieldCheck className="w-8 h-8" />,
            title: "Quality Check",
            description: "Once we receive your return, our team will inspect the items to ensure they meet our return criteria."
        },
        {
            icon: <RefreshCcw className="w-8 h-8" />,
            title: "Get Refunded",
            description: "After approval, your refund will be processed back to your original payment method within 5-7 business days."
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 py-20">
            <div className="container mx-auto px-4 max-w-7xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center px-6 py-3 bg-emerald-100 rounded-full text-emerald-700 font-medium mb-6">
                        <RefreshCcw className="w-5 h-5 mr-2" />
                        Easy Returns
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6">
                        Hassle-Free Returns & Refunds
                    </h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        Not happy with your purchase? No problem. We've made our return process as simple as possible.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center relative"
                        >
                            {index < steps.length - 1 && (
                                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                                    <ArrowRight className="w-6 h-6 text-slate-300" />
                                </div>
                            )}
                            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mx-auto mb-6">
                                {step.icon}
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-4">{step.title}</h3>
                            <p className="text-slate-600 leading-relaxed text-sm">
                                {step.description}
                            </p>
                        </motion.div>
                    ))}
                </div>

                <div className="bg-slate-900 rounded-3xl p-12 text-white overflow-hidden relative">
                    <div className="relative z-10 max-w-3xl">
                        <h2 className="text-3xl font-bold mb-6">Our 30-Day Happiness Guarantee</h2>
                        <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                            We stand by the quality of our products. If you're not 100% satisfied with your purchase,
                            we'll accept returns for a full refund within 30 days of the delivery date. Items must be in
                            new/original condition with all tags attached.
                        </p>
                        <div className="flex flex-wrap gap-6">
                            <Button
                                onClick={() => navigate('/orders')}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 font-bold"
                            >
                                Start a Return
                            </Button>
                            <Button
                                onClick={() => navigate('/contact')}
                                className="bg-white/10 hover:bg-white/20 text-white border-white/20 px-8 py-4 font-bold"
                            >
                                Help Center
                                <HelpCircle className="w-5 h-5 ml-2" />
                            </Button>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-emerald-500/10 -mr-16 rotate-12 blur-3xl"></div>
                </div>
            </div>
        </div>
    );
};

export default ReturnsRefunds;
