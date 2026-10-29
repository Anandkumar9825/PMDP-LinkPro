import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import socket from '../../../socket';
import {
  AlertTriangle,
  Mail,
  ShieldAlert,
  Trash2,
  ArrowRight,
  Clock,
  RotateCcw,
  CheckCircle2,
  X
} from 'lucide-react';

const DeleteAccountModal = ({ closeModal, userEmail }) => {
  const navigate = useNavigate();
  const { changeLoginValue } = useAuth();

  const [step, setStep] = useState(1); // 1 = Warning & Request OTP, 2 = Enter OTP
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef([]);

  // Countdown timer for OTP
  useEffect(() => {
    let timer;
    if (step === 2 && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  // Handle Request OTP
  const handleRequestOtp = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        'http://localhost:4000/api/auth/request-delete-otp',
        {},
        { withCredentials: true }
      );
      toast.success(res.data?.message || 'Verification code sent to your email.');
      setStep(2);
      setCountdown(60);
      setCanResend(false);
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to send verification code.');
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP box input changes
  const handleOtpChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next box
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtp(digits);
      inputRefs.current[5]?.focus();
    }
  };

  // Handle Final Delete Account Submission
  const handleVerifyAndDelete = async (e) => {
    if (e) e.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length !== 6) {
      return toast.error('Please enter the complete 6-digit code.');
    }

    setLoading(true);
    try {
      const res = await axios.post(
        'http://localhost:4000/api/auth/verify-delete-account',
        { otp: fullOtp },
        { withCredentials: true }
      );

      toast.success(res.data?.message || 'Account successfully deleted.');

      // Complete session cleanup
      try {
        socket.disconnect();
      } catch (e) {}

      localStorage.clear();
      sessionStorage.clear();
      changeLoginValue(false);

      closeModal();
      window.location.replace('/login');

    } catch (err) {
      toast.error(err?.response?.data?.error || 'Invalid or expired verification code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      {step === 1 ? (
        /* ================= STEP 1: WARNING & REQUEST OTP ================= */
        <div className="space-y-5">
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-[#cc1016]">
            <AlertTriangle size={24} className="flex-shrink-0" />
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider">Permanent Action</h3>
              <p className="text-[11px] text-red-600 dark:text-red-400 mt-0.5 leading-snug">
                This action is irreversible. All your posts, comments, messages, and connections will be permanently wiped.
              </p>
            </div>
          </div>

          <div className="space-y-2 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
            <p>
              To confirm that you own this account, we will send a <b>6-digit verification code</b> to your registered email:
            </p>
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-black/5 dark:bg-white/5 border border-[var(--border-color)] font-mono text-xs font-semibold">
              <Mail size={15} className="text-gray-400" />
              <span>{userEmail || 'Your registered email'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 py-2.5 px-4 rounded-xl border border-[var(--border-color)] text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleRequestOtp}
              disabled={loading}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#cc1016] hover:bg-[#b20d12] text-white text-xs font-semibold transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <>
                  <span>Send Code</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* ================= STEP 2: ENTER OTP & CASCADE DELETE ================= */
        <div className="space-y-5">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 text-[#cc1016] mb-2">
              <ShieldAlert size={24} />
            </div>
            <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              Enter 6-Digit Code
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              We sent a verification code to <b>{userEmail}</b>
            </p>
          </div>

          {/* 6-Digit OTP Box Grid */}
          <div className="flex justify-center gap-2 sm:gap-2.5" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-10 h-12 sm:w-11 sm:h-12 text-center text-lg font-bold rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:border-[#cc1016] focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
              />
            ))}
          </div>

          {/* Timer & Resend */}
          <div className="flex items-center justify-between text-xs text-gray-500 px-1">
            <div className="flex items-center gap-1.5">
              <Clock size={14} className="text-gray-400" />
              <span>Expires in: <b>{countdown}s</b></span>
            </div>

            <button
              type="button"
              onClick={handleRequestOtp}
              disabled={!canResend || loading}
              className={`flex items-center gap-1 font-semibold transition-colors cursor-pointer ${
                canResend
                  ? 'text-[#0a66c2] hover:underline'
                  : 'text-gray-400 cursor-not-allowed opacity-60'
              }`}
            >
              <RotateCcw size={13} />
              <span>Resend Code</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 py-2.5 px-4 rounded-xl border border-[var(--border-color)] text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleVerifyAndDelete}
              disabled={loading || otp.join('').length !== 6}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#cc1016] hover:bg-[#b20d12] text-white text-xs font-semibold transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <>
                  <Trash2 size={14} />
                  <span>Delete Permanently</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeleteAccountModal;
