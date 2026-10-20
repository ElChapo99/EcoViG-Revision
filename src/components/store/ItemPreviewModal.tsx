import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Coins, Sparkles, Check, ShieldCheck, TreePine, Zap, Info, Eye } from 'lucide-react';
import { StoreItem } from '../../data/storeItems';
import ItemVisual, { getItemVisualStyles } from './ItemVisual';

interface ItemPreviewModalProps {
  item: StoreItem | null;
  userCoins: number;
  isUnlocked: boolean;
  isEquipped: boolean;
  isBiomeUnlocked: boolean;
  loading: boolean;
  onClose: () => void;
  onBuyOrEquip: (item: StoreItem) => void;
}

export default function ItemPreviewModal({
  item,
  userCoins,
  isUnlocked,
  isEquipped,
  isBiomeUnlocked,
  loading,
  onClose,
  onBuyOrEquip
}: ItemPreviewModalProps) {
  if (!item) return null;

  const { badgeBg, accentColor } = getItemVisualStyles(item);
  const canAfford = userCoins >= item.price;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-[#0b131e] border border-white/15 w-full max-w-lg rounded-[36px] overflow-hidden shadow-2xl flex flex-col font-sans"
        >
          {/* Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${badgeBg}`}>
                {item.rarity || 'Común'}
              </span>
              <span className="text-xs text-slate-400">
                • Bioma: {item.biomeId.toUpperCase()}
              </span>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Hero Visual Area */}
          <div className="p-8 flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-white/5 to-transparent">
            <ItemVisual item={item} size="hero" isEquipped={isEquipped} />

            <h2 className="text-2xl font-light text-white mt-5 text-center">
              {item.name}
            </h2>

            <div className="text-xs text-slate-400 text-center mt-1 max-w-sm leading-relaxed">
              {item.description}
            </div>
          </div>

          {/* Environmental Value & Stats Box */}
          <div className="px-6 pb-6 space-y-4">
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Categoría</span>
                <span className="font-semibold text-white capitalize mt-0.5 block">{item.category}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Estado de Compra</span>
                <span className={`font-semibold mt-0.5 block ${isUnlocked ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {isUnlocked ? '✓ En tu inventario' : `${item.price} EcoMonedas`}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 font-medium text-xs transition-colors border border-white/5"
              >
                Cerrar
              </button>

              <button
                type="button"
                disabled={loading || (!isUnlocked && !canAfford) || (isUnlocked && !isBiomeUnlocked)}
                onClick={() => onBuyOrEquip(item)}
                className={`flex-[2] py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                  isEquipped
                    ? 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                    : isUnlocked
                      ? isBiomeUnlocked
                        ? 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : canAfford
                        ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black hover:from-amber-300 hover:to-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                {isEquipped ? (
                  <>Ocultar en Escena</>
                ) : isUnlocked ? (
                  isBiomeUnlocked ? (
                    <>
                      <Sparkles className="w-4 h-4" /> Equipar en Mundo
                    </>
                  ) : (
                    <>Bioma Bloqueado</>
                  )
                ) : canAfford ? (
                  <>
                    <Coins className="w-4 h-4" /> Comprar por {item.price} 🪙
                  </>
                ) : (
                  <>EcoMonedas Insuficientes ({userCoins}/{item.price})</>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
