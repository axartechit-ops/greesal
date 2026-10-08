'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import { Phone, Mail, Lock, Loader2, ShieldCheck, Sparkles, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { GoogleIcon } from '@/components/GoogleIcon';
import { TermsModal } from '@/components/TermsModal';
import { GreesalLogo } from '@/components/GreesalLogo';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<'terms' | 'privacy' | null>(null);

  const callbackUrl = searchParams.get('callbackUrl') || '/';

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // If already authenticated, redirect to home/dashboard
  useEffect(() => {
    if (status === 'authenticated') {
      router.push(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  // Check for NextAuth error parameters in URL
  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      if (error === 'Configuration') {
        setErrorMessage('Google Sign-In configuration is missing. Please ensure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set in .env.local.');
      } else if (error === 'OAuthSignin' || error === 'OAuthCallback') {
        setErrorMessage('Google Authentication could not connect. Please check your Google OAuth credentials in .env.local.');
      } else if (error === 'OAuthAccountNotLinked') {
        setErrorMessage('This email is already registered. Please sign in with your password or click Continue with Google again to link your account.');
      } else if (error === 'AccessDenied') {
        setErrorMessage('Access was denied. Please allow Google permissions to sign in.');
      } else if (error === 'CredentialsSignin') {
        setErrorMessage('Invalid email or password. Please try again.');
      } else {
        setErrorMessage(`Authentication error: ${error}.`);
      }
    }
  }, [searchParams]);

  // Google Auth Handler
  const handleGoogleAuth = async () => {
    setErrorMessage(null);
    setIsLoading(true);

    if (authMode === 'register') {
      const trimmedMobile = mobileNumber.trim();
      if (!trimmedMobile) {
        setErrorMessage('Please enter your mobile number before continuing with Google');
        setIsLoading(false);
        return;
      }
      const phoneRegex = /^[0-9+\-\s()]{10,15}$/;
      if (!phoneRegex.test(trimmedMobile)) {
        setErrorMessage('Please enter a valid 10-15 digit mobile number');
        setIsLoading(false);
        return;
      }
      localStorage.setItem('greesal_custom_mobile', trimmedMobile);
      document.cookie = `greesal_custom_mobile=${encodeURIComponent(trimmedMobile)}; path=/; max-age=300; SameSite=Lax`;
    }

    document.cookie = `greesal_auth_mode=${authMode}; path=/; max-age=300; SameSite=Lax`;

    try {
      await signIn('google', {
        callbackUrl,
      });
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to initialize Google Sign-In');
      setIsLoading(false);
    }
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
        setErrorMessage('Please fill in all fields');
        setIsLoading(false);
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        setErrorMessage('Please enter a valid email address');
        setIsLoading(false);
        return;
      }

      if (trimmedPassword.length < 6) {
        setErrorMessage('Password must be at least 6 characters long');
        setIsLoading(false);
        return;
      }

      const phoneRegex = /^[0-9+\-\s()]{10,15}$/;
      if (!phoneRegex.test(trimmedMobile)) {
        setErrorMessage('Please enter a valid 10-15 digit mobile number');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/send-otp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
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
      if (!trimmedEmail || !trimmedPassword) {
        setErrorMessage('Please enter both email and password');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/login-verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
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
        setErrorMessage(err.message || 'An error occurred while preparing login OTP');
        setIsLoading(false);
      }
    }
  };

  // Credentials Register/Login Submit Handler
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
            headers: {
              'Content-Type': 'application/json',
            },
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
            router.push(callbackUrl);
          }
        } catch (err: any) {
          setErrorMessage(err.message || 'An error occurred during registration');
          setIsLoading(false);
        }
      }
    } else {
      if (!showOtpVerification) {
        await handleSendOtp();
      } else {
        const trimmedEmail = email.trim();
        const trimmedPassword = password;
        const trimmedOtp = otp.trim();

        if (!trimmedOtp) {
          setErrorMessage('Please enter the OTP code sent to your email');
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
            router.push(callbackUrl);
          }
        } catch (err: any) {
          setErrorMessage(err.message || 'An error occurred during login');
          setIsLoading(false);
        }
      }
    }
  };

  return (
    <>
      <div className="relative w-full max-w-[880px] bg-white rounded-[28px] sm:rounded-[36px] shadow-[0_25px_60px_-12px_rgba(0,0,0,0.16),0_4px_16px_rgba(0,0,0,0.06)] overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[520px] border border-[#EBE3D5]/60">

        {/* Left Side: Showcase Panel */}
        <div className="md:col-span-5 relative bg-[#F7F2EA] min-h-[340px] md:min-h-full overflow-hidden select-none">
          <img
            src="/images/founder_lifestyle.jpg"
            alt="Healthy Food is a Lifestyle - Greesal"
            className="w-full h-full object-cover object-top"
          />
        </div>

        {/* Right Side: Auth Hub */}
        <div className="md:col-span-7 bg-white p-7 sm:p-10 md:p-12 lg:p-14 flex flex-col justify-center">

          {/* Navigation back to menu */}
          <div className="mb-4 text-left">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#123B2B] hover:text-[#1C4D3A] hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Store &amp; Salads
            </Link>
          </div>

          {/* Auth Mode Toggle Switcher */}
          {!showOtpVerification && (
            <div className="flex p-1 mb-6 bg-[#F5EFE6] rounded-xl w-full max-w-[280px] mx-auto text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setErrorMessage(null);
                  setShowOtpVerification(false);
                  setOtp('');
                }}
                className={`flex-1 py-1.5 px-3 rounded-lg transition-all duration-200 text-center cursor-pointer ${authMode === 'login'
                    ? 'bg-white text-[#123B2B] shadow-sm font-bold'
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
                  setShowOtpVerification(false);
                  setOtp('');
                }}
                className={`flex-1 py-1.5 px-3 rounded-lg transition-all duration-200 text-center cursor-pointer ${authMode === 'register'
                    ? 'bg-white text-[#123B2B] shadow-sm font-bold'
                    : 'text-[#6B7280] hover:text-[#123B2B]'
                  }`}
              >
                Registration
              </button>
            </div>
          )}

          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="font-sans font-bold text-3xl sm:text-[34px] text-[#123B2B] tracking-tight leading-tight">
              {showOtpVerification
                ? (authMode === 'login' ? 'Verify Login' : 'Verify Email')
                : (authMode === 'login' ? 'Login' : 'Create Account')}
            </h1>
            <p className="text-sm text-[#6B7280] font-normal mt-1.5">
              {showOtpVerification
                ? 'Check your inbox for a verification code'
                : (authMode === 'login'
                  ? 'Welcome back! Sign in to your Greesal account'
                  : 'Join Greesal to fuel your day with nutritious salads')}
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-4 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-medium text-center">
              {errorMessage}
            </div>
          )}

          {/* Auth Action Form */}
          <form onSubmit={handleSubmit} className="space-y-4 max-w-[340px] mx-auto w-full">

            {showOtpVerification ? (
              // OTP Verification Step
              <>
                <div className="space-y-1.5 text-left animate-in fade-in duration-300">
                  <p className="text-xs text-gray-500 mb-2 text-center">
                    We sent a 6-digit verification code to <span className="font-bold text-[#123B2B]">{email}</span>.
                  </p>
                  <label className="text-xs font-bold text-[#123B2B] block">
                    Verification Code (OTP)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#4B5563]">
                      <Lock className="w-5 h-5 stroke-[1.75]" />
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 6-digit OTP"
                      required
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-800 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#123B2B]/40 focus:border-[#123B2B] transition-all text-center tracking-[4px] font-bold text-lg"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-5 rounded-2xl bg-[#123B2B] hover:bg-[#1C4D3A] text-white font-sans font-bold text-sm sm:text-base shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer flex items-center justify-center gap-2.5 focus:outline-none focus:ring-2 focus:ring-[#123B2B] focus:ring-offset-2 disabled:opacity-80"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <span>Verify &amp; Continue</span>
                    )}
                  </button>
                </div>

                <div className="pt-2 text-center text-xs text-[#6B7280]">
                  {timer > 0 ? (
                    <p>Resend code in <span className="font-bold text-[#123B2B]">{timer}s</span></p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="font-bold text-[#123B2B] hover:underline cursor-pointer focus:outline-none"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowOtpVerification(false);
                      setOtp('');
                    }}
                    className="text-xs font-bold text-[#6B7280] hover:text-[#123B2B] focus:outline-none"
                  >
                    &larr; Go back and edit details
                  </button>
                </div>
              </>
            ) : (
              // Initial Login / Registration Fields
              <>
                {authMode === 'register' && (
                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-bold text-[#123B2B] block">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#4B5563]">
                        <Phone className="w-5 h-5 stroke-[1.75]" />
                      </div>
                      <input
                        type="tel"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        placeholder="Enter 10-digit mobile number"
                        required
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-800 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#123B2B]/40 focus:border-[#123B2B] transition-all"
                      />
                    </div>
                  </div>
                )}

                {/* Email Input */}
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold text-[#123B2B] block">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#4B5563]">
                      <Mail className="w-5 h-5 stroke-[1.75]" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-800 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#123B2B]/40 focus:border-[#123B2B] transition-all"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold text-[#123B2B] block">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#4B5563]">
                      <Lock className="w-5 h-5 stroke-[1.75]" />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-800 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#123B2B]/40 focus:border-[#123B2B] transition-all"
                    />
                  </div>
                </div>

                {/* Credentials Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-5 rounded-2xl bg-[#123B2B] hover:bg-[#1C4D3A] text-white font-sans font-bold text-sm sm:text-base shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer flex items-center justify-center gap-2.5 focus:outline-none focus:ring-2 focus:ring-[#123B2B] focus:ring-offset-2 disabled:opacity-80"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <span>{authMode === 'login' ? 'Login' : 'Register'}</span>
                    )}
                  </button>
                </div>

                {/* Divider */}
                <div className="flex items-center my-4">
                  <div className="flex-grow border-t border-gray-300"></div>
                  <span className="flex-shrink mx-4 text-gray-400 text-xs font-semibold uppercase">Or continue with</span>
                  <div className="flex-grow border-t border-gray-300"></div>
                </div>

                {/* Google OAuth Button */}
                <div>
                  <button
                    type="button"
                    onClick={handleGoogleAuth}
                    disabled={isLoading}
                    className={`
                      w-full py-3 px-5 rounded-2xl
                      border border-[#E2DCD2] hover:border-[#123B2B]/50
                      bg-white hover:bg-[#FAFAF8] active:bg-[#F3EFE8]
                      shadow-[0_2px_8px_rgba(0,0,0,0.04)]
                      flex items-center justify-center gap-3
                      transition-all duration-200 cursor-pointer
                      focus:outline-none focus:ring-2 focus:ring-[#123B2B] focus:ring-offset-2
                      ${isLoading ? 'opacity-80 cursor-wait' : ''}
                    `}
                  >
                    <GoogleIcon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-sans font-bold text-sm text-[#1E293B]">
                      Google
                    </span>
                  </button>
                </div>
              </>
            )}
          </form>

          {/* Terms & Privacy */}
          <div className="mt-6 text-center text-[11px] text-gray-500">
            By continuing, you agree to our{' '}
            <button
              type="button"
              onClick={() => setActiveModal('terms')}
              className="text-[#123B2B] font-bold hover:underline"
            >
              Terms of Service
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

          {/* Footer: Powered by Greesal */}
          <div className="mt-6 flex items-center justify-center gap-3">
            <div className="w-10 border-t border-gray-300" />
            <span className="text-xs text-gray-500">
              Powered by <span className="font-bold text-[#123B2B]">Greesal</span>
            </span>
            <div className="w-10 border-t border-gray-300" />
          </div>
        </div>
      </div>

      <TermsModal
        isOpen={!!activeModal}
        type={activeModal}
        onClose={() => setActiveModal(null)}
      />
    </>
  );
}

export default function LoginPage() {
  return (
    <main
      className="relative min-h-screen w-full flex items-center justify-center p-3 sm:p-6 lg:p-8 bg-cover bg-center bg-no-repeat overflow-hidden font-sans"
      style={{
        backgroundImage: "url('/images/page_bg_leaves.jpg')",
        backgroundColor: '#F3EDE2',
      }}
    >
      <Suspense
        fallback={
          <div className="w-full max-w-[880px] min-h-[520px] bg-white rounded-[32px] flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-[#123B2B] animate-spin" />
          </div>
        }
      >
        <LoginFormContent />
      </Suspense>
    </main>
  );
}
