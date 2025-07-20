import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('request'); // 'request', 'verify', 'reset'
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      await axios.post(`${apiUrl}/api/auth/forgot-password`, { email });
      toast.success('Reset code sent to your email');
      setStep('verify');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    if (!verificationCode) {
      toast.error('Please enter the verification code');
      return;
    }

    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      await axios.post(`${apiUrl}/api/auth/verify-reset-code`, { 
        email, 
        resetCode: verificationCode 
      });
      toast.success('Code verified successfully');
      setStep('reset');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      await axios.post(`${apiUrl}/api/auth/reset-password`, { 
        email, 
        resetCode: verificationCode,
        newPassword
      });
      toast.success('Password reset successful');
      window.location.href = '/login';
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-6 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-bold text-gray-900 mb-8">
          Account Recovery
        </h2>
        <div className="bg-white py-8 px-6 rounded-2xl shadow-card sm:px-10">
          {step === 'request' && (
            <>
              <p className="text-center text-gray-600 mb-6">
                Enter your email address and we'll send you a code to reset your password
              </p>
              <form className="space-y-6" onSubmit={handleEmailSubmit}>
                <Input
                  label="Email Address"
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
                <Button
                  type="submit"
                  fullWidth
                  loading={loading}
                  disabled={loading || !email}
                >
                  Send Reset Code
                </Button>
              </form>
            </>
          )}

          {step === 'verify' && (
            <>
              <p className="text-center text-gray-600 mb-6">
                We've sent a verification code to <strong>{email}</strong>. 
                Please check your inbox and enter the code below.
              </p>
              <form className="space-y-6" onSubmit={handleVerificationSubmit}>
                <Input
                  label="Verification Code"
                  type="text"
                  id="verificationCode"
                  name="verificationCode"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  required
                  autoFocus
                />
                <Button
                  type="submit"
                  fullWidth
                  loading={loading}
                  disabled={loading || !verificationCode}
                >
                  Verify Code
                </Button>
              </form>
            </>
          )}

          {step === 'reset' && (
            <>
              <p className="text-center text-gray-600 mb-6">
                Set a new password for your account
              </p>
              <form className="space-y-6" onSubmit={handlePasswordReset}>
                <Input
                  label="New Password"
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  autoFocus
                />
                <Input
                  label="Confirm Password"
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <Button
                  type="submit"
                  fullWidth
                  loading={loading}
                  disabled={loading || !newPassword || !confirmPassword}
                >
                  Reset Password
                </Button>
              </form>
            </>
          )}

          <div className="mt-6">
            <div className="text-center">
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
