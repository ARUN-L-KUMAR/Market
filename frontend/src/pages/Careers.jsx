import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, Clock, ArrowRight, Zap, Globe, Users, Star } from 'lucide-react';
import Button from '../components/ui/Button';

const Careers = () => {
    const jobs = [
        {
            id: 1,
            title: "Senior Full Stack Engineer",
            location: "New York / Remote",
            type: "Full-time",
            department: "Engineering"
        },
        {
            id: 2,
            title: "Product Designer",
            location: "London / Hybrid",
            type: "Full-time",
            department: "Design"
        },
        {
            id: 3,
            title: "Marketing Manager",
            location: "Remote",
            type: "Full-time",
            department: "Marketing"
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
                <div className="container mx-auto px-4 max-w-7xl relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <div className="inline-flex items-center px-6 py-3 bg-white/10 rounded-full text-indigo-300 font-medium mb-6">
                            <Star className="w-5 h-5 mr-2" />
                            Join Our Mission
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-black mb-8 leading-tight">
                            Build the Future <br /> of Commerce Together
                        </h1>
                        <p className="text-xl opacity-80 max-w-3xl mx-auto mb-10">
                            We're a team of innovators, creators, and problem-solvers working to democratize commerce worldwide.
                        </p>
                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 text-lg font-bold">
                            View Openings
                        </Button>
                    </motion.div>
                </div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -ml-48 -mb-48"></div>
            </section>

            <section className="py-24">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-slate-900 mb-4">Open Positions</h2>
                        <p className="text-slate-600">Find your next challenge and grow your career with us.</p>
                    </div>

                    <div className="space-y-6 max-w-4xl mx-auto">
                        {jobs.map((job) => (
                            <motion.div
                                key={job.id}
                                whileHover={{ scale: 1.02, x: 10 }}
                                className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 cursor-pointer group hover:border-indigo-300 transition-all"
                            >
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">{job.title}</h3>
                                    <div className="flex flex-wrap gap-4 text-slate-500 text-sm">
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-4 h-4 text-indigo-500" />
                                            {job.location}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-4 h-4 text-indigo-500" />
                                            {job.type}
                                        </span>
                                        <span className="bg-slate-100 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                            {job.department}
                                        </span>
                                    </div>
                                </div>
                                <Button className="bg-slate-900 text-white group-hover:bg-indigo-600 transition-colors">
                                    Apply Now
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-24 bg-white">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                        <div>
                            <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto mb-6">
                                <Globe className="w-10 h-10" />
                            </div>
                            <h4 className="text-xl font-bold mb-3">Remote-First</h4>
                            <p className="text-slate-600">Work from anywhere in the world and enjoy full flexibility.</p>
                        </div>
                        <div>
                            <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto mb-6">
                                <Users className="w-10 h-10" />
                            </div>
                            <h4 className="text-xl font-bold mb-3">Inclusive Culture</h4>
                            <p className="text-slate-600">A diverse team where every voice matters and is heard.</p>
                        </div>
                        <div>
                            <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto mb-6">
                                <Zap className="w-10 h-10" />
                            </div>
                            <h4 className="text-xl font-bold mb-3">Rapid Growth</h4>
                            <p className="text-slate-600">Fast-paced environment with unlimited career potential.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Careers;
