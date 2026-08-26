import React, { useState } from 'react';
import { OnboardingStep, AuthUser } from '../types';
import { CheckCircle2, Phone, MessageSquare, ArrowLeft, Loader2, Sparkles } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (user: AuthUser) => void;
  onClose?: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onComplete,
}) => {
  const [step, setStep] = useState<OnboardingStep>('PROMO');
  const [phoneNumber, setPhoneNumber] = useState('7680922101');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [selectedRole, setSelectedRole] = useState('All-Rounder');
  const [experienceLevel, setExperienceLevel] = useState('Intermediate');

  if (!isOpen) return null;

  const handleTruecallerVerify = () => {
    setStep('WAITING');
    setTimeout(() => {
      setStep('OTP_INPUT');
    }, 600);
  };

  const handlePhoneSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }
    setStep('WAITING');
    setTimeout(() => {
      setStep('OTP_INPUT');
    }, 500);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otpCode];
    newOtp[index] = value.slice(-1);
    setOtpCode(newOtp);
    setOtpError('');

    if (value && index < 4) {
      const nextInput = document.getElementById(`otp-digit-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`otp-digit-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleOtpVerify = () => {
    const fullCode = otpCode.join('');
    if (fullCode.length < 5) {
      setOtpError('Please enter the complete 5-digit verification code.');
      return;
    }

    setStep('WAITING');
    setTimeout(() => {
      setStep('SURVEY');
    }, 700);
  };

  const handleGuestLogin = () => {
    const guestUser: AuthUser = {
      userId: 999,
      name: 'Guest Player',
      mobileNumber: 'N/A',
      isGuest: true,
    };
    onComplete(guestUser);
  };

  const handleCompleteSurvey = () => {
    const authUser: AuthUser = {
      userId: 101,
      name: 'Arfaz Mohammad',
      mobileNumber: phoneNumber,
      token: 'jwt_demo_token_authenticated',
      isGuest: false,
    };
    onComplete(authUser);
  };

  return (
    <div
      id="onboarding-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto"
    >
      <div className="relative w-full max-w-md bg-[#0F172A] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-100 min-h-[580px] flex flex-col justify-between">
        
        {/* STEP 1: PROMO SCREEN */}
        {step === 'PROMO' && (
          <div id="step-promo" className="relative flex flex-col flex-1 justify-between p-6 overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
              <img
                src="https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800"
                alt="Cricket Background"
                className="w-full h-full object-cover opacity-35"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/70 to-transparent" />
            </div>

            {/* Header Brand */}
            <div className="relative z-10 text-center mt-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-600 shadow-lg shadow-red-600/30 mb-3">
                <div className="w-1 h-12 bg-white/70 border-r border-dashed border-red-300" />
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white">cricheroes</h1>
              <p className="text-xs text-slate-300 tracking-wider uppercase font-medium mt-0.5">
                Your cricket matters
              </p>
            </div>

            {/* Content info */}
            <div className="relative z-10 text-center my-auto py-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-600/20 border border-red-500/40 rounded-full text-red-400 text-xs font-semibold uppercase mb-3">
                <Sparkles size={13} /> Featured Showcase
              </div>
              <p className="text-lg text-slate-300 font-medium">Introducing</p>
              <h2 className="text-3xl font-extrabold text-red-500 mt-1">
                English Willow Bats
              </h2>
              <p className="text-xs text-slate-400 mt-3 px-4 leading-relaxed">
                Track live scores, manage team rosters, book academy masterclasses, and share digital match scorecards seamlessly.
              </p>
            </div>

            {/* Bottom Button */}
            <div className="relative z-10 flex flex-col gap-2 mt-4">
              <button
                id="promo-start-btn"
                onClick={() => setStep('TRUECALLER')}
                className="w-full py-3.5 px-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-2xl shadow-lg shadow-red-600/30 transition duration-150 cursor-pointer text-center text-base"
              >
                Get Started
              </button>
              <button
                onClick={handleGuestLogin}
                className="text-xs text-slate-400 hover:text-white py-2 transition"
              >
                Skip & Explore as Guest
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: TRUECALLER INSTANT VERIFY */}
        {step === 'TRUECALLER' && (
          <div id="step-truecaller" className="flex flex-col flex-1 justify-between p-6">
            <div className="text-center pt-4">
              <div className="w-12 h-12 rounded-full bg-red-600 mx-auto flex items-center justify-center mb-2 shadow-md">
                <div className="w-0.5 h-8 bg-white/70 border-r border-dashed border-red-300" />
              </div>
              <h3 className="text-xl font-bold text-white">cricheroes</h3>
              <p className="text-[11px] text-slate-400">Your cricket matters</p>
            </div>

            <div className="my-auto bg-[#1E293B] border border-slate-700/80 rounded-2xl p-6 shadow-xl text-center">
              <div className="w-12 h-12 rounded-full bg-[#1d978e]/20 text-[#1d978e] mx-auto flex items-center justify-center mb-3">
                <Phone size={22} />
              </div>
              <h4 className="text-lg font-bold text-white mb-1">Hi, Arfaz Mohammad</h4>
              <p className="text-xs text-slate-300 mb-6">
                To get started, please verify your registered mobile number
              </p>

              <button
                id="tc-use-number-btn"
                onClick={handleTruecallerVerify}
                className="w-full py-3.5 bg-[#1d978e] hover:bg-[#188078] text-white font-bold rounded-xl shadow-md transition duration-150 cursor-pointer mb-3 text-sm tracking-wide"
              >
                USE 7680922101
              </button>

              <button
                id="tc-another-number-btn"
                onClick={() => setStep('LOGIN_OPTIONS')}
                className="w-full py-2.5 text-xs text-slate-400 hover:text-slate-200 font-semibold transition"
              >
                USE ANOTHER MOBILE NUMBER
              </button>

              <div className="border-t border-slate-700/70 pt-3 mt-4 text-left">
                <p className="text-[10px] text-slate-400 leading-tight">
                  By continuing you consent to share your Truecaller profile information with CricHeroes.
                </p>
                <p className="text-[11px] font-semibold text-sky-400 mt-1.5 flex items-center gap-1">
                  <CheckCircle2 size={12} /> Instant Verification by Truecaller
                </p>
              </div>
            </div>

            <button
              onClick={handleGuestLogin}
              className="text-xs text-center text-slate-400 hover:text-slate-200 py-2"
            >
              Explore as a guest
            </button>
          </div>
        )}

        {/* STEP 3: MANUAL PHONE LOGIN OPTIONS */}
        {step === 'LOGIN_OPTIONS' && (
          <div id="step-login-options" className="flex flex-col flex-1 justify-between p-6">
            <div className="text-center pt-2">
              <div className="w-10 h-10 rounded-full bg-red-600 mx-auto flex items-center justify-center mb-2">
                <div className="w-0.5 h-6 bg-white/70 border-r border-dashed" />
              </div>
              <h3 className="text-xl font-bold text-white">cricheroes</h3>
              <p className="text-[11px] text-slate-400">Your cricket matters</p>
            </div>

            <form onSubmit={handlePhoneSubmit} className="my-auto space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Mobile Number
                </label>
                <div className="flex items-center bg-[#1E293B] border border-slate-700 rounded-xl px-3 py-3 focus-within:border-[#1d978e] transition">
                  <span className="text-sm font-bold text-slate-400 mr-2 pr-2 border-r border-slate-700">
                    +91
                  </span>
                  <input
                    type="tel"
                    id="phone-input"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter 10 digit number"
                    className="w-full bg-transparent text-white font-medium text-sm outline-none placeholder-slate-500"
                    maxLength={10}
                  />
                </div>
              </div>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-700"></div>
                <span className="flex-shrink mx-3 text-[11px] text-slate-400 font-medium uppercase">
                  Login with
                </span>
                <div className="flex-grow border-t border-slate-700"></div>
              </div>

              <button
                type="button"
                id="whatsapp-login-btn"
                onClick={() => handlePhoneSubmit()}
                className="w-full py-3 px-4 bg-[#128C7E] hover:bg-[#0f7a6e] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition duration-150 text-sm shadow-md"
              >
                <MessageSquare size={18} /> Continue with WhatsApp
              </button>

              <button
                type="submit"
                id="mobile-login-btn"
                className="w-full py-3 px-4 bg-[#1E293B] hover:bg-[#283548] border border-slate-700 text-slate-200 font-bold rounded-xl flex items-center justify-center gap-2 transition duration-150 text-sm"
              >
                <Phone size={18} /> Request Mobile OTP
              </button>

              <p className="text-[10px] text-slate-400 text-center leading-relaxed px-2">
                By signing in, you agree to our terms of service and privacy policy.
              </p>
            </form>

            <button
              id="explore-guest-btn"
              onClick={handleGuestLogin}
              className="text-xs text-center text-[#1d978e] font-semibold hover:underline py-2"
            >
              Explore as a guest
            </button>
          </div>
        )}

        {/* STEP 4: OTP VERIFICATION */}
        {step === 'OTP_INPUT' && (
          <div id="step-otp-input" className="flex flex-col flex-1 justify-between p-6">
            <div>
              <button
                id="otp-back-btn"
                onClick={() => setStep('LOGIN_OPTIONS')}
                className="text-slate-400 hover:text-white flex items-center gap-1.5 text-xs font-semibold mb-4 transition"
              >
                <ArrowLeft size={16} /> Back to Login
              </button>

              <h3 className="text-2xl font-bold text-white">Verify OTP</h3>
              <p className="text-xs text-slate-400 mt-1">
                We sent a 5-digit verification code to <span className="text-white font-semibold">+91 {phoneNumber}</span>
              </p>
            </div>

            <div className="my-auto py-6">
              <div className="flex justify-center gap-2.5 mb-4">
                {otpCode.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-digit-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-12 h-14 bg-[#1E293B] border border-slate-700 focus:border-[#1d978e] rounded-xl text-center text-xl font-bold text-white outline-none shadow-inner transition"
                    autoFocus={idx === 0}
                  />
                ))}
              </div>

              {otpError && (
                <p className="text-xs text-red-400 text-center font-medium mb-3">
                  {otpError}
                </p>
              )}

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setOtpCode(['1', '2', '3', '4', '5']);
                  }}
                  className="text-xs text-sky-400 hover:underline font-medium"
                >
                  Auto-fill demo OTP (12345)
                </button>
              </div>
            </div>

            <div>
              <button
                id="otp-verify-btn"
                onClick={handleOtpVerify}
                disabled={otpCode.join('').length < 5}
                className="w-full py-3.5 bg-[#1d978e] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#188078] text-white font-bold rounded-xl shadow-lg transition duration-150 text-sm tracking-wide"
              >
                Verify & Proceed
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: WAITING SPINNER */}
        {step === 'WAITING' && (
          <div id="step-waiting" className="flex flex-col flex-1 items-center justify-center p-8 text-center">
            <h4 className="text-lg font-bold text-white mb-6">Hi, Arfaz Mohammad</h4>
            <div className="relative mb-6">
              <Loader2 className="w-14 h-14 text-[#1d978e] animate-spin" />
            </div>
            <p className="text-sm font-semibold text-slate-300 mb-6">
              Authenticating session with CricHeroes server...
            </p>
            <div className="w-full py-3 bg-[#1d978e]/30 border border-[#1d978e]/50 text-emerald-300 font-bold rounded-xl text-xs tracking-wider uppercase">
              PLEASE WAIT...
            </div>
          </div>
        )}

        {/* STEP 6: SURVEY / PREFERENCES */}
        {step === 'SURVEY' && (
          <div id="step-survey" className="flex flex-col flex-1 justify-between p-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1d978e]/20 text-[#1d978e] rounded-full text-xs font-semibold mb-2">
                <CheckCircle2 size={13} /> Mobile Verified
              </div>
              <h3 className="text-2xl font-bold text-white">Player Profile Survey</h3>
              <p className="text-xs text-slate-400 mt-1">
                Customize your local cricket experience
              </p>
            </div>

            <div className="space-y-4 my-auto py-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  What is your primary cricket role?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['Batsman', 'Bowler', 'All-Rounder', 'Wicketkeeper'].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setSelectedRole(role)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-semibold text-left transition border ${
                        selectedRole === role
                          ? 'bg-[#1d978e]/20 border-[#1d978e] text-white'
                          : 'bg-[#1E293B] border-slate-700 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Experience Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Beginner', 'Intermediate', 'Tournament Pro'].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setExperienceLevel(lvl)}
                      className={`py-2 px-2 rounded-xl text-[11px] font-semibold text-center transition border ${
                        experienceLevel === lvl
                          ? 'bg-[#1d978e]/20 border-[#1d978e] text-white'
                          : 'bg-[#1E293B] border-slate-700 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                id="survey-submit-btn"
                onClick={handleCompleteSurvey}
                className="w-full py-3.5 bg-[#1d978e] hover:bg-[#188078] text-white font-bold rounded-xl shadow-lg transition text-sm cursor-pointer"
              >
                Save & Enter Matches
              </button>
              <button
                onClick={handleCompleteSurvey}
                className="text-xs text-slate-400 hover:text-slate-200 py-1.5 text-center"
              >
                Skip for now
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
