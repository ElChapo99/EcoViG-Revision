import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, CheckCircle2, Scale, Users, Sparkles } from 'lucide-react';
import { MainMissionActivity } from '../../data/surveyData';
import { resolveActivityDestination } from '../../lib/activityResolver';
import ActivityInstructionsAccordion from './ActivityInstructionsAccordion';

interface OpportunitiesGameModalProps {
  activity: MainMissionActivity;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (evidenceData: any) => Promise<void>;
}

interface Scenario {
  id: number;
  title: string;
  context: string;
  options: {
    id: string;
    text: string;
    feedback: string;
    isFair: boolean;
  }[];
}

const SCENARIOS: Scenario[] = [
  {
    id: 1,
    title: 'Caso 1: Participación en el proyecto de ciencias escolar',
    context: 'Dos personas de diferentes orígenes étnicos y culturales solicitan ingresar al equipo para desarrollar un proyecto de robótica ecológica.',
    options: [
      {
        id: '1a',
        text: 'Evaluar las ideas, el entusiasmo y las habilidades técnicas que cada quien propone aportar al equipo.',
        feedback: '¡Excelente decisión! Las oportunidades deben basarse en el talento, la motivación y los aportes de las personas.',
        isFair: true
      },
      {
        id: '1b',
        text: 'Elegir únicamente a quien tenga el mismo estilo cultural que la mayoría del salón para evitar diferencias.',
        feedback: 'Recuerda que la diversidad de perspectivas enriquece las soluciones de los proyectos.',
        isFair: false
      }
    ]
  },
  {
    id: 2,
    title: 'Caso 2: Integración a una actividad extracurricular',
    context: 'Dos estudiantes de diferentes niveles económicos desean formar parte del taller de música y arte ambiental.',
    options: [
      {
        id: '2a',
        text: 'Permitir el acceso a ambos con los mismos instrumentos y materiales compartidos por la escuela.',
        feedback: '¡Correcto! El acceso al aprendizaje de calidad debe ser equitativo para todos.',
        isFair: true
      },
      {
        id: '2b',
        text: 'Dar preferencia solo a quien pueda comprar instrumentos profesionales nuevos por su cuenta.',
        feedback: 'El nivel socioeconómico no debe ser una barrera para acceder a oportunidades de desarrollo.',
        isFair: false
      }
    ]
  },
  {
    id: 3,
    title: 'Caso 3: Elección de liderazgo para un proyecto escolar',
    context: 'Se debe elegir a un representante para coordinar la iniciativa de huertos escolares comunitarios.',
    options: [
      {
        id: '3a',
        text: 'Elegir a quien demuestre compromiso, capacidad de escuchar y propuestas claras para el huerto.',
        feedback: '¡Exacto! El liderazgo efectivo se define por la empatía, la responsabilidad y el trabajo en equipo.',
        isFair: true
      },
      {
        id: '3b',
        text: 'Elegir basándose en estereotipos sociales o apariencia exterior.',
        feedback: 'Las decisiones justas siempre evalúan capacidades y méritos reales.',
        isFair: false
      }
    ]
  }
];

export default function OpportunitiesGameModal({ activity, isOpen, onClose, onSubmit }: OpportunitiesGameModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedChoices, setSelectedChoices] = useState<Record<number, string>>({});
  const [reflectionAnswer, setReflectionAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  if (!isOpen) return null;

  const currentScenario = SCENARIOS[currentStep];
  const allCompleted = Object.keys(selectedChoices).length === SCENARIOS.length;

  const handleSelect = (optionId: string) => {
    setSelectedChoices(prev => ({
      ...prev,
      [currentScenario.id]: optionId
    }));
  };

  const handleNextStep = () => {
    if (currentStep < SCENARIOS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleFinish = async () => {
    if (!allCompleted || !reflectionAnswer) return;
    setIsSubmitting(true);
    try {
      await onSubmit({
        selectedChoices,
        reflectionAnswer,
        completedAt: Date.now()
      });
      setCompleted(true);
      setTimeout(() => {
        setCompleted(false);
        onClose();
      }, 1500);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#0b131e] border border-white/15 rounded-[32px] max-w-2xl w-full p-6 sm:p-8 relative shadow-2xl my-8 max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {completed ? (
          <div className="text-center py-12 space-y-4">
            <div className="w-20 h-20 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center mx-auto border border-purple-500/30">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-light text-white">¡Misión de Equidad Completada!</h3>
            <p className="text-slate-400 text-sm">Has aplicado principios de justicia e igualdad de oportunidades con excelencia.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-3xl">{activity.icon || '⚖️'}</span>
                <div>
                  <h3 className="text-xl font-medium text-white">{activity.title}</h3>
                  <span className="text-xs text-purple-400 font-bold uppercase tracking-wider">
                    Simulador de Decisiones Justas • +{activity.xpReward} XP
                  </span>
                </div>
              </div>
            </div>

            {/* EXPANDABLE PEDAGOGICAL INSTRUCTIONS & CRITERIA ACCORDION */}
            <ActivityInstructionsAccordion 
              instructions={resolveActivityDestination(activity).instructions}
              defaultExpanded={false}
            />

            {/* Step indicator */}
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Escenario {currentStep + 1} de {SCENARIOS.length}</span>
              <div className="flex gap-1.5">
                {SCENARIOS.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 w-8 rounded-full ${
                      i === currentStep
                        ? 'bg-purple-400'
                        : selectedChoices[i + 1]
                        ? 'bg-emerald-400'
                        : 'bg-white/10'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Scenario Content */}
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-4">
              <h4 className="text-base font-medium text-white">{currentScenario.title}</h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
                {currentScenario.context}
              </p>

              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  ¿Cómo decidirías en esta situación?
                </span>
                {currentScenario.options.map((opt) => {
                  const isSelected = selectedChoices[currentScenario.id] === opt.id;

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelect(opt.id)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all text-xs sm:text-sm ${
                        isSelected
                          ? opt.isFair
                            ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-md'
                            : 'bg-amber-500/20 border-amber-400 text-white'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <div className="font-medium">{opt.text}</div>
                      {isSelected && (
                        <div className={`mt-2 text-xs font-medium pt-2 border-t border-white/10 ${opt.isFair ? 'text-emerald-400' : 'text-amber-300'}`}>
                          💡 {opt.feedback}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pagination / Final question */}
            {currentStep < SCENARIOS.length - 1 ? (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={!selectedChoices[currentScenario.id]}
                  className="bg-purple-500 hover:bg-purple-400 text-white font-bold py-3 px-6 rounded-xl text-sm transition-all disabled:opacity-40"
                >
                  Siguiente Escenario →
                </button>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                    Pregunta final de reflexión
                  </label>
                  <p className="text-xs text-purple-300 mb-2 font-medium">
                    ¿Qué características sí deberían considerarse para dar una oportunidad a una persona y cuáles no?
                  </p>
                  <textarea
                    rows={3}
                    value={reflectionAnswer}
                    onChange={(e) => setReflectionAnswer(e.target.value)}
                    placeholder="Escribe tu reflexión sobre qué criterios objetivos considerar (esfuerzo, talento, empatía) vs qué factores no discriminar..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder-slate-500 text-xs sm:text-sm outline-none focus:border-purple-400"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleFinish}
                  disabled={!allCompleted || !reflectionAnswer || isSubmitting}
                  className="w-full bg-purple-500 text-white font-bold py-4 rounded-2xl text-base hover:bg-purple-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                >
                  {isSubmitting ? 'Guardando...' : 'Completar Misión de Oportunidades'}
                </button>
              </motion.div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
