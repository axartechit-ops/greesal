'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GreesalLogo } from '@/components/GreesalLogo';
import {
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  ShieldAlert
} from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Check if already logged in as admin
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/admin/auth');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            router.replace('/admin');
            return;
          }
        }
      } catch (err) {
        // Not authenticated, stay on login page
      } finally {
        setIsCheckingAuth(false);
      }
    }
    checkSession();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!username.trim()) {
      setErrorMessage('Please enter your admin username.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your admin password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password,
          rememberMe,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Invalid admin credentials. Please try again.');
        setIsLoading(false);
        return;
      }

      setSuccessMessage('Authentication verified! Redirecting to Admin Console...');
      
      // Smooth redirect
      setTimeout(() => {
        router.push('/admin');
      }, 700);
    } catch (err: any) {
      setErrorMessage('Connection error. Please check server status and try again.');
      setIsLoading(false);
    }
  };


  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-greesal-cream flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-greesal-dark flex items-center justify-center shadow-lg animate-pulse">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <p className="text-sm font-semibold text-greesal-forest">Verifying Admin Access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6F0] relative overflow-hidden flex flex-col justify-between selection:bg-greesal-emerald selection:text-white">
      {/* Subtle decorative background gradient orbs */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#144C38]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -left-40 w-96 h-96 bg-[#237357]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 right-1/3 w-80 h-80 bg-[#C89D4B]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="w-full px-6 py-5 max-w-7xl mx-auto flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <GreesalLogo size="md" />
          <div className="h-5 w-px bg-greesal-forest/20 hidden sm:block" />
          <span className="text-xs uppercase tracking-widest font-extrabold text-[#144C38] hidden sm:inline-block">
            Management Portal
          </span>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-[#123B2B] hover:bg-emerald-100/60 border border-greesal-emerald/20 transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Customer Dashboard</span>
        </Link>
      </header>

      {/* Main Content Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(12,42,32,0.08)] border border-[#EBE2D3]/80 relative backdrop-blur-sm">
          
          {/* Top Badge & Icon */}
          <div className="flex flex-col items-center text-center mb-7">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#0C2A20] to-[#1A5C45] flex items-center justify-center shadow-md mb-4 ring-4 ring-emerald-50 relative group">
              <ShieldCheck className="w-8 h-8 text-emerald-300 transition-transform duration-300 group-hover:scale-110" />
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full animate-ping" />
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[#144C38] text-[11px] font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>Admin Access Control</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-[#0C2A20] tracking-tight">
              Admin Sign In
            </h1>
            <p className="text-xs sm:text-sm text-greesal-muted mt-1 font-medium">
              Enter authorized credentials to manage orders, catalog &amp; system settings.
            </p>
          </div>


          {/* Error Message */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4 text-left">
            {/* Username Input */}
            <div>
              <label className="block text-xs font-bold text-[#144C38] uppercase tracking-wider mb-1.5">
                Admin Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <User className="w-4 h-4 text-greesal-muted" />
                </div>
                <input
                  id="admin-username-input"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin"
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-3 bg-[#FAF6F0]/60 border border-[#EBE2D3] rounded-xl text-sm font-medium text-[#0C2A20] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all duration-200"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#144C38] uppercase tracking-wider">
                  Admin Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4 text-greesal-muted" />
                </div>
                <input
                  id="admin-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="e.g. admin123"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-11 py-3 bg-[#FAF6F0]/60 border border-[#EBE2D3] rounded-xl text-sm font-medium text-[#0C2A20] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-[#0C2A20] transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-greesal-muted" />
                  ) : (
                    <Eye className="w-4 h-4 text-greesal-muted" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#144C38] focus:ring-emerald-500 accent-[#144C38]"
                />
                <span className="text-xs font-semibold text-gray-600">Keep admin session active</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              id="admin-login-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#0C2A20] via-[#144C38] to-[#1A5C45] hover:from-[#144C38] hover:to-[#237357] text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-300" />
                  <span>Authenticating Admin...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Admin Console</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Security Notice Footer */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-greesal-muted">
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" />
              <span>Authorized personnel only &bull; End-to-end encrypted session</span>
            </div>
          </div>
        </div>
      </main>

      {/* Page Bottom Footer */}
      <footer className="w-full py-4 text-center text-xs text-greesal-muted font-medium relative z-10">
        &copy; {new Date().getFullYear()} Greesal Fresh Bowl. Admin Operations.
      </footer>
    </div>
  );
}
