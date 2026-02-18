import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { getActivities } from '../../services/adminService';
import {
    Activity as ActivityIcon,
    RefreshCw,
    Filter,
    Calendar,
    ShoppingBag,
    UserPlus,
    Clock,
    ChevronRight,
    Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const Activity = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, order, user

    useEffect(() => {
        fetchActivities();
    }, []);

    const fetchActivities = async () => {
        try {
            setLoading(true);
            const response = await getActivities();
            setActivities(response.data.data || []);
        } catch (error) {
            console.error('Error fetching activities:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (date) => {
        const d = new Date(date);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' • ' + d.toLocaleDateString();
    };

    const getIcon = (type) => {
        switch (type) {
            case 'order': return <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl shadow-sm"><ShoppingBag className="h-5 w-5" /></div>;
            case 'user': return <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl shadow-sm"><UserPlus className="h-5 w-5" /></div>;
            default: return <div className="p-2.5 bg-slate-100 text-slate-600 rounded-xl shadow-sm"><ActivityIcon className="h-5 w-5" /></div>;
        }
    };

    const filteredActivities = activities.filter(a => filter === 'all' || a.type === filter);

    if (loading && activities.length === 0) {
        return (
            <AdminLayout>
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                            <ActivityIcon className="h-6 w-6 text-indigo-600" />
                            Activity Logs
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">Real-time chronicle of all events happening across your store.</p>
                    </div>

                    <div className="flex items-center gap-3 bg-white p-1.5 border border-slate-200 rounded-xl shadow-sm">
                        {['all', 'order', 'user'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${filter === f ? 'bg-[#0f172a] text-white shadow-md shadow-slate-200' : 'text-slate-500 hover:bg-slate-50'}`}
                            >
                                {f}
                            </button>
                        ))}
                        <div className="w-px h-6 bg-slate-200 mx-1" />
                        <button
                            onClick={fetchActivities}
                            className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                        >
                            <RefreshCw className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                <div className="max-w-4xl">
                    <div className="relative">
                        <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-slate-100" />

                        <div className="space-y-8">
                            <AnimatePresence>
                                {filteredActivities.map((activity, index) => (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: index * 0.05 }}
                                        key={activity._id}
                                        className="relative flex items-start gap-6 group"
                                    >
                                        <div className="relative z-10">
                                            {getIcon(activity.type)}
                                        </div>

                                        <div className="flex-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all hover:border-indigo-100 relative group-hover:-translate-y-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-2">
                                                        {activity.title}
                                                        {index === 0 && <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />}
                                                    </h3>
                                                    <p className="text-sm text-slate-500 mt-1">{activity.description}</p>
                                                </div>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                                    <Clock className="h-3 w-3" />
                                                    {formatTime(activity.createdAt)}
                                                </span>
                                            </div>

                                            <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-4">
                                                <div className="flex -space-x-2">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-50 border-2 border-white flex items-center justify-center text-[10px] font-black text-indigo-600">
                                                        {(activity.user?.name || 'A')[0]}
                                                    </div>
                                                </div>

                                                <Link
                                                    to={activity.type === 'order' ? `/admin/orders/${activity._id}` : `/admin/users/${activity.user?._id || activity._id}`}
                                                    className="inline-flex items-center gap-1 text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] group/btn"
                                                >
                                                    View Details
                                                    <ChevronRight className="h-3 w-3 group-hover/btn:translate-x-0.5 transition-transform" />
                                                </Link>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>

                    {filteredActivities.length === 0 && (
                        <div className="py-20 text-center bg-white rounded-2xl border border-slate-200 border-dashed">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mx-auto mb-4 border border-slate-100">
                                <ActivityIcon className="h-8 w-8" />
                            </div>
                            <p className="font-bold text-slate-900">No activity found</p>
                            <p className="text-sm text-slate-500">Wait for some action or try a different filter.</p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default Activity;
