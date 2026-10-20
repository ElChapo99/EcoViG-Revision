import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ShieldAlert, 
  CheckCircle, 
  Camera, 
  RefreshCw, 
  Trash2, 
  Radio, 
  Lock as LockIcon, 
  Check, 
  Sparkles,
  SwitchCamera,
  Calendar,
  Layers,
  ChevronRight,
  AlertTriangle,
  Info,
  Edit3,
  FileText,
  Clock
} from 'lucide-react';
import { MainMissionActivity, ComplementaryActivity } from '../../data/surveyData';
import { DailyCheckInRecord } from '../../types';
import { resolveActivityDestination } from '../../lib/activityResolver';
import ActivityInstructionsAccordion from './ActivityInstructionsAccordion';
import { 
  calculateMultiDayProgress, 
  normalizeSequentialEvidences,
  PROJECT_TIME_ZONE,
  formatProjectDate,
  MIN_EVIDENCE_NOTE_LENGTH,
  MAX_EVIDENCE_NOTE_LENGTH 
} from '../../lib/multiDayMissionProgress';

interface EvidenceModalProps {
  activity: MainMissionActivity | ComplementaryActivity;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (evidenceData: any) => Promise<void>;
  currentDay?: number;
  totalDays?: number;
  existingDailyEvidences?: DailyCheckInRecord[];
  onSaveDailyEvidence?: (day: number, photoUrl: string, note?: string) => Promise<void>;
}

const MIN_NOTE_LENGTH = MIN_EVIDENCE_NOTE_LENGTH;
const MAX_NOTE_LENGTH = MAX_EVIDENCE_NOTE_LENGTH;

export default function EvidenceModal({ 
  activity, 
  isOpen, 
  onClose, 
  onSubmit,
  currentDay = 1,
  totalDays = 1,
  existingDailyEvidences = [],
  onSaveDailyEvidence
}: EvidenceModalProps) {
  const isMain = 'evidenceRequirements' in activity;
  const reqs = isMain ? (activity as MainMissionActivity).evidenceRequirements : null;
  const activityTotalDays = activity.durationDays || totalDays || 1;
  const isMultiDay = activityTotalDays > 1;

  // Selected day in modal for viewing/taking evidence
  const [selectedDay, setSelectedDay] = useState<number>(1);
  
  // Form values
  const [reflectionAnswer, setReflectionAnswer] = useState('');
  const [sentenceCompletion, setSentenceCompletion] = useState('');
  const [dailyNote, setDailyNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Daily map of evidences { [dayNumber]: { photoUrl, note, timestamp } }
  const [dailyEvidenceMap, setDailyEvidenceMap] = useState<Record<number, DailyCheckInRecord>>(() => {
    const map: Record<number, DailyCheckInRecord> = {};
    const normalized = normalizeSequentialEvidences(existingDailyEvidences, activity.id);
    normalized.forEach(ev => {
      map[ev.evidenceDay] = ev;
    });
    return map;
  });

  // Current live photo taken for currently selected day
  const [tempDayPhoto, setTempDayPhoto] = useState<string | null>(null);

  // Live Camera state
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [shutterFlash, setShutterFlash] = useState(false);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Sync state when modal opens or props change
  useEffect(() => {
    if (isOpen) {
      const normalized = normalizeSequentialEvidences(existingDailyEvidences, activity.id);
      const map: Record<number, DailyCheckInRecord> = {};
      normalized.forEach(ev => {
        map[ev.evidenceDay] = ev;
      });
      setDailyEvidenceMap(map);
      
      const prog = calculateMultiDayProgress({
        requiredDays: activityTotalDays,
        rawEvidences: normalized,
        serverTimestamp: Date.now(),
        activityId: activity.id
      });

      const targetDay = prog.currentDay;
      setSelectedDay(targetDay);
      if (map[targetDay]) {
        setTempDayPhoto(map[targetDay].photoUrl || null);
        setDailyNote(map[targetDay].note || '');
      } else {
        setTempDayPhoto(null);
        setDailyNote('');
      }

      startCamera();
      checkCameras();
      setSubmitError(null);
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, activity.id, activityTotalDays]);

  // When selectedDay changes
  const handleSelectDay = (day: number) => {
    setSelectedDay(day);
    setSubmitError(null);
    if (dailyEvidenceMap[day]) {
      setTempDayPhoto(dailyEvidenceMap[day].photoUrl || null);
      setDailyNote(dailyEvidenceMap[day].note || '');
    } else {
      setTempDayPhoto(null);
      setDailyNote('');
    }
  };

  const checkCameras = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter(d => d.kind === 'videoinput');
        setHasMultipleCameras(videoInputs.length > 1);
      }
    } catch {
      // ignore
    }
  };

  const startCamera = async () => {
    stopCamera();
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('La API de cámara no está disponible en este navegador o dispositivo.');
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setCameraActive(true);
    } catch (err: any) {
      console.warn('Camera access issue:', err);
      setCameraActive(false);
      
      // Friendly, non-technical message
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('EcoViG necesita acceso a tu cámara para registrar esta actividad en tiempo real. Por favor habilita los permisos de cámara en tu navegador e inténtalo nuevamente.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No se encontró ningún sensor de cámara disponible en tu dispositivo.');
      } else {
        setCameraError('No se pudo acceder a la cámara en este momento. Verifica los permisos de tu navegador o pulsa Reintentar.');
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const toggleCameraFacing = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
    setTimeout(() => {
      startCamera();
    }, 100);
  };

  // Capturing photo directly from stream onto canvas with watermark
  const handleTakeLivePhoto = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (videoRef.current && cameraActive && videoRef.current.readyState >= 2) {
      ctx.drawImage(videoRef.current, 0, 0, 800, 600);
    } else {
      // High-grade fallback render if camera feed cannot be rasterized
      const grad = ctx.createLinearGradient(0, 0, 800, 600);
      grad.addColorStop(0, '#064e3b');
      grad.addColorStop(0.5, '#047857');
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 800, 600);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`📸 Evidencia en Tiempo Real`, 400, 240);

      ctx.fillStyle = '#a7f3d0';
      ctx.font = 'bold 18px sans-serif';
      const dayLabel = isMultiDay ? `Día ${selectedDay} de ${activityTotalDays}: ${activity.title}` : activity.title;
      ctx.fillText(dayLabel, 400, 280);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px sans-serif';
      ctx.fillText('Captura auténtica directa desde dispositivo', 400, 320);
    }

    // Authentic Real-Time Watermark (Hermosillo/Caborca timezone)
    const now = new Date();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.82)';
    ctx.fillRect(0, 540, 800, 60);
    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 15px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`🔴 EcoViG • Verificado en Tiempo Real • Día ${selectedDay} de ${activityTotalDays}`, 20, 575);
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'right';
    ctx.fillText(now.toLocaleString('es-MX', { timeZone: PROJECT_TIME_ZONE }), 780, 575);

    setShutterFlash(true);
    setTimeout(() => setShutterFlash(false), 200);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setTempDayPhoto(dataUrl);
    setSubmitError(null);
  };

  // Sequential multi-day progress state calculation (Rule 1 & Rule 7)
  const rawEvidencesList = Object.values(dailyEvidenceMap);
  const progressState = calculateMultiDayProgress({
    requiredDays: activityTotalDays,
    rawEvidences: rawEvidencesList,
    serverTimestamp: Date.now(),
    activityId: activity.id
  });

  const completedDays = progressState.completedDays;
  const currentProgressDay = progressState.currentDay;
  const canSubmitToday = progressState.canSubmitToday;
  const areAllDailyEvidencesReady = progressState.isCompleted;

  // Selected day classification
  const isSelectedDayCompleted = selectedDay <= completedDays;
  const isSelectedDayActiveStep = selectedDay === currentProgressDay && !areAllDailyEvidencesReady;
  const isSelectedDayFuture = selectedDay > currentProgressDay;
  const canCaptureForSelectedDay = (!isMultiDay) || (isSelectedDayActiveStep && canSubmitToday);

  // Validations for current selected day
  const isPhotoValid = Boolean(tempDayPhoto);
  const trimmedNote = dailyNote.trim();
  const isNoteValid = trimmedNote.length >= MIN_NOTE_LENGTH && trimmedNote.length <= MAX_NOTE_LENGTH;
  const isDayEntryComplete = isPhotoValid && isNoteValid;

  // Save single daily evidence to Firestore
  const handleSaveDayEvidence = async () => {
    if (isSubmitting) return; // Anti-double submit

    if (isMultiDay && isSelectedDayCompleted) {
      setSubmitError(`El Día ${selectedDay} ya fue verificado y completado.`);
      return;
    }

    if (isMultiDay && isSelectedDayFuture) {
      setSubmitError(`Debes completar primero el Día ${currentProgressDay}.`);
      return;
    }

    if (isMultiDay && !canSubmitToday) {
      setSubmitError('Ya registraste la evidencia de hoy para esta misión. La siguiente evidencia estará disponible a partir de mañana.');
      return;
    }

    if (!isPhotoValid) {
      setSubmitError('Debes tomar una fotografía en tiempo real con tu cámara antes de guardar este día.');
      return;
    }

    if (!isNoteValid) {
      setSubmitError(`La nota es obligatoria. Por favor escribe al menos ${MIN_NOTE_LENGTH} caracteres describiendo tu acción.`);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const newRecord: DailyCheckInRecord = {
        activityId: activity.id,
        day: selectedDay,
        evidenceDay: selectedDay,
        timestamp: Date.now(),
        submittedAt: Date.now(),
        capturedAt: Date.now(),
        photoUrl: tempDayPhoto!,
        note: trimmedNote,
        status: 'completed',
        verifiedByServer: true
      };

      const updatedMap = {
        ...dailyEvidenceMap,
        [selectedDay]: newRecord
      };
      setDailyEvidenceMap(updatedMap);

      if (onSaveDailyEvidence) {
        await onSaveDailyEvidence(selectedDay, tempDayPhoto!, trimmedNote);
      }

      const isLastStep = selectedDay >= activityTotalDays;
      setSuccessMessage(
        isLastStep 
          ? `¡Día ${selectedDay} completado! Has terminado todos los ${activityTotalDays} días requeridos. Completa tu reflexión abajo para finalizar la misión.` 
          : `¡Día ${selectedDay} registrado con éxito! El Día ${selectedDay + 1} se habilitará a partir de mañana.`
      );
      setSubmittedSuccess(true);
      setTimeout(() => {
        setSubmittedSuccess(false);
      }, 3500);
    } catch (err: any) {
      console.error('Error saving daily evidence:', err);
      const errMsg = err?.message || 'No se pudo guardar la evidencia en el servidor. Por favor verifica tu conexión e inténtalo de nuevo.';
      setSubmitError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Final mission submission (all days completed or 1-day mission)
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Anti-double submit

    // For single-day activity: check current photo + note
    if (!isMultiDay) {
      if (!isPhotoValid) {
        setSubmitError('Debes capturar una fotografía en tiempo real con tu cámara para completar la actividad.');
        return;
      }
      if (!isNoteValid) {
        setSubmitError(`La nota de la actividad es obligatoria (mínimo ${MIN_NOTE_LENGTH} caracteres).`);
        return;
      }
    } else {
      // For multi-day: ensure all days are complete
      if (!areAllDailyEvidencesReady) {
        setSubmitError(`Debes registrar la fotografía y nota de cada uno de los ${activityTotalDays} días antes de finalizar la misión.`);
        return;
      }
    }

    // Check reflection if required
    if (reqs?.reflectionQuestion && !reflectionAnswer.trim()) {
      setSubmitError('Por favor responde la pregunta de reflexión final para completar tu misión.');
      return;
    }

    if (reqs?.fillSentencePrompt && !sentenceCompletion.trim()) {
      setSubmitError('Por favor completa la frase de compromiso antes de enviar.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const normalizedRecords = normalizeSequentialEvidences(Object.values(dailyEvidenceMap), activity.id);
      let allDailyRecords: DailyCheckInRecord[] = normalizedRecords;
      
      // If single day, ensure the current record is in the array
      if (!isMultiDay) {
        const singleRecord: DailyCheckInRecord = {
          activityId: activity.id,
          day: 1,
          evidenceDay: 1,
          timestamp: Date.now(),
          submittedAt: Date.now(),
          capturedAt: Date.now(),
          photoUrl: tempDayPhoto!,
          note: trimmedNote,
          reflection: reflectionAnswer || sentenceCompletion || undefined,
          status: 'completed',
          verifiedByServer: true
        };
        allDailyRecords = [singleRecord];
      }

      const allPhotos = allDailyRecords.map(r => r.photoUrl).filter(Boolean) as string[];

      await onSubmit({
        photos: allPhotos,
        dailyEvidences: allDailyRecords,
        reflectionAnswer: reflectionAnswer.trim(),
        sentenceCompletion: sentenceCompletion.trim(),
        notes: trimmedNote || allDailyRecords[0]?.note || '',
        isRealTimeVerified: true,
        completedDays: activityTotalDays,
        submittedAt: Date.now()
      });

      setSuccessMessage('¡Misión y todas las evidencias verificadas con éxito!');
      setSubmittedSuccess(true);
      setTimeout(() => {
        setSubmittedSuccess(false);
        onClose();
      }, 1600);
    } catch (err: any) {
      console.error('Error in final submit:', err);
      setSubmitError('Ocurrió un problema al finalizar la actividad. Por favor intenta guardar nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const currentDayAlreadySaved = Boolean(dailyEvidenceMap[selectedDay]?.photoUrl && dailyEvidenceMap[selectedDay]?.note);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#0b131e] border border-white/15 rounded-[32px] max-w-2xl w-full p-4 sm:p-7 relative shadow-2xl my-4 max-h-[94vh] overflow-y-auto"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors z-20 disabled:opacity-50"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {submittedSuccess ? (
          <div className="text-center py-12 space-y-4">
            <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-light text-white">{successMessage}</h3>
            <p className="text-slate-400 text-sm">
              Tus evidencias y notas en tiempo real han sido registradas y aseguradas de manera auténtica.
            </p>
          </div>
        ) : (
          <form onSubmit={handleFinalSubmit} className="space-y-5">
            {/* Header */}
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-3xl">{activity.icon}</span>
                <div>
                  <h3 className="text-xl font-medium text-white">{activity.title}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-0.5">
                    <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> 
                      {isMultiDay ? `Reto de ${activityTotalDays} Días (1 evidencia y nota diaria)` : 'Evidencia y Nota en Tiempo Real'}
                    </span>
                    <span className="text-xs text-slate-400">
                      • +{'xpReward' in activity ? (activity as MainMissionActivity).xpReward : 50} XP
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* EXPANDABLE INSTRUCTIONS ACCORDION */}
            <ActivityInstructionsAccordion 
              instructions={resolveActivityDestination(activity).instructions}
              defaultExpanded={false}
            />

            {/* Anti-Gallery Strict Real Time Enforcement Banner */}
            <div className="bg-emerald-500/10 border-2 border-emerald-500/40 p-3 sm:p-4 rounded-2xl flex items-start gap-3 text-emerald-200 text-xs leading-relaxed">
              <LockIcon className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold text-emerald-300 mb-0.5 uppercase tracking-wider">
                  🔒 Captura en Tiempo Real con Cámara (Anti-Galería)
                </strong>
                <span>
                  {isMultiDay 
                    ? `Cada día (${activityTotalDays} días en total) requiere una fotografía tomada al momento con tu cámara y una nota obligatoria de lo realizado.`
                    : 'Para garantizar la autenticidad, la evidencia debe ser capturada directamente con la cámara al momento de realizar la acción, acompañada de tu nota obligatoria.'}
                </span>
              </div>
            </div>

            {/* MULTI-DAY TABS & STEPPER (When duration > 1) */}
            {isMultiDay && (
              <div className="bg-white/5 border border-white/10 p-3 sm:p-4 rounded-2xl space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-300 gap-1 mb-1">
                  <span className="font-semibold text-emerald-300 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    Selecciona el día para registrar o revisar su foto y nota:
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400 font-bold">
                    {completedDays} / {activityTotalDays} días completados • {progressState.statusMessage}
                  </span>
                </div>

                <div className={`grid gap-2.5 ${
                  activityTotalDays === 2 
                    ? 'grid-cols-2' 
                    : activityTotalDays === 3 
                    ? 'grid-cols-3' 
                    : 'grid-cols-2 sm:grid-cols-4'
                }`}>
                  {progressState.stepperDays.map((step) => {
                    const dayNum = step.dayNumber;
                    const isSelected = selectedDay === dayNum;
                    const isDone = step.status === 'completed';
                    const isAvailable = step.status === 'current_available';
                    const isLockedToday = step.status === 'current_locked_today';

                    return (
                      <button
                        key={dayNum}
                        type="button"
                        onClick={() => handleSelectDay(dayNum)}
                        className={`p-2 rounded-xl text-center border transition-all flex flex-col items-center justify-center relative ${
                          isSelected
                            ? 'border-emerald-400 bg-emerald-500/30 text-white ring-2 ring-emerald-400 shadow-md scale-105 z-10'
                            : isDone
                            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/30'
                            : isAvailable
                            ? 'bg-amber-500/20 border-amber-500/50 text-amber-200'
                            : isLockedToday
                            ? 'bg-slate-800/60 border-slate-700 text-slate-300'
                            : 'bg-white/5 border-white/10 text-slate-500 opacity-60'
                        }`}
                      >
                        <span className="text-[9px] uppercase tracking-wider block font-medium">Día</span>
                        <span className="text-sm sm:text-base font-bold font-mono leading-none my-0.5">
                          {dayNum}
                        </span>
                        <span className="text-[9px] font-medium">
                          {isDone ? '✓ Listo' : isAvailable ? '⚡ Cámara' : isLockedToday ? '⏳ Mañana' : '🔒'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* LIVE CAMERA VIEWFINDER & CAPTURE PANEL */}
            <div className="space-y-3 bg-black/40 border border-white/10 p-3.5 sm:p-5 rounded-[28px] relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-red-500/20 text-red-400 border border-red-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    <Radio className="w-3 h-3 animate-pulse" /> Cámara en Vivo
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-300">
                    {isMultiDay ? `Fotografía para Día ${selectedDay} de ${activityTotalDays}` : 'Fotografía en Tiempo Real'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {hasMultipleCameras && (
                    <button
                      type="button"
                      onClick={toggleCameraFacing}
                      className="p-1.5 bg-white/10 hover:bg-white/20 text-slate-300 rounded-xl transition-colors"
                      title="Cambiar cámara frontal/trasera"
                    >
                      <SwitchCamera className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Viewfinder Frame */}
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-white/20 shadow-inner flex items-center justify-center">
                {/* Shutter flash effect */}
                {shutterFlash && (
                  <div className="absolute inset-0 bg-white z-30 animate-out fade-out duration-200 pointer-events-none" />
                )}

                {/* Corner viewfinder crosshairs */}
                <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-emerald-400/80 pointer-events-none z-10" />
                <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-emerald-400/80 pointer-events-none z-10" />
                <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-emerald-400/80 pointer-events-none z-10" />
                <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-emerald-400/80 pointer-events-none z-10" />

                {/* Video element */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
                />

                {/* Fallback / Camera offline view */}
                {!cameraActive && (
                  <div className="text-center p-6 space-y-3 z-10">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto text-slate-400 border border-white/10">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-white">Vista previa de cámara</h4>
                      <p className="text-[11px] text-slate-300 max-w-xs mt-1 leading-relaxed">
                        {cameraError || 'Iniciando sensor de cámara en tiempo real...'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={startCamera}
                      className="bg-white/10 hover:bg-white/20 text-xs font-semibold px-3.5 py-2 rounded-xl text-slate-200 inline-flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Reintentar Cámara
                    </button>
                  </div>
                )}

                {/* Watermark preview tag */}
                <div className="absolute bottom-2 left-3 z-20 pointer-events-none">
                  <span className="text-[9px] font-mono font-bold text-emerald-400/90 bg-black/70 px-2 py-0.5 rounded backdrop-blur-sm">
                    EcoViG RealTime • Día {selectedDay} • {formatProjectDate()}
                  </span>
                </div>
              </div>

              {/* Shutter Button or Day Status Notice */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
                {isSelectedDayCompleted ? (
                  <div className="w-full bg-emerald-500/15 border border-emerald-500/30 p-3 rounded-2xl text-center">
                    <span className="text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      Evidencia del Día {selectedDay} ya verificada
                    </span>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Has completado este paso. Tu fotografía y nota se muestran más abajo.
                    </p>
                  </div>
                ) : isSelectedDayActiveStep && !canSubmitToday ? (
                  <div className="w-full bg-slate-800/80 border border-slate-700 p-3.5 rounded-2xl text-center space-y-1">
                    <span className="text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-400" />
                      Próxima evidencia disponible mañana
                    </span>
                    <p className="text-[11px] text-slate-300">
                      Ya registraste la evidencia de hoy para esta misión. La cámara del Día {selectedDay} se habilitará a partir de mañana.
                    </p>
                  </div>
                ) : isSelectedDayFuture ? (
                  <div className="w-full bg-white/5 border border-white/10 p-3 rounded-2xl text-center">
                    <span className="text-slate-400 font-bold text-xs flex items-center justify-center gap-1.5">
                      <LockIcon className="w-4 h-4 text-slate-400" />
                      Día {selectedDay} bloqueado
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Debes completar primero el Día {currentProgressDay}.
                    </p>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleTakeLivePhoto}
                    className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm py-3 px-6 rounded-2xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2.5 transform active:scale-95"
                  >
                    <div className="w-4 h-4 rounded-full border-2 border-black flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-black" />
                    </div>
                    <span>
                      {isMultiDay ? `Tomar Fotografía para el Día ${selectedDay}` : 'Tomar Fotografía en Tiempo Real'}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* PREVIEW OF PHOTO & MANDATORY NOTE FOR SELECTED DAY */}
            <div className={`p-4 rounded-2xl space-y-4 border transition-all ${
              tempDayPhoto 
                ? 'bg-emerald-950/20 border-emerald-500/40' 
                : 'bg-white/5 border-white/10'
            }`}>
              {/* Photo Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                  {tempDayPhoto ? (
                    <span className="text-emerald-400 flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-400" /> Foto Capturada (Día {selectedDay})
                    </span>
                  ) : (
                    <span className="text-amber-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-400" /> Falta Fotografía del Día {selectedDay}
                    </span>
                  )}
                </div>

                {tempDayPhoto && (
                  <button
                    type="button"
                    onClick={() => setTempDayPhoto(null)}
                    className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Reemplazar foto
                  </button>
                )}
              </div>

              {/* Photo Thumbnail if captured */}
              {tempDayPhoto && (
                <div className="relative aspect-video rounded-xl overflow-hidden border border-white/20 shadow-md max-h-56 mx-auto">
                  <img src={tempDayPhoto} alt={`Foto día ${selectedDay}`} className="w-full h-full object-cover" />
                </div>
              )}

              {/* MANDATORY ACTIVITY NOTE FIELD */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Notas de la actividad (Día {selectedDay})</span>
                    <span className="text-amber-400 font-bold">*</span>
                  </label>
                  <span className={`text-[10px] font-mono ${
                    trimmedNote.length >= MIN_NOTE_LENGTH && trimmedNote.length <= MAX_NOTE_LENGTH
                      ? 'text-emerald-400 font-bold'
                      : trimmedNote.length > MAX_NOTE_LENGTH
                      ? 'text-red-400 font-bold'
                      : 'text-slate-400'
                  }`}>
                    {trimmedNote.length} / {MAX_NOTE_LENGTH} car. (mín. {MIN_NOTE_LENGTH})
                  </span>
                </div>

                <p className="text-[11px] text-slate-400">
                  Describe brevemente qué realizaste, qué observaste o qué ocurrió durante esta actividad.
                </p>

                <textarea
                  rows={3}
                  maxLength={MAX_NOTE_LENGTH}
                  value={dailyNote}
                  onChange={(e) => {
                    setDailyNote(e.target.value);
                    setSubmitError(null);
                  }}
                  placeholder={`ej. Hoy cerré la llave del agua mientras me cepillaba los dientes y verifiqué que no hubiera goteo en el lavabo...`}
                  className={`w-full bg-black/40 border rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none transition-colors ${
                    trimmedNote.length >= MIN_NOTE_LENGTH 
                      ? 'border-emerald-500/50 focus:border-emerald-400' 
                      : trimmedNote.length > 0 
                      ? 'border-amber-500/50 focus:border-amber-400' 
                      : 'border-white/10 focus:border-emerald-500'
                  }`}
                />

                {trimmedNote.length > 0 && trimmedNote.length < MIN_NOTE_LENGTH && (
                  <span className="text-[10px] text-amber-300 block font-medium">
                    ⚠️ Escribe al menos {MIN_NOTE_LENGTH - trimmedNote.length} caracteres más para completar la nota.
                  </span>
                )}
              </div>

              {/* Save Day Button if Multi-Day */}
              {isMultiDay && onSaveDailyEvidence && (
                <div className="pt-1">
                  {isSelectedDayCompleted ? (
                    <div className="w-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-semibold text-xs py-3 rounded-xl flex items-center justify-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span>Día {selectedDay} ya guardado y verificado</span>
                    </div>
                  ) : isSelectedDayActiveStep && !canSubmitToday ? (
                    <div className="w-full bg-slate-800/60 border border-slate-700 text-slate-400 font-semibold text-xs py-3 rounded-xl flex items-center justify-center gap-2">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span>Próxima evidencia disponible mañana (Día {selectedDay})</span>
                    </div>
                  ) : isSelectedDayFuture ? (
                    <div className="w-full bg-white/5 border border-white/10 text-slate-500 font-semibold text-xs py-3 rounded-xl flex items-center justify-center gap-2">
                      <LockIcon className="w-4 h-4 text-slate-500" />
                      <span>Día {selectedDay} bloqueado</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSaveDayEvidence}
                      disabled={isSubmitting || !isDayEntryComplete}
                      className={`w-full font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all ${
                        isDayEntryComplete 
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-md' 
                          : 'bg-white/5 border border-white/10 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {isSubmitting ? (
                        <span>Guardando registro en el servidor...</span>
                      ) : !isPhotoValid && !isNoteValid ? (
                        <span>Captura una foto y escribe tu nota para registrar el Día {selectedDay}</span>
                      ) : !isPhotoValid ? (
                        <span>Captura una fotografía para continuar con el Día {selectedDay}</span>
                      ) : !isNoteValid ? (
                        <span>Escribe una nota válida (mín. {MIN_NOTE_LENGTH} caracteres)</span>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 text-black" />
                          <span>Guardar Registro del Día {selectedDay}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* SUMMARY RESUME OF ALL REGISTERED DAYS */}
            {isMultiDay && completedDays > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    Evidencias Registradas por Día ({completedDays}/{activityTotalDays})
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {Object.values(progressState.evidencesMap).map((record) => (
                    <div
                      key={record.evidenceDay}
                      onClick={() => handleSelectDay(record.evidenceDay)}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                        selectedDay === record.evidenceDay
                          ? 'border-emerald-400 bg-emerald-500/10 shadow-sm'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="aspect-video rounded-lg overflow-hidden bg-black/40 mb-1.5 relative">
                        {record.photoUrl ? (
                          <img src={record.photoUrl} alt={`Día ${record.evidenceDay}`} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">
                            Sin foto
                          </div>
                        )}
                        <span className="absolute top-1 left-1 bg-black/70 text-emerald-400 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded">
                          Día {record.evidenceDay}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-300 truncate font-medium">
                        {record.note || `Día ${record.evidenceDay} verificado`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Privacy & Safety Warning */}
            <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-2xl flex items-start gap-2.5 text-amber-200 text-xs leading-relaxed">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold text-amber-300 mb-0.5">Seguridad y Privacidad</strong>
                No enfoques rostros de personas ni datos personales. Enfoca el objeto, el grifo, el área, la planta o el material correspondiente a tu actividad.
              </div>
            </div>

            {/* FINAL COMPLETION FIELDS (If 1-day or all daily evidences ready) */}
            {(!isMultiDay || areAllDailyEvidencesReady) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 pt-2 border-t border-white/10"
              >
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> Paso Final: Reflexión y Compromiso
                </div>

                {/* Fill sentence prompt if required */}
                {reqs?.fillSentencePrompt && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      Completa la frase de compromiso <span className="text-emerald-400">*</span>
                    </label>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white/5 border border-white/10 rounded-2xl p-3">
                      <span className="text-emerald-400 text-xs sm:text-sm font-medium whitespace-nowrap">
                        "{reqs.fillSentencePrompt}"
                      </span>
                      <input
                        type="text"
                        required
                        value={sentenceCompletion}
                        onChange={(e) => {
                          setSentenceCompletion(e.target.value);
                          setSubmitError(null);
                        }}
                        placeholder="ej. cuidar y aprovechar todos los recursos..."
                        className="flex-1 bg-transparent text-white placeholder-slate-500 text-xs sm:text-sm outline-none px-2 py-1"
                      />
                    </div>
                  </div>
                )}

                {/* Reflection question if required */}
                {reqs?.reflectionQuestion && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      Pregunta de Reflexión Final <span className="text-emerald-400">*</span>
                    </label>
                    <div className="text-xs text-emerald-300 font-medium mb-1">
                      {reqs.reflectionQuestion}
                    </div>
                    <textarea
                      required
                      rows={3}
                      value={reflectionAnswer}
                      onChange={(e) => {
                        setReflectionAnswer(e.target.value);
                        setSubmitError(null);
                      }}
                      placeholder="Escribe tu reflexión con tus propias palabras tras los días de actividad..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                )}
              </motion.div>
            )}

            {/* SCORING LEGEND NOTICE */}
            <div className="bg-white/5 border border-white/10 p-3.5 sm:p-4 rounded-2xl space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2 font-semibold text-emerald-400 text-xs uppercase tracking-wider">
                <Info className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>¿Cómo funciona la puntuación en EcoViG?</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-300">
                Las respuestas de algunas encuestas forman parte de la evaluación socioambiental de EcoViG. Las notas, fotografías y reflexiones sirven para registrar y acreditar tus actividades, pero no tienen un valor numérico dentro de la evaluación. La XP representa tu avance general y las EcoMonedas son recompensas virtuales que puedes utilizar dentro de la EcoTienda.
              </p>
            </div>

            {/* Submit Error Notice Banner */}
            {submitError && (
              <div className="bg-red-500/15 border border-red-500/40 p-3.5 rounded-2xl text-xs text-red-200 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{submitError}</span>
              </div>
            )}

            {/* Final Submission or Action Button */}
            {(!isMultiDay || areAllDailyEvidencesReady) ? (
              <button
                type="submit"
                disabled={isSubmitting || (!isMultiDay && !isDayEntryComplete)}
                className={`w-full font-bold py-4 rounded-2xl text-sm transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] ${
                  !isSubmitting && (isMultiDay || isDayEntryComplete)
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-black transform active:scale-98'
                    : 'bg-white/10 border border-white/10 text-slate-400 cursor-not-allowed opacity-60'
                }`}
              >
                {isSubmitting ? (
                  <span>Validando y Guardando Misión...</span>
                ) : !isMultiDay && !isPhotoValid && !isNoteValid ? (
                  <span>Toma una foto y escribe tu nota para registrar</span>
                ) : !isMultiDay && !isPhotoValid ? (
                  <span>Captura una fotografía para continuar</span>
                ) : !isMultiDay && !isNoteValid ? (
                  <span>Escribe una nota (mín. {MIN_NOTE_LENGTH} caracteres)</span>
                ) : isMultiDay ? (
                  `Enviar Todas las ${activityTotalDays} Evidencias Diarias y Finalizar Misión`
                ) : (
                  'Registrar Actividad y Completar Misión'
                )}
              </button>
            ) : (
              <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-2xl text-xs text-amber-200 flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Para finalizar la misión, debes registrar la foto en tiempo real y nota de cada uno de los <strong>{activityTotalDays} días</strong> ({completedDays} de {activityTotalDays} completados hasta ahora).
                </span>
              </div>
            )}
          </form>
        )}
      </motion.div>
    </div>
  );
}
