import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  Award, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Compass, 
  ArrowUpRight,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  BarChart3,
  ListOrdered
} from 'lucide-react';
import { 
  SURVEY_QUESTIONS, 
  CATEGORIES_CONFIG, 
  SurveyCategory, 
  SURVEY_OPTIONS_CONFIG,
  getComparableSurveyResults,
  TOTAL_SURVEY_QUESTIONS,
  MIN_SURVEY_TOTAL_SCORE,
  MAX_SURVEY_TOTAL_SCORE
} from '../../data/surveyData';
import { DiagnosticSurveyRecord, SurveyResults } from '../../types';

interface ComparativeResultsViewProps {
  initialSurvey?: DiagnosticSurveyRecord | SurveyResults;
  finalSurvey?: DiagnosticSurveyRecord | SurveyResults;
  studentName?: string;
  onClose?: () => void;
  isModal?: boolean;
}

export default function ComparativeResultsView({
  initialSurvey,
  finalSurvey,
  studentName = 'Estudiante',
  onClose,
  isModal = false,
}: ComparativeResultsViewProps) {
  const [showQuestionsTable, setShowQuestionsTable] = useState(false);
  const [filterCategory, setFilterCategory] = useState<SurveyCategory | 'all'>('all');

  if (!initialSurvey || !finalSurvey) {
    return (
      <div className="p-8 text-center bg-white/5 border border-white/10 rounded-3xl text-slate-300">
        <Compass className="w-12 h-12 text-emerald-400 mx-auto mb-3 opacity-50" />
        <h3 className="text-lg font-medium text-white mb-1">Comparativo no disponible</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Para ver el comparativo, debes haber completado tanto la encuesta diagnóstica inicial como la evaluación final.
        </p>
      </div>
    );
  }

  // Normalize/extract comparable 21-question data (handles legacy 22-question surveys gracefully)
  const initialComp = getComparableSurveyResults(initialSurvey);
  const finalComp = getComparableSurveyResults(finalSurvey);

  const initialTotal = initialComp.totalScore;
  const finalTotal = finalComp.totalScore;
  const deltaTotal = finalTotal - initialTotal;
  const minPossibleTotal = MIN_SURVEY_TOTAL_SCORE; // 2100 (21 questions * 100 min)
  const maxPossibleTotal = MAX_SURVEY_TOTAL_SCORE; // 8400 (21 questions * 400 max)

  // Pedagogical 0-100 normalization: (score - minScore) / (maxScore - minScore) * 100
  const initialPct = initialComp.normalizedPct;
  const finalPct = finalComp.normalizedPct;
  const diffPercentagePoints = finalPct - initialPct;

  const categories: SurveyCategory[] = ['Conducta Pro-Ambiental', 'Austeridad', 'Altruismo', 'Equidad'];

  const filteredQuestions = SURVEY_QUESTIONS.filter(q => {
    if (filterCategory !== 'all' && q.category !== filterCategory) return false;
    return true;
  });

  const isTotalComparable = initialComp.totalComparable && finalComp.totalComparable;

  const content = (
    <div className="space-y-8 font-sans text-white">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600/20 via-teal-600/15 to-slate-900 border-2 border-emerald-500/30 p-6 sm:p-8 rounded-[36px] backdrop-blur-xl shadow-[0_0_40px_rgba(16,185,129,0.2)]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-widest border border-emerald-500/30">
              <Sparkles className="w-4 h-4 text-emerald-400" /> Evaluación Socioambiental Integral
            </div>
            <h2 className="text-2xl sm:text-4xl font-light text-white tracking-tight">
              Evolución Socioambiental: Inicial vs Final
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed">
              Comparativa pedagógica de hábitos ecológicos, austeridad, solidaridad y equidad social a lo largo del programa EcoViG.
            </p>
          </div>

          <div className="flex items-center gap-3 self-stretch md:self-auto justify-end">
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl text-center flex-1 md:flex-initial min-w-[120px]">
              <div className="text-[10px] uppercase font-bold text-slate-400">Puntaje Inicial</div>
              <div className="text-xl sm:text-2xl font-mono font-bold text-slate-200 mt-0.5">{initialTotal}</div>
              <div className="text-[10px] text-slate-400 font-mono">
                {initialComp.totalComparable ? `de ${maxPossibleTotal} (${initialPct}%)` : 'Registro histórico'}
              </div>
            </div>

            <div className="text-2xl text-emerald-400 font-light">➔</div>

            <div className="bg-emerald-500/15 border-2 border-emerald-500/40 p-4 rounded-2xl text-center flex-1 md:flex-initial min-w-[120px] shadow-[0_0_20px_rgba(52,211,153,0.3)]">
              <div className="text-[10px] uppercase font-bold text-emerald-400">Puntaje Final</div>
              <div className="text-xl sm:text-2xl font-mono font-bold text-emerald-300 mt-0.5">{finalTotal}</div>
              <div className="text-[10px] text-emerald-400/80 font-mono">
                {finalComp.totalComparable ? `de ${maxPossibleTotal} (${finalPct}%)` : 'Registro actual'}
              </div>
            </div>
          </div>
        </div>

        {/* Delta Callout */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
              !isTotalComparable
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                : deltaTotal > 0 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                : deltaTotal < 0
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-white/10 text-slate-300 border border-white/20'
            }`}>
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white flex items-center gap-2">
                <span>Evolución Global:</span>
                {isTotalComparable ? (
                  <span className={`font-mono text-base ${deltaTotal > 0 ? 'text-emerald-400' : deltaTotal < 0 ? 'text-amber-400' : 'text-slate-300'}`}>
                    {deltaTotal > 0 
                      ? `+${deltaTotal} puntos (+${diffPercentagePoints} puntos porcentuales)` 
                      : deltaTotal < 0 
                      ? `${deltaTotal} puntos (${diffPercentagePoints} puntos porcentuales)`
                      : '0 puntos (sin cambio)'}
                  </span>
                ) : (
                  <span className="text-amber-300 text-xs font-normal">
                    Comparación global directa no disponible (registro histórico de versión anterior)
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-300">
                {!isTotalComparable
                  ? 'Una de las evaluaciones pertenece a una versión histórica sin desglose por pregunta individual. Los puntajes de dimensiones que no cambiaron se conservan individualmente.'
                  : deltaTotal > 0 
                  ? 'El puntaje global aumentó reflejando una mayor consolidación de hábitos sostenibles y pro-sociales.'
                  : deltaTotal < 0
                  ? 'El puntaje global disminuyó respecto a la línea base inicial en algunas dimensiones.'
                  : 'El puntaje global se mantuvo sin cambio entre la evaluación inicial y final.'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-emerald-300 font-medium bg-emerald-500/15 border border-emerald-500/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Diagnóstico Oficial Verificado
            </span>
          </div>
        </div>
      </div>

      {/* 4 DIMENSIONS COMPARATIVE GRID */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl sm:text-2xl font-light text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" /> Comparativa por Dimensión Socioambiental
          </h3>
          <span className="text-xs text-slate-400">4 Dimensiones Evaluadas</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {categories.map((cat) => {
            const config = CATEGORIES_CONFIG[cat];
            const maxScore = config.maxScore;
            const minScore = config.questionsCount * 100;
            const initScore = initialComp.categoryScores[cat] || 0;
            const finScore = finalComp.categoryScores[cat] || 0;
            const isDimComparable = initialComp.dimensionComparable[cat] && finalComp.dimensionComparable[cat];
            const delta = finScore - initScore;
            
            // Normalized 0-100 percentage
            const initBarPct = Math.max(0, Math.min(100, Math.round(((initScore - minScore) / (maxScore - minScore)) * 100)));
            const finBarPct = Math.max(0, Math.min(100, Math.round(((finScore - minScore) / (maxScore - minScore)) * 100)));
            const diffDimPP = finBarPct - initBarPct;

            return (
              <div 
                key={cat}
                className="bg-white/5 border border-white/10 p-5 sm:p-6 rounded-[28px] backdrop-blur-md space-y-4 hover:border-white/20 transition-all"
              >
                {/* Dimension Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{config.icon}</span>
                    <div>
                      <h4 className="font-medium text-white text-base sm:text-lg">{cat}</h4>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {config.questionsCount} preguntas • Rango {minScore} - {maxScore} pts
                      </div>
                    </div>
                  </div>

                  {isDimComparable ? (
                    <div className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold border ${
                      delta > 0 
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
                        : delta < 0 
                        ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' 
                        : 'bg-white/5 text-slate-400 border-white/10'
                    }`}>
                      {delta > 0 
                        ? `+${delta} pts (+${diffDimPP} pp)` 
                        : delta < 0 
                        ? `${delta} pts (${diffDimPP} pp)` 
                        : '0 pts (sin cambio)'}
                    </div>
                  ) : (
                    <div className="px-2.5 py-1 rounded-xl text-[11px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      Comparación no disponible
                    </div>
                  )}
                </div>

                {/* Side-by-side Progress Bars */}
                <div className="space-y-3 pt-2">
                  {/* Initial Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-400 font-mono">
                      <span>Inicial:</span>
                      <span>
                        {initScore} / {maxScore} {initialComp.dimensionComparable[cat] ? `(${initBarPct}%)` : '(Histórico)'}
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="bg-slate-400 h-2.5 rounded-full transition-all duration-700"
                        style={{ width: `${initBarPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Final Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-emerald-400 font-semibold">Final:</span>
                      <span className="text-emerald-400 font-bold">
                        {finScore} / {maxScore} {finalComp.dimensionComparable[cat] ? `(${finBarPct}%)` : '(Histórico)'}
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-emerald-400 to-teal-400 h-2.5 rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(52,211,153,0.4)]"
                        style={{ width: `${finBarPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Description & Impact Summary */}
                {!isDimComparable ? (
                  <div className="text-xs text-amber-300/80 pt-2 border-t border-white/5">
                    Comparación no disponible para esta dimensión porque esta evaluación pertenece a una versión anterior del cuestionario.
                  </div>
                ) : (
                  <div className="text-xs text-slate-300 pt-2 border-t border-white/5 flex items-center justify-between">
                    <span className="line-clamp-1">{config.description}</span>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-emerald-400 shrink-0 ml-2">
                      {finBarPct >= 75 ? 'Nivel Alto ⭐' : finBarPct >= 50 ? 'Nivel Medio 🌿' : 'En Desarrollo 🌱'}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* QUESTION-BY-QUESTION EVOLUTION ACCORDION */}
      <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 sm:p-8 backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-light text-white flex items-center gap-2">
              <ListOrdered className="w-5 h-5 text-emerald-400" /> Desglose Detallado Pregunta por Pregunta
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Revisa cómo evolucionó tu respuesta en cada una de las 21 preguntas diagnósticas.
            </p>
          </div>

          <button
            onClick={() => setShowQuestionsTable(!showQuestionsTable)}
            className="self-start sm:self-auto bg-white/10 hover:bg-white/15 text-white font-medium text-xs py-2.5 px-4 rounded-xl transition-all flex items-center gap-1.5 border border-white/15"
          >
            {showQuestionsTable ? (
              <>Ocultar Respuestas <ChevronUp className="w-4 h-4" /></>
            ) : (
              <>Ver las 21 Respuestas <ChevronDown className="w-4 h-4" /></>
            )}
          </button>
        </div>

        <AnimatePresence>
          {showQuestionsTable && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 pt-4 border-t border-white/10 overflow-hidden"
            >
              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterCategory('all')}
                  className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                    filterCategory === 'all'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                      : 'bg-white/5 text-slate-400 border-white/5 hover:text-white'
                  }`}
                >
                  Todas (21)
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                      filterCategory === cat
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                        : 'bg-white/5 text-slate-400 border-white/5 hover:text-white'
                    }`}
                  >
                    {CATEGORIES_CONFIG[cat].icon} {cat}
                  </button>
                ))}
              </div>

              {/* Questions List */}
              <div className="space-y-3">
                {filteredQuestions.map(q => {
                  const initAns = initialComp.answers[q.id];
                  const finalAns = finalComp.answers[q.id];
                  const initScore = initAns?.score ?? 0;
                  const finalScore = finalAns?.score ?? 0;
                  const delta = finalScore - initScore;
                  const catCfg = CATEGORIES_CONFIG[q.category];

                  return (
                    <div 
                      key={q.id}
                      className="p-4 rounded-2xl bg-black/20 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 max-w-xl">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-400">#{q.number}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${catCfg.bgLight} ${catCfg.color} border ${catCfg.borderColor}`}>
                            {q.category}
                          </span>
                          {q.reverseScoring && (
                            <span className="text-[10px] text-amber-400/80 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                              Invertida
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-200">
                          {q.text}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                        <div className="text-right">
                          <div className="text-[10px] text-slate-400">Inicial:</div>
                          <div className="text-xs font-medium text-slate-300">{initAns?.selectedOption || 'N/A'}</div>
                          <div className="text-[10px] font-mono text-slate-400">{initScore} pts</div>
                        </div>

                        <div className="text-slate-500 font-light">➔</div>

                        <div className="text-right">
                          <div className="text-[10px] text-emerald-400 font-semibold">Final:</div>
                          <div className="text-xs font-bold text-emerald-300">{finalAns?.selectedOption || 'N/A'}</div>
                          <div className="text-[10px] font-mono font-bold text-emerald-400">{finalScore} pts</div>
                        </div>

                        <div className={`w-14 text-center px-1.5 py-1 rounded-lg text-xs font-mono font-bold border ${
                          delta > 0 
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                            : delta < 0 
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                            : 'bg-white/5 text-slate-400 border-white/10'
                        }`}>
                          {delta > 0 ? `+${delta}` : delta === 0 ? '=' : delta}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer / Close Button */}
      {isModal && onClose && (
        <div className="pt-4 flex justify-end">
          <button
            onClick={onClose}
            className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-6 py-3 rounded-2xl text-sm transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
          >
            Cerrar Comparativo
          </button>
        </div>
      )}
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#0b101b] border border-white/15 rounded-[36px] max-w-4xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto relative shadow-2xl"
        >
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-slate-400 hover:text-white text-xl p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            ✕
          </button>
          {content}
        </motion.div>
      </div>
    );
  }

  return content;
}
