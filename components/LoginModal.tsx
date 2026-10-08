'use client';

import React, { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { 
  X, 
  Phone, 
  Mail, 
  Lock, 
  Loader2, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck,
  User,
  ArrowRight
} from 'lucide-react';
import { GoogleIcon } from '@/components/GoogleIcon';
import { TermsModal } from '@/components/TermsModal';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: { name: string; email: string; mobile: string }) => void;
  title?: string;
  subtitle?: string;
}

export function LoginModal({
  isOpen,
  onClose,
  onSuccess,
  title = 'Sign In to Greesal',
  subtitle = 'Log in or provide your details to place your organic salad order',
}: LoginModalProps) {
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'quick'>('quick');
  const [mobileNumber, setMobileNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<'terms' | 'privacy' | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successUser, setSuccessUser] = useState<{ name: string; email: string; mobile: string } | null>(null);

  // Countdown timer for OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Reset states when modal is opened
  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setShowOtpVerification(false);
      setOtp('');
      const savedMobile = localStorage.getItem('greesal_custom_mobile') || '';
      const savedName = localStorage.getItem('greesal_custom_name') || '';
      if (savedMobile) setMobileNumber(savedMobile);
      if (savedName) setFullName(savedName);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Google Auth Handler
  const handleGoogleAuth = async () => {
    setErrorMessage(null);
    setIsLoading(true);

    const trimmedMobile = mobileNumber.trim();
    if (trimmedMobile) {
      localStorage.setItem('greesal_custom_mobile', trimmedMobile);
      document.cookie = `greesal_custom_mobile=${encodeURIComponent(trimmedMobile)}; path=/; max-age=300; SameSite=Lax`;
    }
    document.cookie = `greesal_auth_mode=login; path=/; max-age=300; SameSite=Lax`;

    try {
      await signIn('google', {
        callbackUrl: window.location.pathname,
      });
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to initialize Google Sign-In');
      setIsLoading(false);
    }
  };

  // Quick Mobile Checkout Handler
  const handleQuickCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = fullName.trim();
    const trimmedMobile = mobileNumber.trim();

    if (!trimmedName) {
      setErrorMessage('Please enter your full name');
      return;
    }

    if (!trimmedMobile || trimmedMobile.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number');
      return;
    }

    localStorage.setItem('greesal_custom_name', trimmedName);
    localStorage.setItem('greesal_custom_mobile', trimmedMobile);

    if (onSuccess) {
      onSuccess({
        name: trimmedName,
        email: email.trim() || '',
        mobile: trimmedMobile,
      });
    }
    onClose();
  };

  // Send OTP handler
  const handleSendOtp = async () => {
    setErrorMessage(null);
    setIsLoading(true);

    const trimmedEmail = email.trim();
    const trimmedPassword = password;

    if (authMode === 'register') {
      const trimmedMobile = mobileNumber.trim();
      if (!trimmedMobile || !trimmedEmail || !trimmedPassword) {
        setErrorMessage('Please fill in all required fields');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: trimmedEmail }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to send OTP');
        }

        setShowOtpVerification(true);
        setTimer(60);
        setIsLoading(false);
      } catch (err: any) {
        setErrorMessage(err.message || 'An error occurred while sending OTP');
        setIsLoading(false);
      }
    } else {
      // Login OTP pre-verification
      if (!trimmedEmail || !trimmedPassword) {
        setErrorMessage('Please enter both email and password');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/login-verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: trimmedEmail, password: trimmedPassword }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Login verification failed');
        }

        setShowOtpVerification(true);
        setTimer(60);
        setIsLoading(false);
      } catch (err: any) {
        setErrorMessage(err.message || 'An error occurred during verification');
        setIsLoading(false);
      }
    }
  };

  // Credentials Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    if (authMode === 'register') {
      if (!showOtpVerification) {
        await handleSendOtp();
      } else {
        const trimmedEmail = email.trim();
        const trimmedPassword = password;
        const trimmedMobile = mobileNumber.trim();
        const trimmedOtp = otp.trim();

        if (!trimmedOtp) {
          setErrorMessage('Please enter the OTP code sent to your email');
          setIsLoading(false);
          return;
        }

        try {
          const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: trimmedEmail,
              password: trimmedPassword,
              mobile: trimmedMobile,
              otp: trimmedOtp,
            }),
          });

          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error || 'Registration failed');
          }

          localStorage.setItem('greesal_custom_mobile', trimmedMobile);
          if (fullName.trim()) localStorage.setItem('greesal_custom_name', fullName.trim());

          const res = await signIn('credentials', {
            email: trimmedEmail,
            password: trimmedPassword,
            otp: trimmedOtp,
            redirect: false,
          });

          if (res?.error) {
            setErrorMessage(`Registered successfully, but failed to log in: ${res.error}`);
            setIsLoading(false);
          } else {
            setIsLoading(false);
            const userObj = {
              name: fullName.trim() || trimmedEmail.split('@')[0],
              email: trimmedEmail,
              mobile: trimmedMobile,
            };
            setSuccessUser(userObj);
            setIsSuccess(true);
            setTimeout(() => {
              if (onSuccess) onSuccess(userObj);
              onClose();
              setIsSuccess(false);
            }, 1200);
          }
        } catch (err: any) {
          setErrorMessage(err.message || 'Registration failed');
          setIsLoading(false);
        }
      }
    } else {
      // Login Mode
      if (!showOtpVerification) {
        await handleSendOtp();
      } else {
        const trimmedEmail = email.trim();
        const trimmedPassword = password;
        const trimmedOtp = otp.trim();

        if (!trimmedOtp) {
          setErrorMessage('Please enter the OTP code');
          setIsLoading(false);
          return;
        }

        try {
          const res = await signIn('credentials', {
            email: trimmedEmail,
            password: trimmedPassword,
            otp: trimmedOtp,
            redirect: false,
          });

          if (res?.error) {
            setErrorMessage(res.error || 'Invalid credentials or OTP code');
            setIsLoading(false);
          } else {
            setIsLoading(false);
            const userObj = {
              name: trimmedEmail.split('@')[0],
              email: trimmedEmail,
              mobile: mobileNumber.trim(),
            };
            setSuccessUser(userObj);
            setIsSuccess(true);
            setTimeout(() => {
              if (onSuccess) onSuccess(userObj);
              onClose();
              setIsSuccess(false);
            }, 1200);
          }
        } catch (err: any) {
          setErrorMessage(err.message || 'Login failed');
          setIsLoading(false);
        }
      }
    }
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0C2A20]/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
        <div className="relative w-full max-w-[420px] bg-white rounded-[28px] sm:rounded-[34px] shadow-2xl border border-emerald-100 p-8 text-center animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-sm animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h3 className="font-montserrat font-extrabold text-2xl text-[#123B2B] mb-2">
            Login Successful!
          </h3>
          <p className="text-sm text-gray-600 mb-4 font-dmsans">
            Welcome back, <strong className="text-emerald-700">{successUser?.name || 'Customer'}</strong>!
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-[#C89D4B] font-bold">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Opening Your Account &amp; Orders...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#0C2A20]/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-[480px] bg-white rounded-[28px] sm:rounded-[34px] shadow-2xl border border-[#EBE3D5] overflow-hidden my-auto">
        
        {/* Header Ribbon & Close Button */}
        <div className="relative bg-gradient-to-r from-[#123B2B] to-[#1C533A] text-white p-5 sm:p-6 text-left">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/15 hover:bg-white/30 text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C89D4B] text-white text-[11px] font-black uppercase tracking-wider mb-2 shadow-xs">
            <Sparkles className="w-3 h-3 fill-white" /> Greesal Order Security
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-tight">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 font-medium mt-1">
            {subtitle}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7">
          {/* Mode Switcher */}
          {!showOtpVerification && (
            <div className="flex p-1 mb-5 bg-[#F5EFE6] rounded-xl text-xs font-bold text-center">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('quick');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 px-2 rounded-lg transition-all cursor-pointer ${
                  authMode === 'quick'
                    ? 'bg-[#123B2B] text-white shadow-sm'
                    : 'text-[#6B7280] hover:text-[#123B2B]'
                }`}
              >
                Fast Checkout
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 px-2 rounded-lg transition-all cursor-pointer ${
                  authMode === 'login'
                    ? 'bg-[#123B2B] text-white shadow-sm'
                    : 'text-[#6B7280] hover:text-[#123B2B]'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 px-2 rounded-lg transition-all cursor-pointer ${
                  authMode === 'register'
                    ? 'bg-[#123B2B] text-white shadow-sm'
                    : 'text-[#6B7280] hover:text-[#123B2B]'
                }`}
              >
                Register
              </button>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium text-center">
              {errorMessage}
            </div>
          )}

          {/* Quick Fast Checkout Form */}
          {authMode === 'quick' && !showOtpVerification && (
            <form onSubmit={handleQuickCheckout} className="space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-[#123B2B] block">
                  Your Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#123B2B]/40 focus:border-[#123B2B]"
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-[#123B2B] block">
                  Mobile Number (For Delivery &amp; WhatsApp Updates)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="e.g. 9825144321"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#123B2B]/40 focus:border-[#123B2B]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 mt-2 rounded-xl bg-[#123B2B] hover:bg-[#1C4D3A] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Continue Order &amp; Place</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center my-3">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink mx-3 text-gray-400 text-[11px] font-semibold uppercase">Or continue with</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl border border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-2.5 text-xs font-bold text-gray-700 transition-all cursor-pointer"
              >
                <GoogleIcon className="w-4 h-4 flex-shrink-0" />
                <span>Continue with Google</span>
              </button>
            </form>
          )}

          {/* Login or Register Form */}
          {authMode !== 'quick' && (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {showOtpVerification ? (
                // OTP Step
                <div className="space-y-3 text-left">
                  <p className="text-xs text-gray-600 text-center">
                    Enter the 6-digit verification code sent to <strong className="text-[#123B2B]">{email}</strong>
                  </p>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      required
                      className="w-full py-2.5 rounded-xl border border-gray-300 bg-white text-gray-900 text-center font-black text-xl tracking-[6px] focus:outline-none focus:ring-2 focus:ring-[#123B2B]/40 focus:border-[#123B2B]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-xl bg-[#123B2B] hover:bg-[#1C4D3A] text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Verify &amp; Continue</span>}
                  </button>

                  <div className="text-center text-xs text-gray-500">
                    {timer > 0 ? (
                      <span>Resend code in {timer}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="font-bold text-[#123B2B] hover:underline"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowOtpVerification(false)}
                    className="w-full text-center text-xs text-gray-500 hover:text-gray-800 font-semibold"
                  >
                    &larr; Back to edit details
                  </button>
                </div>
              ) : (
                <>
                  {authMode === 'register' && (
                    <div className="space-y-1 text-left">
                      <label className="text-xs font-bold text-[#123B2B] block">
                        Mobile Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                          <Phone className="w-4 h-4" />
                        </div>
                        <input
                          type="tel"
                          required
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value)}
                          placeholder="10-digit mobile number"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#123B2B]/40 focus:border-[#123B2B]"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1 text-left">
                    <label className="text-xs font-bold text-[#123B2B] block">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="yourname@gmail.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#123B2B]/40 focus:border-[#123B2B]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="text-xs font-bold text-[#123B2B] block">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#123B2B]/40 focus:border-[#123B2B]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-xl bg-[#123B2B] hover:bg-[#1C4D3A] text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span>{authMode === 'login' ? 'Sign In & Continue' : 'Register & Verify'}</span>
                    )}
                  </button>

                  <div className="flex items-center my-3">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="flex-shrink mx-3 text-gray-400 text-[11px] font-semibold uppercase">Or continue with</span>
                    <div className="flex-grow border-t border-gray-200"></div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleAuth}
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 rounded-xl border border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-2.5 text-xs font-bold text-gray-700 transition-all cursor-pointer"
                  >
                    <GoogleIcon className="w-4 h-4 flex-shrink-0" />
                    <span>Google</span>
                  </button>
                </>
              )}
            </form>
          )}

          {/* Terms info */}
          <div className="mt-4 text-center text-[10px] text-gray-500">
            By ordering, you agree to Greesal's{' '}
            <button
              type="button"
              onClick={() => setActiveModal('terms')}
              className="text-[#123B2B] font-bold hover:underline"
            >
              Terms
            </button>{' '}
            &amp;{' '}
            <button
              type="button"
              onClick={() => setActiveModal('privacy')}
              className="text-[#123B2B] font-bold hover:underline"
            >
              Privacy Policy
            </button>
          </div>
        </div>
      </div>

      <TermsModal
        isOpen={!!activeModal}
        type={activeModal}
        onClose={() => setActiveModal(null)}
      />
    </div>
  );
}
