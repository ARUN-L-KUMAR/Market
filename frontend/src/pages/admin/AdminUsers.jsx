import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import apiClient from '../../services/api';
import { updateUser } from '../../services/adminService';
import {
    Plus,
    Shield,
    ShieldCheck,
    Mail,
    Calendar,
    MoreVertical,
    Trash2,
    UserPlus,
    Search,
    CheckCircle2,
    XCircle,
    Settings,
    ShieldAlert,
    UserCheck
} from 'lucide-react';
import { toast } from 'react-toastify';

const AdminUsers = () => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editModal, setEditModal] = useState(null);
    const [suspendModal, setSuspendModal] = useState(null);
    const [confirmCode, setConfirmCode] = useState('');
    const [newAdmin, setNewAdmin] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'admin'
    });

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/api/admin/users/admins');
            setAdmins(Array.isArray(response.data) ? response.data : response.data.data || []);
        } catch (error) {
            console.error('Error fetching admins:', error);
            toast.error('Failed to load admin users');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        try {
            await apiClient.post('/api/admin/create-admin', newAdmin);
            toast.success('Staff user created successfully');
            setIsModalOpen(false);
            setNewAdmin({ email: '', password: '', firstName: '', lastName: '', role: 'admin' });
            fetchAdmins();
        } catch (error) {
            console.error('Error creating admin:', error);
            toast.error(error.response?.data?.message || 'Failed to create staff');
        }
    };

    const handleUpdateRole = async (e) => {
        e.preventDefault();
        try {
            await updateUser(editModal._id, { role: editModal.role });
            toast.success('User role updated successfully');
            setEditModal(null);
            fetchAdmins();
        } catch (error) {
            console.error('Error updating role:', error);
            toast.error('Failed to update user role');
        }
    };

    const handleToggleStatus = async (admin) => {
        if (admin.isActive) {
            setSuspendModal(admin);
            setConfirmCode('');
            return;
        }

        try {
            await updateUser(admin._id, { isActive: true });
            toast.success('Access restored successfully');
            fetchAdmins();
        } catch (error) {
            console.error('Error restoring status:', error);
            toast.error('Failed to restore access');
        }
    };

    const confirmSuspension = async () => {
        if (confirmCode !== 'DOIT') return;

        try {
            await updateUser(suspendModal._id, { isActive: false });
            toast.success('Account suspended successfully');
            setSuspendModal(null);
            fetchAdmins();
        } catch (error) {
            console.error('Error suspending admin:', error);
            toast.error('Failed to suspend account');
        }
    };

    const handleRemoveAdmin = async (id) => {
        if (window.confirm('Are you sure you want to remove this staff member? This will permanently delete the user.')) {
            try {
                await apiClient.delete(`/api/admin/users/${id}`);
                toast.success('Staff member removed successfully');
                fetchAdmins();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to remove staff');
            }
        }
    };

    if (loading && admins.length === 0) {
        return (
            <AdminLayout>
                <div className="flex flex-col justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
                    <p className="text-slate-500 font-medium">Accessing staff directory...</p>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="p-6">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Administrator Management</h1>
                        <p className="text-sm text-slate-500 mt-1">Manage system administrators and their access levels.</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center px-4 py-3 bg-[#0f172a] text-white text-sm font-bold rounded-xl hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all active:scale-95"
                    >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add New Admin
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {admins.map((admin) => (
                        <div key={admin._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all duration-300 group">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="relative">
                                        <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
                                            <ShieldCheck className="h-7 w-7" />
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full" />
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => handleToggleStatus(admin)}
                                            className={`p-2 rounded-lg transition-all ${admin.isActive ? 'text-slate-400 hover:text-red-600 hover:bg-red-50' : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'}`}
                                            title={admin.isActive ? 'Suspend Access' : 'Restore Access'}
                                        >
                                            {admin.isActive ? <ShieldAlert className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                                        </button>
                                        <button
                                            onClick={() => setEditModal(admin)}
                                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                            title="Change Role"
                                        >
                                            <Settings className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleRemoveAdmin(admin._id)}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                            title="Delete Account"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                            {admin.firstName} {admin.lastName}
                                        </h3>
                                        <div className="flex items-center text-xs font-bold text-slate-500 mt-1">
                                            <Mail className="h-3 w-3 mr-1.5 text-indigo-400" />
                                            {admin.email}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-1 ${admin.role === 'admin' ? 'bg-indigo-50 text-indigo-600 border-indigo-100/50' :
                                            admin.role === 'manager' ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50' :
                                                admin.role === 'inventory' ? 'bg-amber-50 text-amber-600 border-amber-100/50' :
                                                    admin.role === 'support' ? 'bg-blue-50 text-blue-600 border-blue-100/50' :
                                                        admin.role === 'finance' ? 'bg-rose-50 text-rose-600 border-rose-100/50' :
                                                            admin.role === 'marketing' ? 'bg-purple-50 text-purple-600 border-purple-100/50' :
                                                                admin.role === 'engineer' ? 'bg-slate-50 text-slate-600 border-slate-100/50' :
                                                                    'bg-slate-50 text-slate-600 border-slate-100/50'
                                            } text-[10px] font-black rounded-lg uppercase tracking-widest border`}>
                                            {admin.role === 'admin' ? 'Super Admin' :
                                                admin.role.replace('_', ' ')}
                                        </span>
                                        <span className={`px-2 py-1 ${admin.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50' : 'bg-red-50 text-red-600 border-red-100/50'} text-[10px] font-black rounded-lg uppercase tracking-widest border`}>
                                            {admin.isActive ? 'Active' : 'Suspended'}
                                        </span>
                                    </div>

                                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                                        <div className="flex items-center text-[10px] font-bold text-slate-400">
                                            <Calendar className="h-3 w-3 mr-1.5" />
                                            Joined {new Date(admin.createdAt).toLocaleDateString()}
                                        </div>
                                        <div className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                                            Last access: Today
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Create Admin Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="font-bold text-slate-900">Add New System Admin</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 rounded-xl transition-all">
                                <XCircle className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateAdmin} className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">First Name</label>
                                    <input
                                        type="text"
                                        value={newAdmin.firstName}
                                        onChange={(e) => setNewAdmin({ ...newAdmin, firstName: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 placeholder:text-slate-400 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Last Name</label>
                                    <input
                                        type="text"
                                        value={newAdmin.lastName}
                                        onChange={(e) => setNewAdmin({ ...newAdmin, lastName: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 placeholder:text-slate-400 transition-all"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
                                <input
                                    type="email"
                                    value={newAdmin.email}
                                    onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                                    required
                                    placeholder="admin@example.com"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 placeholder:text-slate-400 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Initial Password</label>
                                <input
                                    type="password"
                                    value={newAdmin.password}
                                    onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                                    required
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 placeholder:text-slate-400 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Assign Role</label>
                                <select
                                    value={newAdmin.role}
                                    onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="admin">Super Admin</option>
                                    <option value="manager">Store Manager</option>
                                    <option value="inventory">Inventory Manager</option>
                                    <option value="order_processor">Order Processor</option>
                                    <option value="support">Customer Support</option>
                                    <option value="marketing">Marketing Specialist</option>
                                    <option value="finance">Financial Analyst</option>
                                    <option value="engineer">Technical Engineer</option>
                                </select>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all"
                                >
                                    Create Staff Account
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Role Modal */}
            {editModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="font-bold text-slate-900">Manage System Role</h3>
                            <button
                                onClick={() => setEditModal(null)}
                                className="p-2 text-slate-400 hover:text-slate-900 rounded-xl transition-all"
                            >
                                <XCircle className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateRole} className="p-6 space-y-6">
                            <div className="flex items-center gap-4 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                                <div className="w-12 h-12 bg-white rounded-xl border border-indigo-200 flex items-center justify-center text-indigo-600 font-bold shadow-sm text-lg">
                                    {(editModal.firstName || editModal.name || '?').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">{editModal.firstName} {editModal.lastName}</h4>
                                    <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest">Current: {editModal.role}</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Select New Access Level</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { id: 'admin', label: 'Super Admin', desc: 'Root access' },
                                        { id: 'manager', label: 'Store Manager', desc: 'Ops & Sales' },
                                        { id: 'inventory', label: 'Inventory', desc: 'Supply Chain' },
                                        { id: 'support', label: 'Support Agent', desc: 'Customer help' },
                                        { id: 'marketing', label: 'Marketing', desc: 'Growth' },
                                        { id: 'finance', label: 'Finance', desc: 'Tax & Rev' },
                                        { id: 'engineer', label: 'Engineer', desc: 'Dev & API' },
                                        { id: 'user', label: 'Customer', desc: 'Standard' }
                                    ].map((r) => (
                                        <button
                                            key={r.id}
                                            type="button"
                                            onClick={() => setEditModal({ ...editModal, role: r.id })}
                                            className={`flex items-center justify-between p-3 rounded-2xl border text-left transition-all group ${editModal.role === r.id
                                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200'
                                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-indigo-300'
                                                }`}
                                        >
                                            <div>
                                                <p className={`text-[11px] font-black uppercase tracking-tight ${editModal.role === r.id ? 'text-white' : 'text-slate-900'}`}>{r.label}</p>
                                                <p className={`text-[9px] ${editModal.role === r.id ? 'text-indigo-100' : 'text-slate-400'}`}>{r.desc}</p>
                                            </div>
                                            {editModal.role === r.id && <CheckCircle2 className="h-3 w-3 text-white" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setEditModal(null)}
                                    className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
                                >
                                    Confirm Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Suspend confirmation modal */}
            {suspendModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white max-w-sm w-full rounded-2xl shadow-xl overflow-hidden border border-slate-200">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <ShieldAlert className="h-8 w-8 text-red-600" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Suspend Admin Access</h3>
                            <p className="text-sm text-slate-500 mt-2">
                                Warning: This will revoke system access for <span className="font-bold text-slate-900">{suspendModal.firstName} {suspendModal.lastName}</span>.
                            </p>

                            <div className="mt-6 text-left">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 text-center">
                                    Type <span className="text-red-600">DOIT</span> to confirm
                                </label>
                                <input
                                    type="text"
                                    value={confirmCode}
                                    onChange={(e) => setConfirmCode(e.target.value.toUpperCase())}
                                    placeholder="Enter code..."
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-sm font-bold outline-none focus:border-red-500 transition-all"
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50 flex gap-3">
                            <button
                                onClick={() => setSuspendModal(null)}
                                className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-100 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmSuspension}
                                disabled={confirmCode !== 'DOIT'}
                                className="flex-1 px-4 py-2.5 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Suspend
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminUsers;
