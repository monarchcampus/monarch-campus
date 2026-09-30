import React, { useState } from 'react';
import {
  X,
  Play,
  CheckCircle,
  FileText,
  Clock,
  Download,
  BookOpen,
  Share2,
  Volume2,
} from 'lucide-react';
import { Course, Lesson } from '../types';
import { useAuth } from '../context/AuthContext';
import { useLmsData } from '../context/LmsDataContext';
import { MonarchEmblem } from './BrandAssets';
import { SecureVideoPlayer } from './SecureVideoPlayer';

interface CourseViewerModalProps {
  course: Course;
  onClose: () => void;
}

export const CourseViewerModal: React.FC<CourseViewerModalProps> = ({
  course,
  onClose,
}) => {
  const { currentUser } = useAuth();
  const { completedLessons, markLessonCompleted } = useLmsData();

  const [selectedLessonIndex, setSelectedLessonIndex] = useState(0);
  const currentLesson: Lesson = course.lessons[selectedLessonIndex] || course.lessons[0];

  const isCurrentLessonDone = !!completedLessons[currentLesson?.id];

  const handleToggleCurrentLesson = () => {
    if (!currentLesson) return;
    const nextState = !isCurrentLessonDone;
    markLessonCompleted(course.id, currentLesson.id, nextState, {
      studentId: currentUser?.id || 'student',
      studentName: currentUser?.fullName || 'Student',
      instructorPhone: course.instructorPhone,
      courseTitleSi: course.titleSi,
      lessonTitleSi: currentLesson.titleSi,
    });
  };

  // Filter out any AI Doubt Solver mention from features
  const filteredFeatures = course.featuresSi.filter(
    (f) =>
      !f.toLowerCase().includes('doubt') &&
      !f.toLowerCase().includes('ai doubt') &&
      !f.includes('ගැටළු')
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2 sm:p-4 backdrop-blur-sm">
      <div className="flex h-full max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 text-white shadow-2xl">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <MonarchEmblem size={34} withShadow={false} />
            <span className="rounded bg-amber-500/20 px-2 py-0.5 text-xs font-bold text-amber-400 border border-amber-500/30">
              {course.grade}
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white line-clamp-1">
                {course.titleSi}
              </h3>
              <p className="text-xs text-slate-400 line-clamp-1">{course.titleEn}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-200 hover:text-white transition text-xs font-bold border border-slate-700 shadow-sm active:scale-95"
              title="Close Player (ප්ලේයරය වසන්න)"
            >
              <X className="h-4 w-4" />
              <span>වසන්න (Close)</span>
            </button>
          </div>
        </div>

        {/* Content Body: Split between Video Player and Lesson Playlist */}
        <div className="grid flex-1 grid-cols-1 overflow-hidden lg:grid-cols-12">
          
          {/* Main Stage: Video Player and Lesson Info (8 cols on desktop) */}
          <div className="flex flex-col overflow-y-auto lg:col-span-8 p-4 sm:p-6 bg-slate-900 border-r border-slate-800">
            
            {/* Protected Video Stage with DRM & Invisible Shield */}
            <SecureVideoPlayer
              key={currentLesson.videoUrl}
              videoUrl={currentLesson.videoUrl}
              poster="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80"
              studentName={currentUser?.fullName || 'Monarch Student'}
            />

            {/* Current Lesson Metadata */}
            <div className="mt-4 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white">
                    {currentLesson.titleSi}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">{currentLesson.titleEn}</p>
                </div>

                {/* Mark as Completed Button with Teacher Notification */}
                <button
                  onClick={handleToggleCurrentLesson}
                  className={`cursor-pointer flex items-center gap-1.5 shrink-0 rounded-xl px-3.5 py-2 text-xs font-bold transition shadow-sm ${
                    isCurrentLessonDone
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                  }`}
                  title="Mark lesson done & report to instructor"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>
                    {isCurrentLessonDone
                      ? '✓ නරඹා අවසන් (Completed)'
                      : 'නරඹා අවසන් බව සලකුණු කරන්න'}
                  </span>
                </button>
              </div>

              {/* Lesson Summary Callout */}
              <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                  Lesson Key Points (පාඩම් සාරාංශය):
                </span>
                <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                  {currentLesson.summarySi}
                </p>
                <p className="mt-1 text-xs text-slate-400 leading-relaxed italic">
                  {currentLesson.summaryEn}
                </p>
              </div>

              {/* Action Bar: Download Tute & Instructor */}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-3">
                <div className="flex items-center gap-2.5">
                  <img
                    src={course.instructorAvatar}
                    alt={course.instructorNameEn}
                    className="h-8 w-8 rounded-full object-cover border border-amber-500/40"
                  />
                  <div>
                    <span className="block text-xs font-bold text-white">
                      {course.instructorNameSi}
                    </span>
                    <span className="block text-[10px] text-slate-400">
                      {course.instructorNameEn}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href="#download-tute"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('PDF Tute downloaded to your device!');
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-500 transition"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download Tute PDF (නිබන්ධනය බාගන්න)</span>
                  </a>
                </div>
              </div>

            </div>

          </div>

          {/* Right Stage: Lessons Playlist (4 cols on desktop) */}
          <div className="flex flex-col overflow-y-auto lg:col-span-4 bg-slate-950/90 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Course Lessons ({course.lessons.length} පාඩම්)
              </h4>
              <span className="text-xs text-amber-400 font-mono">
                {course.lessons.filter((l) => !!completedLessons[l.id]).length}/{course.lessons.length} Done
              </span>
            </div>

            <div className="space-y-2">
              {course.lessons.map((lesson, idx) => {
                const isActive = idx === selectedLessonIndex;
                const isDone = !!completedLessons[lesson.id];

                return (
                  <button
                    key={lesson.id}
                    onClick={() => setSelectedLessonIndex(idx)}
                    className={`w-full text-left rounded-xl p-3 transition border cursor-pointer ${
                      isActive
                        ? 'border-amber-500/50 bg-amber-500/10 text-white'
                        : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                            isActive
                              ? 'bg-amber-500 text-slate-950'
                              : isDone
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {isDone ? '✓' : idx + 1}
                        </span>
                        <h5 className="text-xs font-semibold line-clamp-1">
                          {lesson.titleSi}
                        </h5>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        {lesson.duration}
                      </span>
                    </div>

                    <p className="mt-1 pl-8 text-[11px] text-slate-400 line-clamp-1">
                      {lesson.titleEn}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Course Features Footer in modal */}
            <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/50 p-3 text-xs text-slate-400">
              <span className="font-semibold text-slate-200">Included in this course:</span>
              <ul className="mt-1.5 space-y-1 text-[11px]">
                {filteredFeatures.map((feat, i) => (
                  <li key={i} className="flex items-center gap-1.5 text-slate-300">
                    <span className="text-amber-400">·</span> {feat}
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
