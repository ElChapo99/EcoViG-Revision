import { useAuth } from '../contexts/AuthContext';
import { Navigate, Routes, Route } from 'react-router';
import StudentDashboard from './student/StudentDashboard';
import TeacherDashboard from './teacher/TeacherDashboard';
import EvaluatorDashboard from './evaluator/EvaluatorDashboard';
import AdminDashboard from './admin/AdminDashboard';
import { getStudentOnboardingState } from '../lib/onboardingGuard';

export default function DashboardRouter() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'student') {
    const onboardingState = getStudentOnboardingState(user);
    if (onboardingState === 'NEEDS_SCHOOL') return <Navigate to="/select-school" replace />;
    if (onboardingState === 'NEEDS_TEACHER') return <Navigate to="/link-teacher" replace />;
  }

  return (
    <Routes>
      {user.role === 'student' && <Route path="/*" element={<StudentDashboard />} />}
      {user.role === 'teacher' && <Route path="/*" element={<TeacherDashboard />} />}
      {user.role === 'evaluator' && <Route path="/*" element={<EvaluatorDashboard />} />}
      {user.role === 'admin' && <Route path="/*" element={<AdminDashboard />} />}
    </Routes>
  );
}
