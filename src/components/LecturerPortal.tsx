import React, { useState } from 'react';
import {
  Users,
  BookOpen,
  Video,
  FileText,
  Upload,
  CheckCircle,
  Clock,
  Send,
  AlertTriangle,
  Play,
  X,
  Plus,
  Trash2,
  ExternalLink,
  Search,
  Sparkles,
  Calendar,
  Lock,
  Award,
  ChevronRight,
  Shield,
  Eye,
  Clipboard,
  FileCheck,
  Filter,
  Copy,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useLmsData } from '../context/LmsDataContext';
import { Course, Lesson, OnlineExam, Assignment, ZoomClass } from '../types';
import { SecureVideoPlayer, extractYouTubeId } from './SecureVideoPlayer';
import { SecurePdfModal } from './SecurePdfModal';

interface LecturerPortalProps {
  onNavigate?: (view: 'home' | 'login' | 'register' | 'dashboard' | 'categories') => void;
}

type LecturerTab = 'overview' | 'recordings' | 'zoom' | 'assignments' | 'students';

export const LecturerPortal: React.FC<LecturerPortalProps> = ({ onNavigate }) => {
  const { currentUser, users, loginAsRole } = useAuth();
  const { t, language } = useLanguage();
  const {
    courses,
    onlineExams,
    zoomClasses,
    addZoomClass,
    deleteZoomClass,
    addLessonToCourse,
    deleteLessonFromCourse,
    assignments,
    addAssignment,
    deleteAssignment,
    recordAssignmentMark,
    rePushExamToStudent,
  } = useLmsData();

  const [activeTab, setActiveTab] = useState<LecturerTab>('overview');

  // Filter courses taught strictly by this lecturer (never show other lecturers' courses)
  const availableLecturerCourses = courses.filter((c) => {
    if (!currentUser) return false;
    if (currentUser.role === 'superadmin') return true;
    const phoneMatch = Boolean(currentUser.phone && c.instructorPhone === currentUser.phone);
    const nameMatch = Boolean(
      (c.instructorNameEn && currentUser.fullName && c.instructorNameEn.toLowerCase().includes(currentUser.fullName.toLowerCase())) ||
      (currentUser.fullName && c.instructorNameEn && currentUser.fullName.toLowerCase().includes(c.instructorNameEn.toLowerCase()))
    );
    return phoneMatch || nameMatch;
  });

  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    availableLecturerCourses[0]?.id || ''
  );

  React.useEffect(() => {
    if (availableLecturerCourses.length > 0 && !availableLecturerCourses.some((c) => c.id === selectedCourseId)) {
      setSelectedCourseId(availableLecturerCourses[0].id);
    }
  }, [availableLecturerCourses, selectedCourseId]);

  const selectedCourse = availableLecturerCourses.find((c) => c.id === selectedCourseId) || availableLecturerCourses[0];

  // Students enrolled in selected course
  // PRIVACY RULE: Lecturer sees student names ONLY.
  const enrolledStudents = users
    .filter((u) => u.role === 'student' && u.enrolledCourseIds.includes(selectedCourseId))
    .map((u) => ({
      id: u.id,
      name: u.fullName, // ONLY name exposed
    }));

  // Online exams for selected course
  const courseExams = onlineExams.filter((e) => e.courseId === selectedCourseId);
  const currentExam = courseExams[0];

  // Exam completion segmentation
  const completedStudentIds = new Set(currentExam?.results?.map((r) => r.studentId) || []);
  const completedResults = currentExam?.results || [];
  const pendingStudents = enrolledStudents.filter((s) => !completedStudentIds.has(s.id));

  // Re-push states
  const [pushedStudents, setPushedStudents] = useState<Record<string, boolean>>({});
  const [batchPushed, setBatchPushed] = useState(false);

  // -------------------------------------------------------------
  // FORM STATES: Add Lesson Recording
  // -------------------------------------------------------------
  const [showAddLessonModal, setShowAddLessonModal] = useState(false);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonTitleEn, setLessonTitleEn] = useState('');
  const [lessonMonth, setLessonMonth] = useState('සැප්තැම්බර් (September)');
  const [lessonNumber, setLessonNumber] = useState<number>(1);
  const [lessonYoutubeUrl, setLessonYoutubeUrl] = useState('');
  const [lessonThumbnailUrl, setLessonThumbnailUrl] = useState('');
  const [lessonDuration, setLessonDuration] = useState('2h 15m');
  const [lessonSummary, setLessonSummary] = useState('');

  // Preview video modal
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);

  // -------------------------------------------------------------
  // FORM STATES: Add Zoom Class & Type Schedule
  // -------------------------------------------------------------
  const [showAddZoomModal, setShowAddZoomModal] = useState(false);
  const [zoomTargetCourseId, setZoomTargetCourseId] = useState<string>('');
  const [zoomTopic, setZoomTopic] = useState('');
  const [zoomDate, setZoomDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [zoomTime, setZoomTime] = useState('07:00 PM - 09:30 PM');
  const [zoomLink, setZoomLink] = useState('');
  const [zoomPasscode, setZoomPasscode] = useState('MC2028');
  const [zoomMeetingId, setZoomMeetingId] = useState('892 4102 7741');
  const [zoomCategory, setZoomCategory] = useState<'Theory' | 'Revision' | 'Paper Class' | 'Special Class'>('Theory');
  const [zoomLessonNumber, setZoomLessonNumber] = useState<number>(1);
  const [zoomInstructions, setZoomInstructions] = useState('කරුණාකර සියලු සිසුන් වේලාවට පෙර Zoom වෙත සම්බන්ධ වන්න.');
  const [zoomSuccessMsg, setZoomSuccessMsg] = useState(false);
  const [copiedInviteId, setCopiedInviteId] = useState<string | null>(null);

  const handleGenerateZoomCredentials = () => {
    const randomMeetingId = `${Math.floor(100 + Math.random() * 900)} ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`;
    const randomPass = Math.random().toString(36).substring(2, 8).toUpperCase();
    setZoomMeetingId(randomMeetingId);
    setZoomPasscode(randomPass);
    if (!zoomLink) {
      setZoomLink(`https://zoom.us/j/${randomMeetingId.replace(/\s+/g, '')}?pwd=${randomPass}`);
    }
  };

  const handleCopyZoomInvite = (zClass: ZoomClass) => {
    const inviteText = `🎓 MONARCH CAMPUS - සජීවී ZOOM පන්තිය\n\n` +
      `📚 පාඨමාලාව: ${selectedCourse?.titleSi || zClass.courseTitle}\n` +
      `📖 මාතෘකාව: ${zClass.topic}\n` +
      `📅 දිනය: ${zClass.date}\n` +
      `⏰ වේලාව: ${zClass.time}\n` +
      `🔗 Join Link: ${zClass.joinUrl}\n` +
      `🆔 Meeting ID: ${zClass.meetingId}\n` +
      `🔑 Passcode: ${zClass.passcode}\n\n` +
      `*Monarch Campus Academic Portal - Your Future, Our Mission*`;

    navigator.clipboard?.writeText(inviteText);
    setCopiedInviteId(zClass.id);
    setTimeout(() => setCopiedInviteId(null), 2500);
  };

  // -------------------------------------------------------------
  // FORM STATES: Add Assignment (PDF)
  // -------------------------------------------------------------
  const [showAddAssignmentModal, setShowAddAssignmentModal] = useState(false);
  const [asgTitle, setAsgTitle] = useState('');
  const [asgMonth, setAsgMonth] = useState('සැප්තැම්බර් (September)');
  const [asgDueDate, setAsgDueDate] = useState('');
  const [asgPdfUrl, setAsgPdfUrl] = useState(''); // Empty by default so lecturer can easily paste their link
  const [pasteCopiedStatus, setPasteCopiedStatus] = useState(false);

  // Helper to paste from clipboard
  const handlePastePdfUrl = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setAsgPdfUrl(text.trim());
          setPasteCopiedStatus(true);
          setTimeout(() => setPasteCopiedStatus(false), 2500);
          return;
        }
      }
      const text = prompt('පැවරුම් Google Drive / PDF Link එක මෙහි Paste කරන්න:');
      if (text) {
        setAsgPdfUrl(text.trim());
        setPasteCopiedStatus(true);
        setTimeout(() => setPasteCopiedStatus(false), 2500);
      }
    } catch (e) {
      const text = prompt('පැවරුම් Google Drive / PDF Link එක මෙහි Paste කරන්න:');
      if (text) {
        setAsgPdfUrl(text.trim());
        setPasteCopiedStatus(true);
        setTimeout(() => setPasteCopiedStatus(false), 2500);
      }
    }
  };

  // -------------------------------------------------------------
  // FORM STATES: Manual Marks Entry (Name ONLY)
  // -------------------------------------------------------------
  const [selectedAsgId, setSelectedAsgId] = useState<string>(
    assignments.find((a) => a.courseId === selectedCourseId)?.id || assignments[0]?.id || ''
  );
  const [markStudentName, setMarkStudentName] = useState('');
  const [markPercent, setMarkPercent] = useState<number | ''>('');
  const [markGrade, setMarkGrade] = useState<'A+' | 'A' | 'B' | 'C' | 'S' | 'F' | ''>('A');
  const [markFeedback, setMarkFeedback] = useState('');
  const [markSavedAlert, setMarkSavedAlert] = useState(false);

  // Preview state for Secure PDF modal
  const [selectedAsgForPreview, setSelectedAsgForPreview] = useState<Assignment | null>(null);

  // Table search & filter states
  const [examResultsSearch, setExamResultsSearch] = useState('');
  const [assignmentMarksSearch, setAssignmentMarksSearch] = useState('');
  const [studentListSearch, setStudentListSearch] = useState('');
  const [filterAsgId, setFilterAsgId] = useState<string>('all');

  // Handlers: Re-Push Exam
  const handleRePushSingle = (studentName: string, studentId: string) => {
    if (!currentExam) return;
    rePushExamToStudent(currentExam.id, studentName, selectedCourse?.titleSi || 'පාඨමාලාව', studentId);
    setPushedStudents((prev) => ({ ...prev, [studentId]: true }));
  };

  const handleRePushAllPending = () => {
    if (!currentExam) return;
    pendingStudents.forEach((st) => {
      rePushExamToStudent(currentExam.id, st.name, selectedCourse?.titleSi || 'පාඨමාලාව', st.id);
      setPushedStudents((prev) => ({ ...prev, [st.id]: true }));
    });
    setBatchPushed(true);
    setTimeout(() => setBatchPushed(false), 3000);
  };

  // Handlers: Add Lesson
  const handleAddLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonTitle.trim() || !lessonYoutubeUrl.trim() || !selectedCourse) return;

    const newLesson: Lesson = {
      id: `les-${Date.now()}`,
      courseId: selectedCourse.id,
      titleSi: lessonTitle.trim(),
      titleEn: lessonTitleEn.trim() || lessonTitle.trim(),
      duration: lessonDuration.trim() || '2h 00m',
      videoUrl: lessonYoutubeUrl.trim(),
      thumbnailUrl:
        lessonThumbnailUrl.trim() ||
        'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80',
      month: lessonMonth,
      lessonNumber: Number(lessonNumber) || 1,
      videoPlatform: 'youtube_unlisted',
      summarySi: lessonSummary.trim() || 'පාඩම් සටහන් සහ සාකච්ඡා.',
      summaryEn: 'Core session discussion and practice notes.',
      isCompleted: false,
    };

    addLessonToCourse(selectedCourse.id, newLesson);
    setShowAddLessonModal(false);
    setLessonTitle('');
    setLessonTitleEn('');
    setLessonYoutubeUrl('');
    setLessonThumbnailUrl('');
    setLessonSummary('');
  };

  // Handlers: Add Zoom
  const handleAddZoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!zoomTopic.trim()) return;

    const chosenCourseId = zoomTargetCourseId || selectedCourse?.id || courses[0]?.id;
    const targetCourse = courses.find((c) => c.id === chosenCourseId) || selectedCourse;
    if (!targetCourse) return;

    const newZoom: ZoomClass = {
      id: `zoom-${Date.now()}`,
      courseId: targetCourse.id,
      courseTitle: targetCourse.titleSi,
      topic: `${zoomCategory ? `[${zoomCategory}] ` : ''}${zoomTopic.trim()}`,
      category: zoomCategory,
      lessonNumber: Number(zoomLessonNumber) || 1,
      description: zoomInstructions.trim() || undefined,
      date: zoomDate || new Date().toISOString().substring(0, 10),
      time: zoomTime || '07:00 PM - 09:30 PM',
      joinUrl: zoomLink.trim() || `https://zoom.us/j/${zoomMeetingId.replace(/\s+/g, '')}?pwd=${zoomPasscode}`,
      hostUrl: zoomLink.trim() || `https://zoom.us/s/${zoomMeetingId.replace(/\s+/g, '')}`,
      passcode: zoomPasscode.trim() || 'MC2028',
      meetingId: zoomMeetingId.trim() || '892 4102 7741',
      instructorPhone: currentUser?.phone || '0701306952',
      instructorName: currentUser?.fullName || 'Lecturer',
      status: 'scheduled',
    };

    addZoomClass(newZoom);
    setShowAddZoomModal(false);
    setZoomTopic('');
    setZoomSuccessMsg(true);
    setTimeout(() => setZoomSuccessMsg(false), 3500);
  };

  // Handlers: Add Assignment (PDF)
  const handleAddAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!asgTitle.trim() || !selectedCourse) return;

    addAssignment({
      courseId: selectedCourse.id,
      courseTitle: selectedCourse.titleSi,
      title: asgTitle.trim(),
      month: asgMonth,
      pdfUrl: asgPdfUrl.trim(),
      dueDate: asgDueDate || '2026-10-30',
      lecturerName: currentUser?.fullName || 'Lecturer',
      lecturerPhone: currentUser?.phone,
    });

    setShowAddAssignmentModal(false);
    setAsgTitle('');
    setAsgDueDate('');
  };

  // Handlers: Save Assignment Marks
  const handleSaveMarks = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsgId || !markStudentName.trim()) return;

    recordAssignmentMark(
      selectedAsgId,
      markStudentName.trim(),
      undefined,
      markPercent !== '' ? Number(markPercent) : undefined,
      markGrade || undefined,
      markFeedback.trim() || undefined
    );

    setMarkSavedAlert(true);
    setTimeout(() => {
      setMarkSavedAlert(false);
      setMarkStudentName('');
      setMarkPercent('');
      setMarkFeedback('');
    }, 2500);
  };

  // Assignments for current course
  const currentCourseAssignments = assignments.filter((a) => a.courseId === selectedCourseId);
  const activeAssignmentForGrading = assignments.find((a) => a.id === selectedAsgId) || currentCourseAssignments[0];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      
      {/* ---------------- TOP BANNER (Lecturer Dedicated) ---------------- */}
      <div className="rounded-3xl border border-amber-300 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100/60 p-6 sm:p-8 dark:border-amber-900/60 dark:from-slate-900 dark:via-slate-850 dark:to-amber-950/40 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-black text-slate-950 uppercase tracking-widest shadow-sm">
                🎓 LECTURER (ආචාර්ය) CONSOLE
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Academic Management Portal
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {t('Lecturer ආචාර්ය කළමනාකරණ පුවරුව', 'Lecturer Academic Console')}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              {t('පිවිස සිටින්නේ:', 'Logged in as:')}{' '}
              <strong className="text-slate-900 dark:text-white">{currentUser?.fullName}</strong>
            </p>

            {/* Privacy Shield */}
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-xs border border-emerald-300 dark:border-emerald-800">
                🔒 ශිෂ්‍ය රහස්‍යතා ආරක්ෂණය: ශිෂ්‍ය නාම සහ ලකුණු තත්ත්වය පමණක් ප්‍රදර්ශනය කෙරේ
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-xs border border-emerald-300 dark:border-emerald-800">
              {currentUser?.fullName} (Lecturer Portal)
            </span>
          </div>
        </div>

        {/* Course Filter Dropdown */}
        <div className="mt-5 flex flex-wrap items-center gap-3 pt-4 border-t border-amber-200/60 dark:border-amber-900/40">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {t('අධීක්ෂණය කරන පාඨමාලාව (Active Course):', 'Active Course:')}
          </span>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="rounded-xl border border-amber-400/50 bg-white dark:bg-slate-800 px-3.5 py-1.5 text-xs font-bold text-amber-900 dark:text-amber-300 shadow-xs"
          >
            {availableLecturerCourses.map((c) => (
              <option key={c.id} value={c.id}>
                {language === 'si' ? c.titleSi : c.titleEn} ({c.grade})
              </option>
            ))}
          </select>
        </div>

        {/* Lecturer Navigation Tabs */}
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`cursor-pointer px-4 py-2 rounded-xl transition ${
              activeTab === 'overview'
                ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 font-black shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-800'
            }`}
          >
            {t('1. සාරාංශය සහ විභාග (Overview & Exams)', '1. Overview & Exams')}
          </button>

          <button
            onClick={() => setActiveTab('recordings')}
            className={`cursor-pointer px-4 py-2 rounded-xl transition ${
              activeTab === 'recordings'
                ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 font-black shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-800'
            }`}
          >
            {t('2. පාඩම් රෙකෝඩින් (Lesson Recordings)', '2. Lesson Recordings')}
          </button>

          <button
            onClick={() => setActiveTab('zoom')}
            className={`cursor-pointer px-4 py-2 rounded-xl transition ${
              activeTab === 'zoom'
                ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 font-black shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-800'
            }`}
          >
            {t('3. සජීවී Zoom පන්ති (Live Zoom Classes)', '3. Live Zoom Classes')}
          </button>

          <button
            onClick={() => setActiveTab('assignments')}
            className={`cursor-pointer px-4 py-2 rounded-xl transition ${
              activeTab === 'assignments'
                ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 font-black shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-800'
            }`}
          >
            {t('4. පැවරුම් & ලකුණු (Assignments & Marks)', '4. Assignments & Marks')}
          </button>

          <button
            onClick={() => setActiveTab('students')}
            className={`cursor-pointer px-4 py-2 rounded-xl transition ${
              activeTab === 'students'
                ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 font-black shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-800'
            }`}
          >
            {t('5. ශිෂ්‍ය නාම සහ ලකුණු (Students & Marks)', '5. Students & Marks')}
          </button>
        </div>
      </div>

      {/* ---------------- TAB 1: OVERVIEW & EXAMS ---------------- */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* KPI Statistics: Students per course & Exam Completion */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Student Count for Selected Course */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {t('කෝස් එකට සිටින සිසුන් සංඛ්‍යාව', 'Enrolled Students')}
                </span>
                <Users className="h-4 w-4 text-amber-500" />
              </div>
              <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white font-mono">
                {enrolledStudents.length}
              </p>
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                {selectedCourse?.grade} · Active Cohort
              </span>
            </div>

            {/* Exam Completed Count */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {t('විභාගය කල සිසුන්', 'Exams Completed')}
                </span>
                <CheckCircle className="h-4 w-4 text-emerald-500" />
              </div>
              <p className="mt-3 text-3xl font-black text-emerald-600 font-mono">
                {completedResults.length}
              </p>
              <span className="text-[11px] text-emerald-600 font-semibold">
                Submitted with OMR / Grades
              </span>
            </div>

            {/* Exam Not Completed / Pending Count */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {t('විභාගය නොකළ සිසුන්', 'Pending Exam Students')}
                </span>
                <Clock className="h-4 w-4 text-rose-500" />
              </div>
              <p className="mt-3 text-3xl font-black text-rose-600 font-mono">
                {pendingStudents.length}
              </p>
              <span className="text-[11px] text-rose-500 font-semibold">
                Require Push Reminder
              </span>
            </div>
          </div>

          {/* Active Exam Header */}
          {currentExam && (
            <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 dark:border-blue-900/60 dark:bg-blue-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Target Online Exam (පවතින විභාගය):
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  {currentExam.title}
                </h3>
                <span className="text-slate-500">
                  Duration: {currentExam.durationMinutes} Mins · Total Marks: {currentExam.totalMarks} · Questions: {currentExam.questionsCount}
                </span>
              </div>

              {pendingStudents.length > 0 && (
                <button
                  onClick={handleRePushAllPending}
                  className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {batchPushed
                      ? '✓ සියලු නොකළ අයට Push කරන ලදී!'
                      : 'සියලු නොකළ අයට නැවත Push කරන්න (Re-Push to All Pending)'}
                  </span>
                </button>
              )}
            </div>
          )}

          {/* TWO SECTIONS: Exam Completed vs Exam Not Done */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* 1. COMPLETED STUDENTS SECTION */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {t('ඔන්ලයින් එක්සෑම් කල සිසුන්ගේ ලැයිස්තුව', 'Students Who Completed Exam')}
                    </h3>
                    <span className="text-[11px] text-slate-500">
                      {completedResults.length} student(s) submitted
                    </span>
                  </div>
                </div>
              </div>

              {completedResults.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  තවමත් කිසිදු සිසුවෙක් විභාගය අවසන් කර නැත.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                  {completedResults.map((res, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between text-xs"
                    >
                      <div>
                        {/* PRIVACY: Student Name ONLY */}
                        <span className="font-bold text-slate-900 dark:text-white block text-sm">
                          {res.studentName}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Submitted: {res.submittedAt || 'Recently'}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="font-mono font-bold text-emerald-600 block text-sm">
                          {res.score} / {res.maxScore}
                        </span>
                        <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                          Grade {res.grade}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. NOT-DONE / PENDING STUDENTS SECTION */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold">
                    ⏳
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {t('විභාගය නොකළ සිසුන් (නැවත Push කරන්න)', 'Pending Students (Re-Push Exam)')}
                    </h3>
                    <span className="text-[11px] text-slate-500">
                      {pendingStudents.length} student(s) pending
                    </span>
                  </div>
                </div>
              </div>

              {pendingStudents.length === 0 ? (
                <div className="p-6 text-center text-xs text-emerald-600 font-semibold">
                  ✓ සියලුම ලියාපදිංචි සිසුන් විභාගයට පෙනී සිට ඇත!
                </div>
              ) : (
                <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                  {pendingStudents.map((st) => (
                    <div
                      key={st.id}
                      className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between text-xs"
                    >
                      <div>
                        {/* PRIVACY: Student Name ONLY */}
                        <span className="font-bold text-slate-900 dark:text-white block text-sm">
                          {st.name}
                        </span>
                        <span className="text-[11px] text-rose-500 font-semibold">
                          ⚠️ විභාගය කර නොමැත (Pending)
                        </span>
                      </div>

                      <div>
                        <button
                          onClick={() => handleRePushSingle(st.name, st.id)}
                          className={`cursor-pointer inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-xs ${
                            pushedStudents[st.id]
                              ? 'bg-emerald-600 text-white'
                              : 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                          }`}
                        >
                          <Send className="w-3 h-3" />
                          <span>
                            {pushedStudents[st.id] ? '✓ Push කරන ලදී' : 'නැවත Push කරන්න'}
                          </span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* ---------------- TAB 2: LESSON RECORDINGS ---------------- */}
      {activeTab === 'recordings' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {selectedCourse?.titleSi} — {t('වීඩියෝ පාඩම් රෙකෝඩින්', 'Lesson Recordings')}
              </h2>
              <p className="text-xs text-slate-500">
                YouTube Unlisted links with Protected DRM shield & custom player controls.
              </p>
            </div>

            <button
              onClick={() => setShowAddLessonModal(true)}
              className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              <span>{t('+ නව ලෙසන් එකක් එක් කරන්න', '+ Add Lesson Recording')}</span>
            </button>
          </div>

          {/* Lessons Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {selectedCourse?.lessons.map((lesson, idx) => (
              <div
                key={lesson.id}
                className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between"
              >
                <div>
                  {/* Thumbnail with secure badge */}
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                    <img
                      src={lesson.thumbnailUrl || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80'}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/70 text-white text-[10px] font-bold backdrop-blur-xs">
                      <Lock className="w-3 h-3 text-emerald-400" />
                      <span>YouTube Unlisted</span>
                    </div>

                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 text-white font-mono text-[10px] font-bold">
                      {lesson.duration}
                    </div>

                    {/* Play button overlay */}
                    <button
                      onClick={() => setPreviewVideoUrl(lesson.videoUrl)}
                      className="cursor-pointer absolute inset-0 m-auto flex h-11 w-11 items-center justify-center rounded-full bg-amber-500 text-slate-950 shadow-lg hover:scale-110 transition"
                      title="Test play in secure player"
                    >
                      <Play className="h-5 w-5 translate-x-0.5 fill-current" />
                    </button>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                      <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold">
                        පාඩම {lesson.lessonNumber || idx + 1}
                      </span>
                      <span>{lesson.month || 'සැප්තැම්බර්'}</span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
                      {lesson.titleSi}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {lesson.summarySi}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800 mt-2 flex items-center justify-between">
                  <button
                    onClick={() => setPreviewVideoUrl(lesson.videoUrl)}
                    className="cursor-pointer text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>ප්ලේයරය පරීක්ෂා කරන්න</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm('මෙම පාඩම ඉවත් කිරීමට අවශ්‍ය බව තහවුරු කරන්න?')) {
                        deleteLessonFromCourse(selectedCourse.id, lesson.id);
                      }
                    }}
                    className="cursor-pointer text-rose-500 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    title="Delete Lesson"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------- TAB 3: LIVE ZOOM CLASSES (සජීවී Zoom පන්ති & කාලසටහන) ---------------- */}
      {activeTab === 'zoom' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Header */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-blue-500" />
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    {selectedCourse?.titleSi} — {t('සජීවී Zoom පන්ති සහ කාලසටහන (Live Zoom Class Scheduler)', 'Live Zoom Classes & Schedule')}
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                  {t(
                    'ආචාර්යවරයාට පහසුවෙන් සූම් පන්තියක් ටයිප් කර කාලසටහන්ගත කිරීමට අවශ්‍ය සියලුම පහසුකම් මෙහි සපයා ඇත. මෙහි එක්කරන සියලුම සජීවී පන්ති අදාළ පාඨමාලාව හදාරන සිසුන්ගේ Dashboard එකෙහි එම මොහොතේම පෙන්වයි.',
                    'Create and schedule live Zoom classes effortlessly. Sessions are immediately synchronized to enrolled students with direct join links, meeting IDs, and passcodes.'
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs border border-blue-500/20">
                  {zoomClasses.filter((z) => z.courseId === selectedCourseId).length} Scheduled Sessions
                </span>
              </div>
            </div>
          </div>

          {zoomSuccessMsg && (
            <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 border border-emerald-200 dark:border-emerald-800 animate-in fade-in">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>✓ සූම් පන්තිය සාර්ථකව කාලසටහන්ගත විය! එම කෝස් එක තෝරාගෙන ඇති සියලු සිසුන්ගේ Dashboard එකෙහි සහ සජීවී කැලැන්ඩරයෙහි දැන් දිස්වේ.</span>
            </div>
          )}

          {/* DEDICATED TYPE SCHEDULE / ZOOM CLASS CREATOR PANEL */}
          <div className="rounded-2xl border-2 border-amber-300 dark:border-amber-900/60 bg-gradient-to-br from-white via-amber-50/20 to-white dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 p-6 shadow-md space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-amber-200 dark:border-amber-900/40">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    {t('පන්තියක් Type කර Schedule කරන්න (Live Class Schedule Creator)', 'Type & Schedule Live Zoom Class')}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    පහත තොරතුරු සම්පූර්ණ කර '+ කාලසටහනට එක්කරන්න' ඔබන්න
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGenerateZoomCredentials}
                className="cursor-pointer px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 dark:bg-amber-950 dark:hover:bg-amber-900 text-amber-900 dark:text-amber-200 font-bold text-xs flex items-center gap-1.5 transition"
                title="නව Meeting ID සහ Passcode එකක් ස්වයංක්‍රීයව ජනනය කරන්න"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Auto-Generate ID & PIN</span>
              </button>
            </div>

            <form onSubmit={handleAddZoom} className="space-y-4 text-xs">
              {/* Row 0: Target Course Selection (for multiple courses) */}
              <div className="p-3.5 rounded-xl border border-amber-300 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 space-y-1">
                <label className="block font-bold text-slate-800 dark:text-slate-200">
                  {t('අදාළ පාඨමාලාව (Target Course for Zoom Session) *', 'Select Target Course for Zoom Session *')}
                </label>
                <select
                  value={zoomTargetCourseId || selectedCourseId}
                  onChange={(e) => setZoomTargetCourseId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs sm:text-sm font-bold text-slate-900 dark:text-white shadow-xs focus:ring-2 focus:ring-amber-500 outline-hidden"
                >
                  {availableLecturerCourses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.titleSi} — [{c.grade}] ({c.instructorNameSi})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t(
                    'ඔබ පාඨමාලා කිහිපයක් මෙහෙයවන්නේ නම් හෝ නව කෝස් එකක් සඳහා පන්තියක් යොදන්නේ නම්, අදාළ කෝස් එක මෙතැනින් තෝරන්න. එම කෝස් එක තෝරාගෙන ඇති සිසුන්ගේ කාලසටහනට මෙය ක්ෂණිකව එකතු වේ.',
                    'Select which course this Zoom session belongs to. Enrolled students of this course will receive it automatically on their dashboard calendar.'
                  )}
                </p>
              </div>

              {/* Row 1: Topic & Quick Presets */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-800 dark:text-slate-200">
                  {t('1. පන්තියේ මාතෘකාව (Session Topic / Title) *', '1. Class Topic / Subject *')}
                </label>
                <input
                  type="text"
                  required
                  value={zoomTopic}
                  onChange={(e) => setZoomTopic(e.target.value)}
                  placeholder="e.g. සංකීර්ණ සංඛ්‍යා සහ ත්‍රිකෝණමිතිය - පූර්ණ සිද්ධාන්ත සහ විභාග ප්‍රශ්න පත්‍ර සාකච්ඡාව"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white shadow-xs focus:ring-2 focus:ring-amber-500 outline-hidden"
                />

                {/* Quick Topic Chips */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-500 font-medium">ක්ෂණික මාතෘකා:</span>
                  {[
                    'පූර්ණ සිද්ධාන්ත පාඩම (Full Theory)',
                    'Speed Revision & Paper Discussion',
                    'විභාග ඉලක්කගත විශේෂ ගැටළු විවරණය',
                    'මාසික ප්‍රශ්න පත්‍ර සාකච්ඡාව (Monthly Paper)',
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setZoomTopic(preset)}
                      className="cursor-pointer text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-950/60 text-slate-700 dark:text-slate-300 font-medium transition"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 2: Category, Lesson Number, Date, Time Schedule */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                    {t('2. පන්ති කාණ්ඩය (Class Type)', '2. Class Type')}
                  </label>
                  <select
                    value={zoomCategory}
                    onChange={(e) => setZoomCategory(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 font-bold text-slate-900 dark:text-white"
                  >
                    <option value="Theory">සිද්ධාන්ත (Theory Class)</option>
                    <option value="Revision">පුනරීක්ෂණ (Revision Class)</option>
                    <option value="Paper Class">ප්‍රශ්න පත්‍ර (Paper Class)</option>
                    <option value="Special Class">විශේෂ සම්මන්ත්‍රණය (Special Class)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                    {t('3. ලෙසන්ස් අංකය (Lesson No.)', '3. Lesson No.')}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={zoomLessonNumber}
                    onChange={(e) => setZoomLessonNumber(Number(e.target.value) || 1)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 font-mono font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                    {t('4. පවත්වන දිනය (Schedule Date) *', '4. Schedule Date *')}
                  </label>
                  <input
                    type="date"
                    required
                    value={zoomDate}
                    onChange={(e) => setZoomDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 font-mono font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                    {t('5. කාල පරාසය (Time Schedule) *', '5. Time Schedule *')}
                  </label>
                  <input
                    type="text"
                    required
                    value={zoomTime}
                    onChange={(e) => setZoomTime(e.target.value)}
                    placeholder="07:00 PM - 09:30 PM"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 font-mono font-semibold"
                  />
                </div>
              </div>

              {/* Time Presets */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] text-slate-500 font-medium">වේලාවන්:</span>
                {[
                  '07:00 PM - 09:30 PM',
                  '08:00 AM - 12:30 PM',
                  '02:00 PM - 05:00 PM',
                  '06:00 PM - 08:30 PM',
                  '03:30 PM - 06:30 PM',
                ].map((timePreset) => (
                  <button
                    key={timePreset}
                    type="button"
                    onClick={() => setZoomTime(timePreset)}
                    className={`cursor-pointer text-[10px] px-2 py-0.5 rounded-md font-mono transition ${
                      zoomTime === timePreset
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {timePreset}
                  </button>
                ))}
              </div>

              {/* Row 3: Zoom Join Link, Meeting ID, Passcode */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-6">
                  <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                    {t('5. Zoom Join Link (සම්බන්ධ වීමේ සබැඳිය)', '5. Zoom Join URL')}
                  </label>
                  <input
                    type="url"
                    value={zoomLink}
                    onChange={(e) => setZoomLink(e.target.value)}
                    placeholder="https://zoom.us/j/89241027741?pwd=..."
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 font-mono text-xs text-blue-600 dark:text-blue-400 font-semibold"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                    {t('Meeting ID', 'Meeting ID')}
                  </label>
                  <input
                    type="text"
                    value={zoomMeetingId}
                    onChange={(e) => setZoomMeetingId(e.target.value)}
                    placeholder="892 4102 7741"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 font-mono font-bold"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                    {t('Passcode (මුරපදය)', 'Passcode')}
                  </label>
                  <input
                    type="text"
                    value={zoomPasscode}
                    onChange={(e) => setZoomPasscode(e.target.value)}
                    placeholder="MC2028"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Special Instructions for Students */}
              <div>
                <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                  {t('සිසුන් සඳහා උපදෙස් / සටහන් (Instructions / Notice for Students)', 'Instructions for Students')}
                </label>
                <input
                  type="text"
                  value={zoomInstructions}
                  onChange={(e) => setZoomInstructions(e.target.value)}
                  placeholder="e.g. සියලු සිසුන් නිබන්ධනයේ 10 පිටුවේ ගැටළු සූදානම් කරගෙන සම්බන්ධ වන්න."
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-md shadow-amber-500/20 hover:scale-[1.02] active:scale-98 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('✓ සූම් පන්තිය කාලසටහන්ගත කරන්න (Schedule Class)', 'Schedule Zoom Class Now')}</span>
                </button>
              </div>
            </form>
          </div>

          {/* LIST OF SCHEDULED ZOOM CLASSES */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{t('කාලසටහන්ගත කර ඇති සජීවී පන්ති ලැයිස්තුව', 'Scheduled Zoom Sessions')}</span>
                <span className="text-xs text-slate-500">
                  ({zoomClasses.filter((z) => z.courseId === selectedCourseId).length})
                </span>
              </h3>
            </div>

            {zoomClasses.filter((z) => z.courseId === selectedCourseId).length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-800 p-8 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2">
                <Video className="w-8 h-8 mx-auto text-slate-400" />
                <p className="font-bold text-sm text-slate-700 dark:text-slate-300">
                  මෙම පාඨමාලාව සඳහා තවමත් Zoom පන්ති කාලසටහන්ගත කර නොමැත.
                </p>
                <p>
                  ඉහත 'පන්තියක් Type කර Schedule කරන්න' පෝරමය මගින් අලුත් සජීවී පන්තියක් එක් කරන්න.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {zoomClasses
                  .filter((z) => z.courseId === selectedCourseId)
                  .map((zClass) => {
                    const isCopied = copiedInviteId === zClass.id;
                    return (
                      <div
                        key={zClass.id}
                        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4 hover:border-amber-400 transition"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                                <span>Interactive Live Zoom</span>
                              </span>
                            </div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5 leading-snug">
                              {zClass.topic}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 font-mono">
                              <span>📅 {zClass.date}</span>
                              <span>·</span>
                              <span>⏰ {zClass.time}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              if (confirm(`"${zClass.topic}" Zoom පන්තිය ඉවත් කිරීමට අවශ්‍ය බව තහවුරු කරන්න?`)) {
                                deleteZoomClass(zClass.id);
                              }
                            }}
                            className="cursor-pointer text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                            title="Delete Zoom class"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Meeting Credentials Card */}
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-xs space-y-1 font-mono text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Meeting ID:</span>
                            <span className="font-bold text-slate-900 dark:text-white">{zClass.meetingId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Passcode:</span>
                            <span className="font-bold text-amber-600 dark:text-amber-400">{zClass.passcode}</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 pt-1">
                          <a
                            href={zClass.joinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs text-center flex items-center justify-center gap-1.5 shadow-sm transition"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Start Class as Host (ආරම්භ කරන්න)</span>
                          </a>

                          <button
                            type="button"
                            onClick={() => handleCopyZoomInvite(zClass)}
                            className={`cursor-pointer px-3.5 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
                              isCopied
                                ? 'bg-emerald-500 text-white border-emerald-500'
                                : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200'
                            }`}
                            title="සිසුන්ට යැවීම සඳහා ආරාධනාව Copy කරන්න"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>{isCopied ? 'Copied!' : 'Copy Invite'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------- TAB 4: ASSIGNMENTS & MARKS (පැවරුම් සහ ලකුණු) ---------------- */}
      {activeTab === 'assignments' && (
        <div className="space-y-8 animate-in fade-in">
          
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-500" />
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {t('පැවරුම් සහ ලකුණු කළමනාකරණය (Assignments & Marks)', 'Assignments & Evaluation Marks')}
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {t(
                  'ඔන්ලයින් විභාග ඔටෝ ලකුණු, පැවරුම් ලකුණු ඇතුළත් කිරීම සහ ලෙක්චරර් විසින් ඇඩ් කළ සියලු ලකුණු වෙන වෙනම කළමනාකරණය කරන්න.',
                  'View auto-graded online exam results, manually record assignment marks, and view verified score history.'
                )}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddAssignmentModal(true)}
                className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition"
              >
                <Upload className="w-4 h-4" />
                <span>{t('+ නව පැවරුමක් Upload කරන්න (PDF)', '+ Upload Assignment PDF')}</span>
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 1: ඔන්ලයින් එක්සෑම් ඔටෝ ලකුණු ලැයිස්තුව (ONLINE EXAM AUTO MARKS) */}
          {/* ========================================================================= */}
          <section className="space-y-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono font-bold text-xs">
                    1
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {t('ඔන්ලයින් එක්සෑම් ස්වයංක්‍රීය ලකුණු ලැයිස්තුව', 'Online Exam Auto-Graded Student Marks')}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono font-bold text-[11px]">
                    {courseExams.flatMap((e) => e.results || []).length} Completed
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  සිසුන් ඔන්ලයින් MCQ එක්සෑම් එක සිදුකළ පසු ස්වයංක්‍රීයව ලකුණු වැටුණු සිසුන්ගේ නාම ලේඛනය සහ ලකුණු තත්වය. (Privacy Protected: ශිෂ්‍ය නම පමණි).
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={examResultsSearch}
                  onChange={(e) => setExamResultsSearch(e.target.value)}
                  placeholder="ශිෂ්‍ය නමින් සොයන්න..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-1.5 pl-8 pr-3 text-xs"
                />
              </div>
            </div>

            {/* Results Table */}
            {(() => {
              const allExamResults = courseExams.flatMap((exam) =>
                (exam.results || []).map((r) => ({
                  ...r,
                  examId: exam.id,
                  examTitle: exam.title,
                }))
              );
              const filtered = allExamResults.filter((r) =>
                !examResultsSearch || r.studentName.toLowerCase().includes(examResultsSearch.toLowerCase())
              );

              if (filtered.length === 0) {
                return (
                  <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                    මෙම පාඨමාලාවට අදාළව ඔන්ලයින් විභාග කළ සිසුන්ගේ ලකුණු වාර්තා තවමත් නොමැත.
                  </div>
                );
              }

              return (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-3">ශිෂ්‍යයාගේ නම (Student Name)</th>
                        <th className="py-2.5 px-3">විභාගය (Exam)</th>
                        <th className="py-2.5 px-3 text-center">ලකුණු (Score / %)</th>
                        <th className="py-2.5 px-3 text-center">සාමාර්ථ තත්ත්වය</th>
                        <th className="py-2.5 px-3 text-right">අවසන් කළ දිනය</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                      {filtered.map((res, idx) => {
                        const max = res.maxScore || 100;
                        const percent = max > 0 ? Math.round((res.score / max) * 100) : 0;
                        const isHigh = percent >= 75 || res.grade === 'A+' || res.grade === 'A';
                        const isMid = percent >= 50 || res.grade === 'B' || res.grade === 'C';

                        return (
                          <tr key={`${res.examId}-${res.studentId}-${idx}`} className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition">
                            <td className="py-3 px-3 font-mono text-slate-400">{idx + 1}</td>
                            <td className="py-3 px-3">
                              {/* STRICT PRIVACY: Student Name ONLY */}
                              <span className="font-bold text-slate-900 dark:text-white">
                                {res.studentName}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                              {res.examTitle}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className="font-mono font-bold text-slate-900 dark:text-white">
                                {res.score}/{max}
                              </span>
                              <span className="ml-1.5 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono font-bold text-[11px]">
                                {percent}%
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                  isHigh
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                    : isMid
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                }`}
                              >
                                {res.grade ? `Grade ${res.grade}` : isHigh ? '✓ A Pass (විශිෂ්ට)' : isMid ? '✓ Passed (සමත්)' : 'Needs Revision'}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right text-slate-500 font-mono text-[11px]">
                              {res.submittedAt || 'Recent'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </section>

          {/* ========================================================================= */}
          {/* SECTION 2 & 3: MANUAL MARKS ENTRY OPTION + LECTURER ADDED MARKS SECTION */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* ---------------- SECTION 2: MANUAL MARKS ENTRY FORM (5 cols) ---------------- */}
            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono font-bold text-xs">
                    2
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {t('පැවරුම් ලකුණු ඇතුළත් කිරීමේ විකල්පය', 'Manual Assignment Marks Entry')}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      ශිෂ්‍යයාගේ නම තෝරා හෝ ටයිප් කර ලකුණු සටහන් කරන්න. (Privacy Protected: ශිෂ්‍ය නම පමණි).
                    </p>
                  </div>
                </div>

                {markSavedAlert && (
                  <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                    <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>✓ ශිෂ්‍යයාගේ ලකුණු සාර්ථකව සටහන් විය! ශිෂ්‍යයාගේ Dashboard එකට එක්විය.</span>
                  </div>
                )}

                <form onSubmit={handleSaveMarks} className="space-y-3.5 text-xs">
                  {/* Select Assignment */}
                  <div>
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                      {t('අදාළ පැවරුම (Select Assignment) *', 'Select Assignment *')}
                    </label>
                    <select
                      value={selectedAsgId}
                      onChange={(e) => setSelectedAsgId(e.target.value)}
                      required
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 font-bold"
                    >
                      {currentCourseAssignments.length === 0 ? (
                        <option value="">පැවරුම් නොමැත - පළමුව පැවරුමක් Upload කරන්න</option>
                      ) : (
                        currentCourseAssignments.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.title} ({a.month})
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  {/* Student Name Picker OR Direct Typing */}
                  <div>
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                      {t('ශිෂ්‍යයාගේ නම (Student Name - තෝරන්න හෝ ටයිප් කරන්න) *', 'Student Name *')}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={markStudentName}
                        onChange={(e) => setMarkStudentName(e.target.value)}
                        placeholder="e.g. Kasun Malinda Perera"
                        className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 font-semibold text-slate-900 dark:text-white"
                      />
                      <select
                        onChange={(e) => {
                          if (e.target.value) setMarkStudentName(e.target.value);
                        }}
                        className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-2 text-xs text-slate-600 dark:text-slate-300 max-w-[130px]"
                        title="ලැයිස්තුවෙන් සිසුන්ගේ නම් තෝරන්න"
                      >
                        <option value="">ලැයිස්තුවෙන්...</option>
                        {enrolledStudents.map((st) => (
                          <option key={st.id} value={st.name}>
                            {st.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Marks: Percentage & Grade */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                        {t('ලකුණු ප්‍රතිශතය (%)', 'Marks %')}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={markPercent}
                          onChange={(e) => setMarkPercent(e.target.value === '' ? '' : Number(e.target.value))}
                          placeholder="85"
                          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 font-mono font-bold pr-7"
                        />
                        <span className="absolute right-2.5 top-2.5 text-slate-400 font-bold">%</span>
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                        {t('සාමාර්ථය (Grade)', 'Grade')}
                      </label>
                      <select
                        value={markGrade}
                        onChange={(e) => setMarkGrade(e.target.value as any)}
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 font-bold text-amber-600"
                      >
                        <option value="A+">A+ (විශිෂ්ට)</option>
                        <option value="A">A (විශිෂ්ට)</option>
                        <option value="B">B (ඉහළ)</option>
                        <option value="C">C (සම්මාන)</option>
                        <option value="S">S (සාමාන්‍ය)</option>
                        <option value="F">F (අසමත්)</option>
                      </select>
                    </div>
                  </div>

                  {/* Feedback Note */}
                  <div>
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                      {t('ආචාර්ය සටහන (Feedback / Remarks)', 'Remarks (Optional)')}
                    </label>
                    <input
                      type="text"
                      value={markFeedback}
                      onChange={(e) => setMarkFeedback(e.target.value)}
                      placeholder="e.g. Excellent solutions, very neat presentation."
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={currentCourseAssignments.length === 0}
                    className="cursor-pointer w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold shadow-md transition"
                  >
                    {t('ලකුණු සටහන් කරන්න (Save Marks to System)', 'Save Marks to System')}
                  </button>
                </form>
              </div>
            </div>

            {/* ---------------- SECTION 3: LECTURER ADDED ASSIGNMENT MARKS (7 cols) ---------------- */}
            <div className="lg:col-span-7 space-y-4">
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs">
                        3
                      </span>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {t('ලෙක්චරර් විසින් ඇඩ් කළ පැවරුම් ලකුණු ලැයිස්තුව', 'Lecturer-Recorded Assignment Marks')}
                      </h3>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      පැවරුම් සඳහා ඔබ විසින් සිස්ටම් එකට එක් කළ සියලු ශිෂ්‍ය ලකුණු තත්වයන් මෙහි දිස්වේ.
                    </p>
                  </div>

                  {/* Filters: By Assignment and Search by Name */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <select
                      value={filterAsgId}
                      onChange={(e) => setFilterAsgId(e.target.value)}
                      className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300"
                    >
                      <option value="all">සියලු පැවරුම් ({currentCourseAssignments.length})</option>
                      {currentCourseAssignments.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.title.substring(0, 24)}...
                        </option>
                      ))}
                    </select>

                    <div className="relative">
                      <Search className="w-3 h-3 absolute left-2.5 top-2 text-slate-400" />
                      <input
                        type="text"
                        value={assignmentMarksSearch}
                        onChange={(e) => setAssignmentMarksSearch(e.target.value)}
                        placeholder="නම සොයන්න..."
                        className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-1 pl-7 pr-2.5 text-xs w-32 sm:w-40"
                      />
                    </div>
                  </div>
                </div>

                {/* Graded Assignment Marks Table */}
                {(() => {
                  const allGradedList = currentCourseAssignments.flatMap((asg) =>
                    (asg.submissions || []).map((sub) => ({
                      ...sub,
                      assignmentId: asg.id,
                      assignmentTitle: asg.title,
                      assignmentMonth: asg.month,
                    }))
                  );

                  const filtered = allGradedList.filter((m) => {
                    const matchName = !assignmentMarksSearch || m.studentName.toLowerCase().includes(assignmentMarksSearch.toLowerCase());
                    const matchAsg = filterAsgId === 'all' || m.assignmentId === filterAsgId;
                    return matchName && matchAsg;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                        මෙම තේරීම සඳහා තවමත් කිසිදු ශිෂ්‍යයෙකුට පැවරුම් ලකුණු ලබාදී නැත. වම්පස පෝරමයෙන් ලකුණු ඇතුළත් කරන්න.
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                      {filtered.map((item, idx) => (
                        <div
                          key={`${item.assignmentId}-${item.studentName}-${idx}`}
                          className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs hover:border-amber-400 transition"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {/* STRICT PRIVACY: Student Name ONLY */}
                              <span className="font-bold text-slate-900 dark:text-white text-sm">
                                {item.studentName}
                              </span>
                              {item.grade && (
                                <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-black text-[10px] border border-emerald-300 dark:border-emerald-800">
                                  Grade {item.grade}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500">
                              <span className="font-semibold text-slate-700 dark:text-slate-300">
                                {item.assignmentTitle}
                              </span>
                              <span>·</span>
                              <span>{item.assignmentMonth}</span>
                            </div>
                            {item.feedback && (
                              <p className="text-[11px] text-slate-400 italic">
                                "{item.feedback}"
                              </p>
                            )}
                          </div>

                          <div className="text-right">
                            <div className="font-mono text-base font-black text-amber-600 dark:text-amber-400">
                              {item.marksPercent !== undefined ? `${item.marksPercent}%` : item.grade || 'Graded'}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {item.submittedAt || 'Recorded'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* SECTION 4: COURSE ASSIGNMENT PDFS (පාඨමාලාවේ පවතින පැවරුම්) */}
          {/* ========================================================================= */}
          <section className="space-y-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {t('පාඨමාලාවේ පවතින පැවරුම් පත්‍රිකා (Course Assignment Files)', 'Course Assignment Files')}
                </h3>
                <p className="text-xs text-slate-500">
                  සිසුන්ට Dashboard එකෙන් විවෘත වන ආරක්ෂිත PDF පත්‍රිකා මෙතැනින් පරීක්ෂා කරන්න.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-amber-600 bg-amber-500/10 px-3 py-1 rounded-full">
                {currentCourseAssignments.length} Assignments
              </span>
            </div>

            {currentCourseAssignments.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                මෙම පාඨමාලාව සඳහා තවමත් පැවරුම් එකතු කර නැත. ඉහත '+ නව පැවරුමක් Upload කරන්න' බටනය ඔබන්න.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentCourseAssignments.map((asg) => (
                  <div
                    key={asg.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850/60 flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-[10px]">
                          {asg.month || 'මාසික පැවරුම'}
                        </span>
                        <button
                          onClick={() => {
                            if (confirm('මෙම පැවරුම ඉවත් කරන්නද?')) deleteAssignment(asg.id);
                          }}
                          className="cursor-pointer text-slate-400 hover:text-rose-500 p-1"
                          title="Delete Assignment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-2 line-clamp-1">
                        {asg.title}
                      </h4>
                      <p className="text-[11px] text-rose-500 font-semibold mt-1">
                        භාරදීමේ දිනය: {asg.dueDate}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <span className="text-emerald-600 font-bold text-xs">
                        {asg.submissions?.length || 0} ලකුණු ලබාදී ඇත
                      </span>
                      <button
                        onClick={() => setSelectedAsgForPreview(asg)}
                        className="cursor-pointer px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>ආරක්ෂිතව බලන්න</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      )}

      {/* ---------------- TAB 5: ENROLLED STUDENTS & MARKS (ශිෂ්‍ය නාම හා ලකුණු තත්ත්වය) ---------------- */}
      {activeTab === 'students' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Header & Privacy Notice */}
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/50 dark:from-slate-900 dark:via-emerald-950/30 dark:to-slate-900 p-5 sm:p-6 rounded-3xl border border-emerald-300 dark:border-emerald-800/60 shadow-sm space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-black text-xs uppercase tracking-wider shadow-xs">
                    🔒 STRICT STUDENT PRIVACY SHIELD
                  </span>
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    {selectedCourse?.titleSi} ({selectedCourse?.grade})
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-2">
                  {t('පාඨමාලාවේ සිසුන් සහ ලකුණු තත්ත්වය (Student Names & Marks)', 'Enrolled Students & Performance Status')}
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-3xl">
                  {t(
                    '⚠️ පද්ධති රීතිය: ආචාර්යවරයාට බැලිය හැක්කේ සිසුවාගේ සම්පූර්ණ නම සහ එක්සෑම්/පැවරුම් ලකුණු තත්ත්වය පමණි. දුරකථන අංක, දෙමාපියන්ගේ අංක, ගෙවීම් ස්ලිප් හෝ පෞද්ගලික ලිපින කිසිසේත්ම ප්‍රදර්ශනය නොවේ.',
                    '⚠️ Strict Privacy Rule: Lecturers are restricted to viewing only the Student Full Name and academic scores/marks. Phone numbers, parent contact details, fee receipts, and addresses are strictly confidential.'
                  )}
                </p>
              </div>

              {/* Quick Search Input */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={studentListSearch}
                  onChange={(e) => setStudentListSearch(e.target.value)}
                  placeholder={t('ශිෂ්‍ය නමින් සොයන්න...', 'Search by student name...')}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs"
                />
              </div>
            </div>

            {/* Quick KPI Counters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-emerald-200/60 dark:border-emerald-900/40 text-xs">
              <div className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-xl border border-emerald-200 dark:border-slate-700">
                <span className="text-slate-500 font-semibold block text-[11px]">සම්පූර්ණ සිසුන්</span>
                <span className="text-lg font-black text-slate-900 dark:text-white font-mono">{enrolledStudents.length}</span>
              </div>
              <div className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-xl border border-emerald-200 dark:border-slate-700">
                <span className="text-emerald-600 font-semibold block text-[11px]">විභාගය කළ සිසුන්</span>
                <span className="text-lg font-black text-emerald-600 font-mono">{completedResults.length}</span>
              </div>
              <div className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-xl border border-emerald-200 dark:border-slate-700">
                <span className="text-rose-500 font-semibold block text-[11px]">විභාගය නොකළ (Pending)</span>
                <span className="text-lg font-black text-rose-600 font-mono">{pendingStudents.length}</span>
              </div>
              <div className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-xl border border-emerald-200 dark:border-slate-700">
                <span className="text-blue-600 font-semibold block text-[11px]">රහස්‍යතා තත්ත්වය</span>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 block mt-1">✓ 100% Protected</span>
              </div>
            </div>
          </div>

          {/* Students Marks & Evaluation Table */}
          <div className="overflow-x-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 text-[11px]">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">ශිෂ්‍යයාගේ නම (Student Name)</th>
                  <th className="py-3 px-4">ඔන්ලයින් විභාග ලකුණු (Online Exam Score)</th>
                  <th className="py-3 px-4">පැවරුම් ලකුණු (Assignment Marks)</th>
                  <th className="py-3 px-4 text-center">සමස්ත සාමාර්ථය (Overall Grade)</th>
                  <th className="py-3 px-4 text-right">ක්‍රියාමාර්ග (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 font-medium">
                {(() => {
                  const filtered = enrolledStudents.filter((st) =>
                    !studentListSearch || st.name.toLowerCase().includes(studentListSearch.toLowerCase())
                  );

                  if (filtered.length === 0) {
                    return (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          {enrolledStudents.length === 0
                            ? 'මෙම පාඨමාලාවට තවමත් කිසිදු ශිෂ්‍යයෙක් ලියාපදිංචි වී නොමැත.'
                            : 'සොයන ලද නමින් ශිෂ්‍යයෙකු හමු නොවීය.'}
                        </td>
                      </tr>
                    );
                  }

                  return filtered.map((st, idx) => {
                    // Look up exam result for this student
                    const examResult = completedResults.find((r) => r.studentId === st.id);
                    
                    // Look up assignment marks for this student
                    const studentSubmissions = currentCourseAssignments.flatMap((a) =>
                      (a.submissions || []).filter(
                        (sub) => sub.studentName.toLowerCase() === st.name.toLowerCase() || sub.studentId === st.id
                      )
                    );
                    const latestAsgSub = studentSubmissions[studentSubmissions.length - 1];

                    const hasExamDone = !!examResult;
                    const examScoreText = hasExamDone
                      ? `${examResult.score}/${examResult.maxScore || 100} (${Math.round((examResult.score / (examResult.maxScore || 100)) * 100)}%)`
                      : '⏳ නොකරන ලදී (Pending)';

                    const asgScoreText = latestAsgSub
                      ? latestAsgSub.marksPercent !== undefined
                        ? `${latestAsgSub.marksPercent}% (Grade ${latestAsgSub.grade || 'A'})`
                        : `Grade ${latestAsgSub.grade || 'A'}`
                      : 'සටහන් කර නොමැත';

                    const overallGrade = examResult?.grade || latestAsgSub?.grade || (hasExamDone ? 'A' : 'Pending');

                    return (
                      <tr key={st.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-850/50 transition">
                        <td className="py-3.5 px-4 font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-3.5 px-4">
                          {/* STRICT PRIVACY: Student Name ONLY. No phone, no parent phone, no address, no slips */}
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs uppercase">
                              {st.name.charAt(0)}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white block text-sm">
                                {st.name}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {selectedCourse?.grade} · Active Student
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 font-mono font-bold text-xs ${
                              hasExamDone ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
                            }`}
                          >
                            {examScoreText}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="text-slate-700 dark:text-slate-300 font-mono text-xs">
                            {asgScoreText}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              overallGrade === 'A+' || overallGrade === 'A'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                : overallGrade === 'B' || overallGrade === 'C'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                          >
                            {overallGrade === 'Pending' ? 'තක්සේරු වෙමින්' : `Grade ${overallGrade}`}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            {!hasExamDone ? (
                              <button
                                onClick={() => handleRePushSingle(st.name, st.id)}
                                className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-xs ${
                                  pushedStudents[st.id]
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                                }`}
                              >
                                {pushedStudents[st.id] ? '✓ Push කරන ලදී' : 'නැවත Push කරන්න'}
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setSelectedAsgId(currentCourseAssignments[0]?.id || '');
                                  setMarkStudentName(st.name);
                                  setActiveTab('assignments');
                                }}
                                className="cursor-pointer px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold"
                              >
                                + පැවරුම් ලකුණු
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------- MODAL: Add Lesson Recording ---------------- */}
      {showAddLessonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t('නව පාඩම් රෙකෝඩින් එකක් එක් කරන්න', 'Add New Lesson Recording')}
              </h3>
              <button
                onClick={() => setShowAddLessonModal(false)}
                className="cursor-pointer text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddLesson} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold mb-1">
                  ටයිටල් එක (Lesson Title - සිංහල) *
                </label>
                <input
                  type="text"
                  required
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  placeholder="e.g. ත්‍රිකෝණමිතික සර්වසාම්‍ය සහ පරිවර්තන සූත්‍ර - 01 කොටස"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  English Title (ඉංග්‍රීසි මාතෘකාව)
                </label>
                <input
                  type="text"
                  value={lessonTitleEn}
                  onChange={(e) => setLessonTitleEn(e.target.value)}
                  placeholder="e.g. Trigonometric Identities & Transformations - Part 01"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">මාසය (Month)</label>
                  <select
                    value={lessonMonth}
                    onChange={(e) => setLessonMonth(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5"
                  >
                    <option value="ජනවාරි (January)">ජනවාරි (January)</option>
                    <option value="පෙබරවාරි (February)">පෙබරවාරි (February)</option>
                    <option value="මාර්තු (March)">මාර්තු (March)</option>
                    <option value="අප්‍රේල් (April)">අප්‍රේල් (April)</option>
                    <option value="මැයි (May)">මැයි (May)</option>
                    <option value="ජූනි (June)">ජූනි (June)</option>
                    <option value="ජූලි (July)">ජූලි (July)</option>
                    <option value="අගෝස්තු (August)">අගෝස්තු (August)</option>
                    <option value="සැප්තැම්බර් (September)">සැප්තැම්බර් (September)</option>
                    <option value="ඔක්තෝබර් (October)">ඔක්තෝබර් (October)</option>
                    <option value="නොවැම්බර් (November)">නොවැම්බර් (November)</option>
                    <option value="දෙසැම්බර් (December)">දෙසැම්බර් (December)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">
                    කීවෙනි ලෙසන්ස් එකද (Lesson No.)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={lessonNumber}
                    onChange={(e) => setLessonNumber(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  යූටියුබ් අන්ලිස්ට් ලින්ක් එක (YouTube Unlisted / Embed URL) *
                </label>
                <input
                  type="text"
                  required
                  value={lessonYoutubeUrl}
                  onChange={(e) => setLessonYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... හෝ https://youtu.be/..."
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 font-mono text-blue-600"
                />
                <p className="mt-1 text-[11px] text-slate-500">
                  ආරක්ෂිත එම්බඩ් ප්ලේයරය මගින් Share, Like, Right-Click අවහිර කර රතු/කොළ Timeline සහිතව සිසුවාට පෙන්වනු ඇත.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">
                    තම්නේල් එකක් (Thumbnail Image URL)
                  </label>
                  <input
                    type="text"
                    value={lessonThumbnailUrl}
                    onChange={(e) => setLessonThumbnailUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">කාලය (Duration)</label>
                  <input
                    type="text"
                    value={lessonDuration}
                    onChange={(e) => setLessonDuration(e.target.value)}
                    placeholder="e.g. 2h 15m"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">පාඩම් සාරාංශය (Summary)</label>
                <textarea
                  rows={2}
                  value={lessonSummary}
                  onChange={(e) => setLessonSummary(e.target.value)}
                  placeholder="ත්‍රිකෝණමිතියේ මූලික සූත්‍ර 14 සහ ඒවා උසස් පෙළ ප්‍රශ්න සඳහා යොදාගන්නා ක්‍රමවේද..."
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddLessonModal(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  අවලංගු කරන්න
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-md cursor-pointer"
                >
                  ලෙසන් එක එක් කරන්න
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- MODAL: Add Zoom Class ---------------- */}
      {showAddZoomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t('සජීවී Zoom පන්තියක් Create කිරීම', 'Schedule Live Zoom Session')}
              </h3>
              <button
                onClick={() => setShowAddZoomModal(false)}
                className="cursor-pointer text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddZoom} className="space-y-3.5 text-xs">
              {/* Target Course Selector */}
              <div>
                <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                  {t('අදාළ පාඨමාලාව (Target Course) *', 'Select Course *')}
                </label>
                <select
                  value={zoomTargetCourseId || selectedCourseId}
                  onChange={(e) => setZoomTargetCourseId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 font-bold text-slate-900 dark:text-white"
                >
                  {availableLecturerCourses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.titleSi} — [{c.grade}] ({c.instructorNameSi})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">මාතෘකාව (Session Topic) *</label>
                <input
                  type="text"
                  required
                  value={zoomTopic}
                  onChange={(e) => setZoomTopic(e.target.value)}
                  placeholder="e.g. සංකීර්ණ සංඛ්‍යා සහ ත්‍රිකෝණමිතිය විශේෂ සජීවී ගැටළු සාකච්ඡාව"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">පන්ති කාණ්ඩය (Class Type)</label>
                  <select
                    value={zoomCategory}
                    onChange={(e) => setZoomCategory(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 font-bold text-slate-900 dark:text-white"
                  >
                    <option value="Theory">සිද්ධාන්ත (Theory)</option>
                    <option value="Revision">පුනරීක්ෂණ (Revision)</option>
                    <option value="Paper Class">ප්‍රශ්න පත්‍ර (Paper Class)</option>
                    <option value="Special Class">විශේෂ (Special Class)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">ලෙසන්ස් අංකය (Lesson Number)</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={zoomLessonNumber}
                    onChange={(e) => setZoomLessonNumber(Number(e.target.value) || 1)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 font-mono font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">දිනය (Date)</label>
                  <input
                    type="date"
                    value={zoomDate}
                    onChange={(e) => setZoomDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">වේලාව (Time)</label>
                  <input
                    type="text"
                    value={zoomTime}
                    onChange={(e) => setZoomTime(e.target.value)}
                    placeholder="07:00 PM - 09:30 PM"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold">Zoom Join Link (ශිෂ්‍යයින් සඳහා)</label>
                  <button
                    type="button"
                    onClick={handleGenerateZoomCredentials}
                    className="text-[10px] text-amber-600 dark:text-amber-400 font-bold hover:underline cursor-pointer"
                  >
                    ✨ Auto-Generate ID & PIN
                  </button>
                </div>
                <input
                  type="url"
                  value={zoomLink}
                  onChange={(e) => setZoomLink(e.target.value)}
                  placeholder="https://zoom.us/j/89241027741?pwd=..."
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 font-mono text-blue-600 dark:text-blue-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Meeting ID</label>
                  <input
                    type="text"
                    value={zoomMeetingId}
                    onChange={(e) => setZoomMeetingId(e.target.value)}
                    placeholder="892 4102 7741"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Passcode</label>
                  <input
                    type="text"
                    value={zoomPasscode}
                    onChange={(e) => setZoomPasscode(e.target.value)}
                    placeholder="MONARCH28"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 font-mono font-bold text-amber-600 dark:text-amber-400"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddZoomModal(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  අවලංගු කරන්න
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Zoom පන්තිය Schedule කරන්න
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- MODAL: Add Assignment (PDF) ---------------- */}
      {showAddAssignmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t('නව පැවරුමක් Upload කිරීම (PDF Assignment)', 'Upload New Assignment')}
              </h3>
              <button
                onClick={() => setShowAddAssignmentModal(false)}
                className="cursor-pointer text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAssignment} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold mb-1">
                  පැවරුම් මාතෘකාව (Assignment Title) *
                </label>
                <input
                  type="text"
                  required
                  value={asgTitle}
                  onChange={(e) => setAsgTitle(e.target.value)}
                  placeholder="e.g. මාසික පැවරුම 02: කලනය හා සීමා ප්‍රායෝගික ගැටළු"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">අදාළ මාසය (Month)</label>
                  <select
                    value={asgMonth}
                    onChange={(e) => setAsgMonth(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5"
                  >
                    <option value="සැප්තැම්බර් (September)">සැප්තැම්බර් (September)</option>
                    <option value="ඔක්තෝබර් (October)">ඔක්තෝබර් (October)</option>
                    <option value="නොවැම්බර් (November)">නොවැම්බර් (November)</option>
                    <option value="දෙසැම්බර් (December)">දෙසැම්බර් (December)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">භාරදීමේ අවසන් දිනය (Due Date)</label>
                  <input
                    type="date"
                    value={asgDueDate}
                    onChange={(e) => setAsgDueDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300">
                    {t('පැවරුම් PDF ලිපිනය / Google Drive File URL *', 'Assignment PDF or Google Drive URL *')}
                  </label>
                  <div className="flex items-center gap-1.5">
                    {asgPdfUrl && (
                      <button
                        type="button"
                        onClick={() => setAsgPdfUrl('')}
                        className="text-[11px] text-rose-500 hover:underline cursor-pointer"
                      >
                        මකන්න (Clear)
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handlePastePdfUrl}
                      className="cursor-pointer px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[11px] flex items-center gap-1 shadow-xs transition"
                      title="Clipboard එකෙන් Link එක මෙතැනට Paste කරන්න"
                    >
                      <Clipboard className="w-3 h-3" />
                      <span>{pasteCopiedStatus ? '✓ Pasted!' : '📋 Paste (පේස්ට්)'}</span>
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="url"
                    required
                    value={asgPdfUrl}
                    onChange={(e) => setAsgPdfUrl(e.target.value)}
                    placeholder="https://drive.google.com/file/d/... හෝ https://.../assignment.pdf"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 font-mono text-xs text-blue-600 dark:text-blue-400 font-semibold"
                  />
                </div>

                {pasteCopiedStatus && (
                  <div className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 animate-in fade-in">
                    <CheckCircle className="w-3 h-3" />
                    <span>✓ Link එක සාර්ථකව පේස්ට් විය!</span>
                  </div>
                )}

                <div className="mt-1.5 p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300 space-y-1">
                  <p className="font-semibold flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-600 shrink-0" />
                    <span>ආරක්ෂිත එම්බඩ් පද්ධතිය (Protected Embed System):</span>
                  </p>
                  <p className="leading-relaxed">
                    ගූගල් ඩ්‍රයිව් (Google Drive - Anyone with the link can view) හෝ සෘජු PDF ලින්ක් එකක් පේස්ට් කළ විට, සිසුවාට බාගත කිරීම (Download) හෝ Link Copy කිරීම සම්පූර්ණයෙන්ම අවහිර කර ආරක්ෂිත Modal Viewer එකකින් පමණක් පෙන්වනු ලැබේ.
                  </p>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddAssignmentModal(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  අවලංගු කරන්න
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-md cursor-pointer"
                >
                  පැවරුම Publish කරන්න
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- MODAL: Compact Protected Video Player (මිනි ප්ලේයරය) ---------------- */}
      {previewVideoUrl && (
        <div
          onClick={() => setPreviewVideoUrl(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 select-none animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-4 sm:p-5 space-y-3 max-h-[95vh] overflow-hidden"
          >
            {/* Header: Title and Easy-to-click Close Button (තිරයේ නොකැපෙන සේ) */}
            <div className="flex items-center justify-between text-white border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs sm:text-sm font-bold text-white">
                  ආරක්ෂිත වීඩියෝ ප්ලේයරය (Secure Video Player)
                </h3>
              </div>

              {/* Prominent, unclipped Close Button */}
              <button
                onClick={() => setPreviewVideoUrl(null)}
                className="cursor-pointer flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition text-xs font-bold border border-slate-700 shadow-md active:scale-95"
                title="Close Player (ප්ලේයරය වසන්න)"
              >
                <X className="w-4 h-4" />
                <span>වසන්න (Close)</span>
              </button>
            </div>

            {/* Video Player */}
            <div className="overflow-hidden rounded-2xl ring-1 ring-white/10">
              <SecureVideoPlayer
                videoUrl={previewVideoUrl}
                studentName="Eng. Kaveen Jayasuriya (Lecturer Preview)"
              />
            </div>
          </div>
        </div>
      )}

      {/* ---------------- MODAL: Secure PDF Preview for Lecturer ---------------- */}
      {selectedAsgForPreview && (
        <SecurePdfModal
          assignment={selectedAsgForPreview}
          studentName={`${currentUser?.fullName || 'Lecturer'} (Preview)`}
          onClose={() => setSelectedAsgForPreview(null)}
        />
      )}

    </div>
  );
};
