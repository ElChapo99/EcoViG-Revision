import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { getStudentOnboardingState } from '../../lib/onboardingGuard';
import { db } from '../../lib/firebase';
import { doc, getDocs, collection, query, where, updateDoc, addDoc } from 'firebase/firestore';
import { 
  Home, 
  Target, 
  Globe, 
  Trophy, 
  BarChart2, 
  User as UserIcon, 
  LogOut, 
  Lock as LockIcon, 
  Key, 
  MailCheck, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Compass, 
  Store as StoreIcon,
  X
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { apiFetch, safeReadJson } from '../../lib/apiClient';
import { motion, AnimatePresence } from 'motion/react';
import { hasUserCompletedInitialSurvey } from '../../lib/surveyService';

// Tabs
import OverviewTab from './tabs/OverviewTab';
import MissionsTab from './tabs/MissionsTab';
import EcosystemTab from './tabs/EcosystemTab';
import StoreTab from './tabs/StoreTab';
import AchievementsTab from './tabs/AchievementsTab';
import ProgressTab from './tabs/ProgressTab';
import ProfileTab from './tabs/ProfileTab';

export default function StudentDashboard() {
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState(() => {
    return (location.state as any)?.tab || 'home';
  });
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkCodeInput, setLinkCodeInput] = useState('');
  const [linkError, setLinkError] = useState('');
  const [linkSuccess, setLinkSuccess] = useState(false);
  const [linkLoading, setLinkLoading] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  useEffect(() => {
    if ((location.state as any)?.tab) {
      setActiveTab((location.state as any).tab);
    }
  }, [location.state]);

  useEffect(() => {
    // Check if user already requested teacher role
    const checkReq = async () => {
      if (user && user.email && user.email.endsWith('@unison.mx')) {
        const q = query(collection(db, 'roleRequests'), where('userId', '==', user.uid), where('status', '==', 'pending'));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setRequestSent(true);
        }
      }
    };
    checkReq();
  }, [user]);

  if (!user) return null;

  const onboardingState = getStudentOnboardingState(user);
  if (onboardingState === 'NEEDS_SCHOOL') {
    return <Navigate to="/select-school" replace />;
  }
  if (onboardingState === 'NEEDS_TEACHER') {
    return <Navigate to="/link-teacher" replace />;
  }

  const hasTakenSurvey = hasUserCompletedInitialSurvey(user);
  const isUnlinked = !user.teacherId;

  const handleLinkCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = linkCodeInput.trim().toUpperCase();
    if (!cleanCode || linkLoading) return;
    setLinkLoading(true);
    setLinkError('');
    try {
      const token = await (await import('../../lib/firebase')).auth.currentUser?.getIdToken();
      if (!token) {
        throw new Error('Sesión no disponible. Inicia sesión nuevamente.');
      }

      const res = await apiFetch('/api/user/link-teacher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ linkCode: cleanCode })
      });

      const data = await safeReadJson<any>(res, 'El código ingresado no es válido.');

      setLinkSuccess(true);
      await refreshUser();
      setTimeout(() => {
        setLinkModalOpen(false);
        setLinkSuccess(false);
        setLinkCodeInput('');
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setLinkError(err.message || 'Ocurrió un error al vincular el docente.');
    } finally {
      setLinkLoading(false);
    }
  };

  const handleRoleRequest = async () => {
    if (requestLoading) return;
    setRequestLoading(true);
    try {
      await addDoc(collection(db, 'roleRequests'), {
        userId: user.uid,
        email: user.email,
        name: user.name,
        requestedRole: 'teacher',
        status: 'pending',
        createdAt: Date.now()
      });
      setRequestSent(true);
    } catch (e) {
      console.error(e);
      alert('Error al enviar la solicitud');
    } finally {
      setRequestLoading(false);
    }
  };

  // Screen shown when Survey is not yet completed
  const renderSurveyRequired = (title: string) => (
    <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-6 max-w-xl mx-auto">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-24 h-24 bg-gradient-to-br from-emerald-500/20 to-teal-500/30 rounded-3xl flex items-center justify-center shadow-[0_0_30px_rgba(52,211,153,0.3)] border border-emerald-500/40 backdrop-blur-md text-4xl"
      >
        🔒
      </motion.div>

      <div className="space-y-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Diagnóstico Inicial Requerido
        </span>
        <h2 className="text-2xl sm:text-4xl font-light text-white leading-tight">
          {title} Bloqueado
        </h2>
        <p className="text-slate-300 text-sm leading-relaxed">
          Para desbloquear las actividades, <strong>Mi Mundo</strong>, la <strong>Tienda</strong>, los <strong>Logros</strong> y tu <strong>Progreso</strong>, primero debes completar tu encuesta diagnóstica inicial.
        </p>
      </div>

      <div className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-left space-y-2.5 backdrop-blur-md">
        <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
          ¿Qué se desbloqueará al terminar la encuesta?
        </div>
        <ul className="text-xs text-slate-300 space-y-2">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span><strong>12 Misiones y 10 Retos</strong> en las 4 dimensiones socioambientales</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span><strong>Mi Mundo:</strong> Ecosistema vivo con árboles, agua y fauna</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span><strong>EcoTienda:</strong> Desbloqueo y personalización de elementos ecológicos</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span><strong>Logros e Insignias:</strong> Reconocimiento de hábitos y rachas</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span><strong>Monitor de Progreso:</strong> Estadísticas de evolución individual</span>
          </li>
        </ul>
      </div>

      <button
        onClick={() => navigate('/questionnaire')}
        className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm px-8 py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(16,185,129,0.5)] transform hover:scale-[1.02]"
      >
        <Compass className="w-4 h-4" /> Comenzar Encuesta Diagnóstica (21 preguntas) <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );

  const renderLockedTab = (title: string) => (
    <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-6">
      <div className="w-24 h-24 bg-slate-900/50 rounded-full flex items-center justify-center shadow-xl border border-slate-700/50 backdrop-blur-md">
        <LockIcon className="w-10 h-10 text-emerald-400" />
      </div>
      <div>
        <h2 className="text-3xl font-light text-white mb-2">{title} Bloqueado</h2>
        <p className="text-slate-400 max-w-md mx-auto">Para acceder a las misiones, la tienda y tu ecosistema completo, necesitas vincularte con el código de tu profesor.</p>
      </div>
      
      <form onSubmit={handleLinkCode} className="w-full max-w-xs space-y-4">
        {linkError && <p className="text-xs text-red-400">{linkError}</p>}
        <div className="relative">
           <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
           <input 
             type="text" 
             placeholder="Código de 6 dígitos"
             maxLength={6}
             value={linkCodeInput}
             onChange={(e) => setLinkCodeInput(e.target.value.toUpperCase())}
             className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white placeholder-slate-500 font-mono tracking-widest text-center focus:border-emerald-500 outline-none"
           />
        </div>
        <button type="submit" disabled={linkLoading || linkCodeInput.length < 3} className="w-full bg-emerald-500 text-black py-3 rounded-xl font-bold hover:bg-emerald-400 transition-colors disabled:opacity-50">
          {linkLoading ? 'Verificando...' : 'Vincular Cuenta'}
        </button>
      </form>
    </div>
  );

  const renderTab = () => {
    switch (activeTab) {
      case 'home': 
        return <OverviewTab onNavigateToMissions={() => setActiveTab('missions')} />;
      case 'missions': 
        if (!hasTakenSurvey) return renderSurveyRequired('Misiones y Actividades');
        return <MissionsTab />;
      case 'ecosystem': 
        if (!hasTakenSurvey) return renderSurveyRequired('Mi Mundo');
        return <EcosystemTab />;
      case 'store': 
        if (!hasTakenSurvey) return renderSurveyRequired('EcoTienda');
        return <StoreTab />;
      case 'achievements': 
        if (!hasTakenSurvey) return renderSurveyRequired('Logros e Insignias');
        return <AchievementsTab />;
      case 'progress': 
        if (!hasTakenSurvey) return renderSurveyRequired('Progreso Socioambiental');
        return <ProgressTab />;
      case 'profile': 
        return <ProfileTab onOpenLinkModal={() => setLinkModalOpen(true)} />;
      default: 
        return <OverviewTab onNavigateToMissions={() => setActiveTab('missions')} />;
    }
  };

  const navItems = [
    { id: 'home', icon: Home, label: 'Inicio', locked: false },
    { id: 'missions', icon: Target, label: 'Misiones', locked: !hasTakenSurvey },
    { id: 'ecosystem', icon: Globe, label: 'Mi Mundo', locked: !hasTakenSurvey },
    { id: 'store', icon: StoreIcon, label: 'Tienda', locked: !hasTakenSurvey },
    { id: 'achievements', icon: Trophy, label: 'Logros', locked: !hasTakenSurvey },
    { id: 'progress', icon: BarChart2, label: 'Progreso', locked: !hasTakenSurvey },
    { id: 'profile', icon: UserIcon, label: 'Perfil', locked: false },
  ];

  const isUnison = user.email && user.email.endsWith('@unison.mx');

  return (
    <div className="min-h-screen flex flex-col md:flex-row pb-20 md:pb-0 font-sans text-white relative z-10">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-[260px] bg-white/5 border-r border-white/10 h-screen sticky top-0 p-6 backdrop-blur-md">
        <div className="flex items-center gap-3 text-white font-bold text-xl mb-8 px-2">
          <div className="w-8 h-8 rounded-lg overflow-hidden shadow-[0_0_15px_rgba(52,211,153,0.4)] border border-emerald-500/30 flex items-center justify-center bg-black/40">
            <img 
              src="/ecovig-logo.svg" 
              alt="EcoViG" 
              className="w-full h-full object-cover select-none pointer-events-none" 
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="tracking-tight"><span className="text-white">Eco</span><span className="text-emerald-400">ViG</span></span>
        </div>

        {isUnison && user.role === 'student' && (
          <div className="mb-6 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">Comunidad Unison</h4>
            {requestSent ? (
               <div className="text-xs text-slate-300 flex items-center gap-2">
                 <MailCheck className="w-4 h-4 text-emerald-400" /> Solicitud en revisión
               </div>
            ) : (
              <button onClick={handleRoleRequest} disabled={requestLoading} className="w-full text-xs font-bold bg-white/10 hover:bg-white/20 text-white py-2 rounded-xl transition-colors">
                Solicitar rol Docente
              </button>
            )}
          </div>
        )}

        <div className="text-[10px] uppercase tracking-[0.2em] text-emerald-400/70 font-bold mb-4 px-4">Menu</div>
        
        <nav className="flex flex-col gap-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-all text-left relative overflow-hidden",
                activeTab === item.id 
                  ? "bg-white/10 border border-white/10 shadow-lg text-white" 
                  : "bg-transparent border border-transparent text-slate-400 opacity-70 hover:opacity-100 hover:bg-white/5"
              )}
            >
              {activeTab === item.id ? (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-emerald-400 rounded-r-full shadow-[0_0_8px_#34d399]"></div>
              ) : null}
              
              <div className="flex items-center gap-3 w-full">
                <item.icon className="w-5 h-5" />
                <span className="flex-1">{item.label}</span>
                {item.locked && (
                  <span title="Completa la encuesta para desbloquear">
                    <LockIcon className="w-3.5 h-3.5 text-amber-400/80" />
                  </span>
                )}
              </div>
            </button>
          ))}
        </nav>

        {isUnlinked && (
          <div className="mt-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-left">
            <div className="text-[11px] font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5" /> Vincular Profesor
            </div>
            <p className="text-[10px] text-slate-300 mb-2">
              ¿Tu docente te dio un código escolar?
            </p>
            <button
              onClick={() => setLinkModalOpen(true)}
              className="w-full py-1.5 px-2.5 rounded-xl bg-emerald-500 text-black font-bold text-[10px] hover:bg-emerald-400 transition-colors"
            >
              Ingresar código
            </button>
          </div>
        )}
        
        <div className="mt-auto pt-4">
          <button
            onClick={logout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-medium transition-all text-left bg-transparent border border-transparent text-red-400 opacity-70 hover:opacity-100 hover:bg-red-500/10"
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-5 h-5" />
              <span>Cerrar sesión</span>
            </div>
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden bg-[#05070a]/80 backdrop-blur-xl border-b border-white/10 px-4 py-3 sticky top-0 z-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg overflow-hidden shadow-[0_0_10px_rgba(52,211,153,0.4)] border border-emerald-500/30 flex items-center justify-center bg-black/40">
            <img 
              src="/ecovig-logo.svg" 
              alt="EcoViG" 
              className="w-full h-full object-cover select-none pointer-events-none" 
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="font-bold text-white tracking-tight"><span className="text-white">Eco</span><span className="text-emerald-400">ViG</span></span>
        </div>
        <div className="flex items-center gap-2">
          {isUnlinked && (
            <button 
              onClick={() => setLinkModalOpen(true)}
              className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full font-medium"
            >
              Vincular
            </button>
          )}
          <button onClick={logout} className="text-slate-400 hover:text-red-400 transition-colors p-2">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 md:p-10 relative z-10">
        {/* Soft non-blocking banner for linking code if student hasn't linked yet */}
        {isUnlinked && hasTakenSurvey && (
          <div className="mb-6 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border border-emerald-500/20 p-4 rounded-2xl backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-300 block">¿Perteneces a un grupo escolar?</span>
                <span className="text-xs text-slate-300">Vincula el código de 6 dígitos que te dio tu profesor para que pueda registrar tus evidencias.</span>
              </div>
            </div>
            <button
              onClick={() => setLinkModalOpen(true)}
              className="self-start sm:self-auto px-4 py-2 rounded-xl bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition-colors shrink-0"
            >
              Vincular con profesor
            </button>
          </div>
        )}

        {renderTab()}
      </main>

      {/* Teacher Link Modal */}
      <AnimatePresence>
        {linkModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0b101b] border border-white/15 p-6 sm:p-8 rounded-[32px] max-w-md w-full shadow-2xl relative"
            >
              <button
                onClick={() => setLinkModalOpen(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Key className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-light text-white">Vincular Código Escolar</h3>
                  <p className="text-xs text-slate-400">Código de 6 dígitos de tu profesor</p>
                </div>
              </div>

              {linkSuccess ? (
                <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-center space-y-1">
                  <div className="text-2xl mb-1">🎉</div>
                  <div className="text-sm font-bold text-emerald-300">¡Cuenta vinculada con éxito!</div>
                  <div className="text-xs text-slate-300">Tu profesor ahora tiene acceso a tus evidencias escolares.</div>
                </div>
              ) : (
                <form onSubmit={handleLinkCode} className="space-y-4">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Ingresa el código alfanumérico que te proporcionó tu docente para conectar tu cuenta con su grupo escolar.
                  </p>
                  {linkError && <p className="text-xs text-red-400 bg-red-500/10 p-2.5 rounded-xl border border-red-500/20">{linkError}</p>}
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Ej: PROF12"
                      maxLength={6}
                      value={linkCodeInput}
                      onChange={(e) => setLinkCodeInput(e.target.value.toUpperCase())}
                      className="w-full bg-white/5 border border-white/15 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-slate-500 font-mono tracking-widest text-center text-lg focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setLinkModalOpen(false)}
                      className="flex-1 py-3 rounded-xl border border-white/10 text-slate-300 hover:text-white text-xs font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={linkLoading || linkCodeInput.length < 3}
                      className="flex-1 bg-emerald-500 text-black py-3 rounded-xl font-bold text-xs hover:bg-emerald-400 transition-colors disabled:opacity-50"
                    >
                      {linkLoading ? 'Verificando...' : 'Vincular Grupo'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#05070a]/90 backdrop-blur-xl border-t border-white/10 pt-2 pb-[env(safe-area-inset-bottom)] z-50">
        <div className="flex overflow-x-auto hide-scrollbar px-2 snap-x">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex flex-col items-center p-3 rounded-lg transition-colors relative min-w-[72px] snap-center flex-shrink-0",
                activeTab === item.id ? "text-emerald-400" : "text-slate-500 hover:text-slate-400"
              )}
            >
              <item.icon className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-medium tracking-wide uppercase">{item.label}</span>
              {item.locked && <LockIcon className="w-3 h-3 absolute top-1 right-2 text-amber-400" />}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
