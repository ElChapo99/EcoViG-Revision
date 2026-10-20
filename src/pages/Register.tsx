import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, collection, getDocs } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock as LockIcon, User as UserIcon, Check, Building2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Role } from '../types';
import { COMPLETED_STUDENT_PROFILE_DATA } from '../lib/userBootstrap';
import { OFFICIAL_STUDENT_SCHOOLS, ALLOWED_STUDENT_SCHOOL_IDS, OfficialSchool } from '../data/officialSchools';

export default function Register() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [availableSchools, setAvailableSchools] = useState<OfficialSchool[]>(OFFICIAL_STUDENT_SCHOOLS);

  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  useEffect(() => {
    loadSchools();
  }, []);

  const loadSchools = async () => {
    try {
      const snap = await getDocs(collection(db, 'schools'));
      if (!snap.empty) {
        const list = snap.docs
          .map(d => ({ id: d.id, ...d.data() } as any))
          .filter(s => s.active !== false && (ALLOWED_STUDENT_SCHOOL_IDS.includes(s.id) || s.studentRegistrationAllowed === true))
          .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        if (list.length > 0) {
          setAvailableSchools(list as OfficialSchool[]);
        }
      }
    } catch (err) {
      console.warn('Using default official schools for registration:', err);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!name.trim()) {
      setError('Por favor ingresa tu nombre completo.');
      return;
    }

    if (!selectedSchoolId) {
      setError('Por favor selecciona tu escuela secundaria obligatoriamente.');
      return;
    }
    
    // Basic password validation
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      setError('La contraseña no cumple los requisitos (mínimo 8 caracteres, 1 mayúscula, 1 número y 1 símbolo).');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(userCredential.user, { displayName: name.trim() });
      await createInitialUserDoc(userCredential.user);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Este correo ya está registrado. Si olvidaste tu contraseña, ve a "Iniciar sesión" y haz clic en "¿Olvidaste tu contraseña?".');
      } else {
        setError('No se pudo crear la cuenta. ' + (err.message || ''));
      }
      setLoading(false);
    }
  };

  const createInitialUserDoc = async (firebaseUser: any) => {
    try {
      const finalRole: Role = (firebaseUser.email === 'jesusduran2504@outlook.com' || firebaseUser.email === 'jearturo250@gmail.com') ? 'admin' : 'student';
      const isSpecialStudent = firebaseUser.email === 'a222200054@unison.mx';

      const chosenSchool = availableSchools.find(s => s.id === selectedSchoolId) || 
        OFFICIAL_STUDENT_SCHOOLS.find(s => s.id === selectedSchoolId);

      const userData: any = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName || name.trim() || 'Estudiante EcoViG',
        role: finalRole,
        schoolId: chosenSchool ? chosenSchool.id : selectedSchoolId,
        schoolName: chosenSchool ? chosenSchool.name : null,
        coins: 500, // Regalo inicial para probar la tienda
        unlockedDecorations: [],
        activeDecorations: {},
        createdAt: Date.now(),
        updatedAt: Date.now(),
        ...(isSpecialStudent ? COMPLETED_STUDENT_PROFILE_DATA : {})
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), userData);
      await refreshUser();
      
      if (finalRole === 'admin') {
        navigate('/dashboard', { replace: true });
      } else {
        // Mandatory step: Teacher linking
        navigate('/link-teacher', { replace: true });
      }
    } catch (e: any) {
      setError("Error al crear el perfil del usuario: " + e.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative font-sans text-white">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-[40px] backdrop-blur-xl relative z-10 shadow-2xl"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl overflow-hidden mb-4 shadow-[0_0_25px_rgba(52,211,153,0.4)] border border-emerald-500/30 flex items-center justify-center bg-black/40">
            <img 
              src="/ecovig-logo.svg" 
              alt="EcoViG" 
              className="w-full h-full object-cover select-none pointer-events-none" 
              referrerPolicy="no-referrer"
            />
          </div>
          <h2 className="text-3xl font-light text-center text-white mb-2">Crear Cuenta</h2>
          <p className="text-emerald-400 text-sm font-medium">Únete a la iniciativa EcoViG</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-sm mb-6 text-center">
            {error}
          </div>
        )}

        <div>
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                  placeholder="Nombre completo"
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Building2 className="h-5 w-5 text-slate-400" />
                </div>
                <select
                  required
                  value={selectedSchoolId}
                  onChange={(e) => setSelectedSchoolId(e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 rounded-2xl bg-[#0e1724] border text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all cursor-pointer text-sm ${
                    !selectedSchoolId ? 'border-amber-400/40 text-amber-200' : 'border-white/20'
                  }`}
                >
                  <option value="" className="bg-[#0b131e] text-slate-400">Selecciona tu escuela (obligatorio) *</option>
                  {availableSchools.map(sch => (
                    <option key={sch.id} value={sch.id} className="bg-[#0b131e] text-white">
                      {sch.name} {sch.educationLevel ? `(${sch.educationLevel})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

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
              <div className="mt-3 grid grid-cols-2 gap-y-2 gap-x-4 ml-1">
                <div className={`flex items-center gap-2 text-xs transition-colors ${password.length >= 8 ? 'text-green-400' : 'text-slate-500'}`}>
                  <div className={`flex items-center justify-center w-4 h-4 rounded-full transition-colors ${password.length >= 8 ? 'bg-green-400/20' : 'bg-white/5'}`}>
                    {password.length >= 8 ? <Check className="w-3 h-3" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />}
                  </div>
                  <span>8 caracteres</span>
                </div>
                <div className={`flex items-center gap-2 text-xs transition-colors ${/[A-Z]/.test(password) ? 'text-green-400' : 'text-slate-500'}`}>
                  <div className={`flex items-center justify-center w-4 h-4 rounded-full transition-colors ${/[A-Z]/.test(password) ? 'bg-green-400/20' : 'bg-white/5'}`}>
                    {/[A-Z]/.test(password) ? <Check className="w-3 h-3" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />}
                  </div>
                  <span>1 mayúscula</span>
                </div>
                <div className={`flex items-center gap-2 text-xs transition-colors ${/[0-9]/.test(password) ? 'text-green-400' : 'text-slate-500'}`}>
                  <div className={`flex items-center justify-center w-4 h-4 rounded-full transition-colors ${/[0-9]/.test(password) ? 'bg-green-400/20' : 'bg-white/5'}`}>
                    {/[0-9]/.test(password) ? <Check className="w-3 h-3" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />}
                  </div>
                  <span>1 número</span>
                </div>
                <div className={`flex items-center gap-2 text-xs transition-colors ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? 'text-green-400' : 'text-slate-500'}`}>
                  <div className={`flex items-center justify-center w-4 h-4 rounded-full transition-colors ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? 'bg-green-400/20' : 'bg-white/5'}`}>
                    {/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? <Check className="w-3 h-3" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />}
                  </div>
                  <span>1 símbolo</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email || !password || !name || !selectedSchoolId}
              className="w-full bg-emerald-500 text-black py-4 rounded-2xl font-bold shadow-[0_0_15px_rgba(16,185,129,0.5)] hover:bg-emerald-400 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </form>
          <p className="text-center text-sm text-slate-400 mt-8">
            ¿Ya tienes cuenta? <Link to="/login" className="text-emerald-400 font-semibold hover:underline">Inicia sesión</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
