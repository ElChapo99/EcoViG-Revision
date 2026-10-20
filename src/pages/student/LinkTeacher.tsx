import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { KeyRound, Building2, CheckCircle2, AlertCircle, RefreshCw, LogOut, ArrowRight, Edit3 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { OFFICIAL_STUDENT_SCHOOLS } from '../../data/officialSchools';
import { getStudentOnboardingState } from '../../lib/onboardingGuard';
import { apiFetch, safeReadJson } from '../../lib/apiClient';

export default function LinkTeacher() {
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();

  const [linkCode, setLinkCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // School change modal state (allowed only while not yet linked)
  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [selectedSchoolId, setSelectedSchoolId] = useState(user?.schoolId || '');
  const [schoolUpdating, setSchoolUpdating] = useState(false);
  const [schoolError, setSchoolError] = useState('');

  const onboardingState = getStudentOnboardingState(user);

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'student' || onboardingState === 'READY') {
      navigate('/dashboard', { replace: true });
    } else if (onboardingState === 'NEEDS_SCHOOL') {
      navigate('/select-school', { replace: true });
    }
  }, [user, onboardingState, navigate]);

  if (!user) return null;

  const currentSchool = OFFICIAL_STUDENT_SCHOOLS.find(s => s.id === user.schoolId) || 
    (user.schoolName ? { id: user.schoolId || '', name: user.schoolName, educationLevel: 'Secundaria' } : null);

  const handleLinkTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    const cleanCode = linkCode.trim().toUpperCase();
    if (!cleanCode || cleanCode.length < 3) {
      setError('Por favor ingresa el código del maestro.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const token = await (await import('../../lib/firebase')).auth.currentUser?.getIdToken();
      if (!token) {
        throw new Error('Sesión no disponible. Inicia sesión nuevamente.');
      }

      const res = await apiFetch('/api/user/link-teacher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ linkCode: cleanCode })
      });

      const data = await safeReadJson<any>(res, 'El código ingresado no es válido. Verifícalo con tu maestro e inténtalo nuevamente.');

      setSuccessMsg('¡Listo! Tu cuenta quedó vinculada correctamente.');
      await refreshUser();

      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1200);
    } catch (err: any) {
      console.error('Error linking teacher:', err);
      setError(err.message || 'El código ingresado no es válido. Verifícalo con tu maestro e inténtalo nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchoolId) {
      setSchoolError('Selecciona una institución de la lista.');
      return;
    }

    setSchoolUpdating(true);
    setSchoolError('');

    try {
      const token = await (await import('../../lib/firebase')).auth.currentUser?.getIdToken();
      if (!token) throw new Error('Sesión expirada.');

      const res = await apiFetch('/api/user/school', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ schoolId: selectedSchoolId })
      });

      const data = await safeReadJson<any>(res, 'Error al asignar la escuela.');

      await refreshUser();
      setShowSchoolModal(false);
    } catch (err: any) {
      setSchoolError(err.message || 'Error al actualizar la escuela.');
    } finally {
      setSchoolUpdating(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative z-10 font-sans text-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg bg-[#0c1322]/90 border border-white/15 rounded-[40px] shadow-2xl backdrop-blur-2xl p-6 sm:p-10 relative overflow-hidden"
      >
        {/* Top Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-[0_0_15px_rgba(52,211,153,0.4)] border border-emerald-500/30 flex items-center justify-center bg-black/40">
              <img 
                src="/ecovig-logo.svg" 
                alt="EcoViG" 
                className="w-full h-full object-cover select-none pointer-events-none" 
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="text-xl font-bold tracking-tight">
              <span className="text-white">Eco</span><span className="text-emerald-400">ViG</span>
            </span>
          </div>

          <button
            onClick={() => logout()}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 transition-colors"
            title="Cerrar sesión"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar sesión</span>
          </button>
        </div>

        {/* Title & Onboarding Explanation */}
        <div className="text-center space-y-2 mb-8">
          <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold uppercase tracking-wider">
            Paso obligatorio de registro
          </span>
          <h1 className="text-2xl sm:text-3xl font-light text-white tracking-tight">
            Vincúlate con tu maestro
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
            Para comenzar a utilizar EcoViG, ingresa el código proporcionado por tu maestro para tu grupo escolar.
          </p>
        </div>

        {/* Selected School Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 relative group">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Escuela seleccionada</div>
                <div className="text-xs sm:text-sm font-semibold text-white mt-0.5">
                  {currentSchool ? currentSchool.name : 'Sin escuela asignada'}
                </div>
                <div className="text-[11px] text-emerald-400/90 font-medium">Secundaria Oficial</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedSchoolId(user.schoolId || '');
                setSchoolError('');
                setShowSchoolModal(true);
              }}
              className="text-[11px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 font-medium bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-xl border border-white/10 transition-colors shrink-0"
            >
              <Edit3 className="w-3 h-3" /> Cambiar
            </button>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-4 rounded-2xl text-xs flex items-start gap-2.5 mb-6">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 p-4 rounded-2xl text-xs flex items-center gap-2.5 mb-6">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-semibold text-sm">{successMsg}</span>
          </div>
        )}

        {/* Form to Input Teacher Link Code */}
        <form onSubmit={handleLinkTeacher} className="space-y-6">
          <div className="space-y-2 text-left">
            <label className="text-xs uppercase font-bold text-slate-300 tracking-wider block">
              Código del maestro
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <KeyRound className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                required
                disabled={loading || Boolean(successMsg)}
                value={linkCode}
                onChange={(e) => setLinkCode(e.target.value.toUpperCase())}
                placeholder="ECO-XXXX"
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-black/40 border border-white/20 text-white placeholder-slate-500 font-mono text-lg tracking-widest uppercase focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-center"
              />
            </div>
            <p className="text-[11px] text-slate-400 text-center">
              Ejemplo: <span className="font-mono text-emerald-400 font-bold">ECO-1234</span> o similar. Pídeselo a tu profesor(a).
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || Boolean(successMsg) || !linkCode.trim()}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-black py-4 rounded-2xl font-bold shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Verificando código...
              </>
            ) : (
              <>
                Vincularme con mi maestro <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <p className="text-[11px] text-slate-400">
            ¿Tienes dudas con tu código? Acércate a tu docente de grupo para que te proporcione su código de enlace de EcoViG.
          </p>
        </div>
      </motion.div>

      {/* MODAL: CORREGIR ESCUELA ANTES DE VINCULAR */}
      <AnimatePresence>
        {showSchoolModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0b101b] border border-white/15 rounded-[32px] max-w-md w-full p-6 sm:p-8 relative shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Building2 className="w-5 h-5" />
                  <h3 className="text-lg font-medium text-white">Selecciona tu escuela</h3>
                </div>
                {user.schoolId && (
                  <button
                    onClick={() => setShowSchoolModal(false)}
                    className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-white/10"
                  >
                    ✕
                  </button>
                )}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Elige la institución secundaria oficial a la que perteneces para este proyecto de EcoViG:
              </p>

              {schoolError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-3 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{schoolError}</span>
                </div>
              )}

              <form onSubmit={handleUpdateSchool} className="space-y-4">
                <div className="space-y-2">
                  {OFFICIAL_STUDENT_SCHOOLS.map(sch => (
                    <label
                      key={sch.id}
                      className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        selectedSchoolId === sch.id
                          ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-[0_0_15px_rgba(52,211,153,0.2)]'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      <input
                        type="radio"
                        name="schoolSelect"
                        value={sch.id}
                        checked={selectedSchoolId === sch.id}
                        onChange={(e) => setSelectedSchoolId(e.target.value)}
                        className="mt-1 accent-emerald-500"
                      />
                      <div className="text-left">
                        <div className="text-xs font-semibold text-white">{sch.name}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{sch.city}, {sch.state} • {sch.educationLevel}</div>
                      </div>
                    </label>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={schoolUpdating || !selectedSchoolId}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-black py-3.5 rounded-2xl font-bold transition-all text-xs uppercase tracking-wider disabled:opacity-50"
                >
                  {schoolUpdating ? 'Guardando...' : 'Confirmar Escuela'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
