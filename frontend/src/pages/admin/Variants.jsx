import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
    getVariants as fetchVariantsApi,
    createVariant,
    updateVariant,
    deleteVariant as deleteVariantApi
} from '../../services/adminService';
import {
    Layers,
    Plus,
    Settings2,
    ChevronDown,
    ChevronUp,
    Palette,
    Maximize,
    MousePointer2,
    Trash2,
    Copy,
    ArrowUp,
    ArrowDown,
    CheckCircle2,
    X,
    Check,
    Pencil,
    ToggleLeft,
    ToggleRight,
    Loader2
} from 'lucide-react';
import { toast } from 'react-toastify';

const Variants = () => {
    const [variantGroups, setVariantGroups] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [isDimensionModalOpen, setIsDimensionModalOpen] = useState(false);
    const [activeGroup, setActiveGroup] = useState(null);
    const [newGroup, setNewGroup] = useState({ name: '', type: 'Color' });
    const [newDimension, setNewDimension] = useState({ label: '', value: '' });
    const [expandedPanel, setExpandedPanel] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchVariants();
    }, []);

    const fetchVariants = async () => {
        try {
            setLoading(true);
            const response = await fetchVariantsApi();
            setVariantGroups(response.data.variants || []);
        } catch (error) {
            console.error('Error fetching variants:', error);
            toast.error('Failed to load variant systems');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            await createVariant({ name: newGroup.name, type: newGroup.type, values: [], status: 'Global' });
            toast.success(`System Standard "${newGroup.name}" initialized.`);
            setIsGroupModalOpen(false);
            setNewGroup({ name: '', type: 'Color' });
            fetchVariants();
        } catch (error) {
            toast.error('Failed to create variant group');
        } finally {
            setSaving(false);
        }
    };

    const handleAddDimension = async (e) => {
        e.preventDefault();
        if (!activeGroup) return;
        try {
            setSaving(true);
            const updatedValues = [...activeGroup.values, newDimension];
            await updateVariant(activeGroup._id, { values: updatedValues });
            toast.success(`Dimension "${newDimension.label}" appended to ${activeGroup.name}.`);
            setIsDimensionModalOpen(false);
            setNewDimension({ label: '', value: '' });
            fetchVariants();
        } catch (error) {
            toast.error('Failed to add dimension');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteGroup = async (id) => {
        if (window.confirm('Purge this variant system from the architectural core?')) {
            try {
                await deleteVariantApi(id);
                toast.warning('Variant system decentralized.');
                fetchVariants();
            } catch (error) {
                toast.error('Failed to delete variant group');
            }
        }
    };

    const moveDimension = async (groupId, valueIdx, direction) => {
        const group = variantGroups.find(g => g._id === groupId);
        if (!group) return;
        const values = [...group.values];
        const newIdx = valueIdx + direction;
        if (newIdx < 0 || newIdx >= values.length) return;
        [values[valueIdx], values[newIdx]] = [values[newIdx], values[valueIdx]];
        try {
            await updateVariant(groupId, { values });
            fetchVariants();
        } catch (error) {
            toast.error('Failed to reorder');
        }
    };

    const handleDeleteDimension = async (groupId, valueIdx, label) => {
        const group = variantGroups.find(g => g._id === groupId);
        if (!group) return;
        const values = group.values.filter((_, i) => i !== valueIdx);
        try {
            await updateVariant(groupId, { values });
            toast.warning(`Dimension "${label}" removed.`);
            fetchVariants();
        } catch (error) {
            toast.error('Failed to delete dimension');
        }
    };

    const toggleGroupStatus = async (groupId) => {
        const group = variantGroups.find(g => g._id === groupId);
        if (!group) return;
        const newStatus = group.status === 'Global' ? 'Disabled' : 'Global';
        try {
            await updateVariant(groupId, { status: newStatus });
            toast.info(`System status changed to ${newStatus}.`);
            fetchVariants();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

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
            <div className="p-6 max-w-[1600px] mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                    <div>
                        <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-1">
                            <Settings2 className="h-3 w-3" />
                            Configuration Suite
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                            Variant Systems
                            <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full border border-indigo-100 uppercase tracking-widest mt-1">
                                {variantGroups.length} Active Types
                            </span>
                        </h1>
                    </div>

                    <button
                        onClick={() => setIsGroupModalOpen(true)}
                        className="px-6 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all flex items-center gap-2 transform active:scale-95"
                    >
                        <Plus className="h-4 w-4" />
                        Create Variant Group
                    </button>
                </div>

                {/* Info Card */}
                <div className="bg-indigo-600 rounded-[2.5rem] p-8 mb-10 relative overflow-hidden group">
                    <div className="absolute right-[-5%] top-[-20%] w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/30">
                                <Layers className="h-8 w-8" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white tracking-tight">Standardize Your Catalog</h2>
                                <p className="text-indigo-100 text-sm font-medium mt-1">Cross-reference global attributes across any product listing in your ecosystem.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20">
                            <div className="px-4 py-2 text-center border-r border-white/10">
                                <div className="text-xl font-black text-white">{variantGroups.length}</div>
                                <div className="text-[8px] font-black text-indigo-200 uppercase tracking-widest">Systems</div>
                            </div>
                            <div className="px-4 py-2 text-center">
                                <div className="text-xl font-black text-white">{variantGroups.reduce((s, g) => s + g.values.length, 0)}</div>
                                <div className="text-[8px] font-black text-indigo-200 uppercase tracking-widest">Dimensions</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Variant Groups Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {variantGroups.map((group) => (
                        <div key={group._id} className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full group">
                            <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${group.type === 'Color' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'
                                        }`}>
                                        {group.type === 'Color' ? <Palette className="h-6 w-6" /> : <Maximize className="h-6 w-6" />}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-slate-900 leading-tight">{group.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{group.type} System</span>
                                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${group.status === 'Global' ? 'text-indigo-500' : 'text-slate-400'}`}>{group.status}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => toast.info('System architecture cloned to clipboard.')}
                                        className="p-2 text-slate-400 hover:text-slate-900 transition-all rounded-xl hover:bg-white border border-transparent hover:border-slate-100"
                                    >
                                        <Copy className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteGroup(group._id)}
                                        className="p-2 text-slate-400 hover:text-red-600 transition-all rounded-xl hover:bg-white border border-transparent hover:border-slate-100"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-8 space-y-4 flex-1">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-between">
                                    Defined Dimensions
                                    <span className="text-slate-900">{group.values.length} Items</span>
                                </div>
                                <div className="space-y-3">
                                    {group.values.map((v, idx) => (
                                        <div key={v._id || idx} className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-indigo-200 transition-all group/item">
                                            <div className="flex flex-col gap-0.5">
                                                <button
                                                    onClick={() => moveDimension(group._id, idx, -1)}
                                                    disabled={idx === 0}
                                                    className="p-0.5 text-slate-300 hover:text-indigo-600 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    <ArrowUp className="h-3 w-3" />
                                                </button>
                                                <button
                                                    onClick={() => moveDimension(group._id, idx, 1)}
                                                    disabled={idx === group.values.length - 1}
                                                    className="p-0.5 text-slate-300 hover:text-indigo-600 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    <ArrowDown className="h-3 w-3" />
                                                </button>
                                            </div>
                                            {group.type === 'Color' && (
                                                <div className="w-6 h-6 rounded-full border border-white shadow-sm ring-1 ring-slate-200" style={{ backgroundColor: v.value }}></div>
                                            )}
                                            <div className="flex-1 text-sm font-bold text-slate-700">{v.label}</div>
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-1 bg-white rounded-lg border border-slate-100">
                                                {v.value}
                                            </div>
                                            <button
                                                onClick={() => handleDeleteDimension(group._id, idx, v.label)}
                                                className="p-1.5 text-slate-300 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-all"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => {
                                            setActiveGroup(group);
                                            setIsDimensionModalOpen(true);
                                        }}
                                        className="w-full p-4 border border-dashed border-slate-200 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Plus className="h-3 w-3" />
                                        Append New Dimension
                                    </button>
                                </div>
                            </div>

                            <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between mt-auto">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-3 w-3 text-indigo-500" />
                                    <span className="text-[10px] font-bold text-slate-500 tracking-wide">{group.values.length} dimensions defined</span>
                                </div>
                                <button
                                    onClick={() => setExpandedPanel(expandedPanel === group._id ? null : group._id)}
                                    className="flex items-center gap-2 text-[10px] font-black text-slate-900 uppercase tracking-widest hover:text-indigo-600 transition-all"
                                >
                                    Control Panel
                                    {expandedPanel === group._id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                </button>
                            </div>

                            {expandedPanel === group._id && (
                                <div className="px-8 py-6 bg-white border-t border-slate-100 space-y-4 animate-in slide-in-from-top duration-200">
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                                            <div className="text-lg font-black text-slate-900">{group.values.length}</div>
                                            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Dimensions</div>
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                                            <div className="text-lg font-black text-slate-900">{group.type}</div>
                                            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Type</div>
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                                            <div className={`text-lg font-black ${group.status === 'Global' ? 'text-emerald-600' : 'text-slate-400'}`}>{group.status}</div>
                                            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Status</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => toggleGroupStatus(group._id)}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all"
                                        >
                                            {group.status === 'Global' ? <ToggleRight className="h-4 w-4 text-emerald-500" /> : <ToggleLeft className="h-4 w-4 text-slate-400" />}
                                            {group.status === 'Global' ? 'Active' : 'Disabled'}
                                        </button>
                                        <button
                                            onClick={() => handleDeleteGroup(group._id)}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 border border-red-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                            Purge
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Placeholder for expansion */}
                    <div
                        onClick={() => setIsGroupModalOpen(true)}
                        className="h-full min-h-[400px] bg-slate-50/30 rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-10 text-center cursor-pointer hover:bg-slate-50 transition-all"
                    >
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-300 mb-4 shadow-sm">
                            <MousePointer2 className="h-8 w-8" />
                        </div>
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2">New Architecture</h4>
                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed max-w-[200px]">
                            Define custom variant systems like Material, Weight, or Storage Capacity.
                        </p>
                    </div>
                </div>
            </div>

            {/* Group Modal */}
            {isGroupModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-500/20">
                                    <Layers className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Initialize System</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Define global variant parameters</p>
                                </div>
                            </div>
                            <button onClick={() => setIsGroupModalOpen(false)} className="p-2 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-100">
                                <X className="h-5 w-5 text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateGroup} className="p-8 space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">System Label</label>
                                <input
                                    type="text"
                                    value={newGroup.name}
                                    onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                                    required
                                    placeholder="e.g. Fabric Material"
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">System Logic</label>
                                <div className="grid grid-cols-2 gap-4">
                                    {['Color', 'Size'].map(type => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setNewGroup({ ...newGroup, type })}
                                            className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${newGroup.type === type
                                                ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600'
                                                : 'border-slate-100 hover:border-slate-200 text-slate-400'
                                                }`}
                                        >
                                            {type === 'Color' ? <Palette className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                                            <span className="text-[10px] font-black uppercase tracking-widest">{type} Based</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="pt-4 flex gap-4">
                                <button onClick={() => setIsGroupModalOpen(false)} type="button" className="flex-1 py-4 border border-slate-200 text-slate-500 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-slate-50">Cancel</button>
                                <button type="submit" disabled={saving} className="flex-1 py-4 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2 transform active:scale-95 disabled:opacity-50">
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Finalize System
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Dimension Modal */}
            {isDimensionModalOpen && (activeGroup) && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Append Dimension</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Adding to {activeGroup.name}</p>
                            </div>
                            <button onClick={() => setIsDimensionModalOpen(false)} className="p-2 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-100">
                                <X className="h-5 w-5 text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={handleAddDimension} className="p-8 space-y-6">
                            {activeGroup.type === 'Color' ? (
                                <>
                                    {/* Color Picker Section */}
                                    <div className="bg-slate-50 rounded-[2rem] border border-slate-100 p-6 space-y-5">
                                        <div className="flex items-center justify-between">
                                            <div className="text-xs font-black text-slate-900 uppercase tracking-widest">Choose Color</div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl border-2 border-white shadow-lg ring-1 ring-slate-200" style={{ backgroundColor: newDimension.value || '#6366f1' }}></div>
                                                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{newDimension.value || '#6366F1'}</span>
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="color"
                                                value={newDimension.value || '#6366f1'}
                                                onChange={(e) => setNewDimension({ ...newDimension, value: e.target.value.toUpperCase() })}
                                                className="w-full h-32 rounded-2xl cursor-pointer border-0 p-0"
                                                style={{ appearance: 'auto' }}
                                            />
                                        </div>
                                        {/* Quick preset colors */}
                                        <div>
                                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Quick Presets</div>
                                            <div className="flex flex-wrap gap-2">
                                                {['#000000', '#FFFFFF', '#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#6366F1', '#A855F7', '#EC4899', '#14B8A6', '#64748B'].map(hex => (
                                                    <button
                                                        key={hex}
                                                        type="button"
                                                        onClick={() => setNewDimension({ ...newDimension, value: hex })}
                                                        className={`w-8 h-8 rounded-xl border-2 transition-all transform hover:scale-110 ${newDimension.value === hex ? 'border-indigo-600 scale-110 shadow-lg' : 'border-white shadow-sm ring-1 ring-slate-200'}`}
                                                        style={{ backgroundColor: hex }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    {/* Label Input */}
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Color Name</label>
                                        <input
                                            type="text"
                                            value={newDimension.label}
                                            onChange={(e) => setNewDimension({ ...newDimension, label: e.target.value })}
                                            required
                                            placeholder="e.g. Sunset Orange"
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all"
                                        />
                                    </div>
                                </>
                            ) : (
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Label</label>
                                        <input
                                            type="text"
                                            value={newDimension.label}
                                            onChange={(e) => setNewDimension({ ...newDimension, label: e.target.value })}
                                            required
                                            placeholder="Extra Large"
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Value Code</label>
                                        <input
                                            type="text"
                                            value={newDimension.value}
                                            onChange={(e) => setNewDimension({ ...newDimension, value: e.target.value })}
                                            required
                                            placeholder="XL"
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            )}
                            <div className="pt-4 flex gap-4">
                                <button onClick={() => setIsDimensionModalOpen(false)} type="button" className="flex-1 py-4 border border-slate-200 text-slate-500 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-slate-50">Cancel</button>
                                <button type="submit" disabled={saving} className="flex-1 py-4 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2 transform active:scale-95 disabled:opacity-50">
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Expand Registry
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default Variants;
