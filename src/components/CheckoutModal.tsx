import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Building2,
  UploadCloud,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Tag,
  AlertCircle,
  Copy,
  Check,
  Clock,
  Sparkles,
  User,
  Phone,
} from 'lucide-react';
import { Course } from '../types';
import { useAuth } from '../context/AuthContext';
import { useLmsData } from '../context/LmsDataContext';
import { useLanguage } from '../context/LanguageContext';
import { MonarchEmblem } from './BrandAssets';

interface CheckoutModalProps {
  course: Course;
  onClose: () => void;
  onSuccess: (course: Course) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ course, onClose, onSuccess }) => {
  const { currentUser, enrollInCourse } = useAuth();
  const { bankAccounts, validatePromoCode, submitCoursePayment } = useLmsData();
  const { t, language } = useLanguage();

  // Student info if not logged in
  const [guestName, setGuestName] = useState(currentUser?.fullName || '');
  const [guestPhone, setGuestPhone] = useState(currentUser?.phone || '');

  // Payment plan: 'full' | 'monthly' | 'installments'
  const [selectedPlan, setSelectedPlan] = useState<'full' | 'monthly' | 'installments'>('full');

  // Bank selection & slip
  const [selectedBankId, setSelectedBankId] = useState<string>(
    bankAccounts[0]?.id || 'bank-1'
  );
  const [slipReference, setSlipReference] = useState('');
  const [slipImageUploaded, setSlipImageUploaded] = useState(false);
  const [copiedBankId, setCopiedBankId] = useState<string | null>(null);

  // Promo code
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discountAmount: number;
    finalAmount: number;
    message: string;
  } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Determine base price based on selected plan
  const basePlanPrice =
    selectedPlan === 'full'
      ? course.priceLKR
      : selectedPlan === 'monthly'
      ? course.monthlyFeeLKR
      : course.installmentPriceLKR || Math.round(course.priceLKR / 2);

  const finalAmount = appliedPromo
    ? Math.max(0, basePlanPrice - appliedPromo.discountAmount)
    : basePlanPrice;

  const discountAmount = appliedPromo ? appliedPromo.discountAmount : 0;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError(null);

    if (!promoInput.trim()) {
      setPromoError(t('කරුණාකර ප්‍රමෝ කේතය ඇතුළත් කරන්න.', 'Please enter a promo code.'));
      return;
    }

    const validation = validatePromoCode(promoInput.trim(), basePlanPrice);
    if (validation.isValid) {
      setAppliedPromo({
        code: promoInput.trim().toUpperCase(),
        discountAmount: validation.discountAmount,
        finalAmount: validation.finalAmount,
        message: language === 'si' ? validation.messageSi : validation.messageEn,
      });
      setPromoError(null);
    } else {
      setAppliedPromo(null);
      setPromoError(language === 'si' ? validation.messageSi : validation.messageEn);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoInput('');
    setPromoError(null);
  };

  const handleCopyAcc = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedBankId(id);
    setTimeout(() => setCopiedBankId(null), 2000);
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const sName = currentUser?.fullName || guestName.trim();
    const sPhone = currentUser?.phone || guestPhone.trim();

    if (!sName) {
      setErrorMsg(t('කරුණාකර සිසුවාගේ සම්පූර්ණ නම ඇතුළත් කරන්න.', 'Please enter student full name.'));
      return;
    }

    if (!sPhone || sPhone.length < 9) {
      setErrorMsg(t('කරුණාකර වලංගු දුරකථන අංකයක් ඇතුළත් කරන්න.', 'Please enter a valid phone number.'));
      return;
    }

    if (!slipReference.trim()) {
      setErrorMsg(t('කරුණාකර බැංකු රිසිට්පත් අංකය (Slip Reference / Transaction ID) ඇතුළත් කරන්න.', 'Please enter bank slip reference number.'));
      return;
    }

    setIsProcessing(true);

    const selectedBank = bankAccounts.find((b) => b.id === selectedBankId);

    setTimeout(() => {
      // 1. Submit course payment request to LMS Data Context
      submitCoursePayment({
        studentId: currentUser?.id || `guest-${Date.now()}`,
        studentName: sName,
        studentPhone: sPhone,
        courseId: course.id,
        courseTitleSi: course.titleSi,
        courseTitleEn: course.titleEn,
        courseDuration: course.duration || '6 Months (මාස 6)',
        plan: selectedPlan,
        amount: finalAmount,
        promoCode: appliedPromo?.code,
        discountAmount: discountAmount,
        bankId: selectedBankId,
        bankName: selectedBank?.bankName || 'Direct Bank Transfer',
        slipReference: slipReference.trim(),
        slipImageUrl: slipImageUploaded
          ? 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&auto=format&fit=crop&q=80'
          : undefined,
      });

      setIsProcessing(false);
      setIsSubmitted(true);

      setTimeout(() => {
        onSuccess(course);
      }, 2200);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <MonarchEmblem size={44} withShadow={false} />
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                {t('පාඨමාලා ලියාපදිංචිය සහ ගෙවීම් කාඩ්පත (Cart)', 'Course Enrollment & Payment Cart')}
              </span>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-snug">
                {language === 'si' ? course.titleSi : course.titleEn}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {course.grade} · {language === 'si' ? course.instructorNameSi : course.instructorNameEn} · ⏱️ {course.duration || '6 Months'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Success Confirmation Screen */}
        {isSubmitted ? (
          <div className="py-10 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 animate-bounce">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h4 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {t('ගෙවීම් රිසිට්පත සාර්ථකව යොමු විය!', 'Payment Slip Submitted Successfully!')}
            </h4>
            <div className="max-w-md mx-auto rounded-2xl bg-amber-50 dark:bg-amber-950/40 p-4 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 space-y-1.5 text-left">
              <p className="font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>{t('පරිපාලක අනුමැතිය (Pending Approval Queue)', 'Awaiting Admin/Manager Approval')}</span>
              </p>
              <p className="opacity-90">
                {t(
                  'ඔබගේ ගෙවීම් රිසිට්පත් අංකය Super Admin / Manager වෙත යොමු කරන ලදී. එය තහවුරු කළ විගස පාඨමාලාව සක්‍රිය වී ඔබගේ ඩෑෂ්බෝඩ් එකට ස්වයංක්‍රීයව දැනුම්දීමක් (Notification) ලැබෙනු ඇත.',
                  'Your payment slip has been routed to the Super Admin & Manager verification queue. Once approved, course access will be activated with an automated notification sent to your dashboard.'
                )}
              </p>
              <div className="pt-2 text-[11px] font-mono text-slate-600 dark:text-slate-400">
                Ref: <strong>{slipReference}</strong> · Plan: <strong>{selectedPlan.toUpperCase()}</strong> · Amount: <strong>Rs. {finalAmount.toLocaleString()}</strong>
              </div>
            </div>
            <p className="text-xs text-slate-500 animate-pulse">
              {t('ඩෑෂ්බෝඩ් වෙත යොමු කෙරෙමින් පවතී...', 'Redirecting to your dashboard...')}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmitPayment} className="mt-5 space-y-5">
            
            {/* Error Message */}
            {errorMsg && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* 1. Student Identity Check (if guest) */}
            {!currentUser && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/20 p-4 space-y-3">
                <span className="text-xs font-bold text-amber-900 dark:text-amber-300 block">
                  {t('ශිෂ්‍ය විස්තර (Student Details)', 'Student Information')}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      {t('සම්පූර්ණ නම', 'Full Name')} *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="Student Name"
                        required
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 pl-9 pr-3 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      {t('දුරකථන අංකය', 'Phone Number')} *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="tel"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        placeholder="07XXXXXXXX"
                        required
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 pl-9 pr-3 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. PAYMENT PLAN SELECTOR (ෆුල් පේමන්ට් / මන්ත්ලි පේමන්ට් / කොටස් දෙකකට) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                {t('මුදල් ගෙවන ආකාරය තෝරන්න (Select Payment Plan)', 'Select Payment Option')} *
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                
                {/* Option 1: Full Payment */}
                <div
                  onClick={() => setSelectedPlan('full')}
                  className={`cursor-pointer rounded-2xl p-3.5 border transition-all text-left flex flex-col justify-between ${
                    selectedPlan === 'full'
                      ? 'border-amber-500 bg-amber-50/80 dark:bg-amber-950/40 ring-2 ring-amber-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-900 dark:text-white">
                      {t('සම්පූර්ණ පාඨමාලාව', 'Full Payment')}
                    </span>
                    <span className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                      selectedPlan === 'full' ? 'border-amber-500 bg-amber-500 text-slate-950' : 'border-slate-300'
                    }`}>
                      {selectedPlan === 'full' && <Check className="w-3 h-3 stroke-[3]" />}
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className="text-base font-black text-amber-600 dark:text-amber-400 block">
                      Rs. {course.priceLKR.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {course.duration || '6 Months'} Full Access
                    </span>
                  </div>
                </div>

                {/* Option 2: Monthly Payment */}
                <div
                  onClick={() => setSelectedPlan('monthly')}
                  className={`cursor-pointer rounded-2xl p-3.5 border transition-all text-left flex flex-col justify-between ${
                    selectedPlan === 'monthly'
                      ? 'border-amber-500 bg-amber-50/80 dark:bg-amber-950/40 ring-2 ring-amber-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-900 dark:text-white">
                      {t('මාසික ගාස්තුව', 'Monthly Plan')}
                    </span>
                    <span className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                      selectedPlan === 'monthly' ? 'border-amber-500 bg-amber-500 text-slate-950' : 'border-slate-300'
                    }`}>
                      {selectedPlan === 'monthly' && <Check className="w-3 h-3 stroke-[3]" />}
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className="text-base font-black text-amber-600 dark:text-amber-400 block">
                      Rs. {course.monthlyFeeLKR.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      30 Days Validity (මාසිකව)
                    </span>
                  </div>
                </div>

                {/* Option 3: 2 Installments */}
                <div
                  onClick={() => setSelectedPlan('installments')}
                  className={`cursor-pointer rounded-2xl p-3.5 border transition-all text-left flex flex-col justify-between ${
                    selectedPlan === 'installments'
                      ? 'border-amber-500 bg-amber-50/80 dark:bg-amber-950/40 ring-2 ring-amber-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-900 dark:text-white">
                      {t('කොටස් දෙකකට', '2 Installments')}
                    </span>
                    <span className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                      selectedPlan === 'installments' ? 'border-amber-500 bg-amber-500 text-slate-950' : 'border-slate-300'
                    }`}>
                      {selectedPlan === 'installments' && <Check className="w-3 h-3 stroke-[3]" />}
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className="text-base font-black text-amber-600 dark:text-amber-400 block">
                      Rs. {(course.installmentPriceLKR || Math.round(course.priceLKR / 2)).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      1st of 2 Installments
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* 3. Promo Code Section */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850/60 p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-amber-500" />
                  <span>{t('ඩිස්කවුන්ට් ප්‍රමෝ කෝඩ් (Promo Code)', 'Discount Promo Code')}</span>
                </span>
                {appliedPromo && (
                  <button
                    type="button"
                    onClick={handleRemovePromo}
                    className="text-[11px] font-semibold text-rose-500 hover:underline"
                  >
                    {t('ඉවත් කරන්න', 'Remove')}
                  </button>
                )}
              </div>

              {appliedPromo ? (
                <div className="flex items-center justify-between rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 p-2.5 text-xs text-emerald-800 dark:text-emerald-300">
                  <div>
                    <span className="font-mono font-bold tracking-wider">{appliedPromo.code}</span>
                    <span className="ml-2">({appliedPromo.message})</span>
                  </div>
                  <span className="font-bold">- Rs. {appliedPromo.discountAmount.toLocaleString()}</span>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="e.g. MONARCH50 or SCHOLAR1000"
                    className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white uppercase font-mono tracking-wider focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="cursor-pointer rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white px-3.5 py-2 text-xs font-bold transition"
                  >
                    {t('යොදන්න', 'Apply')}
                  </button>
                </div>
              )}

              {promoError && (
                <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                  {promoError}
                </p>
              )}
            </div>

            {/* 4. Bank Transfer Accounts & Details */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                {t('අපගේ බැංකු ගිණුම් විස්තර (Deposit to Campus Bank Account)', 'Campus Bank Accounts')}
              </label>

              <div className="space-y-2">
                {bankAccounts.filter((b) => b.isActive).map((bank) => (
                  <div
                    key={bank.id}
                    onClick={() => setSelectedBankId(bank.id)}
                    className={`cursor-pointer rounded-2xl border p-3 text-xs transition ${
                      selectedBankId === bank.id
                        ? 'border-amber-500 bg-amber-500/5 dark:bg-amber-950/20 ring-1 ring-amber-500'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {bank.bankName}
                      </span>
                      <span className="text-[11px] text-slate-500">{bank.branch}</span>
                    </div>

                    <div className="mt-2 flex items-center justify-between rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 font-mono">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {bank.accountNumber}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyAcc(bank.id, bank.accountNumber);
                        }}
                        className="text-[11px] text-amber-600 dark:text-amber-400 font-bold hover:underline flex items-center gap-1"
                      >
                        {copiedBankId === bank.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span>{t('පිටපත් විය', 'Copied')}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>{t('Copy', 'Copy')}</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="mt-1.5 text-[10px] text-slate-500">
                      Acc Holder: <strong>{bank.accountName}</strong>
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. Bank Receipt Slip Reference & Upload */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 p-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('බැංකු රිසිට්පත් අංකය (Slip Reference / Transaction ID)', 'Bank Slip Ref / Transaction ID')} *
                </label>
                <input
                  type="text"
                  value={slipReference}
                  onChange={(e) => setSlipReference(e.target.value)}
                  placeholder="e.g. BOC-TXN-9842104 or REF-771920"
                  required
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-mono tracking-wider focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Upload Receipt Simulator */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('රිසිට්පතේ ඡායාරූපය (Upload Slip Receipt - Optional)', 'Upload Slip Photo')}
                </label>
                <div
                  onClick={() => setSlipImageUploaded(!slipImageUploaded)}
                  className={`cursor-pointer rounded-xl border-2 border-dashed p-3 text-center transition ${
                    slipImageUploaded
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                      : 'border-slate-300 dark:border-slate-700 hover:border-amber-400'
                  }`}
                >
                  <UploadCloud className={`mx-auto h-6 w-6 ${slipImageUploaded ? 'text-emerald-500' : 'text-slate-400'}`} />
                  <p className="mt-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {slipImageUploaded
                      ? t('✓ රිසිට්පත සාර්ථකව තෝරාගන්නා ලදී (Slip Attached)', '✓ Slip Attached')
                      : t('රිසිට්පත Attach කිරීමට මෙතැන ක්ලික් කරන්න', 'Click to attach deposit slip / receipt')}
                  </p>
                </div>
              </div>
            </div>

            {/* 6. Price Summary Box & Final Action */}
            <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>{t('තෝරාගත් සැලැස්ම (Plan Fee):', 'Selected Plan Fee:')}</span>
                <span>Rs. {basePlanPrice.toLocaleString()}</span>
              </div>
              {appliedPromo && (
                <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>{t('ප්‍රමෝ කෝඩ් වට්ටම (Discount):', 'Promo Code Discount:')}</span>
                  <span>- Rs. {discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="border-t border-amber-500/20 pt-2 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {t('ගෙවිය යුතු මුළු මුදල (Total Payable):', 'Total Amount:')}
                </span>
                <span className="text-lg font-black text-amber-600 dark:text-amber-400">
                  Rs. {finalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="cursor-pointer w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 py-3.5 text-sm font-black text-slate-950 shadow-lg shadow-amber-500/25 transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {isProcessing ? (
                <span>{t('තහවුරු කරමින්...', 'Processing...')}</span>
              ) : (
                <>
                  <span>{t('ගෙවීම් රිසිට්පත යොමු කරන්න (Submit Payment)', 'Submit Bank Slip & Enroll')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>
        )}

      </div>
    </div>
  );
};
