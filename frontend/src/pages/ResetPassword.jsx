import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { toast } from 'react-toastify';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState('');
    const [status, setStatus] = useState('input'); // 'input', 'success', 'error'

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tokenParam = params.get('token');

        if (!tokenParam) {
            toast.error('Invalid reset link. Missing token.');
            setStatus('error');
        } else {
            setToken(tokenParam);
        }
    }, [location]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        try {
            setLoading(true);
            await authAPI.resetPassword(token, password);
            toast.success('Password reset successful!');
            setStatus('success');

            // Auto redirect after 3 seconds
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    if (status === 'success') {
        return (
            <div className="min-h-[80vh] flex flex-col justify-center py-12 px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-6 rounded-lg shadow-card text-center border border-slate-200">
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-semibold text-slate-900 mb-2">Password Reset Successful</h2>
                        <p className="text-slate-600 mb-8">
                            Your password has been updated. You will be redirected to the login page shortly.
                        </p>
                        <Button className="w-full" onClick={() => navigate('/login')}>
                            Go to Login Now
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="min-h-[80vh] flex flex-col justify-center py-12 px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-6 rounded-lg shadow-card text-center border border-slate-200">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-semibold text-slate-900 mb-2">Invalid or Expired Link</h2>
                        <p className="text-slate-600 mb-8">
                            The password reset link is invalid or has expired. Please request a new one.
                        </p>
                        <Button className="w-full" onClick={() => navigate('/forgot-password')}>
                            Request New Link
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[80vh] flex flex-col justify-center py-12 px-6 lg:px-8 bg-slate-50">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="text-center text-3xl font-semibold text-slate-900 mb-8">Set New Password</h2>
                <div className="bg-white py-8 px-6 rounded-lg shadow-card sm:px-10 border border-slate-200">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <Input
                            label="New Password"
                            type="password"
                            id="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Min. 6 characters"
                            required
                            autoFocus
                        />
                        <Input
                            label="Confirm New Password"
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Repeat your password"
                            required
                        />
                        <Button
                            type="submit"
                            className="w-full"
                            loading={loading}
                            disabled={loading || !password || !confirmPassword}
                        >
                            Reset Password
                        </Button>
                    </form>
                    <div className="mt-6 text-center">
                        <Link to="/login" className="text-sm text-indigo-600 hover:underline">
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
