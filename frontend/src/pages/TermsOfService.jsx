import React from 'react';
import { motion } from 'framer-motion';
import { Scale, FileText, CheckCircle, Info } from 'lucide-react';

const TermsOfService = () => {
    return (
        <div className="min-h-screen bg-slate-50 py-20">
            <div className="container mx-auto px-4 max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden"
                >
                    <div className="bg-indigo-600 p-12 text-white">
                        <div className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full text-white font-medium mb-6">
                            <Scale className="w-5 h-5 mr-2" />
                            Guidelines & Agreements
                        </div>
                        <h1 className="text-4xl font-black mb-4">Terms of Service</h1>
                        <p className="opacity-80">Last Updated: February 22, 2026</p>
                    </div>

                    <div className="p-12 prose prose-slate max-w-none">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-900 border-b pb-4">
                            <Info className="w-6 h-6 text-indigo-600" />
                            1. Acceptance of Terms
                        </h2>
                        <p className="text-slate-600 mb-8 leading-relaxed">
                            By accessing and using this website, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
                        </p>

                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-900 border-b pb-4">
                            <CheckCircle className="w-6 h-6 text-indigo-600" />
                            2. Use License
                        </h2>
                        <p className="text-slate-600 mb-8 leading-relaxed">
                            Permission is granted to temporarily download one copy of the materials (information or software) on Market Live's website for personal, non-commercial transitory viewing only.
                        </p>

                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-900 border-b pb-4">
                            <FileText className="w-6 h-6 text-indigo-600" />
                            3. Disclaimer
                        </h2>
                        <p className="text-slate-600 mb-8 leading-relaxed">
                            The materials on Market Live's website are provided on an 'as is' basis. Market Live makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability.
                        </p>

                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-900 border-b pb-4">
                            <Scale className="w-6 h-6 text-indigo-600" />
                            4. Limitations
                        </h2>
                        <p className="text-slate-600 mb-12 leading-relaxed">
                            In no event shall Market Live or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials.
                        </p>

                        <div className="bg-slate-900 p-8 rounded-2xl text-white">
                            <h3 className="font-bold mb-4">Need help understanding our terms?</h3>
                            <p className="opacity-80 mb-0">
                                Contact our legal team for any clarifications at
                                <a href="mailto:legal@market.com" className="font-bold underline text-indigo-400 ml-1">legal@market.com</a>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default TermsOfService;
