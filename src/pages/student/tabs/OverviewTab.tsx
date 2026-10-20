import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { motion } from 'motion/react';
import { 
  Target, 
  Leaf, 
  Zap, 
  Droplets, 
  Compass, 
  Sparkles, 
  Award, 
  ArrowRight, 
  CheckCircle2, 
  ChevronRight, 
  Flame, 
  Clock, 
  Lock as LockIcon, 
  Play,
  Globe,
  Store,
  BarChart2,
  Trophy,
  Coins
} from 'lucide-react';
import { Link } from 'react-router';
import { CATEGORIES_CONFIG, SurveyCategory, MAIN_ACTIVITIES } from '../../../data/surveyData';
import { BIOMES, getBiomeUnlockStatus } from '../../../lib/worldProgress';
import FinalSurveyStatusCard from '../../../components/survey/FinalSurveyStatusCard';
import { hasUserCompletedInitialSurvey, getInitialSurveyData } from '../../../lib/surveyService';
import { calculateMultiDayProgress } from '../../../lib/multiDayMissionProgress';

interface OverviewTabProps {
  onNavigateToMissions?: () => void;
}

export default function OverviewTab({ onNavigateToMissions }: OverviewTabProps) {
  const { user } = useAuth();
  if (!user) return null;

  const surveyData = getInitialSurveyData(user);
  const hasTakenSurvey = hasUserCompletedInitialSurvey(user);
  const completedMap = user.completedActivities || {};
  const completedCount = Object.keys(completedMap).length;
  const activeMission = user.activeMission;

  // Active mission duration & sequential progress calculation (Rule 1 & Rule 7)
  const durationDays = activeMission?.durationDays || 1;
  const rawEvidences = activeMission?.dailyEvidences || activeMission?.dailyCheckIns || [];
  const simOffset = activeMission?.simulatedDaysOffset || 0;
  const multiDayProg = calculateMultiDayProgress({
    requiredDays: durationDays,
    rawEvidences,
    serverTimestamp: Date.now(),
    simulatedDaysOffset: simOffset,
    activityId: activeMission?.activityId,
    studentId: user?.uid
  });
  const currentDay = multiDayProg.currentDay;
  const isDurationFulfilled = multiDayProg.isCompleted;

  // Recommended missions
  const recommendedMissionsList = MAIN_ACTIVITIES.filter(act => {
    const isRecommended = surveyData?.recommendedActivityIds?.includes(act.id);
    const isCompleted = Boolean(completedMap[act.id]);
    return isRecommended && !isCompleted;
  }).slice(0, 2);

  const categories: SurveyCategory[] = ['Conducta Pro-Ambiental', 'Austeridad', 'Altruismo', 'Equidad'];

  return (
    <div className="space-y-8 pb-8 font-sans">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-5xl font-light text-white mb-2">
            Hola, {user.name.split(' ')[0]} 👋
          </h1>
          <p className="text-emerald-400 font-medium">
            Nivel {user.level || 1} • Guardián Socioambiental EcoViG
          </p>
        </div>
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-xl font-bold text-white shadow-[0_0_15px_rgba(52,211,153,0.4)]">
          {user.name.charAt(0).toUpperCase()}
        </div>
      </header>

      {/* QUESTIONNAIRE MANDATORY PROMPT (If not taken yet) */}
      {!hasTakenSurvey ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-emerald-500/20 via-teal-600/20 to-slate-900/80 border-2 border-emerald-400/40 p-6 sm:p-8 rounded-[36px] text-white relative overflow-hidden backdrop-blur-xl shadow-[0_0_35px_rgba(52,211,153,0.2)]"
        >
          <div className="absolute -right-10 -top-10 w-48 h-48 bg-emerald-400/20 blur-3xl pointer-events-none"></div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            <div className="max-w-xl space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold uppercase tracking-widest border border-amber-500/30">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Paso Obligatorio Inicial
              </span>
              <h3 className="text-2xl sm:text-3xl font-light text-white leading-tight">
                Encuesta de Diagnóstico Socioambiental
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Para desbloquear tus <strong>misiones prácticas, tu mundo ecológico, la EcoTienda, tus logros y progreso</strong>, responde primero las 21 preguntas de diagnóstico socioambiental y gana tus primeras <strong>500 EcoMonedas 🪙 y 150 XP</strong> para la tienda.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link 
                  to="/questionnaire" 
                  className="inline-flex items-center gap-2 bg-emerald-500 text-black px-6 py-3.5 rounded-2xl font-bold text-sm shadow-[0_0_20px_rgba(16,185,129,0.5)] hover:bg-emerald-400 transition-all transform hover:scale-[1.02]"
                >
                  <Compass className="w-4 h-4" /> Comenzar Diagnóstico (21 preguntas) <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            <div className="w-24 h-24 bg-gradient-to-br from-amber-400/30 to-emerald-500/30 rounded-3xl flex items-center justify-center flex-shrink-0 border border-amber-400/40 shadow-xl text-5xl">
              🪙
            </div>
          </div>
        </motion.div>
      ) : null}

      {/* DIAGNOSIS COMPLETED RECOGNITION / FINAL SURVEY STATUS */}
      {hasTakenSurvey && (
        <div className="space-y-4">
          <FinalSurveyStatusCard />
        </div>
      )}

      {/* ACTIVE MISSION BANNER (If a mission is currently in progress) */}
      {hasTakenSurvey && activeMission && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-emerald-950/60 via-teal-900/40 to-slate-900 border-2 border-emerald-500/50 p-6 rounded-[28px] text-white relative overflow-hidden backdrop-blur-xl shadow-[0_0_30px_rgba(16,185,129,0.15)] flex flex-col sm:flex-row sm:items-center justify-between gap-5"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-3xl shrink-0">
              {activeMission.icon || '🎯'}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  <Flame className="w-3 h-3 fill-emerald-400 text-emerald-400" /> Misión Activa
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  {activeMission.category}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-medium text-white">{activeMission.title}</h3>
              <div className="flex items-center gap-3 text-xs text-slate-300 mt-1">
                <span className="text-emerald-400 font-mono font-bold">
                  Día {currentDay} de {durationDays}
                </span>
                <span>•</span>
                <span>{isDurationFulfilled ? '✅ ¡Días cumplidos! Lista para finalizar' : `Faltan ${durationDays - currentDay} día(s)`}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onNavigateToMissions}
            className="self-start sm:self-auto bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs py-3 px-5 rounded-xl transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
          >
            <Play className="w-3.5 h-3.5 fill-black" /> Continuar Misión <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* Global Stats Grid (Activities & Store Coins focused) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white/5 border border-white/10 p-4 sm:p-5 rounded-[24px] backdrop-blur-md">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2">
            <Zap className="w-5 h-5" />
          </div>
          <div className="text-2xl sm:text-3xl font-light text-white font-mono">{user.xp || 0}</div>
          <div className="text-[10px] text-emerald-400/70 font-bold uppercase tracking-widest mt-0.5">XP Total</div>
        </div>

        <div className="bg-white/5 border border-white/10 p-4 sm:p-5 rounded-[24px] backdrop-blur-md">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 mb-2">
            <Coins className="w-5 h-5" />
          </div>
          <div className="text-2xl sm:text-3xl font-light text-white font-mono">{user.coins || 0}</div>
          <div className="text-[10px] text-amber-400/70 font-bold uppercase tracking-widest mt-0.5">EcoMonedas</div>
        </div>

        <div className="bg-white/5 border border-white/10 p-4 sm:p-5 rounded-[24px] backdrop-blur-md">
          <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400 mb-2">
            <span className="text-xl">🔥</span>
          </div>
          <div className="text-2xl sm:text-3xl font-light text-white font-mono">{user.streak || 1} <span className="text-xs font-normal">días</span></div>
          <div className="text-[10px] text-green-400/70 font-bold uppercase tracking-widest mt-0.5">Racha Activa</div>
        </div>

        <div className="bg-white/5 border border-white/10 p-4 sm:p-5 rounded-[24px] backdrop-blur-md">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 mb-2">
            <Target className="w-5 h-5" />
          </div>
          <div className="text-2xl sm:text-3xl font-light text-white font-mono">{completedCount} <span className="text-xs font-normal">/ 22</span></div>
          <div className="text-[10px] text-purple-400/70 font-bold uppercase tracking-widest mt-0.5">Actividades Superadas</div>
        </div>
      </div>

      {/* LOCKED PREVIEW SECTION IF SURVEY IS NOT COMPLETED */}
      {!hasTakenSurvey ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-light text-white flex items-center gap-2">
                <LockIcon className="w-5 h-5 text-amber-400" /> Módulos por Desbloquear
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Completa tu diagnóstico socioambiental para tener acceso completo a las siguientes funciones:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white/5 border border-white/10 p-5 rounded-[24px] backdrop-blur-md relative overflow-hidden opacity-75">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Target className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <LockIcon className="w-3 h-3" /> Bloqueado
                </span>
              </div>
              <h4 className="text-base font-medium text-white mb-1">Misiones y Retos</h4>
              <p className="text-xs text-slate-400">12 actividades prácticas y retos con evidencias fotográficas en tiempo real.</p>
            </div>

            <div className="bg-white/5 border border-white/10 p-5 rounded-[24px] backdrop-blur-md relative overflow-hidden opacity-75">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-400">
                  <Globe className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <LockIcon className="w-3 h-3" /> Bloqueado
                </span>
              </div>
              <h4 className="text-base font-medium text-white mb-1">Mi Mundo</h4>
              <p className="text-xs text-slate-400">Construye tu propio ecosistema con árboles, agua y animales según tus hábitos.</p>
            </div>

            <div className="bg-white/5 border border-white/10 p-5 rounded-[24px] backdrop-blur-md relative overflow-hidden opacity-75">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                  <Store className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <LockIcon className="w-3 h-3" /> Bloqueado
                </span>
              </div>
              <h4 className="text-base font-medium text-white mb-1">EcoTienda</h4>
              <p className="text-xs text-slate-400">Canjea tus 500 EcoMonedas por mascotas y decoraciones personalizadas.</p>
            </div>

            <div className="bg-white/5 border border-white/10 p-5 rounded-[24px] backdrop-blur-md relative overflow-hidden opacity-75">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                  <Trophy className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <LockIcon className="w-3 h-3" /> Bloqueado
                </span>
              </div>
              <h4 className="text-base font-medium text-white mb-1">Logros de las 4 Etiquetas</h4>
              <p className="text-xs text-slate-400">Insignias exclusivas por cada conducta ambiental, austeridad, altruismo y equidad.</p>
            </div>

            <div className="bg-white/5 border border-white/10 p-5 rounded-[24px] backdrop-blur-md relative overflow-hidden opacity-75">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                  <BarChart2 className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <LockIcon className="w-3 h-3" /> Bloqueado
                </span>
              </div>
              <h4 className="text-base font-medium text-white mb-1">Progreso de Actividades</h4>
              <p className="text-xs text-slate-400">Gráficas detalladas de misiones superadas por dimensión.</p>
            </div>
          </div>
        </section>
      ) : (
        /* Activities Progress Summary per Dimension (No survey test scores) */
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 p-6 sm:p-8 rounded-[36px] backdrop-blur-md space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">
                <Target className="w-4 h-4" /> Misiones de las 4 Dimensiones
              </div>
              <h3 className="text-2xl font-light text-white">Progreso en Actividades</h3>
            </div>
            <button
              onClick={onNavigateToMissions}
              className="text-xs font-bold text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1 self-start sm:self-auto bg-white/5 px-3 py-2 rounded-xl border border-white/10"
            >
              Ver Misiones <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {categories.map(catName => {
              const cfg = CATEGORIES_CONFIG[catName];
              const catMissions = MAIN_ACTIVITIES.filter(a => a.category === catName);
              const catCompleted = catMissions.filter(a => Boolean(completedMap[a.id]));
              const doneCount = catCompleted.length;
              const totalInCat = catMissions.length;
              const pct = Math.round((doneCount / totalInCat) * 100);

              return (
                <div key={catName} className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl">{cfg.icon}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${cfg.bgLight} ${cfg.color} border ${cfg.borderColor}`}>
                      {doneCount}/{totalInCat} misiones
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white mb-1 truncate">{catName}</h4>
                  <div className="text-xs text-slate-400 font-mono mb-2">{pct}% completado</div>
                  <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-emerald-400 to-teal-400 h-1.5 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Biomes Progress Summary (When survey is taken) */}
      {hasTakenSurvey && (
        <div className="bg-white/5 border border-white/10 p-6 sm:p-7 rounded-[32px] backdrop-blur-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-white text-lg font-light">
              <Globe className="w-5 h-5 text-emerald-400" />
              <h3>Desbloqueo de Mundos y Ecosistemas</h3>
            </div>
            <span className="text-xs text-slate-400">
              Desbloquea el Desierto (4 misiones), Montañas (8 misiones) y Ciudad Verde (12 misiones)
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {BIOMES.map(biome => {
              const status = getBiomeUnlockStatus(user, biome.id);
              return (
                <div 
                  key={biome.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    status.isUnlocked 
                      ? 'bg-emerald-500/10 border-emerald-500/30' 
                      : 'bg-white/5 border-white/5 opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{biome.icon}</span>
                    {status.isUnlocked ? (
                      <span className="text-[10px] font-bold text-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Desbloqueado
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-300 flex items-center gap-1">
                        <LockIcon className="w-3 h-3 text-amber-400" /> {biome.requiredMissions} misiones
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-bold text-white">{biome.name}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                    {status.isUnlocked ? '✓ Activo en Mi Mundo' : `${status.currentMissions}/${biome.requiredMissions} misiones • ${status.currentXp}/${biome.requiredXp} XP`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recommended Missions snippet (Only when survey is taken) */}
      {hasTakenSurvey && recommendedMissionsList.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-light text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-400" /> Misiones Prioritarias Recomendadas
            </h2>
            <button
              onClick={onNavigateToMissions}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
            >
              Ver todas las misiones <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recommendedMissionsList.map(act => {
              const isLocked = Boolean(activeMission && activeMission.activityId !== act.id);

              return (
                <div
                  key={act.id}
                  className="bg-white/5 border border-white/10 p-5 rounded-[28px] backdrop-blur-md flex flex-col justify-between hover:border-emerald-500/30 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg">
                        {act.category}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-amber-400">+{act.pointsReward} 🪙</span>
                        <span className="text-xs font-bold text-emerald-400">+{act.xpReward} XP</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 mb-2">
                      <span className="text-2xl">{act.icon}</span>
                      <h4 className="text-sm font-medium text-white">{act.title}</h4>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {act.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex items-center justify-between mt-3">
                    <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" /> {act.durationText}
                    </span>
                    <button
                      onClick={onNavigateToMissions}
                      className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs py-2 px-3.5 rounded-xl transition-colors flex items-center gap-1"
                    >
                      {isLocked ? <LockIcon className="w-3 h-3 text-amber-400" /> : null}
                      <span>Ver Misión</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
