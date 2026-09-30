import React, { useState } from 'react';
import {
  Phone,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  KeyRound,
  ShieldAlert,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { MonarchEmblem, MonarchHorizontalLogo } from './BrandAssets';

interface LoginPageProps {
  onNavigate?: (view: any) => void;
  onNavigateRegister: () => void;
  onNavigateHome: () => void;
  onLoginSuccess: (role: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onNavigateRegister,
  onNavigateHome,
  onLoginSuccess,
}) => {
  const { login } = useAuth();
  const { t, language } = useLanguage();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [statusAlert, setStatusAlert] = useState<'pending' | 'suspended' | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setStatusAlert(null);

    const cleanPhone = phone.trim().replace(/\s+/g, '');
    if (!cleanPhone) {
      setErrorMessage(t('කරුණාකර දුරකථන අංකය ඇතුළත් කරන්න.', 'Please enter your phone number.'));
      return;
    }

    if (!password.trim()) {
      setErrorMessage(t('කරුණාකර මුරපදය ඇතුළත් කරන්න.', 'Please enter your password.'));
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Unified login - system automatically detects role from phone & password!
      const result = login(cleanPhone, password);
      setIsLoading(false);

      if (result.success && result.role) {
        onLoginSuccess(result.role);
      } else {
        if (result.status === 'pending') {
          setStatusAlert('pending');
        } else if (result.status === 'suspended') {
          setStatusAlert('suspended');
        }
        setErrorMessage(language === 'si' ? result.messageSi : result.messageEn);
      }
    }, 400);
  };

  const fillQuickDemo = (demoPhone: string, demoPass: string) => {
    setPhone(demoPhone);
    setPassword(demoPass);
    setErrorMessage('');
    setStatusAlert(null);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotPhone.trim()) return;
    setForgotSuccess(true);
    setTimeout(() => {
      setForgotSuccess(false);
      setShowForgotModal(false);
      setForgotPhone('');
    }, 2800);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-6 sm:py-12 transition-colors">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Main Card Split-Screen */}
        <div className="overflow-hidden rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200/80 dark:border-slate-800 grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
          
          {/* Left Visual Column */}
          <div className="relative hidden lg:flex lg:col-span-5 flex-col justify-between p-10 xl:p-12 bg-gradient-to-br from-[#07132b] via-[#0d224d] to-[#12316e] text-white overflow-hidden">
            {/* Ambient Lighting */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <div
                onClick={onNavigateHome}
                className="inline-block cursor-pointer bg-white/95 rounded-xl px-4 py-2 border border-amber-400/40 shadow-md"
              >
                <MonarchHorizontalLogo variant="light" scale={0.9} />
              </div>
            </div>

            <div className="relative z-10 my-auto text-center space-y-5">
              <div className="flex justify-center">
                <MonarchEmblem size={135} withShadow={true} />
              </div>

              <div>
                <span
                  className="block text-2xl xl:text-3xl text-amber-300 font-serif italic mb-1"
                  style={{ fontFamily: "'Dancing Script', cursive, serif" }}
                >
                  Dream · Learn · Grow
                </span>
                <h2
                  className="text-lg xl:text-xl font-bold tracking-wider uppercase text-white/90"
                  style={{ fontFamily: "'Cinzel', Georgia, serif" }}
                >
                  BEST CAMPUS FOR PROFESSIONAL COURSES
                </h2>
                <div className="h-0.5 w-24 bg-gradient-to-r from-amber-400 to-amber-600 mx-auto mt-2 rounded-full" />
              </div>

              <p className="text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
                {t(
                  "ශ්‍රී ලංකාවේ ප්‍රමුඛතම LMS පද්ධතිය වෙත සාදරයෙන් පිළිගනිමු. ඔබගේ පන්ති, සජීවී Zoom දේශන සහ විභාග පත්‍රිකා වෙත පහසුවෙන්ම පිවිසෙන්න.",
                  "Welcome to Sri Lanka's premier LMS. Connect with world-class faculty, live Zoom lectures, and comprehensive digital study materials."
                )}
              </p>
            </div>

            <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
              <span>Monarch Campus © 2026</span>
              <span className="text-amber-400 font-medium">Sri Lanka's No. 1</span>
            </div>
          </div>

          {/* Right Login Form Column */}
          <div className="lg:col-span-7 flex flex-col justify-center p-6 sm:p-10 xl:p-14">
            
            {/* Mobile Logo Brand */}
            <div className="lg:hidden flex justify-center mb-6">
              <MonarchHorizontalLogo scale={0.9} />
            </div>

            <div className="max-w-md mx-auto w-full space-y-6">
              
              {/* Header Titles */}
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Welcome Back 👋</span>
                </h1>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 font-medium">
                  {t("පන්ති වෙත පිවිසීම සඳහා ලොග් වන්න.", "Sign in to access your classes and academic dashboard.")}
                </p>
              </div>

              {/* Status Alert for Pending or Suspended accounts */}
              {statusAlert === 'pending' && (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-sm space-y-2 animate-in fade-in">
                  <div className="flex items-center gap-2 font-bold">
                    <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>{t("ගිණුම පරීක්ෂාව යටතේ පවතී (Pending Verification)", "Account Pending Approval")}</span>
                  </div>
                  <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-300">
                    {t(
                      "ඔබගේ බැංකු ගෙවීම් පරීක්ෂාව තවමත් සිදුවෙමින් පවතී. Super Admin හෝ Manager විසින් ගෙවීම් තහවුරු කළ වහාම ඔබගේ ගිණුම සක්‍රිය වනු ඇත.",
                      "Your registration and bank slip transaction ID are awaiting verification by Super Admin or Manager. Please check back shortly."
                    )}
                  </p>
                </div>
              )}

              {statusAlert === 'suspended' && (
                <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-900 dark:text-red-200 text-sm flex items-start gap-2.5 animate-in fade-in">
                  <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">{t("ගිණුම අත්හිටුවා ඇත", "Account Suspended")}</span>
                    <span className="text-xs text-red-700 dark:text-red-300">
                      {t("පරිපාලක අංශය අමතා වැඩිදුර විස්තර ලබා ගන්න.", "Please contact Monarch Campus administration.")}
                    </span>
                  </div>
                </div>
              )}

              {/* General Error Message */}
              {errorMessage && !statusAlert && (
                <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* 1. Phone Field */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    PHONE NUMBER (දුරකථන අංකය) *
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <Phone className="h-5 w-5" />
                    </div>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="07XXXXXXXX"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                {/* 2. Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      PASSWORD (මුරපදය) *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                    >
                      {t("Forgot password?", "Forgot password?")}
                    </button>
                  </div>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <Lock className="h-5 w-5" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 pl-11 pr-11 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="cursor-pointer w-full mt-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 py-3.5 px-4 text-sm sm:text-base font-bold text-slate-950 shadow-lg shadow-amber-500/25 hover:scale-[1.01] hover:shadow-amber-500/40 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      <span>Login Now</span>
                    </>
                  )}
                </button>
              </form>

              {/* Links below form */}
              <div className="space-y-3 pt-2 text-center text-sm border-t border-slate-200 dark:border-slate-800">
                <p className="text-slate-600 dark:text-slate-400">
                  Don't have an account?{' '}
                  <button
                    onClick={onNavigateRegister}
                    className="font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer inline-flex items-center gap-1"
                  >
                    <span>Register Here</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </p>
              </div>

              {/* Quick Test Demo Credentials Section */}
              <div className="mt-4 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850/60">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  {t("ක්ෂණික පරීක්ෂණ ගිණුම් (Quick Fill Credentials):", "Quick Credentials:")}
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => fillQuickDemo('0719152128', 'dsDANUSHKAds*18223')}
                    className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left hover:border-amber-500 transition-colors"
                  >
                    <span className="font-bold block text-amber-600 dark:text-amber-400">👑 Super Admin</span>
                    <span className="text-[10px] text-slate-500">0719152128</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fillQuickDemo('0768720100', 'MCmanager100')}
                    className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left hover:border-amber-500 transition-colors"
                  >
                    <span className="font-bold block text-blue-600 dark:text-blue-400">💼 Manager</span>
                    <span className="text-[10px] text-slate-500">0768720100</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fillQuickDemo('0701306952', 'INS952')}
                    className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left hover:border-amber-500 transition-colors"
                  >
                    <span className="font-bold block text-emerald-600 dark:text-emerald-400">🎓 Lecturer (ලෙක්චරර්)</span>
                    <span className="text-[10px] text-slate-500">0701306952</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fillQuickDemo('0771234567', 'student123')}
                    className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left hover:border-amber-500 transition-colors"
                  >
                    <span className="font-bold block text-purple-600 dark:text-purple-400">🎒 Student (Active)</span>
                    <span className="text-[10px] text-slate-500">0771234567</span>
                  </button>
                </div>
                <div className="mt-2.5 pt-2 border-t border-slate-200/80 dark:border-slate-800 text-[10px] text-slate-500 space-y-0.5">
                  <div className="font-bold text-amber-700 dark:text-amber-400">
                    {t('පාළක ධුරාවලිය: 1. Super Admin ➔ 2. Manager ➔ 3. Lecturer ➔ 4. Student', 'Hierarchy: 1. Super Admin ➔ 2. Manager ➔ 3. Lecturer ➔ 4. Student')}
                  </div>
                  <div className="text-[9.5px]">
                    {t('🔒 ආචාර්යවරයාට (Lecturer) සිසුවාගේ නම සහ ලකුණු තත්ත්වය පමණක් දිස්වේ.', '🔒 Lecturer is strictly limited to Student Name & Marks status.')}
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {t("මුරපදය ප්‍රතිසාධනය (Reset Password)", "Reset Password")}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t("ඔබගේ දුරකථන අංකය ඇතුළත් කරන්න", "Enter your phone number to receive reset link")}
                </p>
              </div>
            </div>

            {forgotSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm flex items-center gap-2">
                <CheckCircle className="w-5 h-5 shrink-0" />
                <span>
                  {t("මුරපදය රීසෙට් කිරීමේ SMS පණිවිඩය යොමු කරන ලදී!", "Reset code sent to your registered phone number via SMS!")}
                </span>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t("දුරකථන අංකය", "Phone Number")}
                  </label>
                  <input
                    type="text"
                    value={forgotPhone}
                    onChange={(e) => setForgotPhone(e.target.value)}
                    placeholder="07XXXXXXXX"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm"
                    required
                  />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                  >
                    {t("අවලංගු කරන්න", "Cancel")}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-600 rounded-lg cursor-pointer"
                  >
                    {t("යොමු කරන්න", "Send Code")}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
