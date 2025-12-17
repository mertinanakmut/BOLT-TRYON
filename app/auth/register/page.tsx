// app/auth/register/page.tsx - VERCEL STYLE
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, ArrowLeft, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        setSuccess(true);
        
        // Create user profile in profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: data.user.email,
            full_name: fullName,
            credits: 15,
            plan: 'free',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }

        // Redirect after 3 seconds
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-8">
          {/* Back Button */}
          <Link
            href="/auth/login"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Back to login
          </Link>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Create your account
            </h1>
            <p className="text-gray-600">
              Start creating amazing virtual try-ons
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                <div>
                  <p className="text-green-800 font-medium">
                    Check your email
                  </p>
                  <p className="text-green-700 text-sm mt-1">
                    We've sent a confirmation link to {email}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="John Doe"
                  disabled={loading || success}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="you@example.com"
                  disabled={loading || success}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="At least 6 characters"
                  disabled={loading || success}
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Confirm your password"
                  disabled={loading || success}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-3 px-4 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creating account...
                </div>
              ) : (
                <>
                  Create account
                  <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Terms & Privacy */}
          <p className="mt-6 text-center text-xs text-gray-500">
            By signing up, you agree to our{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700">
              Privacy Policy
            </a>
          </p>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-sm text-gray-500">Already have an account?</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <Link 
              href="/auth/login" 
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              Sign in to your account
              <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 text-sm">🎨</span>
            </div>
            <p className="text-xs text-gray-600">AI Try-On</p>
          </div>
          <div className="text-center">
            <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-purple-100 flex items-center justify-center">
              <span className="text-purple-600 text-sm">⚡</span>
            </div>
            <p className="text-xs text-gray-600">Fast Results</p>
          </div>
          <div className="text-center">
            <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-green-100 flex items-center justify-center">
              <span className="text-green-600 text-sm">🆓</span>
            </div>
            <p className="text-xs text-gray-600">15 Free Credits</p>
          </div>
        </div>
      </div>
    </div>
  );
}