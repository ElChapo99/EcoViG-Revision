import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, DollarSign, CheckCircle2, AlertCircle, ShoppingBag, Clock, Ban, Sparkles } from 'lucide-react';
import { MainMissionActivity } from '../../data/surveyData';
import { resolveActivityDestination } from '../../lib/activityResolver';
import ActivityInstructionsAccordion from './ActivityInstructionsAccordion';

interface BudgetGameModalProps {
  activity: MainMissionActivity;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (evidenceData: any) => Promise<void>;
}

interface BudgetItem {
  id: string;
  name: string;
  cost: number;
  category: 'necesidad' | 'deseo';
  description: string;
  icon: string;
}

const BUDGET_ITEMS: BudgetItem[] = [
  { id: '1', name: 'Tenis escolares (los actuales ya no te quedan)', cost: 180, category: 'necesidad', description: 'Calzado básico para ir a clases con comodidad', icon: '👟' },
  { id: '2', name: 'Videojuego de moda recién salido', cost: 200, category: 'deseo', description: 'Novedad para entretenimiento digital', icon: '🎮' },
  { id: '3', name: 'Comida y refrigerios nutritivos para la semana', cost: 120, category: 'necesidad', description: 'Alimentación indispensable para rendir con energía', icon: '🍎' },
  { id: '4', name: 'Audífonos de luces (los tuyos aún funcionan bien)', cost: 150, category: 'deseo', description: 'Accesorio llamativo aunque tus audífonos están intactos', icon: '🎧' },
  { id: '5', name: 'Salida recreativa con amigos', cost: 90, category: 'deseo', description: 'Cine o paseo compartido', icon: '🍿' },
  { id: '6', name: 'Útiles y cuadernos escolares del ciclo', cost: 100, category: 'necesidad', description: 'Materiales obligatorios para las materias', icon: '📚' },
];

export default function BudgetGameModal({ activity, isOpen, onClose, onSubmit }: BudgetGameModalProps) {
  const initialBudget = 500;
  const [decisions, setDecisions] = useState<Record<string, 'buy' | 'postpone' | 'avoid'>>({});
  const [avoidedReason, setAvoidedReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  if (!isOpen) return null;

  // Calculate spent money
  const spentMoney = Object.entries(decisions).reduce((acc, [itemId, action]) => {
    if (action === 'buy') {
      const item = BUDGET_ITEMS.find(i => i.id === itemId);
      return acc + (item ? item.cost : 0);
    }
    return acc;
  }, 0);

  const remainingBudget = initialBudget - spentMoney;
  const allDecided = BUDGET_ITEMS.every(item => decisions[item.id]);

  const handleDecision = (itemId: string, action: 'buy' | 'postpone' | 'avoid') => {
    const item = BUDGET_ITEMS.find(i => i.id === itemId);
    if (!item) return;

    if (action === 'buy' && decisions[itemId] !== 'buy') {
      if (spentMoney + item.cost > initialBudget) {
        alert('¡Presupuesto insuficiente! Para comprar este artículo debes liberar dinero posponiendo o evitando otro gasto.');
        return;
      }
    }

    setDecisions(prev => ({
      ...prev,
      [itemId]: action
    }));
  };

  const handleFinish = async () => {
    if (!allDecided || !avoidedReason) return;
    setIsSubmitting(true);
    try {
      await onSubmit({
        initialBudget,
        spentMoney,
        remainingBudget,
        decisions,
        avoidedReason,
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
            <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-light text-white">¡Misión de Presupuesto Completada!</h3>
            <p className="text-slate-400 text-sm">Has administrado tus recursos responsablemente y conservaste ${remainingBudget}.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-3xl">{activity.icon || '💰'}</span>
                <div>
                  <h3 className="text-xl font-medium text-white">{activity.title}</h3>
                  <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">
                    Simulador de Presupuesto Austero • +{activity.xpReward} XP
                  </span>
                </div>
              </div>
            </div>

            {/* EXPANDABLE PEDAGOGICAL INSTRUCTIONS & CRITERIA ACCORDION */}
            <ActivityInstructionsAccordion 
              instructions={resolveActivityDestination(activity).instructions}
              defaultExpanded={false}
            />

            {/* Budget Bar */}
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider block">Dinero Restante</span>
                <span className={`text-2xl font-bold font-mono ${remainingBudget >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  ${remainingBudget} <span className="text-xs text-slate-400 font-normal">/ ${initialBudget}</span>
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 uppercase tracking-wider block">Gasto Actual</span>
                <span className="text-lg font-medium text-white font-mono">${spentMoney}</span>
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Opciones de Compra ({Object.keys(decisions).length}/{BUDGET_ITEMS.length} decididas)
              </div>

              {BUDGET_ITEMS.map((item) => {
                const currentDecision = decisions[item.id];

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      currentDecision === 'buy'
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : currentDecision === 'postpone'
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : currentDecision === 'avoid'
                        ? 'bg-purple-500/10 border-purple-500/30'
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                          <h4 className="text-sm font-medium text-white">{item.name}</h4>
                          <p className="text-xs text-slate-400">{item.description}</p>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-sm text-emerald-400 self-start sm:self-auto bg-white/5 px-2.5 py-1 rounded-lg">
                        ${item.cost}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => handleDecision(item.id, 'buy')}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          currentDecision === 'buy'
                            ? 'bg-emerald-500 text-black shadow-md'
                            : 'bg-white/5 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 border border-white/5'
                        }`}
                      >
                        <ShoppingBag className="w-3.5 h-3.5" /> Comprar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDecision(item.id, 'postpone')}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          currentDecision === 'postpone'
                            ? 'bg-amber-400 text-black shadow-md'
                            : 'bg-white/5 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-white/5'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" /> Posponer
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDecision(item.id, 'avoid')}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          currentDecision === 'avoid'
                            ? 'bg-purple-500 text-white shadow-md'
                            : 'bg-white/5 hover:bg-purple-500/20 text-slate-300 hover:text-purple-300 border border-white/5'
                        }`}
                      >
                        <Ban className="w-3.5 h-3.5" /> No comprar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reflection Questions */}
            {allDecided && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3 pt-2"
              >
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  ¿Cuál compra decidiste evitar o posponer y por qué?
                </label>
                <textarea
                  rows={2}
                  value={avoidedReason}
                  onChange={(e) => setAvoidedReason(e.target.value)}
                  placeholder="Explica qué compra no realizaste y por qué consideras que era un deseo no prioritario..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder-slate-500 text-xs sm:text-sm outline-none focus:border-emerald-500"
                />
              </motion.div>
            )}

            {/* Submit */}
            <button
              onClick={handleFinish}
              disabled={!allDecided || !avoidedReason || isSubmitting}
              className="w-full bg-emerald-500 text-black font-bold py-4 rounded-2xl text-base hover:bg-emerald-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
            >
              {isSubmitting ? 'Registrando decisiones...' : 'Finalizar Simulador de Presupuesto'}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
