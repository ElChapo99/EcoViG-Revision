import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Target, 
  Award, 
  Zap, 
  Coins, 
  Flame, 
  TreePine, 
  Droplets, 
  Bird, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  Lock as LockIcon, 
  Globe, 
  Compass, 
  User as UserIcon, 
  Mail, 
  BookOpen,
  Sparkles
} from 'lucide-react';
import { User, CompletedActivityRecord } from '../../types';
import { MAIN_ACTIVITIES, COMPLEMENTARY_ACTIVITIES, CATEGORIES_CONFIG, SurveyCategory } from '../../data/surveyData';
import { BIOMES, getBiomeUnlockStatus } from '../../lib/worldProgress';
import { PROJECT_TIME_ZONE } from '../../lib/multiDayMissionProgress';

interface StudentDetailModalProps {
  student: User | null;
  teacherName?: string;
  onClose: () => void;
}

export default function StudentDetailModal({ student, teacherName, onClose }: StudentDetailModalProps) {
  if (!student) return null;

  const completedMap: Record<string, CompletedActivityRecord> = (student.completedActivities as any) || {};
  const completedIds = Object.keys(completedMap);
  const mainCompletedCount = MAIN_ACTIVITIES.filter(a => Boolean(completedMap[a.id])).length;
  const compCompletedCount = COMPLEMENTARY_ACTIVITIES.filter(a => Boolean(completedMap[a.id])).length;
  const totalCompleted = completedIds.length;
  const totalMandatory = MAIN_ACTIVITIES.length; // 12
  const mainPercent = Math.round((mainCompletedCount / totalMandatory) * 100);

  const eco = student.ecosystem || { trees: 0, water: 0, animals: 0 };
  const categories: SurveyCategory[] = ['Conducta Pro-Ambiental', 'Austeridad', 'Altruismo', 'Equidad'];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-[#0b131e] border border-white/15 w-full max-w-4xl max-h-[92vh] rounded-[36px] overflow-hidden flex flex-col shadow-2xl"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shrink-0">
                {student.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-medium text-white">{student.name}</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30">
                    Nivel {student.level || 1}
                  </span>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-500" /> {student.email}
                  </span>
                  {teacherName && (
                    <span className="text-emerald-400 font-medium">
                      • Docente: {teacherName}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-10 h-10 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors border border-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-5 sm:p-7 overflow-y-auto space-y-7 custom-scrollbar flex-1 font-sans">
            {/* Top Quick Stats Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Misiones Obligatorias</span>
                  <Target className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-white font-mono">
                  {mainCompletedCount} <span className="text-xs font-normal text-slate-400">/ 12</span>
                </div>
                <div className="text-[10px] text-emerald-400 mt-0.5 font-bold">
                  {mainPercent}% completado
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Experiencia Total</span>
                  <Zap className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-purple-300 font-mono">
                  {student.xp || 0} <span className="text-xs font-normal text-slate-400">XP</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Nivel {student.level || 1}
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>EcoMonedas</span>
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="text-2xl font-bold text-amber-300 font-mono">
                  {student.coins || 0} <span className="text-xs font-normal text-slate-400">🪙</span>
                </div>
                <div className="text-[10px] text-amber-400/80 mt-0.5">
                  Balance actual
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Constancia / Racha</span>
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                </div>
                <div className="text-2xl font-bold text-orange-300 font-mono">
                  {student.streak || 0} <span className="text-xs font-normal text-slate-400">días</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Racha activa
                </div>
              </div>
            </div>

            {/* Overall Missions Progress Bar */}
            <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border border-emerald-500/20 p-4 sm:p-5 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white font-medium flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-emerald-400" /> Avance en Misiones Obligatorias
                </span>
                <span className="font-mono font-bold text-emerald-400">
                  {mainCompletedCount} de 12 ({mainPercent}%)
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-400 to-teal-400 h-2.5 rounded-full transition-all duration-700"
                  style={{ width: `${mainPercent}%` }}
                />
              </div>
            </div>

            {/* 4 Socio-Environmental Dimensions Breakdown */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white font-medium text-base">
                <Compass className="w-4 h-4 text-emerald-400" />
                <h3>Desempeño por Dimensión Socioambiental</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {categories.map((cat) => {
                  const cfg = CATEGORIES_CONFIG[cat];
                  const catMissions = MAIN_ACTIVITIES.filter(a => a.category === cat);
                  const catCompleted = catMissions.filter(a => Boolean(completedMap[a.id]));
                  const catDoneCount = catCompleted.length;
                  const catPercent = Math.round((catDoneCount / catMissions.length) * 100);

                  return (
                    <div key={cat} className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{cfg.icon}</span>
                          <span className="text-sm font-medium text-white">{cat}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${cfg.bgLight} ${cfg.color} border ${cfg.borderColor}`}>
                          {catDoneCount}/{catMissions.length}
                        </span>
                      </div>

                      <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-emerald-400 to-teal-400 h-2 rounded-full transition-all duration-700"
                          style={{ width: `${catPercent}%` }}
                        />
                      </div>

                      <div className="flex flex-col gap-1 pt-1">
                        {catMissions.map((act) => {
                          const isDone = Boolean(completedMap[act.id]);
                          return (
                            <div key={act.id} className="flex items-center justify-between text-[11px] py-1 border-t border-white/5">
                              <span className={`truncate max-w-[200px] sm:max-w-[240px] ${isDone ? 'text-slate-200' : 'text-slate-500'}`}>
                                {act.title}
                              </span>
                              {isDone ? (
                                <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                                  <CheckCircle2 className="w-3 h-3" /> Hecha
                                </span>
                              ) : (
                                <span className="text-slate-500 text-[10px]">Pendiente</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Worlds and Biomes Unlock Status */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white font-medium text-base">
                <Globe className="w-4 h-4 text-emerald-400" />
                <h3>Mundos y Ecosistemas Desbloqueados</h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {BIOMES.map((biome) => {
                  const status = getBiomeUnlockStatus(student, biome.id);
                  return (
                    <div 
                      key={biome.id}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        status.isUnlocked
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-white'
                          : 'bg-white/5 border-white/10 opacity-75'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-2xl">{biome.icon}</span>
                        {status.isUnlocked ? (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                            ✓ Activo
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                            <LockIcon className="w-2.5 h-2.5 inline mr-0.5" /> Bloqueado
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-bold text-white">{biome.name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {status.isUnlocked ? 'Desbloqueado' : `${biome.requiredMissions} misiones obligatorias`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Ecosystem Stats */}
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-3">
              <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Ecosistema Virtual del Estudiante
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <div className="text-xl font-bold text-emerald-400">{eco.trees}</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">Flora (Árboles)</div>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <div className="text-xl font-bold text-teal-400">{eco.water}</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">Agua Limpia</div>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <div className="text-xl font-bold text-amber-400">{eco.animals}</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">Fauna Silvestre</div>
                </div>
              </div>
            </div>

            {/* Full Missions History */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white font-medium text-base">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <h3>Historial de Actividades Superadas ({totalCompleted})</h3>
                </div>
              </div>

              {totalCompleted === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs bg-white/5 rounded-2xl border border-white/5">
                  El estudiante aún no ha completado actividades.
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                  {Object.entries(completedMap).map(([actId, record]) => {
                    const allPossible = [...MAIN_ACTIVITIES, ...COMPLEMENTARY_ACTIVITIES];
                    const actInfo = allPossible.find(a => a.id === actId);
                    const dateStr = record?.completedAt ? new Date(record.completedAt).toLocaleDateString('es-MX', {
                      timeZone: PROJECT_TIME_ZONE,
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    }) : 'Completado';

                    return (
                      <div key={actId} className="bg-white/5 border border-white/5 p-3 rounded-xl flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-xl shrink-0">{actInfo?.icon || '🎯'}</span>
                          <div className="truncate">
                            <div className="font-medium text-white truncate">{actInfo?.title || actId}</div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                              <span>{dateStr}</span>
                              {record?.evidenceType && (
                                <span className="text-emerald-400 font-medium">• {record.evidenceType}</span>
                              )}
                              {record?.feedback && (
                                <span className="text-slate-400 truncate max-w-[200px]">"{record.feedback}"</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="font-mono font-bold text-amber-400">+{record?.pointsEarned || 0} 🪙</div>
                          {record?.badgeEarned && (
                            <div className="text-[10px] text-purple-300 font-medium">🏅 {record.badgeEarned}</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Badges Gallery */}
            {student.badges && student.badges.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-white font-medium text-base">
                  <Award className="w-4 h-4 text-amber-400" />
                  <h3>Insignias Obtenidas ({student.badges.length})</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {student.badges.map((badge, idx) => (
                    <span 
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium"
                    >
                      <Sparkles className="w-3 h-3 text-amber-400" /> {badge}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
