import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { auth, db } from '../lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { COMPLETED_STUDENT_PROFILE_DATA } from '../lib/userBootstrap';
import { getStudentOnboardingState } from '../lib/onboardingGuard';
import { Mail, Lock as LockIcon, KeyRound, ArrowLeft, CheckCircle2, ShieldCheck, AlertCircle, RefreshCw, Code2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { apiFetch, safeReadJson } from '../lib/apiClient';
import { PROJECT_CREDITS } from '../config/projectCredits';

export default function Login() {
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { refreshUser, user, firebaseUser } = useAuth();

  // Password recovery modal state
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetStep, setResetStep] = useState<1 | 2 | 3 | 4>(1); // 1: Email, 2: 6-digit Code, 3: New Password, 4: Success
  const [resetEmail, setResetEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [resetSessionId, setResetSessionId] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccessMsg, setResetSuccessMsg] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const otpInputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    document.title = 'Iniciar Sesión | EcoViG';
  }, []);

  useEffect(() => {
    if (user && firebaseUser) {
      navigate('/dashboard');
    }
  }, [user, firebaseUser, navigate]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      if (!userDoc.exists()) {
        const finalRole = (result.user.email === 'jesusduran2504@outlook.com' || result.user.email === 'jearturo250@gmail.com') ? 'admin' : 'student';
        const isSpecialStudent = result.user.email === 'a222200054@unison.mx';
        const userData = {
          uid: result.user.uid,
          email: result.user.email,
          name: result.user.displayName || 'Usuario Unison',
          role: finalRole,
          coins: 500,
          unlockedDecorations: [],
          activeDecorations: {},
          createdAt: Date.now(),
          updatedAt: Date.now(),
          ...(isSpecialStudent ? COMPLETED_STUDENT_PROFILE_DATA : {})
        };
        await setDoc(doc(db, 'users', result.user.uid), userData);
      }
      
      await refreshUser();
      const freshDoc = await getDoc(doc(db, 'users', result.user.uid));
      const freshUser = freshDoc.exists() ? (freshDoc.data() as any) : null;
      const state = getStudentOnboardingState(freshUser);

      if (state === 'NEEDS_SCHOOL') {
        navigate('/select-school', { replace: true });
      } else if (state === 'NEEDS_TEACHER') {
        navigate('/link-teacher', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Correo o contraseña incorrectos. Si olvidaste tu contraseña, recupérala con tu código de 6 dígitos.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Error: El inicio de sesión por correo no está habilitado en Firebase.');
      } else {
        setError(`Error: ${err.message || 'Error al iniciar sesión.'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const openResetModal = () => {
    setResetEmail(email || '');
    setOtpDigits(['', '', '', '', '', '']);
    setResetSessionId('');
    setResetToken('');
    setNewPassword('');
    setConfirmPassword('');
    setResetError('');
    setResetSuccessMsg('');
    setResetStep(1);
    setShowResetModal(true);
  };

  const closeResetModal = () => {
    setShowResetModal(false);
    setResetStep(1);
    setOtpDigits(['', '', '', '', '', '']);
    setResetSessionId('');
    setResetToken('');
  };

  // Step 1: Request 6-digit Code
  const handleRequestCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanEmail = resetEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setResetError('Por favor ingresa un correo electrónico válido.');
      return;
    }

    const emailDomain = cleanEmail.split('@')[1] || 'unknown';
    console.log('[PASSWORD RESET CLIENT] email domain requested:', emailDomain);

    setResetLoading(true);
    setResetError('');
    setResetSuccessMsg('');

    try {
      const res = await apiFetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail })
      });

      const data = await safeReadJson<any>(res, 'Error al solicitar el código de recuperación.');

      setResetSuccessMsg(data.message || 'Código de 6 dígitos enviado a tu correo.');
      setResendCooldown(data.cooldown || 60);
      setOtpDigits(['', '', '', '', '', '']);
      setResetStep(2);
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    } catch (err: any) {
      setResetError(err.message || 'No fue posible enviar el código. Intenta nuevamente.');
    } finally {
      setResetLoading(false);
    }
  };

  // OTP Box Handlers
  const handleOtpDigitChange = (index: number, val: string) => {
    const numericChar = val.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = numericChar;
    setOtpDigits(newDigits);
    setResetError('');

    if (numericChar && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        const newDigits = [...otpDigits];
        newDigits[index - 1] = '';
        setOtpDigits(newDigits);
        otpInputRefs.current[index - 1]?.focus();
      } else {
        const newDigits = [...otpDigits];
        newDigits[index] = '';
        setOtpDigits(newDigits);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    } else if (e.key === 'Enter') {
      const fullCode = otpDigits.join('');
      if (fullCode.length === 6) {
        handleVerifyCode();
      }
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newDigits = ['', '', '', '', '', ''];
    for (let i = 0; i < pastedData.length; i++) {
      newDigits[i] = pastedData[i];
    }
    setOtpDigits(newDigits);
    setResetError('');

    const focusIndex = Math.min(5, pastedData.length);
    otpInputRefs.current[focusIndex]?.focus();
  };

  // Step 2: Verify 6-digit Code
  const handleVerifyCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanCode = otpDigits.join('').trim();
    if (cleanCode.length !== 6) {
      setResetError('El código debe contener exactamente 6 dígitos numéricos.');
      return;
    }

    setResetLoading(true);
    setResetError('');
    setResetSuccessMsg('');

    try {
      const res = await apiFetch('/api/auth/verify-reset-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: resetEmail.trim().toLowerCase(),
          code: cleanCode
        })
      });

      const data = await safeReadJson<any>(res, 'Código incorrecto o expirado.');

      setResetSessionId(data.resetSessionId || data.sessionId || '');
      setResetToken(data.resetSessionToken || data.resetToken || '');
      setResetSuccessMsg('¡Código verificado! Ingresa tu nueva contraseña.');
      setResetStep(3);
    } catch (err: any) {
      setResetError(err.message || 'Error al verificar el código.');
    } finally {
      setResetLoading(false);
    }
  };

  // Step 3: Update Password in Backend & Firebase Auth
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setResetError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError('Las contraseñas no coinciden. Verifica antes de continuar.');
      return;
    }

    setResetLoading(true);
    setResetError('');
    setResetSuccessMsg('');

    try {
      const res = await apiFetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resetSessionId,
          resetSessionToken: resetToken,
          newPassword
        })
      });

      const data = await safeReadJson<any>(res, 'Error al actualizar la contraseña.');

      setResetStep(4);
    } catch (err: any) {
      setResetError(err.message || 'Error al guardar la nueva contraseña.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative z-10 font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white/5 border border-white/10 rounded-[40px] shadow-lg backdrop-blur-xl p-8"
      >
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-[0_0_25px_rgba(52,211,153,0.4)] border border-emerald-500/30 flex items-center justify-center bg-black/40 mb-3">
            <img 
              src="/ecovig-logo.svg" 
              alt="EcoViG" 
              className="w-full h-full object-cover select-none pointer-events-none" 
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="text-2xl font-bold tracking-tight"><span className="text-white">Eco</span><span className="text-emerald-400">ViG</span></span>
        </div>
        <h2 className="text-3xl font-light text-center text-white mb-2">Bienvenido de nuevo</h2>
        <p className="text-center text-slate-400 mb-8">Inicia sesión para continuar tu impacto.</p>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm mb-6">
            {error}
          </div>
        )}
        {message && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-sm mb-6">
            {message}
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-4 mb-6">
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                placeholder="Correo electrónico"
              />
            </div>
          </div>
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <LockIcon className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                placeholder="Contraseña"
              />
            </div>
            <div className="flex justify-end mt-2">
              <button 
                type="button" 
                onClick={openResetModal}
                className="text-xs text-slate-400 hover:text-emerald-400 transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full bg-emerald-500 text-black py-4 rounded-2xl font-bold shadow-[0_0_15px_rgba(16,185,129,0.5)] hover:bg-emerald-400 transition-colors disabled:opacity-50"
          >
            {loading ? 'Iniciando...' : 'Iniciar Sesión'}
          </button>
        </form>
        <p className="text-center text-sm text-slate-400 mt-8">
          ¿No tienes una cuenta? <Link to="/register" className="text-emerald-400 font-semibold hover:underline">Regístrate</Link>
        </p>

        <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-center gap-3 text-xs text-slate-400">
          <Link to="/support" className="hover:text-emerald-400 transition-colors py-1 px-2 rounded-lg hover:bg-white/5">
            Soporte
          </Link>
          <span className="text-slate-600 select-none">•</span>
          <Link to="/policies" className="hover:text-emerald-400 transition-colors py-1 px-2 rounded-lg hover:bg-white/5">
            Políticas
          </Link>
        </div>

        {/* Desarrolladores oficiales de EcoViG */}
        <div className="mt-6 pt-5 border-t border-white/10 text-center">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
            <Code2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{PROJECT_CREDITS.title}</span>
          </div>

          <div className="space-y-2.5">
            {/* Desarrollador Principal */}
            <div className="bg-white/5 border border-emerald-500/20 rounded-2xl px-3.5 py-2.5 text-center transition-all hover:border-emerald-500/40">
              <div className="inline-block text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 mb-1">
                {PROJECT_CREDITS.leadDeveloper.role}
              </div>
              <p className="text-xs sm:text-sm font-semibold text-white tracking-wide break-words">
                {PROJECT_CREDITS.leadDeveloper.name}
              </p>
            </div>

            {/* Equipo de Desarrollo */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl px-3.5 py-2.5 text-center">
              <span className="block text-[10px] font-medium uppercase tracking-wider text-slate-400 mb-1.5">
                Equipo de Desarrollo
              </span>
              <div className="space-y-1">
                {PROJECT_CREDITS.teamDevelopers.map((dev) => (
                  <p key={dev.name} className="text-xs text-slate-300 font-normal break-words">
                    {dev.name}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 🔒 6-DIGIT CODE PASSWORD RESET MODAL */}
      <AnimatePresence>
        {showResetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#0c1322] border border-white/15 rounded-[36px] max-w-md w-full p-6 sm:p-8 relative shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-emerald-400">
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider">Recuperación Segura</span>
                </div>
                <button
                  onClick={closeResetModal}
                  className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Progress Steps Indicator */}
              <div className="flex items-center justify-between mb-6 px-2">
                {[1, 2, 3, 4].map((stepNum) => (
                  <div key={stepNum} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      resetStep === stepNum
                        ? 'bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                        : resetStep > stepNum
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-white/5 text-slate-500 border border-white/10'
                    }`}>
                      {resetStep > stepNum ? '✓' : stepNum}
                    </div>
                    {stepNum < 4 && (
                      <div className={`w-10 sm:w-14 h-0.5 mx-1 ${
                        resetStep > stepNum ? 'bg-emerald-500/50' : 'bg-white/10'
                      }`} />
                    )}
                  </div>
                ))}
              </div>

              {/* Error and Success Alerts */}
              {resetError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-3.5 rounded-2xl text-xs flex items-start gap-2 mb-4">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{resetError}</span>
                </div>
              )}
              {resetSuccessMsg && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-3.5 rounded-2xl text-xs flex items-start gap-2 mb-4">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{resetSuccessMsg}</span>
                </div>
              )}

              {/* STEP 1: Introduce Email */}
              {resetStep === 1 && (
                <form onSubmit={handleRequestCode} className="space-y-4">
                  <div>
                    <h3 className="text-xl font-light text-white mb-1">Introduce tu correo</h3>
                    <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                      Te enviaremos un código de seguridad de 6 dígitos con 10 minutos de validez autoritativa.
                    </p>
                    <div className="relative">
                      <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="tu-correo@ejemplo.com"
                        className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-base"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={resetLoading || !resetEmail}
                    className="w-full bg-emerald-500 text-black py-3.5 rounded-2xl font-bold hover:bg-emerald-400 transition-colors disabled:opacity-50 text-sm shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                  >
                    {resetLoading ? 'Generando código...' : 'Recibir código de 6 dígitos'}
                  </button>
                </form>
              )}

              {/* STEP 2: Input 6-Digit Code */}
              {resetStep === 2 && (
                <form onSubmit={handleVerifyCode} className="space-y-4">
                  <div>
                    <h3 className="text-xl font-light text-white mb-1">Verifica tu código</h3>
                    <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                      Ingresa el código de 6 dígitos enviado a <strong className="text-white">{resetEmail}</strong>:
                    </p>

                    {/* 6 Discrete OTP Input Cells */}
                    <div className="flex items-center justify-center gap-2 sm:gap-3 py-2" onPaste={handleOtpPaste}>
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <input
                          key={index}
                          ref={(el) => { otpInputRefs.current[index] = el; }}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={1}
                          value={otpDigits[index]}
                          onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          className={`w-11 sm:w-12 h-14 rounded-2xl bg-white/10 border text-white text-center font-mono font-bold text-xl sm:text-2xl outline-none transition-all ${
                            otpDigits[index]
                              ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                              : 'border-white/20 focus:border-emerald-500 focus:bg-white/15'
                          }`}
                          style={{ fontSize: '20px' }}
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={resetLoading || otpDigits.join('').length !== 6}
                    className="w-full bg-emerald-500 text-black py-3.5 rounded-2xl font-bold hover:bg-emerald-400 transition-colors disabled:opacity-50 text-sm shadow-[0_0_15px_rgba(16,185,129,0.3)] mt-2"
                  >
                    {resetLoading ? 'Verificando...' : 'Verificar código'}
                  </button>

                  <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
                    <button
                      type="button"
                      onClick={() => setResetStep(1)}
                      className="hover:text-white flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Cambiar correo
                    </button>
                    <button
                      type="button"
                      disabled={resendCooldown > 0 || resetLoading}
                      onClick={() => handleRequestCode()}
                      className="hover:text-emerald-400 disabled:opacity-50 flex items-center gap-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      {resendCooldown > 0 ? `Reenviar en ${resendCooldown}s` : 'Reenviar código'}
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3: New Password */}
              {resetStep === 3 && (
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div>
                    <h3 className="text-xl font-light text-white mb-1">Nueva contraseña</h3>
                    <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                      Ingresa tu nueva contraseña para actualizar tu cuenta en Firebase Authentication.
                    </p>

                    <div className="space-y-3">
                      <div className="relative">
                        <LockIcon className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                          type="password"
                          required
                          minLength={6}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Nueva contraseña (mínimo 6 caracteres)"
                          className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-sm"
                        />
                      </div>

                      <div className="relative">
                        <LockIcon className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                          type="password"
                          required
                          minLength={6}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirmar nueva contraseña"
                          className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={resetLoading || newPassword.length < 6 || newPassword !== confirmPassword}
                    className="w-full bg-emerald-500 text-black py-3.5 rounded-2xl font-bold hover:bg-emerald-400 transition-colors disabled:opacity-50 text-sm shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                  >
                    {resetLoading ? 'Actualizando contraseña...' : 'Guardar nueva contraseña'}
                  </button>
                </form>
              )}

              {/* STEP 4: Confirmation */}
              {resetStep === 4 && (
                <div className="text-center py-4 space-y-4">
                  <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500/40 shadow-[0_0_20px_rgba(52,211,153,0.4)]">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-light text-white">¡Contraseña restablecida!</h3>
                    <p className="text-xs text-slate-300 mt-2 max-w-xs mx-auto leading-relaxed">
                      Tu contraseña ha sido actualizada con éxito en Firebase Authentication. Ya puedes iniciar sesión con tu nueva clave.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      closeResetModal();
                      setEmail(resetEmail);
                      setPassword('');
                    }}
                    className="w-full bg-emerald-500 text-black py-3.5 rounded-2xl font-bold hover:bg-emerald-400 transition-colors text-sm shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                  >
                    Iniciar Sesión Ahora
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

