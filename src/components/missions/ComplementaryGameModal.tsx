import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, Award, Sparkles, Trash2, ArrowRight, ShieldAlert } from 'lucide-react';
import { ComplementaryActivity } from '../../data/surveyData';
import { resolveActivityDestination } from '../../lib/activityResolver';
import ActivityInstructionsAccordion from './ActivityInstructionsAccordion';

interface ComplementaryGameModalProps {
  activity: ComplementaryActivity;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (evidenceData: any) => Promise<void>;
}

export default function ComplementaryGameModal({ activity, isOpen, onClose, onSubmit }: ComplementaryGameModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(activity.pointsReward);
  const [badgeAwarded, setBadgeAwarded] = useState<string | undefined>(activity.badge);

  // Form states for different activities
  // 1. Detective
  const [detectedProblems, setDetectedProblems] = useState<string[]>([]);
  const [detectiveFixProposal, setDetectiveFixProposal] = useState('');

  // 2. Sorting game (¿En qué bote va?)
  const [sortIndex, setSortIndex] = useState(0);
  const [sortScore, setSortScore] = useState(0);
  const [sortFeedback, setSortFeedback] = useState<string | null>(null);

  // 4. Waste hunter
  const [waste1, setWaste1] = useState({ situation: '', solution: '' });
  const [waste2, setWaste2] = useState({ situation: '', solution: '' });
  const [waste3, setWaste3] = useState({ situation: '', solution: '' });

  // 5. Ecoescape
  const [escapeStep, setEscapeStep] = useState(0);
  const [escapeErrors, setEscapeErrors] = useState(0);

  // 6. Secret help
  const [secretActionText, setSecretActionText] = useState('');

  // 7. What would you do
  const [scenarioStep, setScenarioStep] = useState(0);

  // 8. Chain of favors
  const [chainActionText, setChainActionText] = useState('');
  const [chainInvitedPerson, setChainInvitedPerson] = useState('');

  // 9. Solution builder
  const [techPiece, setTechPiece] = useState('');
  const [naturePiece, setNaturePiece] = useState('');
  const [communityPiece, setCommunityPiece] = useState('');

  // 10. Superpower
  const [selectedPower, setSelectedPower] = useState<'Ahorrador de agua' | 'Guardián de energía' | 'Maestro de reutilización' | 'Agente solidario'>('Ahorrador de agua');
  const [powerPledge, setPowerPledge] = useState('');

  if (!isOpen) return null;

  // Items for ¿En qué bote va?
  const SORT_ITEMS = [
    { name: 'Cáscaras de plátano y manzana', bin: 'Organico', icon: '🍌' },
    { name: 'Botella de plástico limpia y aplastada', bin: 'InorganicoReciclable', icon: '🧴' },
    { name: 'Servilleta de papel con grasa', bin: 'InorganicoNoReciclable', icon: '🧻' },
    { name: 'Caja de cartón desarmada y seca', bin: 'InorganicoReciclable', icon: '📦' },
    { name: 'Restos de café y té', bin: 'Organico', icon: '☕' },
  ];

  // Steps for Ecoescape
  const ESCAPE_CHALLENGES = [
    {
      question: '🚨 Alerta 1: Una fuga de agua en el jardín pierde 5 litros por minuto.',
      options: ['Cerrar la llave de paso de inmediato y avisar a mantenimiento', 'Poner una toalla encima para que no salpique', 'Dejarla correr hasta la tarde'],
      correct: 0
    },
    {
      question: '🚨 Alerta 2: Todas las computadoras de la sala quedaron encendidas en modo reposo.',
      options: ['Dejarlas prendidas', 'Apagar completamente los equipos y reguladores', 'Bajar el brillo de una'],
      correct: 1
    },
    {
      question: '🚨 Alerta 3: Se acumularon 20 botellas plásticas tras el recreo.',
      options: ['Quemarlas en un bote', 'Tirarlas en el pasto', 'Aplastarlas y llevarlas al contenedor de PET'],
      correct: 2
    },
    {
      question: '🚨 Alerta 4: Se requiere refrescar el salón en época de calor moderado.',
      options: ['Abrir ventanas opuestas para ventilación cruzada natural', 'Encender 3 aires acondicionados a 16°C con ventanas abiertas', 'No hacer nada'],
      correct: 0
    },
    {
      question: '🚨 Alerta 5: Almuerzo escolar con residuos orgánicos e inorgánicos.',
      options: ['Mezclar todo en la misma bolsa', 'Separar los residuos orgánicos para composta escolar', 'Tirar los restos en la jardinera sin control'],
      correct: 1
    }
  ];

  const handleFinish = async (customPoints?: number, customBadge?: string) => {
    setIsSubmitting(true);
    const finalPoints = customPoints ?? pointsEarned;
    const finalBadge = customBadge ?? badgeAwarded;

    try {
      const payload: Record<string, any> = {
        activityId: activity.id,
        pointsEarned: finalPoints,
        completedAt: Date.now()
      };
      if (finalBadge) {
        payload.badgeEarned = finalBadge;
      }

      await onSubmit(payload);
      setPointsEarned(finalPoints);
      if (finalBadge) setBadgeAwarded(finalBadge);
      setCompleted(true);
      setTimeout(() => {
        setCompleted(false);
        onClose();
      }, 1600);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContent = () => {
    switch (activity.id) {
      // 1. Detective ecológico
      case 'comp_1': {
        const issues = [
          'Grifo goteando en el sanitario',
          'Luces encendidas en salón vacío',
          'Basura no separada en el patio',
          'Computadoras encendidas fuera de horario',
          'Hojas de papel tiradas sin usar el reverso'
        ];
        const identifiedCount = detectedProblems.length;
        const qualifiesBonus = identifiedCount >= 4 && detectiveFixProposal.length > 5;
        const total = 10 + (qualifiesBonus ? 5 : 0);

        return (
          <div className="space-y-4">
            <p className="text-xs text-slate-300">
              Marca los problemas ambientales que has detectado en tu entorno escolar o del hogar:
            </p>
            <div className="space-y-2">
              {issues.map((issue) => {
                const checked = detectedProblems.includes(issue);
                return (
                  <button
                    key={issue}
                    type="button"
                    onClick={() => {
                      setDetectedProblems(prev => 
                        checked ? prev.filter(i => i !== issue) : [...prev, issue]
                      );
                    }}
                    className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm flex items-center justify-between ${
                      checked ? 'bg-emerald-500/20 border-emerald-400 text-white' : 'bg-white/5 border-white/10 text-slate-300'
                    }`}
                  >
                    <span>{issue}</span>
                    <span className="text-xs font-bold">{checked ? '✓ Detectado' : '+ Marcar'}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-2">
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Propuesta de Solución para corregir uno de los problemas (+5 pts bonus):
              </label>
              <textarea
                rows={2}
                value={detectiveFixProposal}
                onChange={(e) => setDetectiveFixProposal(e.target.value)}
                placeholder="Describe una acción concreta para solucionar uno de los problemas detectados..."
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-emerald-400"
              />
            </div>

            <button
              onClick={() => handleFinish(total)}
              disabled={detectedProblems.length < 2 || isSubmitting}
              className="w-full bg-emerald-500 text-black font-bold py-3.5 rounded-xl text-sm hover:bg-emerald-400 transition-colors disabled:opacity-50"
            >
              Completar Detective Ecológico (+{total} pts)
            </button>
          </div>
        );
      }

      // 2. ¿En qué bote va?
      case 'comp_2': {
        const currentItem = SORT_ITEMS[sortIndex];
        const isGameFinished = sortIndex >= SORT_ITEMS.length;

        const handleSortChoice = (binType: string) => {
          if (binType === currentItem.bin) {
            setSortScore(s => s + 1);
            setSortFeedback('¡Correcto! +1');
          } else {
            setSortFeedback('Incorrecto. Recuerda revisar la composición del residuo.');
          }

          setTimeout(() => {
            setSortFeedback(null);
            setSortIndex(idx => idx + 1);
          }, 800);
        };

        if (isGameFinished) {
          const finalScore = 10 + (sortScore === SORT_ITEMS.length ? 5 : 0);
          return (
            <div className="text-center py-6 space-y-4">
              <div className="text-4xl">🎉</div>
              <h4 className="text-lg font-medium text-white">¡Clasificación Finalizada!</h4>
              <p className="text-xs text-slate-300">
                Acertaste {sortScore} de {SORT_ITEMS.length} residuos.
                {sortScore === SORT_ITEMS.length && ' ¡Bono por racha perfecta! (+5 pts)'}
              </p>
              <button
                onClick={() => handleFinish(finalScore)}
                className="bg-emerald-500 text-black font-bold py-3 px-6 rounded-xl text-sm hover:bg-emerald-400"
              >
                Reclamar +{finalScore} Puntos
              </button>
            </div>
          );
        }

        return (
          <div className="space-y-5 text-center">
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
              <span className="text-5xl block mb-2">{currentItem.icon}</span>
              <h4 className="text-base font-medium text-white">{currentItem.name}</h4>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Elemento {sortIndex + 1} de {SORT_ITEMS.length}
              </span>
            </div>

            {sortFeedback && (
              <div className="text-xs font-bold text-emerald-400 py-1">
                {sortFeedback}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleSortChoice('Organico')}
                className="bg-green-600/30 hover:bg-green-600/50 border border-green-500/40 p-4 rounded-xl text-xs font-bold text-green-300"
              >
                🌱 Orgánico
              </button>
              <button
                type="button"
                onClick={() => handleSortChoice('InorganicoReciclable')}
                className="bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 p-4 rounded-xl text-xs font-bold text-blue-300"
              >
                ♻️ Inorgánico Reciclable
              </button>
              <button
                type="button"
                onClick={() => handleSortChoice('InorganicoNoReciclable')}
                className="bg-orange-600/30 hover:bg-orange-600/50 border border-orange-500/40 p-4 rounded-xl text-xs font-bold text-orange-300"
              >
                🗑️ No Reciclable
              </button>
            </div>
          </div>
        );
      }

      // 4. Cazador de desperdicios
      case 'comp_4': {
        return (
          <div className="space-y-4">
            <p className="text-xs text-slate-300">
              Registra 3 situaciones de desperdicio y la solución propuesta para cada una:
            </p>

            <div className="space-y-3">
              <div className="bg-white/5 border border-white/10 p-3 rounded-xl space-y-2">
                <span className="text-xs font-bold text-emerald-400 block">1. Desperdicio de Agua 💧</span>
                <input
                  type="text"
                  placeholder="Situación observada..."
                  value={waste1.situation}
                  onChange={e => setWaste1({ ...waste1, situation: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white outline-none"
                />
                <input
                  type="text"
                  placeholder="Solución propuesta..."
                  value={waste1.solution}
                  onChange={e => setWaste1({ ...waste1, solution: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white outline-none"
                />
              </div>

              <div className="bg-white/5 border border-white/10 p-3 rounded-xl space-y-2">
                <span className="text-xs font-bold text-amber-400 block">2. Desperdicio de Energía ⚡</span>
                <input
                  type="text"
                  placeholder="Situación observada..."
                  value={waste2.situation}
                  onChange={e => setWaste2({ ...waste2, situation: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white outline-none"
                />
                <input
                  type="text"
                  placeholder="Solución propuesta..."
                  value={waste2.solution}
                  onChange={e => setWaste2({ ...waste2, solution: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white outline-none"
                />
              </div>

              <div className="bg-white/5 border border-white/10 p-3 rounded-xl space-y-2">
                <span className="text-xs font-bold text-teal-400 block">3. Desperdicio de Materiales 📦</span>
                <input
                  type="text"
                  placeholder="Situación observada..."
                  value={waste3.situation}
                  onChange={e => setWaste3({ ...waste3, situation: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white outline-none"
                />
                <input
                  type="text"
                  placeholder="Solución propuesta..."
                  value={waste3.solution}
                  onChange={e => setWaste3({ ...waste3, solution: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white outline-none"
                />
              </div>
            </div>

            <button
              onClick={() => handleFinish(10)}
              disabled={!waste1.situation || !waste2.situation || !waste3.situation || isSubmitting}
              className="w-full bg-emerald-500 text-black font-bold py-3.5 rounded-xl text-sm hover:bg-emerald-400 transition-colors disabled:opacity-50"
            >
              Completar Cazador (+10 pts)
            </button>
          </div>
        );
      }

      // 5. Ecoescape
      case 'comp_5': {
        const challenge = ESCAPE_CHALLENGES[escapeStep];
        const isEscapeFinished = escapeStep >= ESCAPE_CHALLENGES.length;

        if (isEscapeFinished) {
          const badge = escapeErrors === 0 ? 'Ecoescape Maestro' : undefined;
          return (
            <div className="text-center py-6 space-y-4">
              <div className="text-4xl">🌍</div>
              <h4 className="text-lg font-medium text-white">¡Ecoescape Superado!</h4>
              <p className="text-xs text-slate-300">
                Has resuelto las 5 alertas de emergencia ambiental.
                {escapeErrors === 0 && (
                  <span className="block text-emerald-400 font-bold mt-1">
                    ¡Completado sin errores! Desbloqueas la insignia especial "Ecoescape Maestro".
                  </span>
                )}
              </p>
              <button
                onClick={() => handleFinish(15, badge)}
                className="bg-emerald-500 text-black font-bold py-3 px-6 rounded-xl text-sm hover:bg-emerald-400"
              >
                Completar Misión (+15 pts)
              </button>
            </div>
          );
        }

        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Desafío {escapeStep + 1} de {ESCAPE_CHALLENGES.length}</span>
              <span>Errores: {escapeErrors}</span>
            </div>

            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
              <h4 className="text-sm font-medium text-white leading-snug">{challenge.question}</h4>
            </div>

            <div className="space-y-2">
              {challenge.options.map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    if (i === challenge.correct) {
                      setEscapeStep(s => s + 1);
                    } else {
                      setEscapeErrors(e => e + 1);
                      alert('Respuesta no óptima para resolver la emergencia. Intenta de nuevo.');
                    }
                  }}
                  className="w-full text-left p-3.5 rounded-xl border border-white/10 bg-white/5 hover:bg-emerald-500/20 text-xs sm:text-sm text-slate-300 hover:text-white transition-all"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        );
      }

      // 6. Misión: ayuda secreta
      case 'comp_6': {
        return (
          <div className="space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed">
              Realiza una acción de ayuda positiva en secreto hacia alguien (recoger algo, dejar una nota de ánimo, apoyar en silencio) sin esperar reconocimiento.
            </p>
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Registra de forma anónima tu acción de ayuda:
              </label>
              <textarea
                rows={3}
                value={secretActionText}
                onChange={e => setSecretActionText(e.target.value)}
                placeholder="¿Qué acción realizaste y cómo ayudó a otra persona?..."
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-emerald-400"
              />
            </div>
            <button
              onClick={() => handleFinish(10)}
              disabled={!secretActionText || isSubmitting}
              className="w-full bg-emerald-500 text-black font-bold py-3.5 rounded-xl text-sm hover:bg-emerald-400 transition-colors disabled:opacity-50"
            >
              Completar Misión Secreta (+10 pts)
            </button>
          </div>
        );
      }

      // 7. ¿Qué harías tú?
      case 'comp_7': {
        const dilemmas = [
          {
            situation: 'Un compañero olvida sus útiles escolares y el profesor pide comenzar la actividad en silencio.',
            optionA: 'Compartirle de tus colores y lápices de repuesto de inmediato.',
            optionB: 'No prestar atención y continuar con tu propio trabajo.'
          },
          {
            situation: 'Alguien nuevo en la escuela se sienta solo durante el descanso.',
            optionA: 'Acercarte, saludarlo e invitarlo a integrarse con tu grupo.',
            optionB: 'Quedarte únicamente con tus amigos habituales.'
          }
        ];

        return (
          <div className="space-y-4">
            <p className="text-xs text-slate-300">
              Escenario {scenarioStep + 1} de {dilemmas.length}:
            </p>
            <div className="bg-white/5 border border-white/10 p-4 rounded-xl text-xs sm:text-sm text-white">
              {dilemmas[scenarioStep].situation}
            </div>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  if (scenarioStep < dilemmas.length - 1) {
                    setScenarioStep(s => s + 1);
                  } else {
                    handleFinish(10, 'Decisiones que ayudan');
                  }
                }}
                className="w-full text-left p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-xs text-emerald-200"
              >
                💚 Opción empática: {dilemmas[scenarioStep].optionA}
              </button>
              <button
                type="button"
                onClick={() => alert('Considera qué opción genera un mayor bienestar en la comunidad.')}
                className="w-full text-left p-3.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs text-slate-400"
              >
                ⚪ Opción pasiva: {dilemmas[scenarioStep].optionB}
              </button>
            </div>
          </div>
        );
      }

      // 8. Cadena de favores
      case 'comp_8': {
        return (
          <div className="space-y-4">
            <p className="text-xs text-slate-300">
              Realiza una acción positiva por alguien e invítalo a continuar la cadena de favores solidarios.
            </p>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">¿Qué favor o apoyo realizaste?</label>
              <textarea
                rows={2}
                value={chainActionText}
                onChange={e => setChainActionText(e.target.value)}
                placeholder="Describir acción solidaria..."
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-emerald-400"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">¿Cómo invitaste a continuar la cadena?</label>
              <input
                type="text"
                value={chainInvitedPerson}
                onChange={e => setChainInvitedPerson(e.target.value)}
                placeholder="ej. 'Le pedí que cuando pudiera le ayudara a otro compañero...'"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-emerald-400"
              />
            </div>
            <button
              onClick={() => handleFinish(15)}
              disabled={!chainActionText || !chainInvitedPerson || isSubmitting}
              className="w-full bg-emerald-500 text-black font-bold py-3.5 rounded-xl text-sm hover:bg-emerald-400 transition-colors disabled:opacity-50"
            >
              Completar Cadena de Favores (+15 pts)
            </button>
          </div>
        );
      }

      // 9. Construye la solución
      case 'comp_9': {
        return (
          <div className="space-y-4">
            <p className="text-xs text-slate-300">
              Combina los 3 pilares para resolver el reto: <strong>"Reducir el calor y consumo eléctrico en las escuelas"</strong>:
            </p>
            <div className="space-y-3">
              <div>
                <span className="text-xs font-bold text-emerald-400 block mb-1">🌿 Pilar Naturaleza:</span>
                <select
                  value={naturePiece}
                  onChange={e => setNaturePiece(e.target.value)}
                  className="w-full bg-[#0b131e] border border-white/10 rounded-xl p-2.5 text-xs text-white"
                >
                  <option value="">Selecciona una solución verde...</option>
                  <option value="arboles">Plantar árboles nativos de sombra alrededor de las aulas</option>
                  <option value="paredes_verdes">Crear jardines verticales en muros soleados</option>
                </select>
              </div>

              <div>
                <span className="text-xs font-bold text-amber-400 block mb-1">💡 Pilar Tecnología / Eficiencia:</span>
                <select
                  value={techPiece}
                  onChange={e => setTechPiece(e.target.value)}
                  className="w-full bg-[#0b131e] border border-white/10 rounded-xl p-2.5 text-xs text-white"
                >
                  <option value="">Selecciona una solución tecnológica...</option>
                  <option value="sensores">Sensores automáticos de apagado y focos LED de bajo consumo</option>
                  <option value="aislamiento">Pintura reflejante solar en techos</option>
                </select>
              </div>

              <div>
                <span className="text-xs font-bold text-purple-400 block mb-1">🤝 Pilar Comunidad:</span>
                <select
                  value={communityPiece}
                  onChange={e => setCommunityPiece(e.target.value)}
                  className="w-full bg-[#0b131e] border border-white/10 rounded-xl p-2.5 text-xs text-white"
                >
                  <option value="">Selecciona la acción comunitaria...</option>
                  <option value="comite">Comité escolar de guardianes de energía</option>
                  <option value="campaña">Campaña de concientización y cuidado colectivo</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => handleFinish(10)}
              disabled={!naturePiece || !techPiece || !communityPiece || isSubmitting}
              className="w-full bg-emerald-500 text-black font-bold py-3.5 rounded-xl text-sm hover:bg-emerald-400 transition-colors disabled:opacity-50"
            >
              Completar Solución Integral (+10 pts)
            </button>
          </div>
        );
      }

      // 10. Mi superpoder sostenible
      case 'comp_10': {
        const powers = [
          { name: 'Ahorrador de agua', icon: '💧', desc: 'Controlar fugas y duchas rápidas' },
          { name: 'Guardián de energía', icon: '⚡', desc: 'Desconectar cargadores y apagar luces' },
          { name: 'Maestro de reutilización', icon: '♻️', desc: 'Evitar plásticos de un solo uso' },
          { name: 'Agente solidario', icon: '🤝', desc: 'Apoyar a compañeros y comunidad' },
        ] as const;

        return (
          <div className="space-y-4">
            <p className="text-xs text-slate-300">
              Selecciona tu superpoder sostenible para practicar durante 3 días:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {powers.map(p => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => setSelectedPower(p.name)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedPower === p.name ? 'bg-emerald-500/20 border-emerald-400 text-white' : 'bg-white/5 border-white/10 text-slate-300'
                  }`}
                >
                  <span className="text-xl">{p.icon}</span>
                  <div className="font-bold text-xs mt-1 text-white">{p.name}</div>
                  <div className="text-[10px] text-slate-400">{p.desc}</div>
                </button>
              ))}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Compromiso para los 3 días:
              </label>
              <input
                type="text"
                value={powerPledge}
                onChange={e => setPowerPledge(e.target.value)}
                placeholder="ej. Me comprometo a cerrar el agua y monitorear fugas..."
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-emerald-400"
              />
            </div>

            <button
              onClick={() => handleFinish(20, selectedPower)}
              disabled={!powerPledge || isSubmitting}
              className="w-full bg-emerald-500 text-black font-bold py-3.5 rounded-xl text-sm hover:bg-emerald-400 transition-colors disabled:opacity-50"
            >
              Activar Superpoder y Ganar Insignia (+20 pts)
            </button>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#0b131e] border border-white/15 rounded-[32px] max-w-xl w-full p-6 sm:p-8 relative shadow-2xl my-8 max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {completed ? (
          <div className="text-center py-10 space-y-4">
            <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-light text-white">¡Misión Completada!</h3>
            <p className="text-slate-400 text-sm">
              Has ganado +{pointsEarned} puntos complementarios.
              {badgeAwarded && ` ¡Insignia "${badgeAwarded}" obtenida!`}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{activity.icon}</span>
              <div>
                <h3 className="text-xl font-medium text-white">{activity.title}</h3>
                <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
                  Misión Secundaria • +{activity.pointsReward} Puntos
                </span>
              </div>
            </div>

            {/* EXPANDABLE PEDAGOGICAL INSTRUCTIONS & CRITERIA ACCORDION */}
            <ActivityInstructionsAccordion 
              instructions={resolveActivityDestination(activity).instructions}
              defaultExpanded={false}
            />

            {renderContent()}
          </div>
        )}
      </motion.div>
    </div>
  );
}
