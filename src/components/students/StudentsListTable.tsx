import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Users, 
  Building2, 
  Target, 
  Compass, 
  Award, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  CheckCircle2, 
  Sparkles, 
  Zap, 
  ArrowUpDown, 
  Flame,
  ShieldAlert,
  GraduationCap
} from 'lucide-react';
import { StudentSummary, StudentOverallStatus } from '../../lib/studentManagementService';
import { MAIN_ACTIVITIES } from '../../data/surveyData';
import StudentDetailDrawer from './StudentDetailDrawer';

interface StudentsListTableProps {
  students: StudentSummary[];
  loading?: boolean;
  mode: 'teacher' | 'admin';
  teacherName?: string;
  teachersList?: { uid: string; name: string }[];
  onRefresh?: () => void;
}

export default function StudentsListTable({
  students,
  loading = false,
  mode,
  teacherName,
  teachersList = [],
  onRefresh,
}: StudentsListTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSchoolFilter, setSelectedSchoolFilter] = useState('all');
  const [selectedProgressFilter, setSelectedProgressFilter] = useState<string>('all');
  const [selectedFinalSurveyFilter, setSelectedFinalSurveyFilter] = useState<string>('all');
  const [selectedTeacherFilter, setSelectedTeacherFilter] = useState<string>('all');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('all');

  const [sortBy, setSortBy] = useState<'name' | 'progress' | 'xp' | 'updatedAt'>('progress');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [selectedStudentIdForDetail, setSelectedStudentIdForDetail] = useState<string | null>(null);

  // Extract unique schools
  const availableSchools = useMemo(() => {
    const set = new Set<string>();
    students.forEach(s => {
      if (s.schoolName) set.add(s.schoolName);
    });
    return Array.from(set);
  }, [students]);

  // Extract unique groups
  const availableGroups = useMemo(() => {
    const set = new Set<string>();
    students.forEach(s => {
      if (s.group) set.add(s.group);
    });
    return Array.from(set);
  }, [students]);

  // Filter and sort students
  const filteredStudents = useMemo(() => {
    return students
      .filter(s => {
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = (s.name || '').toLowerCase().includes(q);
          const matchEmail = (s.email || '').toLowerCase().includes(q);
          const matchSchool = (s.schoolName || '').toLowerCase().includes(q);
          const matchId = (s.uid || s.id || '').toLowerCase().includes(q);
          if (!matchName && !matchEmail && !matchSchool && !matchId) return false;
        }

        // School filter
        if (selectedSchoolFilter !== 'all' && s.schoolName !== selectedSchoolFilter) {
          return false;
        }

        // Teacher filter (for admin)
        if (mode === 'admin' && selectedTeacherFilter !== 'all') {
          if (selectedTeacherFilter === 'unassigned') {
            if (s.teacherId) return false;
          } else {
            if (s.teacherId !== selectedTeacherFilter) return false;
          }
        }

        // Group filter
        if (selectedGroupFilter !== 'all' && s.group !== selectedGroupFilter) {
          return false;
        }

        // Progress filter
        if (selectedProgressFilter !== 'all') {
          if (selectedProgressFilter === 'pending_initial' && s.overallStatus !== 'pending_initial') return false;
          if (selectedProgressFilter === 'in_progress' && s.overallStatus !== 'in_progress') return false;
          if (selectedProgressFilter === 'final_available' && s.overallStatus !== 'final_available') return false;
          if (selectedProgressFilter === 'completed' && s.overallStatus !== 'completed') return false;
        }

        // Final survey filter
        if (selectedFinalSurveyFilter !== 'all') {
          if (selectedFinalSurveyFilter === 'completed' && !s.finalSurveyCompleted) return false;
          if (selectedFinalSurveyFilter === 'available' && (s.finalSurveyCompleted || s.completedMandatoryCount < s.totalMandatoryCount)) return false;
          if (selectedFinalSurveyFilter === 'locked' && (s.finalSurveyCompleted || s.completedMandatoryCount >= s.totalMandatoryCount)) return false;
        }

        return true;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortBy === 'name') {
          comp = (a.name || '').localeCompare(b.name || '');
        } else if (sortBy === 'progress') {
          comp = a.completedMandatoryCount - b.completedMandatoryCount;
        } else if (sortBy === 'xp') {
          comp = a.xp - b.xp;
        } else if (sortBy === 'updatedAt') {
          comp = a.updatedAt - b.updatedAt;
        }
        return sortOrder === 'desc' ? -comp : comp;
      });
  }, [
    students,
    searchQuery,
    selectedSchoolFilter,
    selectedTeacherFilter,
    selectedGroupFilter,
    selectedProgressFilter,
    selectedFinalSurveyFilter,
    sortBy,
    sortOrder,
    mode,
  ]);

  // Pagination calculation
  const totalItems = filteredStudents.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + pageSize);

  const getStatusBadge = (status: StudentOverallStatus) => {
    switch (status) {
      case 'pending_initial':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 rounded-full">
            <Compass className="w-3 h-3 text-amber-400" /> Pendiente de diagnóstico
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-300 bg-teal-500/15 border border-teal-500/30 px-2.5 py-1 rounded-full">
            <Target className="w-3 h-3 text-teal-400" /> Actividades en progreso
          </span>
        );
      case 'final_available':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-full animate-pulse">
            <Sparkles className="w-3 h-3 text-emerald-400" /> Encuesta final disponible
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-1 rounded-full">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Proceso completado
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 font-sans text-white">
      {/* Search & Filter Header Bar */}
      <div className="bg-white/5 border border-white/10 p-5 rounded-[28px] backdrop-blur-md space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar estudiante por nombre, correo o escuela..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-black/30 border border-white/10 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
            />
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-2 text-xs font-medium text-slate-300 self-end md:self-center shrink-0">
            <span className="bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
              Mostrando <strong className="text-emerald-400 font-mono">{filteredStudents.length}</strong> de <span className="font-mono">{students.length}</span> estudiantes
            </span>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-1">
          {/* School filter */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Escuela</label>
            <select
              value={selectedSchoolFilter}
              onChange={(e) => {
                setSelectedSchoolFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-black/30 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Todas las escuelas</option>
              {availableSchools.map(sch => (
                <option key={sch} value={sch}>{sch}</option>
              ))}
            </select>
          </div>

          {/* Progress state filter */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Estado General</label>
            <select
              value={selectedProgressFilter}
              onChange={(e) => {
                setSelectedProgressFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-black/30 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Todos los estados</option>
              <option value="pending_initial">Pendiente diagnóstico</option>
              <option value="in_progress">En progreso</option>
              <option value="final_available">Encuesta disponible</option>
              <option value="completed">Completado</option>
            </select>
          </div>

          {/* Final survey filter */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Encuesta Final</label>
            <select
              value={selectedFinalSurveyFilter}
              onChange={(e) => {
                setSelectedFinalSurveyFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-black/30 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Todas</option>
              <option value="completed">Completada</option>
              <option value="available">Disponible</option>
              <option value="locked">Bloqueada</option>
            </select>
          </div>

          {/* Group filter if available */}
          {availableGroups.length > 0 && (
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Grupo</label>
              <select
                value={selectedGroupFilter}
                onChange={(e) => {
                  setSelectedGroupFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="all">Todos los grupos</option>
                {availableGroups.map(grp => (
                  <option key={grp} value={grp}>Grupo {grp}</option>
                ))}
              </select>
            </div>
          )}

          {/* Teacher filter (in Admin mode) */}
          {mode === 'admin' && teachersList.length > 0 && (
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Docente Asignado</label>
              <select
                value={selectedTeacherFilter}
                onChange={(e) => {
                  setSelectedTeacherFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="all">Todos los docentes</option>
                <option value="unassigned">Sin docente asignado</option>
                {teachersList.map(t => (
                  <option key={t.uid} value={t.uid}>{t.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Sort By selector */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Ordenar por</label>
            <div className="flex gap-1">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="flex-1 bg-black/30 border border-white/10 rounded-xl px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="progress">Progreso</option>
                <option value="name">Nombre</option>
                <option value="xp">Nivel / XP</option>
              </select>
              <button
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="px-2.5 bg-black/30 border border-white/10 rounded-xl text-xs text-slate-300 hover:text-white"
                title="Cambiar orden ascendente/descendente"
              >
                {sortOrder === 'desc' ? '↓' : '↑'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Students List Content */}
      {loading ? (
        <div className="bg-white/5 border border-white/10 p-12 rounded-[32px] text-center text-slate-400 space-y-3">
          <div className="w-10 h-10 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm">Cargando listado de estudiantes...</p>
        </div>
      ) : paginatedStudents.length === 0 ? (
        <div className="bg-white/5 border border-white/10 p-12 rounded-[32px] text-center text-slate-400 space-y-3">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto text-3xl">
            🌱
          </div>
          <h3 className="text-lg font-medium text-white">No hay estudiantes asociados actualmente</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {searchQuery || selectedSchoolFilter !== 'all' || selectedProgressFilter !== 'all'
              ? 'No se encontraron estudiantes que coincidan con los filtros seleccionados.'
              : 'Comparte tu código de vinculación con tus alumnos para comenzar su seguimiento.'}
          </p>
        </div>
      ) : (
        <>
          {/* DESKTOP TABLE VIEW */}
          <div className="hidden md:block bg-white/5 border border-white/10 rounded-[32px] overflow-hidden backdrop-blur-md">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-black/30 text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-white/10">
                <tr>
                  <th className="py-4 px-5">Estudiante</th>
                  <th className="py-4 px-4">Escuela</th>
                  <th className="py-4 px-4 text-center">Progreso Misiones</th>
                  <th className="py-4 px-3 text-center">Diagnóstico</th>
                  <th className="py-4 px-3 text-center">Encuesta Final</th>
                  <th className="py-4 px-3 text-center">Nivel</th>
                  <th className="py-4 px-4">Estado General</th>
                  <th className="py-4 px-5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paginatedStudents.map((s) => {
                  const progressPct = Math.round((s.completedMandatoryCount / s.totalMandatoryCount) * 100);

                  return (
                    <tr 
                      key={s.uid}
                      className="hover:bg-white/[0.03] transition-colors group"
                    >
                      {/* Name & Email */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">
                            {s.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-white group-hover:text-emerald-300 transition-colors truncate">
                              {s.name}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">
                              {s.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* School & Grade */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-300 truncate max-w-[160px] font-medium">
                          {s.schoolName}
                        </div>
                        {(s.grade || s.group) && (
                          <div className="text-[10px] text-emerald-400/80">
                            {s.grade ? `${s.grade}` : ''} {s.group ? `Grp ${s.group}` : ''}
                          </div>
                        )}
                      </td>

                      {/* Missions Progress */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex flex-col items-center gap-1 min-w-[90px]">
                          <span className="font-mono font-bold text-white text-xs">
                            {s.completedMandatoryCount} <span className="text-slate-400 font-normal">/ {s.totalMandatoryCount}</span>
                          </span>
                          <div className="w-16 bg-white/10 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className="bg-emerald-400 h-1.5 rounded-full"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Initial Survey */}
                      <td className="py-3.5 px-3 text-center">
                        {s.initialSurveyCompleted ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" /> Realizada
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">
                            Pendiente
                          </span>
                        )}
                      </td>

                      {/* Final Survey */}
                      <td className="py-3.5 px-3 text-center">
                        {s.finalSurveyCompleted ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" /> Realizada
                          </span>
                        ) : s.completedMandatoryCount >= s.totalMandatoryCount ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-300 bg-teal-500/20 px-2 py-0.5 rounded-full border border-teal-500/30">
                            Disponible
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">
                            Bloqueada
                          </span>
                        )}
                      </td>

                      {/* Level */}
                      <td className="py-3.5 px-3 text-center">
                        <span className="font-mono text-purple-300 font-bold text-xs">
                          Niv. {s.level}
                        </span>
                      </td>

                      {/* Derived Status */}
                      <td className="py-3.5 px-4">
                        {getStatusBadge(s.overallStatus)}
                      </td>

                      {/* Action Button */}
                      <td className="py-3.5 px-5 text-right">
                        <button
                          onClick={() => setSelectedStudentIdForDetail(s.uid)}
                          className="px-3.5 py-1.5 bg-white/10 hover:bg-emerald-500 hover:text-black font-semibold rounded-xl text-xs text-white transition-all flex items-center gap-1 ml-auto border border-white/10 shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver expediente</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS VIEW */}
          <div className="md:hidden space-y-3">
            {paginatedStudents.map((s) => {
              const progressPct = Math.round((s.completedMandatoryCount / s.totalMandatoryCount) * 100);

              return (
                <div
                  key={s.uid}
                  className="p-5 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md space-y-3.5"
                >
                  {/* Top Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-lg shrink-0">
                        {s.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-base font-medium text-white">{s.name}</h4>
                        <div className="text-xs text-slate-400">
                          {s.schoolName} {(s.grade || s.group) ? `• ${s.grade || ''} ${s.group ? `Grp ${s.group}` : ''}` : ''}
                        </div>
                      </div>
                    </div>

                    <span className="text-xs font-mono font-bold text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-lg border border-purple-500/30">
                      Nivel {s.level}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {getStatusBadge(s.overallStatus)}
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-3 gap-2 pt-1 text-center bg-black/20 p-2.5 rounded-2xl border border-white/5">
                    <div>
                      <div className="text-[10px] text-slate-400">Misiones</div>
                      <div className="font-mono font-bold text-emerald-400 text-xs mt-0.5">
                        {s.completedMandatoryCount} / {s.totalMandatoryCount}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">Inicial</div>
                      <div className="text-[11px] font-bold mt-0.5">
                        {s.initialSurveyCompleted ? '✓ Sí' : '—'}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">Final</div>
                      <div className="text-[11px] font-bold mt-0.5">
                        {s.finalSurveyCompleted ? '✓ Sí' : s.completedMandatoryCount >= s.totalMandatoryCount ? 'Listo' : '🔒'}
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => setSelectedStudentIdForDetail(s.uid)}
                    className="w-full py-2.5 bg-white/10 hover:bg-emerald-500 hover:text-black font-semibold rounded-2xl text-xs text-white transition-all flex items-center justify-center gap-1.5 border border-white/10"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ver expediente completo</span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="text-xs text-slate-400 font-medium">
                Página <strong className="text-white">{validCurrentPage}</strong> de <strong className="text-white">{totalPages}</strong> ({totalItems} estudiantes)
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={validCurrentPage <= 1}
                  className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" /> Anterior
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = i + 1;
                    if (totalPages > 5 && validCurrentPage > 3) {
                      pageNum = validCurrentPage - 2 + i;
                      if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded-xl text-xs font-mono font-bold transition-all ${
                          validCurrentPage === pageNum
                            ? 'bg-emerald-500 text-black shadow-sm'
                            : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={validCurrentPage >= totalPages}
                  className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 transition-all"
                >
                  Siguiente <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Detail Drawer Modal */}
      {selectedStudentIdForDetail && (
        <StudentDetailDrawer
          studentId={selectedStudentIdForDetail}
          mode={mode}
          teacherName={teacherName}
          onClose={() => setSelectedStudentIdForDetail(null)}
        />
      )}
    </div>
  );
}
