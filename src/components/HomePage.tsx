import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Award,
  Video,
  FileQuestion,
  Users,
  CheckCircle2,
  BrainCircuit,
  ArrowRight,
  GraduationCap,
  ShieldCheck,
  PhoneCall,
  Clock,
  Compass,
} from 'lucide-react';
import { MonarchHeroBanner, MonarchHorizontalLogo, MonarchEmblem } from './BrandAssets';
import { useAuth } from '../context/AuthContext';
import { useLmsData } from '../context/LmsDataContext';
import { useLanguage } from '../context/LanguageContext';
import { Course } from '../types';
import { CheckoutModal } from './CheckoutModal';

interface HomePageProps {
  onNavigate: (view: any) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { currentUser, isEnrolled } = useAuth();
  const { courses, studentReviews } = useLmsData();
  const { t, language } = useLanguage();
  const [selectedCourseForBuying, setSelectedCourseForBuying] = useState<Course | null>(null);

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      
      {/* 1. Flagship Hero Banner Section with user's exact requirements */}
      <section className="mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <MonarchHeroBanner
          onNavigateCourses={() => {
            const el = document.getElementById('featured-courses');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          onNavigateRegister={() => onNavigate(currentUser ? 'dashboard' : 'register')}
        />
      </section>

      {/* 2. Official Recognition Bar: "BEST CAMPUS FOR PROFESSIONAL COURSES IN SRI LANKA" */}
      <section className="border-y border-amber-200/60 bg-gradient-to-r from-amber-500/10 via-amber-400/20 to-amber-500/10 py-5 my-8 dark:border-amber-900/40 dark:bg-amber-950/20">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          
          <div className="flex items-center gap-3">
            <MonarchEmblem size={42} withShadow={false} />
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                <span className="text-xs font-extrabold uppercase tracking-widest text-amber-900 dark:text-amber-300">
                  NATIONAL EXCELLENCE AWARD · ශ්‍රී ලංකා විශිෂ්ටතා සම්මානය
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
                BEST CAMPUS FOR PROFESSIONAL COURSES IN SRI LANKA
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 sm:gap-8 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <div>
                <span className="font-bold text-slate-900 dark:text-white">15,000+</span>
                <span className="text-slate-500 dark:text-slate-400 text-xs block">Active Learners</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <div>
                <span className="font-bold text-slate-900 dark:text-white">98.4%</span>
                <span className="text-slate-500 dark:text-slate-400 text-xs block">Pass Rate (A/L & O/L)</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <BrainCircuit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <div>
                <span className="font-bold text-slate-900 dark:text-white">24/7 AI</span>
                <span className="text-slate-500 dark:text-slate-400 text-xs block">Doubt Solver Support</span>
              </div>
            </div>

            <button
              onClick={() => onNavigate(currentUser ? 'dashboard' : 'login')}
              className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-amber-400 shadow-sm"
            >
              {currentUser ? 'Go to Dashboard' : 'Student Login (ලොග් වන්න)'}
            </button>
          </div>

        </div>
      </section>

      {/* 3. Featured Professional Courses Section */}
      <section id="featured-courses" className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <GraduationCap className="h-4 w-4" />
              <span>Curriculum & Professional Programs · විෂය ධාරා සහ පාඨමාලා</span>
            </div>
            <h3 className="mt-1 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Professional Courses at Monarch Campus
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              ශ්‍රී ලංකාවේ වෘත්තීය පාඨමාලා, උසස් පෙළ (A/L) සහ සාමාන්‍ය පෙළ (O/L) සඳහා ඉහළම ප්‍රමිතියේ පන්ති.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('categories')}
              className="text-xs sm:text-sm font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-400 flex items-center gap-1 cursor-pointer"
            >
              <span>{t('සියලුම පාඨමාලා සහ ප්‍රවර්ග (View All Categories)', 'View All Courses & Categories')}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-xl hover:border-amber-400 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-amber-500/60"
            >
              <div>
                {/* Badge & Stream */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="rounded-md bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    {course.grade}
                  </span>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-amber-500" />
                    <span>{course.duration || '6 Months (මාස 6)'}</span>
                  </span>
                </div>

                {/* Course Title */}
                <h4 className="text-base font-bold text-slate-900 group-hover:text-amber-600 dark:text-white dark:group-hover:text-amber-400 transition-colors">
                  {language === 'si' ? course.titleSi : course.titleEn}
                </h4>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                  {language === 'si' ? course.titleEn : course.titleSi}
                </p>

                {/* Instructor */}
                <p className="mt-3 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
                  <img
                    src={course.instructorAvatar}
                    alt={course.instructorNameEn}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span>
                    <strong className="text-slate-900 dark:text-white">
                      {language === 'si' ? course.instructorNameSi : course.instructorNameEn}
                    </strong>
                  </span>
                </p>

                {/* Stats: Lessons & Tutes */}
                <div className="mt-4 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
                  <span className="flex items-center gap-1">
                    <Video className="h-3.5 w-3.5 text-blue-500" />
                    {course.lessons.length} {t('වීඩියෝ පාඩම්', 'Lessons')}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5 text-amber-500" />
                    PDF Tutes
                  </span>
                </div>
              </div>

              {/* Price & Action */}
              <div className="mt-5 flex items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Full / Monthly
                  </span>
                  <span className="text-sm font-black text-amber-600 dark:text-amber-400 block">
                    Rs. {course.priceLKR.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Rs. {course.monthlyFeeLKR.toLocaleString()}/mo
                  </span>
                </div>

                {isEnrolled(course.id) ? (
                  <button
                    onClick={() => onNavigate('dashboard')}
                    className="cursor-pointer rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 text-xs font-bold transition shadow-sm"
                  >
                    {t('පිවිසෙන්න (Enrolled)', 'Go to Course')}
                  </button>
                ) : (
                  <button
                    onClick={() => setSelectedCourseForBuying(course)}
                    className="cursor-pointer rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-4 py-2 text-xs font-black transition shadow-md shadow-amber-500/20"
                  >
                    {t('ලියාපදිංචි වන්න (Buy Now)', 'Buy Now')}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Why Monarch Campus Section */}
      <section className="bg-slate-100/70 dark:bg-slate-900/60 py-12 border-y border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Why Choose Monarch Campus?
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              ශ්‍රී ලංකාවේ වෘත්තීය පාඨමාලා සහ උසස් අධ්‍යාපනය සඳහා සිසුන්ගේ ප්‍රථම තේරීම
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                <Award className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base">Top Ranked Lecturers</h4>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                දිවයිනේ ප්‍රමුඛතම ආචාර්යවරුන් විසින් මෙහෙයවනු ලබන පූර්ණ විෂය නිර්දේශ ආවරණය සහ විභාග ඉලක්කගත පුහුණුව.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                <Video className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base">FHD Classroom & Tutes</h4>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                ඕනෑම වේලාවක නැරඹිය හැකි වීඩියෝ පාඩම් (Video Lessons) සහ නිවසටම ගෙන්වාගත හැකි හෝ Download කළ හැකි Tutes.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <Award className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base">Instant Online Evaluation</h4>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                MCQ සහ විෂය ආශ්‍රිත සියලුම ඔන්ලයින් විභාග සඳහා නිවැරදි පිළිතුරු සමඟ ක්ෂණික ලකුණු විශ්ලේෂණය.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base">24/7 AI Doubt Solver</h4>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                ගණිතය, භෞතික විද්‍යාව හෝ ඕනෑම විෂයක ගැටළු සඳහා පියවරෙන් පියවර විවරණ ලබාදෙන නවීන AI තාක්ෂණය.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Real-time Student Reviews Section (Super Admin managed with live updates) */}
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <Sparkles className="h-4 w-4" />
              <span>{t('සිසුන්ගේ අදහස් සහ ප්‍රතිචාර · Student Testimonials', 'Verified Student Reviews & Testimonials')}</span>
            </div>
            <h3 className="mt-1 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t('මොනාක් කැම්පස් විශිෂ්ටයින්ගේ අත්දැකීම්', 'What Our Top Students Say About Monarch')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              දිවයින පුරා සිසුන් අපගේ පාඨමාලා, ආචාර්ය මණ්ඩලය සහ LMS පද්ධතිය පිළිබඳව තැබූ සත්‍ය අදහස්.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-black border border-amber-500/30">
              ★ 4.95 / 5.0 Rating ({studentReviews.length} Reviews)
            </span>
          </div>
        </div>

        {studentReviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-8 text-center text-xs text-slate-400">
            {t('තවමත් රිවිව්ස් ඇතුළත් කර නොමැත. Super Admin මගින් රිවිව්ස් එක් කළ හැක.', 'No reviews available. Super Admin can add verified reviews.')}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {studentReviews.map((rev) => (
              <div
                key={rev.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:shadow-lg hover:border-amber-400 dark:border-slate-800 dark:bg-slate-900 transition-all"
              >
                <div>
                  {/* Rating Stars & Tag */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1 text-amber-500">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`text-base ${
                            star <= rev.rating ? 'text-amber-400' : 'text-slate-300 dark:text-slate-700'
                          }`}
                        >
                          ★
                        </span>
                      ))}
                      <span className="ml-1 text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">
                        {rev.rating}.0
                      </span>
                    </div>

                    {rev.tag && (
                      <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300 border border-amber-500/20">
                        {rev.tag}
                      </span>
                    )}
                  </div>

                  {/* Review Text */}
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal italic">
                    "{language === 'si' ? rev.descriptionSi : (rev.descriptionEn || rev.descriptionSi)}"
                  </p>
                </div>

                {/* Author Info: Name, Date & Time */}
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                  {rev.avatar ? (
                    <img
                      src={rev.avatar}
                      alt={rev.studentName}
                      className="w-10 h-10 rounded-full object-cover border border-amber-400/40"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-bold flex items-center justify-center text-sm shadow-xs">
                      {rev.studentName.charAt(0)}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                      {rev.studentName}
                    </h5>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                      <span>{rev.date}</span>
                      <span>·</span>
                      <span>{rev.time}</span>
                    </div>
                  </div>

                  <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 text-[10px] font-bold" title="Verified Monarch Student">
                    <ShieldCheck className="w-3.5 h-3.5 mr-0.5" />
                    <span>Verified</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 6. Footer with Official Monarch Campus Emblem & Branding */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-12 dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            <div className="md:col-span-5 space-y-3">
              <MonarchHorizontalLogo />
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
                Monarch Campus is the premier Learning Management System and professional educational campus in Sri Lanka, dedicated to academic mastery, professional diplomas, and future readiness.
              </p>
              <div className="text-xs font-bold text-amber-600 dark:text-amber-400">
                BEST CAMPUS FOR PROFESSIONAL COURSES IN SRI LANKA
              </div>
            </div>

            <div className="md:col-span-3 space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <h5 className="font-bold text-slate-900 dark:text-white text-sm mb-2">Quick Navigation</h5>
              <div><button onClick={() => onNavigate('home')} className="hover:text-amber-600 cursor-pointer">Home (මුල් පිටුව)</button></div>
              <div><button onClick={() => onNavigate('categories')} className="hover:text-amber-600 cursor-pointer">Courses & Catalog (පාඨමාලා)</button></div>
              <div><button onClick={() => onNavigate(currentUser ? 'dashboard' : 'login')} className="hover:text-amber-600 cursor-pointer">Unified Portal Login</button></div>
            </div>

            <div className="md:col-span-4 space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <h5 className="font-bold text-slate-900 dark:text-white text-sm mb-2">Campus Inquiries & Support</h5>
              <p className="flex items-center gap-2">
                <PhoneCall className="h-4 w-4 text-amber-600" />
                <span>Hotline: 077 123 4567 / 071 987 6543</span>
              </p>
              <p>Email: info@monarchcampus.lk</p>
              <p>Address: Monarch Campus Tower, Colombo 03, Sri Lanka</p>
            </div>

          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} Monarch Campus LMS. All Rights Reserved. Dream · Learn · Grow.
          </div>
        </div>
      </footer>

      {/* Checkout Modal */}
      {selectedCourseForBuying && (
        <CheckoutModal
          course={selectedCourseForBuying}
          onClose={() => setSelectedCourseForBuying(null)}
          onSuccess={() => {
            setSelectedCourseForBuying(null);
            onNavigate('dashboard');
          }}
        />
      )}
    </div>
  );
};
