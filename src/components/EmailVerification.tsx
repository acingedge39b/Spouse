import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Mail, ShieldCheck, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { sendOtpApi, verifyOtpApi } from '../lib/api';

interface EmailVerificationProps {
  onVerified: () => void;
  onBack: () => void;
}

export const EmailVerification: React.FC<EmailVerificationProps> = ({ onVerified, onBack }) => {
  const [step, setStep] = useState<'input_email' | 'enter_otp'>('input_email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(30);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (step === 'enter_otp' && resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, resendCooldown]);

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail || !cleanEmail.endsWith('@gmail.com')) {
      setError('Only personal @gmail.com addresses are accepted for research study verification.');
      return;
    }
    setError(null);
    setSuccessMsg(null);
    setIsSending(true);

    try {
      const res = await sendOtpApi(email);
      setIsSending(false);

      if (!res.success) {
        setError(res.error || 'Failed to dispatch passcode.');
        return;
      }

      setSuccessMsg(res.message || `Single-use passcode dispatched to ${email}.`);
      setStep('enter_otp');
      setResendCooldown(30);
    } catch (err: any) {
      setIsSending(false);
      setError(err?.message || 'Error communicating with authentication server.');
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const entered = otp.join('');
    if (entered.length < 6) {
      setError('Please enter all 6 digits of the passcode.');
      return;
    }

    setError(null);
    setIsVerifying(true);

    try {
      const res = await verifyOtpApi(email, entered);
      setIsVerifying(false);

      if (!res.success) {
        setError(res.error || 'Invalid or expired passcode.');
        return;
      }

      onVerified();
    } catch (err: any) {
      setIsVerifying(false);
      setError(err?.message || 'Verification failed. Please try again.');
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      {/* Progress header */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={step === 'enter_otp' ? () => setStep('input_email') : onBack}
          className="neo-btn bg-white px-3 py-1.5 text-xs flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{step === 'enter_otp' ? 'Change Email' : 'Back'}</span>
        </button>
        <span className="neo-badge bg-[#FFE600] text-[#121212] text-[10px] sm:text-xs px-2.5 py-1">
          Step 3 of 4 • Email Auth
        </span>
      </div>

      <div className="neo-card bg-[#FFFDF7] p-6 sm:p-8 space-y-6">
        <div>
          <span className="neo-badge bg-[#E8EEFF] text-[#3B82F6] text-[10px] px-2 py-0.5">
            Bot Prevention & Cloudflare D1 Auth
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#121212] mt-2">
            {step === 'input_email' ? 'Quick Email Verification' : 'Enter 6-Digit Passcode'}
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 font-medium mt-1 leading-relaxed">
            {step === 'input_email'
              ? 'We verify your email once to protect the academic sample from automated spam bots.'
              : `We sent a single-use passcode to ${email}. Check your inbox or spam folder.`}
          </p>
        </div>

        {/* Decoupled Privacy highlight */}
        <div className="neo-card-sm bg-[#FFEFEA] p-3.5 text-xs text-gray-800 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-[#FF5A36] shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
            <span className="font-extrabold text-[#9A3412]">Decoupled Architecture:</span> Your email is stored exclusively in a bot-screening verification table in Cloudflare D1 with zero foreign keys to your video or audio diaries.
          </div>
        </div>

        {step === 'input_email' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-black uppercase tracking-wider text-gray-800 mb-1.5">
                Participant Email
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. participant@example.com"
                  required
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border-2 border-black bg-white focus:outline-none text-sm font-semibold shadow-[2px_2px_0px_0px_#000]"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-xs text-red-600 font-bold bg-red-50 p-2.5 rounded-lg border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSending || !email}
              className={`w-full py-4 neo-btn text-white text-sm sm:text-base flex items-center justify-center gap-2 ${
                email && !isSending ? 'bg-[#FF5A36]' : 'bg-gray-300 text-gray-500 cursor-not-allowed border-gray-400 shadow-none'
              }`}
            >
              {isSending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Connecting to Cloudflare Backend...</span>
                </>
              ) : (
                <>
                  <span>Send 6-Digit OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            {successMsg && (
              <div className="flex items-center gap-2 text-xs text-[#1E7E52] font-semibold bg-[#D4EDDA] p-3 rounded-xl border border-[#1E7E52]/30">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#1E7E52]" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* OTP Digits input */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-800 mb-2 text-center">
                Enter 6-Digit Passcode
              </label>
              <div className="flex justify-center gap-2 max-w-xs mx-auto">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="flex-1 min-w-0 max-w-[46px] h-12 sm:h-14 text-center text-xl font-black font-mono rounded-xl border-2 border-black bg-white focus:outline-none shadow-[2px_2px_0px_0px_#000]"
                  />
                ))}
              </div>
            </div>

            {error && (
              <div className="flex items-center justify-center gap-1.5 text-xs text-red-600 font-bold bg-red-50 p-2.5 rounded-lg border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifying || otp.join('').length < 6}
              className={`w-full py-4 neo-btn text-white text-sm sm:text-base flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_#000] ${
                otp.join('').length === 6 && !isVerifying ? 'bg-[#FF5A36]' : 'bg-gray-300 text-gray-500 cursor-not-allowed border-gray-400 shadow-none'
              }`}
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Against Database...</span>
                </>
              ) : (
                <>
                  <span>Verify & Remember On This Device</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-1">
              {resendCooldown > 0 ? (
                <span className="text-xs text-gray-500 font-semibold">
                  Resend passcode in {resendCooldown}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSendOtp()}
                  className="text-xs font-bold text-[#FF5A36] underline hover:text-[#e04522]"
                >
                  Resend New Passcode via Gmail
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
