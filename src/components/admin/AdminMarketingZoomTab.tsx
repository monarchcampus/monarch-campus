import React, { useState } from 'react';
import {
  QrCode,
  Share2,
  Video,
  FileText,
  PlusCircle,
  ExternalLink,
  Copy,
  Check,
  Download,
  Trash2,
  Globe,
  MessageCircle,
  X,
} from 'lucide-react';
import { useLmsData } from '../../context/LmsDataContext';
import { useLanguage } from '../../context/LanguageContext';
import { MarketingCampaign, ZoomClass, OnlineExam } from '../../types';

export const AdminMarketingZoomTab: React.FC = () => {
  const {
    courses,
    campaigns,
    addCampaign,
    deleteCampaign,
    zoomClasses,
    addZoomClass,
    deleteZoomClass,
    onlineExams,
    pushLiveExam,
    deleteOnlineExam,
  } = useLmsData();
  const { t } = useLanguage();

  const [activeSubTab, setActiveSubTab] = useState<'campaigns' | 'zoom' | 'exams'>('campaigns');
  const [showAddCampaignModal, setShowAddCampaignModal] = useState(false);
  const [showAddZoomModal, setShowAddZoomModal] = useState(false);
  const [showAddExamModal, setShowAddExamModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Exam form
  const [examCourseId, setExamCourseId] = useState(courses[0]?.id || '');
  const [examTitle, setExamTitle] = useState('');
  const [examPdfUrl, setExamPdfUrl] = useState('https://drive.google.com/file/d/1_Sample_Combined_Maths/view');
  const [examDuration, setExamDuration] = useState('60');
  const [examQuestionsCount, setExamQuestionsCount] = useState('25');
  const [examTotalMarks, setExamTotalMarks] = useState('100');
  const [examPushType, setExamPushType] = useState<'now' | 'schedule'>('now');
  const [examScheduleTime, setExamScheduleTime] = useState('2026-09-30T19:00');

  // Campaign form
  const [campTitle, setCampTitle] = useState('');
  const [campSlug, setCampSlug] = useState('');
  const [campDesc, setCampDesc] = useState('');
  const [fbUrl, setFbUrl] = useState('https://facebook.com/monarchcampus.lk');
  const [ytUrl, setYtUrl] = useState('https://youtube.com/@MonarchCampusLK');
  const [igUrl, setIgUrl] = useState('https://instagram.com/monarchcampus');
  const [tkUrl, setTkUrl] = useState('https://tiktok.com/@monarchcampus');
  const [webUrl, setWebUrl] = useState('https://monarchcampus.lk');
  const [waUrl, setWaUrl] = useState('https://chat.whatsapp.com/MonarchAlerts');

  // Zoom form
  const [zTopic, setZTopic] = useState('');
  const [zDate, setZDate] = useState('2026-09-30');
  const [zTime, setZTime] = useState('07:00 PM - 09:30 PM');
  const [zMeetingId, setZMeetingId] = useState('892 4102 7741');
  const [zPasscode, setZPasscode] = useState('MONARCH28');
  const [zJoinUrl, setZJoinUrl] = useState('https://zoom.us/j/89241027741?pwd=MONARCH');

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campTitle.trim()) return;

    addCampaign({
      id: `camp-${Date.now()}`,
      title: campTitle.trim(),
      slug: (campSlug || campTitle).toLowerCase().replace(/\s+/g, '-'),
      descriptionSi: campDesc.trim() || campTitle.trim(),
      descriptionEn: campTitle.trim(),
      facebookUrl: fbUrl,
      youtubeUrl: ytUrl,
      instagramUrl: igUrl,
      tiktokUrl: tkUrl,
      websiteUrl: webUrl,
      whatsappUrl: waUrl,
      createdAt: new Date().toISOString().substring(0, 10),
    });

    setShowAddCampaignModal(false);
    setCampTitle('');
  };

  const handleCreateZoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!zTopic.trim()) return;

    addZoomClass({
      id: `zoom-${Date.now()}`,
      courseId: 'course-maths-2028',
      courseTitle: '2028 A/L Combined Mathematics',
      topic: zTopic.trim(),
      date: zDate,
      time: zTime,
      meetingId: zMeetingId,
      passcode: zPasscode,
      joinUrl: zJoinUrl,
      hostUrl: `https://zoom.us/s/${zMeetingId.replace(/\s+/g, '')}?zak=HOST_KEY_AUTO`,
      instructorPhone: '0701306952',
      instructorName: 'Eng. Kaveen Jayasuriya',
      status: 'scheduled',
    });

    setShowAddZoomModal(false);
    setZTopic('');
  };

  const handlePushExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examTitle.trim()) return;

    const selectedCourse = courses.find((c) => c.id === examCourseId) || courses[0];
    if (!selectedCourse) return;

    pushLiveExam({
      courseId: selectedCourse.id,
      courseTitle: selectedCourse.titleSi,
      title: examTitle.trim(),
      durationMinutes: Number(examDuration) || 60,
      questionsCount: Number(examQuestionsCount) || 25,
      totalMarks: Number(examTotalMarks) || 100,
      pdfUrl: examPdfUrl.trim() || undefined,
      paperType: 'online_exam',
      optionsPerQuestion: 5,
      scheduledTime: examPushType === 'schedule' ? examScheduleTime : undefined,
      pushedByInstructor: selectedCourse.instructorNameSi || 'Senior Faculty',
    });

    setShowAddExamModal(false);
    setExamTitle('');
  };

  return (
    <div className="space-y-6">
      {/* Sub Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4 text-xs font-bold">
        <button
          onClick={() => setActiveSubTab('campaigns')}
          className={`cursor-pointer pb-2 flex items-center gap-1.5 ${
            activeSubTab === 'campaigns'
              ? 'border-b-2 border-amber-500 text-amber-600 dark:text-amber-400 font-extrabold'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>{t('QR කෝඩ් & ප්‍රචාරණ පිටු (Marketing Campaigns)', 'QR Codes & Marketing')}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('zoom')}
          className={`cursor-pointer pb-2 flex items-center gap-1.5 ${
            activeSubTab === 'zoom'
              ? 'border-b-2 border-amber-500 text-amber-600 dark:text-amber-400 font-extrabold'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>{t('සජීවී Zoom පන්ති (Live Zoom Sessions)', 'Live Zoom Classes')}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('exams')}
          className={`cursor-pointer pb-2 flex items-center gap-1.5 ${
            activeSubTab === 'exams'
              ? 'border-b-2 border-amber-500 text-amber-600 dark:text-amber-400 font-extrabold'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{t('විභාග සහ ප්‍රශ්න පත්‍ර (Online Papers)', 'Online Exams & Papers')}</span>
        </button>
      </div>

      {/* 1. MARKETING CAMPAIGNS & QR CODES */}
      {activeSubTab === 'campaigns' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t('QR කෝඩ් සහ සෝෂල් මීඩියා ප්‍රචාරණ කළමනාකරණය', 'Marketing Campaigns & QR Code Hub')}
              </h3>
              <p className="text-xs text-slate-500">
                {t('ෆේස්බුක්, යූටියුබ්, ඉන්ස්ටග්‍රෑම්, ටික්ටොක් ලින්ක් සහ QR කෝඩ් සහිත ප්‍රචාරණ පිටු', 'Generate QR codes and shareable landing links for social media advertising')}
              </p>
            </div>
            <button
              onClick={() => setShowAddCampaignModal(true)}
              className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Create QR Campaign</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaigns.map((camp) => {
              const fullUrl = `https://monarchcampus.lk/c/${camp.slug}`;
              return (
                <div
                  key={camp.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{camp.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{camp.descriptionSi}</p>
                    </div>
                    <button
                      onClick={() => deleteCampaign(camp.id)}
                      className="cursor-pointer text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* QR Code Card */}
                  <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                    {/* Visual QR Code Generator */}
                    <div className="p-2 bg-white rounded-lg border shadow-sm">
                      <svg width="72" height="72" viewBox="0 0 100 100" fill="none">
                        <rect width="100" height="100" fill="white" />
                        <rect x="5" y="5" width="30" height="30" fill="black" />
                        <rect x="10" y="10" width="20" height="20" fill="white" />
                        <rect x="15" y="15" width="10" height="10" fill="black" />
                        <rect x="65" y="5" width="30" height="30" fill="black" />
                        <rect x="70" y="10" width="20" height="20" fill="white" />
                        <rect x="75" y="15" width="10" height="10" fill="black" />
                        <rect x="5" y="65" width="30" height="30" fill="black" />
                        <rect x="10" y="70" width="20" height="20" fill="white" />
                        <rect x="15" y="75" width="10" height="10" fill="black" />
                        <circle cx="50" cy="50" r="10" fill="#f59e0b" />
                        <rect x="42" y="12" width="6" height="24" fill="black" />
                        <rect x="52" y="20" width="6" height="12" fill="black" />
                        <rect x="65" y="45" width="25" height="6" fill="black" />
                        <rect x="45" y="65" width="12" height="6" fill="black" />
                        <rect x="65" y="75" width="10" height="10" fill="black" />
                      </svg>
                    </div>

                    <div className="flex-1 space-y-1 text-xs">
                      <span className="font-mono text-slate-600 dark:text-slate-300 block truncate font-semibold">
                        {fullUrl}
                      </span>
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => handleCopy(camp.id, fullUrl)}
                          className="cursor-pointer inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline"
                        >
                          {copiedLink === camp.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedLink === camp.id ? 'Copied Link' : 'Copy Link'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Social Channel Links */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2 text-[11px]">
                    {camp.facebookUrl && (
                      <a href={camp.facebookUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                        Facebook
                      </a>
                    )}
                    {camp.youtubeUrl && (
                      <a href={camp.youtubeUrl} target="_blank" rel="noreferrer" className="text-red-600 hover:underline">
                        YouTube
                      </a>
                    )}
                    {camp.instagramUrl && (
                      <a href={camp.instagramUrl} target="_blank" rel="noreferrer" className="text-pink-600 hover:underline">
                        Instagram
                      </a>
                    )}
                    {camp.tiktokUrl && (
                      <a href={camp.tiktokUrl} target="_blank" rel="noreferrer" className="text-slate-800 dark:text-slate-200 hover:underline">
                        TikTok
                      </a>
                    )}
                    {camp.whatsappUrl && (
                      <a href={camp.whatsappUrl} target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline">
                        WhatsApp Group
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. ZOOM LIVE LESSONS */}
      {activeSubTab === 'zoom' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t('සජීවී Zoom පන්ති කළමනාකරණය', 'Zoom Live Class Scheduling')}
              </h3>
              <p className="text-xs text-slate-500">
                {t('නව Zoom පන්ති ක්‍රියේට් කිරීම සහ සිසුන් සඳහා WhatsApp alerts යැවීම', 'Create Zoom live lessons with Meeting ID, Passcode, and WhatsApp notifications')}
              </p>
            </div>
            <button
              onClick={() => setShowAddZoomModal(true)}
              className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Schedule Zoom Session</span>
            </button>
          </div>

          <div className="space-y-3">
            {zoomClasses.map((z) => (
              <div
                key={z.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <span className="font-bold text-sm text-slate-900 dark:text-white block">{z.topic}</span>
                  <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                    <span>{z.courseTitle}</span>
                    <span>· {z.date} ({z.time})</span>
                    <span>· Meeting ID: <strong className="font-mono text-slate-900 dark:text-white">{z.meetingId}</strong></span>
                    <span>· Passcode: <strong className="font-mono text-slate-900 dark:text-white">{z.passcode}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={z.joinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="cursor-pointer px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Join Class</span>
                  </a>
                  <button
                    onClick={() => deleteZoomClass(z.id)}
                    className="cursor-pointer p-1.5 text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. EXAMS & PAPERS */}
      {activeSubTab === 'exams' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t('ඩිජිටල් ඔන්ලයින් විභාග සහ ප්‍රතිඵල (Online Exams & Papers)', 'Online Exams & Paper Class Results')}
              </h3>
              <p className="text-xs text-slate-500">
                {t(
                  'සිසුන්ට OMR බබල් ශීට් එකක් සමඟ ක්ෂණිකව ලැබෙන සජීවී විභාග මෙතැනින් පුෂ් කරන්න.',
                  'Push timed digital papers with 5-choice OMR answer sheets directly to students'
                )}
              </p>
            </div>
            <button
              onClick={() => {
                if (courses.length > 0 && !examCourseId) {
                  setExamCourseId(courses[0].id);
                }
                setShowAddExamModal(true);
              }}
              className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('+ නව විභාගයක් පුෂ් කරන්න', '+ Push Live Online Exam')}</span>
            </button>
          </div>

          <div className="space-y-3">
            {onlineExams.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-400">
                {t('තවමත් විභාග ප්‍රශ්ණ පත්‍ර එක් කර නැත. ඉහත බටනය මගින් නව විභාගයක් පුෂ් කරන්න.', 'No exams created yet. Use the button above to push a new exam.')}
              </div>
            ) : (
              onlineExams.map((ex) => (
                <div
                  key={ex.id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                          {ex.durationMinutes} Mins · {ex.questionsCount} Qs
                        </span>
                        {ex.status === 'scheduled' && (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">
                            Scheduled: {ex.scheduledTime}
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1">{ex.title}</h4>
                      <span className="text-xs text-slate-500">{ex.courseTitle} · {ex.totalMarks} Marks</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {ex.results.length} Submissions
                      </span>
                      <button
                        onClick={() => deleteOnlineExam(ex.id)}
                        className="cursor-pointer p-1.5 text-slate-400 hover:text-rose-600"
                        title="Delete Exam"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Submissions table snippet */}
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Student Marks:
                    </span>
                    {ex.results.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic">තවමත් ශිෂ්‍ය පිළිතුරු ලැබී නොමැත.</p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        {ex.results.map((res, i) => (
                          <div key={i} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                            <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate">{res.studentName}</span>
                            <div className="flex items-center justify-between text-[11px] mt-0.5">
                              <span className="font-mono font-bold text-amber-600">{res.score}/{res.maxScore}</span>
                              <span className="font-bold text-emerald-600">Grade {res.grade}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Add Campaign Modal */}
      {showAddCampaignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">Create QR Marketing Campaign</h3>
            <form onSubmit={handleCreateCampaign} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Campaign Title (මාතෘකාව) *</label>
                <input
                  type="text"
                  required
                  value={campTitle}
                  onChange={(e) => setCampTitle(e.target.value)}
                  placeholder="e.g. 2028 A/L Fresh Intake Drive"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Description (විස්තරය)</label>
                <textarea
                  rows={2}
                  value={campDesc}
                  onChange={(e) => setCampDesc(e.target.value)}
                  placeholder="Campaign highlights and intake details..."
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Facebook URL</label>
                  <input
                    type="url"
                    value={fbUrl}
                    onChange={(e) => setFbUrl(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">YouTube URL</label>
                  <input
                    type="url"
                    value={ytUrl}
                    onChange={(e) => setYtUrl(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddCampaignModal(false)}
                  className="cursor-pointer flex-1 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="cursor-pointer flex-1 py-2 rounded-xl bg-amber-500 font-bold text-slate-950"
                >
                  Generate QR Page
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Zoom Modal */}
      {showAddZoomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">Schedule Live Zoom Class</h3>
            <form onSubmit={handleCreateZoom} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Lesson Topic (මාතෘකාව) *</label>
                <input
                  type="text"
                  required
                  value={zTopic}
                  onChange={(e) => setZTopic(e.target.value)}
                  placeholder="e.g. කලනය සහ අවකලනය ගැටළු සාකච්ඡාව"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Date (දිනය)</label>
                  <input
                    type="date"
                    value={zDate}
                    onChange={(e) => setZDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Time (වේලාව)</label>
                  <input
                    type="text"
                    value={zTime}
                    onChange={(e) => setZTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Meeting ID</label>
                  <input
                    type="text"
                    value={zMeetingId}
                    onChange={(e) => setZMeetingId(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Passcode</label>
                  <input
                    type="text"
                    value={zPasscode}
                    onChange={(e) => setZPasscode(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddZoomModal(false)}
                  className="cursor-pointer flex-1 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="cursor-pointer flex-1 py-2 rounded-xl bg-blue-600 font-bold text-white"
                >
                  Save Zoom Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Add Exam Modal */}
      {showAddExamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {t('නව ඔන්ලයින් විභාගයක් පුෂ් කරන්න', 'Push Live Digital Online Exam')}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {t('අදාල කෝස් එකට මුදල් ගෙවා ඇති සිසුන්ට මෙම විභාගය ලැබෙනු ඇත.', 'Only paid enrolled students will receive access.')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddExamModal(false)}
                className="cursor-pointer text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePushExam} className="space-y-3.5">
              {/* Select Course */}
              <div>
                <label className="block font-bold mb-1">{t('පාඨමාලාව (Select Course) *', 'Course *')}</label>
                <select
                  value={examCourseId}
                  onChange={(e) => setExamCourseId(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 font-semibold text-xs text-slate-900 dark:text-white"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      [{c.grade}] {c.titleSi}
                    </option>
                  ))}
                </select>
              </div>

              {/* Exam Title */}
              <div>
                <label className="block font-bold mb-1">{t('විභාගයේ මාතෘකාව (Exam Title) *', 'Exam Title *')}</label>
                <input
                  type="text"
                  required
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  placeholder="e.g. Model Paper 01 - ත්‍රිකෝණමිතිය සහ කලනය"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 font-medium text-xs text-slate-900 dark:text-white"
                />
              </div>

              {/* PDF Google Drive Link */}
              <div>
                <label className="block font-bold mb-1">
                  {t('ප්‍රශ්ණ පත්‍රයේ PDF Link එක (Google Drive Link / Direct PDF URL)', 'Question Paper PDF Link (Google Drive)')}
                </label>
                <input
                  type="url"
                  value={examPdfUrl}
                  onChange={(e) => setExamPdfUrl(e.target.value)}
                  placeholder="https://drive.google.com/file/d/.../view"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 font-mono text-[11px] text-slate-900 dark:text-white"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  {t('ගූගල් ඩ්‍රයිව් ලින්ක් එකක් (View link) හෝ සෘජු PDF URL එකක් යොදන්න.', 'Paste Google Drive file link. Preview mode will be automatically configured.')}
                </span>
              </div>

              {/* Duration & Questions count */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-bold mb-1">
                    {t('කාලය (Duration) *', 'Duration *')}
                  </label>
                  <select
                    value={examDuration}
                    onChange={(e) => setExamDuration(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 font-bold text-amber-600 text-xs"
                  >
                    <option value="10">10 Mins (විනාඩි 10)</option>
                    <option value="15">15 Mins (විනාඩි 15)</option>
                    <option value="20">20 Mins (විනාඩි 20)</option>
                    <option value="30">30 Mins (විනාඩි 30)</option>
                    <option value="45">45 Mins (විනාඩි 45)</option>
                    <option value="60">1 Hour (පැය 1)</option>
                    <option value="90">1.30 Hours (පැය 1 හමාර)</option>
                    <option value="120">2 Hours (පැය 2)</option>
                    <option value="150">2.30 Hours (පැය 2 හමාර)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1">
                    {t('ප්‍රශ්ණ ගණන (Questions) *', 'Questions *')}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={examQuestionsCount}
                    onChange={(e) => setExamQuestionsCount(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 font-bold text-xs text-slate-900 dark:text-white"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">ප්‍රශ්නයකට විකල්ප 5 බැගින්</span>
                </div>

                <div>
                  <label className="block font-bold mb-1">
                    {t('මුළු ලකුණු (Total Marks)', 'Total Marks')}
                  </label>
                  <input
                    type="number"
                    value={examTotalMarks}
                    onChange={(e) => setExamTotalMarks(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 font-bold text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Push Options: Now vs Schedule */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 p-3 space-y-2">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  {t('විභාගය නිකුත් කිරීමේ ආකාරය (Publish Mode)', 'Publish Mode')}
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setExamPushType('now')}
                    className={`cursor-pointer p-2.5 rounded-xl border text-xs font-bold transition text-center ${
                      examPushType === 'now'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-extrabold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    ⚡ {t('දැන්ම පුෂ් කරන්න (Push Now)', 'Push Live Right Now')}
                  </button>

                  <button
                    type="button"
                    onClick={() => setExamPushType('schedule')}
                    className={`cursor-pointer p-2.5 rounded-xl border text-xs font-bold transition text-center ${
                      examPushType === 'schedule'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-extrabold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    📅 {t('දිනය හා වේලාව වෙන්කරන්න', 'Schedule Date & Time')}
                  </button>
                </div>

                {examPushType === 'schedule' && (
                  <div className="pt-2">
                    <label className="block font-semibold mb-1 text-[11px]">
                      {t('නිකුත් කරන දිනය හා වේලාව:', 'Scheduled Release Date & Time:')}
                    </label>
                    <input
                      type="datetime-local"
                      value={examScheduleTime}
                      onChange={(e) => setExamScheduleTime(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddExamModal(false)}
                  className="cursor-pointer flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {t('අවලංගු කරන්න', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="cursor-pointer flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 font-black text-slate-950 shadow-md"
                >
                  {t('විභාගය පුෂ් කරන්න (Confirm Push)', 'Push Exam to Students')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
