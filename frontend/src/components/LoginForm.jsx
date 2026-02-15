import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { setUser, setUserError, setUserLoading } from '../store/store';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';
import Button from './ui/Button';
import Input from './ui/Input';

const LoginForm = ({ isRegistration = false }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Validation state
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isResendLoading, setIsResendLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [showResendButton, setShowResendButton] = useState(false);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear errors for this field
    setErrors({
      ...errors,
      [name]: ''
    });

    // Clear submit error when user changes input
    if (submitError) {
      setSubmitError('');
    }
  };

  // Validate form
  const validate = () => {
    const newErrors = {};

    // Name validation (only for registration)
    if (isRegistration && !formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (isRegistration && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation (only for registration)
    if (isRegistration && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validate()) {
      return;
    }

    try {
      dispatch(setUserLoading()); setSubmitError('');

      // Prepare user data
      const userData = {
        email: formData.email,
        password: formData.password
      };

      // Add name for registration
      if (isRegistration) {
        userData.name = formData.name;
      }

      // Make API request using our service
      const response = isRegistration
        ? await authAPI.register(userData)
        : await authAPI.login(userData);

      if (isRegistration) {
        // For registration, we don't log in automatically.
        // We show a success message and wait for email verification.
        setRegistrationSuccess(true);
        toast.success(response.data.message || 'Registration successful! Please check your email.');
      } else {
        // Save user data to store (only for login)
        dispatch(setUser(response.data));
        toast.success('Login successful!');

        // Redirect
        const redirect = location.state?.redirect || '/';
        navigate(redirect);
      }

    } catch (error) {
      console.error('Auth error:', error);

      if (error.response) {
        const errorMessage = error.response.data.message || 'Authentication failed';
        const isEmailUnverified = error.response.status === 403 && error.response.data.isEmailVerified === false;

        setSubmitError(errorMessage);
        dispatch(setUserError(errorMessage));

        // If unverified, we could show a special message or resend option
        if (isEmailUnverified) {
          setShowResendButton(true);
          toast.warning(errorMessage);
        } else {
          setShowResendButton(false);
          toast.error(errorMessage);
        }
      } else {
        const errorMessage = 'Network error. Please try again.';
        setSubmitError(errorMessage);
        dispatch(setUserError(errorMessage));
        toast.error(errorMessage);
      }
    }
  };

  // Handle resend verification
  const handleResendVerification = async () => {
    if (!formData.email) {
      toast.error('Please enter your email address first.');
      return;
    }

    try {
      setIsResendLoading(true);
      const response = await authAPI.resendVerification(formData.email);
      toast.success(response.data.message || 'Verification email resent!');
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to resend verification email.';
      toast.error(msg);
    } finally {
      setIsResendLoading(false);
    }
  };

  if (registrationSuccess) {
    return (
      <div className="bg-white rounded-2xl shadow-card border border-gray-200 p-8 w-full max-w-md mx-auto text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Check Your Email</h2>
        <p className="text-gray-600 mb-8">
          We've sent a verification link to <span className="font-semibold text-gray-800">{formData.email}</span>.
          Please click the link to activate your account.
        </p>
        <div className="space-y-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleResendVerification}
            loading={isResendLoading}
          >
            Resend Verification Email
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => navigate('/login')}
          >
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-card border border-gray-200 p-8 w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        {isRegistration ? 'Create an Account' : 'Sign In to Your Account'}
      </h2>

      {submitError && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100">
          <p className="mb-3">{submitError}</p>
          {showResendButton && (
            <Button
              variant="outline"
              size="sm"
              className="w-full bg-white text-blue-600 border-blue-200 hover:bg-blue-50"
              onClick={handleResendVerification}
              loading={isResendLoading}
            >
              Resend Verification Email
            </Button>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Name field (only for registration) */}
        {isRegistration && (
          <div className="mb-4">
            <Input
              type="text"
              id="name"
              name="name"
              label="Full Name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              error={errors.name}
              required
            />
          </div>
        )}

        {/* Email field */}
        <div className="mb-4">
          <Input
            type="email"
            id="email"
            name="email"
            label="Email Address"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            error={errors.email}
            required
            autoComplete="email"
          />
        </div>

        {/* Password field */}
        <div className="mb-4">
          <Input
            type="password"
            id="password"
            name="password"
            label="Password"
            value={formData.password}
            onChange={handleChange}
            placeholder={isRegistration ? "Create a password" : "Enter your password"}
            error={errors.password}
            required
            autoComplete={isRegistration ? "new-password" : "current-password"}
          />
        </div>

        {/* Confirm password field (only for registration) */}
        {isRegistration && (
          <div className="mb-4">
            <Input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              label="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              error={errors.confirmPassword}
              required
              autoComplete="new-password"
            />
          </div>
        )}

        {/* Submit button */}
        <div className="mb-6">
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            size="lg"
          >
            {isRegistration ? 'Create Account' : 'Sign In'}
          </Button>
        </div>
      </form>

      {/* Form footer */}
      <div className="text-center">
        {isRegistration ? (
          <p className="text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="text-primary-600 hover:underline font-semibold">
              Sign in
            </a>
          </p>
        ) : (
          <div className="space-y-2">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <a href="/signup" className="text-primary-600 hover:underline font-semibold">
                Sign up
              </a>
            </p>
            <p>
              <a href="/forgot-password" className="text-primary-600 hover:underline text-sm">
                Forgot your password?
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginForm;