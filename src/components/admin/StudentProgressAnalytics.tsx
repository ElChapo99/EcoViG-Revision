import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Zap, 
  Coins, 
  Flame, 
  Search, 
  Filter, 
  Users, 
  Award, 
  Globe, 
  CheckCircle2, 
  ChevronRight, 
  Eye, 
  Layers, 
  ArrowUpDown, 
  Sparkles,
  TreePine,
  Trash2
} from 'lucide-react';
import { User, CompletedActivityRecord } from '../../types';
import { MAIN_ACTIVITIES, CATEGORIES_CONFIG, SurveyCategory } from '../../data/surveyData';
import { BIOMES, getBiomeUnlockStatus } from '../../lib/worldProgress';
import { hasUserCompletedInitialSurvey } from '../../lib/surveyService';
import StudentDetailModal from './StudentDetailModal';

interface StudentProgressAnalyticsProps {
  students: User[];
  teachers: User[];
  onDeleteStudent?: (studentId: string) => void;
}

export default function StudentProgressAnalytics({ students, teachers, onDeleteStudent }: StudentProgressAnalyticsProps) {
  const [selectedTeacherFilter, setSelectedTeacherFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'missions' | 'xp' | 'level' | 'streak' | 'name'>('missions');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [chartMetric, setChartMetric] = useState<'missions' | 'xp' | 'dimensions'>('missions');
  const [selectedStudentForModal, setSelectedStudentForModal] = useState<User | null>(null);

  // Map teacher names
  const teacherMap = useMemo(() => {
    const map = new Map<string, string>();
    teachers.forEach(t => map.set(t.uid || (t as any).id, t.name));
    return map;
  }, [teachers]);

  // Filtered and sorted students
  const filteredStudents = useMemo(() => {
    return students
      .filter(s => {
        if (selectedTeacherFilter !== 'all') {
          if (selectedTeacherFilter === 'unassigned') {
            if (s.teacherId) return false;
          } else {
            if (s.teacherId !== selectedTeacherFilter) return false;
          }
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = (s.name || '').toLowerCase().includes(q);
          const matchEmail = (s.email || '').toLowerCase().includes(q);
          if (!matchName && !matchEmail) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const getCompletedCount = (u: User) => {
          const map = (u.completedActivities as any) || {};
          return MAIN_ACTIVITIES.filter(act => Boolean(map[act.id])).length;
        };

        let comp = 0;
        if (sortBy === 'missions') {
          comp = getCompletedCount(b) - getCompletedCount(a);
        } else if (sortBy === 'xp') {
          comp = (b.xp || 0) - (a.xp || 0);
        } else if (sortBy === 'level') {
          comp = (b.level || 1) - (a.level || 1);
        } else if (sortBy === 'streak') {
          comp = (b.streak || 0) - (a.streak || 0);
        } else if (sortBy === 'name') {
          comp = (a.name || '').localeCompare(b.name || '');
        }

        return sortOrder === 'desc' ? comp : -comp;
      });
  }, [students, selectedTeacherFilter, searchQuery, sortBy, sortOrder]);

  // Global aggregate statistics
  const totalCount = students.length;
  const diagnosedCount = students.filter(s => hasUserCompletedInitialSurvey(s)).length;
  const avgMissions = totalCount > 0
    ? (students.reduce((acc, s) => {
        const map = (s.completedActivities as any) || {};
        return acc + MAIN_ACTIVITIES.filter(act => Boolean(map[act.id])).length;
      }, 0) / totalCount).toFixed(1)
    : '0';

  const totalXp = students.reduce((acc, s) => acc + (s.xp || 0), 0);
  const avgXp = totalCount > 0 ? Math.round(totalXp / totalCount) : 0;
  
  const cityUnlockedCount = students.filter(s => {
    const map = (s.completedActivities as any) || {};
    const count = MAIN_ACTIVITIES.filter(act => Boolean(map[act.id])).length;
    return count >= 12;
  }).length;

  const desertUnlockedCount = students.filter(s => {
    const map = (s.completedActivities as any) || {};
    const count = MAIN_ACTIVITIES.filter(act => Boolean(map[act.id])).length;
    return count >= 4;
  }).length;

  const mountainUnlockedCount = students.filter(s => {
    const map = (s.completedActivities as any) || {};
    const count = MAIN_ACTIVITIES.filter(act => Boolean(map[act.id])).length;
    return count >= 8;
  }).length;

  // Average per dimension calculation
  const dimensionsAverage = useMemo(() => {
    const cats: SurveyCategory[] = ['Conducta Pro-Ambiental', 'Austeridad', 'Altruismo', 'Equidad'];
    return cats.map(cat => {
      const catMissions = MAIN_ACTIVITIES.filter(a => a.category === cat);
      const totalPossible = catMissions.length * (totalCount || 1);
      const totalDone = students.reduce((acc, s) => {
        const map = (s.completedActivities as any) || {};
        return acc + catMissions.filter(a => Boolean(map[a.id])).length;
      }, 0);
      const percentage = totalCount > 0 ? Math.round((totalDone / totalPossible) * 100) : 0;
      return {
        category: cat,
        percentage,
        config: CATEGORIES_CONFIG[cat],
        done: totalDone,
        totalPossible
      };
    });
  }, [students, totalCount]);

  return (
    <div className="space-y-7 font-sans">
      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white/5 border border-white/10 p-4 sm:p-5 rounded-[24px] backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Alumnos Asignados</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-light text-white font-mono">
            {totalCount}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 font-bold">
            {diagnosedCount} con diagnóstico inicial ({totalCount > 0 ? Math.round((diagnosedCount / totalCount) * 100) : 0}%)
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 p-4 sm:p-5 rounded-[24px] backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Promedio Misiones</span>
            <Target className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-light text-white font-mono">
            {avgMissions} <span className="text-xs font-normal text-slate-400">/ 12</span>
          </div>
          <div className="text-[11px] text-teal-400 mt-1 font-bold">
            {totalCount > 0 ? Math.round((Number(avgMissions) / 12) * 100) : 0}% avance grupal
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 p-4 sm:p-5 rounded-[24px] backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>XP Promedio</span>
            <Zap className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-light text-purple-300 font-mono">
            {avgXp} <span className="text-xs font-normal text-slate-400">XP</span>
          </div>
          <div className="text-[11px] text-purple-400 mt-1">
            {totalXp} XP global generada
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 p-4 sm:p-5 rounded-[24px] backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Ciudad Verde</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-light text-amber-300 font-mono">
            {cityUnlockedCount} <span className="text-xs font-normal text-slate-400">/ {totalCount}</span>
          </div>
          <div className="text-[11px] text-amber-400 mt-1 font-bold">
            {totalCount > 0 ? Math.round((cityUnlockedCount / totalCount) * 100) : 0}% restauraron la Ciudad
          </div>
        </div>
      </div>

      {/* World Unlock Distribution Summary */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border border-emerald-500/20 p-5 sm:p-6 rounded-[28px] backdrop-blur-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-medium text-white">Desbloqueo de Ecosistemas por el Grupo</h3>
          </div>
          <span className="text-xs text-slate-400">
            Alumnos que han alcanzado cada meta
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white/5 p-3.5 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between mb-1 text-xs">
              <span className="text-slate-300 font-medium">🌲 Bosque (Inicial)</span>
              <span className="font-bold text-emerald-400">{totalCount} / {totalCount}</span>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-400 h-full rounded-full" style={{ width: '100%' }}></div>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">100% estudiantes</div>
          </div>

          <div className="bg-white/5 p-3.5 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between mb-1 text-xs">
              <span className="text-slate-300 font-medium">🌵 Desértico (≥4 mis.)</span>
              <span className="font-bold text-amber-400">{desertUnlockedCount} / {totalCount}</span>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-amber-400 h-full rounded-full transition-all duration-500" 
                style={{ width: `${totalCount > 0 ? (desertUnlockedCount / totalCount) * 100 : 0}%` }}
              ></div>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">{totalCount > 0 ? Math.round((desertUnlockedCount / totalCount) * 100) : 0}% estudiantes</div>
          </div>

          <div className="bg-white/5 p-3.5 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between mb-1 text-xs">
              <span className="text-slate-300 font-medium">⛰️ Montañas (≥8 mis.)</span>
              <span className="font-bold text-blue-400">{mountainUnlockedCount} / {totalCount}</span>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-blue-400 h-full rounded-full transition-all duration-500" 
                style={{ width: `${totalCount > 0 ? (mountainUnlockedCount / totalCount) * 100 : 0}%` }}
              ></div>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">{totalCount > 0 ? Math.round((mountainUnlockedCount / totalCount) * 100) : 0}% estudiantes</div>
          </div>

          <div className="bg-white/5 p-3.5 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between mb-1 text-xs">
              <span className="text-slate-300 font-medium">🏙️ Ciudad Verde (12 mis.)</span>
              <span className="font-bold text-teal-300">{cityUnlockedCount} / {totalCount}</span>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-teal-400 h-full rounded-full transition-all duration-500" 
                style={{ width: `${totalCount > 0 ? (cityUnlockedCount / totalCount) * 100 : 0}%` }}
              ></div>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">{totalCount > 0 ? Math.round((cityUnlockedCount / totalCount) * 100) : 0}% estudiantes</div>
          </div>
        </div>
      </div>

      {/* Interactive Charts Section */}
      <div className="bg-white/5 border border-white/10 p-5 sm:p-7 rounded-[32px] backdrop-blur-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-medium text-white">Gráficas de Avance y Comparativa</h3>
              <p className="text-xs text-slate-400">Visualiza el rendimiento de cada alumno y dimensión socioambiental.</p>
            </div>
          </div>

          {/* Metric Selector Tabs */}
          <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 self-start sm:self-auto">
            <button
              onClick={() => setChartMetric('missions')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                chartMetric === 'missions' ? 'bg-emerald-500 text-black shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Misiones (12)
            </button>
            <button
              onClick={() => setChartMetric('xp')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                chartMetric === 'xp' ? 'bg-purple-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              XP & Niveles
            </button>
            <button
              onClick={() => setChartMetric('dimensions')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                chartMetric === 'dimensions' ? 'bg-teal-500 text-black shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              4 Dimensiones
            </button>
          </div>
        </div>

        {/* CHART 1: MANDATORY MISSIONS PROGRESS BARS */}
        {chartMetric === 'missions' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs text-slate-400 border-b border-white/5 pb-2">
              <span>Estudiante / Docente asignado</span>
              <div className="flex gap-4 font-mono text-[11px]">
                <span className="text-slate-400">Meta: 12 Misiones</span>
                <span className="text-emerald-400 font-bold">Avance %</span>
              </div>
            </div>

            {filteredStudents.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">No se encontraron estudiantes para los filtros seleccionados.</div>
            ) : (
              <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredStudents.map((student) => {
                  const completedMap = (student.completedActivities as any) || {};
                  const count = MAIN_ACTIVITIES.filter(a => Boolean(completedMap[a.id])).length;
                  const pct = Math.round((count / 12) * 100);
                  const teacherName = student.teacherId ? teacherMap.get(student.teacherId) || 'Docente' : 'Sin asignar';

                  let barColor = 'from-amber-500 to-amber-400';
                  if (count >= 12) barColor = 'from-teal-400 via-emerald-400 to-green-300';
                  else if (count >= 8) barColor = 'from-blue-500 to-indigo-400';
                  else if (count >= 4) barColor = 'from-amber-500 to-emerald-400';

                  return (
                    <div 
                      key={student.uid || student.id}
                      onClick={() => setSelectedStudentForModal(student)}
                      className="group bg-black/20 hover:bg-white/5 border border-white/5 hover:border-emerald-500/30 p-3.5 rounded-2xl transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-2 text-xs">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center text-xs">
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-medium text-white group-hover:text-emerald-300 transition-colors">
                              {student.name}
                            </span>
                            <span className="text-slate-400 text-[10px] ml-2 hidden sm:inline">
                              ({teacherName})
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-mono text-slate-300 font-bold">
                            {count} <span className="text-[10px] font-normal text-slate-400">/ 12</span>
                          </span>
                          <span className={`font-mono font-bold text-xs ${count >= 12 ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {pct}%
                          </span>
                          <Eye className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`bg-gradient-to-r ${barColor} h-2.5 rounded-full transition-all duration-700 shadow-sm`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* CHART 2: XP AND LEVEL DISTRIBUTION */}
        {chartMetric === 'xp' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs text-slate-400 border-b border-white/5 pb-2">
              <span>Estudiante</span>
              <div className="flex gap-4 font-mono text-[11px]">
                <span className="text-purple-400">XP Acumulada</span>
                <span className="text-emerald-400">Nivel</span>
              </div>
            </div>

            {filteredStudents.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">No hay estudiantes.</div>
            ) : (
              <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredStudents.map((student) => {
                  const xp = student.xp || 0;
                  const maxXp = 2500;
                  const pct = Math.min(100, Math.round((xp / maxXp) * 100));

                  return (
                    <div 
                      key={student.uid || student.id}
                      onClick={() => setSelectedStudentForModal(student)}
                      className="group bg-black/20 hover:bg-white/5 border border-white/5 hover:border-purple-500/30 p-3.5 rounded-2xl transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-2 text-xs">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center text-xs">
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-white group-hover:text-purple-300 transition-colors">
                            {student.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-mono text-purple-300 font-bold">
                            {xp} XP
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-[10px] font-bold border border-purple-500/30">
                            Nivel {student.level || 1}
                          </span>
                          <Eye className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-400 transition-colors" />
                        </div>
                      </div>

                      {/* XP Bar */}
                      <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-2.5 rounded-full transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* CHART 3: 4 SOCIOENVIRONMENTAL DIMENSIONS AVERAGE */}
        {chartMetric === 'dimensions' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {dimensionsAverage.map((dim) => (
                <div key={dim.category} className="bg-black/20 border border-white/5 p-4 sm:p-5 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{dim.config.icon}</span>
                      <div>
                        <div className="text-sm font-medium text-white">{dim.category}</div>
                        <div className="text-[10px] text-slate-400">{dim.done} misiones completadas en total</div>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-xl ${dim.config.bgLight} ${dim.config.color} border ${dim.config.borderColor}`}>
                      {dim.percentage}%
                    </span>
                  </div>

                  <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-400 to-teal-400 h-3 rounded-full transition-all duration-700"
                      style={{ width: `${dim.percentage}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {dim.config.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Students Data Table & Management */}
      <div className="bg-white/5 border border-white/10 p-5 sm:p-7 rounded-[32px] backdrop-blur-md space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-medium text-white">Listado Detallado de Alumnos ({filteredStudents.length})</h3>
            <p className="text-xs text-slate-400">Haz clic en cualquier alumno para abrir su informe detallado individual.</p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[200px] flex-1 sm:flex-none">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar alumno..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Filter by Teacher */}
            <select
              value={selectedTeacherFilter}
              onChange={(e) => setSelectedTeacherFilter(e.target.value)}
              className="bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Todos los Docentes</option>
              <option value="unassigned">Sin Docente Asignado</option>
              {teachers.map(t => (
                <option key={t.uid || (t as any).id} value={t.uid || (t as any).id}>
                  Docente: {t.name}
                </option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="missions">Ordenar por Misiones</option>
              <option value="xp">Ordenar por XP</option>
              <option value="level">Ordenar por Nivel</option>
              <option value="streak">Ordenar por Racha</option>
              <option value="name">Ordenar por Nombre</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-medium uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">Estudiante</th>
                <th className="py-3 px-3">Docente</th>
                <th className="py-3 px-3">Misiones (12)</th>
                <th className="py-3 px-3">XP / Nivel</th>
                <th className="py-3 px-3">EcoMonedas</th>
                <th className="py-3 px-3">Mundos</th>
                <th className="py-3 px-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredStudents.map((student) => {
                const completedMap = (student.completedActivities as any) || {};
                const count = MAIN_ACTIVITIES.filter(a => Boolean(completedMap[a.id])).length;
                const teacherName = student.teacherId ? teacherMap.get(student.teacherId) || 'Docente' : 'Sin asignar';

                return (
                  <tr 
                    key={student.uid || student.id}
                    className="hover:bg-white/[0.03] transition-colors group"
                  >
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center font-bold text-white text-sm">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-white text-sm">{student.name}</div>
                          <div className="text-[11px] text-slate-400">{student.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-slate-300">
                      {teacherName}
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white">{count}/12</span>
                        <div className="w-16 bg-white/10 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${count >= 12 ? 'bg-emerald-400' : count >= 8 ? 'bg-blue-400' : 'bg-amber-400'}`}
                            style={{ width: `${Math.round((count / 12) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="text-purple-300 font-bold font-mono">{student.xp || 0} XP</span>
                      <span className="text-slate-400 text-[10px] ml-1.5">Nv. {student.level || 1}</span>
                    </td>

                    <td className="py-3.5 px-3 font-mono font-bold text-amber-300">
                      {student.coins || 0} 🪙
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="flex gap-1">
                        <span title="Bosque" className="text-sm">🌲</span>
                        <span title="Desierto" className={`text-sm ${count >= 4 ? '' : 'opacity-20 grayscale'}`}>🌵</span>
                        <span title="Montañas" className={`text-sm ${count >= 8 ? '' : 'opacity-20 grayscale'}`}>⛰️</span>
                        <span title="Ciudad Verde" className={`text-sm ${count >= 12 ? '' : 'opacity-20 grayscale'}`}>🏙️</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedStudentForModal(student)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" /> Ver Detalle
                        </button>
                        {onDeleteStudent && (
                          <button
                            onClick={() => onDeleteStudent(student.uid || student.id)}
                            className="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
                            title="Eliminar alumno"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Individual Student Detail Modal */}
      {selectedStudentForModal && (
        <StudentDetailModal
          student={selectedStudentForModal}
          teacherName={selectedStudentForModal.teacherId ? teacherMap.get(selectedStudentForModal.teacherId) : undefined}
          onClose={() => setSelectedStudentForModal(null)}
        />
      )}
    </div>
  );
}
