import React, { useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../../components/Card/card';
import { Mail, ArrowLeft, Send, KeyRound } from 'lucide-react';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      return toast.error('Please enter your email address');
    }

    try {
      setLoading(true);
      const res = await axios.post(
        'http://localhost:4000/api/auth/forgot-password',
        { email }
      );
      toast.success(res.data.message || 'Password reset code generated and printed in terminal!');
      setTimeout(() => {
        navigate('/reset-password', { state: { email } });
      }, 1200);
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] flex flex-col justify-center items-center p-4 transition-colors duration-300 overflow-hidden">
      {/* Modern Professional Geometric Mesh Background */}
      <div className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <defs>
            <pattern id="forgot-grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.75" className="text-gray-400/40 dark:text-gray-600/40" />
            </pattern>
            <radialGradient id="forgot-grad" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#0a66c2" stopOpacity="0.12" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#forgot-grid-pattern)" />
          <rect width="100%" height="100%" fill="url(#forgot-grad)" />
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#0a66c2] shadow-lg shadow-blue-500/20 mb-3 text-white font-bold text-2xl font-sans">
            in
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Reset Password
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Enter your registered email and we'll send you a secure 6-digit recovery code.
          </p>
        </div>

        <Card padding={false} className="p-7 shadow-xl border backdrop-blur-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                Registered Email
              </label>
              <div
                className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border transition-all duration-200 focus-within:border-[#0a66c2] focus-within:ring-2 focus-within:ring-[#0a66c2]/20"
                style={{
                  backgroundColor: 'var(--bg-input)',
                  borderColor: 'var(--border-color)',
                }}
              >
                <Mail size={16} className="text-gray-400 flex-shrink-0" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  className="w-full bg-transparent text-xs outline-none placeholder:text-gray-500"
                  style={{ color: 'var(--text-primary)' }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-[#0a66c2] hover:bg-[#004182] text-white font-semibold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <>
                  <span className="text-white font-bold">Send Reset Link</span>
                  <Send size={14} className="text-white" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t text-center" style={{ borderColor: 'var(--border-color)' }}>
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs text-[#0a66c2] hover:text-[#004182] font-semibold hover:underline"
            >
              <ArrowLeft size={14} />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </Card>
      </div>

      <ToastContainer position="bottom-right" autoClose={3000} theme="light" />
    </div>
  );
};

export default ForgotPassword;