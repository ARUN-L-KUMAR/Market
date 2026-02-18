import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import Button from '../../components/ui/Button';
import {
    Search,
    Filter,
    RotateCcw,
    ChevronLeft,
    ChevronRight,
    Package,
    User,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    MoreVertical,
    Eye
} from 'lucide-react';
import { getReturns, updateReturnStatus } from '../../services/adminService';
import { toast } from 'react-toastify';
import { formatDate } from '../../utils/formatters';

const Returns = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [returns, setReturns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedReturn, setSelectedReturn] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    const fetchReturnRequests = async (page = 1) => {
        try {
            setLoading(true);
            let statusValue = statusFilter !== 'all' ? statusFilter : undefined;

            // Special case: Received tab should show both received and refunded items
            if (statusFilter === 'received') {
                statusValue = 'received,refund_processed';
            }

            const params = {
                page,
                limit: 10,
                status: statusValue,
                search: searchTerm || undefined
            };
            const response = await getReturns(params);
            const { returns, pagination } = response.data.data;
            setReturns(returns);
            setTotalPages(pagination.pages);
            setCurrentPage(page);
        } catch (err) {
            console.error('Error fetching returns:', err);
            toast.error('Failed to load return requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReturnRequests(currentPage);
    }, [currentPage, statusFilter]);

    const handleStatusUpdate = async (id, status) => {
        try {
            await updateReturnStatus(id, { status });
            toast.success(`Return request ${status} successfully`);
            fetchReturnRequests(currentPage);
            setShowDetails(false);
        } catch (err) {
            console.error('Error updating status:', err);
            toast.error('Failed to update status');
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-700 border border-amber-200">Pending</span>;
            case 'approved':
                return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-700 border border-blue-200">Approved</span>;
            case 'received':
                return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-700 border border-indigo-200">Received</span>;
            case 'refund_processed':
                return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200">Refunded</span>;
            case 'rejected':
                return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-700 border border-red-200">Rejected</span>;
            default:
                return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">{status}</span>;
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Returns & Refunds</h1>
                        <p className="text-slate-500 text-sm font-medium">Manage product return requests and customer refunds</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="gap-2 bg-white border-slate-200 text-slate-700 font-bold h-11">
                            <RotateCcw className="w-4 h-4" />
                            Reset
                        </Button>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="bg-white rounded-3xl border border-slate-100 p-2 shadow-sm">
                    <div className="flex flex-col md:flex-row gap-2">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search return number..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && fetchReturnRequests(1)}
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all"
                            />
                        </div>
                        <div className="flex gap-2 p-1 bg-slate-50 rounded-2xl">
                            {['all', 'pending', 'approved', 'received', 'refund_processed', 'rejected'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${statusFilter === status
                                        ? 'bg-white text-indigo-600 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    {status === 'refund_processed' ? 'Refunded' : status}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Return ID</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Order</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-5 text-[10px) font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-slate-400 font-bold">
                                            Loading return requests...
                                        </td>
                                    </tr>
                                ) : returns.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-slate-400 font-bold">
                                            No return requests found
                                        </td>
                                    </tr>
                                ) : (
                                    returns.map((item) => (
                                        <tr key={item._id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center">
                                                        <RotateCcw className="w-5 h-5 text-amber-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900 tracking-tight">{item.returnNumber}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{formatDate(item.createdAt)}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <p className="text-sm font-bold text-slate-700 tracking-tight">#{item.order?.orderNumber}</p>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
                                                        <User className="w-4 h-4 text-slate-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900 tracking-tight">{item.user?.name}</p>
                                                        <p className="text-xs text-slate-400 font-medium">{item.user?.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <p className="text-sm font-black text-slate-900 tracking-tight">₹{item.refundAmount.toLocaleString()}</p>
                                            </td>
                                            <td className="px-6 py-5">
                                                {getStatusBadge(item.status)}
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => { setSelectedReturn(item); setShowDetails(true); }}
                                                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                                    >
                                                        <Eye className="w-5 h-5" />
                                                    </button>
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
                            <p className="text-sm font-bold text-slate-500">
                                Page <span className="text-slate-900">{currentPage}</span> of <span className="text-slate-900">{totalPages}</span>
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 bg-white border border-slate-200 rounded-xl disabled:opacity-50 transition-all hover:border-indigo-500"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 bg-white border border-slate-200 rounded-xl disabled:opacity-50 transition-all hover:border-indigo-500"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Details Modal Placeholder */}
            {showDetails && selectedReturn && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 space-y-8">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Return Details</h3>
                                    <p className="text-slate-500 text-sm font-medium">Request ID: {selectedReturn.returnNumber}</p>
                                </div>
                                <button
                                    onClick={() => setShowDetails(false)}
                                    className="p-2 h-10 w-10 bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-8 p-6 bg-slate-50 rounded-3xl">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Reason for Return</p>
                                    <p className="text-sm font-bold text-slate-900">
                                        {selectedReturn.reason.replace('_', ' ').toUpperCase()}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-2 italic">"{selectedReturn.reasonDetails}"</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Refund Amount</p>
                                    <p className="text-xl font-black text-indigo-600 tracking-tight">₹{selectedReturn.refundAmount.toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Actions</h4>
                                <div className="flex flex-wrap gap-3">
                                    {selectedReturn.status === 'pending' && (
                                        <>
                                            <Button
                                                onClick={() => handleStatusUpdate(selectedReturn._id, 'approved')}
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 py-3 rounded-2xl h-12 shadow-lg shadow-emerald-200 uppercase tracking-widest text-xs"
                                            >
                                                Approve Request
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                onClick={() => handleStatusUpdate(selectedReturn._id, 'rejected')}
                                                className="bg-red-600 hover:bg-red-700 text-white font-black px-6 py-3 rounded-2xl h-12 shadow-lg shadow-red-200 uppercase tracking-widest text-xs"
                                            >
                                                Reject
                                            </Button>
                                        </>
                                    )}
                                    {selectedReturn.status === 'approved' && (
                                        <>
                                            <Button
                                                onClick={() => handleStatusUpdate(selectedReturn._id, 'received')}
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-6 py-3 rounded-2xl h-12 shadow-lg shadow-indigo-200 uppercase tracking-widest text-xs"
                                            >
                                                Mark as Received
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => handleStatusUpdate(selectedReturn._id, 'pending')}
                                                className="border-slate-200 text-slate-600 font-black px-6 py-3 rounded-2xl h-12 uppercase tracking-widest text-xs"
                                            >
                                                Undo Approval
                                            </Button>
                                        </>
                                    )}
                                    {selectedReturn.status === 'received' && (
                                        <>
                                            <Button
                                                onClick={() => handleStatusUpdate(selectedReturn._id, 'refund_processed')}
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 py-3 rounded-2xl h-12 shadow-lg shadow-emerald-200 uppercase tracking-widest text-xs"
                                            >
                                                Complete Refund
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => handleStatusUpdate(selectedReturn._id, 'approved')}
                                                className="border-slate-200 text-slate-600 font-black px-6 py-3 rounded-2xl h-12 uppercase tracking-widest text-xs"
                                            >
                                                Undo Received
                                            </Button>
                                        </>
                                    )}
                                    {selectedReturn.status === 'refund_processed' && (
                                        <Button
                                            variant="outline"
                                            onClick={() => handleStatusUpdate(selectedReturn._id, 'received')}
                                            className="border-slate-200 text-slate-600 font-black px-6 py-3 rounded-2xl h-12 uppercase tracking-widest text-xs"
                                        >
                                            Undo Refund (Revert to Received)
                                        </Button>
                                    )}
                                    {selectedReturn.status === 'rejected' && (
                                        <Button
                                            variant="outline"
                                            onClick={() => handleStatusUpdate(selectedReturn._id, 'pending')}
                                            className="border-slate-200 text-slate-600 font-black px-6 py-3 rounded-2xl h-12 uppercase tracking-widest text-xs"
                                        >
                                            Undo Rejection
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default Returns;
