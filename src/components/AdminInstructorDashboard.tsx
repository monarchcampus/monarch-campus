import React, { useState } from 'react';
import {
  Users,
  BookOpen,
  DollarSign,
  Video,
  Layers,
  Settings,
  Shield,
  Upload,
  Bell,
  CheckCircle,
  QrCode,
  Tag,
  Building2,
  Sparkles,
  Star,
  Trash2,
  Plus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useLmsData } from '../context/LmsDataContext';
import { AdminUsersTab } from './admin/AdminUsersTab';
import { AdminCoursesLessonsTab } from './admin/AdminCoursesLessonsTab';
import { AdminPaymentsPromoTab } from './admin/AdminPaymentsPromoTab';
import { AdminMarketingZoomTab } from './admin/AdminMarketingZoomTab';
import { MonarchHorizontalLogo, MonarchEmblem, LogoAssetUploaderModal } from './BrandAssets';
import { LecturerPortal } from './LecturerPortal';

interface AdminInstructorDashboardProps {
  onNavigate?: (view: any) => void;
}

type AdminTab = 'overview' | 'users' | 'courses' | 'payments' | 'marketing' | 'branding' | 'reviews';

export const AdminInstructorDashboard: React.FC<AdminInstructorDashboardProps> = ({ onNavigate }) => {
  const { currentUser, switchRole, users } = useAuth();
  const { t, language } = useLanguage();
  const {
    courses,
    bankAccounts,
    promoCodes,
    zoomClasses,
    siteConfig,
    updateSiteConfig,
    announcements,
    addAnnouncement,
    studentReviews,
    addStudentReview,
    deleteStudentReview,
  } = useLmsData();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);

  // Student Review Form States (Super Admin can customize name, rating, description, date, time, tag)
  const [newRevName, setNewRevName] = useState('');
  const [newRevRating, setNewRevRating] = useState<number>(5);
  const [newRevDesc, setNewRevDesc] = useState('');
  const [newRevDate, setNewRevDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [newRevTime, setNewRevTime] = useState('10:30 AM');
  const [newRevTag, setNewRevTag] = useState('2028 A/L Combined Maths');
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState(false);

  // Broadcast notice form
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticeSent, setNoticeSent] = useState(false);

  const role = currentUser?.role || 'superadmin';
  const isSuperAdmin = role === 'superadmin';

  const handleBroadcastNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim()) return;

    addAnnouncement({
      id: `ann-${Date.now()}`,
      titleEn: noticeTitle.trim(),
      titleSi: noticeTitle.trim(),
      contentEn: noticeContent.trim() || noticeTitle.trim(),
      contentSi: noticeContent.trim() || noticeTitle.trim(),
      date: new Date().toISOString().substring(0, 10),
      isUrgent: true,
      categoryEn: 'Notice',
      categorySi: 'නිවේදනය',
    });

    setNoticeSent(true);
    setTimeout(() => {
      setNoticeTitle('');
      setNoticeContent('');
      setNoticeSent(false);
    }, 2500);
  };

  // If current role is Instructor or Lecturer, render the streamlined Lecturer Portal
  if (role === 'instructor' || (role as string) === 'lecturer') {
    return <LecturerPortal onNavigate={onNavigate} />;
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      
      {/* Top Banner with Role indicator */}
      <div className="rounded-3xl border border-amber-300 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100/50 p-6 sm:p-8 dark:border-amber-900/60 dark:from-slate-900 dark:via-slate-850 dark:to-amber-950/40 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-black text-slate-950 uppercase tracking-widest shadow-sm">
                {isSuperAdmin ? '👑 SUPER ADMIN EXECUTIVE CONSOLE' : '💼 OPERATIONS MANAGER CONSOLE'}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {isSuperAdmin ? 'Chief Executive Authority' : 'Operations Management Authority'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {isSuperAdmin
                ? t('Super Admin ප්‍රධාන විධායක පාළක පැනලය', 'Super Admin Chief Executive Console')
                : t('LMS Manager මෙහෙයුම් කළමනාකරණ පුවරුව', 'LMS Operations Manager Portal')}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              {t('පිවිස සිටින්නේ:', 'Logged in as:')}{' '}
              <strong className="text-slate-900 dark:text-white">{currentUser?.fullName}</strong> ({currentUser?.phone})
            </p>

          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {isSuperAdmin ? 'Chief Executive Console' : 'Operations Management Console'}
            </span>
          </div>
        </div>

        {/* Tab Navigation Navigation Bar */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-amber-200/60 dark:border-amber-900/40 pt-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`cursor-pointer px-4 py-2 rounded-xl transition ${
              activeTab === 'overview'
                ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 font-black shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-800'
            }`}
          >
            {t('1. සාරාංශය (Overview)', '1. Overview')}
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`cursor-pointer px-4 py-2 rounded-xl transition ${
              activeTab === 'users'
                ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 font-black shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-800'
            }`}
          >
            {t('2. පරිශීලකයින් (Users & Roles)', '2. User Management')}
          </button>

          <button
            onClick={() => setActiveTab('courses')}
            className={`cursor-pointer px-4 py-2 rounded-xl transition ${
              activeTab === 'courses'
                ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 font-black shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-800'
            }`}
          >
            {t('3. කෝස් සහ පාඩම් (Courses & Lessons)', '3. Courses & Lessons')}
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`cursor-pointer px-4 py-2 rounded-xl transition ${
              activeTab === 'payments'
                ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 font-black shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-800'
            }`}
          >
            {t('4. ගෙවීම් & ප්‍රමෝ කෝඩ් (Banks & Promos)', '4. Payments & Promo Codes')}
          </button>

          <button
            onClick={() => setActiveTab('marketing')}
            className={`cursor-pointer px-4 py-2 rounded-xl transition ${
              activeTab === 'marketing'
                ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 font-black shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-800'
            }`}
          >
            {t('5. QR කෝඩ් & Zoom පන්ති (Marketing & Live)', '5. QR Codes & Zoom')}
          </button>

          {isSuperAdmin && (
            <>
              <button
                onClick={() => setActiveTab('branding')}
                className={`cursor-pointer px-4 py-2 rounded-xl transition ${
                  activeTab === 'branding'
                    ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 font-black shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-800'
                }`}
              >
                {t('6. ලෝගෝ & CMS (Branding & Titles)', '6. Branding & CMS')}
              </button>

              <button
                onClick={() => setActiveTab('reviews')}
                className={`cursor-pointer px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
                  activeTab === 'reviews'
                    ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 font-black shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-800'
                }`}
              >
                <Star className="w-3.5 h-3.5 text-amber-500" />
                <span>{t('7. ශිෂ්‍ය රිවිව්ස් (Student Reviews)', '7. Student Reviews')}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Total Users
                </span>
                <Users className="h-4 w-4 text-amber-500" />
              </div>
              <p className="mt-3 text-2xl font-black text-slate-900 dark:text-white font-mono">
                {users.length}
              </p>
              <span className="text-[11px] text-emerald-600 font-semibold">Active & verified</span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Active Courses
                </span>
                <BookOpen className="h-4 w-4 text-blue-500" />
              </div>
              <p className="mt-3 text-2xl font-black text-slate-900 dark:text-white font-mono">
                {courses.length}
              </p>
              <span className="text-[11px] text-slate-500">A/L, O/L & Professional</span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Active Promo Codes
                </span>
                <Tag className="h-4 w-4 text-purple-500" />
              </div>
              <p className="mt-3 text-2xl font-black text-slate-900 dark:text-white font-mono">
                {promoCodes.filter(p => p.isActive).length}
              </p>
              <span className="text-[11px] text-purple-600 font-semibold">Ready for checkout</span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Live Zoom Sessions
                </span>
                <Video className="h-4 w-4 text-emerald-500" />
              </div>
              <p className="mt-3 text-2xl font-black text-slate-900 dark:text-white font-mono">
                {zoomClasses.length}
              </p>
              <span className="text-[11px] text-emerald-600 font-semibold">Scheduled classes</span>
            </div>
          </div>

          {/* Quick Notice Broadcast and Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">
                  {t('වේදිකාවේ මෑත කාලීන පාඨමාලා', 'Monarch Platform Courses')}
                </h3>
                <div className="space-y-3">
                  {courses.map((course) => (
                    <div
                      key={course.id}
                      className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {language === 'si' ? course.titleSi : course.titleEn}
                        </span>
                        <span className="text-slate-500">
                          {course.grade} · {course.instructorNameSi} · {course.lessons.length} Lessons
                        </span>
                      </div>
                      <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                        LKR {course.priceLKR.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Bell className="w-5 h-5 text-amber-500" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {t('ශිෂ්‍ය නිවේදන නිකුත් කිරීම', 'Broadcast Notice to Students')}
                  </h3>
                </div>

                <form onSubmit={handleBroadcastNotice} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold mb-1">Notice Title (මාතෘකාව)</label>
                    <input
                      type="text"
                      required
                      value={noticeTitle}
                      onChange={(e) => setNoticeTitle(e.target.value)}
                      placeholder="e.g. විශේෂ සජීවී පන්තිය පැවැත්වෙන දිනය..."
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Notice Message (විස්තරය)</label>
                    <textarea
                      rows={3}
                      value={noticeContent}
                      onChange={(e) => setNoticeContent(e.target.value)}
                      placeholder="සිසුන් සඳහා වැදගත් උපදෙස්..."
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5"
                    />
                  </div>

                  {noticeSent && (
                    <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold">
                      ✓ Announcement published to all students!
                    </div>
                  )}

                  <button
                    type="submit"
                    className="cursor-pointer w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
                  >
                    Send Announcement (දැනුම්දීම යවන්න)
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USERS */}
      {activeTab === 'users' && <AdminUsersTab />}

      {/* TAB 3: COURSES & LESSONS */}
      {activeTab === 'courses' && <AdminCoursesLessonsTab />}

      {/* TAB 4: PAYMENTS & PROMO CODES */}
      {activeTab === 'payments' && <AdminPaymentsPromoTab />}

      {/* TAB 5: MARKETING, QR CODES & ZOOM */}
      {activeTab === 'marketing' && <AdminMarketingZoomTab />}

      {/* TAB 6: BRANDING & CMS (Super Admin Only) */}
      {activeTab === 'branding' && isSuperAdmin && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t('වෙබ් අඩවියේ ප්‍රධාන මාතෘකාව සහ පාඨමාලා බැනර් සැකසුම්', 'Campus Hero Title & Tagline CMS')}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">
                  Main Homepage Title (Home Page එකේ BEST CAMPUS FOR PROFESSIONAL COURSES IN SRI LANKA)
                </label>
                <input
                  type="text"
                  value={siteConfig.heroTitleEn}
                  onChange={(e) => updateSiteConfig({ heroTitleEn: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 font-bold text-amber-600"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  Sinhala Title (ශ්‍රී ලංකාවේ හොඳම කැම්පස් එක)
                </label>
                <input
                  type="text"
                  value={siteConfig.heroTitleSi}
                  onChange={(e) => updateSiteConfig({ heroTitleSi: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  Slogan (සිහිනය දකින්න · ඉගෙන ගන්න · ජයගන්න / Dream · Learn · Grow)
                </label>
                <input
                  type="text"
                  value={siteConfig.heroSloganEn}
                  onChange={(e) => updateSiteConfig({ heroSloganEn: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 font-serif italic"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsAssetModalOpen(true)}
                  className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
                >
                  <Upload className="w-4 h-4" />
                  <span>{t('ඔරිජිනල් PNG ලෝගෝ හා බැනරය Upload කරන්න (Super Admin Only)', 'Open Brand Logo & Banner Manager (Super Admin Only)')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: STUDENT REVIEWS MANAGEMENT (Super Admin Only) */}
      {activeTab === 'reviews' && isSuperAdmin && (
        <div className="space-y-6 animate-in fade-in">
          {/* Header */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">
                    {t('හෝම් පේජ් ශිෂ්‍ය රිවිව්ස් කළමනාකරණය (Student Reviews Manager)', 'Homepage Student Reviews Manager')}
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                  {t(
                    'Super Admin විසින් මෙහි එක් කරන හෝ සංස්කරණය කරන සියලුම ශිෂ්‍ය රිවිව්ස් හෝම් පේජ් එකෙහි (Home Page) එම මොහොතේම සජීවීව පෙන්වනු ලැබේ. සිසුවාගේ නම, තරු ගණන (1-5), විස්තරය, දිනය සහ වේලාව අවශ්‍ය පරිදි කස්ටමයිස් කළ හැක.',
                    'Manage verified student reviews displayed in real-time on the homepage. Fully customize name, 1-5 star rank, description, date, time, and stream tag.'
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs border border-amber-500/30">
                  {studentReviews.length} Active Reviews on Home
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Form to Add New Review (5 cols) */}
            <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <Plus className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t('+ නව ශිෂ්‍ය රිවිව් එකක් එක් කරන්න', '+ Add New Student Review')}
                </h3>
              </div>

              {reviewSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>✓ රිවිව් එක සාර්ථකව එක් විය! දැන් හෝම් පේජ් එකේ සජීවීව දිස්වේ.</span>
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newRevName.trim() || !newRevDesc.trim()) return;

                  addStudentReview({
                    studentName: newRevName.trim(),
                    rating: Number(newRevRating) || 5,
                    descriptionSi: newRevDesc.trim(),
                    descriptionEn: newRevDesc.trim(),
                    date: newRevDate || new Date().toISOString().substring(0, 10),
                    time: newRevTime || '10:00 AM',
                    tag: newRevTag.trim() || 'Monarch Campus Student',
                    isFeatured: true,
                  });

                  setNewRevName('');
                  setNewRevDesc('');
                  setReviewSuccessMsg(true);
                  setTimeout(() => setReviewSuccessMsg(false), 3000);
                }}
                className="space-y-3.5 text-xs"
              >
                {/* Student Name */}
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    {t('සිසුවාගේ නම (Student Name) *', 'Student Name *')}
                  </label>
                  <input
                    type="text"
                    required
                    value={newRevName}
                    onChange={(e) => setNewRevName(e.target.value)}
                    placeholder="e.g. කසුන් මලින්ද පෙරේරා (Kasun Perera)"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 font-bold text-slate-900 dark:text-white"
                  />
                </div>

                {/* Rating Stars (1 to 5) */}
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    {t('තරු මගින් රැන්ක් කිරීම (Star Rating 1 - 5) *', 'Star Rating (1 - 5) *')}
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setNewRevRating(star)}
                        className={`cursor-pointer text-xl p-1 transition ${
                          star <= newRevRating ? 'text-amber-400 scale-110' : 'text-slate-300 dark:text-slate-700'
                        }`}
                        title={`${star} Stars`}
                      >
                        ★
                      </button>
                    ))}
                    <span className="ml-2 font-mono font-bold text-amber-600 dark:text-amber-400">
                      {newRevRating}.0 Stars
                    </span>
                  </div>
                </div>

                {/* Stream / Tag */}
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    {t('විෂය ධාරාව / පාඨමාලා Tag එක (Course / Tag)', 'Course / Tag')}
                  </label>
                  <input
                    type="text"
                    value={newRevTag}
                    onChange={(e) => setNewRevTag(e.target.value)}
                    placeholder="e.g. 2028 A/L Combined Maths හෝ Grade 6"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5"
                  />
                </div>

                {/* Date & Time Customization */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                      {t('දිනය (Date)', 'Date')}
                    </label>
                    <input
                      type="date"
                      value={newRevDate}
                      onChange={(e) => setNewRevDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                      {t('වේලාව (Time)', 'Time')}
                    </label>
                    <input
                      type="text"
                      value={newRevTime}
                      onChange={(e) => setNewRevTime(e.target.value)}
                      placeholder="10:30 AM"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 font-mono"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    {t('රිවිව් විස්තරය (Review Description / Feedback) *', 'Review Description *')}
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={newRevDesc}
                    onChange={(e) => setNewRevDesc(e.target.value)}
                    placeholder="සිසුවා පාඨමාලාව හා කැම්පස් එක පිළිබඳව දැක්වූ අදහස මෙහි ඇතුළත් කරන්න..."
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5"
                  />
                </div>

                <button
                  type="submit"
                  className="cursor-pointer w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-md transition"
                >
                  {t('+ රිවිව් එක හෝම් පේජ් එකට ඇඩ් කරන්න', '+ Publish Review to Homepage')}
                </button>
              </form>
            </div>

            {/* List of Existing Reviews on Homepage (7 cols) */}
            <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t('හෝම් පේජ් එකේ සක්‍රිය රිවිව්ස් ලැයිස්තුව (Live on Homepage)', 'Active Reviews on Homepage')}
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  {studentReviews.length} total
                </span>
              </div>

              {studentReviews.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  තවමත් රිවිව්ස් ඇතුළත් කර නොමැත. වම්පස පෝරමයෙන් අලුත් රිවිව් එකක් එක් කරන්න.
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  {studentReviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2 hover:border-amber-400 transition"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900 dark:text-white">
                              {rev.studentName}
                            </span>
                            {rev.tag && (
                              <span className="rounded bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 px-2 py-0.5 text-[10px] font-bold">
                                {rev.tag}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex text-amber-500 text-xs">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <span key={s} className={s <= rev.rating ? 'text-amber-400' : 'text-slate-300'}>
                                  ★
                                </span>
                              ))}
                            </div>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {rev.date} · {rev.time}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            if (confirm(`"${rev.studentName}" ගේ රිවිව් එක හෝම් පේජ් එකෙන් ඉවත් කිරීමට අවශ්‍ය බව තහවුරු කරන්න?`)) {
                              deleteStudentReview(rev.id);
                            }
                          }}
                          className="cursor-pointer text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                          title="Delete Review"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                        "{rev.descriptionSi}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Brand Asset Uploader Modal */}
      <LogoAssetUploaderModal
        isOpen={isAssetModalOpen}
        onClose={() => setIsAssetModalOpen(false)}
      />

    </div>
  );
};
