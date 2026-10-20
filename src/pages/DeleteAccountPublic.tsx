import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router';
import { 
  ShieldAlert, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Mail, 
  Clock, 
  Lock, 
  ArrowLeft, 
  Search, 
  FileText, 
  Database, 
  HelpCircle,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Info
} from 'lucide-react';
import { 
  submitPublicDeletionRequest, 
  verifyPublicDeletionToken, 
  queryPublicDeletionStatus 
} from '../lib/accountDeletionService';
import { SUPPORT_CONFIG } from '../config/legalConfig';

export default function DeleteAccountPublic() {
  const [searchParams] = useSearchParams();
  const tokenParam = searchParams.get('token');
  const trackingParam = searchParams.get('tracking');

  // Tab: 'request' | 'verify' | 'status'
  const [activeTab, setActiveTab] = useState<'request' | 'verify' | 'status'>('request');

  // Request form state
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestResult, setRequestResult] = useState<{
    success: boolean;
    message: string;
    trackingId?: string;
  } | null>(null);

  // Verification state (from token in URL or manual entry)
  const [verifyingToken, setVerifyingToken] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{
    success: boolean;
    message: string;
    trackingId?: string;
  } | null>(null);

  // Status check state
  const [trackingQuery, setTrackingQuery] = useState(trackingParam || '');
  const [queryingStatus, setQueryingStatus] = useState(false);
  const [statusResult, setStatusResult] = useState<{
    success: boolean;
    status?: string;
    statusLabel?: string;
    type?: string;
    createdAt?: number;
    message?: string;
  } | null>(null);
  const [statusError, setStatusError] = useState('');

  useEffect(() => {
    document.title = 'Solicitar eliminación de cuenta — EcoViG';
    window.scrollTo(0, 0);

    // If verification token is in URL query parameters, auto-trigger verification
    if (tokenParam) {
      setActiveTab('verify');
      handleVerifyTokenDirect(tokenParam, trackingParam || '');
    } else if (trackingParam) {
      setActiveTab('status');
      handleQueryStatusDirect(trackingParam);
    }
  }, [tokenParam, trackingParam]);

  const handleVerifyTokenDirect = async (token: string, tracking: string) => {
    setVerifyingToken(true);
    setVerifyResult(null);
    try {
      const res = await verifyPublicDeletionToken(token, tracking);
      setVerifyResult({
        success: true,
        message: res.message,
        trackingId: res.request?.trackingId || tracking,
      });
    } catch (err: any) {
      setVerifyResult({
        success: false,
        message: err.message || 'El enlace de confirmación es inválido o ha expirado.',
      });
    } finally {
      setVerifyingToken(false);
    }
  };

  const handleQueryStatusDirect = async (trackingCode: string) => {
    if (!trackingCode.trim()) return;
    setQueryingStatus(true);
    setStatusError('');
    setStatusResult(null);
    try {
      const res = await queryPublicDeletionStatus(trackingCode.trim());
      setStatusResult(res);
    } catch (err: any) {
      setStatusError(err.message || 'No se pudo consultar el estado.');
    } finally {
      setQueryingStatus(false);
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;

    setSubmittingRequest(true);
    setRequestResult(null);
    try {
      const res = await submitPublicDeletionRequest(email.trim(), reason.trim());
      setRequestResult(res);
      if (res.trackingId) {
        setTrackingQuery(res.trackingId);
      }
    } catch (err: any) {
      setRequestResult({
        success: false,
        message: err.message || 'Error al procesar la solicitud.',
      });
    } finally {
      setSubmittingRequest(false);
    }
  };

  const handleSearchStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleQueryStatusDirect(trackingQuery);
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full flex flex-col justify-between">
      <div>
        {/* Navigation Bar */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-emerald-400 transition-colors py-2 px-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Inicio</span>
          </Link>

          <Link
            to="/"
            className="flex items-center gap-2.5 group"
            title="EcoViG"
          >
            <div className="w-8 h-8 rounded-xl overflow-hidden shadow-[0_0_12px_rgba(52,211,153,0.3)] border border-emerald-500/30 flex items-center justify-center bg-black/40 group-hover:border-emerald-400 transition-colors">
              <img 
                src="/ecovig-logo.svg" 
                alt="EcoViG" 
                className="w-full h-full object-cover select-none pointer-events-none" 
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="font-bold tracking-tight text-sm hidden sm:inline"><span className="text-white">Eco</span><span className="text-emerald-400">ViG</span></span>
          </Link>

          <Link
            to="/policies"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors py-2 px-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Ver Políticas</span>
          </Link>
        </div>

        {/* Hero Header */}
        <header className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Trash2 className="w-4 h-4" />
            <span>Google Play Store — Procedimiento de Privacidad</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
            Solicitar eliminación de cuenta — EcoViG
          </h1>
          <p className="mt-3 text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
            Puedes solicitar la eliminación de tu cuenta de EcoViG y los datos personales asociados. Esta solicitud es independiente de los procedimientos de baja académica de tu institución educativa.
          </p>
        </header>

        {/* Action Tabs Bar */}
        <div className="grid grid-cols-3 gap-2 p-1.5 bg-black/40 border border-white/10 rounded-2xl mb-8 text-xs sm:text-sm">
          <button
            onClick={() => setActiveTab('request')}
            className={`py-2.5 px-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === 'request'
                ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Mail className="w-4 h-4 shrink-0" />
            <span>Solicitar Eliminación</span>
          </button>

          <button
            onClick={() => setActiveTab('status')}
            className={`py-2.5 px-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === 'status'
                ? 'bg-emerald-500 text-black font-bold shadow-[0_0_15px_rgba(52,211,153,0.4)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Search className="w-4 h-4 shrink-0" />
            <span>Consultar Estado</span>
          </button>

          <button
            onClick={() => setActiveTab('verify')}
            className={`py-2.5 px-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === 'verify'
                ? 'bg-teal-500 text-white shadow-[0_0_15px_rgba(20,184,166,0.4)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Confirmar Enlace</span>
          </button>
        </div>

        {/* TAB 1: FORMULARIO PÚBLICO DE SOLICITUD */}
        {activeTab === 'request' && (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-sm space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-red-400" />
                <span>Formulario Público de Solicitud de Eliminación</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Ingresa la dirección de correo electrónico vinculada a tu cuenta de EcoViG. Para proteger tu seguridad y evitar suplantaciones, te enviaremos un enlace de verificación de un solo uso.
              </p>
            </div>

            {requestResult && (
              <div className={`p-4 rounded-2xl border text-xs sm:text-sm flex items-start gap-3 ${
                requestResult.success 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' 
                  : 'bg-red-500/10 border-red-500/20 text-red-300'
              }`}>
                {requestResult.success ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1.5">
                  <div className="font-semibold">{requestResult.message}</div>
                  {requestResult.trackingId && (
                    <div className="pt-1 text-slate-300 text-xs">
                      Código de seguimiento generado: <code className="font-mono bg-black/40 px-2 py-0.5 rounded text-cyan-300 font-bold">{requestResult.trackingId}</code> (guárdalo para consultar el avance del trámite).
                    </div>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmitRequest} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Correo electrónico registrado en tu cuenta de EcoViG *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="ejemplo@estudiante.edu.mx"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-red-500 text-xs sm:text-sm"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  🔒 No revelamos a terceros si una dirección está registrada o no en la plataforma (protección contra enumeración).
                </p>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Motivo de la solicitud (opcional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Comentarios adicionales o motivo por el que solicitas la eliminación..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-red-500 text-xs sm:text-sm resize-none"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-black/30 border border-white/5 space-y-1.5 text-xs text-slate-400">
                <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  Garantías de seguridad del proceso:
                </div>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>No se solicita contraseña en este formulario.</li>
                  <li>La eliminación requiere la confirmación expresa del enlace enviado a tu correo.</li>
                  <li>El enlace de verificación expira automáticamente en 30 minutos.</li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={submittingRequest || !email.trim()}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submittingRequest ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Enviando enlace seguro...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    <span>Enviar Enlace de Verificación de Identidad</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: CONSULTAR ESTADO DE LA SOLICITUD */}
        {activeTab === 'status' && (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-sm space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Search className="w-5 h-5 text-emerald-400" />
                <span>Consultar Estado de Solicitud de Eliminación</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Ingresa tu código de seguimiento (por ejemplo, <code className="font-mono text-cyan-300">ECO-XXXXXX</code>) para verificar en qué fase del trámite se encuentra tu petición.
              </p>
            </div>

            <form onSubmit={handleSearchStatusSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Código de seguimiento (ej. ECO-7B8C9A)"
                  value={trackingQuery}
                  onChange={(e) => setTrackingQuery(e.target.value.toUpperCase())}
                  className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs sm:text-sm uppercase"
                />
              </div>

              <button
                type="submit"
                disabled={queryingStatus || !trackingQuery.trim()}
                className="py-3 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold transition-all text-xs sm:text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {queryingStatus ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>Consultar</span>
              </button>
            </form>

            {statusError && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs sm:text-sm flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{statusError}</span>
              </div>
            )}

            {statusResult && (
              <div className="p-5 rounded-2xl bg-black/30 border border-white/10 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div>
                    <span className="text-xs text-slate-400">Código consultado:</span>
                    <div className="text-base font-mono font-bold text-cyan-300">{trackingQuery}</div>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                    statusResult.status === 'completed'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : statusResult.status === 'verified' || statusResult.status === 'approved'
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                      : statusResult.status === 'pending_verification' || statusResult.status === 'pending'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : statusResult.status === 'requires_admin_review'
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                      : 'bg-slate-500/20 text-slate-300 border-slate-500/30'
                  }`}>
                    {statusResult.statusLabel || statusResult.status}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {statusResult.message}
                </p>

                {statusResult.createdAt && (
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Fecha de registro: {new Date(statusResult.createdAt).toLocaleString('es-MX')}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CONFIRMAR ENLACE DE VERIFICACIÓN */}
        {activeTab === 'verify' && (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-sm space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-teal-400" />
                <span>Confirmación de Enlace de Eliminación</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Validación criptográfica de enlace de un solo uso para verificar la identidad del solicitante.
              </p>
            </div>

            {verifyingToken ? (
              <div className="p-8 text-center text-slate-300 space-y-3">
                <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
                <div className="text-sm font-medium">Verificando token de identidad seguro...</div>
              </div>
            ) : verifyResult ? (
              <div className={`p-5 rounded-2xl border text-xs sm:text-sm space-y-3 ${
                verifyResult.success 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' 
                  : 'bg-red-500/10 border-red-500/20 text-red-300'
              }`}>
                <div className="flex items-center gap-2 font-bold text-base">
                  {verifyResult.success ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  <span>{verifyResult.success ? '¡Identidad Confirmada!' : 'Enlace Inválido o Expirado'}</span>
                </div>
                <p className="text-slate-200 leading-relaxed">{verifyResult.message}</p>
                {verifyResult.trackingId && (
                  <div className="pt-2">
                    <span className="text-slate-400 text-xs">Código de seguimiento: </span>
                    <code className="font-mono text-cyan-300 font-bold bg-black/40 px-2 py-0.5 rounded">{verifyResult.trackingId}</code>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-black/30 border border-white/10 text-xs text-slate-300 space-y-3">
                <p>
                  Si abriste esta página desde el enlace recibido en tu correo electrónico, la confirmación se ejecuta automáticamente.
                </p>
                <p className="text-slate-400">
                  Si no recibiste ningún correo, regresa a la pestaña <strong>Solicitar Eliminación</strong> e introduce tu dirección nuevamente.
                </p>
              </div>
            )}
          </div>
        )}

        {/* INFORMATION MATRIX: REQUISITOS GOOGLE PLAY STORE */}
        <div className="mt-10 space-y-6">
          <div className="border-t border-white/10 pt-8">
            <h2 className="text-2xl font-bold text-white mb-2">Información de Transparencia sobre Datos y Privacidad</h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Detalle transparente sobre el destino de tu información conforme a los requisitos de Google Play Store y el marco regulatorio educativo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Box 1: Qué datos se eliminan */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                <Trash2 className="w-4 h-4" />
                <span>Qué datos se eliminan definitivamente</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
                <li><strong>Cuenta de autenticación:</strong> Registro de usuario en Firebase Authentication (correo, hash de credenciales, UID y tokens de sesión).</li>
                <li><strong>Perfil de usuario en Firestore:</strong> Nombre, datos de perfil, preferencias y estado de cuenta.</li>
                <li><strong>Evidencias personales y archivos:</strong> Archivos fotográficos, videos y reportes multimedia almacenados en Firebase Storage vinculados a tu UID.</li>
                <li><strong>Progreso y actividades:</strong> Registros individuales de misiones, transacciones de recompensa de gamificación y respuestas de encuestas vinculadas a tu identidad.</li>
              </ul>
            </div>

            {/* Box 2: Qué datos podrían conservarse y por qué */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Database className="w-4 h-4" />
                <span>Datos sujetos a conservación justificada</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Si existen registros escolares o métricas requeridos por una obligación institucional o regulatoria legítima:
              </p>
              <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
                <li><strong>Métricas estadísticas agregadas:</strong> Conteos globales de impacto ecológico sin vinculación a tu identidad personal (completamente disociados y anonimizados).</li>
                <li><strong>Registro administrativo mínimo:</strong> Comprobante de cumplimiento de la solicitud de eliminación con UID anonimizado (<code className="font-mono text-[11px] text-slate-400">anon_xxxx</code>) para fines de auditoría técnica.</li>
                <li><strong>Plazos de conservación:</strong> Los datos personales se suprimen al ejecutarse el trámite. Los registros anonimizados se conservan exclusivamente durante el ciclo escolar vigente (información sujeta a validación administrativa escolar).</li>
              </ul>
            </div>

            {/* Box 3: Cómo verificar la identidad */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
                <Lock className="w-4 h-4" />
                <span>Verificación segura de identidad</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Para prevenir que terceros malintencionados soliciten la eliminación de cuentas ajenas, EcoViG implementa una verificación criptográfica de dos factores lógicos:
              </p>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                <li>Desde la app: Sesión autenticada en Firebase con credenciales vigentes.</li>
                <li>Desde la web pública: Enlace firmado criptográficamente de corta vigencia enviado al correo del titular.</li>
              </ul>
            </div>

            {/* Box 4: Qué ocurre después de completar la eliminación */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>Qué ocurre después de la eliminación</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                <li>La cuenta queda permanentemente inaccesible. No podrás iniciar sesión con las credenciales anteriores.</li>
                <li>Tu profesor ya no verá tu nombre ni datos en los listados activos de su grupo escolar.</li>
                <li>Cualquier intento posterior de acceso requerirá un nuevo registro escolar desde cero.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} EcoViG — Gestión de Privacidad y Cumplimiento Normativo.</p>
        <div className="flex items-center gap-4">
          <Link to="/policies" className="hover:text-emerald-400 transition-colors">
            Políticas de Privacidad
          </Link>
          <Link to="/support" className="hover:text-emerald-400 transition-colors">
            Centro de Soporte
          </Link>
        </div>
      </footer>
    </div>
  );
}
