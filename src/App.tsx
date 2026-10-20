/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Support from './pages/Support';
import Policies from './pages/Policies';
import SelectSchool from './pages/student/SelectSchool';
import LinkTeacher from './pages/student/LinkTeacher';
import DashboardRouter from './pages/DashboardRouter';
import Questionnaire from './pages/student/Questionnaire';
import DeleteAccountPublic from './pages/DeleteAccountPublic';
import { getStudentOnboardingState } from './lib/onboardingGuard';
import React from 'react';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-[#05070a] text-emerald-400 flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(52,211,153,0.3)] border border-emerald-500/30 flex items-center justify-center bg-black/40 mb-1">
          <img 
            src="/ecovig-logo.svg" 
            alt="EcoViG" 
            className="w-full h-full object-cover select-none pointer-events-none" 
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs uppercase font-mono tracking-widest text-slate-400">Cargando EcoViG...</p>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'student') {
    const onboardingState = getStudentOnboardingState(user);
    if (onboardingState === 'NEEDS_SCHOOL') {
      return <Navigate to="/select-school" replace />;
    }
    if (onboardingState === 'NEEDS_TEACHER') {
      return <Navigate to="/link-teacher" replace />;
    }
  }

  return <>{children}</>;
};

const SelectSchoolRoute = () => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-[#05070a] text-emerald-400 flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(52,211,153,0.3)] border border-emerald-500/30 flex items-center justify-center bg-black/40 mb-1">
          <img 
            src="/ecovig-logo.svg" 
            alt="EcoViG" 
            className="w-full h-full object-cover select-none pointer-events-none" 
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;

  if (user.role !== 'student') {
    return <Navigate to="/dashboard" replace />;
  }

  const onboardingState = getStudentOnboardingState(user);
  if (onboardingState === 'READY') {
    return <Navigate to="/dashboard" replace />;
  }
  if (onboardingState === 'NEEDS_TEACHER') {
    return <Navigate to="/link-teacher" replace />;
  }

  return <SelectSchool />;
};

const LinkTeacherRoute = () => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-[#05070a] text-emerald-400 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;

  if (user.role !== 'student') {
    return <Navigate to="/dashboard" replace />;
  }

  const onboardingState = getStudentOnboardingState(user);
  if (onboardingState === 'READY') {
    return <Navigate to="/dashboard" replace />;
  }
  if (onboardingState === 'NEEDS_SCHOOL') {
    return <Navigate to="/select-school" replace />;
  }

  return <LinkTeacher />;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-[#05070a] text-white flex flex-col font-sans relative overflow-x-hidden">
          <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-600/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
          <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-green-600/10 rounded-full blur-[150px] pointer-events-none z-0"></div>
          <div className="relative z-10 flex flex-col flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/support" element={<Support />} />
              <Route path="/policies" element={<Policies />} />
              <Route path="/eliminar-cuenta" element={<DeleteAccountPublic />} />
              <Route path="/select-school" element={<SelectSchoolRoute />} />
              <Route path="/link-teacher" element={<LinkTeacherRoute />} />
              <Route path="/dashboard/*" element={
                <ProtectedRoute>
                  <DashboardRouter />
                </ProtectedRoute>
              } />
              <Route path="/questionnaire" element={
                <ProtectedRoute>
                  <Questionnaire />
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

