import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GoogleLoginComp from '../../components/GoogleLogin/googleLoginComp';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  ArrowRight,
  Sparkles,
  Briefcase,
  CheckCircle2
} from 'lucide-react';

const SignUp = (props) => {
  const navigate = useNavigate();
  const [registerField, setRegisterField] = useState({
    f_name: '',
    email: '',
    password: '',
  });
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onChangeInput = (event, key) => {
    setRegisterField({ ...registerField, [key]: event.target.value });
  };

  const handleRegister = async (e) => {
    if (e) e.preventDefault();

    if (!registerField.f_name.trim()) {
      return toast.error('Please enter your full name.');
    }
    if (!registerField.email.trim()) {
      return toast.error('Please enter your email.');
    }
    if (registerField.password.length < 6) {
      return toast.error('Password must be at least 6 characters.');
    }
    if (!agreeTerms) {
      return toast.error('Please agree to the Terms of Service to proceed.');
    }

    try {
      setLoading(true);
      const res = await axios.post(
        'http://localhost:4000/api/auth/register',
        registerField
      );

      toast.success(
        `Registration successful! Please remember your registered email: ${registerField.email} for future logins.`,
        { autoClose: 6000 }
      );
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-[calc(100vh-64px)] w-full flex items-center justify-center p-3 sm:p-6 lg:p-10 transition-colors duration-300 relative overflow-hidden"
      style={{ backgroundColor: 'var(--bg-main)' }}
    >
      {/* Background Decorative Ambient Waves */}
      <div className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-15 flex items-center justify-between">
        <div className="w-96 h-96 rounded-full bg-blue-400/20 blur-3xl -translate-x-1/2" />
        <div className="w-96 h-96 rounded-full bg-emerald-400/20 blur-3xl translate-x-1/2" />
      </div>

      {/* Main Split-Screen Container */}
      <div
        className="relative z-10 w-full max-w-6xl rounded-3xl shadow-2xl border overflow-hidden grid grid-cols-1 lg:grid-cols-12 transition-all duration-300 animate-in fade-in zoom-in-95"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-color)',
        }}
      >
        {/* ================= LEFT HERO PANEL ================= */}
        <div
          className="lg:col-span-7 p-6 sm:p-10 lg:p-14 flex flex-col justify-between relative bg-gradient-to-b from-blue-50/50 via-transparent to-emerald-50/30 dark:from-sky-950/20 dark:via-transparent dark:to-emerald-950/10 border-b lg:border-b-0 lg:border-r"
          style={{ borderColor: 'var(--border-color)' }}
        >
          {/* Brand Header */}
          <div>
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0a66c2] to-sky-400 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-blue-500/20">
                in
              </div>
              <span className="font-extrabold text-2xl tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Link<span className="text-[#0a66c2]">Pro</span>
              </span>
            </div>

            {/* Hero Headings */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight max-w-lg" style={{ color: 'var(--text-primary)' }}>
              Join the professional network of <span className="text-[#0a66c2]">leaders & innovators</span>
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 max-w-md leading-relaxed">
              Build your digital resume, connect with ambitious peers, and open the door to your next career milestone.
            </p>
          </div>

          {/* Centerpiece Hero Artwork with Floating Cards */}
          <div className="relative my-8 sm:my-10 flex items-center justify-center">
            {/* Sparkle decorative icons */}
            <div className="absolute top-4 left-6 text-sky-400 animate-pulse">
              <Sparkles size={26} />
            </div>
            <div className="absolute top-12 right-10 text-emerald-400 animate-bounce duration-1000">
              <Sparkles size={28} />
            </div>

            {/* Outer Circular Gradient Aura & Inner Circle */}
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full flex items-center justify-center">
              {/* Vibrant Green/Lime Accent Ring */}
              <div className="absolute inset-0 rounded-full border-4 border-emerald-400/40 dark:border-emerald-500/30 scale-105" />

              {/* Blue Circular Backdrop */}
              <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#0a66c2] via-sky-500 to-emerald-400 overflow-hidden relative shadow-2xl shadow-blue-500/30">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80"
                  alt="Professional candidate with laptop"
                  className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Floating Card: Middle Right (A Better Path) */}
              <div
                className="absolute top-1/2 -right-4 sm:-right-8 -translate-y-1/2 py-2 px-3 rounded-2xl shadow-xl border backdrop-blur-md flex items-center gap-2.5 z-20 animate-in fade-in duration-300 hidden sm:flex"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-color)',
                }}
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-lime-400 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Briefcase size={16} />
                </div>
                <div className="text-left">
                  <div className="text-[11px] font-bold" style={{ color: 'var(--text-primary)' }}>
                    A Better Path
                  </div>
                  <div className="text-[9px] text-gray-500">to more opportunity</div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-500">
            Free forever to search jobs, build relationships, and publish posts.
          </div>
        </div>

        {/* ================= RIGHT FORM PANEL ================= */}
        <div className="lg:col-span-5 p-6 sm:p-10 lg:p-12 flex flex-col justify-between">
          <div>
            {/* Form Header */}
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Get started free!
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
                Create your LinkPro profile in less than 30 seconds.
              </p>
            </div>

            {/* Social Login Button (Google) */}
            <div className="w-full mb-5">
              <GoogleLoginComp changeLoginValue={props.changeLoginValue} />
            </div>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-[1px]" style={{ backgroundColor: 'var(--border-color)' }} />
              <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">or email</span>
              <div className="flex-1 h-[1px]" style={{ backgroundColor: 'var(--border-color)' }} />
            </div>

            {/* Form Inputs */}
            <form onSubmit={handleRegister} className="space-y-3.5">
              {/* Name Input */}
              <div>
                <div
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-200 focus-within:border-[#0a66c2] focus-within:ring-2 focus-within:ring-[#0a66c2]/20"
                  style={{
                    backgroundColor: 'var(--bg-input)',
                    borderColor: 'var(--border-color)',
                  }}
                >
                  <User size={17} className="text-gray-400 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={registerField.f_name}
                    onChange={(e) => onChangeInput(e, 'f_name')}
                    className="w-full bg-transparent text-xs sm:text-sm outline-none placeholder:text-gray-400 font-medium"
                    style={{ color: 'var(--text-primary)' }}
                    required
                  />
                </div>
              </div>

              {/* Email Input */}
              <div>
                <div
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-200 focus-within:border-[#0a66c2] focus-within:ring-2 focus-within:ring-[#0a66c2]/20"
                  style={{
                    backgroundColor: 'var(--bg-input)',
                    borderColor: 'var(--border-color)',
                  }}
                >
                  <Mail size={17} className="text-gray-400 flex-shrink-0" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={registerField.email}
                    onChange={(e) => onChangeInput(e, 'email')}
                    className="w-full bg-transparent text-xs sm:text-sm outline-none placeholder:text-gray-400 font-medium"
                    style={{ color: 'var(--text-primary)' }}
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-200 focus-within:border-[#0a66c2] focus-within:ring-2 focus-within:ring-[#0a66c2]/20 relative"
                  style={{
                    backgroundColor: 'var(--bg-input)',
                    borderColor: 'var(--border-color)',
                  }}
                >
                  <Lock size={17} className="text-gray-400 flex-shrink-0" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password (min 6 chars)"
                    value={registerField.password}
                    onChange={(e) => onChangeInput(e, 'password')}
                    className="w-full bg-transparent text-xs sm:text-sm outline-none pr-8 placeholder:text-gray-400 font-medium"
                    style={{ color: 'var(--text-primary)' }}
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Agree Terms Checkbox */}
              <div className="text-xs pt-1">
                <label className="flex items-start gap-2 cursor-pointer select-none" style={{ color: 'var(--text-secondary)' }}>
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded text-[#0a66c2] accent-[#0a66c2] cursor-pointer"
                  />
                  <span className="leading-tight">
                    I agree to the <a href="#" className="text-[#0a66c2] underline">User Agreement</a> and <a href="#" className="text-[#0a66c2] underline">Privacy Policy</a>.
                  </span>
                </label>
              </div>

              {/* Submit CTA Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 py-3.5 px-4 rounded-2xl bg-[#0a66c2] hover:bg-[#004182] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <span>CREATE ACCOUNT</span>
                )}
              </button>

              {/* Direct Switcher Link right under Submit CTA */}
              <div className="text-center mt-3.5 text-xs text-gray-500">
                Already have an account?{' '}
                <Link to="/login" className="text-[#0a66c2] hover:text-[#004182] font-bold hover:underline">
                  Sign In
                </Link>
              </div>
            </form>
          </div>

          {/* Footer Area */}
          <div className="mt-8 pt-6 border-t text-center space-y-4" style={{ borderColor: 'var(--border-color)' }}>
            <div className="flex items-center justify-center gap-4 text-[11px] text-[#0a66c2] font-medium">
              <a href="#" className="hover:underline">Terms of Service</a>
              <span className="text-gray-300 dark:text-gray-700">•</span>
              <a href="#" className="hover:underline">Privacy Policy</a>
            </div>

            <div className="text-[10px] text-gray-400 font-medium">
              LinkPro 2026. All rights reserved.
            </div>
          </div>
        </div>
      </div>

      <ToastContainer position="bottom-right" autoClose={3000} theme="light" />
    </div>
  );
};

export default SignUp;
