import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  Sparkles,
  BookOpen,
  Calendar,
  Layers,
  Globe,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useLmsData } from '../context/LmsDataContext';
import { MonarchHorizontalLogo } from './BrandAssets';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const { theme, toggleTheme } = useTheme();
  const { currentUser, logout, loginAsRole } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { siteConfig } = useLmsData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getDashboardTarget = () => 'dashboard';

  const handleNav = (path: string) => {
    if (path === 'categories' || path === 'courses' || path === 'category') {
      onNavigate('categories');
    } else if (path === 'home') {
      onNavigate(currentUser ? 'dashboard' : 'home');
    } else if (path.includes('dashboard')) {
      onNavigate('dashboard');
    } else {
      onNavigate('categories');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md transition-colors duration-200">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Brand Logo Lockup - Routes to Dashboard if logged in, otherwise Home */}
          <div
            onClick={() => onNavigate(currentUser ? 'dashboard' : 'home')}
            className="flex items-center cursor-pointer transition-transform active:scale-95 py-1"
          >
            <MonarchHorizontalLogo scale={1} />
          </div>

          {/* Center Navigation Links (from CMS or standard) */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {siteConfig.navMenuItems.map((item) => {
              const isHome = item.path === 'home';
              const label = isHome && currentUser
                ? (language === 'si' ? 'ඩෑෂ්බෝඩ් (Dashboard)' : 'Dashboard')
                : (language === 'si' ? item.labelSi : item.labelEn);
              const isActive = (isHome && currentUser && currentView === 'dashboard') ||
                currentView === item.path ||
                (item.path === 'categories' && currentView === 'categories');

              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.path)}
                  className={`cursor-pointer px-3.5 py-2 text-sm font-semibold rounded-lg transition-all ${
                    isActive
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/30'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-850'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Tools: Language Switcher, Theme Toggle, Logo Uploader & User Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* 1. LANGUAGE SWITCHER (සිංහල / ENGLISH) */}
            <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 p-0.5 text-xs font-bold shadow-inner">
              <button
                onClick={() => setLanguage('si')}
                className={`cursor-pointer px-2.5 py-1.5 rounded-lg transition-all ${
                  language === 'si'
                    ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="සිංහල මාධ්‍යයට මාරු වන්න"
              >
                සිංහල
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`cursor-pointer px-2.5 py-1.5 rounded-lg transition-all ${
                  language === 'en'
                    ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Switch to English"
              >
                English
              </button>
            </div>

            {/* 2. DAY / NIGHT THEME TOGGLE */}
            <button
              onClick={toggleTheme}
              className="cursor-pointer p-2.5 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors"
              title={theme === 'dark' ? t("Day Mode එකට මාරු වන්න", "Switch to Day Mode") : t("Night Mode එකට මාරු වන්න", "Switch to Night Mode")}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-amber-400" />
              ) : (
                <Moon className="h-5 w-5 text-slate-700" />
              )}
            </button>

            {/* 4. USER AUTH & PORTAL SELECTOR */}
            <div className="flex items-center gap-2">
              {/* Quick Role Switcher */}
              <select
                value={currentUser?.role || ''}
                onChange={(e) => {
                  const r = e.target.value as any;
                  if (r) {
                    loginAsRole(r);
                    onNavigate('dashboard');
                  }
                }}
                className="hidden lg:block rounded-xl border border-amber-400/50 bg-amber-50/70 dark:bg-slate-900 px-2.5 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer shadow-xs focus:ring-2 focus:ring-amber-500"
                title="Switch Portal Role"
              >
                <option value="" disabled>පෝර්ටලය තෝරන්න (Select Portal)...</option>
                <option value="lecturer">🎓 Lecturer Portal (ආචාර්ය)</option>
                <option value="student">🎒 Student Dashboard (සිසුවා)</option>
                <option value="superadmin">👑 Super Admin Console</option>
                <option value="manager">💼 Operations Manager</option>
              </select>

              {currentUser ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onNavigate('dashboard')}
                    className="cursor-pointer flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-3.5 py-2 text-xs sm:text-sm font-black text-slate-950 shadow-md shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all"
                  >
                    <Layers className="h-4 w-4" />
                    <span>
                      {currentUser.role === 'superadmin'
                        ? t("Super Admin Panel", "Super Admin Panel")
                        : currentUser.role === 'manager'
                        ? t("Manager Panel", "Manager Panel")
                        : currentUser.role === 'instructor' || (currentUser.role as string) === 'lecturer'
                        ? t("Lecturer Portal (ආචාර්ය)", "Lecturer Portal")
                        : t("Student Dashboard (සිසුවා)", "Student Dashboard")}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      logout();
                      onNavigate('login');
                    }}
                    className="cursor-pointer p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                    title={t("පද්ධතියෙන් ඉවත් වන්න", "Sign Out")}
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onNavigate('login')}
                    className={`cursor-pointer px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                      currentView === 'login'
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                        : 'border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-850'
                    }`}
                  >
                    {t("ලොග් වන්න", "Login")}
                  </button>

                  <button
                    onClick={() => onNavigate('register')}
                    className="cursor-pointer hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 px-4 py-2 text-xs sm:text-sm font-bold text-slate-950 shadow-md shadow-amber-500/25 transition-all hover:scale-105 active:scale-95"
                  >
                    <span>{t("ලියාපදිංචි වන්න", "Register")}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="cursor-pointer md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-2">
            <div className="space-y-1">
              {siteConfig.navMenuItems.map((item) => {
                const isHome = item.path === 'home';
                const label = isHome && currentUser
                  ? (language === 'si' ? 'ඩෑෂ්බෝඩ් (Dashboard)' : 'Dashboard')
                  : (language === 'si' ? item.labelSi : item.labelEn);

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      handleNav(item.path);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-850 cursor-pointer"
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLanguage('si')}
                  className={`text-xs px-2 py-1 rounded font-bold ${language === 'si' ? 'bg-amber-500 text-slate-950' : 'text-slate-500'}`}
                >
                  සිංහල
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`text-xs px-2 py-1 rounded font-bold ${language === 'en' ? 'bg-amber-500 text-slate-950' : 'text-slate-500'}`}
                >
                  English
                </button>
              </div>
            </div>
            {/* Mobile Portal / Role Switcher */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
              <span className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                පෝර්ටලය මාරු කරන්න (Switch Portal Role):
              </span>
              <select
                value={currentUser?.role || ''}
                onChange={(e) => {
                  const r = e.target.value as any;
                  if (r) {
                    loginAsRole(r);
                    onNavigate('dashboard');
                    setMobileMenuOpen(false);
                  }
                }}
                className="w-full rounded-xl border border-amber-400/50 bg-amber-50/70 dark:bg-slate-900 p-2 text-xs font-bold text-slate-900 dark:text-white"
              >
                <option value="" disabled>පෝර්ටලය තෝරන්න...</option>
                <option value="lecturer">🎓 Lecturer Portal (ආචාර්ය)</option>
                <option value="student">🎒 Student Dashboard (සිසුවා)</option>
                <option value="superadmin">👑 Super Admin Console</option>
                <option value="manager">💼 Operations Manager</option>
              </select>
            </div>

            {!currentUser && (
              <div className="pt-2 grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onNavigate('login');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 text-center text-sm font-bold border border-slate-300 dark:border-slate-700 rounded-xl"
                >
                  {t("ලොග් වන්න", "Login")}
                </button>
                <button
                  onClick={() => {
                    onNavigate('register');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 text-center text-sm font-bold bg-amber-500 text-slate-950 rounded-xl"
                >
                  {t("ලියාපදිංචි වන්න", "Register")}
                </button>
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
};
