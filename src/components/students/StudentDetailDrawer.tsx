import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Target, 
  Award, 
  Zap, 
  Coins, 
  Flame, 
  TreePine, 
  Droplets, 
  Bird, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  Globe, 
  Compass, 
  User as UserIcon, 
  Mail, 
  BookOpen,
  Sparkles,
  TrendingUp,
  BarChart3,
  ShieldCheck,
  Check,
  Building2,
  Users
} from 'lucide-react';
import { StudentDetail, fetchTeacherStudentDetail, fetchAdminStudentDetail } from '../../lib/studentManagementService';
import { MAIN_ACTIVITIES, COMPLEMENTARY_ACTIVITIES, CATEGORIES_CONFIG, SurveyCategory } from '../../data/surveyData';
import { PROJECT_TIME_ZONE } from '../../lib/multiDayMissionProgress';
import ComparativeResultsView from '../survey/ComparativeResultsView';

interface StudentDetailDrawerProps {
  studentId: string | null;
  mode: 'teacher' | 'admin';
  teacherName?: string;
  onClose: () => void;
}

export default function StudentDetailDrawer({
  studentId,
  mode,
  teacherName,
  onClose,
}: StudentDetailDrawerProps) {
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'surveys' | 'activities'>('overview');

  useEffect(() => {
    if (!studentId) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    const loadDetail = async () => {
      try {
        const detail = mode === 'teacher' 
          ? await fetchTeacherStudentDetail(studentId)
          : await fetchAdminStudentDetail(studentId);
        
        if (isMounted) {
          setStudent(detail);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'No se pudo cargar el expediente del estudiante.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDetail();

    return () => {
      isMounted = false;
    };
  }, [studentId, mode]);

  if (!studentId) return null;

  const categories: SurveyCategory[] = ['Conducta Pro-Ambiental', 'Austeridad', 'Altruismo', 'Equidad'];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-[#0b131e] border border-white/15 w-full max-w-4xl max-h-[92vh] rounded-[36px] overflow-hidden flex flex-col shadow-2xl text-white font-sans relative"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shrink-0">
                {student?.name?.charAt(0).toUpperCase() || 'E'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-medium text-white">{student?.name || 'Cargando estudiante...'}</h2>
                  {student && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30">
                      Nivel {student.level || 1}
                    </span>
                  )}
                </div>
                {student && (
                  <div className="text-xs text-slate-400 flex flex-wrap items-center gap-2 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-500" /> {student.email}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-300">
                      <Building2 className="w-3.5 h-3.5 text-emerald-400" /> {student.schoolName || 'Escuela no asignada'}
                    </span>
                    {(student.grade || student.group) && (
                      <>
                        <span>•</span>
                        <span className="text-emerald-300">
                          {student.grade ? `${student.grade} Grado` : ''} {student.group ? `Grupo ${student.group}` : ''}
                        </span>
                      </>
                    )}
                    {teacherName && (
                      <>
                        <span>•</span>
                        <span className="text-teal-300">Docente: {teacherName}</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-10 h-10 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors border border-white/10 shrink-0 ml-2"
              title="Cerrar expediente"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-white/10 px-6 bg-white/[0.01]">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-3.5 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'overview'
                  ? 'border-emerald-400 text-emerald-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Target className="w-4 h-4" /> Resumen & Ecosistema
            </button>
            <button
              onClick={() => setActiveTab('surveys')}
              className={`py-3.5 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'surveys'
                  ? 'border-emerald-400 text-emerald-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Compass className="w-4 h-4" /> Diagnóstico & Comparativo
            </button>
            <button
              onClick={() => setActiveTab('activities')}
              className={`py-3.5 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'activities'
                  ? 'border-emerald-400 text-emerald-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" /> Actividades ({student ? student.completedMandatoryCount : 0}/12)
            </button>
          </div>

          {/* Body Content */}
          <div className="p-5 sm:p-7 overflow-y-auto space-y-7 custom-scrollbar flex-1 font-sans">
            {loading ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-10 h-10 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm text-slate-400">Cargando expediente educativo del estudiante...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center bg-red-500/10 border border-red-500/20 rounded-3xl text-red-300 space-y-3">
                <p className="text-sm font-medium">{error}</p>
                <button
                  onClick={onClose}
                  className="bg-white/10 hover:bg-white/15 px-4 py-2 rounded-xl text-xs text-white"
                >
                  Regresar a la lista
                </button>
              </div>
            ) : student ? (
              <>
                {/* TAB 1: OVERVIEW & ECOSYSTEM */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Top Stat Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                          <span>Misiones Obligatorias</span>
                          <Target className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div className="text-2xl font-bold text-white font-mono">
                          {student.completedMandatoryCount} <span className="text-xs font-normal text-slate-400">/ {student.totalMandatoryCount}</span>
                        </div>
                        <div className="text-[10px] text-emerald-400 mt-1 font-bold">
                          {Math.round((student.completedMandatoryCount / student.totalMandatoryCount) * 100)}% de avance
                        </div>
                      </div>

                      <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                          <span>Retos Secundarios</span>
                          <Sparkles className="w-4 h-4 text-blue-400" />
                        </div>
                        <div className="text-2xl font-bold text-blue-300 font-mono">
                          {student.completedComplementaryCount} <span className="text-xs font-normal text-slate-400">/ 10</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          Minijuegos completados
                        </div>
                      </div>

                      <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                          <span>EcoMonedas</span>
                          <Coins className="w-4 h-4 text-amber-400" />
                        </div>
                        <div className="text-2xl font-bold text-amber-300 font-mono">
                          {student.coins}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          Monedas de recompensa
                        </div>
                      </div>

                      <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                          <span>Experiencia (XP)</span>
                          <Zap className="w-4 h-4 text-purple-400" />
                        </div>
                        <div className="text-2xl font-bold text-purple-300 font-mono">
                          {student.xp} <span className="text-xs font-normal text-slate-400">XP</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          Nivel {student.level}
                        </div>
                      </div>
                    </div>

                    {/* Overall Progress Bar */}
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-medium flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Cumplimiento de Misiones Obligatorias
                        </span>
                        <span className="font-mono font-bold text-emerald-400">
                          {student.completedMandatoryCount} de {student.totalMandatoryCount} misiones
                        </span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-emerald-400 to-teal-400 h-2.5 rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(52,211,153,0.4)]"
                          style={{ width: `${Math.min(100, (student.completedMandatoryCount / student.totalMandatoryCount) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Ecosystem Section */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-light text-white flex items-center gap-2">
                        <Globe className="w-5 h-5 text-emerald-400" /> Estado del Ecosistema Escolar
                      </h3>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl text-center">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                            <TreePine className="w-5 h-5" />
                          </div>
                          <div className="text-xl font-bold text-white font-mono">{student.ecosystem?.trees || 0}</div>
                          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">Árboles</div>
                        </div>

                        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl text-center">
                          <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center mx-auto mb-2">
                            <Droplets className="w-5 h-5" />
                          </div>
                          <div className="text-xl font-bold text-white font-mono">{student.ecosystem?.water || 0}</div>
                          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">Cuerpos de Agua</div>
                        </div>

                        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl text-center">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-2">
                            <Bird className="w-5 h-5" />
                          </div>
                          <div className="text-xl font-bold text-white font-mono">{student.ecosystem?.animals || 0}</div>
                          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">Especies</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: SURVEYS & COMPARATIVE EVOLUTION */}
                {activeTab === 'surveys' && (
                  <div className="space-y-6">
                    {student.initialSurveyCompleted && student.finalSurveyCompleted && student.initialSurvey && student.finalSurvey ? (
                      <ComparativeResultsView
                        initialSurvey={student.initialSurvey}
                        finalSurvey={student.finalSurvey}
                        studentName={student.name}
                      />
                    ) : (
                      <div className="space-y-5">
                        {/* Initial Survey Card */}
                        <div className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                                <Compass className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="text-base font-medium text-white">Diagnóstico Socioambiental Inicial</h4>
                                <p className="text-xs text-slate-400">Línea base registrada (22 preguntas)</p>
                              </div>
                            </div>
                            <span className={`text-xs px-3 py-1 rounded-full font-bold border ${
                              student.initialSurveyCompleted 
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            }`}>
                              {student.initialSurveyCompleted ? 'Completado' : 'Pendiente'}
                            </span>
                          </div>

                          {student.initialSurvey ? (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                              {categories.map(cat => {
                                const cfg = CATEGORIES_CONFIG[cat];
                                const score = student.initialSurvey?.categoryScores?.[cat] || 0;
                                const max = cfg.maxScore;
                                const pct = Math.round((score / max) * 100);
                                return (
                                  <div key={cat} className="p-3 rounded-2xl bg-black/20 border border-white/5 space-y-1">
                                    <div className="text-[11px] text-slate-400 truncate">{cfg.icon} {cat}</div>
                                    <div className="text-sm font-bold text-emerald-400 font-mono">{score} / {max}</div>
                                    <div className="text-[10px] text-slate-500 font-mono">{pct}%</div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400 italic">El estudiante aún no ha respondido el diagnóstico inicial.</p>
                          )}
                        </div>

                        {/* Final Survey Status Card */}
                        <div className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                                <Award className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="text-base font-medium text-white">Evaluación Socioambiental Final</h4>
                                <p className="text-xs text-slate-400">Comparativa de salida del programa</p>
                              </div>
                            </div>
                            <span className={`text-xs px-3 py-1 rounded-full font-bold border ${
                              student.finalSurveyCompleted
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                : student.completedMandatoryCount >= 12
                                ? 'bg-teal-500/20 text-teal-300 border-teal-500/30'
                                : 'bg-white/5 text-slate-400 border-white/10'
                            }`}>
                              {student.finalSurveyCompleted 
                                ? 'Completada' 
                                : student.completedMandatoryCount >= 12 
                                ? 'Disponible para realizar' 
                                : 'Bloqueada'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">
                            {student.finalSurveyCompleted
                              ? 'Evaluación concluida. Los resultados comparativos se encuentran listados arriba.'
                              : student.completedMandatoryCount >= 12
                              ? 'El estudiante ya cumplió las 12 misiones obligatorias y tiene habilitada la encuesta final en su panel.'
                              : `Faltan ${12 - student.completedMandatoryCount} actividades obligatorias para desbloquear la evaluación final.`}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: ACTIVITIES BREAKDOWN */}
                {activeTab === 'activities' && (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-medium text-white">Misiones del Programa ({student.completedMandatoryCount}/12)</h4>
                      <span className="text-xs text-slate-400">12 Misiones Obligatorias</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {MAIN_ACTIVITIES.map(act => {
                        const record = student.completedActivities?.[act.id];
                        const isDone = Boolean(record);
                        const cfg = CATEGORIES_CONFIG[act.category];

                        return (
                          <div 
                            key={act.id}
                            className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                              isDone
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-white'
                                : 'bg-white/5 border-white/5 text-slate-400'
                            }`}
                          >
                            <div className="flex items-start gap-3 min-w-0">
                              <span className="text-2xl shrink-0">{act.icon}</span>
                              <div className="min-w-0">
                                <div className={`text-xs font-semibold truncate ${isDone ? 'text-white' : 'text-slate-300'}`}>
                                  {act.title}
                                </div>
                                <div className="text-[10px] text-slate-400 mt-0.5">
                                  {act.category} • {act.durationText}
                                </div>
                                {isDone && record?.completedAt && (
                                  <div className="text-[10px] text-emerald-400 font-mono mt-1">
                                    ✓ Superada el {new Date(record.completedAt).toLocaleDateString('es-MX', { timeZone: PROJECT_TIME_ZONE })}
                                  </div>
                                )}
                              </div>
                            </div>

                            <span className="shrink-0">
                              {isDone ? (
                                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                                  <Check className="w-3 h-3" /> Lista
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">
                                  Pendiente
                                </span>
                              )}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-5 border-t border-white/10 bg-white/[0.02] flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Expediente educativo en modo de solo consulta
            </span>
            <button
              onClick={onClose}
              className="bg-white/10 hover:bg-white/15 text-white font-medium px-5 py-2.5 rounded-xl transition-all"
            >
              Cerrar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
