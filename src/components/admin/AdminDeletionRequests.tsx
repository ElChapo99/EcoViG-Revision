import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trash2, 
  ShieldAlert, 
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
  Calendar, 
  Clock, 
  ShieldCheck, 
  Users,
  AlertTriangle,
  FileText,
  KeyRound
} from 'lucide-react';
import { AccountDeletionRequest } from '../../types';
import { 
  fetchAdminDeletionRequests, 
  reviewAdminDeletionRequest, 
  executeAdminAccountDeletion 
} from '../../lib/accountDeletionService';

export default function AdminDeletionRequests() {
  const [requests, setRequests] = useState<AccountDeletionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [schoolFilter, setSchoolFilter] = useState<string>('all');

  // Execution Modal State
  const [requestToExecute, setRequestToExecute] = useState<AccountDeletionRequest | null>(null);
  const [executing, setExecuting] = useState(false);
  const [executionMessage, setExecutionMessage] = useState('');
  const [executionError, setExecutionError] = useState('');

  // Review Modal State
  const [requestToReview, setRequestToReview] = useState<AccountDeletionRequest | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminDeletionRequests();
      setRequests(data);
    } catch (err) {
      console.error('Error loading admin deletion requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteDeletion = async () => {
    if (!requestToExecute) return;
    setExecuting(true);
    setExecutionError('');
    setExecutionMessage('');

    try {
      const res = await executeAdminAccountDeletion(requestToExecute.id);
      setExecutionMessage(res.message);
      await loadRequests();
      setTimeout(() => {
        setRequestToExecute(null);
        setExecutionMessage('');
      }, 1800);
    } catch (err: any) {
      console.error('Error executing account deletion:', err);
      setExecutionError(err.message || 'Error al ejecutar la baja definitiva.');
    } finally {
      setExecuting(false);
    }
  };

  const handleReview = async (status: 'approved' | 'rejected') => {
    if (!requestToReview) return;
    setReviewing(true);
    setReviewError('');

    try {
      await reviewAdminDeletionRequest(requestToReview.id, status, reviewNote);
      setRequestToReview(null);
      await loadRequests();
    } catch (err: any) {
      console.error('Error in admin review:', err);
      setReviewError(err.message || 'Error al revisar la solicitud.');
    } finally {
      setReviewing(false);
    }
  };

  const availableSchools = useMemo(() => {
    const set = new Set<string>();
    requests.forEach(r => {
      if (r.schoolName) set.add(r.schoolName);
    });
    return Array.from(set);
  }, [requests]);

  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = (req.userName || '').toLowerCase().includes(q);
        const matchEmail = (req.userEmail || '').toLowerCase().includes(q);
        const matchTeacher = (req.teacherName || '').toLowerCase().includes(q);
        const matchSchool = (req.schoolName || '').toLowerCase().includes(q);
        const matchId = (req.userId || '').toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchTeacher && !matchSchool && !matchId) return false;
      }

      if (statusFilter !== 'all' && req.status !== statusFilter) {
        return false;
      }

      if (schoolFilter !== 'all' && req.schoolName !== schoolFilter) {
        return false;
      }

      return true;
    });
  }, [requests, searchQuery, statusFilter, schoolFilter]);

  const approvedPendingCount = requests.filter(r => r.status === 'approved').length;
  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white/5 border border-white/10 p-6 sm:p-7 rounded-[32px] backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 text-[10px] font-bold uppercase tracking-wider border border-red-500/30 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" /> Purgado y Bajas Definitivas
            </span>
            {approvedPendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-black font-bold text-[10px]">
                {approvedPendingCount} listas para purga definitiva
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-light text-white">Solicitudes de Eliminación Globales</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Supervisión centralizada de solicitudes de baja. Como Creador/Administrador tienes la autoridad exclusiva para ejecutar la eliminación irreversible de autenticación (Firebase Auth), transacciones, evidencias y perfiles.
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

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-black/30 border border-white/10 p-4 rounded-2xl">
          <div className="text-[10px] uppercase font-bold text-slate-400">Total Solicitudes</div>
          <div className="text-xl font-bold text-white mt-1">{requests.length}</div>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl">
          <div className="text-[10px] uppercase font-bold text-blue-400">Aprobadas por Docente</div>
          <div className="text-xl font-bold text-blue-300 mt-1">{approvedPendingCount}</div>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl">
          <div className="text-[10px] uppercase font-bold text-amber-400">Pendientes de Revisión</div>
          <div className="text-xl font-bold text-amber-300 mt-1">{pendingCount}</div>
        </div>

        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl">
          <div className="text-[10px] uppercase font-bold text-emerald-400">Bajas Completadas</div>
          <div className="text-xl font-bold text-emerald-300 mt-1">
            {requests.filter(r => r.status === 'completed').length}
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-3 bg-black/30 border border-white/10 p-4 rounded-2xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por alumno, correo, escuela, maestro o UID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap gap-2.5">
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-emerald-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#0b131e] text-white">Todos los estados</option>
              <option value="approved" className="bg-[#0b131e] text-white">Aprobadas por Docente (Listas para purga)</option>
              <option value="pending" className="bg-[#0b131e] text-white">Pendientes de revisión</option>
              <option value="completed" className="bg-[#0b131e] text-white">Completadas (Purgadas)</option>
              <option value="rejected" className="bg-[#0b131e] text-white">Rechazadas</option>
              <option value="cancelled" className="bg-[#0b131e] text-white">Canceladas</option>
            </select>
          </div>

          {availableSchools.length > 0 && (
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-xs text-slate-300">
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              <select
                value={schoolFilter}
                onChange={(e) => setSchoolFilter(e.target.value)}
                className="bg-transparent text-white focus:outline-none cursor-pointer max-w-[180px] truncate"
              >
                <option value="all" className="bg-[#0b131e] text-white">Todas las escuelas</option>
                {availableSchools.map(sch => (
                  <option key={sch} value={sch} className="bg-[#0b131e] text-white">{sch}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="bg-white/5 border border-white/10 p-12 rounded-[32px] text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Cargando solicitudes globales de eliminación...
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white/5 border border-white/10 p-12 rounded-[32px] text-center text-slate-400 space-y-2">
          <CheckCircle2 className="w-12 h-12 text-slate-600 mx-auto" />
          <div className="text-white font-medium">No se encontraron solicitudes con los filtros seleccionados.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5">
          {filteredRequests.map((req) => {
            const isApproved = req.status === 'approved';
            const isPending = req.status === 'pending';
            const isCompleted = req.status === 'completed';
            const isRejected = req.status === 'rejected';

            return (
              <div
                key={req.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                  isApproved 
                    ? 'bg-blue-500/10 border-blue-500/30' 
                    : isCompleted
                    ? 'bg-black/20 border-emerald-500/20 opacity-80'
                    : 'bg-black/30 border-white/10'
                }`}
              >
                <div className="space-y-2.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-white text-base">{req.userName}</span>
                    <span className="text-xs text-slate-400 font-mono">({req.userEmail})</span>

                    {/* Type badge */}
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      req.type === 'academic_withdrawal'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                        : 'bg-red-500/20 text-red-300 border-red-500/30'
                    }`}>
                      {req.type === 'academic_withdrawal' ? 'Baja Académica' : 'Eliminación de Cuenta'}
                    </span>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      req.status === 'verified'
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30 font-bold'
                        : isApproved 
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/30 font-bold' 
                        : isPending || req.status === 'pending_verification'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
                        : isCompleted 
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                        : isRejected 
                        ? 'bg-red-500/20 text-red-300 border-red-500/30'
                        : req.status === 'requires_admin_review'
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/30 font-bold'
                        : 'bg-slate-500/20 text-slate-300 border-slate-500/30'
                    }`}>
                      {req.status === 'approved' ? '✓ Validada por Docente' :
                       req.status === 'verified' ? '✓ Identidad Verificada (Web)' :
                       req.status === 'pending' ? 'Pendiente de Revisión' :
                       req.status === 'pending_verification' ? 'En Verificación por Email' :
                       req.status === 'requires_admin_review' ? 'Requiere Atención Admin' :
                       req.status === 'completed' ? 'Baja Definitiva Ejecutada' :
                       req.status === 'rejected' ? 'Rechazada' :
                       req.status === 'processing' ? 'Procesando purga...' :
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
                      {req.schoolName || 'Escuela no asignada'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-teal-300">
                      <Users className="w-3.5 h-3.5" />
                      {req.teacherName ? `Docente: ${req.teacherName}` : 'Sin docente vinculado'}
                    </span>
                    {req.trackingId && (
                      <>
                        <span>•</span>
                        <span className="font-mono text-cyan-300 text-[11px]">
                          Ref: {req.trackingId}
                        </span>
                      </>
                    )}
                    <span>•</span>
                    <span className="font-mono text-[11px] text-slate-500">
                      UID: {req.userId}
                    </span>
                  </div>

                  {req.reason && (
                    <div className="text-xs text-slate-300 bg-white/5 p-2.5 rounded-xl border border-white/5">
                      <span className="font-semibold text-slate-400">Motivo del estudiante:</span> "{req.reason}"
                    </div>
                  )}

                  {req.reviewNote && (
                    <div className="text-xs text-slate-300 bg-blue-500/10 p-2.5 rounded-xl border border-blue-500/20">
                      <span className="font-semibold text-blue-300">Nota del revisor ({req.reviewerRole || 'docente'}):</span> "{req.reviewNote}"
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0 self-start lg:self-center border-t lg:border-t-0 border-white/10 pt-3 lg:pt-0">
                  {/* Action 1: Execute Deletion if Approved, Verified, or Requires Admin Review */}
                  {(isApproved || req.status === 'verified' || req.status === 'requires_admin_review') && req.type !== 'academic_withdrawal' && (
                    <button
                      onClick={() => {
                        setRequestToExecute(req);
                        setExecutionError('');
                        setExecutionMessage('');
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 text-white font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(239,68,68,0.4)] flex items-center gap-1.5 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Ejecutar Baja Definitiva</span>
                    </button>
                  )}

                  {/* Action 2: Direct Admin Review if Pending or requires review */}
                  {(isPending || req.status === 'requires_admin_review' || req.type === 'academic_withdrawal') && !isCompleted && (
                    <button
                      onClick={() => {
                        setRequestToReview(req);
                        setReviewNote(req.reviewNote || '');
                        setReviewError('');
                      }}
                      className="px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5 text-amber-400" />
                      <span>Revisar como Admin</span>
                    </button>
                  )}

                  {isCompleted && (
                    <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Purgado completado
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* EXECUTE FINAL DELETION CONFIRMATION MODAL */}
      {requestToExecute && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0b131e] border border-red-500/30 p-6 sm:p-7 rounded-[32px] max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">Confirmar Baja Definitiva</h3>
                  <p className="text-[11px] text-red-300">Acción destructiva irreversible</p>
                </div>
              </div>

              <button
                onClick={() => setRequestToExecute(null)}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {executionError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{executionError}</span>
              </div>
            )}

            {executionMessage && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 p-3.5 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{executionMessage}</span>
              </div>
            )}

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <p>
                Estás a punto de purgar definitivamente la cuenta del estudiante:
              </p>
              <div className="bg-black/40 p-3.5 rounded-2xl border border-white/10 space-y-1">
                <div className="text-white font-bold text-sm">{requestToExecute.userName}</div>
                <div className="text-slate-400 font-mono">{requestToExecute.userEmail}</div>
                <div className="text-emerald-400">{requestToExecute.schoolName || 'Escuela no asignada'}</div>
              </div>

              <div className="bg-red-500/10 border border-red-500/20 p-3.5 rounded-2xl space-y-1.5 text-[11px] text-red-200">
                <div className="font-bold flex items-center gap-1 text-red-300">
                  <AlertTriangle className="w-4 h-4" /> Proceso de purga integral en servidor:
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                  <li>Eliminación de la cuenta en <strong>Firebase Authentication</strong></li>
                  <li>Eliminación de subcolección <strong>rewardTransactions</strong></li>
                  <li>Eliminación de misiones y evidencias vinculadas</li>
                  <li>Eliminación del documento de perfil en <strong>Firestore</strong></li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setRequestToExecute(null)}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-medium text-xs transition-colors"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={executing}
                onClick={handleExecuteDeletion}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{executing ? 'Purgando cuenta...' : 'Confirmar y Purgar Definitivamente'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN REVIEW MODAL */}
      {requestToReview && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0b131e] border border-white/15 p-6 sm:p-7 rounded-[32px] max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">Revisión Administrativa</h3>
                  <p className="text-[11px] text-slate-400">Alumno: {requestToReview.userName}</p>
                </div>
              </div>

              <button
                onClick={() => setRequestToReview(null)}
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
              <div className="bg-white/5 p-3 rounded-xl space-y-1">
                <div className="text-white font-medium">{requestToReview.userName} ({requestToReview.userEmail})</div>
                <div className="text-slate-400">Escuela: {requestToReview.schoolName || 'Sin escuela'}</div>
                {requestToReview.reason && (
                  <div className="text-slate-300 mt-1">Motivo: "{requestToReview.reason}"</div>
                )}
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Nota de resolución administrativa
                </label>
                <textarea
                  rows={3}
                  placeholder="Añade notas sobre la resolución..."
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs resize-none"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setRequestToReview(null)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-medium text-xs transition-colors"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={reviewing}
                onClick={() => handleReview('rejected')}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                <span>Rechazar</span>
              </button>

              <button
                type="button"
                disabled={reviewing}
                onClick={() => handleReview('approved')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-black font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{reviewing ? 'Procesando...' : 'Aprobar Solicitud'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
