import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { 
  User as UserIcon, 
  Mail, 
  Shield, 
  School as SchoolIcon, 
  KeyRound, 
  LogOut, 
  CheckCircle2, 
  Compass, 
  Sparkles, 
  Coins, 
  Zap, 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight, 
  RotateCcw,
  Target,
  Award,
  Building2,
  Edit3,
  X,
  AlertCircle,
  Trash2,
  Clock,
  Check,
  AlertTriangle,
  FileText,
  GraduationCap,
  Lock as LockIcon
} from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { CATEGORIES_CONFIG, SurveyCategory, SURVEY_QUESTIONS } from '../../../data/surveyData';
import { fetchActiveSchools, assignUserSchool } from '../../../lib/schoolService';
import { 
  createAccountDeletionRequest, 
  fetchActiveDeletionRequest, 
  cancelAccountDeletionRequest 
} from '../../../lib/accountDeletionService';
import { School, AccountDeletionRequest } from '../../../types';
import { hasUserCompletedInitialSurvey, getInitialSurveyData } from '../../../lib/surveyService';

interface ProfileTabProps {
  onOpenLinkModal?: () => void;
}

export default function ProfileTab({ onOpenLinkModal }: ProfileTabProps) {
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();
  const [showSurveyDetails, setShowSurveyDetails] = useState(false);

  // School Selection Modal State
  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [activeSchools, setActiveSchools] = useState<School[]>([]);
  const [loadingSchools, setLoadingSchools] = useState(false);
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [savingSchool, setSavingSchool] = useState(false);
  const [schoolError, setSchoolError] = useState('');
  const [schoolSuccess, setSchoolSuccess] = useState('');

  // Account Deletion Request State
  const [deletionRequest, setDeletionRequest] = useState<AccountDeletionRequest | null>(null);
  const [loadingDeletion, setLoadingDeletion] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [deleteRequestType, setDeleteRequestType] = useState<'account_deletion' | 'academic_withdrawal'>('account_deletion');
  const [confirmCheckbox, setConfirmCheckbox] = useState(false);
  const [submittingDelete, setSubmittingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState('');
  const [cancellingDelete, setCancellingDelete] = useState(false);

  useEffect(() => {
    loadDeletionRequest();
  }, [user?.uid]);

  const loadDeletionRequest = async () => {
    if (!user) return;
    setLoadingDeletion(true);
    try {
      const req = await fetchActiveDeletionRequest();
      setDeletionRequest(req);
    } catch (err) {
      console.warn('Error fetching deletion request:', err);
    } finally {
      setLoadingDeletion(false);
    }
  };

  useEffect(() => {
    if (showSchoolModal) {
      loadActiveSchools();
    }
  }, [showSchoolModal]);

  const loadActiveSchools = async () => {
    setLoadingSchools(true);
    try {
      const list = await fetchActiveSchools();
      setActiveSchools(list);
      if (user?.schoolId) {
        setSelectedSchoolId(user.schoolId);
      }
    } catch (err) {
      console.error('Error loading schools:', err);
    } finally {
      setLoadingSchools(false);
    }
  };

  const handleSaveSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchoolId) {
      setSchoolError('Por favor selecciona una escuela del catálogo.');
      return;
    }

    setSavingSchool(true);
    setSchoolError('');
    setSchoolSuccess('');

    try {
      await assignUserSchool(selectedSchoolId);
      setSchoolSuccess('Escuela vinculada exitosamente a tu cuenta.');
      await refreshUser();
      setTimeout(() => {
        setShowSchoolModal(false);
      }, 1200);
    } catch (err: any) {
      console.error('Error assigning school:', err);
      setSchoolError(err.message || 'Error al vincular la escuela.');
    } finally {
      setSavingSchool(false);
    }
  };

  const handleCreateDeletionRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmCheckbox) {
      setDeleteError('Debes confirmar que entiendes que estás solicitando la eliminación de tu cuenta.');
      return;
    }

    setSubmittingDelete(true);
    setDeleteError('');
    setDeleteSuccess('');

    try {
      const created = await createAccountDeletionRequest(deleteReason, deleteRequestType);
      setDeletionRequest(created);
      setDeleteSuccess(
        deleteRequestType === 'academic_withdrawal'
          ? 'Solicitud de baja académica enviada a tu docente.'
          : 'Solicitud de eliminación de cuenta y datos personales enviada para trámite administrativo.'
      );
      setTimeout(() => {
        setShowDeleteModal(false);
        setDeleteReason('');
        setConfirmCheckbox(false);
      }, 1200);
    } catch (err: any) {
      console.error('Error submitting deletion request:', err);
      setDeleteError(err.message || 'Error al enviar la solicitud.');
    } finally {
      setSubmittingDelete(false);
    }
  };

  const handleCancelDeletion = async () => {
    setCancellingDelete(true);
    try {
      const updated = await cancelAccountDeletionRequest();
      setDeletionRequest(updated);
      await refreshUser();
    } catch (err: any) {
      console.error('Error cancelling deletion request:', err);
      alert('Error: ' + (err.message || 'No se pudo cancelar la solicitud.'));
    } finally {
      setCancellingDelete(false);
    }
  };

  if (!user) return null;

  const isSchoolChangeRestricted = Boolean(user.teacherId && user.schoolId);

  const survey = getInitialSurveyData(user);
  const hasTakenSurvey = hasUserCompletedInitialSurvey(user);

  const formattedDate = survey?.completedAt 
    ? new Date(survey.completedAt).toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : null;

  const categories: SurveyCategory[] = ['Conducta Pro-Ambiental', 'Austeridad', 'Altruismo', 'Equidad'];

  return (
    <div className="space-y-6 pb-12 font-sans max-w-3xl">
      <header>
        <h1 className="text-3xl md:text-4xl font-light text-white mb-1">Cuenta y Perfil</h1>
        <p className="text-emerald-400 font-medium text-sm">
          Información de tu cuenta, diagnóstico socioambiental y vinculación escolar.
        </p>
      </header>

      {/* Account Info Card */}
      <div className="bg-white/5 border border-white/10 p-6 sm:p-8 rounded-[32px] backdrop-blur-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-medium text-white">{user.name}</h2>
              <p className="text-xs text-slate-400">{user.email}</p>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30">
                  Estudiante • Nivel {user.level || 1}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold tracking-wider border border-amber-500/30 flex items-center gap-1">
                  <Coins className="w-3 h-3 text-amber-400" /> {user.coins || 0} EcoMonedas
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold tracking-wider border border-purple-500/30 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-purple-400" /> {user.xp || 0} XP
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/5 text-xs sm:text-sm">
            <span className="text-slate-400 flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-400" /> Correo electrónico
            </span>
            <span className="text-white font-medium">{user.email}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/5 text-xs sm:text-sm gap-2">
            <span className="text-slate-400 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-400" /> Escuela asignada
            </span>
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <span className="text-white font-medium">
                {user.schoolName || user.school || (user.schoolId ? `Escuela (${user.schoolId})` : 'Sin asignar')}
              </span>
              {isSchoolChangeRestricted ? (
                <div 
                  className="text-[11px] text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-1 cursor-help"
                  title="Para cambiar tu escuela debes solicitar la actualización a tu maestro o administrador escolar."
                >
                  <LockIcon className="w-3 h-3 text-amber-400" />
                  <span className="hidden sm:inline">Vinculada con maestro</span>
                </div>
              ) : (
                <button
                  onClick={() => setShowSchoolModal(true)}
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>{user.schoolId ? 'Cambiar' : 'Seleccionar'}</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/5 text-xs sm:text-sm">
            <span className="text-slate-400 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-emerald-400" /> Código escolar vinculado
            </span>
            {user.teacherId ? (
              <span className="text-emerald-400 font-mono font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Vinculado con profesor
              </span>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-mono text-xs">Sin vincular</span>
                {onOpenLinkModal && (
                  <button
                    onClick={onOpenLinkModal}
                    className="text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20"
                  >
                    Vincular código
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/5 text-xs sm:text-sm">
            <span className="text-slate-400 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" /> Estado de la cuenta
            </span>
            <span className="text-emerald-400 flex items-center gap-1 font-bold">
              <CheckCircle2 className="w-4 h-4" /> Activa
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================
          ENCUESTA / DIAGNÓSTICO REFLEJADO DIRECTAMENTE EN LA CUENTA
          ======================================================== */}
      <div className="bg-white/5 border border-white/10 p-6 sm:p-8 rounded-[32px] backdrop-blur-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-medium text-white">Diagnóstico Socioambiental</h3>
                {hasTakenSurvey ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Completado
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider border border-amber-500/30">
                    Pendiente
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Evaluación diagnóstica inicial sobre tus hábitos en las 4 dimensiones.
              </p>
            </div>
          </div>

          {!hasTakenSurvey ? (
            <Link
              to="/questionnaire"
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)] self-start sm:self-auto"
            >
              Comenzar Encuesta (21 preguntas) <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <Link
              to="/questionnaire"
              className="text-xs font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-2 rounded-xl border border-white/10 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-400" /> Actualizar Encuesta
            </Link>
          )}
        </div>

        {hasTakenSurvey && survey ? (
          <div className="space-y-5 pt-4 border-t border-white/10">
            {/* Meta Info Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white/5 border border-white/5 p-3.5 rounded-2xl">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Fecha de Realización</div>
                <div className="text-xs font-medium text-white mt-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" /> {formattedDate || 'Reciente'}
                </div>
              </div>

              <div className="bg-white/5 border border-white/5 p-3.5 rounded-2xl">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Puntuación Global</div>
                <div className="text-xs font-medium text-white mt-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> <span className="font-mono font-bold text-amber-300">{survey.totalScore || 0}</span> puntos acumulados
                </div>
              </div>

              <div className="bg-white/5 border border-white/5 p-3.5 rounded-2xl">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Recompensa Otorgada</div>
                <div className="text-xs font-medium text-emerald-300 mt-1 flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-amber-400" /> +500 EcoMonedas • +150 XP
                </div>
              </div>
            </div>

            {/* 4 Dimension Breakdown */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Puntaje por Dimensión Socioambiental
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {categories.map((catName) => {
                  const cfg = CATEGORIES_CONFIG[catName];
                  const score = survey.categoryScores?.[catName] || 0;
                  const maxPossible = cfg.maxScore || (catName === 'Altruismo' ? 2400 : 2000);
                  const pct = Math.min(100, Math.round((score / maxPossible) * 100));

                  return (
                    <div 
                      key={catName}
                      className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span>{cfg.icon}</span>
                          <span className="font-medium text-white">{catName}</span>
                        </div>
                        <span className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${cfg.bgLight} ${cfg.color}`}>
                          {score} pts ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-emerald-400 to-teal-400 h-1.5 rounded-full" 
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Accordion Toggle for Detailed Survey Answers */}
            <div className="pt-2">
              <button
                onClick={() => setShowSurveyDetails(!showSurveyDetails)}
                className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-slate-300 hover:text-white flex items-center justify-between transition-colors"
              >
                <span>Ver las 21 preguntas y tus respuestas seleccionadas</span>
                {showSurveyDetails ? <ChevronUp className="w-4 h-4 text-emerald-400" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showSurveyDetails && (
                <div className="mt-3 space-y-2.5 max-h-96 overflow-y-auto pr-1">
                  {SURVEY_QUESTIONS.map((q, idx) => {
                    const ans = survey.answers?.[q.id];
                    const selected = ans?.selectedOption || 'Sin responder';
                    const score = ans?.score ?? 0;

                    return (
                      <div key={q.id} className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-xs space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-slate-400 font-mono text-[10px]">#{idx + 1} • {q.category}</span>
                          <span className="font-mono text-emerald-400 font-bold shrink-0">+{score} pts</span>
                        </div>
                        <p className="text-white font-medium">"{q.text}"</p>
                        <div className="text-[11px] text-emerald-300 flex items-center gap-1.5 pt-0.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>Tu respuesta: <strong>{selected}</strong></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-slate-300 leading-relaxed space-y-2">
            <p>
              Tu diagnóstico socioambiental aún no ha sido respondido. Al responder las 21 preguntas diagnósticas, se desbloquearán inmediatamente tus misiones socioambientales, tu mundo vivo, la tienda y recibirás tus primeras <strong>500 EcoMonedas</strong>.
            </p>
            <div>
              <Link 
                to="/questionnaire" 
                className="inline-flex items-center gap-1.5 text-amber-300 font-bold hover:underline"
              >
                Comenzar diagnóstico ahora <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================
          ZONA DE CUENTA / GESTIÓN SEGURA
          ======================================================== */}
      <div className="bg-white/5 border border-white/10 p-6 sm:p-8 rounded-[32px] backdrop-blur-md space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-medium text-white">Gestión de Cuenta y Privacidad</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Opciones institucionales de resguardo de datos y solicitud de baja.
              </p>
            </div>
          </div>
        </div>

        {/* Informative Link to Public Deletion Page */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/5 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>¿Deseas conocer los detalles sobre qué datos se eliminan y cuáles se conservan?</span>
          </div>
          <a
            href="https://ecovig.net/eliminar-cuenta"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-2 shrink-0 ml-2"
          >
            Información sobre la eliminación de cuenta
          </a>
        </div>

        {/* Dynamic status display for deletion request */}
        {deletionRequest && (
          deletionRequest.status === 'pending' || 
          deletionRequest.status === 'approved' || 
          deletionRequest.status === 'processing' ||
          deletionRequest.status === 'verified' ||
          deletionRequest.status === 'requires_admin_review'
        ) ? (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400 animate-pulse" />
                <span className="font-bold text-white text-sm">
                  {deletionRequest.type === 'academic_withdrawal'
                    ? 'Solicitud de baja académica en revisión'
                    : deletionRequest.status === 'verified'
                    ? 'Solicitud de eliminación de cuenta con identidad verificada'
                    : deletionRequest.status === 'approved'
                    ? 'Solicitud validada por docente — en cola de ejecución'
                    : deletionRequest.status === 'requires_admin_review'
                    ? 'Solicitud en revisión administrativa central'
                    : 'Solicitud de eliminación de cuenta en trámite'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold uppercase tracking-wider border border-blue-500/30">
                  {deletionRequest.type === 'academic_withdrawal' ? 'Baja Académica' : 'Eliminación de Cuenta'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider border border-amber-500/30">
                  {deletionRequest.status === 'pending' ? 'En trámite' :
                   deletionRequest.status === 'verified' ? 'Verificada' :
                   deletionRequest.status === 'approved' ? 'Validada' :
                   deletionRequest.status === 'requires_admin_review' ? 'Revisión Admin' : 'Procesando'}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {deletionRequest.type === 'academic_withdrawal' ? (
                <>
                  Tu solicitud de baja de actividad escolar fue enviada el{' '}
                  <strong className="text-white">
                    {new Date(deletionRequest.createdAt).toLocaleDateString('es-MX', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </strong>
                  . Tu docente a cargo revisará tu situación académica para aprobar o rechazar la baja de grupo.
                </>
              ) : (
                <>
                  Tu solicitud formal de eliminación de cuenta y datos personales está registrada. Conforme a las políticas de privacidad, tu expediente será revisado para verificar identidad y proceder a la eliminación irreversible sin bloqueos arbitrarios.
                </>
              )}
            </p>

            {deletionRequest.trackingId && (
              <div className="text-[11px] text-slate-300 bg-white/5 p-2 rounded-xl border border-white/5 flex items-center justify-between">
                <span className="text-slate-400">Código de seguimiento:</span>
                <code className="font-mono text-cyan-300 font-bold">{deletionRequest.trackingId}</code>
              </div>
            )}

            {deletionRequest.reason && (
              <div className="text-[11px] text-slate-400 bg-black/30 p-2.5 rounded-xl border border-white/5">
                <span className="font-semibold text-slate-300">Motivo señalado:</span> "{deletionRequest.reason}"
              </div>
            )}

            {(deletionRequest.status === 'pending' || deletionRequest.status === 'verified') && (
              <div className="pt-1 flex justify-end">
                <button
                  onClick={handleCancelDeletion}
                  disabled={cancellingDelete}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white text-xs font-semibold transition-colors border border-white/10 disabled:opacity-50 flex items-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>{cancellingDelete ? 'Cancelando...' : 'Cancelar Solicitud'}</span>
                </button>
              </div>
            )}
          </div>
        ) : deletionRequest && deletionRequest.status === 'rejected' ? (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-300 text-xs font-bold">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span>
                  {deletionRequest.type === 'academic_withdrawal'
                    ? 'Solicitud de baja académica no aprobada'
                    : 'Solicitud con observaciones administrativas'}
                </span>
              </div>
              <span className="text-[10px] text-slate-500">
                {deletionRequest.reviewedAt ? new Date(deletionRequest.reviewedAt).toLocaleDateString('es-MX') : ''}
              </span>
            </div>
            {deletionRequest.reviewNote && (
              <p className="text-xs text-slate-300 bg-black/20 p-2.5 rounded-xl border border-white/5">
                <strong>Observaciones:</strong> "{deletionRequest.reviewNote}"
              </p>
            )}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-medium transition-colors"
              >
                Enviar nueva solicitud
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Option A: Baja académica */}
            <div className="p-4 rounded-2xl bg-black/20 border border-white/5 flex flex-col justify-between gap-3">
              <div className="space-y-1">
                <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-teal-400" />
                  <span>Baja académica</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Solicita desvincularte de la actividad o grupo escolar. Tu docente revisará y autorizará esta solicitud.
                </p>
              </div>

              <button
                onClick={() => {
                  setDeleteError('');
                  setDeleteSuccess('');
                  setDeleteReason('');
                  setDeleteRequestType('academic_withdrawal');
                  setConfirmCheckbox(false);
                  setShowDeleteModal(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/20 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Solicitar baja escolar</span>
              </button>
            </div>

            {/* Option B: Eliminación de cuenta y datos */}
            <div className="p-4 rounded-2xl bg-black/20 border border-white/5 flex flex-col justify-between gap-3">
              <div className="space-y-1">
                <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  <span>Eliminación de cuenta y datos</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Solicita el borrado permanente de tu cuenta en Firebase y todos tus datos personales asociados.
                </p>
              </div>

              <button
                onClick={() => {
                  setDeleteError('');
                  setDeleteSuccess('');
                  setDeleteReason('');
                  setDeleteRequestType('account_deletion');
                  setConfirmCheckbox(false);
                  setShowDeleteModal(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar mi cuenta</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Logout Card */}
      <div className="bg-white/5 border border-white/10 p-5 rounded-[24px] backdrop-blur-md">
        <button
          onClick={logout}
          className="w-full py-3.5 px-4 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors"
        >
          <LogOut className="w-4 h-4" /> Cerrar Sesión
        </button>
      </div>

      {/* REQUEST ACCOUNT DELETION / WITHDRAWAL MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0b131e] border border-white/15 p-6 sm:p-7 rounded-[32px] max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  deleteRequestType === 'academic_withdrawal'
                    ? 'bg-teal-500/20 text-teal-400'
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {deleteRequestType === 'academic_withdrawal' ? <GraduationCap className="w-5 h-5" /> : <Trash2 className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">
                    {deleteRequestType === 'academic_withdrawal' ? 'Baja de Actividad Escolar' : 'Eliminación de Cuenta y Datos'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {deleteRequestType === 'academic_withdrawal' ? 'Gestión académica con docente' : 'Supresión de cuenta y datos personales'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowDeleteModal(false)}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {deleteError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{deleteError}</span>
              </div>
            )}

            {deleteSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 p-3.5 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{deleteSuccess}</span>
              </div>
            )}

            {/* Type selector toggle in modal */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-black/40 border border-white/10 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setDeleteRequestType('account_deletion')}
                className={`py-2 px-2.5 rounded-lg font-medium transition-all ${
                  deleteRequestType === 'account_deletion'
                    ? 'bg-red-500 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Eliminación de Datos
              </button>
              <button
                type="button"
                onClick={() => setDeleteRequestType('academic_withdrawal')}
                className={`py-2 px-2.5 rounded-lg font-medium transition-all ${
                  deleteRequestType === 'academic_withdrawal'
                    ? 'bg-teal-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Baja Académica
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 text-xs text-slate-300 space-y-2 leading-relaxed">
              {deleteRequestType === 'academic_withdrawal' ? (
                <>
                  <p>
                    Esta solicitud notifica a tu profesor sobre tu intención de darte de baja de la actividad escolar.
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    Tu docente revisará tu desempeño y conservará la facultad de autorizar la baja académica de su grupo.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    Solicitas borrar de forma permanente tu usuario en Firebase Authentication, tu perfil, evidencias e historial de progreso.
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    El trámite es independiente de la baja académica y no puede ser bloqueado arbitrariamente.
                  </p>
                </>
              )}
            </div>

            <form onSubmit={handleCreateDeletionRequest} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Motivo de la solicitud (opcional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Explica brevemente la razón de tu solicitud..."
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-red-500 text-xs resize-none"
                />
              </div>

              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-black/30 border border-white/10 cursor-pointer select-none">
                <input
                  type="checkbox"
                  required
                  checked={confirmCheckbox}
                  onChange={(e) => setConfirmCheckbox(e.target.checked)}
                  className="mt-0.5 rounded border-white/20 bg-black/40 text-red-500 focus:ring-red-500 cursor-pointer"
                />
                <span className="text-xs text-slate-300 leading-snug">
                  {deleteRequestType === 'academic_withdrawal'
                    ? 'Confirmo que deseo solicitar mi baja académica del grupo escolar.'
                    : 'Entiendo que estoy solicitando formalmente la eliminación definitiva de mi cuenta y mis datos personales en EcoViG.'}
                </span>
              </label>

              <div className="flex justify-end gap-3 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingDelete || !confirmCheckbox}
                  className="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)] disabled:opacity-50"
                >
                  {submittingDelete ? 'Enviando...' : 'Enviar Solicitud'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SELECT / CHANGE OFFICIAL SCHOOL MODAL */}
      {showSchoolModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0b131e] border border-white/15 p-6 sm:p-7 rounded-[32px] max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">Seleccionar Escuela Oficial</h3>
                  <p className="text-[11px] text-slate-400">Vincula tu cuenta a una institución del catálogo</p>
                </div>
              </div>

              <button
                onClick={() => setShowSchoolModal(false)}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {schoolError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{schoolError}</span>
              </div>
            )}

            {schoolSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 p-3 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{schoolSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveSchool} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-2">
                  Institución Educativa Oficial *
                </label>
                {loadingSchools ? (
                  <div className="p-4 bg-black/40 rounded-xl text-slate-400 text-center">
                    Cargando escuelas disponibles...
                  </div>
                ) : (
                  <select
                    value={selectedSchoolId}
                    onChange={(e) => setSelectedSchoolId(e.target.value)}
                    required
                    className="w-full bg-[#070b10] border border-white/15 rounded-xl px-3.5 py-3 text-white focus:outline-none focus:border-emerald-500 text-xs sm:text-sm cursor-pointer"
                  >
                    <option value="" className="text-slate-500">Selecciona tu escuela...</option>
                    {activeSchools.map((sch) => (
                      <option key={sch.id} value={sch.id} className="bg-[#0b131e] text-white">
                        {sch.name} {sch.educationLevel ? `(${sch.educationLevel})` : ''} {sch.city ? `— ${sch.city}` : ''}
                      </option>
                    ))}
                  </select>
                )}
                <p className="text-[10px] text-slate-500 mt-1.5">
                  Esta selección asignará tu <code className="font-mono text-emerald-400">schoolId</code> oficial en la base de datos de EcoViG.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSchoolModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingSchool || !selectedSchoolId}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-black font-bold transition-all shadow-[0_0_15px_rgba(52,211,153,0.3)] disabled:opacity-50"
                >
                  {savingSchool ? 'Guardando...' : 'Confirmar Asignación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
