import React, { useState } from 'react';
import {
  BookOpen,
  PlusCircle,
  Edit2,
  Trash2,
  Video,
  FileText,
  Clock,
  ChevronDown,
  ChevronUp,
  DollarSign,
  User,
  Image as ImageIcon,
  Search,
  Check,
  X,
  Upload,
  Sparkles,
} from 'lucide-react';
import { useLmsData } from '../../context/LmsDataContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Course, Lesson } from '../../types';

export const AdminCoursesLessonsTab: React.FC = () => {
  const { courses, addCourse, updateCourse, deleteCourse, addLessonToCourse, deleteLessonFromCourse } = useLmsData();
  const { users } = useAuth();
  const { t, language } = useLanguage();

  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(courses[0]?.id || null);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [showAddLessonModal, setShowAddLessonModal] = useState<string | null>(null);

  // Registered instructors from database
  const registeredInstructors = users.filter((u) => u.role === 'instructor');
  const [instructorSearch, setInstructorSearch] = useState('');

  // Course Form States
  const [cTitleSi, setCTitleSi] = useState('');
  const [cTitleEn, setCTitleEn] = useState('');
  const [cDescSi, setCDescSi] = useState('');
  const [cDescEn, setCDescEn] = useState('');
  const [cGrade, setCGrade] = useState('2028 A/L');
  const [cSubjectSi, setCSubjectSi] = useState('සංයුක්ත ගණිතය');
  const [cSubjectEn, setCSubjectEn] = useState('Combined Mathematics');
  const [cDuration, setCDuration] = useState('6 Months (මාස 6)');
  const [cThumbnailUrl, setCThumbnailUrl] = useState('');
  const [cPrice, setCPrice] = useState('38000');
  const [cMonthly, setCMonthly] = useState('3800');
  const [cInstallment, setCInstallment] = useState('19500');
  const [cInstructorSi, setCInstructorSi] = useState('');
  const [cInstructorEn, setCInstructorEn] = useState('');
  const [cInstructorAvatar, setCInstructorAvatar] = useState('');
  const [cInstructorPhone, setCInstructorPhone] = useState('');

  // Lesson Form States
  const [lTitleSi, setLTitleSi] = useState('');
  const [lTitleEn, setLTitleEn] = useState('');
  const [lDuration, setLDuration] = useState('2h 15m');
  const [lVideoUrl, setLVideoUrl] = useState('https://www.youtube.com/embed/dQw4w9WgXcQ');
  const [lTutePdf, setLTutePdf] = useState('https://example.com/tute-01.pdf');

  const openAddModal = () => {
    setEditingCourseId(null);
    setCTitleSi('');
    setCTitleEn('');
    setCDescSi('ශ්‍රී ලංකාවේ ප්‍රමුඛතම දේශක මණ්ඩලය විසින් මෙහෙයවනු ලබන පූර්ණ සිද්ධාන්ත හා ප්‍රශ්න පත්‍ර සාකච්ඡා පන්තිය.');
    setCDescEn('Complete theory and paper discussions conducted by leading national faculty.');
    setCGrade('2028 A/L');
    setCSubjectSi('සංයුක්ත ගණිතය');
    setCSubjectEn('Combined Mathematics');
    setCDuration('6 Months (මාස 6)');
    setCThumbnailUrl('https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80');
    setCPrice('38000');
    setCMonthly('3800');
    setCInstallment('19500');
    const firstInst = registeredInstructors[0];
    setCInstructorSi(firstInst?.fullName || 'ඉංජිනේරු කවීන් ජයසූරිය');
    setCInstructorEn(firstInst?.fullName || 'Eng. Kaveen Jayasuriya');
    setCInstructorAvatar(firstInst?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80');
    setCInstructorPhone(firstInst?.phone || '0701306952');
    setShowCourseModal(true);
  };

  const openEditModal = (course: Course) => {
    setEditingCourseId(course.id);
    setCTitleSi(course.titleSi);
    setCTitleEn(course.titleEn);
    setCDescSi(course.descriptionSi);
    setCDescEn(course.descriptionEn);
    setCGrade(course.grade);
    setCSubjectSi(course.subjectSi);
    setCSubjectEn(course.subjectEn);
    setCDuration(course.duration || '6 Months (මාස 6)');
    setCThumbnailUrl(course.thumbnailUrl || '');
    setCPrice(String(course.priceLKR));
    setCMonthly(String(course.monthlyFeeLKR));
    setCInstallment(String(course.installmentPriceLKR || Math.round(course.priceLKR / 2)));
    setCInstructorSi(course.instructorNameSi);
    setCInstructorEn(course.instructorNameEn);
    setCInstructorAvatar(course.instructorAvatar);
    setCInstructorPhone(course.instructorPhone || '');
    setShowCourseModal(true);
  };

  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cTitleSi.trim() || !cTitleEn.trim()) return;

    if (editingCourseId) {
      // Update existing course
      updateCourse(editingCourseId, {
        titleSi: cTitleSi.trim(),
        titleEn: cTitleEn.trim(),
        descriptionSi: cDescSi.trim(),
        descriptionEn: cDescEn.trim(),
        grade: cGrade,
        subjectSi: cSubjectSi,
        subjectEn: cSubjectEn,
        duration: cDuration.trim(),
        thumbnailUrl: cThumbnailUrl.trim() || undefined,
        priceLKR: Number(cPrice) || 38000,
        monthlyFeeLKR: Number(cMonthly) || 3800,
        installmentPriceLKR: Number(cInstallment) || 19500,
        instructorNameSi: cInstructorSi.trim(),
        instructorNameEn: cInstructorEn.trim() || cInstructorSi.trim(),
        instructorAvatar: cInstructorAvatar.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        instructorPhone: cInstructorPhone.trim(),
      });
    } else {
      // Create new course
      const newCourse: Course = {
        id: `course-${Date.now()}`,
        titleSi: cTitleSi.trim(),
        titleEn: cTitleEn.trim(),
        descriptionSi: cDescSi.trim() || 'නව පාඨමාලාව සාර්ථකව පද්ධතියට එක් කරන ලදී.',
        descriptionEn: cDescEn.trim() || 'Brand new curriculum course added to Monarch Campus.',
        grade: cGrade,
        subjectSi: cSubjectSi,
        subjectEn: cSubjectEn,
        duration: cDuration.trim() || '6 Months (මාස 6)',
        thumbnailUrl: cThumbnailUrl.trim() || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80',
        thumbnailGradient: 'from-blue-900 via-indigo-950 to-slate-950',
        accentColor: '#3b82f6',
        priceLKR: Number(cPrice) || 38000,
        monthlyFeeLKR: Number(cMonthly) || 3800,
        installmentPriceLKR: Number(cInstallment) || 19500,
        instructorNameSi: cInstructorSi.trim() || 'ප්‍රවීණ දේශක මණ්ඩලය',
        instructorNameEn: cInstructorEn.trim() || 'Senior Faculty Member',
        instructorAvatar: cInstructorAvatar.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        instructorPhone: cInstructorPhone.trim() || '0701306952',
        rating: 5.0,
        totalStudents: 0,
        lessons: [],
        featuresSi: ['HD වීඩියෝ පටිගත කිරීම්', 'සජීවී Zoom පන්ති', 'මුද්‍රිත නිබන්ධන'],
        featuresEn: ['HD Video Archive', 'Live Zoom Sessions', 'Printed SpeedPost Tutes'],
      };

      addCourse(newCourse);
    }

    setShowCourseModal(false);
  };

  const handleCreateLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAddLessonModal || !lTitleSi.trim()) return;

    const newLesson: Lesson = {
      id: `lesson-${Date.now()}`,
      courseId: showAddLessonModal,
      titleSi: lTitleSi.trim(),
      titleEn: lTitleEn.trim() || lTitleSi.trim(),
      duration: lDuration,
      videoUrl: lVideoUrl,
      tutePdfUrl: lTutePdf,
      summarySi: 'මෙම පාඩම තුළ මූලික සිද්ධාන්ත සහ විභාග ගැටළු සාකච්ඡා කෙරේ.',
      summaryEn: 'Comprehensive lecture covering fundamentals and exam problems.',
    };

    addLessonToCourse(showAddLessonModal, newLesson);
    setShowAddLessonModal(null);
    setLTitleSi('');
    setLTitleEn('');
  };

  const filteredInstructors = registeredInstructors.filter((inst) =>
    inst.fullName.toLowerCase().includes(instructorSearch.toLowerCase()) ||
    inst.phone.includes(instructorSearch)
  );

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {t('පාඨමාලා සහ පාඩම් කළමනාකරණය (Courses & Lessons)', 'Courses & Lessons Management')}
          </h2>
          <p className="text-xs text-slate-500">
            {t(
              'නව කෝස් එක් කිරීම, සංස්කරණය, කාල සීමාව හා මිල නියම කිරීම සහ වීඩියෝ පාඩම් කළමනාකරණය',
              'Create, edit, or delete courses, set durations & pricing plans, and manage video lessons'
            )}
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t('+ නව කෝස් එකක් එක් කරන්න', '+ Add New Course')}</span>
        </button>
      </div>

      {/* Course List with Accordion for Lessons */}
      <div className="space-y-4">
        {courses.map((course) => {
          const isExpanded = expandedCourseId === course.id;
          return (
            <div
              key={course.id}
              className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm"
            >
              {/* Course Header Bar */}
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/70 dark:bg-slate-850">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                        {language === 'si' ? course.titleSi : course.titleEn}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                        {course.grade}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-[10px] font-mono font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {course.duration || '6 Months'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <span>{t('දේශක:', 'Instructor:')} <strong>{course.instructorNameSi}</strong></span>
                      <span>{t('මුළු මුදල:', 'Full Price:')} <strong className="text-amber-600">Rs. {course.priceLKR.toLocaleString()}</strong></span>
                      <span>{t('මාසික ගාස්තුව:', 'Monthly:')} <strong className="text-slate-800 dark:text-slate-200">Rs. {course.monthlyFeeLKR.toLocaleString()}</strong></span>
                      <span>{t('වාරික 2:', '2-Parts:')} <strong>Rs. {(course.installmentPriceLKR || Math.round(course.priceLKR / 2)).toLocaleString()}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Course Actions: Edit, Delete, Accordion */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => openEditModal(course)}
                    className="cursor-pointer p-2 rounded-xl text-slate-500 hover:text-amber-600 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition"
                    title={t('කෝස් එක සංස්කරණය කරන්න', 'Edit Course')}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(t('මෙම පාඨමාලාව ඩිලීට් කිරීමට ඔබට විශ්වාසද?', 'Are you sure you want to delete this course?'))) {
                        deleteCourse(course.id);
                      }
                    }}
                    className="cursor-pointer p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                    title={t('කෝස් එක ඩිලීට් කරන්න', 'Delete Course')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setExpandedCourseId(isExpanded ? null : course.id)}
                    className="cursor-pointer flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <span>{course.lessons.length} {t('පාඩම්', 'Lessons')}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Accordion Lessons Area */}
              {isExpanded && (
                <div className="p-4 sm:p-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {t('වීඩියෝ පාඩම් මාලාව (Video Lessons Archive)', 'Video Lessons in this Course')}
                    </span>
                    <button
                      onClick={() => setShowAddLessonModal(course.id)}
                      className="cursor-pointer text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>{t('+ නව පාඩමක් එක් කරන්න', '+ Add Lesson')}</span>
                    </button>
                  </div>

                  {course.lessons.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-2">
                      {t('මෙම පාඨමාලාවට තවමත් වීඩියෝ පාඩම් එක් කර නැත.', 'No lessons added to this course yet.')}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {course.lessons.map((lesson, idx) => (
                        <div
                          key={lesson.id}
                          className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-[11px]">
                              {idx + 1}
                            </span>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white">
                                {language === 'si' ? lesson.titleSi : lesson.titleEn}
                              </p>
                              <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {lesson.duration}
                                </span>
                                <span className="flex items-center gap-1 text-blue-500 font-mono">
                                  <Video className="w-3 h-3" />
                                  Video URL attached
                                </span>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => deleteLessonFromCourse(course.id, lesson.id)}
                            className="cursor-pointer p-1.5 text-slate-400 hover:text-rose-600"
                            title="Delete Lesson"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add / Edit Course Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base sm:text-lg font-black flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>
                  {editingCourseId
                    ? t('පාඨමාලාව සංස්කරණය (Edit Course)', 'Edit Course')
                    : t('නව පාඨමාලාවක් එක් කරන්න (Add New Course)', 'Create New Course')}
                </span>
              </h3>
              <button
                onClick={() => setShowCourseModal(false)}
                className="cursor-pointer rounded-xl p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="mt-4 space-y-4 text-xs">
              
              {/* Course Title Sinhala & English */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('කෝස් නේම් එක (සිංහලෙන්)', 'Course Title (Sinhala)')} *
                  </label>
                  <input
                    type="text"
                    value={cTitleSi}
                    onChange={(e) => setCTitleSi(e.target.value)}
                    placeholder="2028 A/L සංයුක්ත ගණිතය..."
                    required
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('කෝස් නේම් එක (English)', 'Course Title (English)')} *
                  </label>
                  <input
                    type="text"
                    value={cTitleEn}
                    onChange={(e) => setCTitleEn(e.target.value)}
                    placeholder="2028 A/L Combined Mathematics..."
                    required
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white font-medium"
                  />
                </div>
              </div>

              {/* Description Sinhala & English */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('කෝස් එකේ විස්තරය (Description - Sinhala)', 'Description (Sinhala)')} *
                </label>
                <textarea
                  value={cDescSi}
                  onChange={(e) => setCDescSi(e.target.value)}
                  rows={2}
                  placeholder="පාඨමාලාවේ විෂය නිර්දේශය, ක්‍රමවේදය ආදිය පිළිබඳ කෙටි විස්තරයක්..."
                  required
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('කෝස් එකේ විස්තරය (Description - English)', 'Description (English)')}
                </label>
                <textarea
                  value={cDescEn}
                  onChange={(e) => setCDescEn(e.target.value)}
                  rows={2}
                  placeholder="Comprehensive curriculum and exam preparation..."
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white"
                />
              </div>

              {/* Grade / Stream & Subject */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('ශ්‍රේණිය / විභාගය (Grade/Batch)', 'Grade / Batch')}
                  </label>
                  <select
                    value={cGrade}
                    onChange={(e) => setCGrade(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs font-semibold"
                  >
                    <option value="2028 A/L">2028 A/L</option>
                    <option value="2027 A/L">2027 A/L</option>
                    <option value="2026 A/L">2026 A/L</option>
                    <option value="Grade 11">Grade 11 (O/L)</option>
                    <option value="Grade 10">Grade 10</option>
                    <option value="Grade 6">Grade 6</option>
                    <option value="Professional Course">Professional Course</option>
                    <option value="Diploma">Diploma Program</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('විෂය (Subject - Sinhala)', 'Subject (Sinhala)')}
                  </label>
                  <input
                    type="text"
                    value={cSubjectSi}
                    onChange={(e) => setCSubjectSi(e.target.value)}
                    placeholder="සංයුක්ත ගණිතය / භෞතික විද්‍යාව..."
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('කෝස් එකේ කාල සීමාව (Duration)', 'Duration')} *
                  </label>
                  <input
                    type="text"
                    value={cDuration}
                    onChange={(e) => setCDuration(e.target.value)}
                    placeholder="e.g. 6 Months (මාස 6), 1 Year, etc."
                    required
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs font-bold text-amber-600 dark:text-amber-400"
                  />
                </div>
              </div>

              {/* Course Thumbnail URL & Live Preview */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('අප්ලෝඩ් තම්නේල් එකක් / Image URL (Thumbnail)', 'Course Thumbnail Image URL')}
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={cThumbnailUrl}
                    onChange={(e) => setCThumbnailUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs font-mono"
                  />
                  {cThumbnailUrl && (
                    <img
                      src={cThumbnailUrl}
                      alt="Thumbnail preview"
                      className="w-10 h-10 rounded-xl object-cover border border-amber-500/40"
                    />
                  )}
                </div>
              </div>

              {/* PRICING PLANS: Full Price, Monthly Fee, 2 Installments Amount */}
              <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 space-y-3">
                <span className="font-extrabold text-xs text-amber-900 dark:text-amber-300 block">
                  {t('ගාස්තු සැලසුම් (Pricing Plans: Full, Monthly & 2 Installments)', 'Course Fee & Pricing Plans')}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t('මුළු මුදල (Full Price LKR)', 'Full Course Price (LKR)')} *
                    </label>
                    <input
                      type="number"
                      value={cPrice}
                      onChange={(e) => setCPrice(e.target.value)}
                      placeholder="38000"
                      required
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs font-bold text-amber-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t('මාසික ගාස්තුව (Monthly Fee LKR)', 'Monthly Fee (LKR)')} *
                    </label>
                    <input
                      type="number"
                      value={cMonthly}
                      onChange={(e) => setCMonthly(e.target.value)}
                      placeholder="3800"
                      required
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t('කොටස් 2ක වාරිකය (2 Installments LKR)', '2-Part Installment (LKR)')} *
                    </label>
                    <input
                      type="number"
                      value={cInstallment}
                      onChange={(e) => setCInstallment(e.target.value)}
                      placeholder="19500"
                      required
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* INSTRUCTOR SELECTION WITH REGISTERED INSTRUCTORS SEARCH & FILTER */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 p-4 space-y-3">
                <span className="font-extrabold text-xs text-slate-900 dark:text-white block">
                  {t(
                    'ඉන්ස්ට්‍රක්ටර් තෝරාගැනීම (Select Registered Instructor or Filter by Name)',
                    'Course Instructor'
                  )}
                </span>

                {/* Filter / Search registered instructors */}
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={instructorSearch}
                    onChange={(e) => setInstructorSearch(e.target.value)}
                    placeholder={t('ලියාපදිංචි ඉන්ස්ට්‍රක්ටර්ගේ නම ටයිප් කර සොයන්න...', 'Type name or phone to filter instructors...')}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 pl-9 pr-3 text-xs"
                  />
                </div>

                {/* Registered Instructor Chips */}
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {filteredInstructors.map((inst) => (
                    <button
                      key={inst.id}
                      type="button"
                      onClick={() => {
                        setCInstructorSi(inst.fullName);
                        setCInstructorEn(inst.fullName);
                        setCInstructorAvatar(inst.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80');
                        setCInstructorPhone(inst.phone);
                      }}
                      className={`cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs transition ${
                        cInstructorSi === inst.fullName
                          ? 'border-amber-500 bg-amber-500/10 text-amber-800 dark:text-amber-300 font-bold'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300'
                      }`}
                    >
                      {inst.avatar && (
                        <img src={inst.avatar} alt={inst.fullName} className="w-5 h-5 rounded-full object-cover" />
                      )}
                      <span>{inst.fullName}</span>
                      <span className="text-[10px] text-slate-400">({inst.phone})</span>
                    </button>
                  ))}
                </div>

                {/* Instructor Name custom inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      {t('ඉන්ස්ට්‍රක්ටර් නම (Sinhala)', 'Instructor Name (Sinhala)')} *
                    </label>
                    <input
                      type="text"
                      value={cInstructorSi}
                      onChange={(e) => setCInstructorSi(e.target.value)}
                      placeholder="ඉංජිනේරු කවීන් ජයසූරිය"
                      required
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      {t('ඉන්ස්ට්‍රක්ටර් නම (English)', 'Instructor Name (English)')}
                    </label>
                    <input
                      type="text"
                      value={cInstructorEn}
                      onChange={(e) => setCInstructorEn(e.target.value)}
                      placeholder="Eng. Kaveen Jayasuriya"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className="cursor-pointer px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                >
                  {t('අවලංගු කරන්න', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="cursor-pointer px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black shadow-md transition"
                >
                  {editingCourseId
                    ? t('වෙනස්කම් සුරකින්න (Save Changes)', 'Save Changes')
                    : t('කෝස් එක නිර්මාණය කරන්න (Create Course)', 'Create Course')}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Add Lesson Modal */}
      {showAddLessonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t('නව වීඩියෝ පාඩමක් එක් කරන්න (Add New Lesson)', 'Add New Lesson to Course')}
              </h3>
              <button
                onClick={() => setShowAddLessonModal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLesson} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('පාඩමේ මාතෘකාව (Title - Sinhala)', 'Lesson Title (Sinhala)')} *
                </label>
                <input
                  type="text"
                  value={lTitleSi}
                  onChange={(e) => setLTitleSi(e.target.value)}
                  placeholder="01 වන පාඩම: මූලික සිද්ධාන්ත..."
                  required
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('පාඩමේ මාතෘකාව (Title - English)', 'Lesson Title (English)')}
                </label>
                <input
                  type="text"
                  value={lTitleEn}
                  onChange={(e) => setLTitleEn(e.target.value)}
                  placeholder="Lesson 01: Core Concepts..."
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('කාලය (Duration)', 'Duration')}
                  </label>
                  <input
                    type="text"
                    value={lDuration}
                    onChange={(e) => setLDuration(e.target.value)}
                    placeholder="2h 15m"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('Tute PDF Link', 'Tute PDF URL')}
                  </label>
                  <input
                    type="url"
                    value={lTutePdf}
                    onChange={(e) => setLTutePdf(e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('වීඩියෝ Link (YouTube / Vimeo Embed URL)', 'Video Embed URL')} *
                </label>
                <input
                  type="url"
                  value={lVideoUrl}
                  onChange={(e) => setLVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/embed/..."
                  required
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddLessonModal(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold"
                >
                  {t('අවලංගු කරන්න', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md"
                >
                  {t('පාඩම එක් කරන්න', 'Add Lesson')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
