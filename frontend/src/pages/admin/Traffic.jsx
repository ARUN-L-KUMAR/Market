import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { getTrafficStats } from '../../services/adminService';
import {
    BarChart3,
    Users,
    MousePointer2,
    Clock,
    RefreshCw,
    Globe,
    Zap,
    TrendingUp
} from 'lucide-react';
import Chart from 'chart.js/auto';

const Traffic = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('30days');
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        fetchTraffic();
    }, [period]);

    useEffect(() => {
        if (!loading && stats && stats.chartData && chartRef.current) {
            renderChart();
        }
        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [loading, stats]);

    const fetchTraffic = async () => {
        try {
            setLoading(true);
            const response = await getTrafficStats(period);
            setStats(response.data.data);
        } catch (error) {
            console.error('Error fetching traffic:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderChart = () => {
        const ctx = chartRef.current.getContext('2d');

        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        const data = stats.chartData;
        const labels = data.map(d => {
            const date = new Date(d.date);
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        });

        chartInstance.current = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Visits',
                        data: data.map(d => d.visits),
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0,
                        pointHoverRadius: 6,
                        pointHoverBackgroundColor: '#6366f1',
                        pointHoverBorderColor: '#fff',
                        pointHoverBorderWidth: 3,
                    },
                    {
                        label: 'Unique Users',
                        data: data.map(d => d.uniqueUsers),
                        borderColor: '#34d399',
                        backgroundColor: 'rgba(52, 211, 153, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0,
                        pointHoverRadius: 6,
                        pointHoverBackgroundColor: '#34d399',
                        pointHoverBorderColor: '#fff',
                        pointHoverBorderWidth: 3,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#1e293b',
                        padding: 12,
                        titleFont: { size: 12, weight: 'bold' },
                        bodyFont: { size: 12 },
                        cornerRadius: 12,
                        displayColors: true
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: '#94a3b8', font: { size: 10, weight: '700' } }
                    },
                    y: {
                        grid: { color: '#f1f5f9' },
                        ticks: { color: '#94a3b8', font: { size: 10, weight: '700' } },
                        beginAtZero: true
                    }
                }
            }
        });
    };

    if (loading && !stats) {
        return (
            <AdminLayout>
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
                </div>
            </AdminLayout>
        );
    }

    const summary = stats?.summary || {};

    return (
        <AdminLayout>
            <div className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                            <BarChart3 className="h-6 w-6 text-indigo-600" />
                            Traffic Analytics
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">Detailed overview of how users are discovering and using your store.</p>
                    </div>

                    <div className="flex items-center gap-3 bg-white p-1.5 border border-slate-200 rounded-xl shadow-sm">
                        {['7days', '30days', '90days', 'all'].map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${period === p ? 'bg-[#0f172a] text-white shadow-md shadow-slate-200' : 'text-slate-500 hover:bg-slate-50'}`}
                            >
                                {p === '7days' ? '1 Week' : p === '30days' ? '1 Month' : p === '90days' ? '3 Months' : 'Full'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[
                        { label: 'Total Visits', value: summary.totalVisits?.toLocaleString() || '0', icon: <MousePointer2 className="h-5 w-5" />, color: 'indigo', trend: `${summary.visitsGrowth >= 0 ? '+' : ''}${summary.visitsGrowth?.toFixed(1)}%` },
                        { label: 'Unique Users', value: summary.totalUniqueUsers?.toLocaleString() || '0', icon: <Users className="h-5 w-5" />, color: 'emerald', trend: 'Actual' },
                        { label: 'Avg. Bounce Rate', value: summary.avgBounceRate || '0%', icon: <Zap className="h-5 w-5" />, color: 'amber', trend: 'Estimated' },
                        { label: 'Active Now', value: summary.activeNow || '0', icon: <Globe className="h-5 w-5" />, color: 'rose', trend: 'Live' }
                    ].map((card, i) => (
                        <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-indigo-200 transition-all">
                            <div className="relative z-10 flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-xl ${card.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' : card.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : card.color === 'amber' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'}`}>
                                    {card.icon}
                                </div>
                                <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${card.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : card.trend === 'Live' ? 'bg-rose-50 text-rose-600 animate-pulse' : 'bg-slate-50 text-slate-600'}`}>
                                    {card.trend}
                                </span>
                            </div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{card.label}</p>
                            <h3 className="text-2xl font-black text-slate-900 mt-1">{card.value}</h3>
                            <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-slate-50 rounded-full group-hover:scale-110 transition-transform -z-0" />
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Visits vs Unique Users</h2>
                                <p className="text-xs text-slate-400 font-medium">Daily traffic volume for the selected period.</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-indigo-500 rounded-full shadow-sm" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Visits</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-emerald-400 rounded-full shadow-sm" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unique</span>
                                </div>
                            </div>
                        </div>

                        <div className="h-[350px] w-full">
                            <canvas ref={chartRef}></canvas>
                        </div>
                    </div>

                    <div className="bg-[#0f172a] p-8 rounded-2xl shadow-xl shadow-slate-200 text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/40">
                                <TrendingUp className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-4">Traffic Insights</h3>
                            <div className="space-y-6">
                                {stats?.insights?.topSources?.length > 0 ? (
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1">Top Source</p>
                                        <p className="text-sm font-bold">{stats.insights.topSources[0]._id || 'Direct'}</p>
                                        <div className="w-full h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
                                            <div
                                                className="h-full bg-indigo-500"
                                                style={{ width: `${Math.min(100, (stats.insights.topSources[0].count / summary.totalVisits) * 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1">Top Source</p>
                                        <p className="text-sm font-bold italic opacity-50">Awaiting data...</p>
                                    </div>
                                )}

                                {stats?.insights?.deviceStats?.length > 0 ? (
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-1">Most Used Device</p>
                                        <p className="text-sm font-bold capitalize">{stats.insights.deviceStats[0]._id} ({Math.round((stats.insights.deviceStats[0].count / summary.totalVisits) * 100)}%)</p>
                                        <div className="w-full h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
                                            <div
                                                className="h-full bg-emerald-400"
                                                style={{ width: `${(stats.insights.deviceStats[0].count / summary.totalVisits) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-1">Device Data</p>
                                        <p className="text-sm font-bold italic opacity-50">Awaiting data...</p>
                                    </div>
                                )}

                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                    <p className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em] mb-1">User Base</p>
                                    <p className="text-sm font-bold">100% Real Tracking</p>
                                    <p className="text-[10px] text-white/40 mt-1 uppercase tracking-widest font-bold">Privacy Enabled</p>
                                </div>
                            </div>

                            <button className="w-full mt-8 py-3 bg-white text-slate-900 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all">
                                Generate PDF Report
                            </button>
                        </div>

                        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Traffic;
