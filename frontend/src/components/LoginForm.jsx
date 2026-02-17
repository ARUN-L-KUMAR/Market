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
      <div className="bg-white rounded-lg shadow-card border border-slate-200 p-8 w-full max-w-md mx-auto text-center">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold mb-4 text-slate-800">Check Your Email</h2>
        <p className="text-slate-600 mb-8">
          We've sent a verification link to <span className="font-semibold text-slate-800">{formData.email}</span>.
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
    <div className="bg-white rounded-lg shadow-card border border-slate-200 p-8 w-full max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-center text-slate-800">
        {isRegistration ? 'Create an Account' : 'Sign In to Your Account'}
      </h2>

      {/* Continue with Google */}
      <button
        type="button"
        onClick={() => {
          if (!window.google) {
            toast.error('Google sign-in is loading. Please try again.');
            return;
          }
          window.google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            callback: async (response) => {
              try {
                dispatch(setUserLoading());
                const res = await authAPI.googleLogin(response.credential);
                dispatch(setUser(res.data));
                toast.success('Signed in with Google!');
                const redirect = location.state?.redirect || '/';
                navigate(redirect);
              } catch (error) {
                const msg = error.response?.data?.message || 'Google sign-in failed';
                dispatch(setUserError(msg));
                toast.error(msg);
              }
            }
          });
          window.google.accounts.id.prompt((notification) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
              // Fallback: render the Google button if prompt fails
              const btnContainer = document.getElementById('google-signin-btn');
              if (btnContainer) {
                btnContainer.innerHTML = '';
                window.google.accounts.id.renderButton(btnContainer, {
                  theme: 'outline',
                  size: 'large',
                  width: '100%',
                  text: isRegistration ? 'signup_with' : 'signin_with'
                });
              }
            }
          });
        }}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-slate-200 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 mb-4"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        Continue with Google
      </button>
      <div id="google-signin-btn" className="w-full mb-4"></div>

      {/* OR Divider */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-slate-500 font-medium">OR</span>
        </div>
      </div>

      {submitError && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100">
          <p className="mb-3">{submitError}</p>
          {showResendButton && (
            <Button
              variant="outline"
              size="sm"
              className="w-full bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50"
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
          <p className="text-slate-600">
            Already have an account?{' '}
            <a href="/login" className="text-indigo-600 hover:underline font-semibold">
              Sign in
            </a>
          </p>
        ) : (
          <div className="space-y-2">
            <p className="text-slate-600">
              Don't have an account?{' '}
              <a href="/signup" className="text-indigo-600 hover:underline font-semibold">
                Sign up
              </a>
            </p>
            <p>
              <a href="/forgot-password" className="text-indigo-600 hover:underline text-sm">
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