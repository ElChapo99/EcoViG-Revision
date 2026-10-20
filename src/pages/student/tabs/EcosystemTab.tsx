import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TreePine, 
  Droplets, 
  Bird, 
  Lock as LockIcon, 
  CheckCircle2, 
  Sparkles, 
  Target, 
  Zap, 
  Edit3, 
  Save, 
  RotateCcw, 
  X, 
  Move, 
  AlertTriangle,
  HelpCircle
} from 'lucide-react';
import { STORE_ITEMS } from '../../../data/storeItems';
import { BIOMES, getBiomeUnlockStatus, getCompletedMandatoryMissionsCount } from '../../../lib/worldProgress';
import { SceneItemVisual } from '../../../components/store/ItemVisual';
import ItemIllustration from '../../../components/store/ItemIllustration';
import BiomeScenery from '../../../components/scenery/BiomeScenery';
import { TERRAIN_SLOTS } from '../../../data/terrainSlots';
import { 
  computeDefaultBiomeLayout, 
  clampPosition, 
  calculateZIndex, 
  saveStudentWorldLayout,
  BOUNDS 
} from '../../../lib/worldLayoutService';
import { BiomeWorldLayout, ElementPosition } from '../../../types';

export default function EcosystemTab() {
  const { user } = useAuth();
  const [selectedBiomeId, setSelectedBiomeId] = useState<'forest' | 'desert' | 'mountain' | 'city'>('forest');
  
  // Customization & Edit Mode States
  const [isEditing, setIsEditing] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [customPositions, setCustomPositions] = useState<BiomeWorldLayout>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);

  if (!user) return null;

  const eco = user.ecosystem || { trees: 0, water: 0, animals: 0 };
  const currentBiomeStatus = getBiomeUnlockStatus(user, selectedBiomeId);
  const selectedBiome = currentBiomeStatus.biome;
  const isUnlocked = currentBiomeStatus.isUnlocked;
  const completedMandatoryCount = getCompletedMandatoryMissionsCount(user);

  // Equipped store items for this active biome
  const activeDecorations = useMemo(() => {
    return user.activeDecorations?.[selectedBiomeId] || [];
  }, [user.activeDecorations, selectedBiomeId]);

  // Compute default layout for active elements
  const defaultBiomeLayout = useMemo(() => {
    return computeDefaultBiomeLayout(selectedBiomeId, eco, activeDecorations);
  }, [selectedBiomeId, eco, activeDecorations]);

  // Sync positions when switching biomes or when user data updates
  useEffect(() => {
    const savedForBiome = user.worldLayouts?.[selectedBiomeId] || {};
    // Merge saved positions with default positions for any newly acquired/unlocked items
    const merged: BiomeWorldLayout = { ...defaultBiomeLayout, ...savedForBiome };
    setCustomPositions(merged);
    setHasUnsavedChanges(false);
    setIsEditing(false);
  }, [selectedBiomeId, user.worldLayouts, defaultBiomeLayout]);

  // Handle Drag & Drop Pointer Events (Mouse + Touch Screen Support)
  const handlePointerDown = (elementId: string, e: React.PointerEvent) => {
    if (!isEditing) return;
    e.preventDefault();
    e.stopPropagation();
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch (err) {
      // ignore
    }
    setDraggingId(elementId);
  };

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!draggingId || !stageRef.current) return;
    e.preventDefault();
    const rect = stageRef.current.getBoundingClientRect();
    const rawX = ((e.clientX - rect.left) / rect.width) * 100;
    const rawY = ((rect.bottom - e.clientY) / rect.height) * 100;

    const clamped = clampPosition(rawX, rawY);

    setCustomPositions(prev => ({
      ...prev,
      [draggingId]: clamped,
    }));
    setHasUnsavedChanges(true);
  }, [draggingId]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (draggingId) {
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (err) {
        // ignore
      }
      setDraggingId(null);
    }
  }, [draggingId]);

  // Save changes
  const handleSaveLayout = async () => {
    if (!user.uid) return;
    setIsSaving(true);
    try {
      await saveStudentWorldLayout(user.uid, selectedBiomeId, customPositions);
      setHasUnsavedChanges(false);
      setIsEditing(false);
      setSaveSuccessMsg(true);
      setTimeout(() => setSaveSuccessMsg(false), 3500);
    } catch (error) {
      console.error('Error saving world layout:', error);
      alert('Error al guardar la distribución del mundo. Inténtalo de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  // Cancel edits
  const handleCancelEdits = () => {
    const savedForBiome = user.worldLayouts?.[selectedBiomeId] || {};
    setCustomPositions({ ...defaultBiomeLayout, ...savedForBiome });
    setHasUnsavedChanges(false);
    setIsEditing(false);
  };

  // Reset to original positions
  const handleConfirmReset = async () => {
    setShowResetModal(false);
    setCustomPositions(defaultBiomeLayout);
    setHasUnsavedChanges(true);
  };

  // Safe position resolver helper
  const getPosition = (elementId: string): ElementPosition => {
    if (customPositions[elementId]) {
      return customPositions[elementId];
    }
    if (defaultBiomeLayout[elementId]) {
      return defaultBiomeLayout[elementId];
    }
    return { x: 50, y: 15 };
  };

  return (
    <div className="space-y-6 pb-12 h-full flex flex-col font-sans select-none">
      {/* Header with Title and Mode Actions */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-light text-white mb-1 flex items-center gap-3">
            <span>Mi Mundo y Biomas</span>
            {isEditing && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/40 animate-pulse">
                <Edit3 className="w-3.5 h-3.5" /> Modo Edición
              </span>
            )}
          </h1>
          <p className="text-emerald-400 font-medium text-sm">
            {isEditing 
              ? 'Toca o arrastra árboles, animales y decoraciones para personalizar tu escenario.'
              : 'Tus puntos de XP y misiones obligatorias completadas desbloquean nuevos mundos ecológicos.'}
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {isUnlocked && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all shadow-lg hover:shadow-emerald-500/10 cursor-pointer"
            >
              <Move className="w-4 h-4 text-emerald-400" />
              <span>Editar mundo</span>
            </button>
          )}

          <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl backdrop-blur-md">
            <Target className="w-4 h-4 text-emerald-400" />
            <div className="text-xs">
              <span className="text-slate-400">Misiones obligatorias: </span>
              <span className="font-bold text-white font-mono">{completedMandatoryCount}/12</span>
            </div>
          </div>
        </div>
      </header>

      {/* Biome Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {BIOMES.map((biome) => {
          const status = getBiomeUnlockStatus(user, biome.id);
          const isSelected = selectedBiomeId === biome.id;
          return (
            <button
              key={biome.id}
              disabled={isEditing}
              onClick={() => setSelectedBiomeId(biome.id as any)}
              className={`p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl flex flex-col gap-2 transition-all text-left relative overflow-hidden border ${
                isSelected 
                  ? 'bg-emerald-500/20 border-emerald-400/60 shadow-[0_0_20px_rgba(16,185,129,0.3)] ring-2 ring-emerald-400/30' 
                  : status.isUnlocked
                    ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    : 'bg-white/[0.02] border-white/5 text-slate-500 hover:bg-white/5'
              } ${isEditing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} backdrop-blur-md`}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl sm:text-3xl">{biome.icon}</span>
                {status.isUnlocked ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" /> Activo
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-black/40 px-2 py-0.5 rounded-full border border-white/10">
                    <LockIcon className="w-3 h-3" /> Bloqueado
                  </span>
                )}
              </div>

              <div>
                <div className={`font-bold text-sm sm:text-base ${isSelected ? 'text-white' : status.isUnlocked ? 'text-slate-200' : 'text-slate-400'}`}>
                  {biome.name}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                  {biome.id === 'forest' 
                    ? 'Mundo Inicial' 
                    : biome.id === 'city' 
                      ? '12 misiones + 1,800 XP' 
                      : `${biome.requiredMissions} misiones + ${biome.requiredXp} XP`}
                </div>
              </div>

              {/* Progress bar on locked biomes */}
              {!status.isUnlocked && (
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-1">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${status.percentProgress}%` }}
                  ></div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* EDIT MODE TOP TOOLBAR CONTROLS */}
      {isEditing && isUnlocked && (
        <div className="bg-slate-900/90 border border-emerald-500/30 p-3 sm:p-4 rounded-2xl sm:rounded-3xl backdrop-blur-xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2 text-slate-200">
            <span className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <Move className="w-4 h-4 animate-pulse" />
            </span>
            <span>
              <strong>Personaliza tu {selectedBiome.name}:</strong> Arrastra con el mouse o tu dedo los elementos para ubicarlos donde prefieras.
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setShowResetModal(true)}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all flex items-center gap-1.5 font-medium cursor-pointer"
              title="Volver a la posición original"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Restablecer</span>
            </button>

            <button
              onClick={handleCancelEdits}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all flex items-center gap-1.5 font-medium cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancelar</span>
            </button>

            <button
              onClick={handleSaveLayout}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Guardando...' : 'Guardar cambios'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Success Notification Feedback */}
      <AnimatePresence>
        {saveSuccessMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-emerald-500/20 border border-emerald-400/50 rounded-2xl text-emerald-300 text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-lg"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>¡Tu mundo ha sido actualizado y guardado correctamente en tu cuenta!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Virtual Ecosystem Visualizer Stage (Interactive Responsive Stage) */}
      <div 
        ref={stageRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={`w-full min-h-[440px] sm:min-h-[500px] md:min-h-[540px] rounded-[36px] sm:rounded-[44px] relative overflow-hidden border ${
          isEditing ? 'border-emerald-400/80 ring-4 ring-emerald-500/20' : selectedBiome.border
        } shadow-[0_20px_60px_rgba(0,0,0,0.8)] transition-all duration-300 touch-none`}
      >
        {/* Dynamic & Animated Multi-Layered Biome Scenery */}
        <BiomeScenery biomeId={selectedBiome.id} />

        {/* Edit Grid Overlay Hint */}
        {isEditing && (
          <div className="absolute inset-0 z-10 pointer-events-none bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
        )}

        <AnimatePresence mode="wait">
          {!isUnlocked ? (
            <motion.div 
              key={`locked-${selectedBiome.id}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-30 bg-[#05070a]/75 backdrop-blur-md"
            >
              <div className="w-20 h-20 bg-slate-900/90 rounded-3xl flex items-center justify-center mb-5 shadow-2xl backdrop-blur-md border border-slate-700/50 text-4xl">
                {selectedBiome.icon}
              </div>
              
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider border border-amber-500/30 mb-2">
                <LockIcon className="w-3.5 h-3.5 text-amber-400" /> Bioma Bloqueado
              </span>
              
              <h3 className="text-2xl sm:text-3xl font-light text-white mb-2">
                {selectedBiome.name}
              </h3>
              
              <p className="text-sm text-slate-300 max-w-md mb-6 leading-relaxed">
                {selectedBiome.id === 'city' ? (
                  <>
                    ¡La Ciudad Verde es la meta suprema! Para restaurarla y desbloquearla, debes completar <strong>todas las 12 misiones obligatorias</strong> y acumular <strong>1,800 XP</strong>.
                  </>
                ) : selectedBiome.id === 'mountain' ? (
                  <>
                    Para acceder a las Montañas, completa <strong>8 misiones obligatorias</strong> de las 4 dimensiones y alcanza <strong>1,100 XP</strong>.
                  </>
                ) : (
                  <>
                    Para acceder al Desértico, completa <strong>4 misiones obligatorias</strong> y alcanza <strong>500 XP</strong>.
                  </>
                )}
              </p>

              {/* Progress Requirements Box */}
              <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 backdrop-blur-xl text-left space-y-4 mb-6">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-emerald-400" /> Misiones Obligatorias
                    </span>
                    <span className={`font-mono font-bold ${currentBiomeStatus.missionsMet ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {currentBiomeStatus.currentMissions} / {currentBiomeStatus.requiredMissions} {currentBiomeStatus.missionsMet ? '✓' : ''}
                    </span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${currentBiomeStatus.missionsMet ? 'bg-emerald-400' : 'bg-amber-400'}`}
                      style={{ width: `${Math.min(100, (currentBiomeStatus.currentMissions / currentBiomeStatus.requiredMissions) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-purple-400" /> Puntos de Experiencia (XP)
                    </span>
                    <span className={`font-mono font-bold ${currentBiomeStatus.xpMet ? 'text-emerald-400' : 'text-purple-400'}`}>
                      {currentBiomeStatus.currentXp} / {currentBiomeStatus.requiredXp} XP {currentBiomeStatus.xpMet ? '✓' : ''}
                    </span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${currentBiomeStatus.xpMet ? 'bg-emerald-400' : 'bg-purple-400'}`}
                      style={{ width: `${Math.min(100, (currentBiomeStatus.currentXp / currentBiomeStatus.requiredXp) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-400">
                Sigue completando misiones para acumular XP y desbloquear este bioma.
              </div>
            </motion.div>
          ) : (
            <div 
              key={`unlocked-${selectedBiome.id}`}
              className="absolute inset-0 z-20 pointer-events-none"
            >
              {/* Special Badge if Ciudad Verde Unlocked */}
              {selectedBiome.id === 'city' && (
                <div className="absolute top-4 left-4 z-30 flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/40 backdrop-blur-md px-3.5 py-1.5 rounded-full text-white text-xs shadow-lg pointer-events-auto">
                  <Sparkles className="w-4 h-4 text-emerald-300" />
                  <span className="font-bold">¡Ciudad Verde Restaurada al 100%!</span>
                </div>
              )}

              {/* BASE ELEMENT 1: Flora Tree 1 */}
              {eco.trees > 0 && (() => {
                const elementId = 'base_tree_1';
                const pos = getPosition(elementId);
                const isDragging = draggingId === elementId;
                const zIndex = calculateZIndex(pos.y) + (isDragging ? 50 : 0);

                return (
                  <div 
                    key={elementId}
                    onPointerDown={(e) => handlePointerDown(elementId, e)}
                    className={`absolute pointer-events-auto transform -translate-x-1/2 select-none ${
                      isEditing ? 'cursor-grab active:cursor-grabbing hover:scale-105 transition-transform' : ''
                    } ${isDragging ? 'scale-110 drop-shadow-[0_20px_20px_rgba(16,185,129,0.5)]' : 'drop-shadow-[0_10px_10px_rgba(0,0,0,0.4)]'}`}
                    style={{ 
                      bottom: `${pos.y}%`, 
                      left: `${pos.x}%`, 
                      zIndex: zIndex 
                    }}
                  >
                    {isEditing && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                        <Move className="w-2.5 h-2.5" /> Árbol 1
                      </div>
                    )}
                    {selectedBiome.id === 'forest' ? (
                      <div className="w-20 h-20 sm:w-28 sm:h-28">
                        <ItemIllustration itemId="forest_tree_spirit" size="scene" animate={!isEditing} />
                      </div>
                    ) : selectedBiome.id === 'desert' ? (
                      <div className="w-20 h-20 sm:w-28 sm:h-28">
                        <ItemIllustration itemId="desert_cactus_giant" size="scene" animate={!isEditing} />
                      </div>
                    ) : selectedBiome.id === 'mountain' ? (
                      <div className="w-20 h-20 sm:w-28 sm:h-28">
                        <ItemIllustration itemId="mountain_pine_snow" size="scene" animate={!isEditing} />
                      </div>
                    ) : (
                      <div className="w-20 h-20 sm:w-28 sm:h-28">
                        <ItemIllustration itemId="city_green_building" size="scene" animate={!isEditing} />
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* BASE ELEMENT 2: Flora Tree 2 */}
              {eco.trees > 1 && (() => {
                const elementId = 'base_tree_2';
                const pos = getPosition(elementId);
                const isDragging = draggingId === elementId;
                const zIndex = calculateZIndex(pos.y) + (isDragging ? 50 : 0);

                return (
                  <div 
                    key={elementId}
                    onPointerDown={(e) => handlePointerDown(elementId, e)}
                    className={`absolute pointer-events-auto transform -translate-x-1/2 select-none ${
                      isEditing ? 'cursor-grab active:cursor-grabbing hover:scale-105 transition-transform' : ''
                    } ${isDragging ? 'scale-110 drop-shadow-[0_20px_20px_rgba(16,185,129,0.5)]' : 'drop-shadow-[0_10px_10px_rgba(0,0,0,0.4)]'}`}
                    style={{ 
                      bottom: `${pos.y}%`, 
                      left: `${pos.x}%`, 
                      zIndex: zIndex 
                    }}
                  >
                    {isEditing && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                        <Move className="w-2.5 h-2.5" /> Flora 2
                      </div>
                    )}
                    {selectedBiome.id === 'forest' ? (
                      <div className="w-16 h-16 sm:w-22 sm:h-22">
                        <ItemIllustration itemId="forest_mushrooms" size="scene" animate={!isEditing} />
                      </div>
                    ) : selectedBiome.id === 'desert' ? (
                      <div className="w-18 h-18 sm:w-24 sm:h-24">
                        <ItemIllustration itemId="desert_oasis_palms" size="scene" animate={!isEditing} />
                      </div>
                    ) : selectedBiome.id === 'mountain' ? (
                      <div className="w-18 h-18 sm:w-24 sm:h-24">
                        <ItemIllustration itemId="mountain_crystal" size="scene" animate={!isEditing} />
                      </div>
                    ) : (
                      <div className="w-18 h-18 sm:w-24 sm:h-24">
                        <ItemIllustration itemId="city_rooftop_garden" size="scene" animate={!isEditing} />
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* BASE ELEMENT 3: Flora Tree 3 */}
              {eco.trees > 2 && (() => {
                const elementId = 'base_tree_3';
                const pos = getPosition(elementId);
                const isDragging = draggingId === elementId;
                const zIndex = calculateZIndex(pos.y) + (isDragging ? 50 : 0);

                return (
                  <div 
                    key={elementId}
                    onPointerDown={(e) => handlePointerDown(elementId, e)}
                    className={`absolute pointer-events-auto transform -translate-x-1/2 select-none ${
                      isEditing ? 'cursor-grab active:cursor-grabbing hover:scale-105 transition-transform' : ''
                    } ${isDragging ? 'scale-110 drop-shadow-[0_20px_20px_rgba(16,185,129,0.5)]' : 'drop-shadow-[0_10px_10px_rgba(0,0,0,0.4)]'}`}
                    style={{ 
                      bottom: `${pos.y}%`, 
                      left: `${pos.x}%`, 
                      zIndex: zIndex 
                    }}
                  >
                    {isEditing && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                        <Move className="w-2.5 h-2.5" /> Flora 3
                      </div>
                    )}
                    {selectedBiome.id === 'forest' ? (
                      <div className="w-18 h-18 sm:w-24 sm:h-24">
                        <ItemIllustration itemId="forest_flowers" size="scene" animate={!isEditing} />
                      </div>
                    ) : selectedBiome.id === 'desert' ? (
                      <div className="w-16 h-16 sm:w-22 sm:h-22">
                        <ItemIllustration itemId="desert_pottery" size="scene" animate={!isEditing} />
                      </div>
                    ) : selectedBiome.id === 'mountain' ? (
                      <div className="w-18 h-18 sm:w-24 sm:h-24">
                        <ItemIllustration itemId="mountain_pine_snow" size="scene" animate={!isEditing} />
                      </div>
                    ) : (
                      <div className="w-18 h-18 sm:w-24 sm:h-24">
                        <ItemIllustration itemId="city_solar_panels" size="scene" animate={!isEditing} />
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* BASE ELEMENT 4: Water Spring */}
              {eco.water > 0 && (() => {
                const elementId = 'base_water';
                const pos = getPosition(elementId);
                const isDragging = draggingId === elementId;
                const zIndex = calculateZIndex(pos.y) + (isDragging ? 50 : 0);

                return (
                  <div 
                    key={elementId}
                    onPointerDown={(e) => handlePointerDown(elementId, e)}
                    className={`absolute pointer-events-auto transform -translate-x-1/2 select-none ${
                      isEditing ? 'cursor-grab active:cursor-grabbing hover:scale-105 transition-transform' : ''
                    } ${isDragging ? 'scale-110 drop-shadow-[0_20px_20px_rgba(96,165,250,0.5)]' : 'drop-shadow-[0_5px_15px_rgba(96,165,250,0.4)]'}`}
                    style={{ 
                      bottom: `${pos.y}%`, 
                      left: `${pos.x}%`, 
                      zIndex: zIndex 
                    }}
                  >
                    {isEditing && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-slate-950 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                        <Move className="w-2.5 h-2.5" /> Agua
                      </div>
                    )}
                    {selectedBiome.id === 'forest' ? (
                      <div className="w-20 h-20 sm:w-28 sm:h-28">
                        <ItemIllustration itemId="forest_bridge" size="scene" animate={!isEditing} />
                      </div>
                    ) : selectedBiome.id === 'desert' ? (
                      <div className="w-20 h-20 sm:w-28 sm:h-28">
                        <ItemIllustration itemId="desert_crystal_fountain" size="scene" animate={!isEditing} />
                      </div>
                    ) : selectedBiome.id === 'mountain' ? (
                      <div className="w-20 h-20 sm:w-28 sm:h-28">
                        <ItemIllustration itemId="mountain_glacier_stream" size="scene" animate={!isEditing} />
                      </div>
                    ) : (
                      <div className="w-20 h-20 sm:w-28 sm:h-28">
                        <ItemIllustration itemId="city_eco_dome" size="scene" animate={!isEditing} />
                      </div>
                    )}
                  </div>
                );
              })()}
              
              {/* BASE ELEMENT 5: Animated Fauna */}
              {eco.animals > 0 && (() => {
                const elementId = 'base_animal';
                const pos = getPosition(elementId);
                const isDragging = draggingId === elementId;
                const zIndex = calculateZIndex(pos.y) + (isDragging ? 50 : 0);

                return (
                  <div 
                    key={elementId}
                    onPointerDown={(e) => handlePointerDown(elementId, e)}
                    className={`absolute pointer-events-auto transform -translate-x-1/2 select-none ${
                      isEditing ? 'cursor-grab active:cursor-grabbing hover:scale-105 transition-transform' : ''
                    } ${isDragging ? 'scale-110 drop-shadow-[0_20px_20px_rgba(251,191,36,0.5)]' : ''}`}
                    style={{ 
                      bottom: `${pos.y}%`, 
                      left: `${pos.x}%`, 
                      zIndex: zIndex 
                    }}
                  >
                    {isEditing && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                        <Move className="w-2.5 h-2.5" /> Fauna
                      </div>
                    )}
                    <div className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 flex items-center justify-center">
                      <ItemIllustration 
                        itemId={
                          selectedBiome.id === 'forest' 
                            ? 'forest_cat' 
                            : selectedBiome.id === 'desert' 
                              ? 'desert_cat' 
                              : selectedBiome.id === 'mountain' 
                                ? 'mountain_cat' 
                                : 'city_cat'
                        } 
                        size="scene" 
                        animate={!isEditing} 
                      />
                    </div>
                  </div>
                );
              })()}

              {/* EQUIPPED STORE ITEMS & DECORATIONS */}
              {activeDecorations.map((itemId, idx) => {
                const storeItem = STORE_ITEMS.find(s => s.id === itemId);
                if (!storeItem) return null;

                const elementId = `dec_${itemId}_${idx}`;
                const pos = getPosition(elementId);
                const isDragging = draggingId === elementId;
                const zIndex = calculateZIndex(pos.y) + (isDragging ? 50 : 0);

                return (
                  <div 
                    key={elementId}
                    onPointerDown={(e) => handlePointerDown(elementId, e)}
                    className={`absolute pointer-events-auto transform -translate-x-1/2 select-none origin-bottom ${
                      isEditing ? 'cursor-grab active:cursor-grabbing hover:scale-105 transition-transform' : ''
                    } ${isDragging ? 'scale-110 drop-shadow-[0_20px_20px_rgba(16,185,129,0.5)]' : ''}`}
                    style={{ 
                      bottom: `${pos.y}%`, 
                      left: `${pos.x}%`, 
                      zIndex: zIndex 
                    }}
                  >
                    {isEditing && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full shadow-md flex items-center gap-1 truncate max-w-[90px]">
                        <Move className="w-2.5 h-2.5 shrink-0" /> {storeItem.name}
                      </div>
                    )}
                    <SceneItemVisual item={storeItem} />
                  </div>
                );
              })}

              {/* Overlay message if completely empty */}
              {(eco.trees === 0 && eco.water === 0 && eco.animals === 0 && activeDecorations.length === 0) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-[#05070a]/60 backdrop-blur-md rounded-[40px] z-30 pointer-events-auto">
                  <span className="text-5xl mb-4 opacity-50">🌱</span>
                  <h3 className="text-2xl font-light text-white mb-2">Un mundo por descubrir</h3>
                  <p className="text-sm text-emerald-400 font-medium">Completa misiones y equipa objetos para llenar de vida tu {selectedBiome.name.toLowerCase()}.</p>
                </div>
              )}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="bg-white/5 border border-white/10 p-3 sm:p-4 rounded-2xl sm:rounded-3xl backdrop-blur-md flex flex-col items-center justify-center text-center transition-all hover:bg-white/10">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-500/20 text-emerald-400 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-3">
            <TreePine className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="text-xl sm:text-2xl font-light text-white">{eco.trees}</div>
          <div className="text-[9px] sm:text-[10px] text-emerald-400/70 font-bold uppercase tracking-widest mt-1">Flora (Árboles)</div>
        </div>
        <div className="bg-white/5 border border-white/10 p-3 sm:p-4 rounded-2xl sm:rounded-3xl backdrop-blur-md flex flex-col items-center justify-center text-center transition-all hover:bg-white/10">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-teal-500/20 text-teal-400 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-3">
            <Droplets className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="text-xl sm:text-2xl font-light text-white">{eco.water}</div>
          <div className="text-[9px] sm:text-[10px] text-teal-400/70 font-bold uppercase tracking-widest mt-1">Agua Limpia</div>
        </div>
        <div className="bg-white/5 border border-white/10 p-3 sm:p-4 rounded-2xl sm:rounded-3xl backdrop-blur-md flex flex-col items-center justify-center text-center transition-all hover:bg-white/10">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-500/20 text-amber-400 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-3">
            <Bird className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="text-xl sm:text-2xl font-light text-white">{eco.animals}</div>
          <div className="text-[9px] sm:text-[10px] text-amber-400/70 font-bold uppercase tracking-widest mt-1">Fauna Silvestre</div>
        </div>
      </div>

      {/* CONFIRMATION MODAL FOR RESETTING LAYOUT */}
      <AnimatePresence>
        {showResetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-bold text-white">¿Restablecer el mundo?</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Esto devolverá todos los árboles, animales y decoraciones de tu {selectedBiome.name} a su posición original.
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmReset}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-amber-500/20"
                >
                  Restablecer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
