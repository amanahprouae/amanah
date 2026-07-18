'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

// Detect if user is on mobile device
const isMobileDevice = () => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Extract token from URL - Supabase sends it as access_token and type=recovery
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    const type = urlParams.get('type');
    
    console.log('URL params:', { accessToken, type });
    
    if (accessToken && type === 'recovery') {
      setToken(accessToken);
      
      // If on mobile device, automatically try to open the app
      if (isMobileDevice()) {
        console.log('Mobile device detected, redirecting to app...');
        // Give a small delay to show the page briefly, then redirect
        setTimeout(() => {
          // Try to open the app with the token
          window.location.href = `proapp://reset-password?token=${accessToken}&type=recovery`;
        }, 800);
      }
    } else {
      setError('Invalid or expired reset link. Please request a new password reset link.');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      // Set the session with the recovery token
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: token!,
        refresh_token: token!,
      });

      if (sessionError) {
        throw sessionError;
      }

      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        throw updateError;
      }

      setSuccess('Password updated successfully! Redirecting to login...');
      
      // Sign out and redirect to login
      setTimeout(async () => {
        await supabase.auth.signOut();
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5f5f0] to-[#e8ecde] p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-[#316342] rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-2xl">PR</span>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center text-[#2b2b26] mb-2">
            Reset Password
          </h1>
          <p className="text-center text-[#8a8a80] mb-8">
            Create a new password for your account
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-600 text-sm">{success}</p>
            </div>
          )}

          {!token ? (
            <div className="text-center">
              <p className="text-red-600 mb-4">Invalid or expired reset link</p>
              <p className="text-sm text-[#8a8a80] mb-4">
                Please request a new password reset link from the app.
              </p>
              {isMobileDevice() && (
                <button
                  onClick={() => {
                    window.location.href = 'proapp://reset-password';
                  }}
                  className="px-6 py-2 bg-[#316342] text-white rounded-lg hover:bg-[#3d4a2a] transition-colors"
                >
                  Open PRO Services App
                </button>
              )}
            </div>
          ) : isMobileDevice() ? (
            // Mobile: Show loading while redirecting to app
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#316342] border-t-transparent mb-4"></div>
              <p className="text-[#2b2b26] font-semibold mb-2">Opening PRO Services App...</p>
              <p className="text-sm text-[#8a8a80] mb-4">
                If the app doesn't open automatically, tap the button below:
              </p>
              <button
                onClick={() => {
                  window.location.href = `proapp://reset-password?token=${token}&type=recovery`;
                }}
                className="px-6 py-2 bg-[#316342] text-white rounded-lg hover:bg-[#3d4a2a] transition-colors"
              >
                Open App
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-[#2b2b26] mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-[#e8ecde] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#316342]"
                  placeholder="Enter new password"
                  required
                  minLength={8}
                />
                <p className="mt-1 text-xs text-[#8a8a80]">
                  Must be 8+ characters with uppercase, lowercase, number, and special character
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#2b2b26] mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-[#e8ecde] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#316342]"
                  placeholder="Confirm new password"
                  required
                  minLength={8}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#316342] text-white rounded-lg font-semibold hover:bg-[#3d4a2a] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-[#8a8a80] mt-6">
          © 2024 PRO Services. All rights reserved.
        </p>
      </div>
    </div>
  );
}