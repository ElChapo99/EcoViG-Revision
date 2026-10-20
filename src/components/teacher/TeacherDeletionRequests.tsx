import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trash2, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Search, 
  Filter, 
  RefreshCw, 
  Building2, 
  User, 
  Check, 
  X, 
  FileText,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { AccountDeletionRequest, DeletionRequestStatus } from '../../types';
import { 
  fetchTeacherDeletionRequests, 
  reviewTeacherDeletionRequest 
} from '../../lib/accountDeletionService';

interface TeacherDeletionRequestsProps {
  onCountChange?: (count: number) => void;
}

export default function TeacherDeletionRequests({ onCountChange }: TeacherDeletionRequestsProps) {
  const [requests, setRequests] = useState<AccountDeletionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('pending');

  // Review Modal State
  const [selectedRequest, setSelectedRequest] = useState<AccountDeletionRequest | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await fetchTeacherDeletionRequests();
      setRequests(data);
      const pendingCount = data.filter(r => r.status === 'pending').length;
      if (onCountChange) onCountChange(pendingCount);
    } catch (err) {
      console.error('Error loading teacher deletion requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReviewModal = (req: AccountDeletionRequest) => {
    setSelectedRequest(req);
    setReviewNote(req.reviewNote || '');
    setReviewError('');
  };

  const handleReview = async (status: 'approved' | 'rejected') => {
    if (!selectedRequest) return;
    setReviewing(true);
    setReviewError('');

    try {
      await reviewTeacherDeletionRequest(selectedRequest.id, status, reviewNote);
      setSelectedRequest(null);
      await loadRequests();
    } catch (err: any) {
      console.error('Error submitting review:', err);
      setReviewError(err.message || 'Error al procesar la revisión.');
    } finally {
      setReviewing(false);
    }
  };

  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = (req.userName || '').toLowerCase().includes(q);
        const matchEmail = (req.userEmail || '').toLowerCase().includes(q);
        const matchSchool = (req.schoolName || '').toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchSchool) return false;
      }

      if (statusFilter !== 'all' && req.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [requests, searchQuery, statusFilter]);

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white/5 border border-white/10 p-6 sm:p-7 rounded-[32px] backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 text-[10px] font-bold uppercase tracking-wider border border-red-500/30 flex items-center gap-1">
              <Trash2 className="w-3 h-3" /> Solicitudes de Baja
            </span>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-black font-bold text-[10px]">
                {pendingCount} pendientes
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-light text-white">Solicitudes de Eliminación de Cuenta</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Revisa las peticiones de baja formal de tus alumnos vinculados. Tu validación permite a la administración ejecutar la baja definitiva de forma segura.
          </p>
        </div>

        <button
          onClick={loadRequests}
          className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-slate-300 hover:text-white transition-colors flex items-center gap-2 text-xs self-start md:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-black/30 border border-white/10 p-4 rounded-2xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por estudiante, correo o escuela..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-xs text-slate-300">
          <Filter className="w-3.5 h-3.5 text-emerald-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent text-white focus:outline-none cursor-pointer"
          >
            <option value="pending" className="bg-[#0b131e] text-white">Solo Pendientes</option>
            <option value="approved" className="bg-[#0b131e] text-white">Aprobadas</option>
            <option value="rejected" className="bg-[#0b131e] text-white">Rechazadas</option>
            <option value="completed" className="bg-[#0b131e] text-white">Completadas (Baja final)</option>
            <option value="cancelled" className="bg-[#0b131e] text-white">Canceladas</option>
            <option value="all" className="bg-[#0b131e] text-white">Todas las solicitudes</option>
          </select>
        </div>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="bg-white/5 border border-white/10 p-12 rounded-[32px] text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Cargando solicitudes de eliminación...
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white/5 border border-white/10 p-12 rounded-[32px] text-center text-slate-400 space-y-2">
          <CheckCircle2 className="w-12 h-12 text-slate-600 mx-auto" />
          <div className="text-white font-medium">
            {statusFilter === 'pending' 
              ? 'No tienes solicitudes de eliminación pendientes.' 
              : 'No se encontraron solicitudes con los filtros aplicados.'}
          </div>
          <p className="text-xs text-slate-500">
            Cualquier petición iniciada por tus estudiantes aparecerá en esta bandeja para tu supervisión.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredRequests.map((req) => {
            const isPending = req.status === 'pending';
            const isApproved = req.status === 'approved';
            const isCompleted = req.status === 'completed';
            const isRejected = req.status === 'rejected';

            return (
              <div
                key={req.id}
                className="bg-black/30 border border-white/10 hover:border-white/20 p-5 rounded-2xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-white text-base">{req.userName}</span>
                    <span className="text-xs text-slate-400 font-mono">({req.userEmail})</span>

                    {/* Type badge: Baja Académica vs Eliminación de Cuenta */}
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      req.type === 'academic_withdrawal'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                        : 'bg-red-500/20 text-red-300 border-red-500/30'
                    }`}>
                      {req.type === 'academic_withdrawal' ? 'Baja Académica' : 'Eliminación de Cuenta'}
                    </span>
                    
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      isPending || req.status === 'pending_verification'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
                        : req.status === 'verified'
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                        : isApproved 
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' 
                        : isCompleted 
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                        : isRejected 
                        ? 'bg-red-500/20 text-red-300 border-red-500/30'
                        : req.status === 'requires_admin_review'
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                        : 'bg-slate-500/20 text-slate-300 border-slate-500/30'
                    }`}>
                      {req.status === 'pending' ? 'Pendiente' :
                       req.status === 'pending_verification' ? 'Pendiente Verificación' :
                       req.status === 'verified' ? 'Identidad Verificada' :
                       req.status === 'approved' ? 'Validada por Docente' :
                       req.status === 'completed' ? 'Eliminación Completada' :
                       req.status === 'rejected' ? 'Rechazada' :
                       req.status === 'requires_admin_review' ? 'En Revisión Admin' :
                       req.status === 'processing' ? 'Procesando baja' :
                       req.status === 'cancelled' ? 'Cancelada por alumno' : req.status}
                    </span>

                    {req.source === 'public_web' && (
                      <span className="px-2 py-0.5 rounded-full bg-slate-700/60 text-slate-300 text-[10px] font-mono border border-white/10">
                        Vía Web Pública
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1 text-slate-300">
                      <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                      {req.schoolName || 'Escuela no especificada'}
                    </span>
                    {(req.grade || req.group) && (
                      <span>• {req.grade ? `${req.grade} Grado` : ''} {req.group ? `Grupo ${req.group}` : ''}</span>
                    )}
                    {req.trackingId && (
                      <span className="font-mono text-slate-400 text-[11px]">
                        Ref: {req.trackingId}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(req.createdAt).toLocaleDateString('es-MX', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  {req.reason && (
                    <div className="text-xs text-slate-300 bg-white/5 p-2.5 rounded-xl border border-white/5">
                      <span className="font-semibold text-slate-400">Motivo del estudiante:</span> "{req.reason}"
                    </div>
                  )}

                  {req.reviewNote && (
                    <div className="text-xs text-slate-300 bg-blue-500/10 p-2.5 rounded-xl border border-blue-500/20">
                      <span className="font-semibold text-blue-300">Nota de revisión:</span> "{req.reviewNote}"
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 self-start md:self-center border-t md:border-t-0 border-white/10 pt-3 md:pt-0">
                  {isPending || req.status === 'verified' ? (
                    <button
                      onClick={() => handleOpenReviewModal(req)}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-black font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{req.type === 'academic_withdrawal' ? 'Gestionar Baja' : 'Revisar Solicitud'}</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-500 italic">
                      {isCompleted ? 'Cuenta purgada' : isApproved ? 'En espera de admin' : req.status === 'requires_admin_review' ? 'En supervisión admin' : 'Revisada'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TEACHER REVIEW MODAL */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0b131e] border border-white/15 p-6 sm:p-7 rounded-[32px] max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">Revisar Solicitud de Baja</h3>
                  <p className="text-[11px] text-slate-400">Alumno: {selectedRequest.userName}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedRequest(null)}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {reviewError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{reviewError}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div className="bg-white/5 p-3.5 rounded-2xl border border-white/5 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Correo institucional:</span>
                  <span className="text-white font-medium">{selectedRequest.userEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Escuela:</span>
                  <span className="text-white">{selectedRequest.schoolName || 'Sin asignar'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Fecha de solicitud:</span>
                  <span className="text-white">{new Date(selectedRequest.createdAt).toLocaleString('es-MX')}</span>
                </div>
              </div>

              {selectedRequest.reason && (
                <div className="bg-black/30 p-3 rounded-xl border border-white/5 space-y-1">
                  <div className="font-semibold text-slate-400">Motivo expuesto por el alumno:</div>
                  <p className="text-slate-200 leading-relaxed">"{selectedRequest.reason}"</p>
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Nota o comentarios del docente (opcional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Añade observaciones para el estudiante o para el administrador..."
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs resize-none"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-medium text-xs transition-colors"
              >
                Cancelar
              </button>

              {selectedRequest.type === 'academic_withdrawal' ? (
                <>
                  <button
                    type="button"
                    disabled={reviewing}
                    onClick={() => handleReview('rejected')}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Rechazar Baja Académica</span>
                  </button>

                  <button
                    type="button"
                    disabled={reviewing}
                    onClick={() => handleReview('approved')}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-black font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    <span>{reviewing ? 'Procesando...' : 'Aprobar Baja Académica'}</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    disabled={reviewing}
                    onClick={() => handleReview('rejected')}
                    title="Registra observaciones administrativas para revisión central por política de privacidad"
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>Turnar con Observaciones</span>
                  </button>

                  <button
                    type="button"
                    disabled={reviewing}
                    onClick={() => handleReview('approved')}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-black font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    <span>{reviewing ? 'Procesando...' : 'Validar Identidad y Enviar'}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
