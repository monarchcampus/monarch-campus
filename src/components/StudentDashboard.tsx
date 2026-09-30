import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Bell,
  BookOpen,
  ShoppingBag,
  Video,
  FileQuestion,
  LogOut,
  Sun,
  Moon,
  Play,
  ArrowRight,
  Clock,
  User,
  Star,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  TrendingUp,
  Download,
  CreditCard,
  Menu,
  X,
  GraduationCap,
  Calendar,
  AlertTriangle,
  PlayCircle,
  Tag,
  Award,
  BarChart2,
  CheckCircle2,
  FileText,
  Search,
  Eye,
  Lock,
  Shield,
  Sparkles,
  Copy,
  ExternalLink,
  Radio,
  Timer,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLmsData } from '../context/LmsDataContext';
import { useLanguage } from '../context/LanguageContext';
import { Course, Announcement, OnlineExam, Assignment, ZoomClass } from '../types';
import { CourseViewerModal } from './CourseViewerModal';
import { CheckoutModal } from './CheckoutModal';
import { StudentOnlineExamModal } from './StudentOnlineExamModal';
import { SecurePdfModal } from './SecurePdfModal';
import { MonarchHorizontalLogo, MonarchEmblem } from './BrandAssets';

interface StudentDashboardProps {
  onNavigate: (view: 'home' | 'login' | 'register' | 'dashboard' | 'categories') => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate }) => {
  const { currentUser, logout, isEnrolled, getCourseAccessInfo, loginAsRole } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const {
    courses,
    announcements,
    paymentSubmissions,
    onlineExams,
    completedLessons,
    markLessonCompleted,
    assignments,
    zoomClasses,
  } = useLmsData();
  const { t, language } = useLanguage();

  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'live-classes' | 'assignments' | 'store' | 'announcements'>('overview');
  const [selectedCourseForViewing, setSelectedCourseForViewing] = useState<Course | null>(null);
  const [selectedCourseForBuying, setSelectedCourseForBuying] = useState<Course | null>(null);
  const [selectedExamForTaking, setSelectedExamForTaking] = useState<OnlineExam | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [storeCategoryFilter, setStoreCategoryFilter] = useState<string>('all');
  const [storeSearchQuery, setStoreSearchQuery] = useState('');

  // Live Zoom & Calendar states
  const [calendarCourseFilter, setCalendarCourseFilter] = useState<string>('all');
  const [calendarMonthOffset, setCalendarMonthOffset] = useState<number>(0);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(() => new Date().toISOString().substring(0, 10));
  const [copiedZoomId, setCopiedZoomId] = useState<string | null>(null);
  const [copiedInviteId, setCopiedInviteId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Helper to parse Zoom class start time
  const parseZoomStart = (dateStr: string, timeStr: string): Date | null => {
    try {
      const startTimePart = timeStr.split('-')[0].trim();
      const match = startTimePart.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!match) return new Date(`${dateStr}T19:00:00`);
      let [_, hStr, mStr, ampm] = match;
      let h = parseInt(hStr, 10);
      const m = parseInt(mStr, 10);
      if (ampm.toUpperCase() === 'PM' && h < 12) h += 12;
      if (ampm.toUpperCase() === 'AM' && h === 12) h = 0;
      return new Date(`${dateStr}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`);
    } catch {
      return null;
    }
  };

  // Helper for Course Visual Sticker, Theme & Colors for Multi-course differentiation
  const getCourseVisualSticker = (courseId: string, subject?: string) => {
    const s = (subject || '').toLowerCase();
    const c = courseId.toLowerCase();
    if (c.includes('maths') || s.includes('math') || s.includes('ගණිත')) {
      return {
        name: 'Combined Mathematics',
        sticker: '📐 සංයුක්ත ගණිතය (2028 A/L)',
        badge: '📐 2028 A/L Combined Maths',
        colorName: 'Amber Gold',
        chipClass: 'bg-amber-500 text-slate-950 font-black shadow-xs',
        badgeClass: 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-800',
        borderClass: 'border-amber-400 dark:border-amber-500',
        bgGlow: 'from-amber-500/15 via-orange-500/5 to-transparent',
        accentColor: '#f59e0b',
        icon: '📐',
      };
    }
    if (c.includes('physics') || s.includes('physics') || s.includes('භෞතික')) {
      return {
        name: 'Physics',
        sticker: '⚡ භෞතික විද්‍යාව (2027 A/L)',
        badge: '⚡ 2027 A/L Physics Mechanics',
        colorName: 'Cyan Electric Blue',
        chipClass: 'bg-sky-500 text-white font-black shadow-xs',
        badgeClass: 'bg-sky-100 text-sky-900 dark:bg-sky-950/80 dark:text-sky-300 border-sky-300 dark:border-sky-800',
        borderClass: 'border-sky-400 dark:border-sky-500',
        bgGlow: 'from-sky-500/15 via-blue-500/5 to-transparent',
        accentColor: '#0ea5e9',
        icon: '⚡',
      };
    }
    if (c.includes('ict') || s.includes('ict') || s.includes('tech') || s.includes('තොරතුරු')) {
      return {
        name: 'ICT & Applied AI',
        sticker: '💻 තොරතුරු තාක්ෂණය සහ AI (Pro ICT)',
        badge: '💻 Full-Stack & Applied AI',
        colorName: 'Emerald Green',
        chipClass: 'bg-emerald-500 text-slate-950 font-black shadow-xs',
        badgeClass: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
        borderClass: 'border-emerald-400 dark:border-emerald-500',
        bgGlow: 'from-emerald-500/15 via-teal-500/5 to-transparent',
        accentColor: '#10b981',
        icon: '💻',
      };
    }
    return {
      name: 'Academic Course',
      sticker: '🔬 සාමාන්‍ය පෙළ / වෘත්තීය පාඨමාලාව',
      badge: '🎓 Academic & Professional',
      colorName: 'Royal Purple',
      chipClass: 'bg-purple-600 text-white font-black shadow-xs',
      badgeClass: 'bg-purple-100 text-purple-900 dark:bg-purple-950/80 dark:text-purple-300 border-purple-300 dark:border-purple-800',
      borderClass: 'border-purple-400 dark:border-purple-500',
      bgGlow: 'from-purple-500/15 via-indigo-500/5 to-transparent',
      accentColor: '#a855f7',
      icon: '🎓',
    };
  };

  // Helper to format countdown timer (HH : MM : SS)
  const formatCountdown = (diffMs: number) => {
    if (diffMs <= 0) return { hours: 0, minutes: 0, seconds: 0, isLive: true, text: 'Live Now' };
    const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return {
      hours,
      minutes,
      seconds,
      isLive: false,
      text: `${String(hours).padStart(2, '0')}h : ${String(minutes).padStart(2, '0')}m : ${String(seconds).padStart(2, '0')}s`,
    };
  };

  // Check if student's payment is verified for this course
  const isStudentPaidForCourse = (courseId: string) => {
    const enrolled = isEnrolled(courseId);
    const isActiveUser = currentUser?.status === 'active' && currentUser?.paymentStatus === 'paid';
    const hasPendingSlip = paymentSubmissions.some(
      (p) => p.courseId === courseId && (p.studentPhone === currentUser?.phone || p.studentId === currentUser?.id) && p.status === 'pending'
    );
    return enrolled && isActiveUser && !hasPendingSlip;
  };

  // Assignment states for category filter and secure viewing
  const [selectedAssignmentForViewing, setSelectedAssignmentForViewing] = useState<Assignment | null>(null);
  const [assignmentCourseFilter, setAssignmentCourseFilter] = useState<string>('all');
  const [assignmentMonthFilter, setAssignmentMonthFilter] = useState<string>('all');
  const [assignmentSearchQuery, setAssignmentSearchQuery] = useState<string>('');

  const studentName = currentUser?.fullName || 'Student (සිසුවා)';

  // Enrolled courses vs Unenrolled available courses (dynamically using LMS context courses)
  const enrolledCourses = courses.filter((c) => isEnrolled(c.id));
  const availableCourses = courses.filter((c) => !isEnrolled(c.id));

  // Live Zoom Classes relevant to this student (enrolled courses)
  const studentZoomClasses = zoomClasses.filter(
    (z) =>
      currentUser?.enrolledCourseIds?.includes(z.courseId) ||
      enrolledCourses.some((c) => c.id === z.courseId)
  );

  // Helper for copying invitation
  const handleCopyZoomInvite = (z: ZoomClass) => {
    const course = courses.find((c) => c.id === z.courseId);
    const invite = `🎓 MONARCH CAMPUS - සජීවී ZOOM පන්තිය\n\n` +
      `📚 පාඨමාලාව: ${course?.titleSi || z.courseTitle}\n` +
      `📖 මාතෘකාව: ${z.topic}\n` +
      `📅 දිනය: ${z.date}\n` +
      `⏰ වේලාව: ${z.time}\n` +
      `🔗 Zoom Join Link: ${z.joinUrl}\n` +
      `🆔 Meeting ID: ${z.meetingId}\n` +
      `🔑 Passcode: ${z.passcode}\n\n` +
      `*Monarch Campus Live Virtual Classroom*`;
    navigator.clipboard?.writeText(invite);
    setCopiedInviteId(z.id);
    setTimeout(() => setCopiedInviteId(null), 2500);
  };

  // Helper for 24-hour upcoming live sessions
  const getNext24HourClasses = () => {
    const now = currentTime.getTime();
    return studentZoomClasses
      .map((z) => {
        const startDate = parseZoomStart(z.date, z.time);
        if (!startDate) return null;
        const startMs = startDate.getTime();
        const diffMs = startMs - now;
        // within next 24 hours (up to 24h into future) and not ended more than 3 hours ago
        const isWithin24h = diffMs <= 24 * 60 * 60 * 1000 && diffMs >= -3 * 60 * 60 * 1000;
        // within final 10 minutes or ongoing live
        const isLast10MinutesOrLive = diffMs <= 10 * 60 * 1000 && diffMs >= -3 * 60 * 60 * 1000;
        const countdown = formatCountdown(diffMs);
        const course = courses.find((c) => c.id === z.courseId);
        const visual = getCourseVisualSticker(z.courseId, course?.subjectEn || course?.subjectSi);
        const isPaid = isStudentPaidForCourse(z.courseId);

        return {
          ...z,
          course,
          visual,
          startDate,
          startMs,
          diffMs,
          isWithin24h,
          isLast10MinutesOrLive,
          countdown,
          isPaid,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null && item.isWithin24h)
      .sort((a, b) => a.startMs - b.startMs);
  };

  const next24HourClasses = getNext24HourClasses();

  // Filter available courses in Store
  const filteredAvailableCourses = availableCourses.filter((course) => {
    const matchesCat =
      storeCategoryFilter === 'all' ||
      course.grade.toLowerCase().includes(storeCategoryFilter.toLowerCase()) ||
      (storeCategoryFilter === 'pro' && course.grade.toLowerCase().includes('professional')) ||
      (storeCategoryFilter === 'ol' && (course.grade.includes('Grade') || course.grade.includes('O/L')));

    const q = storeSearchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      course.titleSi.toLowerCase().includes(q) ||
      course.titleEn.toLowerCase().includes(q) ||
      course.subjectSi.toLowerCase().includes(q) ||
      course.instructorNameSi.toLowerCase().includes(q);

    return matchesCat && matchesSearch;
  });

  // Check if current student has any pending or rejected payments
  const studentPendingPayments = paymentSubmissions.filter(
    (p) => p.status === 'pending' && (p.studentPhone === currentUser?.phone || p.studentId === currentUser?.id)
  );
  const studentRejectedPayments = paymentSubmissions.filter(
    (p) => p.status === 'rejected' && (p.studentPhone === currentUser?.phone || p.studentId === currentUser?.id)
  );

  // ---------------- AUTOMATIC 10-LEVEL CALCULATION ----------------
  // Total lessons in all enrolled courses
  const allEnrolledLessons = enrolledCourses.flatMap((c) => c.lessons);
  const totalEnrolledLessonsCount = allEnrolledLessons.length;
  const completedLessonsCount = allEnrolledLessons.filter((l) => !!completedLessons[l.id]).length;

  const lessonCompletionPercent = totalEnrolledLessonsCount > 0
    ? Math.round((completedLessonsCount / totalEnrolledLessonsCount) * 100)
    : 0;

  // Approximate time duration progress (calculated as healthy baseline or days active)
  const timeProgressPercent = Math.min(100, Math.max(10, Math.round(lessonCompletionPercent * 0.9 + 15)));

  // Overall student engagement composite score (0 - 100)
  const compositeScore = Math.round(lessonCompletionPercent * 0.7 + timeProgressPercent * 0.3);

  // Automatic Level: 1 to 10
  const studentLevel = Math.max(1, Math.min(10, Math.ceil(compositeScore / 10) || 1));

  // 10 Level Titles
  const levelNames: Record<number, { si: string; en: string }> = {
    1: { si: 'Level 1: ආධුනික ගවේෂක (Novice Explorer)', en: 'Level 1: Novice Explorer' },
    2: { si: 'Level 2: උද්යෝගිමත් ශිෂ්‍ය (Active Learner)', en: 'Level 2: Active Learner' },
    3: { si: 'Level 3: නිරන්තර අභ්‍යාසක (Consistent Scholar)', en: 'Level 3: Consistent Scholar' },
    4: { si: 'Level 4: දැනුම ගොඩනගන්නා (Knowledge Builder)', en: 'Level 4: Knowledge Builder' },
    5: { si: 'Level 5: මධ්‍යම විශිෂ්ටතා මට්ටම (Intermediate Pro)', en: 'Level 5: Intermediate Pro' },
    6: { si: 'Level 6: උසස් විභාග අපේක්ෂක (Advanced Candidate)', en: 'Level 6: Advanced Candidate' },
    7: { si: 'Level 7: ගැටළු නිරාකරණ ප්‍රවීණ (Master Problem Solver)', en: 'Level 7: Master Problem Solver' },
    8: { si: 'Level 8: ඉහළ ප්‍රතිඵලධාරී (High Achiever)', en: 'Level 8: High Achiever' },
    9: { si: 'Level 9: දිවයිනේ ප්‍රමුඛ පෙළ (Campus Top Ranker)', en: 'Level 9: Campus Top Ranker' },
    10: { si: 'Level 10: අග්‍රගන්‍ය විශිෂ්ටතා ශිෂ්‍ය (Elite Graduate)', en: 'Level 10: Elite Graduate' },
  };

  const currentLevelInfo = levelNames[studentLevel];

  // Helper to toggle lesson complete
  const handleToggleLessonComplete = (course: Course, lessonId: string, currentStatus: boolean, lessonTitleSi: string) => {
    markLessonCompleted(course.id, lessonId, !currentStatus, {
      studentId: currentUser?.id || 'student',
      studentName: currentUser?.fullName || 'Student',
      instructorPhone: course.instructorPhone,
      courseTitleSi: course.titleSi,
      lessonTitleSi,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors flex">
      
      {/* ---------------- Mobile Sidebar Overlay ---------------- */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden backdrop-blur-xs"
        />
      )}

      {/* ---------------- Left Sidebar ---------------- */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col justify-between border-r border-slate-200 bg-white p-5 transition-transform dark:border-slate-800 dark:bg-slate-900 lg:static lg:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Wordmark in Sidebar */}
          <div className="flex items-center justify-between pb-5 border-b border-slate-200 dark:border-slate-800">
            <button
              onClick={() => {
                setActiveTab('overview');
                setMobileSidebarOpen(false);
              }}
              className="text-left focus:outline-none cursor-pointer"
            >
              <MonarchHorizontalLogo scale={0.88} />
            </button>
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="mt-6 space-y-1.5 text-xs font-semibold">
            
            {/* 1. Dashboard / Overview */}
            <button
              onClick={() => {
                setActiveTab('overview');
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between rounded-xl px-3.5 py-3 transition cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className="h-4 w-4" />
                <span>{t('ප්‍රධාන පුවරුව (Overview)', 'Dashboard Overview')}</span>
              </div>
            </button>

            {/* 2. My Courses */}
            <button
              onClick={() => {
                setActiveTab('courses');
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between rounded-xl px-3.5 py-3 transition cursor-pointer ${
                activeTab === 'courses'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <BookOpen className="h-4 w-4" />
                <span>{t('මගේ පාඨමාලා (My Courses)', 'My Enrolled Courses')}</span>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-bold">
                {enrolledCourses.length}
              </span>
            </button>

            {/* 3. Live Zoom & Calendar (සජීවී Zoom & කැලැන්ඩරය) */}
            <button
              onClick={() => {
                setActiveTab('live-classes');
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between rounded-xl px-3.5 py-3 transition cursor-pointer ${
                activeTab === 'live-classes'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <Video className="h-4 w-4 text-blue-500" />
                <span>{t('සජීවී Zoom & කැලැන්ඩරය', 'Live Zoom & Calendar')}</span>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-ping" />
                {studentZoomClasses.length}
              </span>
            </button>

            {/* 4. Assignments & Marks (පැවරුම් සහ ලකුණු) */}
            <button
              onClick={() => {
                setActiveTab('assignments');
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between rounded-xl px-3.5 py-3 transition cursor-pointer ${
                activeTab === 'assignments'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4" />
                <span>{t('පැවරුම් & ලකුණු (Assignments)', 'Assignments & Marks')}</span>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-bold">
                {assignments.filter((a) => enrolledCourses.some((c) => c.id === a.courseId)).length}
              </span>
            </button>

            {/* 4. Available Courses / Store */}
            <button
              onClick={() => {
                setActiveTab('store');
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between rounded-xl px-3.5 py-3 transition cursor-pointer ${
                activeTab === 'store'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-4 w-4" />
                <span>{t('අලුත් පාඨමාලා (Available)', 'Available Courses')}</span>
              </div>
              <span className="rounded bg-amber-100 dark:bg-amber-950 px-1.5 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-300">
                {availableCourses.length} New
              </span>
            </button>

            {/* 4. Announcements */}
            <button
              onClick={() => {
                setActiveTab('announcements');
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between rounded-xl px-3.5 py-3 transition cursor-pointer ${
                activeTab === 'announcements'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <Bell className="h-4 w-4" />
                <span>{t('නිවේදන (Announcements)', 'Announcements')}</span>
              </div>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                {announcements.length}
              </span>
            </button>

            {/* Learning Resources */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <span className="block px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                {t('ඉගෙනුම් සම්පත් (Study Center)', 'Learning Center')}
              </span>

              <button
                onClick={() => onNavigate('categories')}
                className="w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
              >
                <GraduationCap className="h-4 w-4 text-amber-500" />
                <span>{t('පාඨමාලා වර්ග (Categories)', 'Course Catalog')}</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Sidebar Footer: Student Profile & Logout */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/30">
              {studentName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {studentName}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {currentUser?.phone} · Level {studentLevel}
              </p>
            </div>
            <button
              onClick={logout}
              title="Logout (ඉවත්වන්න)"
              className="cursor-pointer p-1.5 text-slate-400 hover:text-rose-600 transition"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ---------------- Main Content Area ---------------- */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-8 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Greeting Header */}
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{t('ආයුබෝවන්', 'Hi')}, {studentName} 👋</span>
                <span className="rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[10px] font-mono px-2 py-0.5">
                  L{studentLevel} STUDENT
                </span>
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                {language === 'si' ? currentLevelInfo.si : currentLevelInfo.en}
              </p>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            
            {/* Quick Level Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-amber-600 dark:text-amber-400">
              <Award className="w-4 h-4" />
              <span>Level {studentLevel} / 10</span>
            </div>

            {/* Notifications Button with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                aria-label="View notifications"
                className="cursor-pointer relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                <Bell className="h-4 w-4" />
                {announcements.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white animate-pulse">
                    {announcements.length}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      {t('දැනුම්දීම් සහ නිවේදන', 'Notifications & Notices')}
                    </span>
                    <button
                      onClick={() => setNotificationsOpen(false)}
                      className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                  <div className="mt-3 space-y-2 max-h-72 overflow-y-auto">
                    {announcements.map((ann) => (
                      <div
                        key={ann.id}
                        className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-xs dark:border-slate-800 dark:bg-slate-800/60"
                      >
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {language === 'si' ? ann.titleSi : ann.titleEn}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          {language === 'si' ? ann.contentSi : ann.contentEn}
                        </p>
                        <span className="mt-1 block text-[10px] text-amber-600 dark:text-amber-400">
                          {ann.date}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Day / Night Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="cursor-pointer flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-amber-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-amber-400 transition"
              title="Theme Toggle"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </header>

        {/* ---------------- Tab Navigation Indicator ---------------- */}
        <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 sm:px-8">
          <div className="flex gap-4 sm:gap-8 overflow-x-auto text-xs font-bold scrollbar-none">
            <button
              onClick={() => setActiveTab('overview')}
              className={`cursor-pointer py-3.5 border-b-2 flex items-center gap-2 transition ${
                activeTab === 'overview'
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>{t('ප්‍රධාන පුවරුව (Overview)', 'Dashboard Overview')}</span>
            </button>

            <button
              onClick={() => setActiveTab('courses')}
              className={`cursor-pointer py-3.5 border-b-2 flex items-center gap-2 transition ${
                activeTab === 'courses'
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>{t('මගේ පාඨමාලා (My Enrolled Courses)', 'My Courses')}</span>
              <span className="px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px]">
                {enrolledCourses.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('store')}
              className={`cursor-pointer py-3.5 border-b-2 flex items-center gap-2 transition ${
                activeTab === 'store'
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{t('අලුත් පාඨමාලා (Available Courses)', 'Available Courses')}</span>
              <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px]">
                {availableCourses.length} New
              </span>
            </button>

            <button
              onClick={() => setActiveTab('announcements')}
              className={`cursor-pointer py-3.5 border-b-2 flex items-center gap-2 transition ${
                activeTab === 'announcements'
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>{t('නිවේදන (Announcements)', 'Announcements')}</span>
              <span className="px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-500 text-[10px]">
                {announcements.length}
              </span>
            </button>
          </div>
        </div>

        {/* ---------------- Main Content Workspace ---------------- */}
        <div className="flex-1 p-4 sm:p-8 space-y-8 max-w-7xl mx-auto w-full">
          
          {/* Top Quick Status & Statistics Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 block">
                {t('වත්මන් ශිෂ්‍ය මට්ටම', 'Student Level')}
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
                  Level {studentLevel}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">/ 10</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 block">
                {t('මගේ සක්‍රිය පාඨමාලා', 'Enrolled Courses')}
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {enrolledCourses.length}
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                  ✓ Active Access
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 block">
                {t('නව පාඨමාලා (New)', 'Available Courses')}
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                  {availableCourses.length}
                </span>
                <span className="text-[10px] text-slate-400">In Campus</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 block">
                {t('නැරඹූ පාඩම් ප්‍රමාණය', 'Completed Lessons')}
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {completedLessonsCount}
                </span>
                <span className="text-[10px] text-slate-400">/ {totalEnrolledLessonsCount}</span>
              </div>
            </div>

          </div>

          {/* Pending Slip Verification Alert */}
          {studentPendingPayments.length > 0 && (
            <div className="rounded-2xl border border-amber-300 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/40 p-4 text-xs space-y-2">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold">
                <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                <span>
                  {t(
                    'තහවුරු වීමට ඇති බැංකු රිසිට්පත් (Pending Payment Verification)',
                    'Pending Bank Slip Approvals'
                  )}
                </span>
              </div>
              <p className="text-amber-800 dark:text-amber-300/90 leading-relaxed">
                {t(
                  'ඔබ විසින් ඉදිරිපත් කළ පහත පාඨමාලා ගෙවීම් රිසිට්පත් Super Admin / Manager විසින් තහවුරු කරමින් පවතී. අනුමත වූ වහාම ඔබට පාඩම් නැරඹීමට අවස්ථාව හිමි වේ.',
                  'Your payment slip is being reviewed by the administration. Course access will automatically be activated once approved.'
                )}
              </p>
              <div className="space-y-1.5 pt-1">
                {studentPendingPayments.map((p) => (
                  <div key={p.id} className="rounded-xl bg-white dark:bg-slate-900 p-2.5 flex items-center justify-between border border-amber-200 dark:border-amber-900/40">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">{p.courseTitleSi}</span>
                      <span className="text-slate-500 ml-2 font-mono text-[11px]">Slip Ref: {p.slipReference}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                      Pending Approval
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rejected Slip Notice */}
          {studentRejectedPayments.length > 0 && (
            <div className="rounded-2xl border border-rose-300 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 p-4 text-xs space-y-2">
              <div className="flex items-center gap-2 text-rose-900 dark:text-rose-200 font-bold">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>{t('ගෙවීම් රිසිට්පත ප්‍රතික්ෂේප විය (Payment Slip Rejected)', 'Payment Slip Rejected')}</span>
              </div>
              {studentRejectedPayments.map((p) => (
                <div key={p.id} className="rounded-xl bg-white dark:bg-slate-900 p-2.5 flex items-center justify-between border border-rose-200 dark:border-rose-900/40">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">{p.courseTitleSi}</span>
                    <p className="text-rose-600 dark:text-rose-400 mt-0.5 text-[11px]">
                      {t('හේතුව:', 'Reason:')} {p.rejectionReason || 'Invalid slip'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const c = courses.find((crs) => crs.id === p.courseId);
                      if (c) setSelectedCourseForBuying(c);
                    }}
                    className="cursor-pointer px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
                  >
                    {t('යළි රිසිට්පත එවන්න', 'Re-submit')}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {/* ========================================================================= */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in">
              {/* Quick Switch Banner to Lecturer Portal for easy reviewer testing */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 border border-amber-300 dark:border-amber-900/60 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-bold shadow-xs">
                    🎓
                  </span>
                  <div>
                    <span className="block text-xs font-black text-slate-900 dark:text-white">
                      {t('ආචාර්ය කළමනාකරණ පුවරුව (Lecturer Portal)', 'Lecturer Academic Console')}
                    </span>
                    <span className="text-[11px] text-slate-600 dark:text-slate-400">
                      {t('ලෙක්චරර් ලෙස Zoom පන්ති කාලසටහන්ගත කිරීමට සහ විභාග මෙහෙයවීමට පිවිසෙන්න', 'Switch to Lecturer console to schedule Zoom sessions & manage courses')}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    loginAsRole('lecturer');
                    onNavigate('dashboard');
                  }}
                  className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 text-xs font-black hover:opacity-90 shadow-sm transition"
                >
                  <span>{t('ආචාර්ය Console එකට පිවිසෙන්න ➔', 'Open Lecturer Portal ➔')}</span>
                </button>
              </div>

              {/* ---------------- 24-HOUR LIVE ZOOM CLASSES SECTION ---------------- */}
              {next24HourClasses.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-3 w-3 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                      </span>
                      <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{t('පැය 24ක් තුළ සජීවී Zoom පන්ති (Classes Within Next 24 Hours)', 'Live Zoom Classes (Next 24 Hours)')}</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white font-mono text-xs font-bold shadow-xs">
                          {next24HourClasses.length} Live Alert
                        </span>
                      </h3>
                    </div>

                    <button
                      onClick={() => setActiveTab('live-classes')}
                      className="cursor-pointer text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                    >
                      <span>{t('සම්පූර්ණ කැලැන්ඩරය බලන්න', 'View Full Calendar')}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {next24HourClasses.map((item) => {
                      const isZoomCopied = copiedZoomId === item.id;
                      const isInviteCopied = copiedInviteId === item.id;

                      return (
                        <div
                          key={item.id}
                          className={`relative overflow-hidden rounded-3xl border-2 ${item.visual.borderClass} bg-gradient-to-br ${item.visual.bgGlow} via-white to-white dark:via-slate-900 dark:to-slate-900 p-6 shadow-md transition space-y-4`}
                        >
                          {/* Top Row: Course Sticker & Countdown Badge */}
                          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800 pb-4">
                            <div className="flex flex-wrap items-center gap-2">
                              {/* Unique Course Sticker */}
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black shadow-xs ${item.visual.chipClass}`}>
                                <span>{item.visual.icon}</span>
                                <span>{item.visual.sticker}</span>
                              </span>

                              {/* Course Category & Lesson Number */}
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-900 text-white dark:bg-slate-800 text-xs font-bold shadow-xs">
                                <span>{item.category ? `[${item.category}]` : '[සිද්ධාන්ත]'}</span>
                                <span>•</span>
                                <span className="font-mono text-amber-400">ලෙසන්ස් අංක {String(item.lessonNumber || 1).padStart(2, '0')}</span>
                              </span>
                            </div>

                            {/* 24-Hour Countdown Clock */}
                            <div className="flex items-center gap-2">
                              {item.countdown.isLive ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-red-600 text-white font-black text-xs animate-pulse shadow-sm">
                                  <Radio className="w-4 h-4" />
                                  <span>🔴 LIVE NOW (දැන් පැවැත්වේ)</span>
                                </span>
                              ) : (
                                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 text-amber-400 dark:bg-black dark:text-amber-300 font-mono text-xs font-black border border-amber-500/40 shadow-xs">
                                  <Timer className="w-4 h-4 animate-spin text-amber-500" />
                                  <span>{t('ආරම්භ වීමට තව:', 'Countdown:')}</span>
                                  <span className="tracking-widest">{item.countdown.text}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Middle: Topic, Date, Lecturer */}
                          <div className="space-y-2">
                            <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug">
                              {item.topic}
                            </h4>
                            {item.description && (
                              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                {item.description}
                              </p>
                            )}

                            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-300 pt-1 font-semibold">
                              <span className="inline-flex items-center gap-1.5 font-mono">
                                📅 <strong>{item.date}</strong>
                              </span>
                              <span>•</span>
                              <span className="inline-flex items-center gap-1.5 font-mono text-amber-600 dark:text-amber-400 font-bold">
                                ⏰ {item.time}
                              </span>
                              <span>•</span>
                              <span className="inline-flex items-center gap-1">
                                🎓 {item.instructorName}
                              </span>
                            </div>
                          </div>

                          {/* Payment Verification Status & Zoom Access Control */}
                          <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800">
                            {item.isPaid ? (
                              <div className="space-y-3">
                                {/* Verified badge */}
                                <div className="flex items-center justify-between text-xs font-bold">
                                  <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>{t('✓ ගෙවීම් පරීක්ෂාව සම්පූර්ණයි (Payment Verified) — සහභාගී වීමට අවසර ඇත', 'Payment Verified — Access Granted')}</span>
                                  </span>
                                  {item.isLast10MinutesOrLive ? (
                                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                                      🔓 Zoom Access Unlocked
                                    </span>
                                  ) : (
                                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold">
                                      🔒 Unlocks in Last 10 Minutes
                                    </span>
                                  )}
                                </div>

                                {/* UNLOCKED ZOOM CREDENTIALS (Last 10 minutes or Live) */}
                                {item.isLast10MinutesOrLive ? (
                                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border-2 border-emerald-400 dark:border-emerald-500 shadow-md space-y-3 animate-in fade-in">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                      <div>
                                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 block uppercase tracking-wider">
                                          {item.countdown.isLive ? '🔴 පන්තිය දැන් සජීවීව ක්‍රියාත්මකයි' : '🟢 අවසන් විනාඩි 10 තුළ Zoom දත්ත අගුළු හරින ලදී:'}
                                        </span>
                                        <p className="text-[11px] text-slate-500">
                                          පහත Join Link හෝ Meeting ID & Passcode මගින් පන්තියට ක්ෂණිකව සහභාගී වන්න.
                                        </p>
                                      </div>

                                      <a
                                        href={item.joinUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="cursor-pointer inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-600 text-white font-black text-xs sm:text-sm shadow-lg shadow-blue-500/30 transition hover:scale-105 active:scale-95"
                                      >
                                        <ExternalLink className="w-4 h-4" />
                                        <span>Zoom වෙත සජීවීව එක්වන්න (Join Live)</span>
                                      </a>
                                    </div>

                                    {/* Meeting ID & Password Bar */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between font-mono text-xs">
                                        <div>
                                          <span className="text-[10px] text-slate-400 block uppercase font-sans font-bold">Zoom Meeting ID:</span>
                                          <span className="text-sm font-black text-slate-900 dark:text-white tracking-wider">{item.meetingId}</span>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            navigator.clipboard?.writeText(item.meetingId);
                                            setCopiedZoomId(item.id);
                                            setTimeout(() => setCopiedZoomId(null), 2500);
                                          }}
                                          className="cursor-pointer px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-100 flex items-center gap-1"
                                        >
                                          <Copy className="w-3 h-3" />
                                          <span>{isZoomCopied ? 'Copied!' : 'Copy ID'}</span>
                                        </button>
                                      </div>

                                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between font-mono text-xs">
                                        <div>
                                          <span className="text-[10px] text-slate-400 block uppercase font-sans font-bold">Zoom Passcode:</span>
                                          <span className="text-sm font-black text-amber-600 dark:text-amber-400 tracking-wider">{item.passcode}</span>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            navigator.clipboard?.writeText(item.passcode);
                                            setCopiedZoomId(`pass-${item.id}`);
                                            setTimeout(() => setCopiedZoomId(null), 2500);
                                          }}
                                          className="cursor-pointer px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-100 flex items-center gap-1"
                                        >
                                          <Copy className="w-3 h-3" />
                                          <span>{copiedZoomId === `pass-${item.id}` ? 'Copied!' : 'Copy PIN'}</span>
                                        </button>
                                      </div>
                                    </div>

                                    {/* Action Links */}
                                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                                      {item.whatsAppGroupLink && (
                                        <a
                                          href={item.whatsAppGroupLink}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1"
                                        >
                                          <span>💬 WhatsApp පන්ති සමූහයට එක්වන්න</span>
                                          <ExternalLink className="w-3 h-3" />
                                        </a>
                                      )}

                                      <button
                                        type="button"
                                        onClick={() => handleCopyZoomInvite(item)}
                                        className="cursor-pointer text-slate-600 dark:text-slate-400 hover:text-slate-900 font-bold flex items-center gap-1"
                                      >
                                        <Copy className="w-3 h-3" />
                                        <span>{isInviteCopied ? 'ආරාධනය Copy විය!' : 'පන්ති විස්තර Copy කරන්න'}</span>
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  /* MORE THAN 10 MINUTES REMAINING NOTICE */
                                  <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                    <div className="flex items-center gap-2.5 text-amber-900 dark:text-amber-200">
                                      <Lock className="w-4 h-4 shrink-0 text-amber-600" />
                                      <span>
                                        {t(
                                          '🔒 සජීවී පන්තියට පිවිසීමේ Zoom Link සහ Meeting ID පන්තිය ආරම්භ වීමට නියමිත අවසන් විනාඩි 10 තුළදී මෙහි ස්වයංක්‍රීයව අගුළු හැරේ.',
                                          '🔒 Zoom Join link & Meeting credentials will automatically unlock during the final 10 minutes before session start.'
                                        )}
                                      </span>
                                    </div>

                                    <div className="text-right shrink-0">
                                      <span className="font-mono font-black text-amber-700 dark:text-amber-300 bg-amber-200/60 dark:bg-amber-900/50 px-3 py-1 rounded-xl">
                                        ⏱️ {item.countdown.text}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              /* PAYMENT PENDING / UNPAID WARNING */
                              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                <div>
                                  <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-300 font-bold">
                                    <AlertTriangle className="w-4 h-4 shrink-0" />
                                    <span>{t('⚠️ ගෙවීම් පරීක්ෂාව තවමත් සිදුවෙමින් පවතී (Payment Pending) හෝ ගෙවීම අවසන් කර නොමැත.', 'Payment Verification Pending or Incomplete.')}</span>
                                  </div>
                                  <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5">
                                    {t(
                                      'මෙම සජීවී Zoom පන්තියට සහභාගී වීමට අවශ්‍ය සූම් Join Link සහ Credentials ලබාගැනීමට කරුණාකර ඔබගේ බැංකු ගෙවීම සම්පූර්ණ කරන්න.',
                                      'Please complete course payment and upload bank slip to unlock live Zoom access.'
                                    )}
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    if (item.course) setSelectedCourseForBuying(item.course);
                                  }}
                                  className="cursor-pointer shrink-0 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-sm flex items-center justify-center gap-1.5"
                                >
                                  <CreditCard className="w-3.5 h-3.5" />
                                  <span>{t('ගෙවීම් සම්පූර්ණ කරන්න', 'Complete Payment')}</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 10-LEVEL PROGRESS & METRICS SHOWCASE */}
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-amber-500" />
                      <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                        {t('ශිෂ්‍ය ප්‍රගති මට්ටම (10-Level Progress System)', '10-Level Student Progress System')}
                      </h2>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {t(
                        'නැරඹූ වීඩියෝ පාඩම් ප්‍රමාණය සහ කෝස් එකේ මුළු කාල සීමාව ගළපමින් මෙම ලෙවල් පාලනය ස්වයංක්‍රීයව සිදු වේ.',
                        'Automatically calculated across lessons completed, time elapsed, and curriculum milestones.'
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 self-start sm:self-auto">
                    <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 px-4 py-2 text-right">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                        Current Rank
                      </span>
                      <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                        {language === 'si' ? currentLevelInfo.si : currentLevelInfo.en}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 10 Stepped Level Bar */}
                <div className="space-y-2">
                  <div className="grid grid-cols-10 gap-1.5 sm:gap-2">
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((lvl) => {
                      const isReached = lvl <= studentLevel;
                      const isCurrent = lvl === studentLevel;

                      return (
                        <div
                          key={lvl}
                          className={`rounded-xl p-2 text-center transition-all ${
                            isCurrent
                              ? 'bg-amber-500 text-slate-950 font-black shadow-md ring-2 ring-amber-300 scale-105'
                              : isReached
                              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                          }`}
                          title={`Level ${lvl}: ${levelNames[lvl].en}`}
                        >
                          <span className="block text-[10px] font-mono leading-none">L{lvl}</span>
                          <span className="hidden sm:block text-[9px] mt-1 font-bold truncate">
                            {isReached ? '✓' : `L${lvl}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 mt-3">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-500 transition-all duration-500"
                      style={{ width: `${compositeScore}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold pt-1">
                    <span>{t('ආරම්භය (Level 1)', 'Starting Level 1')}</span>
                    <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">
                      {compositeScore}% {t('සම්පූර්ණයි', 'Achieved')}
                    </span>
                    <span>{t('විශිෂ්ටතා මට්ටම (Level 10)', 'Mastery Level 10')}</span>
                  </div>
                </div>

                {/* Analytical Charts and Percentages */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="rounded-2xl bg-slate-50 dark:bg-slate-850 p-4 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {t('පාඩම් සම්පූර්ණත්වය', 'Lessons Completed')}
                      </span>
                      <span className="font-mono font-bold text-emerald-600">{lessonCompletionPercent}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${lessonCompletionPercent}%` }} />
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-2">
                      {completedLessonsCount} of {totalEnrolledLessonsCount} lessons watched
                    </span>
                  </div>

                  <div className="rounded-2xl bg-slate-50 dark:bg-slate-850 p-4 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {t('කාල සීමා අනුපාතය', 'Time Engagement')}
                      </span>
                      <span className="font-mono font-bold text-blue-600">{timeProgressPercent}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${timeProgressPercent}%` }} />
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-2">
                      Healthy pacing across course validity
                    </span>
                  </div>

                  <div className="rounded-2xl bg-slate-50 dark:bg-slate-850 p-4 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {t('සමස්ත විභාග සූදානම', 'Exam Readiness')}
                      </span>
                      <span className="font-mono font-bold text-amber-600">{Math.round((studentLevel / 10) * 100)}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(studentLevel / 10) * 100}%` }} />
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-2">
                      Targeting A-Pass standard
                    </span>
                  </div>
                </div>

              </div>

              {/* QUICK ACCESS: MY ENROLLED COURSES */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-amber-500" />
                    <span>{t('මගේ සක්‍රිය පාඨමාලා (Active Courses)', 'My Active Courses')}</span>
                    <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                      {enrolledCourses.length}
                    </span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('courses')}
                    className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>{t('සියලු පාඨමාලා බලන්න', 'View All Courses')}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {enrolledCourses.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-8 text-center bg-white dark:bg-slate-900">
                    <BookOpen className="mx-auto h-12 w-12 text-slate-400" />
                    <h4 className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-200">
                      {t('තවමත් කිසිදු පාඨමාලාවකට ලියාපදිංචි වී නැත', 'No active enrolled courses yet')}
                    </h4>
                    <button
                      onClick={() => setActiveTab('store')}
                      className="cursor-pointer mt-4 rounded-xl bg-amber-500 px-4 py-2 text-xs font-black text-slate-950"
                    >
                      {t('නව පාඨමාලා ගවේෂණය කරන්න', 'Browse Available Courses')}
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {enrolledCourses.map((course) => {
                      const accessInfo = getCourseAccessInfo(course.id);
                      const courseDoneCount = course.lessons.filter((l) => !!completedLessons[l.id]).length;
                      const coursePercent = course.lessons.length > 0
                        ? Math.round((courseDoneCount / course.lessons.length) * 100)
                        : 0;
                      const courseLevel = Math.max(1, Math.min(10, Math.ceil(coursePercent / 10) || 1));

                      return (
                        <div
                          key={course.id}
                          className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-xl hover:border-amber-400 dark:border-slate-800 dark:bg-slate-900"
                        >
                          <div className={`relative h-36 w-full bg-gradient-to-r ${course.thumbnailGradient} p-4 text-white flex flex-col justify-between overflow-hidden`}>
                            {course.thumbnailUrl && (
                              <img
                                src={course.thumbnailUrl}
                                alt={course.titleEn}
                                className="absolute inset-0 h-full w-full object-cover opacity-20"
                              />
                            )}
                            <div className="relative z-10 flex items-center justify-between">
                              <span className="rounded-lg bg-black/40 px-2.5 py-1 text-xs font-bold backdrop-blur-md">
                                {course.grade}
                              </span>
                              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                                Active · Level {courseLevel}
                              </span>
                            </div>
                            <div className="relative z-10">
                              <h4 className="text-sm sm:text-base font-bold text-white line-clamp-1">
                                {language === 'si' ? course.titleSi : course.titleEn}
                              </h4>
                            </div>
                          </div>

                          <div className="p-4 space-y-3">
                            <div className="flex items-center justify-between text-xs text-slate-500">
                              <span>{course.instructorNameSi}</span>
                              <span className="font-mono font-bold text-emerald-600">{courseDoneCount}/{course.lessons.length} {t('පාඩම් අවසන්', 'Done')}</span>
                            </div>

                            <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${coursePercent}%` }} />
                            </div>

                            <div className="flex gap-2 pt-1">
                              <button
                                onClick={() => setSelectedCourseForViewing(course)}
                                className="cursor-pointer flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                              >
                                <Play className="w-3.5 h-3.5 fill-current" />
                                <span>{t('පාඩම් නරඹන්න', 'Watch Lessons')}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* LATEST CAMPUS ANNOUNCEMENTS PREVIEW */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Bell className="w-5 h-5 text-rose-500" />
                    <span>{t('නවතම නිවේදන (Recent Announcements)', 'Recent Announcements')}</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('announcements')}
                    className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>{t('සියලු නිවේදන', 'All Notices')}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {announcements.slice(0, 2).map((ann) => (
                    <div
                      key={ann.id}
                      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold">
                          {ann.date}
                        </span>
                        <span className="font-semibold text-slate-400">
                          {language === 'si' ? ann.categorySi : ann.categoryEn}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        {language === 'si' ? ann.titleSi : ann.titleEn}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {language === 'si' ? ann.contentSi : ann.contentEn}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: MY ENROLLED COURSES (මගේ පාඨමාලා) */}
          {/* ========================================================================= */}
          {activeTab === 'courses' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-amber-500" />
                    <span>{t('මගේ ලියාපදිංචි පාඨමාලා (My Enrolled Courses)', 'My Enrolled Courses')}</span>
                    <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                      {enrolledCourses.length} Active
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {t(
                      'වීඩියෝ පාඩම් නැරඹීම, OMR ඔන්ලයින් විභාග වලට පෙනී සිටීම සහ පාඩම් සම්පූර්ණ කළ බව ගුරුතුමාට වාර්තා කිරීම මෙතැනින් සිදු කරන්න.',
                      'Watch video lessons, sit for digital OMR online exams, and mark completed lectures.'
                    )}
                  </p>
                </div>

                {availableCourses.length > 0 && (
                  <button
                    onClick={() => setActiveTab('store')}
                    className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{t('නව කෝස් වර්ග බලන්න', 'Explore Available Courses')}</span>
                  </button>
                )}
              </div>

              {enrolledCourses.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center bg-white dark:bg-slate-900">
                  <BookOpen className="mx-auto h-12 w-12 text-slate-400" />
                  <h3 className="mt-3 text-base font-bold text-slate-700 dark:text-slate-200">
                    {t('ඔබ තවමත් කිසිදු පාඨමාලාවකට ලියාපදිංචි වී නොමැත.', 'You are not enrolled in any courses yet.')}
                  </h3>
                  <button
                    onClick={() => setActiveTab('store')}
                    className="cursor-pointer mt-4 rounded-xl bg-amber-500 px-6 py-2.5 text-xs font-black text-slate-950 shadow-md"
                  >
                    {t('අලුත් පාඨමාලා බලන්න (Browse Courses)', 'Browse Available Courses')}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {enrolledCourses.map((course) => {
                    const accessInfo = getCourseAccessInfo(course.id);
                    const courseDoneCount = course.lessons.filter((l) => !!completedLessons[l.id]).length;
                    const coursePercent = course.lessons.length > 0
                      ? Math.round((courseDoneCount / course.lessons.length) * 100)
                      : 0;
                    const courseLevel = Math.max(1, Math.min(10, Math.ceil(coursePercent / 10) || 1));

                    // Check for online exams related to this course
                    const courseExams = onlineExams.filter((e) => e.courseId === course.id);

                    return (
                      <div
                        key={course.id}
                        className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm space-y-4"
                      >
                        {/* Course Card Header */}
                        <div className={`p-5 sm:p-6 bg-gradient-to-r ${course.thumbnailGradient} text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden`}>
                          {course.thumbnailUrl && (
                            <img
                              src={course.thumbnailUrl}
                              alt={course.titleEn}
                              className="absolute inset-0 h-full w-full object-cover opacity-20"
                            />
                          )}

                          <div className="relative z-10 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="rounded-lg bg-black/40 px-2.5 py-0.5 text-xs font-bold backdrop-blur-md">
                                {course.grade}
                              </span>
                              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-300 border border-emerald-500/30">
                                Level {courseLevel} Achieved
                              </span>
                            </div>
                            <h3 className="text-lg sm:text-xl font-black text-white">
                              {language === 'si' ? course.titleSi : course.titleEn}
                            </h3>
                            <p className="text-xs text-slate-300">
                              {course.instructorNameSi} · {t('කාල සීමාව:', 'Duration:')} {course.duration || '6 Months'}
                            </p>
                          </div>

                          <div className="relative z-10 flex items-center gap-2">
                            <button
                              onClick={() => setSelectedCourseForViewing(course)}
                              className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-5 py-2.5 text-xs font-black text-slate-950 shadow-lg transition"
                            >
                              <Play className="w-4 h-4 fill-current" />
                              <span>{t('පාඩම් නරඹන්න (Watch Lessons)', 'Watch Lessons')}</span>
                            </button>
                          </div>
                        </div>

                        {/* Progress Bar & Access Validity */}
                        <div className="p-5 sm:p-6 space-y-6">
                          
                          {/* Course Level Indicator */}
                          <div className="space-y-2 rounded-2xl bg-slate-50 dark:bg-slate-850 p-4 border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-slate-800 dark:text-slate-200">
                                {t('පාඨමාලා ප්‍රගතිය සහ මට්ටම', 'Course Progress & Level')} (Level {courseLevel} / 10)
                              </span>
                              <span className="font-mono font-bold text-emerald-600">
                                {courseDoneCount} / {course.lessons.length} {t('පාඩම් අවසන්', 'Lessons Done')} ({coursePercent}%)
                              </span>
                            </div>

                            <div className="h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all"
                                style={{ width: `${coursePercent}%` }}
                              />
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                              <span>
                                {accessInfo.plan === 'monthly'
                                  ? t('මාසික සැලැස්ම (Monthly)', 'Monthly Plan')
                                  : t('සම්පූර්ණ පාඨමාලාව (Full Plan)', 'Full Course Plan')}
                              </span>
                              <span>
                                {t('වලංගු කාලය:', 'Expires:')} <strong className="font-mono text-slate-800 dark:text-slate-200">{accessInfo.expiresAt || 'Active'}</strong> ({accessInfo.daysRemaining} days left)
                              </span>
                            </div>
                          </div>

                          {/* ONLINE EXAMS SECTION FOR THIS COURSE */}
                          {courseExams.length > 0 && (
                            <div className="space-y-3">
                              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                <FileQuestion className="w-4 h-4 text-amber-500" />
                                <span>{t('විභාග සහ ප්‍රශ්න පත්‍ර (Online Digital Exams)', 'Digital Online Exams')}</span>
                              </span>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {courseExams.map((exam) => (
                                  <div
                                    key={exam.id}
                                    className="p-4 rounded-2xl border border-amber-300 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 flex flex-col justify-between gap-3"
                                  >
                                    <div>
                                      <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300">
                                          {exam.durationMinutes} Mins · {exam.questionsCount} Qs
                                        </span>
                                        <span className="text-[10px] text-slate-500">
                                          {exam.totalMarks} Marks
                                        </span>
                                      </div>
                                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white mt-1.5">
                                        {exam.title}
                                      </h4>
                                    </div>

                                    <button
                                      onClick={() => setSelectedExamForTaking(exam)}
                                      className="cursor-pointer w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
                                    >
                                      <FileText className="w-3.5 h-3.5" />
                                      <span>{t('විභාගයට පෙනී සිටින්න (Start Exam)', 'Sit for Exam')}</span>
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* LESSONS CHECKLIST WITH ONE-CLICK "MARK COMPLETED" REPORTING */}
                          <div className="space-y-3">
                            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                              {t('වීඩියෝ පාඩම් ලැයිස්තුව (Lessons Checklist & Reporting)', 'Course Lessons Playlist')}
                            </span>

                            <div className="space-y-2">
                              {course.lessons.map((lesson, idx) => {
                                const isDone = !!completedLessons[lesson.id];
                                return (
                                  <div
                                    key={lesson.id}
                                    className="p-3 sm:p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                                  >
                                    <div className="flex items-center gap-3">
                                      <span
                                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                                          isDone
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                        }`}
                                      >
                                        {isDone ? '✓' : idx + 1}
                                      </span>
                                      <div>
                                        <p className="font-bold text-slate-900 dark:text-white">
                                          {lesson.titleSi}
                                        </p>
                                        <span className="text-[11px] text-slate-500">
                                          {lesson.duration} · {lesson.titleEn}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2 self-end sm:self-auto">
                                      <button
                                        onClick={() =>
                                          handleToggleLessonComplete(
                                            course,
                                            lesson.id,
                                            isDone,
                                            lesson.titleSi
                                          )
                                        }
                                        className={`cursor-pointer px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 ${
                                          isDone
                                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40'
                                            : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                                        }`}
                                        title="Mark complete and report to instructor"
                                      >
                                        <CheckCircle className="w-3.5 h-3.5" />
                                        <span>
                                          {isDone
                                            ? t('✓ නරඹා අවසන් (Completed)', 'Done')
                                            : t('නරඹා අවසන් බව සලකුණු කරන්න', 'Mark Done')}
                                        </span>
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: LIVE ZOOM CLASSES & CALENDAR (සජීවී Zoom පන්ති & කැලැන්ඩරය) */}
          {/* ========================================================================= */}
          {activeTab === 'live-classes' && (
            <div className="space-y-8 animate-in fade-in">
              {/* Header */}
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-3 py-1 text-xs font-bold flex items-center gap-1.5">
                        <Video className="w-3.5 h-3.5" />
                        <span>Interactive Live Virtual Campus</span>
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <Calendar className="w-6 h-6 text-amber-500" />
                      <span>{t('ඉදිරියට පැවැත්වීමට නියමිත සජීවී ලෙසන්ස් කැලැන්ඩරය', 'Upcoming Live Lessons Calendar')}</span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                      {t(
                        'ඔබ ලියාපදිංචි වී ඇති සියලුම පාඨමාලා වල සජීවී Zoom පන්ති මෙහි ආවේණික වර්ණ සහ ස්ටිකර් මගින් වෙන් වෙන්ව පෙන්වයි. පැය 24ක් තුළ පවතින පන්ති සඳහා ටයිම් කවුන් ඩවුන් එකක් ක්‍රියාත්මක වන අතර අවසන් විනාඩි 10 තුළදී Zoom Join Link සහ Credentials අගුළු හැරේ.',
                        'Live sessions across all your enrolled courses categorized by unique colors and stickers. 24-hour countdowns with credentials unlocking during the final 10 minutes.'
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-black">
                      {studentZoomClasses.length} Scheduled Sessions
                    </span>
                  </div>
                </div>
              </div>

              {/* 1. DISTINCTIVE COURSE COLORS & STICKERS LEGEND */}
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {t('ඔබ හදාරන පාඨමාලාවල ආවේණික වර්ණ සහ ස්ටිකර් (Course Identity Badges):', 'Distinct Course Color Badges & Stickers:')}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {enrolledCourses.length} Enrolled Course{enrolledCourses.length > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {enrolledCourses.map((c) => {
                    const visual = getCourseVisualSticker(c.id, c.subjectEn || c.subjectSi);
                    const courseCount = studentZoomClasses.filter((z) => z.courseId === c.id).length;

                    return (
                      <div
                        key={c.id}
                        className={`p-3.5 rounded-2xl border-2 ${visual.borderClass} bg-gradient-to-br ${visual.bgGlow} via-white to-white dark:via-slate-900 dark:to-slate-900 flex items-center justify-between gap-3 shadow-xs`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`h-10 w-10 rounded-xl flex items-center justify-center text-lg ${visual.chipClass}`}>
                            {visual.icon}
                          </span>
                          <div>
                            <span className="text-xs font-black text-slate-900 dark:text-white block line-clamp-1">
                              {c.titleSi}
                            </span>
                            <span className="text-[10px] text-slate-500 block font-semibold">
                              {c.grade} • {c.instructorNameSi}
                            </span>
                          </div>
                        </div>

                        <span className={`shrink-0 px-2 py-1 rounded-lg text-[10px] font-black ${visual.badgeClass}`}>
                          {courseCount} Classes
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. COURSE FILTER BUTTONS */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-500 mr-1">
                  {t('කෝස් අනුව තෝරන්න:', 'Filter by Course:')}
                </span>

                <button
                  type="button"
                  onClick={() => setCalendarCourseFilter('all')}
                  className={`cursor-pointer px-4 py-2 rounded-xl text-xs font-black transition ${
                    calendarCourseFilter === 'all'
                      ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {t('සියලුම පාඨමාලා (All Courses)', 'All Courses')} ({studentZoomClasses.length})
                </button>

                {enrolledCourses.map((c) => {
                  const visual = getCourseVisualSticker(c.id, c.subjectEn || c.subjectSi);
                  const isSelected = calendarCourseFilter === c.id;

                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCalendarCourseFilter(c.id)}
                      className={`cursor-pointer px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                        isSelected
                          ? `${visual.chipClass} shadow-sm ring-2 ring-offset-2 ring-amber-400`
                          : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <span>{visual.icon}</span>
                      <span>{c.subjectSi}</span>
                    </button>
                  );
                })}
              </div>

              {/* 3. INTERACTIVE VISUAL MONTHLY CALENDAR GRID */}
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                        {new Date(currentTime.getFullYear(), currentTime.getMonth() + calendarMonthOffset, 1).toLocaleDateString('si-LK', { month: 'long', year: 'numeric' })} — සජීවී පන්ති දින දර්ශනය
                      </h3>
                      <p className="text-xs text-slate-500">
                        {t('පන්ති පවතින දිනයන් අදාළ කෝස් වලට ආවේණික පාටවලින් දැක්වේ', 'Dates with sessions highlighted in course-specific colors')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCalendarMonthOffset((prev) => prev - 1)}
                      className="cursor-pointer px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      ◀ පෙර මාසය
                    </button>
                    <button
                      type="button"
                      onClick={() => setCalendarMonthOffset(0)}
                      className="cursor-pointer px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-bold"
                    >
                      අද (Today)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCalendarMonthOffset((prev) => prev + 1)}
                      className="cursor-pointer px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      ඊළඟ මාසය ▶
                    </button>
                  </div>
                </div>

                {/* Day of Week Headers */}
                <div className="grid grid-cols-7 gap-2 text-center text-xs font-black uppercase text-slate-400 tracking-wider">
                  <div>ඉරිදා (Sun)</div>
                  <div>සඳුදා (Mon)</div>
                  <div>අඟහ (Tue)</div>
                  <div>බදාදා (Wed)</div>
                  <div>බ්‍රහස් (Thu)</div>
                  <div>සිකු (Fri)</div>
                  <div>සෙන (Sat)</div>
                </div>

                {/* Calendar Days Matrix */}
                {(() => {
                  const targetMonthDate = new Date(currentTime.getFullYear(), currentTime.getMonth() + calendarMonthOffset, 1);
                  const year = targetMonthDate.getFullYear();
                  const month = targetMonthDate.getMonth();
                  const firstDayOfWeek = new Date(year, month, 1).getDay();
                  const daysInMonth = new Date(year, month + 1, 0).getDate();
                  const todayStr = currentTime.toISOString().substring(0, 10);

                  const dayCells = [];
                  for (let i = 0; i < firstDayOfWeek; i++) {
                    dayCells.push(<div key={`empty-${i}`} className="min-h-[85px] rounded-2xl bg-slate-50/50 dark:bg-slate-950/40 p-2 border border-transparent" />);
                  }

                  for (let day = 1; day <= daysInMonth; day++) {
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const isToday = dateStr === todayStr;
                    const isSelected = dateStr === selectedCalendarDate;
                    const dayClasses = studentZoomClasses.filter((z) => {
                      const matchCourse = calendarCourseFilter === 'all' || z.courseId === calendarCourseFilter;
                      return z.date === dateStr && matchCourse;
                    });

                    dayCells.push(
                      <div
                        key={dateStr}
                        onClick={() => setSelectedCalendarDate(dateStr)}
                        className={`min-h-[85px] rounded-2xl p-2.5 border transition cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'ring-2 ring-amber-500 border-amber-400 bg-amber-50/40 dark:bg-amber-950/20'
                            : isToday
                            ? 'border-amber-400 bg-amber-50/20 dark:bg-slate-850'
                            : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-mono font-bold ${isToday ? 'h-6 w-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-black' : 'text-slate-700 dark:text-slate-300'}`}>
                            {day}
                          </span>
                          {isToday && (
                            <span className="text-[9px] font-black uppercase text-amber-600 dark:text-amber-400">Today</span>
                          )}
                        </div>

                        {/* Event Tags inside Day Cell */}
                        <div className="space-y-1 mt-1">
                          {dayClasses.map((item) => {
                            const visual = getCourseVisualSticker(item.courseId);
                            return (
                              <div
                                key={item.id}
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded truncate ${visual.chipClass} shadow-2xs`}
                                title={`${item.topic} (${item.time})`}
                              >
                                {visual.icon} {item.category ? `[${item.category}]` : ''} {item.time.split('-')[0]}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-7 gap-2">
                      {dayCells}
                    </div>
                  );
                })()}
              </div>

              {/* 4. UPCOMING SESSIONS DETAILED CARDS LIST */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Video className="w-5 h-5 text-blue-500" />
                    <span>{t('ඉදිරි සජීවී පන්ති සැසිවාර (Live Scheduled Sessions)', 'Scheduled Live Sessions')}</span>
                  </h3>
                  <span className="text-xs text-slate-500">
                    Showing {studentZoomClasses.filter((z) => calendarCourseFilter === 'all' || z.courseId === calendarCourseFilter).length} session(s)
                  </span>
                </div>

                {(() => {
                  const filteredClasses = studentZoomClasses.filter((z) => calendarCourseFilter === 'all' || z.courseId === calendarCourseFilter);

                  if (filteredClasses.length === 0) {
                    return (
                      <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center bg-white dark:bg-slate-900 space-y-3">
                        <Video className="mx-auto h-12 w-12 text-slate-400" />
                        <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                          {t('මෙම පාඨමාලාව සඳහා කාලසටහන්ගත කළ Zoom පන්ති නොමැත.', 'No live Zoom sessions scheduled for this selection yet.')}
                        </h4>
                        <p className="text-xs text-slate-500 max-w-md mx-auto">
                          ආචාර්යවරයා විසින් අලුත් Zoom පන්තියක් කාලසටහන්ගත කළ වහාම එය මෙහි ක්ෂණිකව දිස්වේ.
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {filteredClasses.map((zClass) => {
                        const course = courses.find((c) => c.id === zClass.courseId);
                        const visual = getCourseVisualSticker(zClass.courseId, course?.subjectEn || course?.subjectSi);
                        const startDate = parseZoomStart(zClass.date, zClass.time);
                        const diffMs = startDate ? startDate.getTime() - currentTime.getTime() : 99999999;
                        const isWithin24h = diffMs <= 24 * 60 * 60 * 1000 && diffMs >= -3 * 60 * 60 * 1000;
                        const isLast10MinutesOrLive = diffMs <= 10 * 60 * 1000 && diffMs >= -3 * 60 * 60 * 1000;
                        const countdown = formatCountdown(diffMs);
                        const isPaid = isStudentPaidForCourse(zClass.courseId);
                        const isCopied = copiedInviteId === zClass.id;

                        return (
                          <div
                            key={zClass.id}
                            className={`rounded-3xl border-2 ${visual.borderClass} bg-gradient-to-br ${visual.bgGlow} via-white to-white dark:via-slate-900 dark:to-slate-900 p-6 shadow-sm hover:shadow-lg transition space-y-4`}
                          >
                            {/* Card Top: Sticker & Status */}
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black shadow-xs ${visual.chipClass}`}>
                                <span>{visual.icon}</span>
                                <span>{visual.sticker}</span>
                              </span>

                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-900 text-white dark:bg-slate-800 text-xs font-bold">
                                <span>{zClass.category ? `[${zClass.category}]` : '[සිද්ධාන්ත]'}</span>
                                <span>•</span>
                                <span className="font-mono text-amber-400">ලෙසන්ස් අංක {String(zClass.lessonNumber || 1).padStart(2, '0')}</span>
                              </span>
                            </div>

                            {/* Middle Details */}
                            <div>
                              <h4 className="text-base font-black text-slate-900 dark:text-white leading-snug">
                                {zClass.topic}
                              </h4>
                              {zClass.description && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                                  {zClass.description}
                                </p>
                              )}

                              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300 font-semibold font-mono">
                                <span>📅 {zClass.date}</span>
                                <span>•</span>
                                <span className="text-amber-600 dark:text-amber-400 font-bold">⏰ {zClass.time}</span>
                                <span>•</span>
                                <span>🎓 {zClass.instructorName}</span>
                              </div>
                            </div>

                            {/* 24-Hour Timer & Access Box */}
                            <div className="p-4 rounded-2xl bg-white/90 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-3">
                              <div className="flex items-center justify-between text-xs font-bold">
                                {isWithin24h ? (
                                  <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-mono font-black">
                                    <Timer className="w-3.5 h-3.5 animate-spin" />
                                    <span>⏱️ තව {countdown.text}</span>
                                  </span>
                                ) : (
                                  <span className="text-slate-500 font-mono">
                                    📅 නියමිත දිනය: {zClass.date}
                                  </span>
                                )}

                                {isPaid ? (
                                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>ගෙවීම් තහවුරුයි (Paid)</span>
                                  </span>
                                ) : (
                                  <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                    <span>ගෙවීම තහවුරු නැත</span>
                                  </span>
                                )}
                              </div>

                              {/* Access rules: Last 10 minutes OR not */}
                              {isPaid ? (
                                isLast10MinutesOrLive ? (
                                  <div className="space-y-2.5 pt-1">
                                    <a
                                      href={zClass.joinUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition"
                                    >
                                      <ExternalLink className="w-4 h-4" />
                                      <span>Zoom වෙත සජීවීව එක්වන්න (Join Live Now)</span>
                                    </a>

                                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-between">
                                        <span className="text-slate-400 text-[10px]">ID:</span>
                                        <span className="font-bold">{zClass.meetingId}</span>
                                      </div>
                                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-between">
                                        <span className="text-slate-400 text-[10px]">PIN:</span>
                                        <span className="font-bold text-amber-500">{zClass.passcode}</span>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-2">
                                    <Lock className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                                    <span>Zoom Join Link සහ Credentials පන්තිය ආරම්භ වීමට නියමිත අවසන් විනාඩි 10 තුළදී අගුළු හැරේ.</span>
                                  </div>
                                )
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (course) setSelectedCourseForBuying(course);
                                  }}
                                  className="w-full py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                                >
                                  <CreditCard className="w-3.5 h-3.5" />
                                  <span>ගෙවීම් සම්පූර්ණ කරන්න (Unlock Access)</span>
                                </button>
                              )}
                            </div>

                            {/* Card Footer: WhatsApp & Copy Invite */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                              {zClass.whatsAppGroupLink ? (
                                <a
                                  href={zClass.whatsAppGroupLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1"
                                >
                                  <span>💬 WhatsApp සමූහය</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              ) : <span />}

                              <button
                                type="button"
                                onClick={() => handleCopyZoomInvite(zClass)}
                                className="cursor-pointer text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-bold flex items-center gap-1"
                              >
                                <Copy className="w-3.5 h-3.5" />
                                <span>{isCopied ? 'ආරාධනය Copy විය!' : 'ආරාධනය පිටපත් කරන්න'}</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: AVAILABLE COURSES STORE (අලුත් පාඨමාලා වර්ග) */}
          {/* ========================================================================= */}
          {activeTab === 'store' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <ShoppingBag className="w-6 h-6 text-amber-500" />
                    <span>{t('නව පාඨමාලා නාමාවලිය (Available Campus Courses)', 'Available Courses')}</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {t(
                      'Super Admin / Manager විසින් පද්ධතියට එක් කළ නව පාඨමාලා මෙතැනින් තෝරාගෙන ලියාපදිංචි වන්න.',
                      'Newly added programs by administration. Select full, monthly, or 2-installment payment.'
                    )}
                  </p>
                </div>
              </div>

              {/* Search & Category Filter Pills */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {[
                    { id: 'all', label: 'සියල්ල (All)' },
                    { id: '2028', label: '2028 A/L' },
                    { id: '2027', label: '2027 A/L' },
                    { id: 'pro', label: 'Professional ICT & AI' },
                    { id: 'ol', label: 'Secondary / O/L' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setStoreCategoryFilter(tab.id)}
                      className={`cursor-pointer shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                        storeCategoryFilter === tab.id
                          ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                          : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Search input */}
                <div className="relative max-w-xs">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={storeSearchQuery}
                    onChange={(e) => setStoreSearchQuery(e.target.value)}
                    placeholder={t('කෝස් නම සොයන්න...', 'Search courses...')}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-1.5 pl-9 pr-3 text-xs"
                  />
                </div>
              </div>

              {/* Course Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredAvailableCourses.map((course) => (
                  <div
                    key={course.id}
                    className="flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-xl hover:border-amber-400 dark:border-slate-800 dark:bg-slate-900"
                  >
                    {/* Header Thumbnail */}
                    <div className={`relative h-44 w-full bg-gradient-to-r ${course.thumbnailGradient} p-4 text-white flex flex-col justify-between overflow-hidden`}>
                      {course.thumbnailUrl && (
                        <img
                          src={course.thumbnailUrl}
                          alt={course.titleEn}
                          className="absolute inset-0 h-full w-full object-cover opacity-25"
                        />
                      )}
                      <div className="relative z-10 flex items-center justify-between">
                        <span className="rounded-lg bg-black/50 px-2.5 py-1 text-xs font-bold backdrop-blur-md">
                          {course.grade}
                        </span>
                        <span className="rounded-lg bg-amber-500 text-slate-950 px-2 py-0.5 text-[10px] font-black">
                          {course.duration || '6 Months'}
                        </span>
                      </div>
                      <div className="relative z-10">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                          {language === 'si' ? course.subjectSi : course.subjectEn}
                        </span>
                        <h3 className="text-base font-bold text-white line-clamp-2">
                          {language === 'si' ? course.titleSi : course.titleEn}
                        </h3>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        {/* Instructor */}
                        <div className="flex items-center gap-2.5">
                          <img
                            src={course.instructorAvatar}
                            alt={course.instructorNameEn}
                            className="h-8 w-8 rounded-full object-cover border border-amber-500/30"
                          />
                          <div>
                            <span className="block text-xs font-bold text-slate-900 dark:text-white">
                              {language === 'si' ? course.instructorNameSi : course.instructorNameEn}
                            </span>
                            <span className="block text-[10px] text-slate-500">
                              {course.lessons.length} {t('වීඩියෝ පාඩම්', 'Lessons')}
                            </span>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                          {language === 'si' ? course.descriptionSi : course.descriptionEn}
                        </p>

                        {/* Fees Breakdown: Full, Monthly, 2-Installments */}
                        <div className="rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 p-3 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between font-bold">
                            <span className="text-slate-700 dark:text-slate-300">
                              {t('සම්පූර්ණ පාඨමාලාව (Full):', 'Full Course Fee:')}
                            </span>
                            <span className="text-amber-600 dark:text-amber-400 font-mono">
                              Rs. {course.priceLKR.toLocaleString()}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span>{t('මාසික ගාස්තුව (Monthly):', 'Monthly Fee:')}</span>
                            <span className="font-mono text-slate-700 dark:text-slate-300">
                              Rs. {course.monthlyFeeLKR.toLocaleString()} / mo
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span>{t('වාරික 2කින් (2 Installments):', '2 Installments:')}</span>
                            <span className="font-mono text-slate-700 dark:text-slate-300">
                              Rs. {(course.installmentPriceLKR || Math.round(course.priceLKR / 2)).toLocaleString()} x 2
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Buy Now Button */}
                      <button
                        onClick={() => setSelectedCourseForBuying(course)}
                        className="cursor-pointer w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 transition"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>{t('ලියාපදිංචි වන්න (Buy Now / Enroll)', 'Buy Now / Enroll')}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: ASSIGNMENTS & MARKS (පැවරුම් සහ ඇගයීම් ලකුණු) */}
          {/* ========================================================================= */}
          {activeTab === 'assignments' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-6 h-6 text-amber-500" />
                    <span>{t('පැවරුම් සහ ඇගයීම් ලකුණු (Assignments & Marks)', 'Assignments & Evaluation Marks')}</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {t(
                      'ආචාර්යවරුන් විසින් එක් කළ පැවරුම් (Google Drive / PDF) ආරක්ෂිතව කියවා අධ්‍යයනය කරන්න. ඔබගේ ලකුණු සහ සාමාර්ථ මෙහි සටහන් වේ.',
                      'View lecturer-assigned documents securely within the protected viewer. Track your verified marks and grades.'
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    <span>ආරක්ෂිත කියවුම් පුවරුව (Protected Viewer)</span>
                  </span>
                </div>
              </div>

              {/* USER FRIENDLY CATEGORY FILTERS (පාඨමාලා සහ මාස අනුව වෙන් වෙන් වශයෙන්) */}
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                  {/* Course Category Pills */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
                      පාඨමාලාව:
                    </span>
                    <button
                      onClick={() => setAssignmentCourseFilter('all')}
                      className={`cursor-pointer shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                        assignmentCourseFilter === 'all'
                          ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      සියලු පාඨමාලා ({enrolledCourses.length})
                    </button>
                    {enrolledCourses.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setAssignmentCourseFilter(c.id)}
                        className={`cursor-pointer shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                          assignmentCourseFilter === c.id
                            ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {c.titleSi.substring(0, 20)}...
                      </button>
                    ))}
                  </div>

                  {/* Search Bar */}
                  <div className="relative max-w-xs">
                    <Search className="w-4 h-4 absolute left-3 top-2 text-slate-400" />
                    <input
                      type="text"
                      value={assignmentSearchQuery}
                      onChange={(e) => setAssignmentSearchQuery(e.target.value)}
                      placeholder={t('පැවරුම සොයන්න...', 'Search assignments...')}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 py-1.5 pl-9 pr-3 text-xs"
                    />
                  </div>
                </div>

                {/* Month Category Filter Bar */}
                <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 dark:border-slate-800 scrollbar-none text-xs">
                  <span className="text-[11px] font-semibold text-slate-400 mr-2 shrink-0">
                    මාසය අනුව:
                  </span>
                  {[
                    { id: 'all', label: 'සියලු මාස' },
                    { id: 'සැප්තැම්බර්', label: 'සැප්තැම්බර්' },
                    { id: 'ඔක්තෝබර්', label: 'ඔක්තෝබර්' },
                    { id: 'නොවැම්බර්', label: 'නොවැම්බර්' },
                    { id: 'දෙසැම්බර්', label: 'දෙසැම්බර්' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setAssignmentMonthFilter(m.id)}
                      className={`cursor-pointer shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                        assignmentMonthFilter === m.id
                          ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold border border-amber-500/40'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filtered Assignments Cards Grid */}
              {(() => {
                const enrolledAssignments = assignments.filter((a) =>
                  enrolledCourses.some((c) => c.id === a.courseId)
                );

                const filtered = enrolledAssignments.filter((asg) => {
                  const matchCourse = assignmentCourseFilter === 'all' || asg.courseId === assignmentCourseFilter;
                  const matchMonth = assignmentMonthFilter === 'all' || (asg.month && asg.month.includes(assignmentMonthFilter));
                  const matchSearch = !assignmentSearchQuery || asg.title.toLowerCase().includes(assignmentSearchQuery.toLowerCase());
                  return matchCourse && matchMonth && matchSearch;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="p-12 text-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-400 space-y-2">
                      <FileText className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
                      <p className="font-semibold text-sm text-slate-600 dark:text-slate-400">
                        තෝරාගත් කාණ්ඩය යටතේ පැවරුම් හමු නොවීය.
                      </p>
                      <p className="text-[11px] text-slate-400">
                        ලෙක්චරර් විසින් නව පැවරුම් Upload කළ පසු මෙහි දිස්වනු ඇත.
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {filtered.map((asg) => {
                      const studentSub = asg.submissions?.find(
                        (s) =>
                          s.studentId === currentUser?.id ||
                          (currentUser?.fullName && s.studentName.toLowerCase().includes(currentUser.fullName.toLowerCase()))
                      );

                      return (
                        <div
                          key={asg.id}
                          className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-amber-400 transition"
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold">
                                {asg.courseTitle}
                              </span>
                              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                                {asg.month || 'සැප්තැම්බර්'}
                              </span>
                            </div>

                            <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                              {asg.title}
                            </h3>

                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <span>ආචාර්ය: <strong className="text-slate-700 dark:text-slate-300">{asg.lecturerName || 'Lecturer'}</strong></span>
                              <span>·</span>
                              <span className="text-rose-500 font-semibold">භාරදීමේ දිනය: {asg.dueDate}</span>
                            </div>

                            {/* Student Marks Section */}
                            <div className="mt-3 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                                ඇගයීම් ලකුණු තත්ත්වය (Evaluation Status):
                              </span>
                              {studentSub && (studentSub.marksPercent !== undefined || studentSub.grade) ? (
                                <div className="flex items-center justify-between">
                                  <div>
                                    <span className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono">
                                      {studentSub.marksPercent !== undefined ? `${studentSub.marksPercent}%` : ''}
                                    </span>
                                    {studentSub.feedback && (
                                      <p className="text-[11px] text-slate-500 mt-0.5 italic">
                                        "{studentSub.feedback}"
                                      </p>
                                    )}
                                  </div>
                                  {studentSub.grade && (
                                    <span className="px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-black text-sm border border-emerald-300 dark:border-emerald-800">
                                      Grade {studentSub.grade}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300 font-medium">
                                  <Clock className="w-4 h-4 shrink-0 text-amber-500 animate-spin" />
                                  <span>ලෙක්චරර් විසින් ඇගයීම් ලකුණු සටහන් කිරීම අපේක්ෂාවෙන්...</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* ACTION: VIEW PROTECTED PDF (NO DOWNLOAD / NO COPYING) */}
                          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                            <button
                              onClick={() => setSelectedAssignmentForViewing(asg)}
                              className="cursor-pointer w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition"
                              title="ආරක්ෂිත Viewer එක මගින් පැවරුම් පත්‍රිකාව කියවන්න"
                            >
                              <Eye className="w-4 h-4" />
                              <span>{t('ආරක්ෂිතව පැවරුම කියවන්න (View Protected PDF)', 'View Protected PDF')}</span>
                            </button>
                            <p className="mt-1.5 text-center text-[10px] text-slate-400 flex items-center justify-center gap-1">
                              <Lock className="w-3 h-3 text-emerald-500" />
                              <span>ආරක්ෂිතව එම්බඩ් කර ඇත · බාගත කිරීම සීමා කර ඇත</span>
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: CAMPUS ANNOUNCEMENTS (නිවේදන පුවරුව) */}
          {/* ========================================================================= */}
          {activeTab === 'announcements' && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Bell className="w-6 h-6 text-rose-500" />
                  <span>{t('නිල කැම්පස් නිවේදන (Official Campus Notices)', 'Official Campus Notices')}</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {t(
                    'පන්ති කාලසටහන්, විභාග දිනයන් සහ ශිෂ්‍ය ඇගයීම් පිළිබඳ නිල දැනුම්දීම්',
                    'Official notices regarding lectures, exam schedules, and academic updates'
                  )}
                </p>
              </div>

              <div className="space-y-4">
                {announcements.map((ann) => (
                  <div
                    key={ann.id}
                    className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-3 shadow-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2.5 py-1 text-xs font-bold border border-rose-500/20">
                          {ann.date}
                        </span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {language === 'si' ? ann.categorySi : ann.categoryEn}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {language === 'si' ? ann.titleSi : ann.titleEn}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {language === 'si' ? ann.contentSi : ann.contentEn}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </main>

      {/* ---------------- Modals ---------------- */}

      {/* Course Viewer Modal */}
      {selectedCourseForViewing && (
        <CourseViewerModal
          course={selectedCourseForViewing}
          onClose={() => setSelectedCourseForViewing(null)}
        />
      )}

      {/* Checkout / Cart Modal */}
      {selectedCourseForBuying && (
        <CheckoutModal
          course={selectedCourseForBuying}
          onClose={() => setSelectedCourseForBuying(null)}
          onSuccess={() => {
            setSelectedCourseForBuying(null);
          }}
        />
      )}

      {/* Digital Online Exam Room Modal */}
      {selectedExamForTaking && (
        <StudentOnlineExamModal
          exam={selectedExamForTaking}
          onClose={() => setSelectedExamForTaking(null)}
        />
      )}

      {/* Secure PDF Viewer Modal (Google Drive & Protected PDF) */}
      {selectedAssignmentForViewing && (
        <SecurePdfModal
          assignment={selectedAssignmentForViewing}
          studentName={studentName}
          onClose={() => setSelectedAssignmentForViewing(null)}
        />
      )}

    </div>
  );
};
