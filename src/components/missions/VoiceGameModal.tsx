import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, CheckCircle2, Award, Sparkles, MessageSquare, Volume2 } from 'lucide-react';
import { MainMissionActivity } from '../../data/surveyData';
import { resolveActivityDestination } from '../../lib/activityResolver';
import ActivityInstructionsAccordion from './ActivityInstructionsAccordion';

interface VoiceGameModalProps {
  activity: MainMissionActivity;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (evidenceData: any) => Promise<void>;
}

interface VoiceSituation {
  id: number;
  situation: string;
  recommendedChoice: 'Ambos' | 'Profesor' | 'Estudiantes';
  explanation: string;
}

const VOICE_SITUATIONS: VoiceSituation[] = [
  {
    id: 1,
    situation: 'El grupo realizará un proyecto socioambiental durante todo el mes. ¿Quién debería participar en la elección del tema a investigar?',
    recommendedChoice: 'Ambos',
    explanation: 'La colaboración entre docente y alumnos asegura que el tema cumpla con los objetivos de aprendizaje y motive el interés de los estudiantes.'
  },
  {
    id: 2,
    situation: 'Se redactarán los acuerdos de convivencia y cuidado del salón de clases para el ciclo escolar. ¿Quién debería opinar?',
    recommendedChoice: 'Ambos',
    explanation: 'Cuando las normas se construyen en consenso, toda la comunidad escolar se siente respetada y comprometida a cumplirlas.'
  },
  {
    id: 3,
    situation: 'Definir el criterio de evaluación oficial y acreditación curricular según el programa educativo.',
    recommendedChoice: 'Profesor',
    explanation: 'El docente cuenta con la formación pedagógica e institucional para establecer las pautas técnicas y asegurar el rigor académico.'
  },
  {
    id: 4,
    situation: 'Organizar las actividades y dinámicas del festival de bienvenida o semana ecológica escolar.',
    recommendedChoice: 'Ambos',
    explanation: 'Los estudiantes aportan creatividad e ideas frescas, mientras los profesores coordinan la seguridad y logística general.'
  },
  {
    id: 5,
    situation: 'Elegir el nombre y lema del equipo estudiantil para la campaña de reciclaje.',
    recommendedChoice: 'Estudiantes',
    explanation: 'Fomentar la autonomía y voz de los estudiantes en su identidad de equipo fortalece su sentido de pertenencia y liderazgo.'
  }
];

export default function VoiceGameModal({ activity, isOpen, onClose, onSubmit }: VoiceGameModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [reflectionAnswer, setReflectionAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  if (!isOpen) return null;

  const currentSituation = VOICE_SITUATIONS[currentStep];
  const allCompleted = Object.keys(answers).length === VOICE_SITUATIONS.length;

  const handleSelectVoice = (choice: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentSituation.id]: choice
    }));
  };

  const handleNext = () => {
    if (currentStep < VOICE_SITUATIONS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleFinish = async () => {
    if (!allCompleted || !reflectionAnswer) return;
    setIsSubmitting(true);
    try {
      await onSubmit({
        answers,
        reflectionAnswer,
        badgeEarned: 'Voz equitativa',
        completedAt: Date.now()
      });
      setCompleted(true);
      setTimeout(() => {
        setCompleted(false);
        onClose();
      }, 1800);
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
            <div className="w-24 h-24 bg-purple-500/20 text-purple-400 rounded-3xl flex items-center justify-center mx-auto border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
              <Award className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-light text-white">¡Insignia "Voz equitativa" Desbloqueada!</h3>
            <p className="text-slate-400 text-sm">Has completado el juego de deliberación reconociendo el valor de cada voz en la escuela.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-3xl">{activity.icon || '🗣️'}</span>
                <div>
                  <h3 className="text-xl font-medium text-white">{activity.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-purple-400 font-bold uppercase tracking-wider">
                      Juego de Participación • +{activity.xpReward} XP
                    </span>
                    <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <Award className="w-3 h-3" /> Insignia Especial
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* EXPANDABLE PEDAGOGICAL INSTRUCTIONS & CRITERIA ACCORDION */}
            <ActivityInstructionsAccordion 
              instructions={resolveActivityDestination(activity).instructions}
              defaultExpanded={false}
            />

            {/* Progress dots */}
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Situación {currentStep + 1} de {VOICE_SITUATIONS.length}</span>
              <div className="flex gap-1.5">
                {VOICE_SITUATIONS.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 w-6 rounded-full ${
                      i === currentStep
                        ? 'bg-purple-400'
                        : answers[i + 1]
                        ? 'bg-emerald-400'
                        : 'bg-white/10'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Situation Card */}
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-4">
              <h4 className="text-sm sm:text-base font-medium text-white leading-snug">
                "{currentSituation.situation}"
              </h4>

              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  ¿Quién debería participar?
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {['El profesor', 'Los estudiantes', 'Ambos'].map((choice) => {
                    const isSelected = answers[currentSituation.id] === choice;
                    return (
                      <button
                        key={choice}
                        type="button"
                        onClick={() => handleSelectVoice(choice)}
                        className={`py-3 px-2 rounded-xl text-xs font-bold transition-all text-center ${
                          isSelected
                            ? 'bg-purple-500 text-white shadow-md'
                            : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                        }`}
                      >
                        {choice}
                      </button>
                    );
                  })}
                </div>
              </div>

              {answers[currentSituation.id] && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-purple-500/10 border border-purple-500/20 p-3 rounded-xl text-xs text-purple-200"
                >
                  <strong className="block text-purple-300 font-semibold mb-0.5">Reflexión pedagógica:</strong>
                  {currentSituation.explanation}
                </motion.div>
              )}
            </div>

            {/* Pagination / Final question */}
            {currentStep < VOICE_SITUATIONS.length - 1 ? (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!answers[currentSituation.id]}
                  className="bg-purple-500 hover:bg-purple-400 text-white font-bold py-3 px-6 rounded-xl text-sm transition-all disabled:opacity-40"
                >
                  Siguiente Situación →
                </button>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                    Pregunta final para obtener la insignia "Voz equitativa"
                  </label>
                  <p className="text-xs text-purple-300 mb-2 font-medium">
                    "Un estudiante tiene una propuesta para mejorar una actividad de clase. ¿Qué debería ocurrir?"
                  </p>
                  <textarea
                    rows={3}
                    value={reflectionAnswer}
                    onChange={(e) => setReflectionAnswer(e.target.value)}
                    placeholder="Describe cómo el docente y el grupo deberían escuchar, retroalimentar e integrar la propuesta..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder-slate-500 text-xs sm:text-sm outline-none focus:border-purple-400"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleFinish}
                  disabled={!allCompleted || !reflectionAnswer || isSubmitting}
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold py-4 rounded-2xl text-base hover:from-purple-400 hover:to-indigo-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                >
                  {isSubmitting ? 'Verificando...' : 'Obtener Insignia "Voz equitativa" y Completar'}
                </button>
              </motion.div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
