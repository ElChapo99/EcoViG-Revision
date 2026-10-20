import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { 
  Lock as LockIcon, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  TrendingUp, 
  Target, 
  Award, 
  Compass, 
  BarChart3,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getFinalSurveyLockStatus, getInitialSurveyData } from '../../lib/surveyService';
import ComparativeResultsView from './ComparativeResultsView';

interface FinalSurveyStatusCardProps {
  compact?: boolean;
  onOpenDirect?: () => void;
}

export default function FinalSurveyStatusCard({
  compact = false,
  onOpenDirect
}: FinalSurveyStatusCardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showComparativeModal, setShowComparativeModal] = useState(false);

  if (!user) return null;

  const lockStatus = getFinalSurveyLockStatus(user);
  const initialSurvey = getInitialSurveyData(user);
  const finalSurvey = user.finalSurvey;

  const handleStartFinalSurvey = () => {
    if (onOpenDirect) {
      onOpenDirect();
    } else {
      navigate('/questionnaire?mode=final');
    }
  };

  const handleViewResults = () => {
    setShowComparativeModal(true);
  };

  // State 1: COMPLETED
  if (lockStatus.isCompleted && finalSurvey) {
    return (
      <>
        <div className="bg-gradient-to-r from-teal-500/15 via-emerald-500/15 to-slate-900 border-2 border-emerald-500/40 p-6 sm:p-7 rounded-[32px] backdrop-blur-xl shadow-[0_0_30px_rgba(16,185,129,0.15)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-3xl shrink-0 shadow-lg">
              🎓
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Evaluación Final Completada
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {finalSurvey.totalScore} / 8400 pts
                </span>
              </div>
              <h3 className="text-xl font-medium text-white">
                Diagnóstico Comparativo Disponible
              </h3>
              <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                Has concluido satisfactoriamente las misiones obligatorias y tu evaluación socioambiental final. Consulta tu evolución y crecimiento en las 4 dimensiones.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0 self-stretch md:self-auto justify-end">
            <button
              onClick={handleViewResults}
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs sm:text-sm py-3.5 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)] transform hover:scale-[1.02]"
            >
              <BarChart3 className="w-4 h-4" /> Ver mis resultados <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {showComparativeModal && (
          <ComparativeResultsView
            initialSurvey={initialSurvey}
            finalSurvey={finalSurvey}
            studentName={user.name}
            isModal={true}
            onClose={() => setShowComparativeModal(false)}
          />
        )}
      </>
    );
  }

  // State 2: AVAILABLE (Unlocked, ready to take)
  if (lockStatus.isUnlocked) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-slate-900 border-2 border-emerald-400/50 p-6 sm:p-7 rounded-[32px] backdrop-blur-xl shadow-[0_0_35px_rgba(52,211,153,0.25)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden"
      >
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-400/20 blur-3xl pointer-events-none" />

        <div className="flex items-start gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 flex items-center justify-center text-3xl shrink-0 shadow-lg animate-pulse">
            📋
          </div>
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold uppercase tracking-wider border border-emerald-500/40">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Encuesta Final Disponible
            </div>
            <h3 className="text-xl font-medium text-white">
              ¡Has completado las 12 actividades obligatorias!
            </h3>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Ya puedes realizar tu <strong>evaluación final (21 preguntas)</strong> para conocer tu evolución socioambiental y comparar tus hábitos respecto al diagnóstico inicial.
            </p>
          </div>
        </div>

        <div className="relative z-10 shrink-0 self-stretch md:self-auto">
          <button
            onClick={handleStartFinalSurvey}
            className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm py-3.5 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.5)] transform hover:scale-[1.02]"
          >
            <Compass className="w-4 h-4" /> Realizar encuesta final <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    );
  }

  // State 3: LOCKED (Missing mandatory missions or initial survey)
  const completedCount = lockStatus.mandatoryCompletedCount;
  const totalRequired = lockStatus.totalMandatoryCount;
  const progressPct = Math.round((completedCount / totalRequired) * 100);

  return (
    <div className="bg-white/5 border border-white/10 p-6 sm:p-7 rounded-[32px] backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-slate-400 flex items-center justify-center text-xl shrink-0">
          <LockIcon className="w-6 h-6 text-slate-400" />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10 flex items-center gap-1">
              <LockIcon className="w-3 h-3 text-slate-400" /> Encuesta Final Bloqueada
            </span>
            <span className="text-xs font-mono text-amber-400">
              {completedCount} de {totalRequired} actividades obligatorias completadas
            </span>
          </div>
          <h3 className="text-lg font-medium text-white">
            Evaluación Socioambiental Final
          </h3>
          <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
            Completa primero tus <strong>12 actividades obligatorias</strong> para desbloquear tu evaluación final y visualizar tu comparativa socioambiental.
          </p>
        </div>
      </div>

      <div className="w-full md:w-56 shrink-0 space-y-2">
        <div className="flex justify-between text-xs text-slate-400 font-mono">
          <span>Progreso de desbloqueo</span>
          <span className="text-amber-400 font-bold">{progressPct}%</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-amber-400 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="text-[11px] text-slate-500 text-right">
          Faltan {lockStatus.missingCount} misiones
        </div>
      </div>
    </div>
  );
}
