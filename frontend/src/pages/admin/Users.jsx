import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsers, deleteUser, updateUser } from '../../services/adminService';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  UserCircle,
  Mail,
  Shield,
  Settings,
  Trash2,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Edit2,
  ShieldAlert,
  ShieldCheck as ShieldOn,
  UserCheck
} from 'lucide-react';
import { toast } from 'react-toastify';

const Users = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteModal, setDeleteModal] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [suspendModal, setSuspendModal] = useState(null);
  const [confirmCode, setConfirmCode] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const fetchUsers = async (page = 1, search = '', role = 'all') => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10
      };

      if (search) params.search = search;
      if (role !== 'all') params.role = role;

      const response = await getUsers(params);
      const { users, pagination } = response.data.data;
      setUsers(users);
      setTotalPages(pagination.pages || Math.ceil(pagination.total / 10));
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage, searchQuery, roleFilter);
  }, [currentPage, roleFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers(1, searchQuery, roleFilter);
  };

  const handleDeleteUser = async (userId) => {
    try {
      await deleteUser(userId);
      setDeleteModal(null);
      setUsers(users.filter(user => user._id !== userId));
      toast.success('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const handleUpdateRole = async (e) => {
    e.preventDefault();
    try {
      await updateUser(editModal._id, { role: editModal.role });
      setUsers(users.map(u => u._id === editModal._id ? { ...u, role: editModal.role } : u));
      setEditModal(null);
      toast.success('User role updated successfully');
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update user role');
    }
  };

  const handleToggleStatus = async (user) => {
    // If we are suspending, show the safety modal first
    if (user.isActive) {
      setSuspendModal(user);
      setConfirmCode('');
      return;
    }

    // If we are restoring, proceed directly
    try {
      await updateUser(user._id, { isActive: true });
      setUsers(users.map(u => u._id === user._id ? { ...u, isActive: true } : u));
      toast.success('Account access restored');
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Failed to restore user status');
    }
  };

  const confirmSuspension = async () => {
    if (confirmCode !== 'DOIT') return;

    try {
      await updateUser(suspendModal._id, { isActive: false });
      setUsers(users.map(u => u._id === suspendModal._id ? { ...u, isActive: false } : u));
      toast.success('Account suspended successfully');
      setSuspendModal(null);
    } catch (error) {
      console.error('Error suspending user:', error);
      toast.error('Failed to suspend user');
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'manager': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'inventory': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'support': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'user': return 'bg-slate-50 text-slate-500 border-slate-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">User Directory</h1>
            <p className="text-sm text-slate-500 mt-1">Manage all platform members and their system access.</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 flex flex-wrap gap-4 items-center justify-between">
          <form onSubmit={handleSearch} className="flex-grow max-w-md relative">
            <input
              type="text"
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:border-indigo-500 transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </form>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Filter:</span>
            <select
              className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-600 outline-none focus:border-indigo-500 transition-all cursor-pointer shadow-sm"
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All Roles</option>
              <option value="admin">Super Admin</option>
              <option value="manager">Store Manager</option>
              <option value="user">Registered User</option>
              <option value="inventory">Inventory Manager</option>
              <option value="support">Customer Support</option>
            </select>
          </div>
        </div>

        {/* Users table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">User Details</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">System Role</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Join Date</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
                      <p className="text-sm text-slate-500 font-medium">Accessing user directory...</p>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                        <UserCircle className="h-8 w-8 text-slate-300" />
                      </div>
                      <p className="text-slate-500 font-bold">No users found</p>
                      <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search terms.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center group-hover:border-indigo-200 transition-colors overflow-hidden">
                          {user.avatar ? (
                            <img className="h-full w-full object-cover" src={user.avatar} alt="" />
                          ) : (
                            <span className="text-slate-500 font-bold">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{user.name}</div>
                          <div className="text-[11px] text-slate-400 font-medium flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-[10px] font-black rounded-lg border uppercase tracking-widest ${getRoleBadgeColor(user.role)}`}>
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[11px] font-bold text-slate-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className={`px-2 py-0.5 text-[9px] font-black rounded-lg border uppercase w-fit tracking-tighter ${user.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                          {user.isActive ? 'Active' : 'Suspended'}
                        </span>
                        <span className={`px-2 py-0.5 text-[9px] font-black rounded-lg border uppercase w-fit tracking-tighter ${user.isEmailVerified ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                          {user.isEmailVerified ? 'Verified' : 'Unverified'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/admin/users/${user._id}`)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                          title="View Profile"
                        >
                          <UserCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className={`p-2 rounded-xl transition-all ${user.isActive ? 'text-slate-400 hover:text-red-600 hover:bg-red-50' : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'}`}
                          title={user.isActive ? 'Suspend User' : 'Restore User'}
                        >
                          {user.isActive ? <ShieldAlert className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => setEditModal(user)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                          title="Change Role"
                        >
                          <Settings className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteModal(user)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          title="Delete User"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
              <p className="text-xs text-slate-500 font-bold">Page {currentPage} of {totalPages}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all shadow-sm"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all shadow-sm"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

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
                <div className="w-12 h-12 bg-white rounded-xl border border-indigo-200 flex items-center justify-center text-indigo-600 font-bold shadow-sm">
                  {editModal.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{editModal.name}</h4>
                  <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest">Current: {editModal.role}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Select New Access Level</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'user', label: 'Registered User', desc: 'Customer' },
                    { id: 'manager', label: 'Store Manager', desc: 'Ops' },
                    { id: 'inventory', label: 'Inventory', desc: 'Stock' },
                    { id: 'support', label: 'Support', desc: 'Service' },
                    { id: 'marketing', label: 'Marketing', desc: 'Growth' },
                    { id: 'finance', label: 'Finance', desc: 'Reports' },
                    { id: 'engineer', label: 'Engineer', desc: 'System' },
                    { id: 'admin', label: 'Super Admin', desc: 'Root' }
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
                  Confirm Promotion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white max-w-sm w-full rounded-2xl shadow-xl overflow-hidden border border-slate-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trash2 className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Remove Account</h3>
              <p className="text-sm text-slate-500 mt-2">
                Are you sure you want to delete <span className="font-bold text-slate-900">{deleteModal.name}</span>? This action is permanent.
              </p>
            </div>
            <div className="p-6 bg-slate-50 flex gap-3">
              <button
                onClick={() => setDeleteModal(null)}
                className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-100 transition-all"
              >
                Keep User
              </button>
              <button
                onClick={() => handleDeleteUser(deleteModal._id)}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-500/20 transition-all"
              >
                Delete Account
              </button>
            </div>
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
              <h3 className="text-lg font-bold text-slate-900">Suspend Access</h3>
              <p className="text-sm text-slate-500 mt-2">
                This will instantly revoke <span className="font-bold text-slate-900">{suspendModal.name}</span>'s access to the platform.
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

export default Users;