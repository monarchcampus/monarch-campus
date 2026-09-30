import React, { useState } from 'react';
import {
  GraduationCap,
  Search,
  BookOpen,
  Clock,
  User,
  Star,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Filter,
  DollarSign,
  PlayCircle,
} from 'lucide-react';
import { useLmsData } from '../context/LmsDataContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Course } from '../types';
import { CheckoutModal } from './CheckoutModal';
import { CourseViewerModal } from './CourseViewerModal';
import { MonarchEmblem } from './BrandAssets';

interface CoursesCategoriesViewProps {
  onNavigateHome: () => void;
  onNavigateDashboard: () => void;
  initialCategory?: string;
}

export const CoursesCategoriesView: React.FC<CoursesCategoriesViewProps> = ({
  onNavigateHome,
  onNavigateDashboard,
  initialCategory = 'all',
}) => {
  const { courses } = useLmsData();
  const { currentUser, isEnrolled } = useAuth();
  const { t, language } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedCourseForBuying, setSelectedCourseForBuying] = useState<Course | null>(null);
  const [selectedCourseForViewing, setSelectedCourseForViewing] = useState<Course | null>(null);

  const categories = [
    { id: 'all', labelEn: 'All Courses', labelSi: 'සියලුම පාඨමාලා' },
    { id: '2028 A/L', labelEn: '2028 A/L', labelSi: '2028 උසස් පෙළ' },
    { id: '2027 A/L', labelEn: '2027 A/L', labelSi: '2027 උසස් පෙළ' },
    { id: 'Grade 6', labelEn: 'Secondary & O/L', labelSi: 'සාමාන්‍ය පෙළ / 6-11' },
    { id: 'Professional Course', labelEn: 'Professional ICT & AI', labelSi: 'වෘත්තීය තාක්ෂණ හා AI' },
  ];

  const filteredCourses = courses.filter((course) => {
    // Category match
    const matchesCategory =
      selectedCategory === 'all' ||
      course.grade.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      (selectedCategory === 'Grade 6' && (course.grade.includes('Grade') || course.grade.includes('O/L')));

    // Search query match
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      course.titleSi.toLowerCase().includes(q) ||
      course.titleEn.toLowerCase().includes(q) ||
      course.subjectSi.toLowerCase().includes(q) ||
      course.subjectEn.toLowerCase().includes(q) ||
      course.instructorNameSi.toLowerCase().includes(q) ||
      course.instructorNameEn.toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* Header Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-[#06142e] via-[#0b2554] to-[#12387a] p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
            <MonarchEmblem size={260} />
          </div>

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-3.5 py-1 text-xs font-bold text-amber-300 border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('පාඨමාලා නාමාවලිය සහ ප්‍රවර්ග', 'Curriculum & Course Categories')}</span>
            </div>

            <h1 className="mt-3 text-2xl sm:text-4xl font-extrabold tracking-tight">
              {t('සියලුම වෘත්තීය හා විෂය ධාරා පාඨමාලා', 'All Professional & Academic Courses')}
            </h1>

            <p className="mt-2 text-sm text-slate-300">
              {t(
                'ශ්‍රී ලංකාවේ ප්‍රමුඛතම දේශක මඩුල්ල විසින් මෙහෙයවනු ලබන උසස් පෙළ, සාමාන්‍ය පෙළ සහ වෘත්තීය ඩිප්ලෝමා පාඨමාලා මෙතැනින් තෝරාගෙන ලියාපදිංචි වන්න.',
                'Browse national curricula across A/L Science & Maths, Secondary Grades, and accredited Professional IT diplomas.'
              )}
            </p>

            {/* Live Search Bar */}
            <div className="mt-6 flex items-center max-w-lg rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-1.5 focus-within:border-amber-400 focus-within:bg-white/15 transition">
              <Search className="w-5 h-5 ml-2.5 text-amber-300 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t(
                  'පාඨමාලාව, විෂය හෝ ගුරුතුමාගේ නම සොයන්න...',
                  'Search by course name, subject, or instructor...'
                )}
                className="w-full bg-transparent px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-2 text-xs text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`cursor-pointer shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {language === 'si' ? cat.labelSi : cat.labelEn}
            </button>
          ))}
        </div>

        {/* Courses Count */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
          <span>
            {t(`පාඨමාලා ${filteredCourses.length} ක් හමු විය`, `Showing ${filteredCourses.length} courses`)}
          </span>
          <button
            onClick={onNavigateHome}
            className="text-amber-600 hover:text-amber-700 font-semibold"
          >
            ← {t('මුල් පිටුවට යන්න', 'Back to Home')}
          </button>
        </div>

        {/* Course Cards Grid */}
        {filteredCourses.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center bg-white dark:bg-slate-900">
            <BookOpen className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-3 text-base font-bold text-slate-700 dark:text-slate-300">
              {t('කිසිදු පාඨමාලාවක් හමු නොවීය', 'No courses found')}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              {t('කරුණාකර සෙවුම් පදය හෝ තෝරාගත් ප්‍රවර්ගය වෙනස් කරන්න.', 'Try adjusting your search query or selected category.')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const enrolled = isEnrolled(course.id);
              return (
                <div
                  key={course.id}
                  className="flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-xl hover:border-amber-400 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-amber-500/50"
                >
                  <div>
                    {/* Visual Card Header */}
                    <div
                      className={`relative h-44 w-full bg-gradient-to-r ${course.thumbnailGradient} p-4 text-white flex flex-col justify-between overflow-hidden`}
                    >
                      {course.thumbnailUrl && (
                        <img
                          src={course.thumbnailUrl}
                          alt={course.titleEn}
                          className="absolute inset-0 h-full w-full object-cover opacity-25"
                        />
                      )}

                      <div className="relative z-10 flex items-center justify-between">
                        <span className="rounded-lg bg-black/40 px-2.5 py-1 text-xs font-bold backdrop-blur-md">
                          {course.grade}
                        </span>
                        <div className="flex items-center gap-1 rounded-lg bg-amber-500/90 px-2 py-0.5 text-slate-950 text-xs font-black">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{course.rating || 5.0}</span>
                        </div>
                      </div>

                      <div className="relative z-10">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                          {language === 'si' ? course.subjectSi : course.subjectEn}
                        </span>
                        <h3 className="text-base font-bold text-white line-clamp-2 leading-snug">
                          {language === 'si' ? course.titleSi : course.titleEn}
                        </h3>
                      </div>
                    </div>

                    {/* Content Body */}
                    <div className="p-5 space-y-4">
                      {/* Instructor Info & Duration Badge */}
                      <div className="flex items-center justify-between gap-3 text-xs border-b border-slate-100 dark:border-slate-800 pb-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={course.instructorAvatar}
                            alt={course.instructorNameEn}
                            className="h-8 w-8 rounded-full object-cover border border-amber-500/30"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 dark:text-white truncate">
                              {language === 'si' ? course.instructorNameSi : course.instructorNameEn}
                            </p>
                            <p className="text-[10px] text-slate-400">Chief Instructor</p>
                          </div>
                        </div>

                        {/* Course Duration */}
                        <div className="flex items-center gap-1 shrink-0 rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          <span>{course.duration || '6 Months (මාස 6)'}</span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                        {language === 'si' ? course.descriptionSi : course.descriptionEn}
                      </p>

                      {/* Pricing Tier Grid */}
                      <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-50 dark:bg-slate-850 p-2.5 text-center border border-slate-100 dark:border-slate-800">
                        <div>
                          <span className="block text-[9px] uppercase font-bold text-slate-400">
                            Full Course
                          </span>
                          <span className="text-xs font-black text-amber-600 dark:text-amber-400">
                            Rs. {course.priceLKR.toLocaleString()}
                          </span>
                        </div>
                        <div className="border-x border-slate-200 dark:border-slate-750">
                          <span className="block text-[9px] uppercase font-bold text-slate-400">
                            Monthly Fee
                          </span>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            Rs. {course.monthlyFeeLKR.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[9px] uppercase font-bold text-slate-400">
                            2 Parts
                          </span>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            Rs. {(course.installmentPriceLKR || Math.round(course.priceLKR / 2)).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Action Buttons */}
                  <div className="p-5 pt-0">
                    {enrolled ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedCourseForViewing(course)}
                          className="cursor-pointer flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition"
                        >
                          <PlayCircle className="w-4 h-4" />
                          <span>{t('පාඩම් නරඹන්න (Enrolled)', 'Watch Lessons')}</span>
                        </button>
                        <button
                          onClick={onNavigateDashboard}
                          className="cursor-pointer px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="View on Dashboard"
                        >
                          Dashboard
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedCourseForBuying(course)}
                          className="cursor-pointer flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 px-4 py-2.5 text-xs font-black text-slate-950 shadow-md shadow-amber-500/20 transition hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <span>{t('ලියාපදිංචි වන්න (Buy Now)', 'Buy Now / Enroll')}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Checkout Modal */}
      {selectedCourseForBuying && (
        <CheckoutModal
          course={selectedCourseForBuying}
          onClose={() => setSelectedCourseForBuying(null)}
          onSuccess={() => {
            setSelectedCourseForBuying(null);
            onNavigateDashboard();
          }}
        />
      )}

      {/* Course Viewer Modal */}
      {selectedCourseForViewing && (
        <CourseViewerModal
          course={selectedCourseForViewing}
          onClose={() => setSelectedCourseForViewing(null)}
        />
      )}
    </div>
  );
};
