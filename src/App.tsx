import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LmsDataProvider } from './context/LmsDataContext';
import { Navbar } from './components/Navbar';
import { HomePage } from './components/HomePage';
import { LoginPage } from './components/LoginPage';
import { RegistrationPage } from './components/RegistrationPage';
import { StudentDashboard } from './components/StudentDashboard';
import { LecturerPortal } from './components/LecturerPortal';
import { AdminInstructorDashboard } from './components/AdminInstructorDashboard';
import { CoursesCategoriesView } from './components/CoursesCategoriesView';

type AppView = 'home' | 'login' | 'register' | 'dashboard' | 'categories';

const AppContent: React.FC = () => {
  const { currentUser } = useAuth();
  const [currentView, setCurrentView] = useState<AppView>(() => {
    // If user is already logged in, show dashboard directly; otherwise show home page
    return currentUser ? 'dashboard' : 'home';
  });

  // Whenever currentUser logs in or if currentUser is set, ensure dashboard is displayed if they try to access home/login/register
  React.useEffect(() => {
    if (currentUser && (currentView === 'home' || currentView === 'login' || currentView === 'register')) {
      setCurrentView('dashboard');
    }
  }, [currentUser]);

  const handleNavigate = (view: string) => {
    if (view === 'free-mcq' || view === 'freemcq' || view === 'seminars') {
      setCurrentView('categories');
    } else if (view === 'categories' || view === 'courses' || view === 'category') {
      setCurrentView('categories');
    } else if (view === 'home') {
      // If logged in, Home must route to their dedicated dashboard
      setCurrentView(currentUser ? 'dashboard' : 'home');
    } else if (
      view === 'login' ||
      view === 'register' ||
      view === 'dashboard' ||
      view === 'categories'
    ) {
      setCurrentView(view as AppView);
    } else {
      setCurrentView('categories');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans">
      {/* Top Bar Navigation */}
      <Navbar currentView={currentView} onNavigate={handleNavigate} />

      {/* Main Routed Content */}
      <div className="flex-1 flex flex-col">
        {currentView === 'home' && !currentUser && (
          <HomePage
            onNavigate={setCurrentView}
          />
        )}
        {currentView === 'login' && (
          <LoginPage
            onNavigate={setCurrentView}
            onNavigateRegister={() => setCurrentView('register')}
            onNavigateHome={() => setCurrentView(currentUser ? 'dashboard' : 'home')}
            onLoginSuccess={() => setCurrentView('dashboard')}
          />
        )}
        {currentView === 'register' && <RegistrationPage onNavigate={setCurrentView} />}
        {(currentView === 'dashboard' || (currentUser && currentView === 'home')) && (
          <>
            {currentUser?.role === 'lecturer' || currentUser?.role === 'instructor' ? (
              <LecturerPortal onNavigate={setCurrentView} />
            ) : currentUser?.role === 'superadmin' || currentUser?.role === 'manager' ? (
              <AdminInstructorDashboard onNavigate={setCurrentView} />
            ) : (
              <StudentDashboard onNavigate={setCurrentView} />
            )}
          </>
        )}
        {currentView === 'categories' && (
          <CoursesCategoriesView
            onNavigateHome={() => setCurrentView(currentUser ? 'dashboard' : 'home')}
            onNavigateDashboard={() => setCurrentView('dashboard')}
          />
        )}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <LmsDataProvider>
            <AppContent />
          </LmsDataProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
