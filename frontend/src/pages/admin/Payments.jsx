import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
    CreditCard,
    DollarSign,
    TrendingUp,
    Clock,
    CheckCircle2,
    AlertCircle,
    ArrowUpRight,
    ArrowDownLeft,
    Search,
    Download,
    Calendar,
    Filter,
    RotateCcw,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { getTransactions, getTransactionStats } from '../../services/adminService';
import { formatDate } from '../../utils/formatters';
import { toast } from 'react-toastify';

const Payments = () => {
    const [transactions, setTransactions] = useState([]);
    const [stats, setStats] = useState({ payment: 0, refund: 0, count: 0 });
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [typeFilter, setTypeFilter] = useState('all');

    const fetchData = async (page = 1) => {
        try {
            setLoading(true);
            const [txnRes, statsRes] = await Promise.all([
                getTransactions({ page, type: typeFilter !== 'all' ? typeFilter : undefined }),
                getTransactionStats()
            ]);

            const { transactions: txnList, pagination } = txnRes.data.data;
            setTransactions(txnList);
            setTotalPages(pagination.pages);
            setStats(statsRes.data.data);
            setCurrentPage(page);
        } catch (err) {
            console.error('Error fetching payments:', err);
            toast.error('Failed to load transaction data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(currentPage);
    }, [currentPage, typeFilter]);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'success':
                return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'failed':
                return 'bg-red-50 text-red-700 border-red-100';
            case 'pending':
                return 'bg-amber-50 text-amber-700 border-amber-100';
            default:
                return 'bg-slate-50 text-slate-700 border-slate-100';
        }
    };

    const getGatewayIcon = (gateway) => {
        switch (gateway) {
            case 'razorpay': return <span className="text-blue-600 font-black tracking-tighter">R</span>;
            case 'stripe': return <span className="text-indigo-600 font-black tracking-tighter">S</span>;
            case 'cod': return <span className="text-slate-600 font-black tracking-tighter">C</span>;
            default: return <CreditCard className="w-4 h-4 text-slate-400" />;
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-8 pb-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Payment Transactions</h1>
                        <p className="text-slate-500 text-sm font-medium">Monitor all financial movements and settlement status</p>
                    </div>
                    <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
                        <button className="px-4 py-2 bg-slate-50 text-slate-900 rounded-xl text-xs font-black uppercase tracking-widest border border-slate-200">Export CSV</button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-100/50 transition-colors"></div>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Volume</p>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">₹{stats.payment.toLocaleString()}</h3>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-emerald-600 font-black text-xs uppercase italic">
                            <ArrowUpRight className="w-3 h-3" />
                            12.5% increase
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-50/50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-red-100/50 transition-colors"></div>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center">
                                <RotateCcw className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Refunds</p>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">₹{stats.refund.toLocaleString()}</h3>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400 font-black text-xs uppercase italic">
                            From {stats.count} transactions
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-100/50 transition-colors"></div>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                                <CreditCard className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Settlement</p>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">₹{(stats.payment - stats.refund).toLocaleString()}</h3>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-blue-600 font-black text-xs uppercase italic tracking-tighter">
                            Net Revenue
                        </div>
                    </div>
                </div>

                {/* Transactions UI */}
                <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
                    <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/30">
                        <div className="flex items-center gap-4">
                            <div className="relative group min-w-[300px]">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search by Transaction ID..."
                                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black placeholder:font-bold focus:border-indigo-500 outline-none transition-all shadow-sm shadow-slate-100/50"
                                />
                            </div>
                            <div className="flex gap-2 p-1 bg-white rounded-2xl border border-slate-200 shadow-sm">
                                {['all', 'payment', 'refund'].map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setTypeFilter(type)}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${typeFilter === type ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:text-slate-600'
                                            }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Date & Info</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest italic tracking-tighter">Transaction ID</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest italic tracking-tighter">Order</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest italic tracking-tighter">Amount</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest italic tracking-tighter">Gateway</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest italic tracking-tighter">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr><td colSpan="6" className="px-6 py-20 text-center text-slate-400 font-black italic uppercase tracking-widest">Refreshing transactions...</td></tr>
                                ) : transactions.length === 0 ? (
                                    <tr><td colSpan="6" className="px-6 py-20 text-center text-slate-400 font-black italic uppercase tracking-widest">No transaction records found</td></tr>
                                ) : (
                                    transactions.map(item => (
                                        <tr key={item._id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-5">
                                                <p className="text-xs font-black text-slate-900 leading-none">{formatDate(item.createdAt)}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1.5">{item.user?.name || 'Guest User'}</p>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2 font-mono text-[11px] font-black text-slate-600 bg-slate-50 px-2 py-1 rounded-lg w-fit border border-slate-100">
                                                    {item.transactionNumber}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="text-xs font-black text-indigo-600 hover:underline cursor-pointer">#{item.order?.orderNumber}</span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-1.5">
                                                    {item.type === 'payment' ? (
                                                        <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" />
                                                    ) : (
                                                        <ArrowDownLeft className="w-3.5 h-3.5 text-red-500 stroke-[3]" />
                                                    )}
                                                    <span className={`text-sm font-black tracking-tight ${item.type === 'payment' ? 'text-slate-900' : 'text-red-600'}`}>
                                                        ₹{item.amount.toLocaleString()}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
                                                        {getGatewayIcon(item.paymentGateway)}
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.paymentGateway}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className={`px-2.5 py-1.5 rounded-xl border w-fit flex items-center gap-2 ${getStatusStyle(item.status)}`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'success' ? 'bg-emerald-500' : item.status === 'failed' ? 'bg-red-500' : 'bg-amber-500 shadow-lg shadow-amber-200 animation-pulse'}`}></div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest">{item.status}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-6 py-5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                            <p className="text-xs font-black text-slate-400 italic">Page {currentPage} of {totalPages}</p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2.5 bg-white border border-slate-200 rounded-2xl text-slate-900 hover:border-indigo-500 hover:text-indigo-600 disabled:opacity-40 transition-all font-black shadow-sm"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <div className="flex gap-1.5 px-2">
                                    {[...Array(totalPages)].map((_, i) => (
                                        <div key={i} className={`w-1.5 h-1.5 rounded-full ${currentPage === i + 1 ? 'bg-indigo-600 w-4' : 'bg-slate-200'} transition-all`}></div>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-2.5 bg-white border border-slate-200 rounded-2xl text-slate-900 hover:border-indigo-500 hover:text-indigo-600 disabled:opacity-40 transition-all font-black shadow-sm"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default Payments;
