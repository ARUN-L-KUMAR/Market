import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { getStats } from '../../services/adminService';
import { DollarSign, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, CreditCard, Wallet, Calendar } from 'lucide-react';
import SalesChart from '../../components/admin/SalesChart';
import CurrencyPrice from '../../components/CurrencyPrice';

const Revenue = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('7days');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const response = await getStats();
                setStats(response.data.data);
            } catch (error) {
                console.error('Error fetching revenue stats:', error);
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

    const revenueStats = [
        {
            title: 'Total Revenue',
            value: stats?.totalRevenue || 0,
            change: '+12.5%',
            isPositive: true,
            icon: <DollarSign className="h-6 w-6" />,
            color: 'indigo'
        },
        {
            title: 'Average Order Value',
            value: stats?.totalOrders ? (stats.totalRevenue / stats.totalOrders) : 0,
            change: '+3.2%',
            isPositive: true,
            icon: <CreditCard className="h-6 w-6" />,
            color: 'emerald'
        },
        {
            title: 'Net Profit',
            value: (stats?.totalRevenue || 0) * 0.7, // Simulated net profit
            change: '-1.5%',
            isPositive: false,
            icon: <Wallet className="h-6 w-6" />,
            color: 'emerald'
        },
        {
            title: 'Conversion Rate',
            value: '3.4%',
            change: '+0.5%',
            isPositive: true,
            icon: <TrendingUp className="h-6 w-6" />,
            color: 'amber'
        }
    ];

    return (
        <AdminLayout>
            <div className="p-6">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Revenue Analytics</h1>
                        <p className="text-sm text-slate-500 mt-1">Detailed breakdown of your store's financial performance.</p>
                    </div>
                    <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                        {['7days', '30days', '90days'].map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${period === p ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
                            >
                                {p === '7days' ? 'Past 7 Days' : p === '30days' ? 'Last Month' : 'Last Quarter'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {revenueStats.map((stat, index) => (
                        <div key={index} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm group hover:border-indigo-200 transition-all duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300 ${stat.color === 'indigo' ? 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white' : stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white' : 'bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white'}`}>
                                    {stat.icon}
                                </div>
                                <div className={`flex items-center text-xs font-bold ${stat.isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {stat.isPositive ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                                    {stat.change}
                                </div>
                            </div>
                            <p className="text-sm font-bold text-slate-500 mb-1">{stat.title}</p>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                                {typeof stat.value === 'number' ? <CurrencyPrice price={stat.value} /> : stat.value}
                            </h3>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-lg font-bold text-slate-900">Revenue Growth</h2>
                            <div className="flex items-center text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                <Calendar className="h-3.5 w-3.5 mr-2 text-indigo-500" />
                                Growth: <span className="text-emerald-600 ml-1">+15.4%</span>
                            </div>
                        </div>
                        <div className="h-[400px]">
                            <SalesChart data={stats?.salesData} />
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 mb-8">Earnings by Category</h2>
                        <div className="space-y-6">
                            {[
                                { name: 'Electronics', amount: (stats?.totalRevenue || 0) * 0.45, color: '#6366F1' },
                                { name: 'Fashion', amount: (stats?.totalRevenue || 0) * 0.3, color: '#10B981' },
                                { name: 'Home & Living', amount: (stats?.totalRevenue || 0) * 0.15, color: '#F59E0B' },
                                { name: 'Beauty', amount: (stats?.totalRevenue || 0) * 0.1, color: '#EC4899' }
                            ].map((cat, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between text-sm font-bold">
                                        <span className="text-slate-700">{cat.name}</span>
                                        <span className="text-slate-900"><CurrencyPrice price={cat.amount} /></span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full"
                                            style={{
                                                width: `${(cat.amount / (stats?.totalRevenue || 1)) * 100}%`,
                                                backgroundColor: cat.color
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-10 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                            <p className="text-xs font-bold text-indigo-700 leading-relaxed text-center">
                                Top category "Electronics" is performing 15% better than last month.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Revenue;
