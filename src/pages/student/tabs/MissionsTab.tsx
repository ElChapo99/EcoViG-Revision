import React, { useState } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Target, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Award, 
  ShieldAlert, 
  ChevronRight, 
  Lock as LockIcon, 
  Unlock, 
  AlertCircle, 
  Calendar, 
  Flame, 
  FastForward, 
  X, 
  Play, 
  Info, 
  HelpCircle,
  RotateCcw,
  ArrowRight,
  Compass
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { db } from '../../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { cn } from '../../../lib/utils';
import { 
  MAIN_ACTIVITIES, 
  COMPLEMENTARY_ACTIVITIES, 
  CATEGORIES_CONFIG, 
  MainMissionActivity, 
  ComplementaryActivity, 
  SurveyCategory 
} from '../../../data/surveyData';
import { calculateLevel, BIOMES, getBiomeUnlockStatus } from '../../../lib/worldProgress';
import { resolveActivityDestination } from '../../../lib/activityResolver';
import { submitMissionCompletionAtomic, saveDailyEvidenceAtomic } from '../../../lib/missionService';
import { hasUserCompletedInitialSurvey, getInitialSurveyData } from '../../../lib/surveyService';
import { 
  calculateMultiDayProgress, 
  normalizeSequentialEvidences,
  PROJECT_TIME_ZONE,
  formatProjectDate 
} from '../../../lib/multiDayMissionProgress';

import EvidenceModal from '../../../components/missions/EvidenceModal';
import BudgetGameModal from '../../../components/missions/BudgetGameModal';
import OpportunitiesGameModal from '../../../components/missions/OpportunitiesGameModal';
import VoiceGameModal from '../../../components/missions/VoiceGameModal';
import FinalSurveyStatusCard from '../../../components/survey/FinalSurveyStatusCard';
import ComplementaryGameModal from '../../../components/missions/ComplementaryGameModal';

export default function MissionsTab() {
  const { user, refreshUser } = useAuth();
  const [activeSection, setActiveSection] = useState<'main' | 'complementary' | 'completed'>('main');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<SurveyCategory | 'all'>('all');

  // Modals and dialogs state
  const [lockedNoticeInfo, setLockedNoticeInfo] = useState<{
    activity: MainMissionActivity | ComplementaryActivity;
    reason: 'active_mission' | 'prereq_not_met';
  } | null>(null);
  const [abandonConfirmOpen, setAbandonConfirmOpen] = useState(false);
  const [completedCelebration, setCompletedCelebration] = useState<{
    title: string;
    xp: number;
    points: number;
    badge?: string;
  } | null>(null);

  // Execution modals
  const [activeActivityForModal, setActiveActivityForModal] = useState<MainMissionActivity | ComplementaryActivity | null>(null);
  const [activeModalType, setActiveModalType] = useState<'evidence' | 'budget' | 'opportunities' | 'voice' | 'complementary' | null>(null);

  // Daily check-in form state
  const [dailyNote, setDailyNote] = useState('');
  const [isUpdatingDays, setIsUpdatingDays] = useState(false);

  if (!user) return null;

  const completedMap = user.completedActivities || {};
  const initialSurvey = getInitialSurveyData(user);
  const hasCompletedSurvey = hasUserCompletedInitialSurvey(user);
  const recommendedIds = initialSurvey?.recommendedActivityIds || user.activeMissions || [];
  const activeMission = user.activeMission;

  // Obligatory main missions calculation
  const totalMainCount = MAIN_ACTIVITIES.length;
  const completedMainCount = MAIN_ACTIVITIES.filter(a => Boolean(completedMap[a.id])).length;
  const areAllMainCompleted = completedMainCount >= totalMainCount;
  const remainingMainCount = Math.max(0, totalMainCount - completedMainCount);

  // Find active activity object if exists
  const currentActiveActivity = activeMission 
    ? [...MAIN_ACTIVITIES, ...COMPLEMENTARY_ACTIVITIES].find(a => a.id === activeMission.activityId) || null
    : null;

  // Active mission duration & sequential progress calculations (Rule 1 & Rule 7)
  const durationDays = currentActiveActivity?.durationDays || activeMission?.durationDays || 1;
  const activeDailyEvidences = activeMission?.dailyEvidences || activeMission?.dailyCheckIns || [];
  const simOffset = activeMission?.simulatedDaysOffset || 0;

  const multiDayProgress = calculateMultiDayProgress({
    requiredDays: durationDays,
    rawEvidences: activeDailyEvidences,
    serverTimestamp: Date.now(),
    simulatedDaysOffset: simOffset,
    activityId: activeMission?.activityId,
    studentId: user?.uid
  });

  const completedDays = multiDayProgress.completedDays;
  const currentDay = multiDayProgress.currentDay;
  const isDurationFulfilled = multiDayProgress.isCompleted;
  const areAllDailyEvidencesReady = multiDayProgress.isCompleted;
  const canSubmitToday = multiDayProgress.canSubmitToday;
  const daysRemaining = Math.max(0, durationDays - completedDays);
  const recordedEvidencesCount = completedDays;
  const isTodayEvidenceRecorded = !canSubmitToday && !isDurationFulfilled;

  // Filtered lists
  const mainActivitiesList = MAIN_ACTIVITIES.filter(act => {
    if (selectedCategoryFilter !== 'all' && act.category !== selectedCategoryFilter) {
      return false;
    }
    return true;
  });

  const completedList = [
    ...MAIN_ACTIVITIES.filter(a => completedMap[a.id]),
    ...COMPLEMENTARY_ACTIVITIES.filter(a => completedMap[a.id])
  ];

  // Central Direct Activity Starter: 1 click immediately activates & opens the real interface
  const handleStartActivity = async (activity: MainMissionActivity | ComplementaryActivity) => {
    if (!user) return;
    const destination = resolveActivityDestination(activity);

    // If activity is not active yet, set activeMission in Firestore seamlessly
    const isCurrentlyActive = activeMission?.activityId === activity.id;
    if (!isCurrentlyActive) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          activeMission: {
            activityId: activity.id,
            title: activity.title,
            category: activity.category,
            icon: activity.icon,
            startedAt: Date.now(),
            durationDays: activity.durationDays || 1,
            dailyCheckIns: [
              {
                day: 1,
                timestamp: Date.now(),
                note: 'Inicio de misión registrado'
              }
            ],
            dailyEvidences: [],
            simulatedDaysOffset: 0
          },
          updatedAt: Date.now()
        });
        refreshUser().catch(() => {});
      } catch (err) {
        console.error('Error starting mission:', err);
      }
    }

    // Directly open the resolved modal
    setActiveActivityForModal(activity);
    setActiveModalType(destination.modalType as any);
  };

  // Opening the completion/action modal for active or selected mission
  const handleOpenCompletionModal = (activity: MainMissionActivity | ComplementaryActivity) => {
    const destination = resolveActivityDestination(activity);
    setActiveActivityForModal(activity);
    setActiveModalType(destination.modalType as any);
  };

  // Save daily evidence photo
  const handleSaveDailyEvidence = async (day: number, photoUrl: string, note?: string) => {
    if (!user || !activeMission) return;
    try {
      await saveDailyEvidenceAtomic(
        day, 
        photoUrl, 
        note || `Evidencia del Día ${day} registrada`,
        user.uid,
        activeMission
      );
      await refreshUser();
    } catch (err) {
      console.error('Error saving daily evidence in MissionsTab:', err);
      throw err;
    }
  };

  // Fast forward / simulate next day (for easy testing & classroom evaluation)
  const handleSimulateNextDay = async () => {
    if (!user || !activeMission || isUpdatingDays) return;
    setIsUpdatingDays(true);
    try {
      const nextOffset = (activeMission.simulatedDaysOffset || 0) + 1;
      await updateDoc(doc(db, 'users', user.uid), {
        'activeMission.simulatedDaysOffset': nextOffset,
        updatedAt: Date.now()
      });
      await refreshUser();
    } catch (err) {
      console.error('Error advancing day in simulation:', err);
    } finally {
      setIsUpdatingDays(false);
    }
  };

  // Daily check-in log
  const handleDailyCheckIn = async () => {
    if (!user || !activeMission) return;
    try {
      const existingCheckIns = activeMission.dailyCheckIns || [];
      const hasToday = existingCheckIns.some(c => c.day === currentDay);
      let updatedCheckIns = [...existingCheckIns];
      if (hasToday) {
        updatedCheckIns = updatedCheckIns.map(c => c.day === currentDay ? { ...c, note: dailyNote || c.note } : c);
      } else {
        updatedCheckIns.push({
          day: currentDay,
          timestamp: Date.now(),
          note: dailyNote || `Día ${currentDay} completado`
        });
      }

      await updateDoc(doc(db, 'users', user.uid), {
        'activeMission.dailyCheckIns': updatedCheckIns,
        updatedAt: Date.now()
      });
      setDailyNote('');
      await refreshUser();
    } catch (err) {
      console.error('Error checking in:', err);
    }
  };

  // Abandon current mission
  const handleAbandonMission = async () => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        activeMission: null,
        updatedAt: Date.now()
      });
      setAbandonConfirmOpen(false);
      await refreshUser();
    } catch (err) {
      console.error('Error abandoning mission:', err);
    }
  };

  const handleCloseModal = () => {
    setActiveActivityForModal(null);
    setActiveModalType(null);
  };

  // Helper to remove any undefined fields recursively for Firestore safety
  const sanitizeFirestoreData = (data: any): any => {
    if (data === null || data === undefined) return null;
    if (Array.isArray(data)) {
      return data.map(sanitizeFirestoreData).filter(x => x !== undefined);
    }
    if (typeof data === 'object') {
      const cleanObj: Record<string, any> = {};
      for (const [k, v] of Object.entries(data)) {
        if (v !== undefined) {
          cleanObj[k] = sanitizeFirestoreData(v);
        }
      }
      return cleanObj;
    }
    return data;
  };

  // Finishing and saving completed mission via authoritative atomic server transaction
  const handleCompleteMission = async (evidenceData: any) => {
    if (!activeActivityForModal || !user) return;

    const activityId = activeActivityForModal.id;
    const cleanEvidenceData = sanitizeFirestoreData(evidenceData || {});

    try {
      const result = await submitMissionCompletionAtomic(activityId, cleanEvidenceData);

      setCompletedCelebration({
        title: activeActivityForModal.title,
        xp: result.xpAdded || ('xpReward' in activeActivityForModal ? activeActivityForModal.xpReward : 50),
        points: result.coinsAdded || ('pointsReward' in activeActivityForModal ? activeActivityForModal.pointsReward : 10),
        ...(result.badgeEarned ? { badge: result.badgeEarned } : {})
      });

      await refreshUser();
    } catch (err) {
      console.error('Error saving completed mission:', err);
      throw err;
    }
  };

  if (!hasCompletedSurvey) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-6 max-w-lg mx-auto py-16 font-sans">
        <div className="w-24 h-24 bg-gradient-to-br from-emerald-500/20 to-teal-500/30 rounded-3xl flex items-center justify-center shadow-[0_0_30px_rgba(52,211,153,0.3)] border border-emerald-500/40 text-4xl">
          🔒
        </div>
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
            Diagnóstico Inicial Requerido
          </span>
          <h2 className="text-3xl font-light text-white">Misiones Bloqueadas</h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Las 12 misiones y 10 retos socioambientales permanecerán ocultos hasta que completes tu encuesta diagnóstica inicial de 21 preguntas.
          </p>
        </div>
        <Link
          to="/questionnaire"
          className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm px-8 py-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center gap-2"
        >
          <Compass className="w-4 h-4" /> Comenzar Encuesta Diagnóstica <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-light text-white mb-1">Misiones y Actividades</h1>
          <p className="text-emerald-400 font-medium text-sm">
            {activeMission 
              ? 'Tienes una misión en curso. Cumple sus días y registra tu evidencia para desbloquear más.'
              : 'Elige libremente tu siguiente actividad socioambiental para avanzar.'
            }
          </p>
        </div>

        {/* Points Summary Pill */}
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-2.5 px-4 rounded-2xl backdrop-blur-md self-start sm:self-auto">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Puntos Totales</span>
            <span className="text-emerald-400 font-bold font-mono text-base">
              {(user.surveyPoints || 0) + (user.mainMissionPoints || 0) + (user.complementaryPoints || 0)} pts
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg">
            ⭐
          </div>
        </div>
      </header>

      {/* ACTIVE MISSION HERO PANEL (When an activity is currently selected and active) */}
      {activeMission && currentActiveActivity && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-emerald-950/60 via-teal-900/40 to-[#0b131e] border-2 border-emerald-500/50 p-6 sm:p-7 rounded-[32px] shadow-[0_0_35px_rgba(16,185,129,0.2)] relative overflow-hidden backdrop-blur-xl"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

          <div className="relative z-10 space-y-5">
            {/* Top Status & Tags */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 bg-emerald-500 text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md animate-pulse">
                  <Flame className="w-3.5 h-3.5 fill-black" /> Misión Activa en Curso
                </span>
                <span className="text-[11px] font-bold text-emerald-300 bg-white/10 px-2.5 py-1 rounded-full border border-white/10">
                  {currentActiveActivity.category}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-400 bg-white/10 px-3 py-1 rounded-xl border border-white/15">
                  +{'xpReward' in currentActiveActivity ? currentActiveActivity.xpReward : 50} XP
                </span>
                <span className="text-xs font-bold text-amber-300 bg-amber-500/20 px-3 py-1 rounded-xl border border-amber-500/30">
                  +{'pointsReward' in currentActiveActivity ? currentActiveActivity.pointsReward : 10} Puntos
                </span>
              </div>
            </div>

            {/* Mission Info */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-4xl shadow-inner shrink-0">
                  {currentActiveActivity.icon}
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-light text-white">{currentActiveActivity.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed max-w-2xl">
                    {currentActiveActivity.description}
                  </p>
                </div>
              </div>

              {/* Days badge */}
              <div className="bg-black/40 border border-white/10 p-3.5 px-5 rounded-2xl text-center self-start shrink-0">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">Progreso de Días</span>
                <div className="text-2xl font-mono font-bold text-emerald-400 mt-0.5">
                  Día {currentDay} <span className="text-sm font-normal text-slate-400">/ {durationDays}</span>
                </div>
                <span className={`text-[10px] mt-0.5 block font-medium ${
                  isDurationFulfilled 
                    ? 'text-emerald-300' 
                    : canSubmitToday 
                    ? 'text-amber-300' 
                    : 'text-slate-400'
                }`}>
                  {isDurationFulfilled 
                    ? '¡Todos los días completados!' 
                    : canSubmitToday 
                    ? '⚡ Cámara disponible' 
                    : '⏳ Próxima evidencia disponible mañana'}
                </span>
              </div>
            </div>

            {/* Day Tracker Stepper */}
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-300 gap-1 mb-1">
                <span className="font-semibold text-emerald-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" /> Seguimiento de evidencias diarias ({completedDays} de {durationDays} pasos completados)
                </span>
                <span className="text-[11px] font-mono text-emerald-400 font-bold">
                  {multiDayProgress.statusMessage}
                </span>
              </div>

              {/* Day Dots */}
              <div className="grid grid-cols-5 sm:grid-cols-7 gap-2">
                {multiDayProgress.stepperDays.map((step) => {
                  const isCompleted = step.status === 'completed';
                  const isAvailableNow = step.status === 'current_available';
                  const isLockedToday = step.status === 'current_locked_today';
                  const isFuture = step.status === 'locked_future';

                  return (
                    <div
                      key={step.dayNumber}
                      onClick={() => {
                        if (!isFuture) {
                          handleOpenCompletionModal(currentActiveActivity);
                        }
                      }}
                      className={cn(
                        "p-2 rounded-xl text-center border transition-all flex flex-col items-center justify-center cursor-pointer",
                        isCompleted && "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30",
                        isAvailableNow && "bg-amber-500/20 border-amber-400 text-amber-200 font-bold shadow-md scale-105 animate-pulse",
                        isLockedToday && "bg-slate-800/80 border-slate-600 text-slate-300",
                        isFuture && "bg-white/5 border-white/10 text-slate-500 cursor-not-allowed opacity-60"
                      )}
                      title={
                        isCompleted 
                          ? `Día ${step.dayNumber}: Completado con foto y nota verificadas` 
                          : isAvailableNow 
                          ? `Día ${step.dayNumber}: Cámara disponible para registrar evidencia de hoy` 
                          : isLockedToday 
                          ? `Día ${step.dayNumber}: Próxima evidencia disponible mañana` 
                          : `Día ${step.dayNumber}: Bloqueado hasta completar los días anteriores`
                      }
                    >
                      <span className="text-[9px] uppercase block tracking-wider">Día</span>
                      <span className="text-sm sm:text-base font-bold font-mono leading-none my-0.5">{step.dayNumber}</span>
                      <span className="text-[9px] truncate w-full font-medium">
                        {isCompleted 
                          ? '✓ Listo' 
                          : isAvailableNow 
                          ? '⚡ Cámara' 
                          : isLockedToday 
                          ? '⏳ Mañana' 
                          : '🔒'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions Bar inside Active Panel */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                {/* Simulator advance helper for classroom/evaluations */}
                {!isDurationFulfilled && (
                  <button
                    onClick={handleSimulateNextDay}
                    disabled={isUpdatingDays}
                    className="bg-white/10 hover:bg-white/15 border border-white/20 text-slate-200 text-xs font-semibold py-2.5 px-3.5 rounded-xl transition-colors flex items-center gap-1.5"
                    title="Avanzar 1 día para probar o registrar avance continuo"
                  >
                    <FastForward className="w-3.5 h-3.5 text-amber-400" />
                    <span>Avanzar 1 día (Prueba/Simulación)</span>
                  </button>
                )}

                <button
                  onClick={() => setAbandonConfirmOpen(true)}
                  className="text-xs text-slate-400 hover:text-red-400 py-2 px-3 rounded-xl hover:bg-red-500/10 transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Cambiar de misión
                </button>
              </div>

              <div className="flex items-center gap-3">
                {isDurationFulfilled && areAllDailyEvidencesReady ? (
                  <button
                    onClick={() => handleOpenCompletionModal(currentActiveActivity)}
                    className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm py-3.5 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.5)] transform hover:scale-105"
                  >
                    <CheckCircle2 className="w-5 h-5" /> Finalizar Misión ({completedDays}/{durationDays} Fotos Listas)
                  </button>
                ) : canSubmitToday ? (
                  <button
                    onClick={() => handleOpenCompletionModal(currentActiveActivity)}
                    className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs py-3 px-5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg animate-pulse"
                  >
                    <span>📸 Capturar Evidencia del Día {currentDay} (Cámara Disponible)</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleOpenCompletionModal(currentActiveActivity)}
                    className="w-full sm:w-auto bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs py-3 px-5 rounded-xl transition-all flex items-center justify-center gap-1.5"
                  >
                    <Clock className="w-4 h-4 text-emerald-400" />
                    <span>⏳ Próxima Evidencia Disponible Mañana (Día {currentDay})</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Global Locking Notice Banner (if active mission exists) */}
      {activeMission && (
        <div className="bg-amber-500/10 border border-amber-500/25 p-3.5 px-4 rounded-2xl flex items-center justify-between gap-3 text-xs text-amber-200 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <LockIcon className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Modo de Actividad Exclusiva:</strong> Las demás actividades están bloqueadas mientras completas <em>"{activeMission.title}"</em> ({durationDays} días requeridos).
            </span>
          </div>
          <span className="text-[10px] uppercase font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-md shrink-0">
            1 a la vez
          </span>
        </div>
      )}

      {/* Points breakdown cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="bg-white/5 border border-white/10 p-3 sm:p-4 rounded-2xl text-center backdrop-blur-md">
          <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">Encuesta</span>
          <span className="text-base sm:text-xl font-light text-emerald-400 font-mono mt-0.5 block">
            {user.surveyPoints || 0} pts
          </span>
        </div>
        <div className="bg-white/5 border border-white/10 p-3 sm:p-4 rounded-2xl text-center backdrop-blur-md">
          <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">Misiones Principales</span>
          <span className="text-base sm:text-xl font-light text-teal-400 font-mono mt-0.5 block">
            {user.mainMissionPoints || 0} pts
          </span>
        </div>
        <div className="bg-white/5 border border-white/10 p-3 sm:p-4 rounded-2xl text-center backdrop-blur-md">
          <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">Secundarias</span>
          <span className="text-base sm:text-xl font-light text-purple-400 font-mono mt-0.5 block">
            {user.complementaryPoints || 0} pts
          </span>
        </div>
      </div>

      {/* FINAL SURVEY STATUS / COMPARATIVE ACCESS */}
      <FinalSurveyStatusCard />

      {/* Main navigation tabs */}
      <div className="flex bg-white/5 border border-white/10 p-1.5 rounded-2xl backdrop-blur-md">
        <button
          onClick={() => setActiveSection('main')}
          className={cn(
            "flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all uppercase tracking-wider flex items-center justify-center gap-1.5",
            activeSection === 'main'
              ? "bg-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.2)] border border-emerald-500/30"
              : "text-slate-400 hover:text-white"
          )}
        >
          <Target className="w-4 h-4" /> Misiones Obligatorias ({completedMainCount}/{totalMainCount})
        </button>
        <button
          onClick={() => setActiveSection('complementary')}
          className={cn(
            "flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all uppercase tracking-wider flex items-center justify-center gap-1.5 relative",
            activeSection === 'complementary'
              ? "bg-purple-500/20 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)] border border-purple-500/30"
              : "text-slate-400 hover:text-white"
          )}
        >
          {areAllMainCompleted ? (
            <Sparkles className="w-4 h-4 text-purple-400" />
          ) : (
            <LockIcon className="w-3.5 h-3.5 text-amber-400" />
          )}
          <span>10 Complementarias</span>
          {!areAllMainCompleted && (
            <span className="hidden sm:inline text-[10px] text-amber-300/80 font-normal lowercase">
              (bloqueadas)
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveSection('completed')}
          className={cn(
            "flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all uppercase tracking-wider flex items-center justify-center gap-1.5",
            activeSection === 'completed'
              ? "bg-teal-500/20 text-teal-400 shadow-[0_0_15px_rgba(45,212,191,0.2)] border border-teal-500/30"
              : "text-slate-400 hover:text-white"
          )}
        >
          <CheckCircle2 className="w-4 h-4" /> Completadas ({completedList.length})
        </button>
      </div>

      {/* Category filters (for Main section) */}
      {activeSection === 'main' && (
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          <button
            onClick={() => setSelectedCategoryFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
              selectedCategoryFilter === 'all'
                ? 'bg-white/20 text-white border border-white/30'
                : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            Todas
          </button>
          {(Object.keys(CATEGORIES_CONFIG) as SurveyCategory[]).map(cat => {
            const config = CATEGORIES_CONFIG[cat];
            const isSelected = selectedCategoryFilter === cat;

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategoryFilter(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? `${config.bgLight} ${config.color} border ${config.borderColor}`
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                <span>{config.icon}</span>
                <span>{cat}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* SECTION 1: MAIN MISSIONS */}
      {activeSection === 'main' && (
        <div className="space-y-4">
          {/* Progress towards unlocking complementary and biomes */}
          <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border border-emerald-500/20 p-4 sm:p-5 rounded-2xl backdrop-blur-md space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <Target className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-slate-200">
                  <strong>Tus Misiones Obligatorias ({completedMainCount}/{totalMainCount}):</strong> Otorgan XP y desbloquean los biomas en <em>Mi Mundo</em> y la <em>EcoTienda</em>.
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-28 bg-white/10 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-emerald-400 to-teal-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.round((completedMainCount / totalMainCount) * 100)}%` }}
                  />
                </div>
                <span className="font-mono font-bold text-emerald-400 text-xs">
                  {Math.round((completedMainCount / totalMainCount) * 100)}%
                </span>
              </div>
            </div>

            {/* Mini World unlock status track */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-white/10">
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-xl text-xs">
                <span className="text-lg">🌲</span>
                <div>
                  <div className="font-bold text-white text-[11px]">Bosque</div>
                  <div className="text-[10px] text-emerald-400 font-bold">✓ Desbloqueado</div>
                </div>
              </div>

              <div className={`flex items-center gap-2 p-2 rounded-xl text-xs border ${
                completedMainCount >= 4 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                  : 'bg-white/5 border-white/10 text-slate-400'
              }`}>
                <span className="text-lg">🌵</span>
                <div>
                  <div className="font-bold text-white text-[11px]">Desértico</div>
                  <div className={`text-[10px] font-bold ${completedMainCount >= 4 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {completedMainCount >= 4 ? '✓ Desbloqueado' : `${completedMainCount}/4 misiones`}
                  </div>
                </div>
              </div>

              <div className={`flex items-center gap-2 p-2 rounded-xl text-xs border ${
                completedMainCount >= 8 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                  : 'bg-white/5 border-white/10 text-slate-400'
              }`}>
                <span className="text-lg">⛰️</span>
                <div>
                  <div className="font-bold text-white text-[11px]">Montañas</div>
                  <div className={`text-[10px] font-bold ${completedMainCount >= 8 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {completedMainCount >= 8 ? '✓ Desbloqueado' : `${completedMainCount}/8 misiones`}
                  </div>
                </div>
              </div>

              <div className={`flex items-center gap-2 p-2 rounded-xl text-xs border ${
                completedMainCount >= 12 
                  ? 'bg-teal-500/20 border-teal-400/40 text-teal-300 shadow-sm' 
                  : 'bg-white/5 border-white/10 text-slate-400'
              }`}>
                <span className="text-lg">🏙️</span>
                <div>
                  <div className="font-bold text-white text-[11px]">Ciudad Verde</div>
                  <div className={`text-[10px] font-bold ${completedMainCount >= 12 ? 'text-teal-300' : 'text-purple-400'}`}>
                    {completedMainCount >= 12 ? '✓ ¡Restaurada!' : `${completedMainCount}/12 (Todas)`}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mainActivitiesList.map((act) => {
              const isDone = Boolean(completedMap[act.id]);
              const isCurrentActive = activeMission?.activityId === act.id;
              const isLocked = Boolean(activeMission && !isCurrentActive && !isDone);
              const isRecommended = recommendedIds.includes(act.id);
              const catConfig = CATEGORIES_CONFIG[act.category];

              return (
                <motion.div
                  key={act.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "p-6 rounded-[28px] border transition-all flex flex-col justify-between backdrop-blur-md relative overflow-hidden",
                    isDone && "bg-white/5 border-white/10 opacity-70",
                    isCurrentActive && "bg-emerald-950/40 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]",
                    isLocked && "bg-black/30 border-white/5 opacity-55 hover:opacity-75",
                    !isDone && !isCurrentActive && !isLocked && "bg-white/5 border-white/10 hover:border-emerald-500/40 shadow-lg"
                  )}
                >
                  {/* Locked subtle overlay if locked */}
                  {isLocked && (
                    <div className="absolute top-3 right-3 z-10">
                      <span className="flex items-center gap-1 bg-black/60 border border-white/10 text-slate-400 text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md">
                        <LockIcon className="w-3 h-3 text-amber-400" /> Bloqueada
                      </span>
                    </div>
                  )}

                  <div>
                    {/* Top tags */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg ${catConfig.bgLight} ${catConfig.color} border ${catConfig.borderColor}`}>
                        {catConfig.icon} {act.category}
                      </span>
                      <div className="flex items-center gap-2">
                        {isRecommended && !isDone && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                            ✨ Recomendada
                          </span>
                        )}
                        <span className="text-xs font-bold text-emerald-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10 font-mono">
                          +{act.xpReward} XP
                        </span>
                      </div>
                    </div>

                    {/* Title & info */}
                    <div className="flex items-start gap-3 mb-2">
                      <span className="text-3xl">{act.icon}</span>
                      <div>
                        <h3 className="text-lg font-medium text-white">{act.title}</h3>
                        <p className="text-xs text-emerald-400/80 font-medium">{act.subtitle}</p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 my-3 leading-relaxed">
                      {act.description}
                    </p>

                    {/* Associated Question link */}
                    <div className="bg-white/5 p-2.5 rounded-xl border border-white/5 mb-4 text-[11px] text-slate-400">
                      <strong className="text-slate-300 block mb-0.5">Asociada a tu respuesta:</strong>
                      "{act.associatedQuestionsText[0]}"
                    </div>
                  </div>

                  {/* Bottom action button */}
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-3">
                    <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" /> {act.durationText}
                    </span>

                    {isDone ? (
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Completada
                      </span>
                    ) : isCurrentActive ? (
                      <button
                        onClick={() => handleOpenCompletionModal(act)}
                        className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                      >
                        <Play className="w-3.5 h-3.5 fill-black" /> Misión Activa <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    ) : isLocked ? (
                      <button
                        onClick={() => setLockedNoticeInfo({ activity: act, reason: 'active_mission' })}
                        className="bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-slate-300 font-bold text-xs py-2.5 px-4 rounded-xl transition-colors flex items-center gap-1.5"
                      >
                        <LockIcon className="w-3.5 h-3.5 text-amber-400" /> Bloqueada
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStartActivity(act)}
                        className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs py-2.5 px-4 rounded-xl transition-colors flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)] transform hover:scale-[1.02]"
                      >
                        <Play className="w-3.5 h-3.5 fill-black" /> Iniciar Misión <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 2: 10 COMPLEMENTARY ACTIVITIES */}
      {activeSection === 'complementary' && (
        <div className="space-y-5">
          {!areAllMainCompleted ? (
            /* LOCKED NOTICE BANNER WHEN OBLIGATORY ARE NOT FINISHED */
            <div className="bg-gradient-to-r from-amber-950/40 via-purple-950/30 to-[#0b131e] border-2 border-amber-500/40 p-5 sm:p-6 rounded-[28px] text-amber-200 backdrop-blur-xl shadow-lg relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <LockIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                      Requisito de Desbloqueo
                    </span>
                    <h3 className="text-lg sm:text-xl font-medium text-white mt-1">
                      Actividades Complementarias Bloqueadas
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                      Para desbloquear las 10 actividades secundarias y complementarias, debes terminar primero las <strong>12 Misiones Obligatorias</strong>. 
                      Has completado <strong className="text-emerald-400">{completedMainCount} de {totalMainCount}</strong> (Te faltan <strong className="text-amber-300">{remainingMainCount}</strong> misiones).
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:items-end gap-2.5 shrink-0">
                  <div className="bg-black/40 border border-white/10 px-4 py-2 rounded-xl text-right">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Progreso Obligatorias</span>
                    <span className="text-lg font-mono font-bold text-emerald-400">
                      {completedMainCount} / {totalMainCount}
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveSection('main')}
                    className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Target className="w-3.5 h-3.5" /> Ir a Misiones Obligatorias
                  </button>
                </div>
              </div>

              {/* Progress bar inside banner */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-400 h-2 rounded-full transition-all duration-700"
                    style={{ width: `${Math.round((completedMainCount / totalMainCount) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            /* UNLOCKED SUCCESS BANNER */
            <div className="bg-gradient-to-r from-purple-950/50 via-emerald-950/30 to-[#0b131e] border-2 border-purple-500/40 p-5 rounded-[28px] text-purple-200 backdrop-blur-xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 text-2xl shrink-0">
                  ✨
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-medium text-white">
                    ¡Actividades Complementarias 100% Desbloqueadas!
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Completaste todas las misiones obligatorias. Ahora puedes elegir libremente cualquiera de estos 10 desafíos secundarios.
                  </p>
                </div>
              </div>
              <span className="hidden sm:inline-block bg-purple-500 text-white font-bold text-xs px-3 py-1.5 rounded-xl uppercase tracking-wider">
                Desbloqueado
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {COMPLEMENTARY_ACTIVITIES.map((act) => {
              const isDone = Boolean(completedMap[act.id]);
              const isCurrentActive = activeMission?.activityId === act.id;
              const isPrereqLocked = !areAllMainCompleted;
              const isMissionLocked = Boolean(activeMission && !isCurrentActive && !isDone);
              const isLocked = !isDone && (isPrereqLocked || isMissionLocked);

              return (
                <div
                  key={act.id}
                  className={cn(
                    "p-5 rounded-[24px] border transition-all flex flex-col justify-between backdrop-blur-md relative overflow-hidden",
                    isDone && "bg-white/5 border-white/10 opacity-70",
                    isCurrentActive && "bg-purple-950/40 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.2)]",
                    isLocked && "bg-black/40 border-white/5 opacity-60 hover:opacity-85",
                    !isDone && !isCurrentActive && !isLocked && "bg-white/5 border-white/10 hover:border-purple-500/30"
                  )}
                >
                  {isLocked && (
                    <div className="absolute top-3 right-3 z-10">
                      <span className="flex items-center gap-1 bg-black/70 border border-white/15 text-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-md">
                        <LockIcon className="w-3 h-3 text-amber-400" />
                        {isPrereqLocked ? `Requiere 12 obligatorias (${completedMainCount}/12)` : 'Bloqueada'}
                      </span>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{act.icon}</span>
                        <div>
                          <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider block">
                            Actividad {act.number}
                          </span>
                          <h4 className="text-base font-medium text-white">{act.title}</h4>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20 font-mono">
                        +{act.pointsReward} pts
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 my-2 leading-relaxed">
                      {act.description}
                    </p>

                    <div className="text-[11px] text-slate-400 bg-white/5 p-2 rounded-xl mb-3">
                      <strong className="text-slate-300">Mecánica:</strong> {act.mechanics}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3 text-purple-400" /> {act.durationText}
                      </span>
                      {act.badge && (
                        <span className="text-[10px] text-amber-300 font-bold flex items-center gap-1">
                          <Award className="w-3 h-3" /> {act.badge}
                        </span>
                      )}
                    </div>

                    <div className="ml-auto">
                      {isDone ? (
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Completada
                        </span>
                      ) : isCurrentActive ? (
                        <button
                          onClick={() => handleOpenCompletionModal(act)}
                          className="bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs py-2 px-4 rounded-xl transition-colors flex items-center gap-1 shadow-md"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" /> En curso <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      ) : isPrereqLocked ? (
                        <button
                          onClick={() => setLockedNoticeInfo({ activity: act, reason: 'prereq_not_met' })}
                          className="bg-white/5 hover:bg-white/10 border border-white/10 text-amber-300 hover:text-amber-200 font-bold text-xs py-2 px-3.5 rounded-xl transition-colors flex items-center gap-1"
                        >
                          <LockIcon className="w-3.5 h-3.5 text-amber-400" /> Bloqueada ({completedMainCount}/12)
                        </button>
                      ) : isMissionLocked ? (
                        <button
                          onClick={() => setLockedNoticeInfo({ activity: act, reason: 'active_mission' })}
                          className="bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-slate-300 font-bold text-xs py-2 px-3.5 rounded-xl transition-colors flex items-center gap-1"
                        >
                          <LockIcon className="w-3.5 h-3.5 text-amber-400" /> Bloqueada
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStartActivity(act)}
                          className="bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs py-2 px-4 rounded-xl transition-colors flex items-center gap-1 shadow-md transform hover:scale-[1.02]"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" /> Iniciar Actividad <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 3: COMPLETED MISSIONS */}
      {activeSection === 'completed' && (
        <div className="space-y-4">
          {completedList.length === 0 ? (
            <div className="text-center py-16 bg-white/5 border border-white/10 rounded-[32px]">
              <div className="w-16 h-16 bg-white/5 border border-white/10 text-slate-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-light text-white mb-1">Aún no has completado misiones</h3>
              <p className="text-xs text-slate-400">
                Selecciona una misión principal o complementaria para comenzar a sumar puntos.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedList.map((act) => {
                const record = completedMap[act.id];

                return (
                  <div
                    key={act.id}
                    className="bg-white/5 border border-emerald-500/20 p-5 rounded-[24px] backdrop-blur-md space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{act.icon}</span>
                        <div>
                          <h4 className="text-sm font-medium text-white">{act.title}</h4>
                          <span className="text-[10px] text-slate-400">
                            Completada el {formatProjectDate(record.completedAt)}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 font-mono">
                        +{record.pointsEarned} pts
                      </span>
                    </div>

                    {record.badgeEarned && (
                      <div className="bg-purple-500/10 border border-purple-500/30 p-2 rounded-xl text-xs text-purple-300 font-bold flex items-center gap-2">
                        <Award className="w-4 h-4 text-purple-400" />
                        Insignia obtenida: "{record.badgeEarned}"
                      </div>
                    )}

                    {record.evidenceData?.reflectionAnswer && (
                      <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-xs text-slate-300">
                        <strong className="text-slate-400 block text-[10px] uppercase tracking-wider mb-1">Tu Reflexión:</strong>
                        "{record.evidenceData.reflectionAnswer}"
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* LOCKED ACTIVITY EXPLAIN MODAL */}
      <AnimatePresence>
        {lockedNoticeInfo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0b131e] border border-amber-500/30 rounded-[32px] max-w-md w-full p-6 sm:p-8 relative shadow-2xl space-y-5 text-center"
            >
              <button
                onClick={() => setLockedNoticeInfo(null)}
                className="absolute top-6 right-6 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-16 h-16 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto border border-amber-500/30 shadow-lg">
                <LockIcon className="w-8 h-8" />
              </div>

              {lockedNoticeInfo.reason === 'prereq_not_met' ? (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30 inline-block mb-2">
                    Requisito Obligatorio
                  </span>
                  <h3 className="text-xl font-light text-white mb-2">Actividad Complementaria Bloqueada</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Las 10 actividades complementarias solo se desbloquean una vez que hayas completado <strong>todas las 12 Misiones Obligatorias</strong>.
                  </p>

                  <div className="mt-4 bg-white/5 border border-white/10 p-3.5 rounded-2xl space-y-2 text-left">
                    <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
                      <span>Progreso de Misiones Obligatorias</span>
                      <span className="text-emerald-400 font-mono font-bold">{completedMainCount} / {totalMainCount}</span>
                    </div>
                    <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-400 h-2 rounded-full"
                        style={{ width: `${Math.round((completedMainCount / totalMainCount) * 100)}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 text-center pt-1">
                      Te faltan <strong className="text-amber-300 font-bold">{remainingMainCount}</strong> misiones obligatorias por completar.
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-xl font-light text-white mb-2">Actividad Bloqueada</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Actualmente tienes la misión <strong className="text-emerald-400">"{activeMission?.title}"</strong> en curso (Día {currentDay} de {durationDays}).
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    Debes completar los {durationDays} días y registrar su evidencia final para desbloquear libremente esta y las demás actividades.
                  </p>
                </div>
              )}

              <div className="bg-white/5 border border-white/10 p-3 rounded-xl text-[11px] text-slate-400">
                <span>Actividad seleccionada:</span> <strong className="text-white block mt-0.5">{lockedNoticeInfo.activity.title}</strong>
              </div>

              {lockedNoticeInfo.reason === 'prereq_not_met' ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => setLockedNoticeInfo(null)}
                    className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-bold py-3 rounded-xl text-xs transition-colors"
                  >
                    Cerrar
                  </button>
                  <button
                    onClick={() => {
                      setLockedNoticeInfo(null);
                      setActiveSection('main');
                    }}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 rounded-xl text-xs transition-colors shadow-md flex items-center justify-center gap-1.5"
                  >
                    <Target className="w-3.5 h-3.5" /> Ir a Obligatorias
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setLockedNoticeInfo(null)}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3.5 rounded-xl text-xs transition-colors"
                >
                  Entendido, Continuar Misión en Curso
                </button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ABANDON CONFIRMATION MODAL */}
      <AnimatePresence>
        {abandonConfirmOpen && activeMission && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0b131e] border border-red-500/30 rounded-[32px] max-w-md w-full p-6 sm:p-8 relative shadow-2xl space-y-5"
            >
              <div className="w-14 h-14 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto border border-red-500/30">
                <AlertCircle className="w-7 h-7" />
              </div>

              <div className="text-center">
                <h3 className="text-xl font-light text-white mb-2">¿Abandonar o cambiar de misión?</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Si cancelas tu misión actual <strong>"{activeMission.title}"</strong>, se desbloquearán todas las demás actividades para que elijas otra, pero no se sumarán los puntos ni la experiencia de esta misión.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setAbandonConfirmOpen(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-bold py-3 rounded-xl text-xs transition-colors"
                >
                  Seguir en mi misión
                </button>
                <button
                  onClick={handleAbandonMission}
                  className="flex-1 bg-red-500/80 hover:bg-red-500 text-white font-bold py-3 rounded-xl text-xs transition-colors"
                >
                  Confirmar abandono
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* COMPLETED CELEBRATION MODAL (All missions unlocked celebration) */}
      <AnimatePresence>
        {completedCelebration && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#0b131e] border-2 border-emerald-500 rounded-[36px] max-w-lg w-full p-6 sm:p-8 relative shadow-[0_0_50px_rgba(16,185,129,0.4)] text-center space-y-5"
            >
              <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40 text-4xl animate-bounce">
                🎉
              </div>

              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block mb-1">
                  ¡Objetivo Alcanzado!
                </span>
                <h3 className="text-2xl sm:text-3xl font-light text-white mb-2">
                  {completedCelebration.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Has cumplido con éxito todos los días y requisitos de tu actividad.
                </p>
              </div>

              {/* Rewards Box */}
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center justify-around">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Experiencia</span>
                  <span className="text-xl font-bold font-mono text-emerald-400">+{completedCelebration.xp} XP</span>
                </div>
                <div className="w-px h-8 bg-white/10"></div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Puntos Eco</span>
                  <span className="text-xl font-bold font-mono text-amber-300">+{completedCelebration.points} pts</span>
                </div>
                {completedCelebration.badge && (
                  <>
                    <div className="w-px h-8 bg-white/10"></div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Insignia</span>
                      <span className="text-xs font-bold text-purple-300 block truncate max-w-[100px]">
                        {completedCelebration.badge}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Unlocked Message */}
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-3.5 rounded-2xl flex items-center justify-center gap-2 text-xs text-emerald-300 font-semibold">
                <Unlock className="w-4 h-4 text-emerald-400" />
                <span>¡Todas las actividades han sido desbloqueadas! Ya puedes elegir libremente otra más.</span>
              </div>

              <button
                onClick={() => setCompletedCelebration(null)}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-4 rounded-2xl text-sm transition-all shadow-[0_0_20px_rgba(16,185,129,0.5)]"
              >
                Continuar y Elegir Otra Actividad
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ACTIVE MODALS FOR SUBMISSION & INTERACTION */}
      {activeModalType === 'evidence' && activeActivityForModal && (
        <EvidenceModal
          activity={activeActivityForModal}
          isOpen={true}
          onClose={handleCloseModal}
          onSubmit={handleCompleteMission}
          currentDay={currentDay}
          totalDays={durationDays}
          existingDailyEvidences={activeMission?.activityId === activeActivityForModal.id ? (activeMission?.dailyEvidences || activeMission?.dailyCheckIns || []) : []}
          onSaveDailyEvidence={handleSaveDailyEvidence}
        />
      )}

      {activeModalType === 'budget' && activeActivityForModal && (
        <BudgetGameModal
          activity={activeActivityForModal as MainMissionActivity}
          isOpen={true}
          onClose={handleCloseModal}
          onSubmit={handleCompleteMission}
        />
      )}

      {activeModalType === 'opportunities' && activeActivityForModal && (
        <OpportunitiesGameModal
          activity={activeActivityForModal as MainMissionActivity}
          isOpen={true}
          onClose={handleCloseModal}
          onSubmit={handleCompleteMission}
        />
      )}

      {activeModalType === 'voice' && activeActivityForModal && (
        <VoiceGameModal
          activity={activeActivityForModal as MainMissionActivity}
          isOpen={true}
          onClose={handleCloseModal}
          onSubmit={handleCompleteMission}
        />
      )}

      {activeModalType === 'complementary' && activeActivityForModal && (
        <ComplementaryGameModal
          activity={activeActivityForModal as ComplementaryActivity}
          isOpen={true}
          onClose={handleCloseModal}
          onSubmit={handleCompleteMission}
        />
      )}
    </div>
  );
}
