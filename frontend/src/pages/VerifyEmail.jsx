import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';
import Button from '../components/ui/Button';

const VerifyEmail = () => {
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('Verifying your email address...');
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const verify = async () => {
            // Extract token from URL
            const params = new URLSearchParams(location.search);
            const token = params.get('token');

            if (!token) {
                setStatus('error');
                setMessage('Missing verification token. Please check your email link again.');
                return;
            }

            try {
                const response = await authAPI.verifyEmail(token);
                setStatus('success');
                setMessage(response.data.message || 'Email verified successfully! You can now log in.');
                toast.success('Email verified successfully!');
            } catch (error) {
                setStatus('error');
                setMessage(error.response?.data?.message || 'Verification failed. The link may be invalid or expired.');
                toast.error('Email verification failed.');
            }
        };

        verify();
    }, [location]);

    return (
        <div className="container mx-auto px-4 py-12 max-w-7xl">
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="bg-white rounded-lg shadow-card border border-slate-200 p-10 w-full max-w-md text-center">
                    {status === 'verifying' && (
                        <div className="flex flex-col items-center">
                            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6"></div>
                            <h2 className="text-2xl font-semibold mb-4">Verifying...</h2>
                            <p className="text-slate-600">{message}</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6 text-emerald-600">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-semibold mb-4 text-slate-800">Verification Successful</h2>
                            <p className="text-slate-600 mb-8">{message}</p>
                            <Button
                                variant="primary"
                                className="w-full"
                                onClick={() => navigate('/login')}
                            >
                                Go to Login
                            </Button>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6 text-red-600">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-semibold mb-4 text-slate-800">Verification Failed</h2>
                            <p className="text-slate-600 mb-8">{message}</p>
                            <div className="space-y-3 w-full">
                                <Button
                                    variant="primary"
                                    className="w-full"
                                    onClick={() => navigate('/login')}
                                >
                                    Return to Login
                                </Button>
                                <p className="text-sm text-slate-500">
                                    Didn't receive the email? <Link to="/signup" className="text-indigo-600 hover:underline">Sign up again</Link>
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
