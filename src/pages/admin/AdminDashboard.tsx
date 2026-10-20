import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Shield, 
  Users, 
  Check, 
  X, 
  LogOut, 
  BarChart3, 
  Trash2, 
  Globe, 
  Sparkles, 
  UserPlus, 
  Copy, 
  CheckCircle2, 
  RefreshCw, 
  Mail, 
  UserCheck,
  GraduationCap,
  Building2,
  ShieldAlert
} from 'lucide-react';
import StudentProgressAnalytics from '../../components/admin/StudentProgressAnalytics';
import StudentsListTable from '../../components/students/StudentsListTable';
import SchoolManagement from '../../components/admin/SchoolManagement';
import AdminDeletionRequests from '../../components/admin/AdminDeletionRequests';
import DiagnosticSurveyManager from '../../components/admin/DiagnosticSurveyManager';
import { OFFICIAL_STUDENT_SCHOOLS } from '../../data/officialSchools';
import { generateRandomCode } from '../../lib/teacherCode';
import { fetchAdminStudents, StudentSummary } from '../../lib/studentManagementService';
import { 
  fetchAdminTeachers, 
  createAdminTeacher, 
  regenerateTeacherLinkCode, 
  deleteAdminUser, 
  fetchAdminRoleRequests, 
  approveAdminRoleRequest, 
  rejectAdminRoleRequest,
  AdminTeacher,
  AdminRoleRequest 
} from '../../lib/teacherAdminService';
import { Compass } from 'lucide-react';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'students' | 'schools' | 'diagnostic-survey' | 'deletions' | 'analytics' | 'teachers' | 'requests'>('students');
  const [requests, setRequests] = useState<AdminRoleRequest[]>([]);
  const [teachers, setTeachers] = useState<AdminTeacher[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [studentSummaries, setStudentSummaries] = useState<StudentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  // New Teacher Modal State
  const [showCreateTeacherModal, setShowCreateTeacherModal] = useState(false);
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherEmail, setNewTeacherEmail] = useState('');
  const [newTeacherSchoolId, setNewTeacherSchoolId] = useState('sch_sec_tec_1');
  const [generatedCode, setGeneratedCode] = useState('');
  const [creatingTeacher, setCreatingTeacher] = useState(false);
  const [createTeacherError, setCreateTeacherError] = useState('');
  const [copiedTeacherId, setCopiedTeacherId] = useState<string | null>(null);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [user?.uid]);

  const fetchData = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      // 1. Fetch official role requests via authoritative API
      try {
        const reqs = await fetchAdminRoleRequests();
        setRequests(reqs);
      } catch (err: any) {
        console.warn('Failed to load role requests:', err?.message || err);
      }

      // 2. Fetch authoritative teachers list via backend API
      try {
        const teacherList = await fetchAdminTeachers();
        setTeachers(teacherList);
      } catch (err: any) {
        console.warn('Failed to load teachers via admin endpoint:', err?.message || err);
      }

      // 3. Fetch official student summaries via secure admin API
      try {
        const studentRes = await fetchAdminStudents();
        setStudentSummaries(studentRes.students || []);
        setStudents(studentRes.students || []);
      } catch (err: any) {
        console.error('Failed to load admin student summaries via endpoint:', err);
        setFetchError(err?.message || 'Error al cargar padrón de estudiantes');
      }
    } catch (e: any) {
      console.error('Error fetching admin data:', e);
      setFetchError(e?.message || 'Error general al cargar datos administrativos');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateTeacherModal = () => {
    setNewTeacherName('');
    setNewTeacherEmail('');
    setNewTeacherSchoolId('sch_sec_tec_1');
    setCreateTeacherError('');
    setShowCreateTeacherModal(true);
    const code = generateRandomCode();
    setGeneratedCode(code);
  };

  const handleRefreshNewCode = () => {
    const code = generateRandomCode();
    setGeneratedCode(code);
  };

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacherName.trim() || !newTeacherEmail.trim() || !newTeacherSchoolId) {
      setCreateTeacherError('Por favor completa todos los campos (nombre, correo y escuela oficial).');
      return;
    }

    setCreatingTeacher(true);
    setCreateTeacherError('');

    try {
      const code = generatedCode || undefined;

      await createAdminTeacher({
        name: newTeacherName.trim(),
        email: newTeacherEmail.trim().toLowerCase(),
        schoolId: newTeacherSchoolId,
        linkCode: code,
      });

      setShowCreateTeacherModal(false);
      await fetchData();
    } catch (err: any) {
      console.error('Error creating teacher:', err);
      setCreateTeacherError('Error al crear docente: ' + (err.message || 'Inténtalo de nuevo.'));
    } finally {
      setCreatingTeacher(false);
    }
  };

  const handleRegenerateTeacherCode = async (teacherId: string) => {
    setRegeneratingId(teacherId);
    try {
      const newCode = await regenerateTeacherLinkCode(teacherId);
      setTeachers(prev => prev.map(t => (t.id === teacherId || t.uid === teacherId) ? { ...t, linkCode: newCode } : t));
    } catch (err: any) {
      console.error('Error regenerating code:', err);
      alert('Error al regenerar código: ' + (err?.message || 'Error desconocido'));
    } finally {
      setRegeneratingId(null);
    }
  };

  const handleCopyCode = (code: string, teacherId: string) => {
    navigator.clipboard.writeText(code);
    setCopiedTeacherId(teacherId);
    setTimeout(() => setCopiedTeacherId(null), 2000);
  };

  const handleApprove = async (reqId: string, userId: string, newRole: string) => {
    try {
      await approveAdminRoleRequest(reqId, userId, newRole);
      await fetchData();
    } catch (e: any) {
      console.error('Error approving request:', e);
      alert('Error al aprobar solicitud: ' + (e?.message || 'Error desconocido'));
    }
  };

  const handleReject = async (reqId: string) => {
    try {
      await rejectAdminRoleRequest(reqId);
      await fetchData();
    } catch (e: any) {
      console.error('Error rejecting request:', e);
      alert('Error al rechazar solicitud: ' + (e?.message || 'Error desconocido'));
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      await deleteAdminUser(userToDelete);
      setUserToDelete(null);
      await fetchData();
    } catch (e: any) {
      console.error('Delete error:', e);
      alert('Error al eliminar usuario: ' + (e.message || 'Revisa los permisos.'));
    }
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-white font-sans p-4 md:p-6">
      <header className="flex items-center justify-between mb-6 md:mb-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(52,211,153,0.3)] border border-emerald-500/30 flex items-center justify-center bg-black/40">
            <img 
              src="/ecovig-logo.svg" 
              alt="EcoViG" 
              className="w-full h-full object-cover select-none pointer-events-none" 
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-light">Panel de Administrador</h1>
            <p className="text-xs text-emerald-400 font-medium">
              Supervisión de docentes, códigos únicos de vinculación y avance socioambiental
            </p>
          </div>
        </div>
        <button 
          onClick={logout} 
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-3.5 py-2 rounded-xl text-slate-400 hover:text-red-400 transition-colors text-sm border border-white/10"
        >
          <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Cerrar Sesión</span>
        </button>
      </header>

      <main className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6 md:gap-8 pb-24 md:pb-8">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-64 flex-col gap-2 sticky top-8 h-fit shrink-0">
          <button 
            onClick={() => setActiveTab('students')} 
            className={`text-left px-4 py-3.5 rounded-2xl transition-all flex items-center gap-3 font-medium text-sm ${
              activeTab === 'students' 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)]' 
                : 'text-slate-400 hover:bg-white/5 border border-transparent'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Estudiantes ({studentSummaries.length || students.length})</span>
          </button>

          <button 
            onClick={() => setActiveTab('schools')} 
            className={`text-left px-4 py-3.5 rounded-2xl transition-all flex items-center gap-3 font-medium text-sm ${
              activeTab === 'schools' 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)]' 
                : 'text-slate-400 hover:bg-white/5 border border-transparent'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Catálogo de Escuelas</span>
          </button>

          <button 
            onClick={() => setActiveTab('diagnostic-survey')} 
            className={`text-left px-4 py-3.5 rounded-2xl transition-all flex items-center gap-3 font-medium text-sm ${
              activeTab === 'diagnostic-survey' 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)]' 
                : 'text-slate-400 hover:bg-white/5 border border-transparent'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Evaluación Diagnóstica</span>
          </button>

          <button 
            onClick={() => setActiveTab('deletions')} 
            className={`text-left px-4 py-3.5 rounded-2xl transition-all flex items-center gap-3 font-medium text-sm ${
              activeTab === 'deletions' 
                ? 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.15)]' 
                : 'text-slate-400 hover:bg-white/5 border border-transparent'
            }`}
          >
            <Trash2 className="w-4 h-4 text-red-400" />
            <span>Bajas y Eliminaciones</span>
          </button>

          <button 
            onClick={() => setActiveTab('analytics')} 
            className={`text-left px-4 py-3.5 rounded-2xl transition-all flex items-center gap-3 font-medium text-sm ${
              activeTab === 'analytics' 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)]' 
                : 'text-slate-400 hover:bg-white/5 border border-transparent'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Avance y Gráficas</span>
          </button>

          <button 
            onClick={() => setActiveTab('teachers')} 
            className={`text-left px-4 py-3.5 rounded-2xl transition-all flex items-center gap-3 font-medium text-sm ${
              activeTab === 'teachers' 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)]' 
                : 'text-slate-400 hover:bg-white/5 border border-transparent'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Docentes y Grupos ({teachers.length})</span>
          </button>

          <button 
            onClick={() => setActiveTab('requests')} 
            className={`text-left px-4 py-3.5 rounded-2xl transition-all flex items-center justify-between font-medium text-sm ${
              activeTab === 'requests' 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)]' 
                : 'text-slate-400 hover:bg-white/5 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4" />
              <span>Solicitudes</span>
            </div>
            {requests.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-black font-bold text-[10px]">
                {requests.length}
              </span>
            )}
          </button>
        </aside>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#05070a]/95 backdrop-blur-xl border-t border-white/10 px-1 pt-2 pb-[env(safe-area-inset-bottom)] flex justify-around items-center z-50">
          <button
            onClick={() => setActiveTab('students')}
            className={`flex flex-col items-center p-1 rounded-lg transition-colors relative flex-1 ${activeTab === 'students' ? 'text-emerald-400' : 'text-slate-500'}`}
          >
            <GraduationCap className="w-4 h-4 mb-0.5" />
            <span className="text-[8px] font-medium tracking-wide uppercase text-center">Alumnos</span>
          </button>
          <button
            onClick={() => setActiveTab('schools')}
            className={`flex flex-col items-center p-1 rounded-lg transition-colors relative flex-1 ${activeTab === 'schools' ? 'text-emerald-400' : 'text-slate-500'}`}
          >
            <Building2 className="w-4 h-4 mb-0.5" />
            <span className="text-[8px] font-medium tracking-wide uppercase text-center">Escuelas</span>
          </button>
          <button
            onClick={() => setActiveTab('diagnostic-survey')}
            className={`flex flex-col items-center p-1 rounded-lg transition-colors relative flex-1 ${activeTab === 'diagnostic-survey' ? 'text-emerald-400' : 'text-slate-500'}`}
          >
            <Compass className="w-4 h-4 mb-0.5" />
            <span className="text-[8px] font-medium tracking-wide uppercase text-center">Diagnóstico</span>
          </button>
          <button
            onClick={() => setActiveTab('deletions')}
            className={`flex flex-col items-center p-1 rounded-lg transition-colors relative flex-1 ${activeTab === 'deletions' ? 'text-red-400' : 'text-slate-500'}`}
          >
            <Trash2 className="w-4 h-4 mb-0.5" />
            <span className="text-[8px] font-medium tracking-wide uppercase text-center">Bajas</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex flex-col items-center p-1 rounded-lg transition-colors relative flex-1 ${activeTab === 'analytics' ? 'text-emerald-400' : 'text-slate-500'}`}
          >
            <BarChart3 className="w-4 h-4 mb-0.5" />
            <span className="text-[8px] font-medium tracking-wide uppercase text-center">Avance</span>
          </button>
          <button
            onClick={() => setActiveTab('teachers')}
            className={`flex flex-col items-center p-1 rounded-lg transition-colors relative flex-1 ${activeTab === 'teachers' ? 'text-emerald-400' : 'text-slate-500'}`}
          >
            <Users className="w-4 h-4 mb-0.5" />
            <span className="text-[8px] font-medium tracking-wide uppercase text-center">Docentes</span>
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex flex-col items-center p-1 rounded-lg transition-colors relative flex-1 ${activeTab === 'requests' ? 'text-emerald-400' : 'text-slate-500'}`}
          >
            <Shield className="w-4 h-4 mb-0.5" />
            <span className="text-[8px] font-medium tracking-wide uppercase text-center">
              Roles {requests.length > 0 ? `(${requests.length})` : ''}
            </span>
          </button>
        </nav>

        {/* Main Content Area */}
        <section className="flex-1 min-w-0">
          {loading ? (
            <div className="bg-white/5 border border-white/10 p-12 rounded-[32px] text-center text-slate-400">
              <div className="w-10 h-10 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              Cargando datos escolares...
            </div>
          ) : (
            <>
              {/* TAB 0: STUDENTS LIST TABLE */}
              {activeTab === 'students' && (
                <div className="space-y-6">
                  {fetchError && (
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-amber-400 font-bold">⚠️ Aviso:</span>
                        <span>{fetchError}</span>
                      </div>
                      <button
                        onClick={fetchData}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-medium transition-colors text-xs shrink-0 self-start sm:self-auto cursor-pointer"
                      >
                        Reintentar carga
                      </button>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h2 className="text-xl font-medium text-emerald-400">Padrón Global de Estudiantes ({studentSummaries.length})</h2>
                      <p className="text-xs text-slate-400">
                        Supervisión y consulta pedagógica de todos los alumnos registrados en el sistema EcoViG.
                      </p>
                    </div>
                  </div>

                  <StudentsListTable
                    students={studentSummaries}
                    mode="admin"
                    teachersList={teachers}
                    onRefresh={fetchData}
                  />
                </div>
              )}

              {/* TAB 1: OFFICIAL SCHOOLS CATALOG */}
              {activeTab === 'schools' && (
                <SchoolManagement />
              )}

              {/* TAB 1.5: DIAGNOSTIC SURVEY CONFIGURATION & QUESTION MANAGEMENT */}
              {activeTab === 'diagnostic-survey' && (
                <DiagnosticSurveyManager />
              )}

              {/* TAB 2: DELETIONS & PURGE */}
              {activeTab === 'deletions' && (
                <AdminDeletionRequests />
              )}

              {/* TAB 1: STUDENT PROGRESS & ANALYTICS CHARTS */}
              {activeTab === 'analytics' && (
                <StudentProgressAnalytics
                  students={students}
                  teachers={teachers}
                  onDeleteStudent={(id) => setUserToDelete(id)}
                />
              )}

              {/* TAB 2: TEACHERS AND GROUPS */}
              {activeTab === 'teachers' && (
                <div className="bg-white/5 border border-white/10 p-6 sm:p-7 rounded-[32px] backdrop-blur-md space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-medium text-emerald-400">Docentes Registrados ({teachers.length})</h2>
                      <p className="text-xs text-slate-400">
                        Cada maestro cuenta con un código único generado automáticamente para vincular a sus alumnos.
                      </p>
                    </div>

                    <button
                      onClick={handleOpenCreateTeacherModal}
                      className="px-4 py-2.5 bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-black font-bold text-xs rounded-2xl flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(52,211,153,0.3)] shrink-0 self-start sm:self-auto"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>+ Crear Nuevo Maestro</span>
                    </button>
                  </div>

                  <div className="space-y-6">
                    {teachers.length === 0 ? (
                      <div className="text-center py-10 text-slate-500 text-sm bg-black/20 rounded-2xl border border-white/5">
                        No hay docentes registrados. Haz clic en "+ Crear Nuevo Maestro" para añadir uno.
                      </div>
                    ) : (
                      teachers.map(teacher => {
                        const teacherStudents = students.filter(s => s.teacherId === teacher.id || s.teacherId === teacher.uid);
                        const isCopied = copiedTeacherId === (teacher.id || teacher.uid);
                        const isRegen = regeneratingId === (teacher.id || teacher.uid);

                        return (
                          <div key={teacher.id || teacher.uid} className="bg-black/30 p-5 rounded-2xl border border-white/10 space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 flex items-center justify-center text-xl font-bold text-blue-300 shrink-0">
                                  {teacher.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-bold text-lg text-white">{teacher.name}</div>
                                  <div className="text-xs text-slate-400">{teacher.email}</div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium">
                                      <Building2 className="w-3 h-3 text-emerald-400" />
                                      {teacher.schoolName || 'Escuela Oficial'} (Caborca, Sonora)
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Unique Code Badge & Actions */}
                              <div className="flex items-center flex-wrap gap-2 self-start sm:self-auto">
                                <div className="flex items-center bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 gap-2">
                                  <span className="text-[10px] uppercase font-bold text-slate-400">Código:</span>
                                  <span className="text-sm font-mono font-bold text-emerald-400 tracking-wider">
                                    {teacher.linkCode}
                                  </span>
                                  <button
                                    onClick={() => handleCopyCode(teacher.linkCode, teacher.id || teacher.uid)}
                                    className="p-1 hover:bg-white/10 rounded text-slate-300 hover:text-white transition-colors"
                                    title="Copiar código"
                                  >
                                    {isCopied ? (
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                    ) : (
                                      <Copy className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                  <button
                                    onClick={() => handleRegenerateTeacherCode(teacher.id || teacher.uid)}
                                    disabled={isRegen}
                                    className="p-1 hover:bg-white/10 rounded text-slate-300 hover:text-amber-400 transition-colors"
                                    title="Regenerar nuevo código único"
                                  >
                                    <RefreshCw className={`w-3.5 h-3.5 ${isRegen ? 'animate-spin text-amber-400' : ''}`} />
                                  </button>
                                </div>

                                <button 
                                  onClick={() => setUserToDelete(teacher.id || teacher.uid)} 
                                  className="w-9 h-9 flex items-center justify-center bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-colors border border-red-500/20" 
                                  title="Eliminar docente"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            <div className="border-t border-white/10 pt-4">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5 text-emerald-400" /> Alumnos Asignados ({teacherStudents.length}/3)
                              </h4>
                              {teacherStudents.length === 0 ? (
                                <p className="text-xs text-slate-500 italic bg-white/5 p-3.5 rounded-xl border border-white/5">
                                  No hay alumnos vinculados todavía con el código <span className="font-mono text-emerald-400 font-bold">{teacher.linkCode}</span>.
                                </p>
                              ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {teacherStudents.map(student => {
                                    const completedMap = (student.completedActivities as any) || {};
                                    const count = Object.keys(completedMap).filter(id => id.startsWith('act_')).length;

                                    return (
                                      <div key={student.id || student.uid} className="bg-white/5 p-3.5 rounded-xl border border-white/5 flex justify-between items-center hover:border-white/15 transition-all">
                                        <div>
                                          <div className="font-medium text-sm text-white">{student.name}</div>
                                          <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                                            <span>Nivel {student.level || 1}</span>
                                            <span className="text-emerald-400 font-bold">{student.xp || 0} XP</span>
                                            <span className="text-amber-400 font-mono">{count}/12 misiones</span>
                                          </div>
                                        </div>
                                        <button 
                                          onClick={() => setUserToDelete(student.id || student.uid)} 
                                          className="w-7 h-7 flex items-center justify-center bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-colors" 
                                          title="Eliminar alumno"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: ROLE REQUESTS */}
              {activeTab === 'requests' && (
                <div className="bg-white/5 border border-white/10 p-6 sm:p-7 rounded-[32px] backdrop-blur-md space-y-6">
                  <div>
                    <h2 className="text-xl font-medium text-emerald-400">Solicitudes de Rol ({requests.length})</h2>
                    <p className="text-xs text-slate-400">
                      Al aprobar una solicitud de docente, se le generará y asignará de forma automática su código único de vinculación.
                    </p>
                  </div>

                  {requests.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 text-sm bg-black/20 rounded-2xl border border-white/5">
                      No hay solicitudes pendientes en este momento.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {requests.map(req => (
                        <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-black/30 p-4 sm:p-5 rounded-2xl border border-white/10 gap-4">
                          <div>
                            <div className="font-bold text-white text-base">{req.name}</div>
                            <div className="text-xs text-slate-400">{req.email}</div>
                            <div className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] uppercase tracking-wider font-bold border border-emerald-500/30">
                              Solicita: {req.requestedRole}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleApprove(req.id, req.userId, req.requestedRole)} 
                              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center gap-1.5"
                            >
                              <Check className="w-4 h-4" /> Aprobar & Generar Código
                            </button>
                            <button 
                              onClick={() => handleReject(req.id)} 
                              className="px-4 py-2 bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white font-bold text-xs rounded-xl transition-all border border-red-500/30 flex items-center gap-1.5"
                            >
                              <X className="w-4 h-4" /> Rechazar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </section>
      </main>

      {/* CREATE NEW TEACHER MODAL */}
      {showCreateTeacherModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0b131e] border border-white/15 p-6 sm:p-7 rounded-[32px] max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">Crear Nuevo Maestro</h3>
                  <p className="text-[11px] text-slate-400">Genera su perfil docente y código único al instante</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateTeacherModal(false)}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {createTeacherError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs text-center">
                {createTeacherError}
              </div>
            )}

            <form onSubmit={handleCreateTeacher} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Nombre Completo del Maestro</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Mtro. Carlos Mendoza"
                  value={newTeacherName}
                  onChange={(e) => setNewTeacherName(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Correo Electrónico Institucional</label>
                <input
                  type="email"
                  required
                  placeholder="carlos.mendoza@unison.mx"
                  value={newTeacherEmail}
                  onChange={(e) => setNewTeacherEmail(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Escuela Secundaria Oficial <span className="text-emerald-400">*</span>
                </label>
                <select
                  required
                  value={newTeacherSchoolId}
                  onChange={(e) => setNewTeacherSchoolId(e.target.value)}
                  className="w-full bg-[#050b14] border border-white/15 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500 text-xs sm:text-sm"
                >
                  {OFFICIAL_STUDENT_SCHOOLS.map((sch) => (
                    <option key={sch.id} value={sch.id} className="bg-slate-900 text-white">
                      {sch.name} ({sch.city}, {sch.state})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  Solo los alumnos de esta institución podrán vincularse con este maestro (Caborca, Sonora).
                </p>
              </div>

              {/* Instant Generated Code Preview */}
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="font-semibold text-emerald-300">Código Único Generado:</span>
                  <button
                    type="button"
                    onClick={handleRefreshNewCode}
                    className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 hover:underline"
                  >
                    <RefreshCw className="w-3 h-3" /> Cambiar código
                  </button>
                </div>
                <div className="text-2xl font-mono font-bold tracking-widest text-emerald-400 bg-black/40 p-2.5 rounded-xl text-center border border-emerald-500/30">
                  {generatedCode}
                </div>
                <p className="text-[10px] text-slate-400 text-center">
                  Los estudiantes ingresarán este código en su panel para vincularse a este maestro.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateTeacherModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creatingTeacher}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-black font-bold transition-all shadow-[0_0_15px_rgba(52,211,153,0.3)] disabled:opacity-50"
                >
                  {creatingTeacher ? 'Creando Maestro...' : 'Crear Maestro & Asignar Código'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0b131e] border border-white/15 p-6 rounded-[28px] max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-white">¿Eliminar usuario?</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              ¿Estás seguro de eliminar a este usuario de la base de datos? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 transition-colors text-xs font-medium"
              >
                Cancelar
              </button>
              <button 
                onClick={handleDeleteUser}
                className="px-5 py-2.5 rounded-xl bg-red-500 text-white font-bold text-xs hover:bg-red-400 transition-colors shadow-[0_0_15px_rgba(239,68,68,0.4)]"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
