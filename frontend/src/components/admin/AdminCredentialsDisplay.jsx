import React, { useState } from 'react';
import { Copy, Check, Eye, EyeOff, Shield } from 'lucide-react';

const AdminCredentialsDisplay = ({ className = '' }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState('');

  const credentials = {
    email: 'admin@market.com',
    password: 'admin123'
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

  return (
    <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <Shield className="h-5 w-5 text-blue-600" />
        <h3 className="text-sm font-semibold text-blue-900">Admin Credentials</h3>
      </div>
      
      <div className="space-y-3">
        <div className="bg-white rounded-md p-3 border border-blue-100">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-xs text-gray-500 mb-1">Email</div>
              <div className="font-mono text-sm text-gray-900">{credentials.email}</div>
            </div>
            <button
              onClick={() => copyToClipboard(credentials.email, 'email')}
              className="ml-2 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              title="Copy email"
            >
              {copiedField === 'email' ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-md p-3 border border-blue-100">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-xs text-gray-500 mb-1">Password</div>
              <div className="font-mono text-sm text-gray-900">
                {showPassword ? credentials.password : '••••••••'}
              </div>
            </div>
            <div className="flex items-center gap-1 ml-2">
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={() => copyToClipboard(credentials.password, 'password')}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                title="Copy password"
              >
                {copiedField === 'password' ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 text-xs text-blue-700 bg-blue-100 rounded-md p-2">
        ⚠️ Default credentials - Change after first login for security
      </div>
    </div>
  );
};

export default AdminCredentialsDisplay;
