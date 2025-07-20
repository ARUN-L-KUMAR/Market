import React, { useState, useEffect } from 'react';
import { Users, Shield, Eye, EyeOff, Copy, Check, AlertTriangle } from 'lucide-react';

const AdminUserManagement = () => {
  const [adminUsers, setAdminUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPasswords, setShowPasswords] = useState({});
  const [copiedField, setCopiedField] = useState('');
  const [newAdmin, setNewAdmin] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  // Default admin credentials
  const defaultAdminCredentials = {
    email: 'admin@market.com',
    password: 'admin123'
  };

  useEffect(() => {
    fetchAdminUsers();
  }, []);

  const fetchAdminUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAdminUsers(data.filter(user => user.role === 'admin'));
      }
    } catch (error) {
      console.error('Error fetching admin users:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(''), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const togglePasswordVisibility = (userId) => {
    setShowPasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/create-admin', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newAdmin,
          role: 'admin'
        })
      });

      if (response.ok) {
        await fetchAdminUsers();
        setNewAdmin({ email: '', password: '', firstName: '', lastName: '' });
        setShowCreateForm(false);
      } else {
        const error = await response.json();
        alert(`Error creating admin: ${error.message}`);
      }
    } catch (error) {
      console.error('Error creating admin:', error);
      alert('Error creating admin user');
    } finally {
      setCreateLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Admin User Management</h2>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showCreateForm ? 'Cancel' : 'Create New Admin'}
        </button>
      </div>

      {/* Default Admin Credentials Alert */}
      <div className="bg-amber-50 border-l-4 border-amber-400 p-4">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-amber-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-amber-800">
              Default Admin Credentials Available
            </h3>
            <div className="mt-2 text-sm text-amber-700">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Email:</span>
                  <code className="bg-amber-100 px-2 py-1 rounded text-xs">
                    {defaultAdminCredentials.email}
                  </code>
                  <button
                    onClick={() => copyToClipboard(defaultAdminCredentials.email, 'default-email')}
                    className="p-1 hover:bg-amber-200 rounded"
                    title="Copy email"
                  >
                    {copiedField === 'default-email' ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Password:</span>
                  <code className="bg-amber-100 px-2 py-1 rounded text-xs">
                    {defaultAdminCredentials.password}
                  </code>
                  <button
                    onClick={() => copyToClipboard(defaultAdminCredentials.password, 'default-password')}
                    className="p-1 hover:bg-amber-200 rounded"
                    title="Copy password"
                  >
                    {copiedField === 'default-password' ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <p className="mt-2 text-xs">
                ⚠️ Please change these credentials after first login for security.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Admin Form */}
      {showCreateForm && (
        <div className="bg-gray-50 p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Create New Admin User</h3>
          <form onSubmit={handleCreateAdmin} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="First Name"
                value={newAdmin.firstName}
                onChange={(e) => setNewAdmin({ ...newAdmin, firstName: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                value={newAdmin.lastName}
                onChange={(e) => setNewAdmin({ ...newAdmin, lastName: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <input
              type="email"
              placeholder="Email"
              value={newAdmin.email}
              onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={newAdmin.password}
              onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
              minLength={6}
            />
            <button
              type="submit"
              disabled={createLoading}
              className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {createLoading ? 'Creating...' : 'Create Admin User'}
            </button>
          </form>
        </div>
      )}

      {/* Admin Users List */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="px-6 py-4 border-b">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold">Admin Users ({adminUsers.length})</h3>
          </div>
        </div>
        
        {adminUsers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No admin users found in the system.</p>
            <p className="text-sm mt-2">Use the default credentials or create a new admin user.</p>
          </div>
        ) : (
          <div className="divide-y">
            {adminUsers.map((user) => (
              <div key={user._id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        Admin
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Email:</span>
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                          {user.email}
                        </code>
                        <button
                          onClick={() => copyToClipboard(user.email, `email-${user._id}`)}
                          className="p-1 hover:bg-gray-200 rounded"
                          title="Copy email"
                        >
                          {copiedField === `email-${user._id}` ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Created:</span>
                        <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUserManagement;
