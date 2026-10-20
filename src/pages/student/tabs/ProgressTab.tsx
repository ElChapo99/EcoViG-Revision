import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { 
  Target, 
  Compass, 
  Award, 
  Zap, 
  Coins, 
  CheckCircle2, 
  Clock, 
  Flame, 
  TrendingUp, 
  Calendar,
  Sparkles,
  Gamepad2,
  Check,
  ChevronRight,
  ShieldCheck,
  Camera,
  Globe,
  Lock as LockIcon
} from 'lucide-react';
import { CATEGORIES_CONFIG, SurveyCategory, MAIN_ACTIVITIES, COMPLEMENTARY_ACTIVITIES } from '../../../data/surveyData';
import { CompletedActivityRecord } from '../../../types';
import { BIOMES, getBiomeUnlockStatus, getCompletedMandatoryMissionsCount } from '../../../lib/worldProgress';
import FinalSurveyStatusCard from '../../../components/survey/FinalSurveyStatusCard';
import ComparativeResultsView from '../../../components/survey/ComparativeResultsView';
import { hasUserCompletedInitialSurvey, getInitialSurveyData } from '../../../lib/surveyService';

export default function ProgressTab() {
  const { user } = useAuth();
  if (!user) return null;

  const hasInitial = hasUserCompletedInitialSurvey(user);
  const initialSurveyData = getInitialSurveyData(user);

  const completedMap: Record<string, CompletedActivityRecord> = (user.completedActivities as any) || {};
  const completedIds = Object.keys(completedMap);
  const totalCompletedCount = completedIds.length;

  const mainCompletedCount = MAIN_ACTIVITIES.filter(a => Boolean(completedMap[a.id])).length;
  const compCompletedCount = COMPLEMENTARY_ACTIVITIES.filter(a => Boolean(completedMap[a.id])).length;
  const totalActivitiesCount = MAIN_ACTIVITIES.length + COMPLEMENTARY_ACTIVITIES.length;
  const overallPercentage = Math.round((totalCompletedCount / totalActivitiesCount) * 100);

  // Group main activities by category
  const categories: SurveyCategory[] = ['Conducta Pro-Ambiental', 'Austeridad', 'Altruismo', 'Equidad'];

  return (
    <div className="space-y-8 pb-12 font-sans">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-light text-white mb-1">Tu Progreso en Actividades</h1>
          <p className="text-emerald-400 font-medium text-sm">
            Seguimiento en tiempo real de misiones y retos completados en las 4 dimensiones.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl backdrop-blur-md self-start sm:self-auto">
          <Target className="w-5 h-5 text-emerald-400" />
          <div>
            <div className="text-xs text-slate-400">Total Superadas</div>
            <div className="text-sm font-bold text-white font-mono">{totalCompletedCount} de {totalActivitiesCount} ({overallPercentage}%)</div>
          </div>
        </div>
      </header>

      {/* Top Activity Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white/5 border border-white/10 p-4 sm:p-5 rounded-[24px] backdrop-blur-md">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2">
            <Target className="w-5 h-5" />
          </div>
          <div className="text-2xl sm:text-3xl font-light text-white font-mono">{mainCompletedCount} <span className="text-xs font-normal text-slate-400">/ 12</span></div>
          <div className="text-[10px] text-emerald-400/70 font-bold uppercase tracking-widest mt-0.5">Misiones Principales</div>
        </div>

        <div className="bg-white/5 border border-white/10 p-4 sm:p-5 rounded-[24px] backdrop-blur-md">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 mb-2">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div className="text-2xl sm:text-3xl font-light text-white font-mono">{compCompletedCount} <span className="text-xs font-normal text-slate-400">/ 10</span></div>
          <div className="text-[10px] text-blue-400/70 font-bold uppercase tracking-widest mt-0.5">Retos y Minijuegos</div>
        </div>

        <div className="bg-white/5 border border-white/10 p-4 sm:p-5 rounded-[24px] backdrop-blur-md">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 mb-2">
            <Coins className="w-5 h-5" />
          </div>
          <div className="text-2xl sm:text-3xl font-light text-white font-mono">{user.coins || 0}</div>
          <div className="text-[10px] text-amber-400/70 font-bold uppercase tracking-widest mt-0.5">EcoMonedas</div>
        </div>

        <div className="bg-white/5 border border-white/10 p-4 sm:p-5 rounded-[24px] backdrop-blur-md">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 mb-2">
            <Zap className="w-5 h-5" />
          </div>
          <div className="text-2xl sm:text-3xl font-light text-white font-mono">{user.xp || 0}</div>
          <div className="text-[10px] text-purple-400/70 font-bold uppercase tracking-widest mt-0.5">XP Acumulada</div>
        </div>
      </div>

      {/* Global Progress Bar */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border border-emerald-500/20 p-6 rounded-[28px] backdrop-blur-xl space-y-3">
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="text-white font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" /> Avance Global del Programa Socioambiental
          </span>
          <span className="text-emerald-400 font-mono font-bold">{overallPercentage}% completado</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-300 h-3 rounded-full transition-all duration-700 shadow-[0_0_12px_rgba(52,211,153,0.4)]"
            style={{ width: `${overallPercentage}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-slate-400 pt-1">
          <span>{totalCompletedCount} actividades logradas</span>
          <span>{totalActivitiesCount - totalCompletedCount} actividades pendientes</span>
        </div>
      </div>

      {/* WORLDS / BIOMES UNLOCK STATUS SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl sm:text-2xl font-light text-white">Desbloqueo de Mundos y Ecosistemas</h2>
          </div>
          <span className="text-xs text-slate-400">
            Impulsado por XP y misiones obligatorias
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {BIOMES.map((biome) => {
            const status = getBiomeUnlockStatus(user, biome.id);
            return (
              <div 
                key={biome.id}
                className={`p-5 rounded-[28px] border transition-all flex flex-col justify-between backdrop-blur-md ${
                  status.isUnlocked
                    ? 'bg-gradient-to-b from-emerald-500/10 to-teal-900/20 border-emerald-500/30'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-4xl">{biome.icon}</span>
                    {status.isUnlocked ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Desbloqueado
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 rounded-full">
                        <LockIcon className="w-3 h-3 text-amber-400" /> Bloqueado
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-medium text-white mb-1">{biome.name}</h3>
                  <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                    {biome.description}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-white/10 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">Misiones Obligatorias:</span>
                      <span className={`font-mono font-bold ${status.missionsMet ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {status.currentMissions} / {status.requiredMissions}
                      </span>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${status.missionsMet ? 'bg-emerald-400' : 'bg-amber-400'}`}
                        style={{ width: `${Math.min(100, (status.currentMissions / (status.requiredMissions || 1)) * 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {biome.requiredXp > 0 && (
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-400">XP Requerida:</span>
                        <span className={`font-mono font-bold ${status.xpMet ? 'text-emerald-400' : 'text-purple-400'}`}>
                          {status.currentXp} / {status.requiredXp} XP
                        </span>
                      </div>
                      <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${status.xpMet ? 'bg-emerald-400' : 'bg-purple-400'}`}
                          style={{ width: `${Math.min(100, (status.currentXp / status.requiredXp) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <div className="text-[10px] text-slate-400 text-center font-medium pt-1">
                    {status.isUnlocked ? '✓ Disponible en Mi Mundo y Tienda' : biome.unlockRequirementText}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FINAL SURVEY / COMPARATIVE RESULTS SECTION */}
      {user.finalSurveyCompleted && user.finalSurvey ? (
        <div className="space-y-4">
          <ComparativeResultsView
            initialSurvey={initialSurveyData}
            finalSurvey={user.finalSurvey}
            studentName={user.name}
          />
        </div>
      ) : (
        <div className="space-y-6">
          <FinalSurveyStatusCard />

          {/* INITIAL SURVEY DIAGNOSTIC BASELINE */}
          {hasInitial && initialSurveyData && (
            <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border border-emerald-500/20 p-6 rounded-[28px] backdrop-blur-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-medium text-white">Diagnóstico Socioambiental Inicial</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> 21/21 Preguntas
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Línea base diagnóstica registrada • {initialSurveyData.totalScore || 0} puntos totales
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-emerald-300 self-start sm:self-auto">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>+500 EcoMonedas y +150 XP acreditados</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                {categories.map(cat => {
                  const cfg = CATEGORIES_CONFIG[cat];
                  const score = initialSurveyData.categoryScores?.[cat] || 0;
                  const maxPossible = cfg.maxScore || (cat === 'Austeridad' || cat === 'Equidad' ? 2000 : 2400);
                  const pct = Math.min(100, Math.round((score / maxPossible) * 100));

                  return (
                    <div key={cat} className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="truncate text-slate-300">{cfg.icon} {cat.split(' ')[0]}</span>
                        <span className="font-mono font-bold text-emerald-400">{score} pts</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1 overflow-hidden">
                        <div 
                          className="bg-emerald-400 h-1 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4 DIMENSIONS ACTIVITIES BREAKDOWN */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-emerald-400" />
          <h2 className="text-xl sm:text-2xl font-light text-white">Avance por Dimensión Socioambiental</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {categories.map(cat => {
            const cfg = CATEGORIES_CONFIG[cat];
            const catMissions = MAIN_ACTIVITIES.filter(a => a.category === cat);
            const catCompleted = catMissions.filter(a => Boolean(completedMap[a.id]));
            const catCompletedCount = catCompleted.length;
            const catPercent = Math.round((catCompletedCount / catMissions.length) * 100);

            // Calculate total XP and Points earned in this dimension
            const earnedXp = catCompleted.reduce((acc, curr) => acc + curr.xpReward, 0);
            const earnedCoins = catCompleted.reduce((acc, curr) => acc + curr.pointsReward, 0);

            return (
              <div 
                key={cat}
                className="bg-white/5 border border-white/10 p-6 rounded-[28px] backdrop-blur-md space-y-5 hover:border-white/20 transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{cfg.icon}</span>
                    <div>
                      <h3 className="font-medium text-white text-base sm:text-lg">{cat}</h3>
                      <div className="text-xs text-slate-400 mt-0.5">{catCompletedCount} de {catMissions.length} misiones finalizadas</div>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-xl ${cfg.bgLight} ${cfg.color} border ${cfg.borderColor}`}>
                    {catPercent}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-400 to-teal-400 h-2 rounded-full transition-all duration-700"
                      style={{ width: `${catPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] font-mono text-slate-400">
                    <span className="text-amber-400">+{earnedCoins} 🪙 Monedas ganadas</span>
                    <span className="text-purple-400">+{earnedXp} XP ganados</span>
                  </div>
                </div>

                {/* Individual Missions Checklist */}
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Misiones del Programa ({catCompletedCount}/{catMissions.length})
                  </div>
                  <div className="space-y-2">
                    {catMissions.map((act) => {
                      const isDone = Boolean(completedMap[act.id]);
                      return (
                        <div 
                          key={act.id}
                          className={`p-3 rounded-2xl flex items-center justify-between gap-3 border transition-all ${
                            isDone 
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-white' 
                              : 'bg-white/5 border-white/5 text-slate-400'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-lg shrink-0">{act.icon}</span>
                            <div className="truncate">
                              <div className={`text-xs font-medium truncate ${isDone ? 'text-white' : 'text-slate-300'}`}>
                                {act.title}
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                {act.durationText} • +{act.xpReward} XP • +{act.pointsReward} 🪙
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0">
                            {isDone ? (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                                <CheckCircle2 className="w-3 h-3" /> Superada
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">
                                Pendiente
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 10 COMPLEMENTARY ACTIVITIES PROGRESS */}
      <div className="bg-white/5 border border-white/10 p-6 sm:p-8 rounded-[32px] backdrop-blur-md space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 text-2xl font-bold">
              🎮
            </div>
            <div>
              <h3 className="text-xl font-medium text-white">Retos y Minijuegos Complementarios</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                10 actividades secundarias para reforzar conductas sostenibles y sumar EcoMonedas.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/10 self-start sm:self-auto">
            <span className="text-xs text-slate-400 font-medium">Completadas:</span>
            <span className="text-sm font-bold text-blue-400 font-mono">{compCompletedCount} / {COMPLEMENTARY_ACTIVITIES.length}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {COMPLEMENTARY_ACTIVITIES.map((comp) => {
            const isDone = Boolean(completedMap[comp.id]);
            return (
              <div 
                key={comp.id}
                className={`p-3.5 rounded-2xl border flex items-center justify-between gap-2 transition-all ${
                  isDone
                    ? 'bg-blue-500/10 border-blue-500/30 text-white'
                    : 'bg-white/5 border-white/5 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-xl shrink-0">{comp.icon}</span>
                  <div className="truncate">
                    <div className={`text-xs font-medium truncate ${isDone ? 'text-white' : 'text-slate-300'}`}>
                      {comp.title}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      +{comp.pointsReward * 2} XP • +{comp.pointsReward} 🪙
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-white/20 inline-block" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* COMPLETED ACTIVITIES HISTORY */}
      {totalCompletedCount > 0 && (
        <div className="bg-white/5 border border-white/10 p-6 sm:p-8 rounded-[32px] backdrop-blur-md space-y-4">
          <div className="flex items-center gap-2 text-white text-lg font-light">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3>Historial de Actividades Superadas</h3>
          </div>

          <div className="divide-y divide-white/5">
            {Object.entries(completedMap).map(([actId, record]) => {
              const allPossible = [...MAIN_ACTIVITIES, ...COMPLEMENTARY_ACTIVITIES];
              const actInfo = allPossible.find(a => a.id === actId);
              const dateStr = record?.completedAt ? new Date(record.completedAt).toLocaleDateString('es-MX', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              }) : 'Recientemente';

              return (
                <div key={actId} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{actInfo?.icon || '🎯'}</span>
                    <div>
                      <div className="text-sm font-medium text-white">{actInfo?.title || actId}</div>
                      <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{dateStr}</span>
                        {record?.evidenceType && (
                          <span className="text-emerald-400">• Evidencia {record.evidenceType}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-amber-400">+{record?.pointsEarned || 0} 🪙</div>
                    {record?.badgeEarned && (
                      <div className="text-[10px] text-purple-300 font-medium">🏅 {record.badgeEarned}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
