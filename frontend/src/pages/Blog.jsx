import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Calendar, User, ArrowRight, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Blog = () => {
    const navigate = useNavigate();

    const posts = [
        {
            id: 1,
            title: "The Future of E-commerce in 2026",
            excerpt: "Discover the latest trends shaping the digital marketplace and how AI is revolutionizing the shopping experience.",
            author: "Sarah Johnson",
            date: "Feb 15, 2026",
            category: "Trends",
            image: "https://images.unsplash.com/photo-1557821552-17105176677c?q=80&w=800&auto=format&fit=crop"
        },
        {
            id: 2,
            title: "How to Build a Sustainable Wardrobe",
            excerpt: "Tips and tricks for choosing eco-friendly fashion without compromising on style or quality.",
            author: "Emma Davis",
            date: "Feb 10, 2026",
            category: "Fashion",
            image: "https://images.unsplash.com/photo-1523381235212-d73f8a385171?q=80&w=800&auto=format&fit=crop"
        },
        {
            id: 3,
            title: "Top 10 Tech Gadgets for Your Home Office",
            excerpt: "Expert recommendations for the best productivity tools to enhance your remote work setup.",
            author: "Michael Chen",
            date: "Feb 05, 2026",
            category: "Technology",
            image: "https://images.unsplash.com/photo-1491933382434-500287f9b54b?q=80&w=800&auto=format&fit=crop"
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
                    <div className="inline-flex items-center px-6 py-3 bg-indigo-100 rounded-full text-indigo-700 font-medium mb-6">
                        <BookOpen className="w-5 h-5 mr-2" />
                        Our Blog
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6">
                        Latest Stories & Insights
                    </h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        Stay updated with the latest in technology, fashion, and commerce.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                    {posts.map((post, index) => (
                        <motion.article
                            key={post.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -10 }}
                            className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group cursor-pointer"
                        >
                            <div className="aspect-video overflow-hidden">
                                <img
                                    src={post.image}
                                    alt={post.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            </div>
                            <div className="p-8">
                                <div className="flex items-center gap-4 mb-4 text-sm text-slate-500 font-medium">
                                    <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">{post.category}</span>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        {post.date}
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors">
                                    {post.title}
                                </h3>
                                <p className="text-slate-600 mb-6 leading-relaxed">
                                    {post.excerpt}
                                </p>
                                <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
                                            {post.author[0]}
                                        </div>
                                        <span className="text-sm font-semibold text-slate-700">{post.author}</span>
                                    </div>
                                    <div className="text-indigo-600 font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
                                        Read More
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        </motion.article>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Blog;
