import React, { useState } from 'react';
import {
  User,
  Phone,
  Lock,
  Eye,
  EyeOff,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLmsData } from '../context/LmsDataContext';
import { useLanguage } from '../context/LanguageContext';
import { MonarchEmblem, MonarchHorizontalLogo } from './BrandAssets';

interface RegistrationPageProps {
  onNavigate: (view: 'home' | 'login' | 'register' | 'dashboard' | 'categories') => void;
}

export const RegistrationPage: React.FC<RegistrationPageProps> = ({ onNavigate }) => {
  const { register } = useAuth();
  const { courses, submitCoursePayment } = useLmsData();
  const { t, language } = useLanguage();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [paymentPlan, setPaymentPlan] = useState<'skip' | 'full' | 'monthly'>('skip');
  const [slipRef, setSlipRef] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<{ en: string; si: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim()) {
      setErrorMsg({
        en: 'Please enter your full name.',
        si: 'කරුණාකර ඔබගේ සම්පූර්ණ නම ඇතුළත් කරන්න.',
      });
      return;
    }

    if (!phone.trim() || phone.length < 9) {
      setErrorMsg({
        en: 'Please enter a valid phone number (07XXXXXXXX).',
        si: 'කරුණාකර වලංගු ශිෂ්‍ය දුරකථන අංකයක් ඇතුළත් කරන්න (07XXXXXXXX).',
      });
      return;
    }

    if (!parentPhone.trim() || parentPhone.length < 9) {
      setErrorMsg({
        en: 'Please enter a valid parent phone number (07XXXXXXXX).',
        si: 'කරුණාකර වලංගු දෙමව්පියන්ගේ දුරකථන අංකයක් ඇතුළත් කරන්න (07XXXXXXXX).',
      });
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg({
        en: 'Password must be at least 6 characters.',
        si: 'මුරපදය අවම වශයෙන් අකුරු/ඉලක්කම් 6කින් සමන්විත විය යුතුය.',
      });
      return;
    }

    const selectedCourse = courses.find((c) => c.id === selectedCourseId);
    const assignedGrade = selectedCourse ? selectedCourse.grade : '2028 A/L';

    const res = register({
      fullName,
      phone,
      parentPhone,
      grade: assignedGrade,
      password,
    });

    if (res.success && res.user) {
      // If user selected a course and entered payment details
      if (selectedCourse && paymentPlan !== 'skip' && slipRef.trim()) {
        const amount = paymentPlan === 'full' ? selectedCourse.priceLKR : selectedCourse.monthlyFeeLKR;
        submitCoursePayment({
          studentId: res.user.id,
          studentName: fullName.trim(),
          studentPhone: phone.trim(),
          courseId: selectedCourse.id,
          courseTitleSi: selectedCourse.titleSi,
          courseTitleEn: selectedCourse.titleEn,
          courseDuration: selectedCourse.duration || '6 Months (මාස 6)',
          plan: paymentPlan,
          amount,
          slipReference: slipRef.trim(),
        });
      }
      onNavigate('dashboard');
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex flex-col justify-center bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8 flex items-center">
        
        {/* Split Screen Container */}
        <div className="w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 grid grid-cols-1 lg:grid-cols-12 min-h-[700px]">
          
          {/* Left Side: Engaging Brand & Campus Visual with Crest & Banner Tagline */}
          <div className="relative hidden lg:flex lg:col-span-5 xl:col-span-6 flex-col justify-between overflow-hidden bg-gradient-to-br from-[#061226] via-[#0b214a] to-[#07173b] p-8 xl:p-12 text-white">
            
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-15 pointer-events-none">
              <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="reg-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.8" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#reg-grid)" />
              </svg>
            </div>

            {/* Glowing Accent Orbs */}
            <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center gap-3">
                <MonarchEmblem size={52} />
                <div>
                  <span
                    className="font-extrabold tracking-widest text-lg font-serif text-white uppercase block"
                    style={{ fontFamily: "'Cinzel', Georgia, serif" }}
                  >
                    MONARCH CAMPUS
                  </span>
                  <span
                    className="text-xs italic text-amber-300"
                    style={{ fontFamily: "'Dancing Script', cursive, serif" }}
                  >
                    Your Future, Our Mission
                  </span>
                </div>
              </div>

              {/* National Distinction Banner */}
              <div className="mt-8 rounded-2xl border border-amber-400/40 bg-gradient-to-r from-amber-500/20 via-amber-400/10 to-transparent p-5 backdrop-blur-md">
                <span className="text-[11px] font-bold uppercase tracking-widest text-amber-300 block">
                  ADMISSION ENROLLMENT 2026/2028
                </span>
                <h3 className="mt-1 text-2xl xl:text-3xl font-extrabold text-white leading-snug">
                  BEST CAMPUS FOR <span className="text-amber-300">PROFESSIONAL COURSES</span> IN SRI LANKA
                </h3>
                <p className="mt-1.5 text-xs text-amber-100/90 font-medium">
                  ඔබේ අනාගත ජයග්‍රහණ වෙනුවෙන් විශිෂ්ටතම අධ්‍යාපන පීඨය හා එක්වන්න · Dream · Learn · Grow
                </p>
              </div>

              {/* Academic Highlights */}
              <div className="mt-8 space-y-3.5">
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-sm">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Full Classroom Video Access</h4>
                    <p className="text-[11px] text-slate-300">
                      පසුගිය සියලු පන්තිවල Recording සහ සජීවී විකාශන
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-sm">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Printed Tutes & Speed Delivery</h4>
                    <p className="text-[11px] text-slate-300">
                      සියලුම නිබන්ධන PDF සහ නිවසටම කූරියර් කිරීමේ පහසුකම
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-sm">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400 shrink-0">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">24/7 AI Doubt Solver Support</h4>
                    <p className="text-[11px] text-slate-300">
                      ඕනෑම ගැටළුවක් ක්ෂණිකව නිරාකරණය කරගත හැකි AI සහයකයා
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-6">
              <div className="flex items-center justify-between border-t border-white/15 pt-4 text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-amber-400" />
                  Verified Sri Lankan Campus LMS
                </span>
                <span className="text-amber-300 font-serif italic">Dream · Learn · Grow</span>
              </div>
            </div>

          </div>

          {/* Right Side: Registration Form */}
          <div className="lg:col-span-7 xl:col-span-6 p-6 sm:p-10 xl:p-12 flex flex-col justify-center bg-white dark:bg-slate-900">
            
            {/* Top Logo for mobile */}
            <div className="mb-4">
              <MonarchHorizontalLogo />
            </div>

            {/* Form Headers */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <span>Create Account</span>
                <span className="animate-bounce">🚀</span>
              </h1>
              <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300 font-medium">
                ලියාපදිංචි වීම සඳහා ඔබේ විස්තර ඇතුළත් කරන්න.
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Enter your details to create your Monarch Campus student profile.
              </p>
            </div>

            {/* Error Message Alert */}
            {errorMsg && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                <p className="font-semibold">{errorMsg.si}</p>
                <p className="text-[11px] opacity-80 mt-0.5">{errorMsg.en}</p>
              </div>
            )}

            {/* Registration Form with Rounded Clean Input Fields */}
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              
              {/* Full Name Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  FULL NAME (සම්පූර්ණ නම) <span className="text-amber-500">*</span>
                </label>
                <div className="relative mt-1.5">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter Full Name"
                    required
                    className="w-full rounded-xl border border-slate-300 bg-slate-50/50 py-3 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:focus:border-amber-400 dark:focus:bg-slate-800"
                  />
                </div>
              </div>

              {/* Student Phone & Parent Phone Side by Side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Student Phone */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    PHONE NUMBER (දුරකථන අංකය) <span className="text-amber-500">*</span>
                  </label>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <Phone className="h-4 w-4" />
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="07XXXXXXXX"
                      required
                      className="w-full rounded-xl border border-slate-300 bg-slate-50/50 py-3 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:focus:border-amber-400 dark:focus:bg-slate-800"
                    />
                  </div>
                </div>

                {/* Parent Phone */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    PARENT PHONE (දෙමව්පියන්ගේ අංකය) <span className="text-amber-500">*</span>
                  </label>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <Phone className="h-4 w-4" />
                    </div>
                    <input
                      type="tel"
                      value={parentPhone}
                      onChange={(e) => setParentPhone(e.target.value)}
                      placeholder="07XXXXXXXX"
                      required
                      className="w-full rounded-xl border border-slate-300 bg-slate-50/50 py-3 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:focus:border-amber-400 dark:focus:bg-slate-800"
                    />
                  </div>
                </div>

              </div>

              {/* Course / Grade Dropdown */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {t('පාඨමාලාව තෝරන්න (SELECT COURSE — OPTIONAL)', 'SELECT COURSE — OPTIONAL')}
                </label>
                <div className="relative mt-1.5">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <GraduationCap className="h-4 w-4" />
                  </div>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50/50 py-3 pl-10 pr-8 text-xs text-slate-900 focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:focus:border-amber-400 dark:focus:bg-slate-800"
                  >
                    <option value="">{t('— පසුව පාඨමාලාවක් තෝරාගන්නම් (Select Later) —', '— Select a course later —')}</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        [{c.grade}] {language === 'si' ? c.titleSi : c.titleEn} · {c.duration || '6 Months'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* If course is selected, show fee and optional payment options */}
                {selectedCourseId && (
                  <div className="mt-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 p-3 space-y-2.5 text-xs">
                    {(() => {
                      const sc = courses.find((c) => c.id === selectedCourseId);
                      if (!sc) return null;
                      return (
                        <>
                          <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300">
                            <span>{t('කාල සීමාව:', 'Duration:')} <strong>{sc.duration || '6 Months'}</strong></span>
                            <span>{t('දේශක:', 'Instructor:')} <strong>{language === 'si' ? sc.instructorNameSi : sc.instructorNameEn}</strong></span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-center pt-1 border-t border-amber-200/60 dark:border-amber-900/40">
                            <div className="rounded-lg bg-white/70 dark:bg-slate-900 p-1.5">
                              <span className="block text-[10px] text-slate-400">Full Course</span>
                              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">Rs. {sc.priceLKR.toLocaleString()}</span>
                            </div>
                            <div className="rounded-lg bg-white/70 dark:bg-slate-900 p-1.5">
                              <span className="block text-[10px] text-slate-400">Monthly Fee</span>
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Rs. {sc.monthlyFeeLKR.toLocaleString()}</span>
                            </div>
                          </div>

                          <div className="pt-1">
                            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                              {t('ලියාපදිංචි වන අවස්ථාවේදීම ගෙවීම් රිසිට්පත යොමු කරන්නේද?', 'Deposit slip reference (Optional):')}
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={slipRef}
                                onChange={(e) => setSlipRef(e.target.value)}
                                placeholder="Slip Ref ID e.g. BOC-TXN-9842104"
                                className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-mono"
                              />
                              <select
                                value={paymentPlan}
                                onChange={(e) => setPaymentPlan(e.target.value as any)}
                                className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1.5 text-xs font-bold"
                              >
                                <option value="skip">Pay Later</option>
                                <option value="full">Full Plan</option>
                                <option value="monthly">Monthly</option>
                              </select>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Password Input with Show/Hide Eye Icon */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  CREATE PASSWORD (මුරපදය) <span className="text-amber-500">*</span>
                </label>
                <div className="relative mt-1.5">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full rounded-xl border border-slate-300 bg-slate-50/50 py-3 pl-10 pr-11 text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:focus:border-amber-400 dark:focus:bg-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 py-3.5 px-4 text-sm font-bold text-slate-950 shadow-md shadow-amber-500/20 transition-all hover:scale-[1.01] hover:shadow-lg hover:shadow-amber-500/30 active:scale-[0.99] flex items-center justify-center gap-2 mt-2"
              >
                <span>Register Now (ලියාපදිංචි වන්න)</span>
                <ArrowRight className="h-4 w-4" />
              </button>

            </form>

            {/* Bottom Link to Login */}
            <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-100 dark:border-slate-800">
              <span>Already have an account? </span>
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400 hover:underline"
              >
                Login Here (ලොග් වන්න)
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
