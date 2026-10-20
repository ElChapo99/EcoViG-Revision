import React, { useState, useMemo } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { db } from '../../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Store, Coins, Lock as LockIcon, Check, Sparkles, Target, Zap, Filter, Search, Eye } from 'lucide-react';
import { motion } from 'motion/react';
import { BIOMES, getBiomeUnlockStatus } from '../../../lib/worldProgress';
import { STORE_ITEMS, STORE_CATEGORIES, StoreItem } from '../../../data/storeItems';
import ItemVisual, { getItemVisualStyles } from '../../../components/store/ItemVisual';
import ItemPreviewModal from '../../../components/store/ItemPreviewModal';

export { STORE_ITEMS };

export default function StoreTab() {
  const { user, refreshUser } = useAuth();
  const [activeBiome, setActiveBiome] = useState<'forest' | 'desert' | 'mountain' | 'city'>('forest');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewItem, setPreviewItem] = useState<StoreItem | null>(null);

  if (!user) return null;

  const coins = user.coins || 0;
  const unlockedDecorations = user.unlockedDecorations || [];
  const activeDecorations = user.activeDecorations || {};

  const currentBiomeStatus = getBiomeUnlockStatus(user, activeBiome);
  const isCurrentBiomeUnlocked = currentBiomeStatus.isUnlocked;

  const handleBuyOrEquip = async (item: StoreItem) => {
    if (loading) return;
    setLoading(true);
    
    try {
      const itemId = item.id;
      const biomeId = item.biomeId;
      const price = item.price;

      const isUnlocked = unlockedDecorations.includes(itemId);
      const biomeActive = activeDecorations[biomeId] || [];
      const isEquipped = biomeActive.includes(itemId);
      
      let newUnlocked = [...unlockedDecorations];
      let newCoins = coins;
      let newBiomeActive = [...biomeActive];

      if (!isUnlocked) {
        if (coins < price) {
          alert('No tienes suficientes EcoMonedas.');
          setLoading(false);
          return;
        }
        newCoins -= price;
        newUnlocked.push(itemId);
      } else {
        if (isEquipped) {
          newBiomeActive = newBiomeActive.filter(id => id !== itemId);
        } else {
          newBiomeActive.push(itemId);
        }
      }

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        coins: newCoins,
        unlockedDecorations: newUnlocked,
        [`activeDecorations.${biomeId}`]: newBiomeActive,
        updatedAt: Date.now()
      });

      await refreshUser();
    } catch (err) {
      console.error(err);
      alert('Error al procesar la acción');
    } finally {
      setLoading(false);
    }
  };

  // Filtered items
  const filteredItems = useMemo(() => {
    return STORE_ITEMS.filter(item => {
      if (item.biomeId !== activeBiome) return false;
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchDesc = item.description.toLowerCase().includes(q);
        if (!matchName && !matchDesc) return false;
      }
      return true;
    });
  }, [activeBiome, selectedCategory, searchQuery]);

  const biomeItems = STORE_ITEMS.filter(item => item.biomeId === activeBiome);
  const unlockedInBiome = biomeItems.filter(item => unlockedDecorations.includes(item.id)).length;

  const getRarityBadge = (rarity?: string) => {
    switch (rarity) {
      case 'legendary':
        return <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-bold uppercase tracking-wider">Legendario</span>;
      case 'epic':
        return <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[9px] font-bold uppercase tracking-wider">Épico</span>;
      case 'rare':
        return <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[9px] font-bold uppercase tracking-wider">Raro</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md bg-slate-500/20 text-slate-300 border border-slate-500/30 text-[9px] font-bold uppercase tracking-wider">Común</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-light text-white mb-1">EcoTienda</h1>
          <p className="text-emerald-400 font-medium text-sm">
            Personaliza tus biomas con mascotas, personajes, estructuras, vegetación y monumentos legendarios.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-amber-500/15 border border-amber-500/30 px-5 py-2.5 rounded-2xl backdrop-blur-md self-start sm:self-auto shadow-lg">
          <Coins className="w-6 h-6 text-amber-400 animate-pulse" />
          <div>
            <div className="text-[10px] text-amber-300 font-bold uppercase tracking-wider leading-none">Tus EcoMonedas</div>
            <div className="font-bold text-amber-400 text-2xl font-mono leading-tight">{coins} 🪙</div>
          </div>
        </div>
      </header>

      {/* Biome Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {BIOMES.map((biome) => {
          const status = getBiomeUnlockStatus(user, biome.id);
          const isSelected = activeBiome === biome.id;
          const itemsInThisBiome = STORE_ITEMS.filter(i => i.biomeId === biome.id);
          const unlockedCount = itemsInThisBiome.filter(i => unlockedDecorations.includes(i.id)).length;

          return (
            <button
              key={biome.id}
              onClick={() => setActiveBiome(biome.id as any)}
              className={`p-3.5 rounded-2xl flex items-center justify-between gap-2 transition-all text-left border ${
                isSelected 
                  ? 'bg-emerald-500/20 border-emerald-400/60 shadow-[0_0_20px_rgba(16,185,129,0.3)] ring-1 ring-emerald-400/40 text-white' 
                  : status.isUnlocked 
                    ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    : 'bg-white/[0.02] border-white/5 text-slate-500 hover:bg-white/5'
              } backdrop-blur-md`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-2xl shrink-0">{biome.icon}</span>
                <div className="truncate">
                  <div className="font-bold text-sm truncate">{biome.name}</div>
                  <div className="text-[10px] text-slate-400">
                    {unlockedCount}/{itemsInThisBiome.length} adquiridos
                  </div>
                </div>
              </div>

              {!status.isUnlocked && (
                <LockIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Biome locked warning banner if viewing locked biome store items */}
      {!isCurrentBiomeUnlocked && (
        <div className="bg-amber-500/10 border border-amber-500/30 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-amber-200 backdrop-blur-md">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
              <LockIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">
                Bioma {currentBiomeStatus.biome.name} aún no desbloqueado
              </div>
              <p className="text-amber-200/90 text-xs mt-0.5">
                {currentBiomeStatus.biome.id === 'city' ? (
                  <>Puedes comprar objetos ahora, pero para equiparlos en la escena debes completar <strong>las 12 misiones obligatorias</strong> ({currentBiomeStatus.currentMissions}/12) y acumular <strong>1,800 XP</strong> ({currentBiomeStatus.currentXp}/1,800).</>
                ) : (
                  <>Puedes comprar objetos ahora, pero para equiparlos en la escena debes completar <strong>{currentBiomeStatus.requiredMissions} misiones obligatorias</strong> ({currentBiomeStatus.currentMissions}/{currentBiomeStatus.requiredMissions}) y alcanzar <strong>{currentBiomeStatus.requiredXp} XP</strong> ({currentBiomeStatus.currentXp}/{currentBiomeStatus.requiredXp}).</>
                )}
              </p>
            </div>
          </div>
          <div className="text-xs font-mono font-bold text-amber-300 bg-amber-500/20 px-3 py-1.5 rounded-xl self-start sm:self-auto shrink-0">
            {currentBiomeStatus.percentProgress}% avance
          </div>
        </div>
      )}

      {/* Category Tabs & Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
            {STORE_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                    : 'bg-white/5 text-slate-400 border-white/5 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar elemento..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>Mostrando <strong>{filteredItems.length}</strong> elementos en este catálogo</span>
          <span>Colección de Bioma: <strong>{unlockedInBiome}</strong> de <strong>{biomeItems.length}</strong> adquiridos</span>
        </div>
      </div>

      {/* Store Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-white/5 rounded-3xl border border-white/5 text-slate-500 text-sm">
          No se encontraron objetos para esta categoría o búsqueda.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map(item => {
            const isUnlocked = unlockedDecorations.includes(item.id);
            const isEquipped = (activeDecorations[activeBiome] || []).includes(item.id);

            return (
              <motion.div 
                key={item.id} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/10 rounded-[28px] p-5 flex flex-col justify-between relative overflow-hidden backdrop-blur-md hover:border-white/20 transition-all group"
              >
                {/* Rarity & Equipped Badges */}
                <div className="w-full flex items-center justify-between mb-3">
                  {getRarityBadge(item.rarity)}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setPreviewItem(item)}
                      className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-colors"
                      title="Vista previa 3D"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    {isEquipped && (
                      <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                        <Check className="w-3.5 h-3.5 text-black stroke-[3]" />
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Visual Avatar Card Render */}
                <div 
                  onClick={() => setPreviewItem(item)}
                  className="flex flex-col items-center text-center my-1 cursor-pointer"
                >
                  <ItemVisual item={item} size="md" isEquipped={isEquipped} />

                  <h3 className="text-white font-medium mb-1 mt-3 text-sm group-hover:text-emerald-300 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mb-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
                
                <div className="pt-2 border-t border-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                      {isUnlocked ? 'Estado' : 'Precio'}
                    </span>
                    {!isUnlocked ? (
                      <div className="flex items-center gap-1 text-amber-400 font-bold text-sm font-mono">
                        <Coins className="w-3.5 h-3.5" />
                        {item.price} 🪙
                      </div>
                    ) : (
                      <div className="text-emerald-400 font-bold text-xs flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> Adquirido
                      </div>
                    )}
                  </div>

                  <button
                    disabled={loading || (!isCurrentBiomeUnlocked && isUnlocked)}
                    onClick={() => handleBuyOrEquip(item)}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all uppercase tracking-wider ${
                      isEquipped
                        ? 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                        : isUnlocked
                          ? isCurrentBiomeUnlocked
                            ? 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : coins >= item.price
                            ? 'bg-amber-500 text-black hover:bg-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                            : 'bg-slate-800/80 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {isEquipped 
                      ? 'Ocultar en Escena' 
                      : isUnlocked 
                        ? (isCurrentBiomeUnlocked ? 'Equipar en Mundo' : 'Bioma Bloqueado') 
                        : coins >= item.price
                          ? 'Comprar'
                          : 'EcoMonedas insuficientes'}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Item 3D Inspect & Preview Modal */}
      {previewItem && (
        <ItemPreviewModal
          item={previewItem}
          userCoins={coins}
          isUnlocked={unlockedDecorations.includes(previewItem.id)}
          isEquipped={(activeDecorations[activeBiome] || []).includes(previewItem.id)}
          isBiomeUnlocked={isCurrentBiomeUnlocked}
          loading={loading}
          onClose={() => setPreviewItem(null)}
          onBuyOrEquip={async (it) => {
            await handleBuyOrEquip(it);
          }}
        />
      )}
    </div>
  );
}
