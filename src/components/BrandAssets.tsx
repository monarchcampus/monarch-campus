import React, { useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, Trash2, CheckCircle2, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface EmblemProps {
  size?: number;
  className?: string;
  withShadow?: boolean;
  customUrl?: string | null;
}

export const MonarchEmblem: React.FC<EmblemProps> = ({
  size = 56,
  className = '',
  withShadow = true,
  customUrl,
}) => {
  const [localEmblemUrl, setLocalEmblemUrl] = useState<string | null>(customUrl || null);

  useEffect(() => {
    if (customUrl !== undefined) {
      setLocalEmblemUrl(customUrl);
      return;
    }
    const savedConfig = localStorage.getItem('monarch_site_config');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        if (parsed.customEmblemUrl) {
          setLocalEmblemUrl(parsed.customEmblemUrl);
        }
      } catch {
        // ignore
      }
    }
  }, [customUrl]);

  if (localEmblemUrl) {
    return (
      <img
        src={localEmblemUrl}
        alt="Monarch Campus Emblem"
        width={size}
        height={size}
        className={`object-contain rounded-full select-none ${withShadow ? 'drop-shadow-md' : ''} ${className}`}
        style={{ width: `${size}px`, height: `${size}px` }}
      />
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${withShadow ? 'drop-shadow-md' : ''} ${className}`}
      aria-label="Monarch Campus Crest"
    >
      <defs>
        <linearGradient id="goldOuterRing" x1="20" y1="20" x2="220" y2="220" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f7d070" />
          <stop offset="25%" stopColor="#dfa72a" />
          <stop offset="50%" stopColor="#fff3b0" />
          <stop offset="75%" stopColor="#b38015" />
          <stop offset="100%" stopColor="#e5b43d" />
        </linearGradient>

        <linearGradient id="goldInnerRing" x1="40" y1="40" x2="200" y2="200" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffe58f" />
          <stop offset="35%" stopColor="#d49a1d" />
          <stop offset="70%" stopColor="#fff6c4" />
          <stop offset="100%" stopColor="#9c6d0c" />
        </linearGradient>

        <linearGradient id="goldCrown" x1="70" y1="25" x2="170" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffe899" />
          <stop offset="30%" stopColor="#e2a829" />
          <stop offset="70%" stopColor="#fff7cb" />
          <stop offset="100%" stopColor="#a37210" />
        </linearGradient>

        <linearGradient id="goldLaurel" x1="45" y1="60" x2="195" y2="170" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fed766" />
          <stop offset="45%" stopColor="#c78e1b" />
          <stop offset="70%" stopColor="#ffe99a" />
          <stop offset="100%" stopColor="#946508" />
        </linearGradient>

        <radialGradient id="navyRingGrad" cx="50%" cy="50%" r="50%">
          <stop offset="60%" stopColor="#0c1d42" />
          <stop offset="100%" stopColor="#061026" />
        </radialGradient>

        <linearGradient id="mBevelLeft" x1="75" y1="80" x2="105" y2="155" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1e3a78" />
          <stop offset="100%" stopColor="#0b1b3d" />
        </linearGradient>
        <linearGradient id="mBevelRight" x1="120" y1="80" x2="165" y2="155" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#254894" />
          <stop offset="100%" stopColor="#0f224b" />
        </linearGradient>
        <linearGradient id="mBevelHighlight" x1="120" y1="75" x2="120" y2="155" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3b69c4" />
          <stop offset="100%" stopColor="#162e63" />
        </linearGradient>

        <linearGradient id="bookCoverGrad" x1="80" y1="135" x2="160" y2="170" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0f2654" />
          <stop offset="100%" stopColor="#08152e" />
        </linearGradient>

        <filter id="subtleShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* 1. Outer Gold Bevel Edge */}
      <circle cx="120" cy="120" r="116" fill="url(#goldOuterRing)" />
      <circle cx="120" cy="120" r="110" fill="#08142c" />

      {/* 2. Deep Royal Navy Ring */}
      <circle cx="120" cy="120" r="108" fill="url(#navyRingGrad)" />

      {/* 3. Gold Separator Ring */}
      <circle cx="120" cy="120" r="82" fill="url(#goldInnerRing)" />
      <circle cx="120" cy="120" r="79" fill="#091733" />

      {/* 4. Center Pure White Medallion */}
      <circle cx="120" cy="120" r="76" fill="#ffffff" filter="url(#subtleShadow)" />

      {/* 5. Typography on Navy Ring */}
      <g id="crest-typography">
        <text
          x="120"
          y="196"
          textAnchor="middle"
          fill="#ffffff"
          fontFamily="'Cinzel', 'Playfair Display', Georgia, serif"
          fontSize="18"
          fontWeight="800"
          letterSpacing="4"
        >
          MONARCH
        </text>

        <line x1="68" y1="209" x2="88" y2="209" stroke="url(#goldOuterRing)" strokeWidth="2.5" strokeLinecap="round" />
        <text
          x="120"
          y="213"
          textAnchor="middle"
          fill="url(#goldOuterRing)"
          fontFamily="'Cinzel', Georgia, serif"
          fontSize="11"
          fontWeight="700"
          letterSpacing="3"
        >
          CAMPUS
        </text>
        <line x1="152" y1="209" x2="172" y2="209" stroke="url(#goldOuterRing)" strokeWidth="2.5" strokeLinecap="round" />
      </g>

      {/* 6. Laurel Wreath */}
      <g id="laurel-wreath" fill="url(#goldLaurel)">
        <path d="M68 136 C64 128, 62 115, 63 102 C64 94, 67 86, 73 80 C74 83, 74 87, 72 92 C69 100, 68 114, 73 126 Z" />
        <path d="M58 122 C53 118, 50 110, 52 100 C56 102, 60 106, 61 112 C62 116, 61 120, 58 122 Z" />
        <path d="M62 100 C58 96, 56 88, 59 78 C63 80, 67 85, 68 90 C68 94, 66 98, 62 100 Z" />
        <path d="M69 82 C65 77, 66 70, 71 62 C74 65, 76 71, 76 76 C75 79, 73 81, 69 82 Z" />
        <path d="M79 67 C76 61, 79 55, 86 48 C88 52, 88 58, 86 63 C85 66, 82 67, 79 67 Z" />
        <path d="M92 56 C90 50, 95 44, 102 40 C103 44, 103 49, 99 53 C97 55, 95 56, 92 56 Z" />

        <path d="M172 136 C176 128, 178 115, 177 102 C176 94, 173 86, 167 80 C166 83, 166 87, 168 92 C171 100, 172 114, 167 126 Z" />
        <path d="M182 122 C187 118, 190 110, 188 100 C184 102, 180 106, 179 112 C178 116, 179 120, 182 122 Z" />
        <path d="M178 100 C182 96, 184 88, 181 78 C177 80, 173 85, 172 90 C172 94, 174 98, 178 100 Z" />
        <path d="M171 82 C175 77, 174 70, 169 62 C166 65, 164 71, 164 76 C165 79, 167 81, 171 82 Z" />
        <path d="M161 67 C164 61, 161 55, 154 48 C152 52, 152 58, 154 63 C155 66, 158 67, 161 67 Z" />
        <path d="M148 56 C150 50, 145 44, 138 40 C137 44, 137 49, 141 53 C143 55, 145 56, 148 56 Z" />
      </g>

      {/* 7. Imperial 5-Point Crown */}
      <g id="crown" filter="url(#subtleShadow)">
        <path d="M98 77 C108 81, 132 81, 142 77 L140 81 C131 84, 109 84, 100 81 Z" fill="url(#goldCrown)" />
        <circle cx="106" cy="80" r="1.5" fill="#ffffff" />
        <circle cx="120" cy="81" r="2" fill="#d97706" />
        <circle cx="134" cy="80" r="1.5" fill="#ffffff" />

        <path d="M120 40 L123 48 C127 50, 129 55, 126 60 C124 64, 122 72, 120 76 C118 72, 116 64, 114 60 C111 55, 113 50, 117 48 Z" fill="url(#goldCrown)" />
        <circle cx="120" cy="38" r="3.2" fill="#fff7cb" stroke="#b38015" strokeWidth="0.8" />

        <path d="M109 54 L114 63 C113 67, 112 72, 110 77 L105 76 C105 70, 106 63, 109 54 Z" fill="url(#goldCrown)" />
        <circle cx="109" cy="53" r="2.5" fill="#ffeaa7" stroke="#b38015" strokeWidth="0.6" />

        <path d="M131 54 L126 63 C127 67, 128 72, 130 77 L135 76 C135 70, 134 63, 131 54 Z" fill="url(#goldCrown)" />
        <circle cx="131" cy="53" r="2.5" fill="#ffeaa7" stroke="#b38015" strokeWidth="0.6" />

        <path d="M96 60 L104 68 C102 71, 100 75, 98 77 L95 76 C94 70, 94 64, 96 60 Z" fill="url(#goldCrown)" />
        <circle cx="96" cy="59" r="2.2" fill="#ffeaa7" stroke="#b38015" strokeWidth="0.5" />

        <path d="M144 60 L136 68 C138 71, 140 75, 142 77 L145 76 C146 70, 146 64, 144 60 Z" fill="url(#goldCrown)" />
        <circle cx="144" cy="59" r="2.2" fill="#ffeaa7" stroke="#b38015" strokeWidth="0.5" />
      </g>

      {/* 8. Bold Serif 'M' */}
      <g id="letter-M" filter="url(#subtleShadow)">
        <path d="M80 87 L98 87 L98 92 L94 93 L94 135 L99 136 L99 140 L79 140 L79 136 L84 135 L84 93 L80 92 Z" fill="url(#mBevelLeft)" />
        <path d="M142 87 L160 87 L160 92 L156 93 L156 135 L161 136 L161 140 L141 140 L141 136 L146 135 L146 93 L142 92 Z" fill="url(#mBevelRight)" />
        <path d="M93 93 L120 137 L114 139 L88 95 Z" fill="url(#mBevelLeft)" />
        <path d="M147 93 L120 137 L126 139 L152 95 Z" fill="url(#mBevelRight)" />
        <path d="M117 132 L120 137 L123 132 L121 118 L119 118 Z" fill="url(#mBevelHighlight)" />
      </g>

      {/* 9. Open Educational Book */}
      <g id="open-book" filter="url(#subtleShadow)">
        <path d="M120 162 C110 156, 88 155, 78 159 C77 151, 80 141, 102 140 C110 140, 116 143, 120 146 C124 143, 130 140, 138 140 C160 141, 163 151, 162 159 C152 155, 130 156, 120 162 Z" fill="url(#goldOuterRing)" />
        <path d="M119 159 C111 153, 93 151, 82 155 C82 147, 85 142, 102 142 C110 142, 115 145, 119 148 Z" fill="url(#bookCoverGrad)" stroke="url(#goldOuterRing)" strokeWidth="1.2" />
        <path d="M121 159 C129 153, 147 151, 158 155 C158 147, 155 142, 138 142 C130 142, 125 145, 121 148 Z" fill="url(#bookCoverGrad)" stroke="url(#goldOuterRing)" strokeWidth="1.2" />
        <line x1="120" y1="147" x2="120" y2="161" stroke="url(#goldOuterRing)" strokeWidth="2" strokeLinecap="round" />
        <path d="M89 149 C96 147, 106 147, 115 151" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.8" />
        <path d="M89 152 C96 150, 106 150, 115 154" stroke="#ffffff" strokeWidth="0.8" strokeOpacity="0.7" />
        <path d="M151 149 C144 147, 134 147, 125 151" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.8" />
        <path d="M151 152 C144 150, 134 150, 125 154" stroke="#ffffff" strokeWidth="0.8" strokeOpacity="0.7" />
      </g>
    </svg>
  );
};

interface LogoHorizontalProps {
  className?: string;
  variant?: 'light' | 'dark' | 'auto';
  scale?: number;
  customUrl?: string | null;
}

export const MonarchHorizontalLogo: React.FC<LogoHorizontalProps> = ({
  className = '',
  variant = 'auto',
  scale = 1,
  customUrl,
}) => {
  const [localLogoUrl, setLocalLogoUrl] = useState<string | null>(customUrl || null);

  useEffect(() => {
    if (customUrl !== undefined) {
      setLocalLogoUrl(customUrl);
      return;
    }
    const savedConfig = localStorage.getItem('monarch_site_config');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        if (parsed.customLogoUrl) {
          setLocalLogoUrl(parsed.customLogoUrl);
        }
      } catch {
        // ignore
      }
    }
  }, [customUrl]);

  if (localLogoUrl) {
    return (
      <div
        className={`inline-flex items-center select-none ${className}`}
        style={{ transform: `scale(${scale})`, transformOrigin: 'left center' }}
      >
        <img
          src={localLogoUrl}
          alt="MONARCH CAMPUS - Your Future, Our Mission"
          className="h-10 sm:h-12 w-auto object-contain max-w-[280px]"
        />
      </div>
    );
  }

  const isDark = variant === 'dark';
  const textColor = isDark
    ? 'text-white'
    : variant === 'light'
    ? 'text-[#0a1c3f]'
    : 'text-[#0a1c3f] dark:text-white';

  const subtextColor = isDark
    ? 'text-amber-200'
    : variant === 'light'
    ? 'text-[#0e2759]'
    : 'text-[#0e2759] dark:text-amber-300';

  return (
    <div
      className={`inline-flex items-center gap-3.5 select-none ${className}`}
      style={{ transform: `scale(${scale})`, transformOrigin: 'left center' }}
    >
      <MonarchEmblem size={46} className="shrink-0 transition-transform hover:scale-105 duration-300" />

      <div className="flex flex-col justify-center">
        <div className="flex flex-col leading-none">
          <span
            className={`font-black tracking-[0.14em] text-xl sm:text-2xl font-serif uppercase ${textColor}`}
            style={{ fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif" }}
          >
            MONARCH
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="h-[2px] w-5 sm:w-8 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 rounded-full" />
            <span
              className={`font-bold tracking-[0.32em] text-[10px] sm:text-xs font-serif uppercase ${textColor}`}
              style={{ fontFamily: "'Cinzel', Georgia, serif" }}
            >
              CAMPUS
            </span>
            <div className="h-[2px] w-5 sm:w-8 bg-gradient-to-l from-amber-400 via-amber-500 to-amber-600 rounded-full" />
          </div>
        </div>

        <span
          className={`text-[12px] sm:text-[13px] font-medium tracking-wide mt-1 italic ${subtextColor}`}
          style={{ fontFamily: "'Dancing Script', 'Brush Script MT', 'Great Vibes', cursive, serif" }}
        >
          Your Future, Our Mission
        </span>
      </div>
    </div>
  );
};

interface HeroBannerProps {
  onNavigateCourses?: () => void;
  onNavigateRegister?: () => void;
  compact?: boolean;
}

export const MonarchHeroBanner: React.FC<HeroBannerProps> = ({
  onNavigateCourses,
  onNavigateRegister,
  compact = false,
}) => {
  const { t } = useLanguage();
  const [customBannerUrl, setCustomBannerUrl] = useState<string | null>(null);

  useEffect(() => {
    const savedConfig = localStorage.getItem('monarch_site_config');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        if (parsed.customBannerUrl) {
          setCustomBannerUrl(parsed.customBannerUrl);
        }
      } catch {
        // ignore
      }
    }
  }, []);

  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl md:rounded-3xl border border-amber-500/30 bg-gradient-to-r from-[#07132b] via-[#0d224d] to-[#12316e] text-white shadow-2xl ${
        compact ? 'p-6 md:p-8' : 'p-6 sm:p-8 md:p-12 lg:p-14'
      }`}
    >
      {/* If custom banner image is uploaded, render it as background or banner overlay */}
      {customBannerUrl && (
        <div className="absolute inset-0 z-0">
          <img
            src={customBannerUrl}
            alt="Monarch Campus Banner"
            className="w-full h-full object-cover object-center opacity-30 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#07132b]/90 via-[#0d224d]/85 to-[#12316e]/90" />
        </div>
      )}

      {/* Decorative Gradients & Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_25%,rgba(245,197,66,0.18),transparent_55%)] pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Section: Content */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-black/40 backdrop-blur-md px-3.5 py-1 text-xs font-semibold text-amber-300 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                {t(
                  "ශ්‍රී ලංකාවේ අංක 1 උසස් හා වෘත්තීය අධ්‍යාපන පීඨය",
                  "Sri Lanka's Premier Accredited Campus & Professional LMS"
                )}
              </span>
            </div>
          </div>

          <div className="inline-block rounded-xl bg-white/95 px-4 py-2.5 sm:px-5 sm:py-3 shadow-lg backdrop-blur-sm border border-amber-400/40">
            <MonarchHorizontalLogo variant="light" />
          </div>

          <div className="relative pt-2">
            <div className="inline-block">
              <span
                className="block text-2xl sm:text-3xl md:text-4xl text-amber-300 font-serif italic mb-1"
                style={{ fontFamily: "'Dancing Script', 'Brush Script MT', cursive, serif" }}
              >
                {t("විශිෂ්ටතම අධ්‍යාපන තක්සලාව", "Best Campus for")}
              </span>
            </div>

            <div className="relative inline-block mt-1">
              <div className="relative bg-gradient-to-r from-[#0c224f] via-[#102d68] to-[#0c224f] border-y-2 border-amber-400 px-4 py-2.5 sm:px-6 sm:py-3 shadow-2xl rounded-md">
                <h1
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-wider text-amber-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                  style={{ fontFamily: "'Cinzel', 'Playfair Display', serif" }}
                >
                  BEST CAMPUS FOR PROFESSIONAL COURSES IN SRI LANKA
                </h1>
              </div>
            </div>

            <p className="mt-4 text-base sm:text-lg text-slate-200 leading-relaxed max-w-2xl font-sans">
              {t(
                "දිවයිනේ විශිෂ්ටතම ප්‍රතිඵල බිහිකළ ප්‍රවීණ දේශක මඩුල්ලක්, සජීවී Zoom පන්ති, මුද්‍රිත නිබන්ධන සහ 24/7 AI අධ්‍යයන සහාය සමගින් ඔබගේ අනාගතය අදම Monarch Campus සමඟ ගොඩනගන්න.",
                "Join Sri Lanka's top-ranked professional courses and A/L masterclasses. Experience world-class teaching, HD video lectures, live Zoom workshops, and step-by-step guidance."
              )}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-3.5 pt-2">
            {onNavigateRegister && (
              <button
                onClick={onNavigateRegister}
                className="cursor-pointer rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 px-6 py-3 text-sm sm:text-base font-bold text-slate-950 shadow-lg shadow-amber-500/25 transition-all hover:scale-105 hover:shadow-amber-500/40 active:scale-95"
              >
                {t("සිසුවෙකු ලෙස ලියාපදිංචි වන්න ➔", "Register as Student ➔")}
              </button>
            )}

            {onNavigateCourses && (
              <button
                onClick={onNavigateCourses}
                className="cursor-pointer rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm sm:text-base font-semibold text-white backdrop-blur-md transition-all hover:bg-white/20 active:scale-95"
              >
                {t("පාඨමාලා ගවේෂණය (Courses)", "Explore Courses")}
              </button>
            )}
          </div>
        </div>

        {/* Right Section: Campus Visual / Emblem Card */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col items-center justify-center">
          <div className="relative group w-full max-w-sm rounded-2xl border border-amber-400/30 bg-gradient-to-b from-white/10 to-black/40 p-6 backdrop-blur-xl shadow-2xl text-center">
            <div className="flex justify-center mb-4">
              <MonarchEmblem size={130} withShadow={true} />
            </div>

            <div
              className="text-2xl sm:text-3xl font-extrabold text-amber-300 italic mb-2 tracking-wide"
              style={{ fontFamily: "'Dancing Script', 'Brush Script MT', cursive, serif" }}
            >
              Dream · Learn · Grow
            </div>

            <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
              {t(
                "ඔබගේ අනාගතය, අපගේ අරමුණයි. ශ්‍රී ලංකාවේ උසස් අධ්‍යාපන විශිෂ්ටත්වය.",
                "Your Future, Our Mission. Fostering next-generation academic & professional excellence."
              )}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-2 pt-4 border-t border-white/10 text-left">
              <div className="bg-black/30 rounded-lg p-2.5 border border-white/5">
                <span className="block text-[11px] text-amber-400 font-medium">
                  {t("සමස්ත සාමාර්ථය", "Pass Rate")}
                </span>
                <span className="text-lg font-black text-white">98.4%</span>
              </div>
              <div className="bg-black/30 rounded-lg p-2.5 border border-white/5">
                <span className="block text-[11px] text-amber-400 font-medium">
                  {t("සක්‍රිය සිසුන්", "Active Students")}
                </span>
                <span className="text-lg font-black text-white">15,000+</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Logo and Banner Asset Uploader Modal
 * Allows the user or Super Admin to upload or replace official logos anytime
 */
export const LogoAssetUploaderModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onLogoUpdated?: () => void;
}> = ({ isOpen, onClose, onLogoUpdated }) => {
  const { t } = useLanguage();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [emblemPreview, setEmblemPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const savedConfig = localStorage.getItem('monarch_site_config');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setLogoPreview(parsed.customLogoUrl || null);
        setEmblemPreview(parsed.customEmblemUrl || null);
        setBannerPreview(parsed.customBannerUrl || null);
      } catch {
        // ignore
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'logo' | 'emblem' | 'banner'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const savedConfig = localStorage.getItem('monarch_site_config');
      let config = savedConfig ? JSON.parse(savedConfig) : {};

      if (type === 'logo') {
        setLogoPreview(dataUrl);
        config.customLogoUrl = dataUrl;
      } else if (type === 'emblem') {
        setEmblemPreview(dataUrl);
        config.customEmblemUrl = dataUrl;
      } else if (type === 'banner') {
        setBannerPreview(dataUrl);
        config.customBannerUrl = dataUrl;
      }

      localStorage.setItem('monarch_site_config', JSON.stringify(config));
      setSuccessMsg(t('ලෝගෝ/බැනරය සාර්ථකව යාවත්කාලීන විය!', 'Asset updated successfully!'));
      if (onLogoUpdated) onLogoUpdated();
      setTimeout(() => setSuccessMsg(''), 3000);
    };
    reader.readAsDataURL(file);
  };

  const handleReset = (type: 'logo' | 'emblem' | 'banner') => {
    const savedConfig = localStorage.getItem('monarch_site_config');
    let config = savedConfig ? JSON.parse(savedConfig) : {};

    if (type === 'logo') {
      setLogoPreview(null);
      config.customLogoUrl = null;
    } else if (type === 'emblem') {
      setEmblemPreview(null);
      config.customEmblemUrl = null;
    } else if (type === 'banner') {
      setBannerPreview(null);
      config.customBannerUrl = null;
    }

    localStorage.setItem('monarch_site_config', JSON.stringify(config));
    if (onLogoUpdated) onLogoUpdated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {t("ලෝගෝ හා බැනර් කළමනාකරණය", "Brand Logo & Banner Asset Manager")}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t("ඔබගේ පරිගණකයේ ඇති ඔරිජිනල් PNG ලෝගෝ හා බැනර් මෙහිදී තෝරන්න", "Upload or replace your official logos and banners directly")}
            </p>
          </div>
        </div>

        {successMsg && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-sm">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="space-y-6">
          {/* 1. Horizontal Logo */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-sm text-slate-900 dark:text-white">
                1. Horizontal Logo (MONARCH CAMPUS - Your Future, Our Mission)
              </span>
              {logoPreview && (
                <button
                  onClick={() => handleReset('logo')}
                  className="text-xs text-red-500 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> {t("Default එකට හරවන්න", "Reset to Default")}
                </button>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="h-14 w-48 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center p-2">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo Preview" className="max-h-full object-contain" />
                ) : (
                  <MonarchHorizontalLogo scale={0.7} />
                )}
              </div>
              <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-semibold">
                <Upload className="w-3.5 h-3.5" />
                <span>{t("නව ලෝගෝ එකක් තෝරන්න (Upload)", "Upload PNG Logo")}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'logo')}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* 2. Circular Emblem */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-sm text-slate-900 dark:text-white">
                2. Circular Emblem Crest (Crown, Leaves & 'M' Badge)
              </span>
              {emblemPreview && (
                <button
                  onClick={() => handleReset('emblem')}
                  className="text-xs text-red-500 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> {t("Default එකට හරවන්න", "Reset to Default")}
                </button>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-white dark:bg-slate-950 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center p-1">
                {emblemPreview ? (
                  <img src={emblemPreview} alt="Emblem Preview" className="h-full w-full object-contain rounded-full" />
                ) : (
                  <MonarchEmblem size={52} />
                )}
              </div>
              <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-semibold">
                <Upload className="w-3.5 h-3.5" />
                <span>{t("Crest ලෝගෝ එකක් තෝරන්න", "Upload Circular Crest")}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'emblem')}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* 3. Banner Image */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-sm text-slate-900 dark:text-white">
                3. Campus Flagship Hero Banner (Best Campus for Professional Courses)
              </span>
              {bannerPreview && (
                <button
                  onClick={() => handleReset('banner')}
                  className="text-xs text-red-500 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> {t("Default එකට හරවන්න", "Reset to Default")}
                </button>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="h-16 w-48 bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden">
                {bannerPreview ? (
                  <img src={bannerPreview} alt="Banner Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] text-amber-400 font-serif">Flagship Campus Banner</span>
                )}
              </div>
              <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-semibold">
                <Upload className="w-3.5 h-3.5" />
                <span>{t("නව බැනරයක් තෝරන්න", "Upload Wide Banner")}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'banner')}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="cursor-pointer px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-600 text-white dark:text-slate-950 font-bold text-sm"
          >
            {t("සම්පූර්ණයි (Done)", "Done")}
          </button>
        </div>
      </div>
    </div>
  );
};
