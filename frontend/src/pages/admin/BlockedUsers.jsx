import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { getUsers, updateUser, deleteUser } from '../../services/adminService';
import {
    UserX,
    Search,
    RotateCcw,
    AlertCircle,
    Filter,
    MoreVertical,
    Calendar,
    Mail,
    ShieldAlert,
    Trash2,
    User,
    ExternalLink,
    XCircle
} from 'lucide-react';
import { toast } from 'react-toastify';

const BlockedUsers = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeMenu, setActiveMenu] = useState(null);
    const [deleteModal, setDeleteModal] = useState(null);
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [roleFilter, setRoleFilter] = useState('all');
    const filterRef = useRef(null);
    const menuRef = useRef(null);

    useEffect(() => {
        fetchBlockedUsers();

        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setActiveMenu(null);
            }
            if (filterRef.current && !filterRef.current.contains(event.target)) {
                setShowFilterDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchBlockedUsers = async () => {
        try {
            setLoading(true);
            const response = await getUsers({ isActive: false, limit: 100 });
            setUsers(response.data.data.users || []);
        } catch (error) {
            console.error('Error fetching blocked users:', error);
            toast.error('Failed to load restricted account list');
        } finally {
            setLoading(false);
        }
    };

    const handleUnblockUser = async (userId) => {
        try {
            await updateUser(userId, { isActive: true });
            toast.success('User access restored successfully');
            setUsers(users.filter(u => u._id !== userId));
        } catch (error) {
            console.error('Error unblocking user:', error);
            toast.error('Operation failed. Please try again.');
        }
    };

    const handleDeletePermanent = async (userId) => {
        try {
            await deleteUser(userId);
            toast.success('Account deleted permanently');
            setUsers(users.filter(u => u._id !== userId));
            setDeleteModal(null);
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error('Failed to delete account');
        }
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || u.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const roleOptions = [
        { value: 'all', label: 'All Roles' },
        { value: 'user', label: 'Users' },
        { value: 'admin', label: 'Admins' },
        { value: 'manager', label: 'Managers' }
    ];

    if (loading && users.length === 0) {
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
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                            Restricted Accounts
                            <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-black rounded-lg uppercase tracking-tighter border border-red-200">
                                {users.length} Suspended
                            </span>
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">Manage users who have been suspended from the platform for policy violations.</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Find in restricted list..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-400 outline-none transition-all w-72 shadow-sm"
                            />
                        </div>
                        <div className="relative" ref={filterRef}>
                            <button
                                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                                className={`p-2.5 border rounded-2xl transition-all shadow-sm ${roleFilter !== 'all' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                            >
                                <Filter className="h-5 w-5" />
                            </button>
                            {showFilterDropdown && (
                                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filter by Role</p>
                                    </div>
                                    {roleOptions.map(opt => (
                                        <button
                                            key={opt.value}
                                            onClick={() => { setRoleFilter(opt.value); setShowFilterDropdown(false); }}
                                            className={`w-full text-left px-4 py-2.5 text-sm font-bold transition-colors ${roleFilter === opt.value ? 'bg-indigo-50 text-indigo-600' : 'text-slate-700 hover:bg-slate-50'}`}
                                        >
                                            {opt.label}
                                            {roleFilter === opt.value && <span className="float-right text-indigo-600">✓</span>}
                                        </button>
                                    ))}
                                    {roleFilter !== 'all' && (
                                        <div className="border-t border-slate-100">
                                            <button
                                                onClick={() => { setRoleFilter('all'); setShowFilterDropdown(false); }}
                                                className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                                            >
                                                Clear Filter
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {filteredUsers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredUsers.map((user) => (
                            <div key={user._id} className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:border-red-200 hover:shadow-xl hover:shadow-red-500/5 transition-all duration-500 group overflow-hidden">
                                <div className="p-6 relative">
                                    <div className="absolute top-6 right-6 flex items-center gap-2">
                                        <span className="px-2 py-1 bg-red-50 text-red-600 text-[9px] font-black rounded-lg uppercase tracking-widest border border-red-100/50 flex items-center">
                                            <AlertCircle className="h-3 w-3 mr-1" /> Suspended
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-5 mt-2">
                                        <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 font-bold text-xl relative overflow-hidden group-hover:border-red-100 transition-colors">
                                            {user.avatar ? (
                                                <img src={user.avatar} className="w-full h-full object-cover" alt="" />
                                            ) : (
                                                user.name?.charAt(0).toUpperCase()
                                            )}
                                            <div className="absolute inset-0 bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <ShieldAlert className="h-8 w-8 text-red-500/20" />
                                            </div>
                                        </div>

                                        <div className="flex-1 overflow-hidden">
                                            <h3 className="text-base font-bold text-slate-900 truncate group-hover:text-red-600 transition-colors">{user.name}</h3>
                                            <div className="flex items-center text-xs font-bold text-slate-400 mt-0.5">
                                                <Mail className="h-3 w-3 mr-1.5 text-slate-300" />
                                                {user.email}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 space-y-3">
                                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
                                            <div className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                <Calendar className="h-3.5 w-3.5 mr-2 text-slate-300" />
                                                Joined On
                                            </div>
                                            <span className="text-[11px] font-black text-slate-700">{new Date(user.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-red-50/30 rounded-2xl border border-red-100/20">
                                            <div className="flex items-center text-[10px] font-bold text-red-400 uppercase tracking-wider">
                                                <AlertCircle className="h-3.5 w-3.5 mr-2" />
                                                Reason
                                            </div>
                                            <span className="text-[11px] font-black text-red-600">Policy Violation</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3 relative">
                                    <button
                                        onClick={() => handleUnblockUser(user._id)}
                                        className="flex-1 flex items-center justify-center py-2.5 bg-white border border-slate-200 text-indigo-600 text-xs font-black rounded-xl hover:bg-indigo-50 hover:border-indigo-200 transition-all"
                                    >
                                        <RotateCcw className="h-3.5 w-3.5 mr-2" /> Restore Access
                                    </button>

                                    <div className="relative">
                                        <button
                                            onClick={() => setActiveMenu(activeMenu === user._id ? null : user._id)}
                                            className={`px-3 py-2.5 rounded-xl border transition-all ${activeMenu === user._id ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                                        >
                                            <MoreVertical className="h-4 w-4" />
                                        </button>

                                        {activeMenu === user._id && (
                                            <div ref={menuRef} className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-20 animate-in fade-in slide-in-from-bottom-2 duration-200">
                                                <button
                                                    onClick={() => navigate(`/admin/users/${user._id}`)}
                                                    className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                                                >
                                                    <User className="h-4 w-4 text-indigo-500" /> View Profile
                                                </button>
                                                <div className="h-px bg-slate-100 mx-2 my-1" />
                                                <button
                                                    onClick={() => {
                                                        setDeleteModal(user);
                                                        setActiveMenu(null);
                                                    }}
                                                    className="w-full px-4 py-2.5 text-left text-xs font-bold text-red-500 hover:bg-red-50 flex items-center gap-3 transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" /> Delete Permanently
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-32 text-center bg-white rounded-3xl border border-dashed border-slate-200 flex flex-col items-center">
                        <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mb-6">
                            <ShieldAlert className="h-10 w-10 text-emerald-500/40" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">All Clear!</h3>
                        <p className="max-w-xs text-slate-500 mt-2 text-sm leading-relaxed">
                            No suspended accounts found. All users are currently operating in good standing with the platform policies.
                        </p>
                    </div>
                )}
            </div>

            {/* Permanent Delete Modal */}
            {deleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white max-w-sm w-full rounded-2xl shadow-xl overflow-hidden border border-slate-200">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="h-8 w-8 text-red-600" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Permanent Deletion</h3>
                            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                                You are about to permanently delete <span className="font-bold text-slate-900">{deleteModal.name}</span>. This action <span className="text-red-600 font-black">CANNOT</span> be undone.
                            </p>
                        </div>
                        <div className="p-6 bg-slate-50 flex gap-3">
                            <button
                                onClick={() => setDeleteModal(null)}
                                className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-100 transition-all font-black uppercase tracking-widest"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDeletePermanent(deleteModal._id)}
                                className="flex-1 px-4 py-2.5 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-500/20 transition-all font-black uppercase tracking-widest"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default BlockedUsers;
