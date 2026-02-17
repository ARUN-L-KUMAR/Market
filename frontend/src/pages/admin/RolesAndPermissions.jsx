import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
    Shield,
    Users,
    Lock,
    Eye,
    Edit,
    Trash2,
    Plus,
    Check,
    X,
    Info,
    Settings,
    Clock
} from 'lucide-react';
import { getRolesStats } from '../../services/adminService';

const RolesAndPermissions = () => {
    const [roles, setRoles] = useState([
        {
            id: 1,
            name: 'Super Admin',
            roleKey: 'admin',
            description: 'Full access to all system features and settings.',
            usersCount: 0,
            permissions: {
                products: { view: true, create: true, edit: true, delete: true },
                orders: { view: true, create: true, edit: true, delete: true },
                users: { view: true, create: true, edit: true, delete: true },
                settings: { view: true, create: true, edit: true, delete: true },
                finance: { view: true, create: true, edit: true, delete: true }
            },
            isLocked: true
        },
        {
            id: 2,
            name: 'Store Manager',
            roleKey: 'manager',
            description: 'Oversees daily operations, products, and orders.',
            usersCount: 0,
            permissions: {
                products: { view: true, create: true, edit: true, delete: false },
                orders: { view: true, create: true, edit: true, delete: false },
                users: { view: true, create: false, edit: false, delete: false },
                settings: { view: false, create: false, edit: false, delete: false },
                finance: { view: true, create: false, edit: false, delete: false }
            },
            isLocked: false
        },
        {
            id: 3,
            name: 'Inventory Manager',
            roleKey: 'inventory',
            description: 'Handles stock levels, product listings, and supply.',
            usersCount: 0,
            permissions: {
                products: { view: true, create: true, edit: true, delete: true },
                orders: { view: true, create: false, edit: false, delete: false },
                users: { view: false, create: false, edit: false, delete: false },
                settings: { view: false, create: false, edit: false, delete: false },
                finance: { view: false, create: false, edit: false, delete: false }
            },
            isLocked: false
        },
        {
            id: 4,
            name: 'Support Agent',
            roleKey: 'support',
            description: 'Manages customer inquiries and order assistance.',
            usersCount: 0,
            permissions: {
                products: { view: true, create: false, edit: false, delete: false },
                orders: { view: true, create: false, edit: true, delete: false },
                users: { view: true, create: false, edit: false, delete: false },
                settings: { view: false, create: false, edit: false, delete: false },
                finance: { view: false, create: false, edit: false, delete: false }
            },
            isLocked: false
        },
        {
            id: 5,
            name: 'Financial Analyst',
            roleKey: 'finance',
            description: 'Access to revenue, tax reports, and transaction data.',
            usersCount: 0,
            permissions: {
                products: { view: false, create: false, edit: false, delete: false },
                orders: { view: true, create: false, edit: false, delete: false },
                users: { view: false, create: false, edit: false, delete: false },
                settings: { view: false, create: false, edit: false, delete: false },
                finance: { view: true, create: true, edit: true, delete: true }
            },
            isLocked: false
        },
        {
            id: 6,
            name: 'Marketing lead',
            roleKey: 'marketing',
            description: 'Manages promotions, coupons, and site banners.',
            usersCount: 0,
            permissions: {
                products: { view: true, create: false, edit: true, delete: false },
                orders: { view: false, create: false, edit: false, delete: false },
                users: { view: false, create: false, edit: false, delete: false },
                settings: { view: false, create: false, edit: false, delete: false },
                finance: { view: false, create: false, edit: false, delete: false }
            },
            isLocked: false
        },
        {
            id: 7,
            name: 'Registered User',
            roleKey: 'user',
            description: 'Standard access for registered customers.',
            usersCount: 0,
            permissions: {
                products: { view: true, create: false, edit: false, delete: false },
                orders: { view: true, create: true, edit: false, delete: false },
                users: { view: false, create: false, edit: false, delete: false },
                settings: { view: false, create: false, edit: false, delete: false },
                finance: { view: false, create: false, edit: false, delete: false }
            },
            isLocked: false
        }
    ]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await getRolesStats();
                const stats = response.data.data;
                setRoles(prev => prev.map(role => ({
                    ...role,
                    usersCount: stats[role.roleKey] || 0
                })));
            } catch (error) {
                console.error('Error fetching role stats:', error);
            }
        };
        fetchStats();
    }, []);

    const [selectedRole, setSelectedRole] = useState(roles[0]);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const emptyPermissions = {
        products: { view: false, create: false, edit: false, delete: false },
        orders: { view: false, create: false, edit: false, delete: false },
        users: { view: false, create: false, edit: false, delete: false },
        settings: { view: false, create: false, edit: false, delete: false },
        finance: { view: false, create: false, edit: false, delete: false }
    };

    const [newRole, setNewRole] = useState({
        name: '',
        roleKey: '',
        description: '',
        permissions: { ...emptyPermissions }
    });

    const handleCreateRole = () => {
        if (!newRole.name.trim() || !newRole.roleKey.trim()) {
            alert('Role Name and Role Key are required.');
            return;
        }
        // Check for duplicate roleKey
        if (roles.some(r => r.roleKey === newRole.roleKey)) {
            alert('A role with this key already exists.');
            return;
        }
        const createdRole = {
            id: Date.now(),
            name: newRole.name.trim(),
            roleKey: newRole.roleKey.trim(),
            description: newRole.description.trim(),
            usersCount: 0,
            permissions: { ...newRole.permissions },
            isLocked: false
        };
        setRoles(prev => [...prev, createdRole]);
        setSelectedRole(createdRole);
        setNewRole({ name: '', roleKey: '', description: '', permissions: JSON.parse(JSON.stringify(emptyPermissions)) });
        setShowCreateModal(false);
    };

    useEffect(() => {
        // Sync selectedRole if it's the one we just updated stats for
        const currentRole = roles.find(r => r.id === selectedRole.id);
        if (currentRole && currentRole.usersCount !== selectedRole.usersCount) {
            setSelectedRole(currentRole);
        }
    }, [roles]);

    const permissionCategories = [
        { key: 'products', label: 'Products Management' },
        { key: 'orders', label: 'Order Processing' },
        { key: 'users', label: 'User Directory' },
        { key: 'settings', label: 'System Settings' },
        { key: 'finance', label: 'Financial Reports' }
    ];

    const togglePermission = (roleId, category, action) => {
        if (selectedRole.isLocked) return;

        setRoles(prevRoles => prevRoles.map(role => {
            if (role.id === roleId) {
                const updatedRole = {
                    ...role,
                    permissions: {
                        ...role.permissions,
                        [category]: {
                            ...role.permissions[category],
                            [action]: !role.permissions[category][action]
                        }
                    }
                };
                if (selectedRole.id === roleId) setSelectedRole(updatedRole);
                return updatedRole;
            }
            return role;
        }));
    };

    return (
        <AdminLayout>
            <div className="p-6">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Roles & Permissions</h1>
                        <p className="text-sm text-slate-500 mt-1">Define access levels and fine-tune permissions for administrative staff.</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Custom Role
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Roles List */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Access Levels</h3>
                        {roles.map((role) => (
                            <button
                                key={role.id}
                                onClick={() => setSelectedRole(role)}
                                className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 ${selectedRole.id === role.id
                                    ? 'bg-white border-indigo-200 shadow-md ring-1 ring-indigo-50'
                                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className={`p-2 rounded-xl ${selectedRole.id === role.id ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-500'}`}>
                                        <Shield className="h-4 w-4" />
                                    </div>
                                    {role.isLocked ? (
                                        <Lock className="h-3.5 w-3.5 text-slate-400 mt-1" />
                                    ) : (
                                        <div
                                            role="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (window.confirm(`Delete role "${role.name}"? This cannot be undone.`)) {
                                                    setRoles(prev => prev.filter(r => r.id !== role.id));
                                                    if (selectedRole.id === role.id) {
                                                        setSelectedRole(roles.find(r => r.id !== role.id) || roles[0]);
                                                    }
                                                }
                                            }}
                                            className="p-1.5 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 transition-all cursor-pointer"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </div>
                                    )}
                                </div>
                                <h4 className="font-bold text-slate-900">{role.name}</h4>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">{role.description}</p>
                                <div className="mt-4 flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    <Users className="h-3 w-3 mr-1.5" />
                                    {role.usersCount} Active Users
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Permissions Matrix */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-slate-900">{selectedRole.name} Permissions</h3>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Scale: View, Create, Edit, Delete</p>
                                </div>
                                {selectedRole.isLocked && (
                                    <div className="flex items-center px-2 py-1 bg-amber-50 text-amber-600 text-[10px] font-black rounded-lg uppercase tracking-tight border border-amber-100">
                                        <Lock className="h-3 w-3 mr-1" />
                                        System Role
                                    </div>
                                )}
                            </div>

                            <div className="divide-y divide-slate-100">
                                {permissionCategories.map((cat) => (
                                    <div key={cat.key} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                                        <div>
                                            <h4 className="font-bold text-slate-800 flex items-center">
                                                {cat.label}
                                                <Info className="h-3 w-3 ml-2 text-slate-300 group-hover:text-indigo-400 transition-colors cursor-help" />
                                            </h4>
                                            <p className="text-xs text-slate-500 mt-1">Control access to the {cat.label.toLowerCase()} module.</p>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            {['view', 'create', 'edit', 'delete'].map((action) => (
                                                <button
                                                    key={action}
                                                    disabled={selectedRole.isLocked}
                                                    onClick={() => togglePermission(selectedRole.id, cat.key, action)}
                                                    className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center transition-all duration-300 ${selectedRole.permissions[cat.key][action]
                                                        ? 'bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100'
                                                        : 'bg-slate-50 text-slate-300 border border-slate-100 hover:bg-slate-100'
                                                        } ${selectedRole.isLocked ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                                                >
                                                    {selectedRole.permissions[cat.key][action] ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                                                    <span className="text-[8px] font-black uppercase mt-1 tracking-tighter">{action}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3">
                                <button className="px-6 py-2 text-slate-600 text-sm font-bold hover:bg-slate-100 rounded-xl transition-all">
                                    Reset Changes
                                </button>
                                <button
                                    disabled={selectedRole.isLocked}
                                    className={`px-8 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all ${selectedRole.isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700 active:scale-95'
                                        }`}
                                >
                                    Save Permission Map
                                </button>
                            </div>
                        </div>

                        {/* Warning Note */}
                        <div className="mt-6 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex gap-4">
                            <div className="bg-indigo-100 p-2 rounded-xl h-fit">
                                <Shield className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div>
                                <h5 className="text-sm font-bold text-indigo-900">Security Note</h5>
                                <p className="text-xs text-indigo-700/80 mt-1 leading-relaxed">
                                    Permissions are cached for performance. Users may need to log out and back in for changes to take full effect.
                                    Super Admin role cannot be modified to ensure system integrity.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Custom Role Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white max-w-2xl w-full rounded-3xl shadow-2xl overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col">
                        {/* Header */}
                        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center flex-shrink-0">
                            <div>
                                <h3 className="text-lg font-black text-slate-900">Create Custom Role</h3>
                                <p className="text-xs text-slate-500 mt-1">Define a new access level with granular permissions.</p>
                            </div>
                            <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                                <X className="h-5 w-5 text-slate-400" />
                            </button>
                        </div>

                        {/* Scrollable body */}
                        <div className="overflow-y-auto flex-1 p-8 space-y-6">
                            {/* Name & Description */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Role Name *</label>
                                    <input
                                        type="text"
                                        value={newRole.name}
                                        onChange={(e) => setNewRole(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="e.g. Content Editor"
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 outline-none placeholder:text-slate-300"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Role Key *</label>
                                    <input
                                        type="text"
                                        value={newRole.roleKey}
                                        onChange={(e) => setNewRole(prev => ({ ...prev, roleKey: e.target.value.toLowerCase().replace(/\s/g, '_') }))}
                                        placeholder="e.g. content_editor"
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 outline-none placeholder:text-slate-300"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Description</label>
                                <textarea
                                    value={newRole.description}
                                    onChange={(e) => setNewRole(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Brief description of what this role can do..."
                                    rows={2}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 outline-none placeholder:text-slate-300 resize-none"
                                />
                            </div>

                            {/* Permissions Matrix */}
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Permissions</label>
                                <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                                    {/* Header row */}
                                    <div className="px-6 py-3 bg-slate-50 flex items-center justify-between">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Module</span>
                                        <div className="flex gap-1">
                                            {['view', 'create', 'edit', 'delete'].map(action => (
                                                <span key={action} className="w-14 text-center text-[8px] font-black text-slate-400 uppercase tracking-tight">{action}</span>
                                            ))}
                                        </div>
                                    </div>
                                    {permissionCategories.map(cat => (
                                        <div key={cat.key} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">{cat.label}</p>
                                            </div>
                                            <div className="flex gap-1">
                                                {['view', 'create', 'edit', 'delete'].map(action => (
                                                    <button
                                                        key={action}
                                                        type="button"
                                                        onClick={() => setNewRole(prev => ({
                                                            ...prev,
                                                            permissions: {
                                                                ...prev.permissions,
                                                                [cat.key]: {
                                                                    ...prev.permissions[cat.key],
                                                                    [action]: !prev.permissions[cat.key][action]
                                                                }
                                                            }
                                                        }))}
                                                        className={`w-14 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${newRole.permissions[cat.key][action]
                                                            ? 'bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100'
                                                            : 'bg-slate-50 text-slate-300 border border-slate-100 hover:bg-slate-100'
                                                            }`}
                                                    >
                                                        {newRole.permissions[cat.key][action] ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 flex-shrink-0">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-100 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateRole}
                                className="px-8 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
                            >
                                Create Role
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default RolesAndPermissions;
