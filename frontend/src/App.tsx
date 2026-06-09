import React, { useState, useEffect } from 'react';

// Common components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CourseViewer from './pages/CourseViewer';

// Functional overlays / modals
import CbtExamSession from './components/student/CbtExamSession';
import PracticeSession from './components/student/PracticeSession';
import AiQuestionSolver from './components/student/AiQuestionSolver';
import CertificateViewer from './components/student/CertificateViewer';
import PaymentGateways from './components/student/PaymentGateways';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('HOME');
  const [navigationParams, setNavigationParams] = useState<any>(null);

  // Global Contexts
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const cached = localStorage.getItem('theme');
    return cached === 'dark' || (!cached && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Modal overlays states
  const [activePayCourse, setActivePayCourse] = useState<any>(null);

  // Apply dark mode theme class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Load User profile & Course Catalog on load or token update
  useEffect(() => {
    const loadProfileAndCatalog = async () => {
      if (token) {
        try {
          const profileRes = await fetch('/api/auth/profile', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            setUser(profileData);
          } else {
            // Expired or bad token
            handleLogout();
          }
        } catch (error) {
          console.error('Failed loading profile', error);
        }
      }

      // Fetch Courses Catalog
      try {
        const headers: Record<string, string> = {};
        if (token) headers.Authorization = `Bearer ${token}`;

        const coursesRes = await fetch('/api/courses', { headers });
        if (coursesRes.ok) {
          const coursesData = await coursesRes.json();
          setCourses(coursesData);
        }
      } catch (error) {
        console.error('Failed loading courses catalog', error);
      }
    };

    loadProfileAndCatalog();
  }, [token]);

  const refreshCourses = async () => {
    try {
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch('/api/courses', { headers });
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLoginSuccess = (userToken: string, loggedUser: any) => {
    localStorage.setItem('token', userToken);
    setToken(userToken);
    setUser(loggedUser);
    
    // Redirect based on role
    if (loggedUser.role === 'ADMIN' || loggedUser.role === 'TEACHER') {
      setCurrentView('ADMIN_DASHBOARD');
    } else {
      setCurrentView('STUDENT_DASHBOARD');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setCurrentView('HOME');
  };

  const handleEnroll = async (courseId: string) => {
    if (!token) {
      setCurrentView('LOGIN');
      return;
    }

    try {
      const response = await fetch(`/api/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        alert('Enrolled successfully!');
        refreshCourses();
        setCurrentView('COURSE_VIEWER');
        setNavigationParams({ courseId });
      } else {
        const data = await response.json();
        alert(data.message || 'Enrollment failed');
      }
    } catch (error) {
      console.error('Enrollment error', error);
    }
  };

  const handleOpenPayment = (courseId: string) => {
    if (!token) {
      setCurrentView('LOGIN');
      return;
    }
    const target = courses.find((c) => c.id === courseId);
    if (target) {
      setActivePayCourse(target);
    }
  };

  const handlePaymentSuccess = () => {
    if (activePayCourse) {
      alert(`Payment for "${activePayCourse.title}" successful! Enjoy your course.`);
      refreshCourses();
      setCurrentView('COURSE_VIEWER');
      setNavigationParams({ courseId: activePayCourse.id });
      setActivePayCourse(null);
    }
  };

  const handleNavigate = (view: string, params?: any) => {
    setCurrentView(view);
    setNavigationParams(params || null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      {/* Global Navigation Header */}
      <Navbar
        user={user}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
      />

      {/* Main Core Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          currentView={currentView}
          user={user}
          onNavigate={handleNavigate}
        />

        {/* Dynamic Page Routing */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {currentView === 'HOME' && (
            <Home
              user={user}
              onNavigate={handleNavigate}
              courses={courses}
              onEnroll={handleEnroll}
              onOpenPayment={handleOpenPayment}
            />
          )}

          {currentView === 'LOGIN' && (
            <Login
              onLoginSuccess={handleLoginSuccess}
              onNavigate={handleNavigate}
            />
          )}

          {currentView === 'REGISTER' && (
            <Register
              onNavigate={handleNavigate}
            />
          )}

          {currentView === 'STUDENT_DASHBOARD' && token && (
            <StudentDashboard
              token={token}
              onNavigate={handleNavigate}
              courses={courses}
            />
          )}

          {currentView === 'ADMIN_DASHBOARD' && token && (
            <AdminDashboard
              token={token}
              onNavigate={handleNavigate}
              courses={courses}
              onRefreshCourses={refreshCourses}
            />
          )}

          {currentView === 'COURSE_VIEWER' && token && navigationParams?.courseId && (
            <CourseViewer
              token={token}
              courseId={navigationParams.courseId}
              onNavigate={handleNavigate}
            />
          )}

          {currentView === 'CBT_EXAM' && token && navigationParams?.examId && (
            <CbtExamSession
              token={token}
              examId={navigationParams.examId}
              onNavigate={handleNavigate}
            />
          )}

          {currentView === 'PRACTICE_TEST' && token && navigationParams?.testId && (
            <PracticeSession
              token={token}
              testId={navigationParams.testId}
              onNavigate={handleNavigate}
            />
          )}

          {currentView === 'AI_SOLVER' && token && (
            <AiQuestionSolver
              token={token}
            />
          )}
        </div>
      </div>

      {/* Modal - Certificate PDF/SVG popups */}
      {navigationParams?.viewCert && (
        <CertificateViewer
          certificate={navigationParams.viewCert}
          onClose={() => setNavigationParams(null)}
        />
      )}

      {/* Modal - Payment Simulator popup overlay */}
      {activePayCourse && token && (
        <PaymentGateways
          token={token}
          courseId={activePayCourse.id}
          courseTitle={activePayCourse.title}
          price={activePayCourse.price}
          onSuccess={handlePaymentSuccess}
          onClose={() => setActivePayCourse(null)}
        />
      )}
    </div>
  );
}
