import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { getUsers, deleteUser } from '../../services/adminService';
import {
    Users as UsersIcon,
    Mail,
    MapPin,
    ShoppingBag,
    Calendar,
    CheckCircle2,
    XCircle,
    MoreVertical,
    Search,
    ArrowUpRight
} from 'lucide-react';
import { toast } from 'react-toastify';

const CustomerList = () => {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const response = await getUsers({ role: 'user', limit: 100 });
            setCustomers(response.data.data.users || []);
        } catch (error) {
            console.error('Error fetching customers:', error);
            toast.error('Failed to load customers');
        } finally {
            setLoading(false);
        }
    };

    const filteredCustomers = customers.filter(c =>
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading && customers.length === 0) {
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
                        <h1 className="text-2xl font-bold text-slate-900">Customer Directory</h1>
                        <p className="text-sm text-slate-500 mt-1">View and manage your store's customer base.</p>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search customers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all w-64 shadow-sm"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCustomers.map((customer) => (
                        <div key={customer._id} className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500 group overflow-hidden">
                            <div className="p-6">
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-xl group-hover:scale-110 transition-transform duration-500">
                                        {customer.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 overflow-hidden text-ellipsis">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-base font-black text-slate-900 truncate">{customer.name}</h3>
                                            <div className={`w-2 h-2 rounded-full ${customer.isActive ? 'bg-emerald-500 ring-4 ring-emerald-500/10' : 'bg-slate-300'}`} />
                                        </div>
                                        <div className="flex items-center text-xs font-bold text-slate-400 mt-1">
                                            <Mail className="h-3 w-3 mr-1.5 text-indigo-400" />
                                            {customer.email}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-4 bg-slate-50/50 flex items-center justify-between border-y border-slate-100">
                                <div className="flex items-center gap-6">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Orders</p>
                                        <div className="flex items-center text-sm font-black text-slate-900">
                                            <ShoppingBag className="h-3.5 w-3.5 mr-1.5 text-indigo-500" />
                                            {customer.totalOrders || 0}
                                        </div>
                                    </div>
                                    <div className="w-px h-8 bg-slate-200" />
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Lifetime Value</p>
                                        <div className="flex items-center text-sm font-black text-emerald-600">
                                            <ArrowUpRight className="h-3.5 w-3.5 mr-1.5" />
                                            ${(customer.totalSpent || 0).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 flex items-center justify-between bg-white">
                                <div className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <Calendar className="h-3.5 w-3.5 mr-2 text-indigo-400/50" />
                                    Joined {new Date(customer.createdAt).toLocaleDateString()}
                                </div>
                                <button
                                    onClick={() => navigate(`/admin/users/${customer._id}`)}
                                    className="px-4 py-2 bg-slate-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-600 hover:text-white transition-all duration-300"
                                >
                                    Detail Profile
                                </button>
                            </div>
                        </div>
                    ))}

                    {filteredCustomers.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-dashed border-slate-300">
                            <UsersIcon className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                            <p className="text-slate-500">No customers found matching your search.</p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default CustomerList;
