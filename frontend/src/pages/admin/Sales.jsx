import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { getStats } from '../../services/adminService';
import { ShoppingBag, TrendingUp, BarChart3, Package, Users, Calendar, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import SalesChart from '../../components/admin/SalesChart';
import CurrencyPrice from '../../components/CurrencyPrice';

const Sales = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const response = await getStats();
                setStats(response.data.data);
            } catch (error) {
                console.error('Error fetching sales stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
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
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Sales Reports</h1>
                        <p className="text-sm text-slate-500 mt-1">Monitor sales volume, product performance and growth trends.</p>
                    </div>
                    <button className="flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-all">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Export Report
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-900 mb-6">Sales Performance</h2>
                            <div className="h-[350px]">
                                <SalesChart data={stats?.salesData} />
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <h2 className="text-lg font-bold text-slate-900">Top Selling Products</h2>
                                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">Last 30 Days</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-left bg-slate-50/50">
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Product</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Price</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Sold</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Revenue</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {stats?.topSellingProducts?.map((p, i) => (
                                            <tr key={i} className="hover:bg-slate-50/80 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex-shrink-0 overflow-hidden">
                                                            {p.image && p.image[0] ? (
                                                                <img src={p.image[0]} alt={p.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                                    <Package className="h-5 w-5" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <span className="text-sm font-bold text-slate-900 line-clamp-1">{p.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-bold text-slate-700">
                                                    <CurrencyPrice price={p.price} />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-bold text-slate-900">{p.totalSold}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-bold text-emerald-600">
                                                        <CurrencyPrice price={p.price * p.totalSold} />
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-900 mb-6">Quick Stats</h2>
                            <div className="space-y-4">
                                {[
                                    { label: 'Total Orders', value: stats?.totalOrders || 0, icon: <ShoppingBag className="h-5 w-5" />, color: 'indigo' },
                                    { label: 'Active Customers', value: stats?.totalUsers || 0, icon: <Users className="h-5 w-5" />, color: 'emerald' },
                                    { label: 'Growth', value: '+18.5%', icon: <TrendingUp className="h-5 w-5" />, color: 'amber' }
                                ].map((s, i) => (
                                    <div key={i} className="flex items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${s.color === 'indigo' ? 'bg-indigo-100 text-indigo-600' : s.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                            {s.icon}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{s.label}</p>
                                            <p className="text-lg font-black text-slate-900">{s.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-[#0f172a] p-6 rounded-2xl shadow-xl shadow-slate-200 text-white">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                                    <CheckCircle2 className="h-6 w-6" />
                                </div>
                                <h3 className="text-lg font-bold">Smart Insights</h3>
                            </div>
                            <ul className="space-y-4 text-sm font-medium text-slate-400">
                                <li className="flex items-start gap-3">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 flex-shrink-0" />
                                    Your sales are <span className="text-emerald-400">up 15%</span> this week due to the weekend flash sale.
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5 flex-shrink-0" />
                                    "Electronics" categories are currently driving 45% of your total revenue.
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 flex-shrink-0" />
                                    Inventory for 5 products is low. Consider restocking soon.
                                </li>
                            </ul>
                            <button className="w-full mt-8 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold tracking-widest uppercase transition-all">
                                Full Summary
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Sales;
