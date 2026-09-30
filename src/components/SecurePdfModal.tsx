import React, { useEffect, useState } from 'react';
import { X, Lock, Shield, FileText, AlertCircle, Eye } from 'lucide-react';
import { Assignment } from '../types';

interface SecurePdfModalProps {
  assignment: Assignment | null;
  studentName?: string;
  onClose: () => void;
}

// Convert any Google Drive URL, raw PDF URL, or iframe embed code into an embeddable preview URL
export const formatPdfEmbedUrl = (rawUrl: string): { embedUrl: string; isGoogleDrive: boolean } => {
  if (!rawUrl) return { embedUrl: '', isGoogleDrive: false };
  let url = rawUrl.trim();

  // If user pasted an entire iframe snippet like <iframe src="..." ...>
  const iframeSrcMatch = url.match(/src=["'](.*?)["']/);
  if (iframeSrcMatch && iframeSrcMatch[1]) {
    url = iframeSrcMatch[1];
  }

  // Google Drive patterns:
  // 1. https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  // 2. https://drive.google.com/file/d/FILE_ID/preview
  // 3. https://drive.google.com/open?id=FILE_ID
  // 4. https://drive.google.com/uc?id=FILE_ID
  const driveFileMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  const driveIdParamMatch = url.match(/drive\.google\.com\/(?:open|uc)\?id=([a-zA-Z0-9_-]+)/);
  const fileId = driveFileMatch ? driveFileMatch[1] : driveIdParamMatch ? driveIdParamMatch[1] : null;

  if (fileId) {
    return {
      embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      isGoogleDrive: true,
    };
  }

  // Standard PDF or web document: append toolbar suppression
  if (url.toLowerCase().endsWith('.pdf') && !url.includes('#')) {
    return {
      embedUrl: `${url}#toolbar=0&navpanes=0&scrollbar=0`,
      isGoogleDrive: false,
    };
  }

  return {
    embedUrl: url,
    isGoogleDrive: false,
  };
};

export const SecurePdfModal: React.FC<SecurePdfModalProps> = ({
  assignment,
  studentName = 'Student',
  onClose,
}) => {
  const [watermarkPos, setWatermarkPos] = useState({ top: '30%', left: '20%' });

  // Floating watermark for document piracy deterrent
  useEffect(() => {
    const timer = setInterval(() => {
      const top = Math.floor(Math.random() * 60 + 20) + '%';
      const left = Math.floor(Math.random() * 60 + 20) + '%';
      setWatermarkPos({ top, left });
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Prevent right-click, print (Ctrl+P), and save (Ctrl+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 's')) {
        e.preventDefault();
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!assignment) return null;

  const { embedUrl, isGoogleDrive } = formatPdfEmbedUrl(assignment.pdfUrl);

  return (
    <div
      onContextMenu={(e) => {
        e.preventDefault();
        return false;
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 select-none animate-in fade-in"
    >
      <div className="relative flex flex-col h-[94vh] w-full max-w-5xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-400">
                  {assignment.courseTitle}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold">
                  {assignment.month}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                  <Lock className="w-2.5 h-2.5" />
                  Protected PDF
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white line-clamp-1 mt-0.5">
                {assignment.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col text-right text-[11px] text-slate-400">
              <span>ආචාර්ය: <strong className="text-white">{assignment.lecturerName || 'Lecturer'}</strong></span>
              <span className="text-rose-400">Due: {assignment.dueDate}</span>
            </div>

            <button
              onClick={onClose}
              className="cursor-pointer p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              title="Close (වසන්න)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Security Warning Notice */}
        <div className="px-4 py-1.5 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between text-[11px] text-amber-300">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              <strong>ආරක්ෂිත කියවුම් පුවරුව:</strong> මෙම පැවරුම බාගත කිරීම (Download) හෝ පිටපත් කිරීම (Copy/Right Click) සීමා කර ඇත.
            </span>
          </div>
          <span className="font-mono text-[10px] text-amber-400/80 hidden sm:inline">
            Monarch DRM Protected
          </span>
        </div>

        {/* Document Viewing Stage */}
        <div className="relative flex-1 bg-slate-950 overflow-hidden">
          
          {/* PROTECTIVE TOP-RIGHT SHIELD (Blocks Google Drive Pop-out & Download icon) */}
          {/* Google Drive preview puts a pop-out button at the top right. We mask it! */}
          <div
            className="absolute top-0 right-0 z-30 h-14 w-44 pointer-events-auto bg-slate-900 border-b border-l border-slate-700 flex items-center justify-center gap-1.5 px-2 text-xs font-bold text-amber-400 shadow-lg"
            title="Download & External Pop-out Disabled for Security"
          >
            <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-[11px]">Protected Document</span>
          </div>

          {/* Floating Student Anti-Piracy Watermark */}
          <div
            style={{ top: watermarkPos.top, left: watermarkPos.left }}
            className="pointer-events-none absolute z-20 text-xs font-mono font-bold text-slate-400/20 select-none tracking-widest backdrop-blur-[1px] transition-all duration-1000 rotate-[-12deg]"
          >
            {studentName} · MONARCH LMS ASSIGNMENT
          </div>

          {/* Document Iframe */}
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={assignment.title}
              className="h-full w-full border-none bg-slate-900"
              allow="autoplay"
              sandbox="allow-scripts allow-same-origin allow-forms"
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-3">
              <AlertCircle className="w-10 h-10 text-amber-500" />
              <p className="text-sm font-semibold">
                පැවරුම් ලිපිනය සකසා නැත හෝ වලංගු නොවේ.
              </p>
            </div>
          )}
        </div>

        {/* Bottom Status Ribbon */}
        <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>{assignment.month} පැවරුම් පත්‍රිකාව</span>
          <span className="font-mono text-slate-500">Student: {studentName}</span>
        </div>
      </div>
    </div>
  );
};
