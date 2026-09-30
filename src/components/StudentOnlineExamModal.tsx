import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Clock,
  AlertTriangle,
  CheckCircle,
  FileText,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Send,
  Award,
  BarChart2,
  RefreshCw,
  Lock,
} from 'lucide-react';
import { OnlineExam } from '../types';
import { useAuth } from '../context/AuthContext';
import { useLmsData } from '../context/LmsDataContext';
import { useLanguage } from '../context/LanguageContext';
import { MonarchEmblem } from './BrandAssets';

interface StudentOnlineExamModalProps {
  exam: OnlineExam;
  onClose: () => void;
}

export const StudentOnlineExamModal: React.FC<StudentOnlineExamModalProps> = ({
  exam,
  onClose,
}) => {
  const { currentUser, isEnrolled } = useAuth();
  const { submitExamAnswers } = useLmsData();
  const { t, language } = useLanguage();

  const totalQuestions = exam.questionsCount || 25;
  const initialSeconds = (exam.durationMinutes || 30) * 60;

  const [timeLeft, setTimeLeft] = useState<number>(initialSeconds);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [wasAutoSubmitted, setWasAutoSubmitted] = useState(false);
  const [examResult, setExamResult] = useState<{
    score: number;
    maxScore: number;
    grade: string;
  } | null>(null);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'paper' | 'sheet'>('paper');

  // Check enrollment permission
  const hasAccess = isEnrolled(exam.courseId);

  // Timer reference
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Handle countdown
  useEffect(() => {
    if (!hasAccess || isSubmitted) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [hasAccess, isSubmitted]);

  // Convert Google Drive link to preview embed format if applicable
  const getEmbeddablePdfUrl = (url?: string) => {
    if (!url) return '';
    if (url.includes('drive.google.com')) {
      // If it's a drive view or open url, replace with preview
      return url
        .replace(/\/view(\?.*)?$/, '/preview')
        .replace('/open?id=', '/file/d/')
        .concat(url.includes('/file/d/') && !url.includes('/preview') ? '/preview' : '');
    }
    return url;
  };

  const handleSelectOption = (questionNum: number, optionVal: number) => {
    if (isSubmitted) return;
    setAnswers((prev) => ({
      ...prev,
      [questionNum]: optionVal,
    }));
  };

  const handleClearOption = (questionNum: number) => {
    if (isSubmitted) return;
    setAnswers((prev) => {
      const copy = { ...prev };
      delete copy[questionNum];
      return copy;
    });
  };

  const handleAutoSubmit = () => {
    if (isSubmitted) return;
    setWasAutoSubmitted(true);
    executeSubmission(true);
  };

  const executeSubmission = (auto: boolean = false) => {
    if (!currentUser) return;
    const res = submitExamAnswers(
      exam.id,
      {
        studentId: currentUser.id,
        studentName: currentUser.fullName,
        studentPhone: currentUser.phone,
      },
      answers,
      auto
    );
    setExamResult(res);
    setIsSubmitted(true);
    setConfirmSubmitOpen(false);
  };

  // Format time display
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);
  const embedUrl = getEmbeddablePdfUrl(exam.pdfUrl);

  // If no enrollment access
  if (!hasAccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-3xl border border-rose-300 dark:border-rose-900 bg-white dark:bg-slate-900 p-6 text-center shadow-2xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400 mb-4">
            <Lock className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {t('පාඨමාලා ප්‍රවේශය අවශ්‍යයි', 'Course Enrollment Required')}
          </h3>
          <p className="mt-2 text-xs text-slate-500 leading-relaxed">
            {t(
              'මෙම ඩිජිටල් ඔන්ලයින් විභාගයට පෙනී සිටීමට මෙම පාඨමාලාව සඳහා මුදල් ගෙවා සක්‍රිය ශිෂ්‍ය ප්‍රවේශයක් ලබා තිබිය යුතුය.',
              'Only students with active enrolled access to this course can take this digital online exam.'
            )}
          </p>
          <div className="mt-6 flex justify-center">
            <button
              onClick={onClose}
              className="cursor-pointer rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-bold text-white hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700"
            >
              {t('ආපසු යන්න', 'Go Back')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white select-none">
      
      {/* ---------------- Top Exam Navigation Header ---------------- */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 sm:px-6 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <MonarchEmblem size={32} withShadow={false} />
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-400 border border-amber-500/30">
                LIVE EXAM
              </span>
              <h2 className="text-sm sm:text-base font-bold text-white line-clamp-1">
                {exam.title}
              </h2>
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-1">{exam.courseTitle}</p>
          </div>
        </div>

        {/* Center: Countdown Timer Badge */}
        {!isSubmitted && (
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-2 rounded-2xl px-3.5 py-1.5 border font-mono font-black text-xs sm:text-sm tracking-widest shadow-inner ${
                timeLeft < 300
                  ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse'
                  : 'bg-amber-950/60 border-amber-500/40 text-amber-300'
              }`}
            >
              <Clock className="h-4 w-4" />
              <span>{formatTime(timeLeft)}</span>
            </div>
          </div>
        )}

        {/* Right Action: Submit Button or Close */}
        <div className="flex items-center gap-2">
          {!isSubmitted ? (
            <button
              onClick={() => setConfirmSubmitOpen(true)}
              className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3.5 py-2 text-xs font-black text-white shadow-lg transition"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{t('පිළිතුරු භාරදෙන්න (Submit)', 'Submit Paper')}</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="cursor-pointer rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-bold text-white transition"
            >
              {t('වසන්න (Close)', 'Close Results')}
            </button>
          )}

          <button
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
            title="Exit Exam"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* ---------------- Mobile Split Switcher ---------------- */}
      <div className="flex sm:hidden border-b border-slate-800 bg-slate-900 text-xs font-bold">
        <button
          onClick={() => setMobileTab('paper')}
          className={`flex-1 py-2.5 text-center ${
            mobileTab === 'paper' ? 'border-b-2 border-amber-500 text-amber-400 bg-slate-850' : 'text-slate-400'
          }`}
        >
          {t('1. ප්‍රශ්ණ පත්‍රය (Paper View)', 'Question Paper')}
        </button>
        <button
          onClick={() => setMobileTab('sheet')}
          className={`flex-1 py-2.5 text-center ${
            mobileTab === 'sheet' ? 'border-b-2 border-amber-500 text-amber-400 bg-slate-850' : 'text-slate-400'
          }`}
        >
          {t('2. පිළිතුරු පත්‍රය (OMR Sheet)', 'Answer Sheet')} ({answeredCount}/{totalQuestions})
        </button>
      </div>

      {/* ---------------- Main Split-Screen Workspace ---------------- */}
      {!isSubmitted ? (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          
          {/* LEFT PANE (Col 7 on Desktop): PDF / Question Paper Viewer */}
          <div
            className={`flex flex-col border-r border-slate-800 bg-slate-900/60 lg:col-span-7 ${
              mobileTab === 'paper' ? 'flex' : 'hidden lg:flex'
            }`}
          >
            {/* Paper Toolbar */}
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/70 px-4 py-2.5 text-xs text-slate-400">
              <span className="font-semibold flex items-center gap-1.5 text-slate-300">
                <FileText className="h-4 w-4 text-amber-400" />
                <span>{t('විභාග ප්‍රශ්ණ පත්‍රය (Official Question Paper)', 'Official Question Paper')}</span>
              </span>

              <div className="flex items-center gap-2">
                {exam.pdfUrl && (
                  <a
                    href={exam.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:underline"
                  >
                    <span>{t('වෙනම ටැබ් එකකින් විවෘත කරන්න', 'Open in New Tab')}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>

            {/* Embedded Paper Viewer */}
            <div className="flex-1 overflow-hidden relative bg-slate-950">
              {embedUrl ? (
                <iframe
                  src={embedUrl}
                  title="Exam Question Paper"
                  className="h-full w-full border-none"
                  allow="autoplay"
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400">
                  <FileText className="h-16 w-16 text-slate-600 mb-3" />
                  <p className="font-bold text-sm text-slate-300">
                    {t('ප්‍රශ්ණ පත්‍ර ලින්ක් එක ලබා දී නොමැත', 'No PDF embed available for this exam')}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    {t(
                      'ගුරුතුමා විසින් ලබා දී ඇති ප්‍රශ්ණ පත්‍රය අධ්‍යයනය කර දකුණු පස ඇති OMR පත්‍රයේ පිළිතුරු සලකුණු කරන්න.',
                      'Please refer to the instructor provided paper instructions and mark your answers on the right side bubble sheet.'
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT PANE (Col 5 on Desktop): Digital OMR Bubble Sheet */}
          <div
            className={`flex flex-col bg-slate-950 lg:col-span-5 overflow-hidden ${
              mobileTab === 'sheet' ? 'flex' : 'hidden lg:flex'
            }`}
          >
            {/* OMR Header & Progress Bar */}
            <div className="border-b border-slate-800 bg-slate-900/90 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold uppercase tracking-wider text-amber-400">
                  {t('ඩිජිටල් පිළිතුරු පත්‍රය (Digital OMR Sheet)', 'Digital OMR Sheet')}
                </span>
                <span className="font-mono font-bold text-slate-300">
                  {answeredCount} / {totalQuestions} {t('සම්පූර්ණයි', 'Answered')} ({progressPercent}%)
                </span>
              </div>

              {/* Progress visual bar */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>{t('ප්‍රශ්නයකට විකල්ප 5ක් ඇත (1, 2, 3, 4, 5 / A, B, C, D, E)', 'Select 1 option per question')}</span>
                {timeLeft < 300 && (
                  <span className="font-bold text-rose-400 animate-pulse flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    <span>විනාඩි 5ට අඩුයි!</span>
                  </span>
                )}
              </div>
            </div>

            {/* Questions Bubble List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
              {Array.from({ length: totalQuestions }, (_, i) => i + 1).map((qNum) => {
                const selectedVal = answers[qNum];
                const isAnswered = selectedVal !== undefined;

                return (
                  <div
                    key={qNum}
                    className={`rounded-2xl border p-3 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isAnswered
                        ? 'border-amber-500/40 bg-slate-900/80 shadow-sm'
                        : 'border-slate-800/80 bg-slate-900/40'
                    }`}
                  >
                    {/* Question Indicator */}
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-xl text-xs font-mono font-black ${
                          isAnswered
                            ? 'bg-amber-500 text-slate-950 shadow-sm'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {qNum < 10 ? `0${qNum}` : qNum}
                      </span>
                      <span className="text-xs font-bold text-slate-300">
                        {t(`ප්‍රශ්නය ${qNum}`, `Question ${qNum}`)}
                      </span>
                    </div>

                    {/* 5 Bubble Options (1, 2, 3, 4, 5 / A, B, C, D, E) */}
                    <div className="flex items-center gap-2 sm:gap-2.5">
                      {[1, 2, 3, 4, 5].map((optVal) => {
                        const isChosen = selectedVal === optVal;
                        const letter = String.fromCharCode(64 + optVal); // A, B, C, D, E

                        return (
                          <button
                            key={optVal}
                            type="button"
                            onClick={() => handleSelectOption(qNum, optVal)}
                            className={`cursor-pointer flex h-9 w-9 sm:h-10 sm:w-10 flex-col items-center justify-center rounded-full text-xs font-bold transition-all transform active:scale-90 ${
                              isChosen
                                ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/30 ring-2 ring-amber-300 scale-105'
                                : 'border border-slate-700 bg-slate-800/80 text-slate-300 hover:border-slate-500 hover:bg-slate-700'
                            }`}
                            title={`Question ${qNum}: Option ${optVal} (${letter})`}
                          >
                            <span className="text-xs">{optVal}</span>
                            <span className="text-[9px] font-mono opacity-80 leading-none">{letter}</span>
                          </button>
                        );
                      })}

                      {/* Clear Button */}
                      {isAnswered && (
                        <button
                          type="button"
                          onClick={() => handleClearOption(qNum)}
                          className="cursor-pointer text-[10px] text-slate-500 hover:text-rose-400 pl-1"
                          title="Clear selection"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* OMR Footer Action */}
            <div className="border-t border-slate-800 bg-slate-900/90 p-4 flex items-center justify-between gap-3">
              <div className="text-xs text-slate-400">
                <span className="font-bold text-white">{answeredCount}</span> of {totalQuestions} answered
              </div>
              <button
                type="button"
                onClick={() => setConfirmSubmitOpen(true)}
                className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 text-xs font-black text-white shadow-lg transition"
              >
                <CheckCircle className="h-4 w-4" />
                <span>{t('විභාගය අවසන් කරන්න (Finish & Submit)', 'Submit Exam Paper')}</span>
              </button>
            </div>

          </div>

        </div>
      ) : (
        /* ---------------- SUBMISSION RESULT & SCORECARD SCREEN ---------------- */
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex items-center justify-center bg-slate-950">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-10 shadow-2xl text-center space-y-6 animate-in zoom-in-95">
            
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Award className="h-10 w-10" />
            </div>

            <div>
              {wasAutoSubmitted && (
                <span className="inline-block rounded-full bg-rose-500/20 px-3 py-1 text-xs font-bold text-rose-300 border border-rose-500/30 mb-2">
                  ⏰ කාලය අවසන් වීම නිසා ස්වයංක්‍රීයව Submit විය (Auto Submitted)
                </span>
              )}

              <h2 className="text-xl sm:text-2xl font-black text-white">
                {t('විභාග පිළිතුරු පත්‍රය සාර්ථකව භාරගන්නා ලදී!', 'Online Exam Successfully Submitted!')}
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                {exam.courseTitle} · {exam.title}
              </p>
            </div>

            {/* Scorecard Numbers */}
            {examResult && (
              <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-md mx-auto">
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                  <span className="block text-[11px] font-semibold text-slate-400">
                    {t('ලකුණු', 'Score')}
                  </span>
                  <span className="mt-1 block text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                    {examResult.score} / {examResult.maxScore}
                  </span>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                  <span className="block text-[11px] font-semibold text-slate-400">
                    {t('ප්‍රතිශතය', 'Accuracy')}
                  </span>
                  <span className="mt-1 block text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                    {Math.round((examResult.score / examResult.maxScore) * 100)}%
                  </span>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                  <span className="block text-[11px] font-semibold text-slate-400">
                    {t('ශ්‍රේණිය', 'Grade')}
                  </span>
                  <span className="mt-1 block text-2xl sm:text-3xl font-black text-blue-400">
                    {examResult.grade}
                  </span>
                </div>
              </div>
            )}

            {/* Notification to Instructor Confirmation */}
            <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 text-xs text-amber-200/90 text-left space-y-1">
              <span className="font-bold block text-amber-300">
                ✓ {t('ගුරුතුමා වෙත වාර්තා විය (Reported to Instructor):', 'Teacher Marks Registry Updated:')}
              </span>
              <p className="leading-relaxed text-[11px]">
                {t(
                  `ඔබගේ විභාග ලකුණු සහ පිළිතුරු පත්‍රය ආචාර්ය මණ්ඩලය වෙත ක්ෂණිකව වාර්තා කරන ලදී. ශ්‍රේණිගත කිරීම් ලැයිස්තුවට (Rank List) මෙම ප්‍රතිඵලය ඇතුළත් වේ.`,
                  `Your marks have been instantly pushed to the teacher's dashboard and recorded in the national class rank list.`
                )}
              </p>
            </div>

            {/* Close / Return Button */}
            <div className="pt-2">
              <button
                onClick={onClose}
                className="cursor-pointer rounded-2xl bg-amber-500 hover:bg-amber-400 px-8 py-3 text-xs font-black text-slate-950 transition shadow-lg shadow-amber-500/20"
              >
                {t('ඩෑෂ්බෝඩ් එක වෙත ආපසු යන්න', 'Back to Student Dashboard')}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ---------------- Confirm Submission Modal ---------------- */}
      {confirmSubmitOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 text-xs text-white shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 font-bold">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {t('පිළිතුරු පත්‍රය භාරදීම තහවුරු කරන්න', 'Confirm Exam Paper Submission')}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {t('වරක් භාරදුන් පසු පිළිතුරු වෙනස් කළ නොහැක.', 'Answers cannot be edited once submitted.')}
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-950 p-3.5 space-y-2 text-slate-300">
              <div className="flex justify-between">
                <span>{t('මුළු ප්‍රශ්ණ ගණන:', 'Total Questions:')}</span>
                <span className="font-mono font-bold text-white">{totalQuestions}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('පිළිතුරු සපයා ඇති ගණන:', 'Answered Questions:')}</span>
                <span className="font-mono font-bold text-emerald-400">{answeredCount}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('පිළිතුරු සපයා නැති ගණන:', 'Unanswered Questions:')}</span>
                <span className="font-mono font-bold text-rose-400">{totalQuestions - answeredCount}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmSubmitOpen(false)}
                className="cursor-pointer flex-1 py-2.5 rounded-xl border border-slate-700 bg-slate-800 font-bold text-slate-300 hover:bg-slate-700"
              >
                {t('නැවත සලකා බලන්න', 'Back to Paper')}
              </button>
              <button
                type="button"
                onClick={() => executeSubmission(false)}
                className="cursor-pointer flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white shadow-md"
              >
                {t('තහවුරු කර භාරදෙන්න', 'Confirm Submit')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
