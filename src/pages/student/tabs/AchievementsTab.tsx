import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { Award, Trophy, Sparkles, CheckCircle2, Lock as LockIcon, Zap, Coins, Filter } from 'lucide-react';
import { ALL_ACHIEVEMENTS, AchievementCategory } from '../../../data/achievements';
import { CATEGORIES_CONFIG, SurveyCategory } from '../../../data/surveyData';

const FILTER_TABS: { id: AchievementCategory; label: string; icon: string }[] = [
  { id: 'all', label: 'Todos los Logros', icon: '🏆' },
  { id: 'Conducta Pro-Ambiental', label: 'Pro-Ambiental', icon: '🌱' },
  { id: 'Austeridad', label: 'Austeridad', icon: '💡' },
  { id: 'Altruismo', label: 'Altruismo', icon: '🤝' },
  { id: 'Equidad', label: 'Equidad', icon: '⚖️' },
  { id: 'General', label: 'Especiales / Racha', icon: '🔥' },
  { id: 'Minijuegos', label: 'Minijuegos', icon: '🎮' },
];

export default function AchievementsTab() {
  const { user } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState<AchievementCategory>('all');

  if (!user) return null;

  const totalAchievements = ALL_ACHIEVEMENTS.length;
  const unlockedList = ALL_ACHIEVEMENTS.filter(a => a.checkUnlocked(user));
  const unlockedCount = unlockedList.length;
  const progressPercent = Math.round((unlockedCount / totalAchievements) * 100);
  const totalEarnedXp = unlockedList.reduce((acc, curr) => acc + curr.xpReward, 0);

  const filteredAchievements = ALL_ACHIEVEMENTS.filter(a => {
    if (selectedFilter === 'all') return true;
    return a.category === selectedFilter;
  });

  return (
    <div className="space-y-8 pb-12 font-sans">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-light text-white mb-1">Logros e Insignias</h1>
          <p className="text-emerald-400 font-medium text-sm">
            Reconocimiento por tus acciones en las 4 dimensiones socioambientales.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl backdrop-blur-md self-start sm:self-auto">
          <Trophy className="w-5 h-5 text-amber-400" />
          <div>
            <div className="text-xs text-slate-400">Progreso Global</div>
            <div className="text-sm font-bold text-white font-mono">{unlockedCount} de {totalAchievements} ({progressPercent}%)</div>
          </div>
        </div>
      </header>

      {/* Progress & Stats Banner */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border border-emerald-500/20 p-6 rounded-[28px] backdrop-blur-xl">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xl font-bold">
              🏆
            </div>
            <div>
              <div className="text-2xl font-bold text-white font-mono">{unlockedCount} / {totalAchievements}</div>
              <div className="text-xs text-slate-400">Logros Desbloqueados</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400 text-xl font-bold">
              ⚡
            </div>
            <div>
              <div className="text-2xl font-bold text-white font-mono">+{totalEarnedXp} XP</div>
              <div className="text-xs text-slate-400">XP Obtenida por Logros</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-400 text-xl font-bold">
              🎖️
            </div>
            <div>
              <div className="text-2xl font-bold text-white font-mono">{user.badges?.length || unlockedCount}</div>
              <div className="text-xs text-slate-400">Insignias en tu Perfil</div>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-slate-400 font-medium">
            <span>Completitud de Colección</span>
            <span className="text-emerald-400 font-mono font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-300 h-2.5 rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(52,211,153,0.4)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-2">
        {FILTER_TABS.map(tab => {
          const isSelected = selectedFilter === tab.id;
          const countInCat = ALL_ACHIEVEMENTS.filter(a => tab.id === 'all' || a.category === tab.id).length;
          const unlockedInCat = ALL_ACHIEVEMENTS.filter(a => (tab.id === 'all' || a.category === tab.id) && a.checkUnlocked(user)).length;

          return (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
                isSelected
                  ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                isSelected ? 'bg-black/20 text-black' : 'bg-white/10 text-slate-400'
              }`}>
                {unlockedInCat}/{countInCat}
              </span>
            </button>
          );
        })}
      </div>

      {/* Achievements Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map(achievement => {
          const isUnlocked = achievement.checkUnlocked(user);
          const progress = achievement.getProgress(user);

          // Get category color accent
          let catColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
          if (achievement.category === 'Austeridad') {
            catColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
          } else if (achievement.category === 'Altruismo') {
            catColor = 'text-teal-400 bg-teal-500/10 border-teal-500/20';
          } else if (achievement.category === 'Equidad') {
            catColor = 'text-purple-400 bg-purple-500/10 border-purple-500/20';
          } else if (achievement.category === 'Minijuegos') {
            catColor = 'text-blue-400 bg-blue-500/10 border-blue-500/20';
          }

          return (
            <div
              key={achievement.id}
              className={`p-5 rounded-[26px] border transition-all flex flex-col justify-between backdrop-blur-md relative overflow-hidden ${
                isUnlocked
                  ? 'bg-white/5 border-emerald-500/30 shadow-[0_0_25px_rgba(52,211,153,0.1)] hover:border-emerald-400/50'
                  : 'bg-white/5 border-white/5 opacity-60 hover:opacity-85'
              }`}
            >
              {isUnlocked && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 blur-2xl pointer-events-none" />
              )}

              <div>
                {/* Top badges & Tag */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border uppercase tracking-wider ${catColor}`}>
                    {achievement.category}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 fill-amber-400" /> +{achievement.xpReward} XP
                    </span>
                  </div>
                </div>

                {/* Main Icon & Title */}
                <div className="flex items-start gap-3.5 mb-3">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-lg ${
                    isUnlocked 
                      ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/30 border border-emerald-400/40 shadow-[0_0_15px_rgba(52,211,153,0.2)]' 
                      : 'bg-white/5 border border-white/10 grayscale'
                  }`}>
                    {achievement.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-base font-medium text-white leading-tight">
                        {achievement.title}
                      </h3>
                      {isUnlocked ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <LockIcon className="w-4 h-4 text-slate-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {achievement.desc}
                    </p>
                  </div>
                </div>
              </div>

              {/* Requirement & Progress footer */}
              <div className="pt-3 mt-3 border-t border-white/5 space-y-2">
                <div className="text-[11px] text-slate-400">
                  <span className="text-slate-500 font-medium">Requisito:</span> {achievement.requirement}
                </div>

                <div className="flex items-center justify-between text-xs font-mono">
                  <span className={isUnlocked ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                    {progress.progressText}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    isUnlocked ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/5 text-slate-500'
                  }`}>
                    {isUnlocked ? 'Desbloqueado' : 'Por Desbloquear'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
