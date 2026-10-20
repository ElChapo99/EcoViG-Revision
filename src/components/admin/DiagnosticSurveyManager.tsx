import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Sparkles, 
  Plus, 
  Trash2, 
  Upload, 
  Image as ImageIcon, 
  Eye, 
  History, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowUp, 
  ArrowDown, 
  Edit3, 
  RotateCcw, 
  X, 
  Check, 
  Lock, 
  Layers, 
  BarChart3, 
  ChevronRight, 
  HelpCircle,
  Clock,
  ShieldCheck,
  RefreshCw,
  Info
} from 'lucide-react';
import { 
  SurveyVersion, 
  SurveyVersionSummary, 
  ManagedSurveyQuestion, 
  SurveyCategory 
} from '../../types';
import { 
  fetchAdminSurveyConfig, 
  createOrGetSurveyDraft, 
  fetchSurveyVersion, 
  addSurveyQuestion, 
  updateSurveyQuestion, 
  deleteSurveyQuestion,
  retireSurveyQuestion, 
  restoreSurveyQuestion, 
  reorderSurveyQuestions, 
  uploadQuestionImage, 
  removeQuestionImage, 
  publishSurveyVersion,
  fetchHistoricalPool,
  recoverHistoricalQuestion
} from '../../lib/surveyAdminService';
import { CATEGORIES_CONFIG } from '../../data/surveyData';

const ALL_CATEGORIES: SurveyCategory[] = [
  'Conducta Pro-Ambiental',
  'Austeridad',
  'Altruismo',
  'Equidad',
];

export default function DiagnosticSurveyManager() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Versions State
  const [publishedVersion, setPublishedVersion] = useState<SurveyVersion | null>(null);
  const [activeDraft, setActiveDraft] = useState<SurveyVersion | null>(null);
  const [allVersions, setAllVersions] = useState<SurveyVersionSummary[]>([]);
  const [viewMode, setViewMode] = useState<'draft' | 'published'>('published');

  // Active Version being edited/viewed
  const currentVersion = viewMode === 'draft' && activeDraft ? activeDraft : publishedVersion;

  // Selected Category filter
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  // Modals
  const [showNewQuestionModal, setShowNewQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<ManagedSurveyQuestion | null>(null);
  const [imageModalQuestion, setImageModalQuestion] = useState<ManagedSurveyQuestion | null>(null);
  const [questionToDelete, setQuestionToDelete] = useState<ManagedSurveyQuestion | null>(null);
  const [isDeletingQuestion, setIsDeletingQuestion] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [showHistoricalPoolModal, setShowHistoricalPoolModal] = useState(false);
  const [historicalPool, setHistoricalPool] = useState<ManagedSurveyQuestion[]>([]);
  const [loadingHistoricalPool, setLoadingHistoricalPool] = useState(false);
  const [recoveringQuestionId, setRecoveringQuestionId] = useState<string | null>(null);

  // New Question Form
  const [newText, setNewText] = useState('');
  const [newCategory, setNewCategory] = useState<SurveyCategory>('Conducta Pro-Ambiental');
  const [newReverseScoring, setNewReverseScoring] = useState(false);
  const [savingQuestion, setSavingQuestion] = useState(false);

  // Image Upload Form
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Preview State
  const [previewIndex, setPreviewIndex] = useState(0);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminSurveyConfig();
      setPublishedVersion(data.currentPublishedVersion);
      setActiveDraft(data.activeDraftVersion);
      setAllVersions(data.allVersions);
      if (data.activeDraftVersion) {
        setViewMode('draft');
      } else {
        setViewMode('published');
      }
    } catch (err: any) {
      console.error('Error loading survey config:', err);
      setError(err.message || 'No se pudo cargar la configuración de evaluaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDraft = async () => {
    setLoading(true);
    setError(null);
    try {
      const { draft } = await createOrGetSurveyDraft();
      setActiveDraft(draft);
      setViewMode('draft');
      setSuccessMessage('Borrador creado/cargado exitosamente. Ahora puedes editar las preguntas.');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error('Error creating draft:', err);
      setError(err.message || 'No se pudo crear el borrador');
    } finally {
      setLoading(false);
    }
  };

  // --- QUESTION CRUD ---
  const handleSaveNewQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDraft) return;
    if (!newText.trim()) {
      setError('El texto de la pregunta no puede estar vacío');
      return;
    }

    setSavingQuestion(true);
    setError(null);
    try {
      const { version } = await addSurveyQuestion(activeDraft.versionId, {
        text: newText.trim(),
        category: newCategory,
        reverseScoring: newReverseScoring,
      });
      setActiveDraft(version);
      setShowNewQuestionModal(false);
      setNewText('');
      setNewCategory('Conducta Pro-Ambiental');
      setNewReverseScoring(false);
      setSuccessMessage('Pregunta agregada al borrador.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Error adding question:', err);
      setError(err.message || 'No se pudo agregar la pregunta');
    } finally {
      setSavingQuestion(false);
    }
  };

  const handleUpdateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDraft || !editingQuestion) return;
    if (!editingQuestion.text.trim()) {
      setError('El texto de la pregunta no puede estar vacío');
      return;
    }

    setSavingQuestion(true);
    setError(null);
    try {
      const { version } = await updateSurveyQuestion(
        activeDraft.versionId,
        editingQuestion.id,
        {
          text: editingQuestion.text.trim(),
          category: editingQuestion.category,
          reverseScoring: editingQuestion.reverseScoring,
        }
      );
      setActiveDraft(version);
      setEditingQuestion(null);
      setSuccessMessage('Pregunta actualizada en el borrador.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Error updating question:', err);
      setError(err.message || 'No se pudo actualizar la pregunta');
    } finally {
      setSavingQuestion(false);
    }
  };

  const handleOpenDeleteModal = (question: ManagedSurveyQuestion) => {
    setQuestionToDelete(question);
  };

  const handleConfirmDelete = async () => {
    if (!activeDraft || !questionToDelete) return;
    setIsDeletingQuestion(true);
    setError(null);
    try {
      const res = await deleteSurveyQuestion(activeDraft.versionId, questionToDelete.id);
      setActiveDraft(res.version);
      const isDraftOnly = questionToDelete.id.startsWith('q_new_');
      setSuccessMessage(
        res.message || 
        (isDraftOnly 
          ? `Pregunta #${questionToDelete.order} (${questionToDelete.id}) eliminada definitivamente del borrador.` 
          : `Pregunta #${questionToDelete.order} (${questionToDelete.id}) retirada del borrador.`)
      );
      setTimeout(() => setSuccessMessage(null), 3500);
      setQuestionToDelete(null);
    } catch (err: any) {
      console.error('Error deleting question:', err);
      setError(err.message || 'No se pudo eliminar la pregunta');
    } finally {
      setIsDeletingQuestion(false);
    }
  };

  const handleRestoreQuestion = async (question: ManagedSurveyQuestion) => {
    if (!activeDraft) return;
    try {
      const { version } = await restoreSurveyQuestion(activeDraft.versionId, question.id);
      setActiveDraft(version);
      setSuccessMessage(`Pregunta ${question.id} restaurada en el borrador.`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Error restoring question:', err);
      setError(err.message || 'No se pudo restaurar la pregunta');
    }
  };

  const handleOpenHistoricalPool = async () => {
    if (!activeDraft) return;
    setLoadingHistoricalPool(true);
    setShowHistoricalPoolModal(true);
    setError(null);
    try {
      const res = await fetchHistoricalPool(activeDraft.versionId);
      setHistoricalPool(res.historicalQuestions);
    } catch (err: any) {
      console.error('Error fetching historical pool:', err);
      setError(err.message || 'No se pudo cargar el banco de preguntas históricas');
    } finally {
      setLoadingHistoricalPool(false);
    }
  };

  const handleRecoverHistoricalQuestion = async (questionId: string) => {
    if (!activeDraft) return;
    setRecoveringQuestionId(questionId);
    setError(null);
    try {
      const res = await recoverHistoricalQuestion(activeDraft.versionId, questionId);
      setActiveDraft(res.version);
      setSuccessMessage(res.message || `Pregunta histórica ${questionId} reincorporada al borrador.`);
      setTimeout(() => setSuccessMessage(null), 3000);
      // Remove from available modal pool
      setHistoricalPool(prev => prev.filter(q => q.id !== questionId));
    } catch (err: any) {
      console.error('Error recovering historical question:', err);
      setError(err.message || 'No se pudo reincorporar la pregunta');
    } finally {
      setRecoveringQuestionId(null);
    }
  };

  // --- REORDER ---
  const handleMoveQuestion = async (questionId: string, direction: 'up' | 'down') => {
    if (!activeDraft) return;
    const activeQuestions = activeDraft.questions
      .filter(q => !q.retired)
      .sort((a, b) => a.order - b.order);

    const index = activeQuestions.findIndex(q => q.id === questionId);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === activeQuestions.length - 1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const newOrderedList = [...activeQuestions];
    const [moved] = newOrderedList.splice(index, 1);
    newOrderedList.splice(newIndex, 0, moved);

    const orderedIds = newOrderedList.map(q => q.id);

    try {
      const { version } = await reorderSurveyQuestions(activeDraft.versionId, orderedIds);
      setActiveDraft(version);
    } catch (err: any) {
      console.error('Error reordering questions:', err);
      setError(err.message || 'No se pudo reordenar');
    }
  };

  // --- IMAGE MANAGEMENT ---
  const handleOpenImageModal = (question: ManagedSurveyQuestion) => {
    if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setImageModalQuestion(question);
    setSelectedImageFile(null);
    setImagePreviewUrl(question.imageUrl || null);
  };

  const handleCloseImageModal = () => {
    if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setImageModalQuestion(null);
    setSelectedImageFile(null);
    setImagePreviewUrl(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setError('Formato inválido. Por favor selecciona PNG, JPG o WEBP.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen excede el límite máximo de 5MB.');
      return;
    }

    if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setSelectedImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
  };

  const handleUploadImageSubmit = async () => {
    if (!activeDraft || !imageModalQuestion || !selectedImageFile) return;

    setUploadingImage(true);
    setError(null);
    try {
      const { version } = await uploadQuestionImage(
        activeDraft.versionId,
        imageModalQuestion.id,
        selectedImageFile
      );
      setActiveDraft(version);
      setImageModalQuestion(null);
      setSelectedImageFile(null);
      setSuccessMessage('Imagen subida y asignada a la pregunta.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Error uploading image:', err);
      setError(err.message || 'No se pudo subir la imagen');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImageSubmit = async () => {
    if (!activeDraft || !imageModalQuestion) return;
    if (!window.confirm('¿Quitar la imagen de esta pregunta? La pregunta permanecerá sin imagen.')) return;

    setUploadingImage(true);
    setError(null);
    try {
      const { version } = await removeQuestionImage(
        activeDraft.versionId,
        imageModalQuestion.id
      );
      setActiveDraft(version);
      setImageModalQuestion(null);
      setSelectedImageFile(null);
      setSuccessMessage('Imagen removida de la pregunta.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Error removing image:', err);
      setError(err.message || 'No se pudo quitar la imagen');
    } finally {
      setUploadingImage(false);
    }
  };

  // --- PUBLISH ---
  const handlePublish = async () => {
    if (!activeDraft) return;
    setPublishing(true);
    setError(null);
    try {
      const { publishedVersion: newPub, message } = await publishSurveyVersion(activeDraft.versionId);
      setPublishedVersion(newPub);
      setActiveDraft(null);
      setViewMode('published');
      setShowPublishModal(false);
      setSuccessMessage(message || '¡Nueva versión oficial publicada exitosamente!');
      await loadConfig();
    } catch (err: any) {
      console.error('Error publishing version:', err);
      setError(err.message || 'No se pudo publicar la versión');
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
        <p className="text-sm text-slate-400 font-medium">Cargando gestor de evaluación diagnóstica...</p>
      </div>
    );
  }

  // Distinguir explícitamente "ESTADO DE CARGA FALLIDO" de "CUESTIONARIO REALMENTE VACÍO"
  // Si falló la comunicación con el backend, NO mostrar contadores en 0 ni tabs vacíos ficticios.
  if (error && !publishedVersion && !activeDraft) {
    return (
      <div className="bg-[#0b1320] border border-red-500/30 rounded-[32px] p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-2xl backdrop-blur-xl space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(239,68,68,0.2)]">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl sm:text-2xl font-light text-white">
            No se pudo cargar la Evaluación Diagnóstica
          </h3>
          <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
            {error}
          </p>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={loadConfig}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs sm:text-sm transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Reintentar
          </button>
        </div>
      </div>
    );
  }

  const activeQuestions = (currentVersion?.questions || [])
    .filter(q => !q.retired)
    .sort((a, b) => a.order - b.order);

  const retiredQuestions = (currentVersion?.questions || [])
    .filter(q => q.retired);

  const filteredQuestions = selectedCategoryFilter === 'all'
    ? activeQuestions
    : activeQuestions.filter(q => q.category === selectedCategoryFilter);

  const isEditingDraft = viewMode === 'draft' && Boolean(activeDraft);

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner & Version Status */}
      <div className="bg-gradient-to-br from-[#0c1322] via-[#09101c] to-[#040810] border border-white/10 p-6 sm:p-8 rounded-[32px] shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
                <Compass className="w-3.5 h-3.5 text-emerald-400" /> Evaluación Diagnóstica Oficial
              </span>
              {activeDraft && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-semibold border border-amber-500/30">
                  <Edit3 className="w-3 h-3" /> Borrador en edición ({activeDraft.versionId})
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-light text-white tracking-tight">
              Gestor de Preguntas e Imágenes
            </h2>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Administra el cuestionario oficial de 4 dimensiones para la <strong>Evaluación Diagnóstica Inicial</strong> y <strong>Evaluación Final Comparativa</strong>. Los cambios se editan en borrador y se publican como nuevas versiones inmutables.
            </p>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-2.5 self-stretch lg:self-auto justify-end">
            <button
              onClick={() => setShowHistoryModal(true)}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-medium transition-colors flex items-center gap-2"
            >
              <History className="w-4 h-4 text-slate-400" /> Historial de Versiones
            </button>

            <button
              onClick={() => {
                setPreviewIndex(0);
                setShowPreviewModal(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-medium transition-colors flex items-center gap-2"
            >
              <Eye className="w-4 h-4 text-emerald-400" /> Vista Previa
            </button>

            {!activeDraft ? (
              <button
                onClick={handleCreateDraft}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-all shadow-[0_0_20px_rgba(16,185,129,0.35)] flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Crear Borrador de Edición
              </button>
            ) : (
              <button
                onClick={() => setShowPublishModal(true)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-bold text-xs transition-all shadow-[0_0_25px_rgba(16,185,129,0.4)] flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> Publicar Cambios Oficiales
              </button>
            )}
          </div>
        </div>

        {/* Mode Switcher Tabs if draft exists */}
        {activeDraft && (
          <div className="mt-6 pt-5 border-t border-white/10 flex items-center gap-3">
            <span className="text-xs text-slate-400 font-medium">Modo de visualización:</span>
            <button
              onClick={() => setViewMode('draft')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'draft'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" /> Borrador Actual ({activeDraft.questions.filter(q => !q.retired).length} preguntas)
            </button>
            <button
              onClick={() => setViewMode('published')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'published'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Versión Publicada Vigente ({publishedVersion?.questions?.length || 0} preguntas)
            </button>
          </div>
        )}
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Dynamic Summary Cards */}
      {currentVersion && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Preguntas</div>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-white mt-1">
              {activeQuestions.length}
            </div>
            <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
              Rango {currentVersion.scoreRanges.minTotal} - {currentVersion.scoreRanges.maxTotal} pts
            </div>
          </div>

          {ALL_CATEGORIES.map(cat => {
            const count = currentVersion.categoryCounts[cat] || 0;
            const range = currentVersion.scoreRanges.categories[cat] || { minScore: count * 100, maxScore: count * 400 };
            const cfg = CATEGORIES_CONFIG[cat];

            return (
              <div key={cat} className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400">
                  <span className="truncate">{cat}</span>
                  <span>{cfg.icon}</span>
                </div>
                <div className="text-2xl sm:text-3xl font-mono font-bold text-white mt-1">
                  {count}
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  {range.minScore} - {range.maxScore} pts
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Controls & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              selectedCategoryFilter === 'all'
                ? 'bg-white/20 text-white font-bold'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            Todas ({activeQuestions.length})
          </button>
          {ALL_CATEGORIES.map(cat => {
            const count = activeQuestions.filter(q => q.category === cat).length;
            const cfg = CATEGORIES_CONFIG[cat];
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                  selectedCategoryFilter === cat
                    ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <span>{cfg.icon}</span>
                <span>{cat} ({count})</span>
              </button>
            );
          })}
        </div>

        {/* Actions in Draft Mode */}
        {isEditingDraft && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handleOpenHistoricalPool}
              className="px-3.5 py-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-xs font-semibold transition-all flex items-center gap-1.5"
              title="Reincorporar preguntas de versiones oficiales anteriores"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Recuperar Pregunta Histórica
            </button>

            <button
              onClick={() => setShowNewQuestionModal(true)}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-all flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" /> + Nueva Pregunta
            </button>
          </div>
        )}
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {filteredQuestions.map((q, idx) => {
          const cfg = CATEGORIES_CONFIG[q.category] || CATEGORIES_CONFIG['Conducta Pro-Ambiental'];

          return (
            <div
              key={q.id}
              className={`p-4 sm:p-5 rounded-2xl bg-white/[0.04] border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                isEditingDraft ? 'hover:border-white/25 border-white/10' : 'border-white/5'
              }`}
            >
              {/* Left: Reorder Controls (if draft) + Order & ID + Image Thumbnail + Text */}
              <div className="flex items-start gap-3.5 flex-1">
                {isEditingDraft && (
                  <div className="flex flex-col gap-1 shrink-0 pt-0.5">
                    <button
                      onClick={() => handleMoveQuestion(q.id, 'up')}
                      disabled={idx === 0}
                      className="p-1 rounded bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed"
                      title="Subir orden"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveQuestion(q.id, 'down')}
                      disabled={idx === filteredQuestions.length - 1}
                      className="p-1 rounded bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed"
                      title="Bajar orden"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Question Image Preview Thumbnail */}
                <div className="shrink-0">
                  {q.imageUrl ? (
                    <div 
                      onClick={() => isEditingDraft && handleOpenImageModal(q)}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-white/15 bg-black/40 flex items-center justify-center cursor-pointer group relative shadow-md"
                      title={isEditingDraft ? 'Clic para cambiar o quitar imagen' : 'Imagen asignada'}
                    >
                      <img 
                        src={q.imageUrl} 
                        alt={q.text} 
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform" 
                      />
                      {isEditingDraft && (
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-[10px] text-white font-semibold">
                          Cambiar
                        </div>
                      )}
                    </div>
                  ) : (
                    <div 
                      onClick={() => isEditingDraft && handleOpenImageModal(q)}
                      className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${
                        isEditingDraft 
                          ? 'border-white/15 hover:border-emerald-400/50 bg-white/[0.02] hover:bg-emerald-500/5 cursor-pointer text-slate-400 hover:text-emerald-300'
                          : 'border-white/10 bg-black/20 text-slate-600'
                      }`}
                      title={isEditingDraft ? 'Asignar imagen a esta pregunta' : 'Sin imagen'}
                    >
                      <ImageIcon className="w-5 h-5 mb-1 opacity-70" />
                      <span className="text-[9px] font-medium">
                        {isEditingDraft ? '+ Imagen' : 'Sin foto'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded-md">
                      #{q.order} • {q.id}
                    </span>

                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border flex items-center gap-1 ${cfg.bgLight} ${cfg.color} ${cfg.borderColor}`}>
                      <span>{cfg.icon}</span>
                      <span>{q.category}</span>
                    </span>

                    <span className={`text-[11px] px-2 py-0.5 rounded-md font-mono ${
                      q.reverseScoring 
                        ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30' 
                        : 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
                    }`}>
                      {q.reverseScoring ? 'Inversa (Siempre = 100)' : 'Directa (Siempre = 400)'}
                    </span>
                  </div>

                  <p className="text-sm sm:text-base font-medium text-white leading-relaxed">
                    "{q.text}"
                  </p>
                </div>
              </div>

              {/* Right: Actions */}
              {isEditingDraft && (
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center pt-2 md:pt-0">
                  <button
                    onClick={() => handleOpenImageModal(q)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-emerald-300 border border-white/10 transition-colors text-xs flex items-center gap-1"
                    title="Administrar imagen"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{q.imageUrl ? 'Cambiar Foto' : '+ Foto'}</span>
                  </button>

                  <button
                    onClick={() => setEditingQuestion({ ...q })}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors text-xs flex items-center gap-1"
                    title="Editar texto o puntuación"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                    <span className="hidden sm:inline">Editar</span>
                  </button>

                  <button
                    onClick={() => handleOpenDeleteModal(q)}
                    className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors text-xs flex items-center gap-1"
                    title="Eliminar pregunta"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Eliminar</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {filteredQuestions.length === 0 && (
          <div className="p-8 text-center bg-white/5 border border-white/10 rounded-2xl text-slate-400 text-sm">
            No hay preguntas en la dimensión seleccionada.
          </div>
        )}
      </div>

      {/* Retired Questions in Draft (Optional restore) */}
      {isEditingDraft && retiredQuestions.length > 0 && (
        <div className="mt-8 pt-6 border-t border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-400" /> Preguntas Retiradas en este Borrador ({retiredQuestions.length})
            </h4>
            <span className="text-xs text-slate-500">Dejarán de estar en la nueva versión si no se restauran</span>
          </div>

          <div className="space-y-2">
            {retiredQuestions.map(q => (
              <div key={q.id} className="p-3.5 rounded-xl bg-red-500/5 border border-red-500/20 flex items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="text-slate-400 font-mono">#{q.order} • {q.id} ({q.category})</span>
                  <p className="text-slate-300 line-through">"{q.text}"</p>
                </div>
                <button
                  onClick={() => handleRestoreQuestion(q)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold shrink-0"
                >
                  Restaurar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: NEW QUESTION */}
      {/* ========================================================================= */}
      {showNewQuestionModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0c1322] border border-white/15 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">Nueva Pregunta Diagnóstica</h3>
                  <p className="text-xs text-slate-400">Se agregará al borrador activo con un ID único</p>
                </div>
              </div>
              <button onClick={() => setShowNewQuestionModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewQuestion} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Texto de la pregunta *
                </label>
                <textarea
                  value={newText}
                  onChange={e => setNewText(e.target.value)}
                  rows={3}
                  required
                  placeholder="Ej: Separo los residuos reciclables en mi casa o escuela..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Dimensión *
                  </label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as SurveyCategory)}
                    className="w-full bg-[#131b2e] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-400"
                  >
                    {ALL_CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Tipo de Puntuación *
                  </label>
                  <select
                    value={newReverseScoring ? 'reverse' : 'direct'}
                    onChange={e => setNewReverseScoring(e.target.value === 'reverse')}
                    className="w-full bg-[#131b2e] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-400"
                  >
                    <option value="direct">Directa (Siempre = 400)</option>
                    <option value="reverse">Inversa (Siempre = 100)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowNewQuestionModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingQuestion || !newText.trim()}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-md disabled:opacity-50"
                >
                  {savingQuestion ? 'Guardando...' : 'Agregar al Borrador'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT QUESTION */}
      {/* ========================================================================= */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0c1322] border border-white/15 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">Editar Pregunta ({editingQuestion.id})</h3>
                  <p className="text-xs text-slate-400">Modifica el texto o tipo de puntuación en el borrador</p>
                </div>
              </div>
              <button onClick={() => setEditingQuestion(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateQuestion} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Texto de la pregunta *
                </label>
                <textarea
                  value={editingQuestion.text}
                  onChange={e => setEditingQuestion({ ...editingQuestion, text: e.target.value })}
                  rows={3}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Dimensión *
                  </label>
                  <select
                    value={editingQuestion.category}
                    onChange={e => setEditingQuestion({ ...editingQuestion, category: e.target.value as SurveyCategory })}
                    className="w-full bg-[#131b2e] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-400"
                  >
                    {ALL_CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Tipo de Puntuación *
                  </label>
                  <select
                    value={editingQuestion.reverseScoring ? 'reverse' : 'direct'}
                    onChange={e => setEditingQuestion({ ...editingQuestion, reverseScoring: e.target.value === 'reverse' })}
                    className="w-full bg-[#131b2e] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-400"
                  >
                    <option value="direct">Directa (Siempre = 400)</option>
                    <option value="reverse">Inversa (Siempre = 100)</option>
                  </select>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Los cambios se aplicarán a la nueva versión que publiques. Las versiones históricas y los estudiantes existentes conservarán su configuración original.
                </span>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingQuestion(null)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingQuestion || !editingQuestion.text.trim()}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-md disabled:opacity-50"
                >
                  {savingQuestion ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CONFIRM DELETE QUESTION */}
      {/* ========================================================================= */}
      {questionToDelete && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0c1322] border border-white/15 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">
                    {questionToDelete.wasEverPublished 
                      ? '¿Retirar Pregunta de la Nueva Versión?'
                      : '¿Eliminar Pregunta del Borrador?'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Pregunta #{questionToDelete.order} • {questionToDelete.id}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => !isDeletingQuestion && setQuestionToDelete(null)} 
                className="text-slate-400 hover:text-white disabled:opacity-50"
                disabled={isDeletingQuestion}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Question Details preview */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-medium border bg-white/10 text-slate-300 border-white/15">
                    {questionToDelete.category}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-md font-mono bg-white/5 text-slate-400">
                    {questionToDelete.reverseScoring ? 'Inversa (Siempre = 100)' : 'Directa (Siempre = 400)'}
                  </span>
                </div>
                <p className="text-sm text-white font-medium italic">
                  "{questionToDelete.text}"
                </p>
              </div>

              {/* Explanation Box */}
              {!questionToDelete.wasEverPublished ? (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-xs text-red-200/90 leading-relaxed space-y-1">
                  <p className="font-semibold text-red-300">⚠️ Eliminación permanente:</p>
                  <p>
                    Esta pregunta fue creada en este borrador y <strong>nunca ha pertenecido a una versión publicada</strong>. Se eliminará definitivamente del borrador.
                  </p>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-200/90 leading-relaxed space-y-1">
                  <p className="font-semibold text-amber-300">🛡️ Pregunta de versión oficial previa:</p>
                  <p>
                    Esta pregunta proviene de una versión publicada anterior. Al eliminarla, se marcará como <strong>RETIRADA</strong> en este borrador. Dejará de aparecer en la nueva versión oficial que publiques, pero <strong>las versiones anteriores e historial de estudiantes permanecerán intactos</strong>. Podrás restaurarla en este borrador antes de publicar.
                  </p>
                </div>
              )}

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  disabled={isDeletingQuestion}
                  onClick={() => setQuestionToDelete(null)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={isDeletingQuestion}
                  onClick={handleConfirmDelete}
                  className="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold text-xs shadow-[0_0_20px_rgba(239,68,68,0.3)] disabled:opacity-50 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  {isDeletingQuestion 
                    ? 'Eliminando...' 
                    : !questionToDelete.wasEverPublished 
                      ? 'Eliminar Definitivamente' 
                      : 'Retirar de esta Versión'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: IMAGE UPLOAD / REPLACE */}
      {/* ========================================================================= */}
      {imageModalQuestion && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0c1322] border border-white/15 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">Imagen de la Pregunta</h3>
                  <p className="text-xs text-slate-400">Pregunta #{imageModalQuestion.order} ({imageModalQuestion.id})</p>
                </div>
              </div>
              <button onClick={handleCloseImageModal} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-slate-300">
                "{imageModalQuestion.text}"
              </p>

              {/* Image Preview Box */}
              <div className="w-full h-48 rounded-2xl border-2 border-dashed border-white/20 bg-black/30 flex items-center justify-center overflow-hidden relative">
                {imagePreviewUrl ? (
                  <img 
                    src={imagePreviewUrl} 
                    alt="Vista previa" 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center p-4 space-y-1 text-slate-500">
                    <ImageIcon className="w-8 h-8 mx-auto opacity-50" />
                    <p className="text-xs">No hay imagen asignada actualmente</p>
                    <p className="text-[10px] text-slate-600">Sube un archivo PNG, JPG o WEBP (máx. 5MB)</p>
                  </div>
                )}
              </div>

              {/* File Input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Seleccionar archivo de imagen
                </label>
                <input 
                  type="file" 
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-300 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-500/20 file:text-emerald-300 hover:file:bg-emerald-500/30 cursor-pointer"
                />
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-white/10">
                {imageModalQuestion.imageUrl ? (
                  <button
                    type="button"
                    onClick={handleRemoveImageSubmit}
                    disabled={uploadingImage}
                    className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Quitar Imagen
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCloseImageModal}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium"
                  >
                    Cerrar
                  </button>

                  {selectedImageFile && (
                    <button
                      type="button"
                      onClick={handleUploadImageSubmit}
                      disabled={uploadingImage}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-md disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {uploadingImage ? 'Subiendo...' : 'Guardar Imagen'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PREVIEW AS STUDENT */}
      {/* ========================================================================= */}
      {showPreviewModal && activeQuestions.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0c1322] border border-white/15 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                  Vista Previa del Estudiante • Pregunta {previewIndex + 1} de {activeQuestions.length}
                </span>
              </div>
              <button onClick={() => setShowPreviewModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Student Question Card Preview */}
            <div className="space-y-5">
              {/* Category */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-300">
                <span>{CATEGORIES_CONFIG[activeQuestions[previewIndex].category]?.icon}</span>
                <span>{activeQuestions[previewIndex].category}</span>
              </div>

              {/* Image Preview if present */}
              {activeQuestions[previewIndex].imageUrl && (
                <div className="w-full flex justify-center">
                  <img 
                    src={activeQuestions[previewIndex].imageUrl || ''} 
                    alt={activeQuestions[previewIndex].text} 
                    className="max-h-56 sm:max-h-72 w-auto max-w-full rounded-2xl object-contain shadow-lg border border-white/10 bg-black/20"
                  />
                </div>
              )}

              {/* Question Text */}
              <h3 className="text-xl sm:text-2xl font-light text-white leading-snug">
                "{activeQuestions[previewIndex].text}"
              </h3>

              {/* 4 Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {['Nunca', 'Casi nunca', 'Casi siempre', 'Siempre'].map(opt => (
                  <div 
                    key={opt}
                    className="p-4 rounded-2xl bg-white/5 border border-white/10 text-slate-300 text-sm flex items-center justify-between hover:border-emerald-400/40"
                  >
                    <span>{opt}</span>
                    <div className="w-5 h-5 rounded-full border border-white/20" />
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation in preview */}
            <div className="pt-4 flex items-center justify-between border-t border-white/10">
              <button
                disabled={previewIndex === 0}
                onClick={() => setPreviewIndex(prev => prev - 1)}
                className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 disabled:opacity-30 text-xs"
              >
                Anterior
              </button>
              <span className="text-xs text-slate-500 font-mono">
                {previewIndex + 1} / {activeQuestions.length}
              </span>
              <button
                disabled={previewIndex === activeQuestions.length - 1}
                onClick={() => setPreviewIndex(prev => prev + 1)}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-black font-bold disabled:opacity-30 text-xs"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PUBLISH CONFIRMATION */}
      {/* ========================================================================= */}
      {showPublishModal && activeDraft && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0c1322] border border-white/15 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">¿Publicar esta Nueva Versión?</h3>
                  <p className="text-xs text-slate-400">Se convertirá en la versión oficial del cuestionario</p>
                </div>
              </div>
              <button onClick={() => setShowPublishModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Summary Stats */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total de preguntas activas:</span>
                  <span className="text-white font-mono font-bold">{activeQuestions.length} preguntas</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Rango de puntuación total:</span>
                  <span className="text-emerald-400 font-mono font-bold">
                    {activeDraft.scoreRanges.minTotal} - {activeDraft.scoreRanges.maxTotal} pts
                  </span>
                </div>
                <div className="pt-2 border-t border-white/5 space-y-1">
                  <span className="text-slate-400 block mb-1">Distribución por Dimensión:</span>
                  {ALL_CATEGORIES.map(c => (
                    <div key={c} className="flex justify-between text-[11px] text-slate-300">
                      <span>• {c}:</span>
                      <span className="font-mono">{activeDraft.categoryCounts[c] || 0} preguntas</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-200 leading-relaxed space-y-1">
                <p className="font-semibold text-emerald-300">🔒 Principio de Validación Científica:</p>
                <p>
                  Los estudiantes nuevos utilizarán esta nueva versión. Los estudiantes que ya realizaron su Evaluación Inicial conservarán automáticamente su versión original para la Evaluación Final, garantizando una comparativa válida.
                </p>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowPublishModal(false)}
                  disabled={publishing}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={publishing || activeQuestions.length === 0}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-[0_0_20px_rgba(16,185,129,0.4)] disabled:opacity-50 flex items-center gap-2"
                >
                  {publishing ? 'Publicando...' : 'Confirmar y Publicar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VERSION HISTORY */}
      {/* ========================================================================= */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0c1322] border border-white/15 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">Historial de Versiones</h3>
                  <p className="text-xs text-slate-400">Versiones oficiales publicadas y archivadas</p>
                </div>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {allVersions.map((v) => {
                const isCurrent = v.versionId === publishedVersion?.versionId;
                const isDraft = v.status === 'draft';

                return (
                  <div
                    key={v.versionId}
                    className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isCurrent
                        ? 'bg-emerald-500/10 border-emerald-500/40'
                        : isDraft
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white text-sm">{v.name}</span>
                        {isCurrent && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/40">
                            Oficial Vigente
                          </span>
                        )}
                        {isDraft && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/40">
                            Borrador
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-3">
                        <span>{v.questionCount} preguntas</span>
                        <span>•</span>
                        <span>
                          {v.publishedAt 
                            ? `Publicada el ${new Date(v.publishedAt).toLocaleDateString('es-MX')}`
                            : `Creada el ${new Date(v.createdAt).toLocaleDateString('es-MX')}`}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs font-mono text-slate-300 self-start sm:self-auto">
                      Rango {v.scoreRanges.minTotal} - {v.scoreRanges.maxTotal} pts
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {/* ========================================================================= */}
      {/* MODAL: HISTORICAL QUESTIONS POOL */}
      {/* ========================================================================= */}
      {showHistoricalPoolModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0c1322] border border-white/15 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">Banco de Preguntas Históricas</h3>
                  <p className="text-xs text-slate-400">Reincorpora preguntas de versiones publicadas anteriores con su ID original</p>
                </div>
              </div>
              <button onClick={() => setShowHistoricalPoolModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingHistoricalPool ? (
              <div className="p-8 text-center space-y-3">
                <RefreshCw className="w-6 h-6 text-purple-400 animate-spin mx-auto" />
                <p className="text-xs text-slate-400">Consultando versiones históricas...</p>
              </div>
            ) : historicalPool.length === 0 ? (
              <div className="p-8 text-center bg-white/5 border border-white/10 rounded-2xl space-y-2">
                <Check className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-medium text-white">No hay preguntas históricas pendientes</h4>
                <p className="text-xs text-slate-400">Todas las preguntas oficiales históricas ya están presentes en este borrador.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {historicalPool.map(q => {
                  const cfg = CATEGORIES_CONFIG[q.category] || CATEGORIES_CONFIG['Conducta Pro-Ambiental'];
                  const isRecovering = recoveringQuestionId === q.id;

                  return (
                    <div 
                      key={q.id}
                      className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-purple-300 bg-purple-500/15 px-2 py-0.5 rounded-md border border-purple-500/30">
                            {q.id}
                          </span>
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border flex items-center gap-1 ${cfg.bgLight} ${cfg.color} ${cfg.borderColor}`}>
                            <span>{cfg.icon}</span>
                            <span>{q.category}</span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {q.reverseScoring ? 'Inversa' : 'Directa'}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-white leading-relaxed">
                          "{q.text}"
                        </p>
                      </div>

                      <button
                        onClick={() => handleRecoverHistoricalQuestion(q.id)}
                        disabled={isRecovering}
                        className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-black font-bold text-xs transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-50 shadow-md"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        {isRecovering ? 'Reincorporando...' : 'Reincorporar al Borrador'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
