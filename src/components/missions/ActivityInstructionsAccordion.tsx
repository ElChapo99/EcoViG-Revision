import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Info, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Award, 
  ShieldAlert, 
  Lightbulb, 
  Layers
} from 'lucide-react';
import { ActivityInstructionsMeta } from '../../lib/activityResolver';

interface ActivityInstructionsAccordionProps {
  instructions: ActivityInstructionsMeta;
  defaultExpanded?: boolean;
  className?: string;
}

export default function ActivityInstructionsAccordion({
  instructions,
  defaultExpanded = true,
  className = ''
}: ActivityInstructionsAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={`bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md transition-all ${className}`}>
      {/* Header / Toggle Button */}
      <button
        type="button"
        onClick={() => setIsExpanded(prev => !prev)}
        className="w-full p-3.5 sm:p-4 flex items-center justify-between gap-3 text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs sm:text-sm font-semibold text-white flex items-center gap-1.5">
              Instrucciones y Criterios de la Actividad
            </span>
            <span className="text-[11px] text-emerald-400/80 block">
              {instructions.durationText} • +{instructions.xpReward} XP • +{instructions.pointsReward} pts
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10 shrink-0">
          <span className="hidden sm:inline">{isExpanded ? 'Ocultar' : 'Ver detalle'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </button>

      {/* Collapsible Content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-1 sm:p-5 sm:pt-2 border-t border-white/5 space-y-3.5 text-xs text-slate-300">
              {/* Objective */}
              {instructions.objective && (
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Objetivo Pedagógico
                  </span>
                  <p className="text-slate-200 leading-relaxed bg-white/5 p-2.5 rounded-xl border border-white/5">
                    {instructions.objective}
                  </p>
                </div>
              )}

              {/* Steps / Instructions list */}
              {instructions.steps && instructions.steps.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 flex items-center gap-1">
                    <Layers className="w-3 h-3" /> Pasos a Seguir
                  </span>
                  <div className="space-y-1.5">
                    {instructions.steps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2 bg-black/20 p-2 rounded-xl border border-white/5">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed text-slate-200">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Associated diagnostic question if applicable */}
              {instructions.associatedQuestion && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl flex items-start gap-2 text-emerald-200">
                  <Lightbulb className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-[10px] uppercase tracking-wider text-emerald-300">
                      Vinculada a tu Encuesta Diagnóstica:
                    </span>
                    <span className="italic text-[11px]">"{instructions.associatedQuestion}"</span>
                  </div>
                </div>
              )}

              {/* Requirements & Criteria */}
              {instructions.criterias && instructions.criterias.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Criterios de Acreditación
                  </span>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-slate-300">
                    {instructions.criterias.map((crit, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 bg-white/5 p-2 rounded-lg">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>{crit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Score Policy Note */}
              <div className="bg-emerald-500/5 border border-emerald-500/20 p-2.5 rounded-xl space-y-1 text-[11px] text-slate-300">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[10px] uppercase tracking-wider">
                  <Info className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Sistema de Puntuación y Recompensas</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Las <strong>notas y reflexiones escritas son indispensables para la acreditación</strong> de la actividad, pero no generan puntuación numérica por sí solas. La <strong>XP</strong> aumenta tu nivel y las <strong>EcoMonedas</strong> se acreditan al completar la totalidad de la misión.
                </p>
              </div>

              {/* Rewards Summary Row */}
              <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" /> {instructions.durationText}
                  </span>
                  <span className="text-emerald-400 font-bold font-mono">
                    +{instructions.xpReward} XP
                  </span>
                  <span className="text-amber-300 font-bold font-mono">
                    +{instructions.pointsReward} pts
                  </span>
                </div>

                {instructions.badge && (
                  <span className="text-[10px] text-purple-300 font-bold bg-purple-500/20 border border-purple-500/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Award className="w-3 h-3 text-purple-400" /> Insignia: {instructions.badge}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
