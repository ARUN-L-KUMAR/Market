import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { getUserById, updateUser, deleteUser } from '../../services/adminService';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    ShoppingBag,
    ArrowUpRight,
    ArrowLeft,
    ShieldAlert,
    Trash2,
    Settings,
    Clock,
    CreditCard,
    ChevronRight,
    CheckCircle2,
    AlertCircle,
    Copy,
    ExternalLink
} from 'lucide-react';
import { toast } from 'react-toastify';

const UserProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteCode, setDeleteCode] = useState('');
    const [suspendCode, setSuspendCode] = useState('');
    const [showSuspendModal, setShowSuspendModal] = useState(false);

    useEffect(() => {
        fetchUserDetails();
    }, [id]);

    const fetchUserDetails = async () => {
        try {
            setLoading(true);
            const response = await getUserById(id);
            setUser(response.data.data);
        } catch (error) {
            console.error('Error fetching user:', error);
            toast.error('Failed to load user profile');
        } finally {
            setLoading(false);
        }
    };

    const handleCopyId = () => {
        navigator.clipboard.writeText(id);
        toast.info('User ID copied to clipboard');
    };

    const handleToggleStatus = async () => {
        if (user.isActive) {
            // Suspending — show DOIT confirmation
            setShowSuspendModal(true);
            setSuspendCode('');
            return;
        }
        // Restoring — no confirmation needed
        try {
            await updateUser(id, { isActive: true });
            setUser(prev => ({ ...prev, isActive: true }));
            toast.success('User access restored');
        } catch (error) {
            toast.error('Failed to restore user');
        }
    };

    const confirmSuspend = async () => {
        if (suspendCode.toUpperCase() !== 'DOIT') {
            toast.error('Enter DOIT to confirm');
            return;
        }
        try {
            await updateUser(id, { isActive: false });
            setUser(prev => ({ ...prev, isActive: false }));
            toast.success('User suspended');
            setShowSuspendModal(false);
        } catch (error) {
            toast.error('Failed to suspend user');
        }
    };

    const handleDeleteUser = async () => {
        if (deleteCode.toUpperCase() !== 'DOIT') {
            toast.error('Enter DOIT to confirm');
            return;
        }
        try {
            await deleteUser(id);
            toast.success('User permanently deleted');
            navigate('/admin/users');
        } catch (error) {
            toast.error('Failed to delete user');
        }
    };


    if (loading) {
        return (
            <AdminLayout>
                <div className="flex flex-col justify-center items-center h-screen -mt-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
                    <p className="text-slate-500 font-bold">Synchronizing user data...</p>
                </div>
            </AdminLayout>
        );
    }

    if (!user) {
        return (
            <AdminLayout>
                <div className="p-6 text-center py-20">
                    <AlertCircle className="h-16 w-16 text-slate-200 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-slate-900">User Not Found</h2>
                    <p className="text-slate-500 mt-2">The user account you are looking for does not exist or has been removed.</p>
                    <button onClick={() => navigate(-1)} className="mt-8 px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl">
                        Return to Directory
                    </button>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="p-6 max-w-7xl mx-auto pb-20">
                {/* Header Nav */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-sm font-bold text-slate-500 hover:text-indigo-600 transition-all p-2 hover:bg-indigo-50 rounded-xl"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Directory
                    </button>
                    <div className="flex gap-3">
                        <button
                            onClick={handleToggleStatus}
                            className={`flex items-center px-4 py-2.5 text-sm font-bold rounded-xl transition-all shadow-sm ${user.isActive
                                ? 'bg-white border border-slate-200 text-red-500 hover:bg-red-50 hover:border-red-200'
                                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-500/20'}`}
                        >
                            <ShieldAlert className="h-4 w-4 mr-2" />
                            {user.isActive ? 'Suspend Account' : 'Restore Access'}
                        </button>
                        <button
                            onClick={() => { setShowDeleteModal(true); setDeleteCode(''); }}
                            className="flex items-center px-4 py-2.5 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-500/20"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove User
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Profile Card */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="h-32 bg-indigo-600 relative">
                                <div className="absolute -bottom-12 left-6 p-1.5 bg-white rounded-3xl border-4 border-white shadow-xl">
                                    <div className="w-24 h-24 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden">
                                        {user.avatar ? (
                                            <img src={user.avatar} className="w-full h-full object-cover" alt="" />
                                        ) : (
                                            <User className="h-12 w-12 text-slate-400" />
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="pt-16 p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900 leading-tight">{user.name}</h2>
                                        <p className="text-sm font-bold text-slate-500 flex items-center mt-1">
                                            <Mail className="h-3.5 w-3.5 mr-2 text-indigo-500" />
                                            {user.email}
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-2 items-end">
                                        <span className={`px-2 py-1 text-[9px] font-black rounded-lg border uppercase tracking-widest ${user.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                            {user.isActive ? 'Active' : 'Suspended'}
                                        </span>
                                        <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[9px] font-black rounded-lg border border-indigo-100 uppercase tracking-widest">
                                            {user.role}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 mb-6">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-slate-400 uppercase tracking-widest">User ID</span>
                                        <button onClick={handleCopyId} className="font-mono text-indigo-600 hover:underline flex items-center">
                                            {id.substring(0, 10)}...
                                            <Copy className="h-3 w-3 ml-2" />
                                        </button>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-slate-400 uppercase tracking-widest">Email Status</span>
                                        <span className={`font-black ${user.isEmailVerified ? 'text-emerald-600' : 'text-amber-500'}`}>
                                            {user.isEmailVerified ? 'Verified' : 'Pending'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-slate-400 uppercase tracking-widest">Member Since</span>
                                        <span className="font-black text-slate-700">
                                            {user.createdAt && !isNaN(new Date(user.createdAt))
                                                ? new Date(user.createdAt).toLocaleDateString()
                                                : 'N/A'}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-4 bg-white border border-slate-200 rounded-2xl text-center shadow-sm">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Orders</p>
                                        <p className="text-2xl font-black text-slate-900">{user.totalOrders || 0}</p>
                                    </div>
                                    <div className="p-4 bg-white border border-slate-200 rounded-2xl text-center shadow-sm overflow-hidden">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Lifetime Spent</p>
                                        <p className="text-lg font-black text-emerald-600 truncate">₹{Number(user.totalSpent || 0).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center">
                                <CreditCard className="h-4 w-4 mr-2" />
                                Contact & Shipping
                            </h3>
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="p-3 bg-slate-50 rounded-2xl h-fit border border-slate-100">
                                        <Phone className="h-5 w-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-900">Phone Number</h4>
                                        <p className="text-sm text-slate-500 mt-1">{user.phone || 'Not provided'}</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="p-3 bg-slate-50 rounded-2xl h-fit border border-slate-100">
                                        <MapPin className="h-5 w-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-900">Primary Address</h4>
                                        {user.address ? (
                                            <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                                                {user.address}<br />
                                                {user.city}, {user.state} {user.zipCode}<br />
                                                {user.country}
                                            </p>
                                        ) : (
                                            <p className="text-sm text-slate-500 mt-1 italic">No address on file</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Navigation & Activity */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Tab Switcher */}
                        <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl w-fit">
                            {['overview', 'orders', 'activity'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab
                                        ? 'bg-white text-indigo-600 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-900'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {activeTab === 'overview' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
                                        <ShoppingBag className="h-32 w-32" />
                                    </div>
                                    <div className="relative z-10">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200">Recent Purchase</h4>
                                        <p className="text-3xl font-black mt-4">
                                            ₹{user.recentOrders?.[0] ? Number(user.recentOrders[0].totalAmount || user.recentOrders[0].total || 0).toLocaleString() : '0'}
                                        </p>
                                        <p className="text-indigo-100 text-sm mt-1">
                                            {user.recentOrders?.[0] ? `Ordered ${new Date(user.recentOrders[0].createdAt).toLocaleDateString()}` : 'No recent orders'}
                                        </p>
                                        <button
                                            onClick={() => setActiveTab('orders')}
                                            className="mt-8 flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all backdrop-blur-sm"
                                        >
                                            View Order <ChevronRight className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Activity Level</h4>
                                    <div className="mt-6 flex items-center gap-4">
                                        <div className="flex-1 space-y-2">
                                            <div className="flex justify-between text-[11px] font-bold">
                                                <span className="text-slate-500">Loyalty Score</span>
                                                <span className="text-indigo-600">85%</span>
                                            </div>
                                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="w-[85%] h-full bg-indigo-600 rounded-full" />
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-6 leading-relaxed">
                                        This user is in the <span className="font-bold text-indigo-600">Top 5%</span> of customers.
                                        Regular buyer with zero chargebacks.
                                    </p>
                                </div>

                                {/* Order Summary in Overview */}
                                <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                                    <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                        <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest flex items-center gap-3">
                                            <Clock className="h-4 w-4 text-indigo-600" />
                                            Recent Transactions
                                        </h3>
                                        <button className="text-[11px] font-black text-indigo-600 uppercase tracking-widest hover:underline">
                                            See All History
                                        </button>
                                    </div>
                                    <div className="divide-y divide-slate-100">
                                        {user.recentOrders && user.recentOrders.length > 0 ? (
                                            user.recentOrders.map(order => (
                                                <div key={order._id} className="px-8 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                                                            <ShoppingBag className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-900">Order #{order.orderNumber || order._id.substring(18)}</p>
                                                            <p className="text-[10px] text-slate-400 font-bold">{new Date(order.createdAt).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-black text-slate-900">${Number(order.totalAmount || order.total || 0).toLocaleString()}</p>
                                                        <span className={`px-2 py-0.5 text-[8px] font-black rounded-lg uppercase tracking-tight border ${order.status === 'completed' || order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                                                            }`}>
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-12 text-center">
                                                <ShoppingBag className="h-8 w-8 text-slate-200 mx-auto mb-3" />
                                                <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">No orders yet</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'orders' && (
                            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                    <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest flex items-center gap-3">
                                        <ShoppingBag className="h-4 w-4 text-indigo-600" />
                                        All Orders ({user.totalOrders || 0})
                                    </h3>
                                </div>
                                <div className="divide-y divide-slate-100">
                                    {user.recentOrders && user.recentOrders.length > 0 ? (
                                        user.recentOrders.map(order => (
                                            <div key={order._id} className="px-8 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate(`/admin/orders/${order._id}`)}>
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${order.status === 'delivered' || order.status === 'completed'
                                                        ? 'bg-emerald-50 text-emerald-600'
                                                        : order.status === 'cancelled'
                                                            ? 'bg-red-50 text-red-600'
                                                            : 'bg-amber-50 text-amber-600'
                                                        }`}>
                                                        <ShoppingBag className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900">Order #{order.orderNumber || order._id.substring(18)}</p>
                                                        <p className="text-[10px] text-slate-400 font-bold">{new Date(order.createdAt).toLocaleDateString()} • {order.items?.length || 0} item(s)</p>
                                                    </div>
                                                </div>
                                                <div className="text-right flex items-center gap-4">
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900">₹{Number(order.totalAmount || 0).toLocaleString()}</p>
                                                        <span className={`px-2 py-0.5 text-[8px] font-black rounded-lg uppercase tracking-tight border ${order.status === 'completed' || order.status === 'delivered'
                                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                            : order.status === 'cancelled'
                                                                ? 'bg-red-50 text-red-600 border-red-100'
                                                                : 'bg-amber-50 text-amber-600 border-amber-100'
                                                            }`}>
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                    <ChevronRight className="h-4 w-4 text-slate-300" />
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-12 text-center">
                                            <ShoppingBag className="h-8 w-8 text-slate-200 mx-auto mb-3" />
                                            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">No orders found</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'activity' && (
                            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
                                    <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest flex items-center gap-3">
                                        <Clock className="h-4 w-4 text-indigo-600" />
                                        Activity Timeline
                                    </h3>
                                </div>
                                <div className="p-8">
                                    {user.recentOrders && user.recentOrders.length > 0 ? (
                                        <div className="space-y-6">
                                            {/* Account creation */}
                                            <div className="flex gap-4">
                                                <div className="relative">
                                                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 z-10 relative">
                                                        <User className="h-4 w-4" />
                                                    </div>
                                                    {user.recentOrders.length > 0 && <div className="absolute top-10 bottom-[-24px] left-1/2 -translate-x-1/2 w-px bg-slate-200" />}
                                                </div>
                                                <div className="py-2">
                                                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">ACCOUNT • {user.createdAt && !isNaN(new Date(user.createdAt)) ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}</p>
                                                    <p className="text-sm font-bold text-slate-800 mt-1">Account created with role: {user.role}</p>
                                                </div>
                                            </div>

                                            {/* Order-based activity */}
                                            {user.recentOrders.map((order, i) => (
                                                <div key={order._id} className="flex gap-4">
                                                    <div className="relative">
                                                        <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center z-10 relative ${order.status === 'delivered' || order.status === 'completed'
                                                            ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                                                            : order.status === 'cancelled'
                                                                ? 'bg-red-50 border-red-100 text-red-600'
                                                                : 'bg-amber-50 border-amber-100 text-amber-600'
                                                            }`}>
                                                            <ShoppingBag className="h-4 w-4" />
                                                        </div>
                                                        {i < user.recentOrders.length - 1 && <div className="absolute top-10 bottom-[-24px] left-1/2 -translate-x-1/2 w-px bg-slate-200" />}
                                                    </div>
                                                    <div className="py-2 flex-1">
                                                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">
                                                            ORDER • {new Date(order.createdAt).toLocaleDateString()}
                                                        </p>
                                                        <p className="text-sm font-bold text-slate-800 mt-1">
                                                            Placed Order #{order.orderNumber || order._id.substring(18)} — ₹{Number(order.totalAmount || 0).toLocaleString()}
                                                        </p>
                                                        <span className={`inline-block mt-1 px-2 py-0.5 text-[8px] font-black rounded-lg uppercase tracking-tight border ${order.status === 'completed' || order.status === 'delivered'
                                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                            : order.status === 'cancelled'
                                                                ? 'bg-red-50 text-red-600 border-red-100'
                                                                : 'bg-amber-50 text-amber-600 border-amber-100'
                                                            }`}>
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <Clock className="h-8 w-8 text-slate-200 mx-auto mb-3" />
                                            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">No activity recorded</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Suspend Confirmation Modal */}
            {showSuspendModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white max-w-sm w-full rounded-2xl shadow-xl overflow-hidden border border-slate-200">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <ShieldAlert className="h-8 w-8 text-red-600" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Suspend {user.name}?</h3>
                            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                                This will immediately revoke login access. Type <span className="font-black text-red-600">DOIT</span> to confirm.
                            </p>
                            <input
                                type="text"
                                value={suspendCode}
                                onChange={(e) => setSuspendCode(e.target.value)}
                                placeholder="Type DOIT"
                                className="mt-4 w-full px-4 py-3 border border-slate-200 rounded-xl text-center text-sm font-black uppercase tracking-widest focus:ring-4 focus:ring-red-500/10 focus:border-red-400 outline-none"
                            />
                        </div>
                        <div className="p-6 bg-slate-50 flex gap-3">
                            <button onClick={() => setShowSuspendModal(false)} className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-all">Cancel</button>
                            <button onClick={confirmSuspend} className="flex-1 px-4 py-2.5 bg-red-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-red-700 shadow-lg shadow-red-500/20 transition-all">Suspend</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white max-w-sm w-full rounded-2xl shadow-xl overflow-hidden border border-slate-200">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="h-8 w-8 text-red-600" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Permanent Deletion</h3>
                            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                                You are about to permanently delete <span className="font-bold text-slate-900">{user.name}</span>. This action <span className="text-red-600 font-black">CANNOT</span> be undone. Type <span className="font-black text-red-600">DOIT</span> to confirm.
                            </p>
                            <input
                                type="text"
                                value={deleteCode}
                                onChange={(e) => setDeleteCode(e.target.value)}
                                placeholder="Type DOIT"
                                className="mt-4 w-full px-4 py-3 border border-slate-200 rounded-xl text-center text-sm font-black uppercase tracking-widest focus:ring-4 focus:ring-red-500/10 focus:border-red-400 outline-none"
                            />
                        </div>
                        <div className="p-6 bg-slate-50 flex gap-3">
                            <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-all">Cancel</button>
                            <button onClick={handleDeleteUser} className="flex-1 px-4 py-2.5 bg-red-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-red-700 shadow-lg shadow-red-500/20 transition-all">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default UserProfile;
