import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { Building2, CheckCircle2, AlertCircle, RefreshCw, LogOut, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { OFFICIAL_STUDENT_SCHOOLS } from '../../data/officialSchools';
import { getStudentOnboardingState } from '../../lib/onboardingGuard';
import { apiFetch, safeReadJson } from '../../lib/apiClient';

export default function SelectSchool() {
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();

  const [selectedSchoolId, setSelectedSchoolId] = useState(user?.schoolId || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const onboardingState = getStudentOnboardingState(user);

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'student' || onboardingState === 'READY') {
      navigate('/dashboard', { replace: true });
    } else if (onboardingState === 'NEEDS_TEACHER') {
      navigate('/link-teacher', { replace: true });
    }
  }, [user, onboardingState, navigate]);

  if (!user) return null;

  const handleSaveSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchoolId) {
      setError('Por favor selecciona una institución de la lista.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const token = await (await import('../../lib/firebase')).auth.currentUser?.getIdToken();
      if (!token) throw new Error('Sesión expirada. Inicia sesión nuevamente.');

      const res = await apiFetch('/api/user/school', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ schoolId: selectedSchoolId })
      });

      const data = await safeReadJson<any>(res, 'Error al asignar la escuela.');

      setSuccessMsg('Escuela asignada correctamente.');
      await refreshUser();

      setTimeout(() => {
        navigate('/link-teacher', { replace: true });
      }, 800);
    } catch (err: any) {
      setError(err.message || 'Error al guardar la escuela.');
    } finally {
      setLoading(false);
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
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 transition-colors cursor-pointer"
            title="Cerrar sesión"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar sesión</span>
          </button>
        </div>

        {/* Title & Explanation */}
        <div className="text-center space-y-2 mb-8">
          <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold uppercase tracking-wider">
            Paso 1 de 2: Escuela Secundaria
          </span>
          <h1 className="text-2xl sm:text-3xl font-light text-white tracking-tight">
            Selecciona tu escuela oficial
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
            Elige la secundaria a la que perteneces para este proyecto de educación y acción socioambiental:
          </p>
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

        {/* Form */}
        <form onSubmit={handleSaveSchool} className="space-y-4">
          <div className="space-y-2.5">
            {OFFICIAL_STUDENT_SCHOOLS.map(sch => (
              <label
                key={sch.id}
                className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedSchoolId === sch.id
                    ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-[0_0_15px_rgba(52,211,153,0.25)]'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                <input
                  type="radio"
                  name="schoolOption"
                  value={sch.id}
                  checked={selectedSchoolId === sch.id}
                  onChange={(e) => setSelectedSchoolId(e.target.value)}
                  className="mt-1 accent-emerald-500"
                />
                <div className="text-left">
                  <div className="text-xs sm:text-sm font-semibold text-white">{sch.name}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{sch.city}, {sch.state} • {sch.educationLevel}</div>
                </div>
              </label>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || !selectedSchoolId || Boolean(successMsg)}
            className="w-full mt-6 bg-emerald-500 hover:bg-emerald-400 text-black py-4 rounded-2xl font-bold shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Guardando institución...
              </>
            ) : (
              <>
                Continuar a Vincular Maestro <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
