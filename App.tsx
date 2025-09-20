

import React from 'react';
// FIX: Update react-router-dom imports for v6 compatibility.
// FIX: Use named imports for react-router-dom components and hooks.
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import CandidateDashboardPage from './pages/CandidateDashboardPage';
import CandidateRoadmapPage from './pages/CandidateRoadmapPage';
import CandidateInterviewPage from './pages/CandidateInterviewPage';
import RecruiterDashboardPage from './pages/RecruiterDashboardPage';
import CandidateProfilePage from './pages/CandidateProfilePage';
import RecruiterProfilePage from './pages/RecruiterProfilePage';
import RecruiterSettingsPage from './pages/RecruiterSettingsPage';
import RecruiterCreateAssessmentPage from './pages/RecruiterCreateAssessmentPage';
import AssessmentPage from './pages/AssessmentPage';
import AssessmentCompletePage from './pages/AssessmentCompletePage';
import Layout from './components/Layout';
import NotFoundPage from './pages/NotFoundPage';
import type { UserRole } from './types';
import RecruiterAssessmentReportPage from './pages/RecruiterAssessmentReportPage';

const App: React.FC = () => {
  return (
    <AppProvider>
      <div className="bg-slate-50 text-slate-800 h-screen font-sans">
        <RouterComponent />
      </div>
    </AppProvider>
  );
};

// FIX: Update PrivateRoute to be a route-rendering component for v6 compatibility.
const PrivateRoute: React.FC<{ role?: UserRole }> = ({ role }) => {
  const { user } = useAppContext();
  // FIX: Use the useLocation hook directly.
  const location = useLocation();

  if (!user) {
    // FIX: Use the Navigate component directly.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (role && user.role !== role) {
    const homeRoute = user.role === 'candidate' ? '/candidate/dashboard' : '/recruiter/dashboard';
    // FIX: Use the Navigate component directly.
    return <Navigate to={homeRoute} state={{ from: location }} replace />;
  }
  return <Layout />;
};


const RouterComponent: React.FC = () => {
  const { user } = useAppContext();
  
  const getHomeRoute = () => {
    if (!user) return "/login";
    return user.role === 'candidate' ? '/candidate/dashboard' : '/recruiter/dashboard';
  };

  return (
      // FIX: Use HashRouter component directly.
      <HashRouter>
        {/* FIX: Use <Routes> instead of <Switch> and update Route syntax for v6 compatibility. */}
        {/* FIX: Use Routes, Route, and Navigate components directly. */}
        <Routes>
          <Route path="/login" element={!user ? <LoginPage /> : <Navigate to={getHomeRoute()} />} />
          <Route path="/signup" element={!user ? <SignupPage /> : <Navigate to={getHomeRoute()} />} />
          <Route path="/" element={<Navigate to={getHomeRoute()} />} />
          
          {/* Public Assessment Routes */}
          <Route path="/assessment/:assessmentId" element={<AssessmentPage />} />
          <Route path="/assessment/complete" element={<AssessmentCompletePage />} />

          {/* FIX: Define nested routes inside a layout route for v6. */}
          <Route element={<PrivateRoute role="candidate" />}>
            <Route path="/candidate/dashboard" element={<CandidateDashboardPage />} />
            <Route path="/candidate/roadmap" element={<CandidateRoadmapPage />} />
            <Route path="/candidate/interview" element={<CandidateInterviewPage />} />
            <Route path="/candidate/profile" element={<CandidateProfilePage />} />
          </Route>
          
          <Route element={<PrivateRoute role="recruiter" />}>
             <Route path="/recruiter/dashboard" element={<RecruiterDashboardPage />} />
             <Route path="/recruiter/profile" element={<RecruiterProfilePage />} />
             <Route path="/recruiter/settings" element={<RecruiterSettingsPage />} />
             <Route path="/recruiter/assessments/new" element={<RecruiterCreateAssessmentPage />} />
             <Route path="/recruiter/report/:resultId" element={<RecruiterAssessmentReportPage />} />
          </Route>
          
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </HashRouter>
  );
}


export default App;