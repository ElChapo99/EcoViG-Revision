import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, 
  Search, 
  Plus, 
  Edit3, 
  CheckCircle2, 
  XCircle, 
  Power, 
  Users, 
  GraduationCap, 
  RefreshCw, 
  Sparkles, 
  AlertCircle, 
  X, 
  ShieldCheck, 
  Filter,
  ArrowRight,
  Database,
  Layers
} from 'lucide-react';
import { School, EducationLevel } from '../../types';
import { 
  fetchAdminSchools, 
  createSchool, 
  updateSchool, 
  migrateLegacySchools, 
  LegacyMigrationReport 
} from '../../lib/schoolService';

export default function SchoolManagement() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formLevel, setFormLevel] = useState<EducationLevel>('Secundaria');
  const [formCity, setFormCity] = useState('');
  const [formState, setFormState] = useState('Sonora');
  const [formActive, setFormActive] = useState(true);

  // Toggle Confirm Modal
  const [toggleSchoolTarget, setToggleSchoolTarget] = useState<School | null>(null);
  const [toggling, setToggling] = useState(false);

  // Migration & Audit State
  const [showMigrationModal, setShowMigrationModal] = useState(false);
  const [migrationLoading, setMigrationLoading] = useState(false);
  const [migrationReport, setMigrationReport] = useState<LegacyMigrationReport | null>(null);
  const [migrationMessage, setMigrationMessage] = useState('');
  const [applyingMigration, setApplyingMigration] = useState(false);

  useEffect(() => {
    loadSchools();
  }, []);

  const loadSchools = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminSchools();
      setSchools(data.schools);
    } catch (err) {
      console.error('Error loading schools:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setFormName('');
    setFormLevel('Secundaria');
    setFormCity('');
    setFormState('Sonora');
    setFormActive(true);
    setFormError('');
    setShowCreateModal(true);
  };

  const handleOpenEditModal = (school: School) => {
    setEditingSchool(school);
    setFormName(school.name);
    setFormLevel(school.educationLevel);
    setFormCity(school.city || '');
    setFormState(school.state || 'Sonora');
    setFormActive(school.active !== false);
    setFormError('');
  };

  const handleSaveSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || formName.trim().length < 3) {
      setFormError('El nombre de la institución debe tener al menos 3 caracteres.');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      if (editingSchool) {
        await updateSchool(editingSchool.id, {
          name: formName.trim(),
          educationLevel: formLevel,
          city: formCity.trim(),
          state: formState.trim(),
          active: formActive,
        });
        setEditingSchool(null);
      } else {
        await createSchool({
          name: formName.trim(),
          educationLevel: formLevel,
          city: formCity.trim(),
          state: formState.trim(),
          active: formActive,
        });
        setShowCreateModal(false);
      }
      await loadSchools();
    } catch (err: any) {
      console.error('Error saving school:', err);
      setFormError(err.message || 'Error al guardar la institución en el catálogo.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmToggleActive = async () => {
    if (!toggleSchoolTarget) return;
    setToggling(true);
    try {
      await updateSchool(toggleSchoolTarget.id, {
        active: !toggleSchoolTarget.active,
      });
      setToggleSchoolTarget(null);
      await loadSchools();
    } catch (err: any) {
      console.error('Error toggling school:', err);
      alert('Error: ' + (err.message || 'No se pudo cambiar el estado.'));
    } finally {
      setToggling(false);
    }
  };

  const handleRunAudit = async (apply: boolean = false) => {
    if (apply) setApplyingMigration(true);
    else setMigrationLoading(true);

    try {
      const res = await migrateLegacySchools(apply);
      setMigrationReport(res.auditReport);
      setMigrationMessage(res.message);
      if (apply) {
        await loadSchools();
      }
    } catch (err: any) {
      console.error('Error in migration tool:', err);
      setMigrationMessage('Error al ejecutar la auditoría: ' + (err.message || 'Error desconocido'));
    } finally {
      setMigrationLoading(false);
      setApplyingMigration(false);
    }
  };

  const filteredSchools = useMemo(() => {
    return schools.filter(s => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = (s.name || '').toLowerCase().includes(q);
        const matchCity = (s.city || '').toLowerCase().includes(q);
        const matchId = (s.id || '').toLowerCase().includes(q);
        if (!matchName && !matchCity && !matchId) return false;
      }

      if (selectedLevelFilter !== 'all' && s.educationLevel !== selectedLevelFilter) {
        return false;
      }

      if (selectedStatusFilter === 'active' && !s.active) return false;
      if (selectedStatusFilter === 'inactive' && s.active) return false;

      return true;
    });
  }, [schools, searchQuery, selectedLevelFilter, selectedStatusFilter]);

  const totalActive = schools.filter(s => s.active).length;
  const totalInactive = schools.length - totalActive;

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/5 border border-white/10 p-6 sm:p-7 rounded-[32px] backdrop-blur-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30">
              Catálogo Oficial
            </span>
            <span className="text-xs text-slate-400">
              {schools.length} instituciones registradas ({totalActive} activas, {totalInactive} inactivas)
            </span>
          </div>
          <h2 className="text-2xl font-light text-white">Gestión de Escuelas Oficiales</h2>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Centraliza el catálogo institucional para evitar nombres libres duplicados. Los estudiantes y maestros seleccionan una escuela oficial mediante su identificador único <code className="font-mono text-emerald-400">schoolId</code>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start md:self-auto">
          <button
            onClick={() => {
              setShowMigrationModal(true);
              handleRunAudit(false);
            }}
            className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white rounded-2xl text-xs font-semibold flex items-center gap-2 transition-all"
            title="Auditoría de usuarios legacy sin schoolId"
          >
            <Database className="w-4 h-4 text-emerald-400" />
            <span>Auditoría Legacy</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-black font-bold text-xs rounded-2xl flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(52,211,153,0.3)]"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nueva Escuela</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col lg:flex-row gap-3 bg-black/30 border border-white/10 p-4 rounded-2xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, municipio o ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap gap-2.5">
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-emerald-400" />
            <select
              value={selectedLevelFilter}
              onChange={(e) => setSelectedLevelFilter(e.target.value)}
              aria-label="Filtrar por nivel educativo"
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#0b131e] text-white">Todos los niveles</option>
              <option value="Secundaria" className="bg-[#0b131e] text-white">Secundaria</option>
              <option value="Bachillerato" className="bg-[#0b131e] text-white">Bachillerato</option>
              <option value="Universidad" className="bg-[#0b131e] text-white">Universidad</option>
              <option value="Otro" className="bg-[#0b131e] text-white">Otro</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-xs text-slate-300">
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              aria-label="Filtrar por estado activo"
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#0b131e] text-white">Todos los estados</option>
              <option value="active" className="bg-[#0b131e] text-white">Solo Activas</option>
              <option value="inactive" className="bg-[#0b131e] text-white">Solo Inactivas</option>
            </select>
          </div>

          <button
            onClick={loadSchools}
            className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-300 hover:text-white transition-colors"
            title="Recargar catálogo"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Schools List Grid / Cards */}
      {loading ? (
        <div className="bg-white/5 border border-white/10 p-12 rounded-[32px] text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Cargando catálogo oficial de escuelas...
        </div>
      ) : filteredSchools.length === 0 ? (
        <div className="bg-white/5 border border-white/10 p-12 rounded-[32px] text-center text-slate-400 space-y-3">
          <Building2 className="w-12 h-12 text-slate-600 mx-auto" />
          <div className="text-white font-medium">No se encontraron escuelas con los filtros aplicados</div>
          <p className="text-xs text-slate-500">Prueba ajustando el término de búsqueda o añade una nueva institución.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSchools.map((school) => {
            const isActive = school.active !== false;

            return (
              <div 
                key={school.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                  isActive 
                    ? 'bg-black/30 border-white/10 hover:border-emerald-500/30' 
                    : 'bg-black/20 border-red-500/20 opacity-75'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        isActive 
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                          : 'bg-red-500/20 text-red-300 border-red-500/30'
                      }`}>
                        {isActive ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white line-clamp-2 leading-tight">
                      {school.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-300 text-[10px] font-medium border border-blue-500/20">
                        {school.educationLevel || 'Secundaria'}
                      </span>
                      {(school.city || school.state) && (
                        <span className="text-xs text-slate-400">
                          {school.city ? `${school.city}, ` : ''}{school.state || 'Sonora'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-[11px] font-mono text-slate-500 bg-white/[0.03] px-2.5 py-1.5 rounded-lg border border-white/5 truncate">
                    ID: <span className="text-slate-300">{school.id}</span>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <div className="flex items-center gap-1" title="Alumnos vinculados">
                      <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="font-bold text-white">{school.studentCount || 0}</span>
                      <span className="text-[10px]">alumnos</span>
                    </div>
                    <div className="flex items-center gap-1" title="Docentes vinculados">
                      <Users className="w-3.5 h-3.5 text-blue-400" />
                      <span className="font-bold text-white">{school.teacherCount || 0}</span>
                      <span className="text-[10px]">docentes</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditModal(school)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-colors border border-white/10"
                      title="Editar datos de la escuela"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setToggleSchoolTarget(school)}
                      className={`p-1.5 rounded-lg transition-colors border ${
                        isActive 
                          ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30' 
                          : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      }`}
                      title={isActive ? 'Desactivar escuela' : 'Reactivar escuela'}
                    >
                      <Power className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT SCHOOL MODAL */}
      {(showCreateModal || editingSchool) && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0b131e] border border-white/15 p-6 sm:p-7 rounded-[32px] max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">
                    {editingSchool ? 'Editar Institución Oficial' : 'Registrar Nueva Escuela Oficial'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {editingSchool ? `Actualizando ID: ${editingSchool.id}` : 'Incorpora una institución al catálogo oficial de EcoViG'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingSchool(null);
                }}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveSchool} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Nombre Oficial de la Escuela *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Escuela Secundaria General No. 1"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  El sistema normalizará automáticamente el nombre para prevenir duplicados accidentales.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">
                    Nivel Educativo *
                  </label>
                  <select
                    value={formLevel}
                    onChange={(e) => setFormLevel(e.target.value as EducationLevel)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500 text-sm"
                  >
                    <option value="Secundaria" className="bg-[#0b131e] text-white">Secundaria</option>
                    <option value="Bachillerato" className="bg-[#0b131e] text-white">Bachillerato</option>
                    <option value="Universidad" className="bg-[#0b131e] text-white">Universidad</option>
                    <option value="Otro" className="bg-[#0b131e] text-white">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">
                    Municipio / Localidad
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Hermosillo, Caborca, Nogales"
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Estado
                </label>
                <input
                  type="text"
                  placeholder="Ej. Sonora"
                  value={formState}
                  onChange={(e) => setFormState(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
                />
              </div>

              <div className="bg-white/5 p-3.5 rounded-xl border border-white/10 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Estado Activo</div>
                  <div className="text-[11px] text-slate-400">
                    Las escuelas inactivas no aparecen para nuevas selecciones pero preservan su historial.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setFormActive(!formActive)}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                    formActive ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      formActive ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingSchool(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-black font-bold transition-all shadow-[0_0_15px_rgba(52,211,153,0.3)] disabled:opacity-50"
                >
                  {submitting ? 'Guardando...' : editingSchool ? 'Guardar Cambios' : 'Registrar Escuela'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOGGLE ACTIVE CONFIRMATION MODAL */}
      {toggleSchoolTarget && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0b131e] border border-white/15 p-6 rounded-[28px] max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Power className={`w-5 h-5 ${toggleSchoolTarget.active ? 'text-amber-400' : 'text-emerald-400'}`} />
              {toggleSchoolTarget.active ? '¿Desactivar institución?' : '¿Reactivar institución?'}
            </h3>

            <p className="text-slate-300 text-xs leading-relaxed">
              {toggleSchoolTarget.active ? (
                <>
                  Estás a punto de desactivar <strong>"{toggleSchoolTarget.name}"</strong>. 
                  <br /><br />
                  <span className="text-emerald-300">
                    ✓ Todos los estudiantes ({toggleSchoolTarget.studentCount || 0}) y docentes ({toggleSchoolTarget.teacherCount || 0}) vinculados conservarán intacto su expediente e historial.
                  </span>
                  <br /><br />
                  La escuela no se eliminará físicamente, pero ya no aparecerá en selectores para nuevos registros.
                </>
              ) : (
                <>
                  ¿Deseas reactivar <strong>"{toggleSchoolTarget.name}"</strong> para que vuelva a estar disponible en los selectores de registro y perfil?
                </>
              )}
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setToggleSchoolTarget(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmToggleActive}
                disabled={toggling}
                className={`px-5 py-2 rounded-xl text-black font-bold text-xs transition-all ${
                  toggleSchoolTarget.active 
                    ? 'bg-amber-400 hover:bg-amber-300' 
                    : 'bg-emerald-400 hover:bg-emerald-300'
                }`}
              >
                {toggling ? 'Procesando...' : toggleSchoolTarget.active ? 'Sí, desactivar' : 'Sí, reactivar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LEGACY MIGRATION & AUDIT MODAL */}
      {showMigrationModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#0b131e] border border-white/15 p-6 sm:p-7 rounded-[32px] max-w-2xl w-full shadow-2xl space-y-5 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">Auditoría & Migración No Destructiva</h3>
                  <p className="text-[11px] text-slate-400">
                    Compara usuarios con nombres de escuela legacy y los vincula al catálogo oficial por <code className="text-emerald-400">schoolId</code>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowMigrationModal(false)}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 pr-1 text-xs">
              {migrationMessage && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 p-3.5 rounded-xl">
                  {migrationMessage}
                </div>
              )}

              {migrationLoading ? (
                <div className="py-12 text-center text-slate-400">
                  <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  Auditando usuarios y escuelas...
                </div>
              ) : migrationReport ? (
                <div className="space-y-4">
                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Auditados</div>
                      <div className="text-lg font-bold text-white mt-0.5">{migrationReport.totalUsersAudited}</div>
                    </div>

                    <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 text-center">
                      <div className="text-[10px] text-emerald-400 uppercase font-bold">Coincidencias</div>
                      <div className="text-lg font-bold text-emerald-300 mt-0.5">{migrationReport.exactMatchesCount}</div>
                    </div>

                    <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 text-center">
                      <div className="text-[10px] text-amber-400 uppercase font-bold">Ambiguos</div>
                      <div className="text-lg font-bold text-amber-300 mt-0.5">{migrationReport.ambiguousMatchesCount}</div>
                    </div>

                    <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Sin asignar</div>
                      <div className="text-lg font-bold text-slate-400 mt-0.5">{migrationReport.unassignedCount}</div>
                    </div>
                  </div>

                  {/* Exact matches list */}
                  {migrationReport.exactMatches.length > 0 && (
                    <div className="space-y-2">
                      <div className="font-bold text-white flex items-center justify-between">
                        <span>Coincidencias Detectadas ({migrationReport.exactMatches.length})</span>
                        <span className="text-[10px] text-emerald-400 font-normal">Listas para auto-vincular</span>
                      </div>

                      <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {migrationReport.exactMatches.map((m, i) => (
                          <div key={i} className="p-2.5 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between gap-2">
                            <div>
                              <div className="font-medium text-white">{m.name} ({m.role})</div>
                              <div className="text-[10px] text-slate-400">Texto legacy: "{m.legacyName}"</div>
                            </div>
                            <div className="text-right">
                              <span className="text-emerald-400 font-mono text-[10px]">➔ {m.matchedSchoolName}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ambiguous matches */}
                  {migrationReport.ambiguousMatches.length > 0 && (
                    <div className="space-y-2">
                      <div className="font-bold text-amber-300">
                        Nombres Ambiguos o No Coincidentes ({migrationReport.ambiguousMatches.length})
                      </div>
                      <div className="space-y-1.5 max-h-36 overflow-y-auto">
                        {migrationReport.ambiguousMatches.map((m, i) => (
                          <div key={i} className="p-2 rounded-lg bg-amber-500/5 border border-amber-500/20 text-[11px]">
                            <span className="font-semibold text-white">{m.name}:</span> texto "{m.legacyName}" no coincide exactamente con ninguna escuela activa.
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            <div className="border-t border-white/10 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => handleRunAudit(false)}
                disabled={migrationLoading || applyingMigration}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${migrationLoading ? 'animate-spin' : ''}`} />
                Re-auditar
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setShowMigrationModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-slate-300 text-xs font-medium"
                >
                  Cerrar
                </button>

                {migrationReport && migrationReport.exactMatchesCount > 0 && (
                  <button
                    type="button"
                    onClick={() => handleRunAudit(true)}
                    disabled={applyingMigration}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 text-black font-bold text-xs shadow-lg flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    {applyingMigration ? 'Vinculando...' : `Vincular ${migrationReport.exactMatchesCount} Coincidencias`}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
