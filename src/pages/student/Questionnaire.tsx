import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Navigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { getStudentOnboardingState } from '../../lib/onboardingGuard';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  Sparkles, 
  Target, 
  Compass, 
  ChevronRight, 
  AlertTriangle, 
  RotateCcw,
  Lock as LockIcon,
  BarChart3,
  Award,
  RefreshCw
} from 'lucide-react';
import { 
  SURVEY_QUESTIONS, 
  SURVEY_OPTIONS, 
  CATEGORIES_CONFIG, 
  MAIN_ACTIVITIES,
  SurveyOption,
  SurveyCategory,
  SurveyQuestion
} from '../../data/surveyData';
import { SurveyResults, ManagedSurveyQuestion } from '../../types';
import { 
  computeAuthoritativeSurveyResults, 
  buildOptimisticSurveyUserUpdate, 
  buildOptimisticFinalSurveyUserUpdate,
  submitInitialSurveyAtomic,
  submitFinalSurveyAtomic,
  getFinalSurveyLockStatus,
  getInitialSurveyData
} from '../../lib/surveyService';
import { fetchActiveStudentSurveyVersion } from '../../lib/surveyAdminService';
import ComparativeResultsView from '../../components/survey/ComparativeResultsView';

export default function Questionnaire() {
  const [searchParams] = useSearchParams();
  const isFinalMode = searchParams.get('mode') === 'final';

  // Dynamic versioned questions state
  const [questionsList, setQuestionsList] = useState<Array<SurveyQuestion | ManagedSurveyQuestion>>([]);
  const [loadedVersionId, setLoadedVersionId] = useState<string>('survey_v1');
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  // Answers start empty to avoid influencing choices
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, SurveyOption>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [computedResults, setComputedResults] = useState<SurveyResults | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const { user, refreshUser, updateUserLocal } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadSurveyVersion();
  }, [isFinalMode]);

  const loadSurveyVersion = async () => {
    setLoadingQuestions(true);
    setLoadError(null);
    try {
      const activeVersion = await fetchActiveStudentSurveyVersion(isFinalMode ? 'final' : 'initial');
      if (activeVersion && activeVersion.questions && activeVersion.questions.length > 0) {
        const sorted = activeVersion.questions.filter(q => !q.retired).sort((a, b) => a.order - b.order);
        setQuestionsList(sorted);
        if (activeVersion.versionId) {
          setLoadedVersionId(activeVersion.versionId);
        }
      } else {
        // Fallback to static survey questions if response contains no questions
        setQuestionsList(SURVEY_QUESTIONS);
      }
    } catch (err: any) {
      console.warn('Error fetching survey active version, using default questions:', err);
      if (SURVEY_QUESTIONS && SURVEY_QUESTIONS.length > 0) {
        setQuestionsList(SURVEY_QUESTIONS);
      } else {
        setLoadError(err.message || 'No se pudieron cargar las preguntas oficiales de la evaluación.');
      }
    } finally {
      setLoadingQuestions(false);
    }
  };

  if (user && user.role === 'student') {
    const onboardingState = getStudentOnboardingState(user);
    if (onboardingState === 'NEEDS_SCHOOL') return <Navigate to="/select-school" replace />;
    if (onboardingState === 'NEEDS_TEACHER') return <Navigate to="/link-teacher" replace />;
  }

  // If in final mode, check lock status
  const lockStatus = getFinalSurveyLockStatus(user);

  if (isFinalMode && !lockStatus.isUnlocked && !lockStatus.isCompleted) {
    return (
      <div className="min-h-screen font-sans text-white p-4 sm:p-6 md:p-10 flex flex-col max-w-2xl mx-auto relative z-10 justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/5 border border-white/15 p-8 rounded-[36px] backdrop-blur-xl text-center space-y-6 shadow-2xl"
        >
          <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-3xl mx-auto">
            <LockIcon className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-light text-white">
              Encuesta Final Bloqueada
            </h2>
            <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
              Para realizar tu evaluación final, debes completar primero tu diagnóstico inicial y las <strong>12 actividades obligatorias</strong> del programa EcoViG.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-black/30 border border-white/10 max-w-sm mx-auto space-y-2">
            <div className="flex justify-between text-xs text-slate-400 font-mono">
              <span>Progreso obligatorio</span>
              <span className="text-amber-400 font-bold">{lockStatus.mandatoryCompletedCount} / {lockStatus.totalMandatoryCount}</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-amber-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(lockStatus.mandatoryCompletedCount / lockStatus.totalMandatoryCount) * 100}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-500 text-center">
              Faltan {lockStatus.missingCount} misiones por completar
            </div>
          </div>

          <button
            onClick={() => navigate('/dashboard', { state: { tab: 'missions' } })}
            className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3.5 px-6 rounded-2xl text-sm transition-all flex items-center justify-center gap-2 mx-auto shadow-[0_0_20px_rgba(16,185,129,0.3)]"
          >
            Ir a mis Misiones Obligatorias <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    );
  }

  if (loadingQuestions) {
    return (
      <div className="min-h-screen font-sans text-white p-4 flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
        <p className="text-sm text-slate-400">Cargando preguntas de la evaluación oficial...</p>
      </div>
    );
  }

  if (loadError && questionsList.length === 0) {
    return (
      <div className="min-h-screen font-sans text-white p-4 flex flex-col items-center justify-center space-y-4 max-w-md mx-auto text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center text-2xl mx-auto">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-light text-white">No se pudieron cargar las preguntas</h3>
        <p className="text-xs text-slate-400">{loadError}</p>
        <button
          onClick={loadSurveyVersion}
          className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-all flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Reintentar
        </button>
      </div>
    );
  }

  if (questionsList.length === 0) {
    return (
      <div className="min-h-screen font-sans text-white p-4 flex flex-col items-center justify-center space-y-4 max-w-md mx-auto text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-2xl mx-auto">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-light text-white">No hay preguntas disponibles</h3>
        <p className="text-xs text-slate-400">La versión oficial de evaluación no contiene preguntas activas en este momento.</p>
        <button
          onClick={loadSurveyVersion}
          className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-all flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Recargar
        </button>
      </div>
    );
  }

  const currentQuestion = questionsList[currentIndex] || questionsList[0];
  const categoryConfig = currentQuestion ? (CATEGORIES_CONFIG[currentQuestion.category] || CATEGORIES_CONFIG['Conducta Pro-Ambiental']) : CATEGORIES_CONFIG['Conducta Pro-Ambiental'];
  const selectedOptionForCurrent = selectedAnswers[currentQuestion.id];

  const handleSelectOption = (option: SurveyOption) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: option
    }));
  };

  const handleNext = async () => {
    if (currentIndex < questionsList.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Completed all questions in the version
      if (isSubmitting) return;
      setIsSubmitting(true);
      setSubmitError(null);

      const previousUserState = user ? { ...user } : null;

      try {
        // 1. Authoritative calculations
        const { results } = computeAuthoritativeSurveyResults(selectedAnswers);

        if (isFinalMode) {
          // Final Survey flow
          const optimisticUpdate = buildOptimisticFinalSurveyUserUpdate(user, results);
          if (updateUserLocal) {
            updateUserLocal(optimisticUpdate);
          }
          setComputedResults(results);
          setShowResults(true);

          const submitOutcome = await submitFinalSurveyAtomic(selectedAnswers, loadedVersionId);
          if (!submitOutcome.success) {
            throw new Error('Error al procesar la encuesta final');
          }
          if (refreshUser) {
            await refreshUser();
          }
        } else {
          // Initial Survey flow
          const optimisticUpdate = buildOptimisticSurveyUserUpdate(user, results);
          if (updateUserLocal) {
            updateUserLocal(optimisticUpdate);
          }
          setComputedResults(results);
          setShowResults(true);

          if (user?.uid) {
            const submitOutcome = await submitInitialSurveyAtomic(user.uid, selectedAnswers, loadedVersionId);
            if (!submitOutcome.success) {
              throw new Error('Error al procesar el diagnóstico');
            }
            if (refreshUser) {
              await refreshUser();
            }
          }
        }
      } catch (err: any) {
        console.error('Error saving survey transaction:', err);
        setSubmitError(err.message || 'No pudimos registrar la encuesta porque algunas respuestas no son válidas. Revisa tus respuestas e inténtalo nuevamente.');
        
        if (previousUserState && updateUserLocal) {
          updateUserLocal(previousUserState);
        } else if (refreshUser) {
          refreshUser().catch(() => {});
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleRetrySubmit = async () => {
    if (!user?.uid || isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const { results } = computeAuthoritativeSurveyResults(selectedAnswers);
      if (isFinalMode) {
        const optimisticUpdate = buildOptimisticFinalSurveyUserUpdate(user, results);
        if (updateUserLocal) updateUserLocal(optimisticUpdate);
        setComputedResults(results);
        setShowResults(true);
        await submitFinalSurveyAtomic(selectedAnswers);
      } else {
        const optimisticUpdate = buildOptimisticSurveyUserUpdate(user, results);
        if (updateUserLocal) updateUserLocal(optimisticUpdate);
        setComputedResults(results);
        setShowResults(true);
        await submitInitialSurveyAtomic(user.uid, selectedAnswers);
      }
    } catch (err: any) {
      console.error('Retry error:', err);
      setSubmitError(err.message || 'No pudimos conectar con el servidor. Por favor verifica tu conexión a internet.');
      if (refreshUser) {
        refreshUser().catch(() => {});
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  // POST-SURVEY RESULTS SCREEN
  if (showResults && computedResults) {
    if (isFinalMode) {
      // COMPARATIVE RESULTS SCREEN (Initial vs Final)
      const initialDiagnostic = getInitialSurveyData(user);
      const finalDiagnostic = computedResults;

      return (
        <div className="min-h-screen font-sans text-white p-4 sm:p-6 md:p-10 flex flex-col max-w-4xl mx-auto relative z-10 space-y-8">
          {submitError && (
            <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-amber-200 text-xs">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                <span>{submitError}</span>
              </div>
              <button
                onClick={handleRetrySubmit}
                disabled={isSubmitting}
                className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reintentar
              </button>
            </div>
          )}

          <ComparativeResultsView
            initialSurvey={initialDiagnostic}
            finalSurvey={finalDiagnostic}
            studentName={user?.name}
          />

          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/dashboard', { state: { tab: 'progress' } })}
              className="flex-1 bg-emerald-500 text-black font-bold py-4 px-6 rounded-2xl text-base hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
            >
              Ver Mi Progreso Global <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/dashboard', { state: { tab: 'ecosystem' } })}
              className="bg-white/10 hover:bg-white/15 text-white font-bold py-4 px-6 rounded-2xl text-sm transition-all flex items-center justify-center gap-2 border border-white/15"
            >
              Explorar Mi Mundo 🌲
            </button>
          </div>
        </div>
      );
    }

    // INITIAL SURVEY RESULTS SCREEN
    const recommendedActivities = MAIN_ACTIVITIES.filter(a => 
      computedResults.recommendedActivityIds.includes(a.id)
    );

    return (
      <div className="min-h-screen font-sans text-white p-4 sm:p-6 md:p-10 flex flex-col max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {submitError && (
            <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-amber-200 text-xs">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                <span>{submitError}</span>
              </div>
              <button
                onClick={handleRetrySubmit}
                disabled={isSubmitting}
                className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reintentar
              </button>
            </div>
          )}

          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-4 h-4" /> Diagnóstico Socioambiental Inicial Completado
            </div>
            <h1 className="text-3xl sm:text-5xl font-light text-white tracking-tight">
              ¡Felicidades, {user?.name.split(' ')[0]}! 🎉
            </h1>
            <p className="text-slate-300 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
              Has desbloqueado todas tus actividades, misiones prácticas, tu mundo vivo y la EcoTienda.
            </p>
          </div>

          {/* Reward Banner with EcoCoins and XP */}
          <div className="bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-teal-500/20 border-2 border-amber-500/40 p-6 sm:p-8 rounded-[36px] backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-[0_0_40px_rgba(245,158,11,0.2)]">
            <div className="flex items-center gap-5 text-center sm:text-left">
              <div className="w-20 h-20 rounded-3xl bg-amber-500/30 border border-amber-400/50 flex items-center justify-center text-4xl shrink-0 shadow-lg animate-bounce">
                🪙
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-widest text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-md border border-amber-500/30">
                  Recompensa Desbloqueada
                </span>
                <div className="text-3xl sm:text-4xl font-light text-white">
                  +500 <span className="text-amber-400 font-medium">EcoMonedas</span>
                </div>
                <p className="text-xs text-slate-300">
                  ¡Listas para canjear en la <strong>EcoTienda</strong> por mascotas y decoraciones de tu mundo!
                </p>
              </div>
            </div>

            <div className="flex sm:flex-col items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-emerald-400 text-black font-bold text-xs px-4 py-2.5 rounded-2xl shadow-[0_0_15px_rgba(52,211,153,0.4)]">
                <Sparkles className="w-4 h-4" /> +150 XP Otorgados
              </span>
              <span className="text-[11px] text-emerald-300 font-medium">Nivel 2 Alcanzado</span>
            </div>
          </div>

          {/* 4 Dimension Areas */}
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-light text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-400" /> Tus 4 Dimensiones de Acción
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(Object.keys(CATEGORIES_CONFIG) as SurveyCategory[]).map((catName) => {
                const config = CATEGORIES_CONFIG[catName];

                return (
                  <div 
                    key={catName}
                    className="bg-white/5 border border-white/10 p-5 rounded-[28px] backdrop-blur-md flex flex-col justify-between hover:border-white/20 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{config.icon}</span>
                          <h3 className="font-medium text-white text-base sm:text-lg">{catName}</h3>
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${config.bgLight} ${config.color} border ${config.borderColor}`}>
                          Activa
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {config.description}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-white/5 flex items-center justify-between text-xs text-emerald-400 font-medium">
                      <span>3 misiones disponibles</span>
                      <span>Listas para iniciar</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recommended Missions Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-light text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-400" /> Misiones Recomendadas para Comenzar
              </h2>
              <span className="text-xs text-slate-400">{recommendedActivities.length} asignadas</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendedActivities.map(act => {
                const catConfig = CATEGORIES_CONFIG[act.category];
                return (
                  <div 
                    key={act.id}
                    className="bg-white/5 border border-white/10 p-5 rounded-[28px] backdrop-blur-md flex flex-col justify-between hover:border-emerald-500/30 transition-all group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg ${catConfig.bgLight} ${catConfig.color} border ${catConfig.borderColor}`}>
                          {act.category}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                            +{act.pointsReward} 🪙
                          </span>
                          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                            +{act.xpReward} XP
                          </span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 mb-2">
                        <span className="text-2xl">{act.icon}</span>
                        <div>
                          <h4 className="text-base font-medium text-white group-hover:text-emerald-400 transition-colors">
                            {act.title}
                          </h4>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                            {act.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 mt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                      <span>⏳ {act.durationText}</span>
                      <span className="text-emerald-400 flex items-center gap-1 font-medium">
                        Ver detalles <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/dashboard', { state: { tab: 'missions' } })}
              className="flex-1 bg-emerald-500 text-black font-bold py-4 px-6 rounded-2xl text-base hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
            >
              Comenzar mis Misiones <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/dashboard', { state: { tab: 'ecosystem' } })}
              className="bg-white/10 hover:bg-white/15 text-white font-bold py-4 px-6 rounded-2xl text-sm transition-all flex items-center justify-center gap-2 border border-white/15"
            >
              Explorar Mi Mundo 🌲
            </button>
            <button
              onClick={() => navigate('/dashboard', { state: { tab: 'profile' } })}
              className="bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-medium py-4 px-6 rounded-2xl text-sm transition-all flex items-center justify-center gap-2 border border-white/10"
            >
              Ver mi Cuenta 👤
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const progressPercent = ((currentIndex + 1) / questionsList.length) * 100;

  return (
    <div className="min-h-screen font-sans text-white p-4 sm:p-6 md:p-10 flex flex-col max-w-2xl mx-auto relative z-10 justify-between">
      {/* Top Header & Progress */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-lg">{categoryConfig.icon}</span>
            <span className={categoryConfig.color}>{currentQuestion.category}</span>
          </div>
          <div className="flex items-center gap-3">
            {isFinalMode && (
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                Evaluación Final
              </span>
            )}
            <span className="font-mono text-emerald-400">
              Pregunta {currentIndex + 1} de {questionsList.length}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
          <motion.div 
            className="bg-gradient-to-r from-emerald-400 to-teal-400 h-2 rounded-full shadow-[0_0_10px_#34d399]"
            initial={{ width: `${(currentIndex / questionsList.length) * 100}%` }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Main Question Card */}
      <div className="my-8 flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Category tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-300 backdrop-blur-md">
              <span>{categoryConfig.icon}</span>
              <span>{categoryConfig.name}</span>
            </div>

            {/* Optional Question Image */}
            {currentQuestion.imageUrl && (
              <div className="w-full flex justify-center">
                <img 
                  src={currentQuestion.imageUrl} 
                  alt={currentQuestion.text} 
                  className="max-h-56 sm:max-h-72 w-auto max-w-full rounded-2xl object-contain shadow-xl border border-white/10 bg-black/30"
                  loading="lazy"
                />
              </div>
            )}

            {/* Question statement */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-white leading-snug tracking-tight">
              "{currentQuestion.text}"
            </h2>

            {/* 4 Scale Options (ONLY labels Nunca, Casi nunca, Casi siempre, Siempre without point numbers) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {SURVEY_OPTIONS.map((option) => {
                const isSelected = selectedOptionForCurrent === option;

                return (
                  <button
                    key={option}
                    onClick={() => handleSelectOption(option)}
                    className={`text-left p-5 rounded-[22px] border transition-all duration-200 backdrop-blur-md relative flex items-center justify-between group ${
                      isSelected
                        ? 'border-emerald-400 bg-emerald-500/20 text-white shadow-[0_0_20px_rgba(52,211,153,0.25)] ring-1 ring-emerald-400'
                        : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/25 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span className="font-normal text-base sm:text-lg leading-tight">
                      {option}
                    </span>
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                      isSelected 
                        ? 'border-emerald-400 bg-emerald-400 text-black' 
                        : 'border-white/20 group-hover:border-white/40'
                    }`}>
                      {isSelected && <CheckCircle className="w-4 h-4 fill-black text-emerald-400" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Nav Buttons */}
      <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/10">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="px-5 py-3.5 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Anterior
        </button>

        <button
          onClick={handleNext}
          disabled={!selectedOptionForCurrent || isSubmitting}
          className="flex-1 sm:flex-initial sm:min-w-[180px] bg-emerald-500 text-black font-bold py-3.5 px-6 rounded-xl text-base hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
        >
          {isSubmitting ? (
            isFinalMode ? 'Guardando evaluación final...' : 'Guardando diagnóstico...'
          ) : currentIndex === questionsList.length - 1 ? (
            isFinalMode ? (
              <>Finalizar y Ver Comparativo <Sparkles className="w-4 h-4" /></>
            ) : (
              <>Finalizar y Recibir 500 EcoMonedas <Sparkles className="w-4 h-4" /></>
            )
          ) : (
            <>Siguiente <ArrowRight className="w-4 h-4" /></>
          )}
        </button>
      </div>
    </div>
  );
}
