import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Users, Copy, CheckCircle2, AlertCircle, X, LogOut, Sparkles, KeyRound, Compass, BarChart3, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ensureTeacherHasLinkCode } from '../../lib/teacherCode';
import { StudentSummary, fetchTeacherStudents } from '../../lib/studentManagementService';
import StudentsListTable from '../../components/students/StudentsListTable';
import TeacherDeletionRequests from '../../components/teacher/TeacherDeletionRequests';

export default function TeacherDashboard() {
  const { user, refreshUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'students' | 'deletion_requests' | 'code'>('students');
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pendingDeletionsCount, setPendingDeletionsCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    if (!user.linkCode) {
      ensureTeacherHasLinkCode(user.uid).then(() => {
        refreshUser();
      });
    }
    loadTeacherStudents();
  }, [user]);

  const loadTeacherStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTeacherStudents();
      setStudents(data.students);
    } catch (err: any) {
      console.error('Error fetching teacher students:', err);
      setError(err.message || 'Error al cargar los estudiantes.');
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    if (user?.linkCode) {
      navigator.clipboard.writeText(user.linkCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen font-sans text-white pb-20 relative z-10">
      {/* Header */}
      <header className="bg-white/5 border-b border-white/10 px-6 py-4 sticky top-0 z-20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-[0_0_15px_rgba(52,211,153,0.3)] border border-emerald-500/30 flex items-center justify-center bg-black/40">
              <img 
                src="/ecovig-logo.svg" 
                alt="EcoViG" 
                className="w-full h-full object-cover select-none pointer-events-none" 
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-tight text-emerald-400 uppercase">EcoViG</span>
                <span className="text-slate-500">•</span>
                <h1 className="text-base sm:text-lg font-light text-white">Panel Docente</h1>
              </div>
              <p className="text-xs text-slate-300 font-medium">Docente: {user.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Code Badge */}
            {user.linkCode && (
              <button
                onClick={copyCode}
                className="hidden sm:flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-3.5 py-1.5 rounded-xl text-xs text-emerald-300 font-mono transition-all"
                title="Copiar código de vinculación"
              >
                <span>Código: <strong>{user.linkCode}</strong></span>
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            )}

            <button
              onClick={logout}
              className="text-slate-400 hover:text-red-400 transition-colors p-2 bg-white/5 rounded-xl border border-white/10"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8 space-y-6 relative z-10">
        {/* Navigation Tabs Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-1.5 rounded-2xl backdrop-blur-md self-start">
            <button
              onClick={() => setActiveTab('students')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'students'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Estudiantes ({students.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('deletion_requests')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'deletion_requests'
                  ? 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Trash2 className="w-4 h-4 text-red-400" />
              <span>Solicitudes de Baja</span>
              {pendingDeletionsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-white font-bold text-[10px]">
                  {pendingDeletionsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('code')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'code'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>Mi Código de Vinculación</span>
            </button>
          </div>

          <div className="text-xs text-slate-400">
            Seguimiento educativo de alumnos asignados
          </div>
        </div>

        {/* TAB 1: STUDENTS LIST & DETAIL */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            <StudentsListTable
              students={students}
              loading={loading}
              mode="teacher"
              teacherName={user.name}
              onRefresh={loadTeacherStudents}
            />
          </div>
        )}

        {/* TAB 2: DELETION REQUESTS */}
        {activeTab === 'deletion_requests' && (
          <TeacherDeletionRequests onCountChange={setPendingDeletionsCount} />
        )}

        {/* TAB 2: TEACHER LINK CODE & INSTRUCTIONS */}
        {activeTab === 'code' && (
          <section className="bg-white/5 p-6 sm:p-8 rounded-[36px] shadow-lg border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-[-50%] right-[-10%] w-[50%] h-[150%] bg-green-500/10 blur-[80px] rounded-full pointer-events-none" />
            <div className="relative z-10 space-y-2 max-w-xl">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                <Sparkles className="w-3 h-3" /> Vinculación Escolar
              </span>
              <h2 className="text-2xl sm:text-3xl font-light text-white">Código de Vinculación para Alumnos</h2>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Comparte este código con tus estudiantes. Al ingresarlo en su perfil de EcoViG, quedarán vinculados automáticamente a tu aula para que puedas dar seguimiento a su diagnóstico y evolución socioambiental.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-white/5 p-2.5 pl-6 rounded-3xl border border-white/10 w-full md:w-auto relative z-10 backdrop-blur-md shadow-xl">
              <span className="text-3xl sm:text-4xl font-mono tracking-widest font-bold text-emerald-400">
                {user.linkCode || 'ECO-DOCENTE'}
              </span>
              <button 
                onClick={copyCode}
                className="w-14 h-14 bg-white/10 rounded-2xl border border-white/10 flex items-center justify-center hover:bg-white/20 transition-colors shrink-0"
                title="Copiar código"
              >
                {copied ? <CheckCircle2 className="w-6 h-6 text-emerald-400" /> : <Copy className="w-6 h-6 text-white" />}
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
