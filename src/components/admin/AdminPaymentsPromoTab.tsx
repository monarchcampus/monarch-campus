import React, { useState } from 'react';
import {
  CreditCard,
  Building2,
  Tag,
  PlusCircle,
  Trash2,
  CheckCircle,
  XCircle,
  Copy,
  Check,
  AlertCircle,
  Calendar,
  ExternalLink,
  Eye,
  User,
  Clock,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { useLmsData } from '../../context/LmsDataContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { BankAccount, PromoCode, CoursePaymentSubmission } from '../../types';

export const AdminPaymentsPromoTab: React.FC = () => {
  const {
    bankAccounts,
    addBankAccount,
    deleteBankAccount,
    promoCodes,
    addPromoCode,
    deletePromoCode,
    paymentSubmissions,
    approvePaymentSubmission,
    rejectPaymentSubmission,
  } = useLmsData();
  const { currentUser, activateStudentEnrollment } = useAuth();
  const { t, language } = useLanguage();

  const [paymentFilter, setPaymentFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [rejectingSubId, setRejectingSubId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('බැංකු තැන්පතු අංකය පද්ධතියට නොගැලපේ (Invalid Slip Ref)');
  const [previewSlipImage, setPreviewSlipImage] = useState<string | null>(null);

  // Bank Form State
  const [showAddBankModal, setShowAddBankModal] = useState(false);
  const [bName, setBName] = useState('');
  const [bBranch, setBBranch] = useState('');
  const [bAccNo, setBAccNo] = useState('');
  const [bAccHolder, setBAccHolder] = useState('Monarch Campus (Pvt) Ltd');
  const [bInstSi, setBInstSi] = useState('මුදල් තැන්පත් කිරීමේදී ශිෂ්‍ය දුරකථන අංකය Remarks ලෙස යොදන්න.');

  // Promo Form State
  const [showAddPromoModal, setShowAddPromoModal] = useState(false);
  const [pCode, setPCode] = useState('');
  const [pType, setPType] = useState<'percentage' | 'fixed'>('percentage');
  const [pValue, setPValue] = useState('20');
  const [pDescSi, setPDescSi] = useState('විශේෂ වට්ටමක්');
  const [pExpiry, setPExpiry] = useState('2026-12-31');
  const [pMaxUsage, setPMaxUsage] = useState('500');

  const [copiedBankId, setCopiedBankId] = useState<string | null>(null);
  const [copiedPromoCode, setCopiedPromoCode] = useState<string | null>(null);

  const pendingList = paymentSubmissions.filter((p) => p.status === 'pending');
  const approvedList = paymentSubmissions.filter((p) => p.status === 'approved');
  const rejectedList = paymentSubmissions.filter((p) => p.status === 'rejected');

  const currentDisplayList =
    paymentFilter === 'pending'
      ? pendingList
      : paymentFilter === 'approved'
      ? approvedList
      : rejectedList;

  // Handle Accept Payment
  const handleApprove = (sub: CoursePaymentSubmission) => {
    const reviewerName = currentUser?.fullName || 'Super Admin';
    const approved = approvePaymentSubmission(sub.id, reviewerName);

    if (approved) {
      // Activate course enrollment in AuthContext
      activateStudentEnrollment(
        sub.studentId,
        sub.courseId,
        sub.plan,
        sub.courseDuration || '6 Months (මාස 6)',
        approved.accessExpiresAt
      );
    }
  };

  // Handle Reject Payment
  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingSubId) return;

    const reviewerName = currentUser?.fullName || 'Super Admin';
    rejectPaymentSubmission(rejectingSubId, rejectionReason, reviewerName);
    setRejectingSubId(null);
    setRejectionReason('බැංකු තැන්පතු අංකය පද්ධතියට නොගැලපේ (Invalid Slip Ref)');
  };

  const handleCreateBank = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bName.trim() || !bAccNo.trim()) return;

    addBankAccount({
      id: `bank-${Date.now()}`,
      bankName: bName.trim(),
      branch: bBranch.trim() || 'Colombo 03 Branch',
      accountNumber: bAccNo.trim(),
      accountName: bAccHolder.trim(),
      instructionsSi: bInstSi.trim(),
      instructionsEn: 'Please enter registered student phone number as payment reference.',
      isActive: true,
    });

    setShowAddBankModal(false);
    setBName('');
    setBAccNo('');
  };

  const handleCreatePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pCode.trim()) return;

    addPromoCode({
      id: `promo-${Date.now()}`,
      code: pCode.trim().toUpperCase(),
      discountType: pType,
      discountValue: Number(pValue) || 10,
      descriptionSi: pDescSi.trim(),
      descriptionEn: `${pValue}${pType === 'percentage' ? '%' : ' LKR'} Discount Code`,
      expiryDate: pExpiry,
      usageCount: 0,
      maxUsage: Number(pMaxUsage) || 100,
      isActive: true,
    });

    setShowAddPromoModal(false);
    setPCode('');
  };

  const handleCopy = (id: string, text: string, isPromo = false) => {
    navigator.clipboard?.writeText(text);
    if (isPromo) {
      setCopiedPromoCode(text);
      setTimeout(() => setCopiedPromoCode(null), 2000);
    } else {
      setCopiedBankId(id);
      setTimeout(() => setCopiedBankId(null), 2000);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* ========================================================
          1. DEDICATED PAYMENT ACCEPT / REJECT VERIFICATION SECTION
         ======================================================== */}
      <div className="rounded-3xl border border-amber-300 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 p-5 sm:p-6 shadow-sm space-y-4">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/80 dark:border-amber-900/40 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {t(
                  'පාඨමාලා ගෙවීම් හා රිසිට්පත් තහවුරු කිරීමේ පීඨය (Payment Approvals)',
                  'Course Payments & Bank Slip Approvals Center'
                )}
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              {t(
                'සිසුන් ඉදිරිපත් කළ බැංකු රිසිට්පත් අංක සහ ඡායාරූප පරීක්ෂා කර අනුමත (Accept) හෝ ප්‍රතික්ෂේප (Reject) කරන්න.',
                'Verify uploaded bank deposit slips and approve or reject course enrollments'
              )}
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto rounded-2xl bg-white dark:bg-slate-900 p-1 border border-amber-200 dark:border-amber-900/50 text-xs font-bold">
            <button
              onClick={() => setPaymentFilter('pending')}
              className={`cursor-pointer px-3 py-1.5 rounded-xl transition ${
                paymentFilter === 'pending'
                  ? 'bg-amber-500 text-slate-950 font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Pending ({pendingList.length})
            </button>
            <button
              onClick={() => setPaymentFilter('approved')}
              className={`cursor-pointer px-3 py-1.5 rounded-xl transition ${
                paymentFilter === 'approved'
                  ? 'bg-emerald-600 text-white font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Approved ({approvedList.length})
            </button>
            <button
              onClick={() => setPaymentFilter('rejected')}
              className={`cursor-pointer px-3 py-1.5 rounded-xl transition ${
                paymentFilter === 'rejected'
                  ? 'bg-rose-600 text-white font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Rejected ({rejectedList.length})
            </button>
          </div>
        </div>

        {/* Payment Submissions List */}
        {currentDisplayList.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 italic">
            {paymentFilter === 'pending'
              ? t('මෙම අවස්ථාවේ තහවුරු කිරීමට නව බැංකු රිසිට්පත් නොමැත.', 'No pending bank slip approvals at this moment.')
              : paymentFilter === 'approved'
              ? t('අනුමත කළ ගෙවීම් වාර්තා නොමැත.', 'No approved payment history yet.')
              : t('ප්‍රතික්ෂේප කළ ගෙවීම් නොමැත.', 'No rejected payment history.')}
          </div>
        ) : (
          <div className="space-y-3">
            {currentDisplayList.map((sub) => (
              <div
                key={sub.id}
                className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/40 text-xs shadow-xs"
              >
                {/* Student & Course Details */}
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {sub.studentName}
                    </span>
                    <span className="font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      {sub.studentPhone}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                      {sub.plan} plan
                    </span>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono">
                      ⏱️ {sub.courseDuration || '6 Months'}
                    </span>
                  </div>

                  <p className="font-bold text-amber-700 dark:text-amber-400">
                    {language === 'si' ? sub.courseTitleSi : sub.courseTitleEn}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                    <span>
                      Slip Reference:{' '}
                      <strong className="font-mono text-amber-600 dark:text-amber-400 text-xs">
                        {sub.slipReference}
                      </strong>
                    </span>
                    <span>• Bank: <strong>{sub.bankName || 'BOC / Commercial'}</strong></span>
                    <span>• Amount: <strong className="text-slate-900 dark:text-white">Rs. {sub.amount.toLocaleString()}</strong></span>
                    <span>• Submitted: <span className="font-mono">{sub.submittedAt}</span></span>
                  </div>

                  {sub.status === 'rejected' && (
                    <p className="text-rose-600 font-semibold text-[11px]">
                      Rejection Reason: {sub.rejectionReason}
                    </p>
                  )}

                  {sub.status === 'approved' && (
                    <p className="text-emerald-600 font-semibold text-[11px]">
                      ✓ Approved by {sub.reviewedBy} · Valid until: {sub.accessExpiresAt}
                    </p>
                  )}
                </div>

                {/* Slip Image & Action Buttons */}
                <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                  {sub.slipImageUrl && (
                    <button
                      onClick={() => setPreviewSlipImage(sub.slipImageUrl || null)}
                      className="cursor-pointer flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold text-slate-700 dark:text-slate-300 transition"
                      title="View Bank Slip Image"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{t('රිසිට්පත බලන්න', 'View Slip')}</span>
                    </button>
                  )}

                  {sub.status === 'pending' && (
                    <>
                      {/* Reject Button */}
                      <button
                        onClick={() => setRejectingSubId(sub.id)}
                        className="cursor-pointer flex items-center gap-1 px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 font-bold text-xs transition"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>{t('ප්‍රතික්ෂේප (Reject)', 'Reject')}</span>
                      </button>

                      {/* Accept Button */}
                      <button
                        onClick={() => handleApprove(sub)}
                        className="cursor-pointer flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition hover:scale-105 active:scale-95"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>{t('අනුමත කරන්න (Accept)', 'Accept & Activate')}</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* ========================================================
          2. OFFICIAL BANK ACCOUNTS MANAGEMENT
         ======================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t('බැංකු ගිණුම් විස්තර (Official Bank Accounts)', 'Official Bank Accounts')}
            </h3>
            <p className="text-xs text-slate-500">
              {t('සිසුන් ගෙවීම් කරන නිල බැංකු ගිණුම් කළමනාකරණය', 'Manage bank accounts shown in student checkout cart')}
            </p>
          </div>
          <button
            onClick={() => setShowAddBankModal(true)}
            className="cursor-pointer inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold text-xs shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{t('+ නව ගිණුමක්', '+ Add Bank')}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bankAccounts.map((b) => (
            <div
              key={b.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-xs space-y-2 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {b.bankName}
                </span>
                <button
                  onClick={() => deleteBankAccount(b.id)}
                  className="cursor-pointer text-slate-400 hover:text-rose-600 p-1"
                  title="Delete Bank Account"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-slate-500">{b.branch}</p>

              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-850 p-2.5 rounded-xl font-mono">
                <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                  {b.accountNumber}
                </span>
                <button
                  onClick={() => handleCopy(b.id, b.accountNumber)}
                  className="cursor-pointer text-[11px] text-amber-600 hover:underline flex items-center gap-1 font-bold"
                >
                  {copiedBankId === b.id ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-500" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-[11px] text-slate-500">
                Holder: <strong>{b.accountName}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================
          3. PROMO CODES MANAGEMENT
         ======================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t('ඩිස්කවුන්ට් ප්‍රමෝ කෝඩ් (Promo Codes)', 'Discount Promo Codes')}
            </h3>
            <p className="text-xs text-slate-500">
              {t('සිසුන් සඳහා වට්ටම් කේත නිර්මාණය හා කළමනාකරණය', 'Create coupon promo codes for student checkout')}
            </p>
          </div>
          <button
            onClick={() => setShowAddPromoModal(true)}
            className="cursor-pointer inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{t('+ නව ප්‍රමෝ කෝඩ් එකක්', '+ Add Promo Code')}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {promoCodes.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-xs space-y-2.5 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-black text-amber-600 dark:text-amber-400">
                  {p.code}
                </span>
                <button
                  onClick={() => deletePromoCode(p.id)}
                  className="cursor-pointer text-slate-400 hover:text-rose-600 p-1"
                  title="Delete Promo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-slate-900 dark:text-white">
                  {p.discountType === 'percentage' ? `${p.discountValue}%` : `Rs. ${p.discountValue}`}
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">
                  {p.discountType} discount
                </span>
              </div>

              <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                {language === 'si' ? p.descriptionSi : p.descriptionEn}
              </p>

              <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2">
                <span>Expires: {p.expiryDate}</span>
                <span>Used: {p.usageCount} / {p.maxUsage}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reject Reason Modal */}
      {rejectingSubId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-rose-600 flex items-center gap-1.5">
              <XCircle className="w-4 h-4" />
              <span>{t('ගෙවීම් රිසිට්පත ප්‍රතික්ෂේප කිරීම', 'Reject Payment Slip')}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {t('සිසුවාගේ ඩෑෂ්බෝඩ් එකට යවන ප්‍රතික්ෂේප කිරීමේ හේතුව තෝරන්න හෝ ඇතුළත් කරන්න.', 'Select or type reason to notify student:')}
            </p>

            <form onSubmit={handleConfirmReject} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  {t('ප්‍රතික්ෂේප කිරීමේ හේතුව (Rejection Reason)', 'Reason:')}
                </label>
                <select
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs"
                >
                  <option value="බැංකු තැන්පතු අංකය පද්ධතියට නොගැලපේ (Invalid Slip Ref)">
                    බැංකු තැන්පතු අංකය පද්ධතියට නොගැලපේ (Invalid Slip Ref)
                  </option>
                  <option value="අදාළ මුදල අපගේ බැංකු ගිණුමට තවමත් බැර වී නොමැත (Payment Not Received)">
                    අදාළ මුදල අපගේ බැංකු ගිණුමට තවමත් බැර වී නොමැත (Payment Not Received)
                  </option>
                  <option value="ගෙවා ඇති මුදල පාඨමාලා ගාස්තුවට වඩා අඩුය (Incorrect Amount Paid)">
                    ගෙවා ඇති මුදල පාඨමාලා ගාස්තුවට වඩා අඩුය (Incorrect Amount Paid)
                  </option>
                  <option value="රිසිට්පත් ඡායාරූපය අපැහැදිලියි, කරුණාකර පැහැදිලි ඡායාරූපයක් යොමු කරන්න (Blurry Slip)">
                    රිසිට්පත් ඡායාරූපය අපැහැදිලියි, කරුණාකර පැහැදිලි ඡායාරූපයක් යොමු කරන්න (Blurry Slip)
                  </option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingSubId(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-bold"
                >
                  {t('අවලංගු කරන්න', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
                >
                  {t('ප්‍රතික්ෂේප කර දැනුම් දෙන්න', 'Confirm & Notify')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Slip Image Preview Modal */}
      {previewSlipImage && (
        <div
          onClick={() => setPreviewSlipImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
        >
          <div className="relative max-w-lg w-full bg-white dark:bg-slate-900 rounded-3xl p-4 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {t('බැංකු තැන්පතු රිසිට්පත් පෙරදසුන', 'Bank Deposit Slip Receipt')}
              </span>
              <button onClick={() => setPreviewSlipImage(null)} className="p-1 text-slate-400">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-3 flex justify-center">
              <img
                src={previewSlipImage}
                alt="Deposit Slip"
                className="max-h-[70vh] rounded-2xl object-contain border"
              />
            </div>
          </div>
        </div>
      )}

      {/* Add Bank Account Modal */}
      {showAddBankModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t('නව බැංකු ගිණුමක් එක් කරන්න', 'Add New Bank Account')}
            </h3>
            <form onSubmit={handleCreateBank} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">{t('බැංකුවේ නම', 'Bank Name')}</label>
                <input
                  type="text"
                  value={bName}
                  onChange={(e) => setBName(e.target.value)}
                  placeholder="e.g. Commercial Bank of Ceylon"
                  required
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">{t('ශාඛාව', 'Branch')}</label>
                <input
                  type="text"
                  value={bBranch}
                  onChange={(e) => setBBranch(e.target.value)}
                  placeholder="Colombo 03 Branch"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">{t('ගිණුම් අංකය', 'Account Number')}</label>
                <input
                  type="text"
                  value={bAccNo}
                  onChange={(e) => setBAccNo(e.target.value)}
                  placeholder="1000 4829 1928"
                  required
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">{t('ගිණුම් හිමියාගේ නම', 'Account Holder')}</label>
                <input
                  type="text"
                  value={bAccHolder}
                  onChange={(e) => setBAccHolder(e.target.value)}
                  placeholder="Monarch Campus (Pvt) Ltd"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddBankModal(false)}
                  className="px-4 py-2 rounded-xl border font-bold"
                >
                  {t('අවලංගු කරන්න', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black"
                >
                  {t('ගිණුම සුරකින්න', 'Save Account')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Promo Modal */}
      {showAddPromoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t('නව ප්‍රමෝ කෝඩ් එකක් එක් කරන්න', 'Create New Promo Code')}
            </h3>
            <form onSubmit={handleCreatePromo} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">{t('කෝඩ් එක (Code)', 'Promo Code')}</label>
                <input
                  type="text"
                  value={pCode}
                  onChange={(e) => setPCode(e.target.value)}
                  placeholder="e.g. MONARCH50"
                  required
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 uppercase font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">{t('වර්ගය', 'Type')}</label>
                  <select
                    value={pType}
                    onChange={(e) => setPType(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (LKR)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">{t('වට්ටම', 'Discount Value')}</label>
                  <input
                    type="number"
                    value={pValue}
                    onChange={(e) => setPValue(e.target.value)}
                    placeholder="20"
                    required
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">{t('විස්තරය (Description)', 'Description')}</label>
                <input
                  type="text"
                  value={pDescSi}
                  onChange={(e) => setPDescSi(e.target.value)}
                  placeholder="පළමු වාරිකය සඳහා විශේෂ වට්ටමක්"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddPromoModal(false)}
                  className="px-4 py-2 rounded-xl border font-bold"
                >
                  {t('අවලංගු කරන්න', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black"
                >
                  {t('කෝඩ් එක සුරකින්න', 'Save Promo')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
