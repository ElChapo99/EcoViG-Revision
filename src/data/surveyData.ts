import { Droplets, Zap, Leaf, Heart, Scale, Sparkles, Shield, Compass, Recycle, Award, Gift, BookOpen, Users } from 'lucide-react';

export type SurveyCategory = 'Conducta Pro-Ambiental' | 'Austeridad' | 'Altruismo' | 'Equidad';

export type SurveyOption = 'Nunca' | 'Casi nunca' | 'Casi siempre' | 'Siempre';

export const SURVEY_OPTIONS: SurveyOption[] = ['Nunca', 'Casi nunca', 'Casi siempre', 'Siempre'];

export interface SurveyQuestion {
  id: string;
  number: number;
  category: SurveyCategory;
  text: string;
  reverseScoring: boolean;
}

export const TOTAL_SURVEY_QUESTIONS = 21;
export const MIN_SURVEY_TOTAL_SCORE = 2100;
export const MAX_SURVEY_TOTAL_SCORE = 8400;

export const CATEGORIES_CONFIG: Record<SurveyCategory, {
  name: SurveyCategory;
  icon: string;
  color: string;
  borderColor: string;
  bgLight: string;
  description: string;
  maxScore: number;
  questionsCount: number;
}> = {
  'Conducta Pro-Ambiental': {
    name: 'Conducta Pro-Ambiental',
    icon: '🌱',
    color: 'text-emerald-400',
    borderColor: 'border-emerald-500/30',
    bgLight: 'bg-emerald-500/10',
    description: 'Cuidado de recursos naturales, energía, agua y respeto por la biodiversidad.',
    maxScore: 2000, // 5 questions * 400
    questionsCount: 5,
  },
  'Austeridad': {
    name: 'Austeridad',
    icon: '💡',
    color: 'text-amber-400',
    borderColor: 'border-amber-500/30',
    bgLight: 'bg-amber-500/10',
    description: 'Consumo consciente, reutilización, priorización de necesidades sobre deseos.',
    maxScore: 2000, // 5 questions * 400
    questionsCount: 5,
  },
  'Altruismo': {
    name: 'Altruismo',
    icon: '🤝',
    color: 'text-teal-400',
    borderColor: 'border-teal-500/30',
    bgLight: 'bg-teal-500/10',
    description: 'Empatía, solidaridad, ayuda desinteresada y colaboración con la comunidad.',
    maxScore: 2400, // 6 questions * 400
    questionsCount: 6,
  },
  'Equidad': {
    name: 'Equidad',
    icon: '⚖️',
    color: 'text-purple-400',
    borderColor: 'border-purple-500/30',
    bgLight: 'bg-purple-500/10',
    description: 'Justicia social, igualdad de género, inclusión y respeto a todas las opiniones.',
    maxScore: 2000, // 5 questions * 400
    questionsCount: 5,
  }
};

export const SURVEY_QUESTIONS: SurveyQuestion[] = [
  // CATEGORÍA 1: CONDUCTA PRO-AMBIENTAL (5 PREGUNTAS: Q2 - Q6)
  {
    id: 'q2',
    number: 1,
    category: 'Conducta Pro-Ambiental',
    text: 'Apago las luces de las habitaciones que no se están utilizando.',
    reverseScoring: false,
  },
  {
    id: 'q3',
    number: 2,
    category: 'Conducta Pro-Ambiental',
    text: 'Dejo abierta la llave del agua mientras me cepillo los dientes.',
    reverseScoring: true,
  },
  {
    id: 'q4',
    number: 3,
    category: 'Conducta Pro-Ambiental',
    text: 'Me sirvo o pido más comida de la que realmente puedo comer.',
    reverseScoring: true,
  },
  {
    id: 'q5',
    number: 4,
    category: 'Conducta Pro-Ambiental',
    text: 'Cuando hago tareas, aprovecho los materiales que ya tengo antes de utilizar materiales nuevos.',
    reverseScoring: false,
  },
  {
    id: 'q6',
    number: 5,
    category: 'Conducta Pro-Ambiental',
    text: 'Platico con mis amigos o familiares sobre la importancia de cuidar la naturaleza.',
    reverseScoring: false,
  },

  // CATEGORÍA 2: AUSTERIDAD (5 PREGUNTAS: Q7 - Q11)
  {
    id: 'q7',
    number: 6,
    category: 'Austeridad',
    text: 'Utilizo ropa de temporadas anteriores cuando todavía está en buen estado.',
    reverseScoring: false,
  },
  {
    id: 'q8',
    number: 7,
    category: 'Austeridad',
    text: 'Compro zapatos o tenis nuevos solamente para tener más opciones para combinar mi ropa.',
    reverseScoring: true,
  },
  {
    id: 'q9',
    number: 8,
    category: 'Austeridad',
    text: 'Gasto mi dinero en juegos, juguetes u otros artículos que no necesito.',
    reverseScoring: true,
  },
  {
    id: 'q10',
    number: 9,
    category: 'Austeridad',
    text: 'Prefiero comer en casa en lugar de comprar comida fuera cuando tengo esa opción.',
    reverseScoring: false,
  },
  {
    id: 'q11',
    number: 10,
    category: 'Austeridad',
    text: 'Prefiero caminar o utilizar bicicleta para trasladarme a lugares cercanos cuando es seguro hacerlo.',
    reverseScoring: false,
  },

  // CATEGORÍA 3: ALTRUISMO (6 PREGUNTAS: Q12 - Q17)
  {
    id: 'q12',
    number: 11,
    category: 'Altruismo',
    text: 'Regalo ropa o juguetes que ya no utilizo pero que todavía están en buen estado.',
    reverseScoring: false,
  },
  {
    id: 'q13',
    number: 12,
    category: 'Altruismo',
    text: 'Cuando es seguro hacerlo, ayudo a una persona mayor o a una persona con discapacidad que necesita apoyo para cruzar la calle.',
    reverseScoring: false,
  },
  {
    id: 'q14',
    number: 13,
    category: 'Altruismo',
    text: 'Cuando una persona necesita encontrar una dirección, trato de orientarla si puedo hacerlo de manera segura.',
    reverseScoring: false,
  },
  {
    id: 'q15',
    number: 14,
    category: 'Altruismo',
    text: 'Cuando encuentro a una persona en situación de vulnerabilidad, estoy dispuesto(a) a compartir alguna ayuda dentro de mis posibilidades.',
    reverseScoring: false,
  },
  {
    id: 'q16',
    number: 15,
    category: 'Altruismo',
    text: 'Cuando escucho que se necesita sangre, considero importante donar cuando cumplo con los requisitos y puedo hacerlo de manera segura.',
    reverseScoring: false,
  },
  {
    id: 'q17',
    number: 16,
    category: 'Altruismo',
    text: 'Colaboro con mis compañeros de escuela cuando necesitan ayuda para comprender una tarea o un tema.',
    reverseScoring: false,
  },

  // CATEGORÍA 4: EQUIDAD (5 PREGUNTAS: Q18 - Q22)
  {
    id: 'q18',
    number: 17,
    category: 'Equidad',
    text: 'Considero que las decisiones sobre los gastos del hogar deben tomarse de manera justa entre esposas y esposos.',
    reverseScoring: false,
  },
  {
    id: 'q19',
    number: 18,
    category: 'Equidad',
    text: 'Considero que hombres y mujeres deben compartir de manera justa las responsabilidades de limpieza y cuidado del hogar.',
    reverseScoring: false,
  },
  {
    id: 'q20',
    number: 19,
    category: 'Equidad',
    text: 'Considero que las personas de distintos orígenes étnicos deben tener las mismas oportunidades para participar y desarrollarse en los negocios.',
    reverseScoring: false,
  },
  {
    id: 'q21',
    number: 20,
    category: 'Equidad',
    text: 'Considero que las personas de diferentes niveles económicos deben tener las mismas oportunidades para acceder a espacios y servicios de calidad.',
    reverseScoring: false,
  },
  {
    id: 'q22',
    number: 21,
    category: 'Equidad',
    text: 'Considero que las opiniones de los estudiantes deben ser escuchadas y tomadas en cuenta, al igual que las de los docentes, según la situación.',
    reverseScoring: false,
  }
];

export interface SurveyOptionConfig {
  value: SurveyOption;
  label: string;
  directScore: number;
  reverseScore: number;
}

/**
 * 🔒 CONFIGURABLE SURVEY OPTIONS & NUMERICAL WEIGHTS
 * 
 * Direct questions:
 * - Nunca = 100
 * - Casi nunca = 200
 * - Casi siempre = 300
 * - Siempre = 400
 * 
 * Inverted (Reverse scoring) questions:
 * - Nunca = 400
 * - Casi nunca = 300
 * - Casi siempre = 200
 * - Siempre = 100
 * 
 * 🔒 ZERO-VALUE NON-EVALUABLE ELEMENTS:
 * - Reflexiones pedagógicas: EXACTLY 0 socioenvironmental points.
 * - Notas descriptivas: EXACTLY 0 socioenvironmental points.
 * - Fotografías y evidencias en tiempo real: EXACTLY 0 socioenvironmental points.
 */
export const SURVEY_OPTIONS_CONFIG: SurveyOptionConfig[] = [
  { value: 'Nunca', label: 'Nunca', directScore: 100, reverseScore: 400 },
  { value: 'Casi nunca', label: 'Casi nunca', directScore: 200, reverseScore: 300 },
  { value: 'Casi siempre', label: 'Casi siempre', directScore: 300, reverseScore: 200 },
  { value: 'Siempre', label: 'Siempre', directScore: 400, reverseScore: 100 },
];

export function calculateScore(option: SurveyOption, reverseScoring: boolean): number {
  const opt = SURVEY_OPTIONS_CONFIG.find(o => o.value === option);
  if (!opt) return reverseScoring ? 400 : 100;
  return reverseScoring ? opt.reverseScore : opt.directScore;
}

// -------------------------------------------------------------
// PRIMARY ACTIVITIES (3 PER CATEGORY = 12 MAIN MISSIONS)
// -------------------------------------------------------------
export interface MainMissionActivity {
  id: string;
  title: string;
  subtitle: string;
  type: 'challenge' | 'mission' | 'interactive';
  category: SurveyCategory;
  associatedQuestionIds: string[];
  associatedQuestionsText: string[];
  description: string;
  instructions: string[];
  durationDays: number;
  durationText: string;
  xpReward: number;
  pointsReward: number;
  badge?: string;
  icon: string;
  evidenceRequirements: {
    type: 'photos' | 'interactive_game' | 'decision_game' | 'video_context';
    minPhotos?: number;
    maxPhotos?: number;
    requiresDailyEvidence?: boolean;
    promptText?: string;
    reflectionQuestion?: string;
    fillSentencePrompt?: string;
  };
  interactiveGameType?: 'budget_game' | 'opportunities_game' | 'voice_game';
}

export const MAIN_ACTIVITIES: MainMissionActivity[] = [
  // --- CONDUCTA PRO-AMBIENTAL ---
  {
    id: 'act_env_1',
    title: 'Reto: Cierra la llave',
    subtitle: 'Ahorro consciente de agua en el cepillado y lavado',
    type: 'challenge',
    category: 'Conducta Pro-Ambiental',
    associatedQuestionIds: ['q3'],
    associatedQuestionsText: ['Dejo abierta la llave del agua mientras me cepillo los dientes.'],
    description: 'Durante 2 días, cepíllate los dientes cerrando la llave mientras te cepillas y abriéndola únicamente para enjuagarte. También puedes extenderlo al enjabonarte las manos.',
    instructions: [
      'Practica durante 2 días cerrar el grifo mientras cepillas tus dientes.',
      'Abre la llave únicamente para enjuagarte.',
      'Toma 1 fotografía en tiempo real por cada uno de los 2 días mostrando el grifo cerrado.',
      'Al completar los 2 días, responde la pregunta de reflexión final.'
    ],
    durationDays: 2,
    durationText: '2 días',
    xpReward: 150,
    pointsReward: 50,
    icon: '💧',
    evidenceRequirements: {
      type: 'photos',
      minPhotos: 2,
      maxPhotos: 2,
      requiresDailyEvidence: true,
      promptText: 'Captura 1 fotografía en tiempo real cada día (2 días en total) con el grifo cerrado.',
      reflectionQuestion: '¿Qué cambio fue más fácil o difícil de mantener durante estos 2 días?'
    }
  },
  {
    id: 'act_env_2',
    title: 'Misión: Cero desperdicio',
    subtitle: 'Aprovechamiento integral de alimentos y materiales',
    type: 'mission',
    category: 'Conducta Pro-Ambiental',
    associatedQuestionIds: ['q4', 'q5'],
    associatedQuestionsText: [
      'Me sirvo o pido más comida de la que realmente puedo comer.',
      'Cuando hago tareas, aprovecho los materiales que ya tengo antes de utilizar materiales nuevos.'
    ],
    description: 'Durante 4 días, identifica oportunidades para utilizar solamente lo necesario: sírvete porciones justas de comida y reutiliza hojas, cartón y útiles escolares sobrantes.',
    instructions: [
      'Realiza acciones de aprovechamiento y cero desperdicio durante los 4 días.',
      'Registra 1 fotografía en tiempo real por cada uno de los 4 días mostrando tus acciones diarias.',
      'Completa tu frase de compromiso diario y final.'
    ],
    durationDays: 4,
    durationText: '4 días',
    xpReward: 160,
    pointsReward: 50,
    icon: '♻️',
    evidenceRequirements: {
      type: 'photos',
      minPhotos: 4,
      maxPhotos: 4,
      requiresDailyEvidence: true,
      promptText: 'Captura 1 foto diaria en tiempo real (4 días) evitando el desperdicio de comida o materiales.',
      fillSentencePrompt: 'Hoy evité desperdiciar '
    }
  },
  {
    id: 'act_env_3',
    title: 'Reto: Influencer verde',
    subtitle: 'Comunica y contagia hábitos sostenibles a tu entorno',
    type: 'challenge',
    category: 'Conducta Pro-Ambiental',
    associatedQuestionIds: ['q2', 'q6'],
    associatedQuestionsText: [
      'Apago las luces de las habitaciones que no se están utilizando.',
      'Platico con mis amigos o familiares sobre la importancia de cuidar la naturaleza.'
    ],
    description: 'Elige una conducta ambiental (como apagar luces o cuidar plantas) durante 2 días y comparte el reto con al menos dos amigos o familiares.',
    instructions: [
      'Practica una conducta ambiental positiva durante 2 días.',
      'Involucra o platica con al menos 2 personas de tu familia o círculo cercano.',
      'Registra 1 fotografía en tiempo real en cada uno de los 2 días de tu reto.',
      'Comparte la retroalimentación recibida.'
    ],
    durationDays: 2,
    durationText: '2 días',
    xpReward: 180,
    pointsReward: 60,
    icon: '📢',
    evidenceRequirements: {
      type: 'photos',
      minPhotos: 2,
      maxPhotos: 2,
      requiresDailyEvidence: true,
      promptText: '1 foto diaria en tiempo real durante los 2 días compartiendo o practicando el hábito verde.',
      reflectionQuestion: '¿Qué recomendación ambiental compartiste y qué respuesta recibiste de tus conocidos?'
    }
  },

  // --- AUSTERIDAD ---
  {
    id: 'act_aus_1',
    title: 'Reto: Dale otra vida',
    subtitle: 'Combina y reutiliza ropa y accesorios existentes',
    type: 'challenge',
    category: 'Austeridad',
    associatedQuestionIds: ['q7', 'q8'],
    associatedQuestionsText: [
      'Utilizo ropa de temporadas anteriores cuando todavía está en buen estado.',
      'Compro zapatos o tenis nuevos solamente para tener más opciones para combinar mi ropa.'
    ],
    description: 'Durante 4 días, identifica prendas, calzado o accesorios que ya tienes y crea combinaciones con estilo sin comprar nada nuevo.',
    instructions: [
      'Revisa tu armario e identifica prendas en buen estado que no hayas usado recientemente.',
      'Arma combinaciones diferentes para salir o asistir a clases sin adquirir nada nuevo.',
      'Registra 1 fotografía en tiempo real por cada uno de los 4 días (sin rostros).',
      'Responde qué descubriste al reutilizar tu ropa.'
    ],
    durationDays: 4,
    durationText: '4 días',
    xpReward: 150,
    pointsReward: 50,
    icon: '👕',
    evidenceRequirements: {
      type: 'photos',
      minPhotos: 4,
      maxPhotos: 4,
      requiresDailyEvidence: true,
      promptText: '1 foto diaria en tiempo real (4 días) de outfits/combinaciones realizadas con prendas que ya tenías.',
      reflectionQuestion: '¿Qué descubriste que podías seguir utilizando sin comprar algo nuevo?'
    }
  },
  {
    id: 'act_aus_2',
    title: 'Misión: ¿Lo quiero o lo necesito?',
    subtitle: 'Simulador interactivo de presupuesto inteligente',
    type: 'interactive',
    category: 'Austeridad',
    associatedQuestionIds: ['q8', 'q9'],
    associatedQuestionsText: [
      'Gasto mi dinero en juegos, juguetes u otros artículos que no necesito.',
      'Compro zapatos o tenis nuevos solamente para tener más opciones para combinar mi ropa.'
    ],
    description: 'Administra un presupuesto ficticio de $500 y decide con criterio qué comprar de inmediato, qué posponer y qué compra evitar por completo.',
    instructions: [
      'Inicia el simulador interactivo con tu presupuesto de $500.',
      'Evalúa las opciones: tenis nuevos, videojuegos, alimentos, audífonos, salida y útiles escolares.',
      'Toma decisiones reflexivas basadas en necesidades prioritarias vs deseos pasajeros.',
      'El sistema registrará automáticamente tu decisión y saldo preservado.'
    ],
    durationDays: 1,
    durationText: '1 día (Sesión Interactiva)',
    xpReward: 160,
    pointsReward: 50,
    icon: '💰',
    interactiveGameType: 'budget_game',
    evidenceRequirements: {
      type: 'decision_game',
      reflectionQuestion: '¿Cuál compra decidiste evitar y por qué?'
    }
  },
  {
    id: 'act_aus_3',
    title: 'Reto: Muévete y consume local',
    subtitle: 'Movilidad activa y preparación de alimentos caseros',
    type: 'challenge',
    category: 'Austeridad',
    associatedQuestionIds: ['q10', 'q11'],
    associatedQuestionsText: [
      'Prefiero comer en casa en lugar de comprar comida fuera cuando tengo esa opción.',
      'Prefiero caminar o utilizar bicicleta para trasladarme a lugares cercanos cuando es seguro hacerlo.'
    ],
    description: 'Durante 2 días realiza acciones de consumo austero: caminar, usar bicicleta, comer en casa, llevar agua o alimentos preparados.',
    instructions: [
      'Realiza acciones de ahorro en 2 días continuos.',
      'Ejemplos: llevar tu botella reutilizable, refrigerio desde casa, o caminar/usar bici.',
      'Captura 1 fotografía en tiempo real en cada uno de los 2 días.',
      'Responde qué recursos evitaste consumir o gastar.'
    ],
    durationDays: 2,
    durationText: '2 días',
    xpReward: 170,
    pointsReward: 50,
    icon: '🚲',
    evidenceRequirements: {
      type: 'photos',
      minPhotos: 2,
      maxPhotos: 2,
      requiresDailyEvidence: true,
      promptText: '1 foto diaria en tiempo real (2 días) de consumo austero (termo, comida casera, caminata/bici).',
      reflectionQuestion: '¿Qué recursos económicos o materiales evitaste consumir o gastar?'
    }
  },

  // --- ALTRUISMO ---
  {
    id: 'act_alt_1',
    title: 'Reto: Lo que ya no uso puede ayudar',
    subtitle: 'Donación responsable de ropa, libros o juguetes',
    type: 'challenge',
    category: 'Altruismo',
    associatedQuestionIds: ['q12'],
    associatedQuestionsText: [
      'Regalo ropa o juguetes que ya no utilizo pero que todavía están en buen estado.'
    ],
    description: 'Identifica ropa o juguetes en buen estado que ya no utilices. A lo largo del reto de 4 días, selecciona artículos, límpialos, prepáralos y destínalos a donación.',
    instructions: [
      'Selecciona artículos en buenas condiciones que ya no uses.',
      'Límpialos y prepáralos adecuadamente a lo largo de los días.',
      'Registra 1 fotografía diaria en tiempo real durante los 4 días mostrando el avance del proceso de donación.',
      'Responde sobre su utilidad para alguien más.'
    ],
    durationDays: 4,
    durationText: '4 días',
    xpReward: 180,
    pointsReward: 60,
    icon: '🎁',
    evidenceRequirements: {
      type: 'photos',
      minPhotos: 4,
      maxPhotos: 4,
      requiresDailyEvidence: true,
      promptText: '1 fotografía diaria en tiempo real durante los 4 días de los artículos preparados y clasificados para donación.',
      reflectionQuestion: '¿Por qué elegiste ese objeto y de qué manera puede ser útil para alguien más?'
    }
  },
  {
    id: 'act_alt_2',
    title: 'Misión: Una acción para ayudar',
    subtitle: 'Solidaridad espontánea y apoyo cívico seguro',
    type: 'mission',
    category: 'Altruismo',
    associatedQuestionIds: ['q13', 'q14'],
    associatedQuestionsText: [
      'Cuando es seguro hacerlo, ayudo a una persona mayor o a una persona con discapacidad que necesita apoyo para cruzar la calle.',
      'Cuando una persona necesita encontrar una dirección, trato de orientarla si puedo hacerlo de manera segura.'
    ],
    description: 'Durante 4 días, realiza acciones de ayuda solidaria y segura en tu comunidad (orientar a alguien, ceder el asiento, abrir una puerta, apoyar con una tarea).',
    instructions: [
      'Identifica momentos seguros donde alguien necesite un apoyo cotidiano.',
      'Registra 1 evidencia diaria en tiempo real por cada uno de los 4 días.',
      'No incluyas rostros ni nombres personales para proteger la privacidad.',
      'Responde la reflexión de impacto comunitario.'
    ],
    durationDays: 4,
    durationText: '4 días',
    xpReward: 160,
    pointsReward: 50,
    icon: '🌟',
    evidenceRequirements: {
      type: 'photos',
      minPhotos: 4,
      maxPhotos: 4,
      requiresDailyEvidence: true,
      promptText: '1 evidencia diaria en tiempo real durante los 4 días de acciones solidarias cotidianas.',
      reflectionQuestion: '¿Cómo impactó tu acción en el bienestar de la otra persona y cómo te sentiste tú?'
    }
  },
  {
    id: 'act_alt_3',
    title: 'Reto: Ayudar también es compartir',
    subtitle: 'Aportación solidaria de tiempo, conocimiento o material',
    type: 'challenge',
    category: 'Altruismo',
    associatedQuestionIds: ['q15', 'q16', 'q17'],
    associatedQuestionsText: [
      'Cuando encuentro a una persona en situación de vulnerabilidad, estoy dispuesto(a) a compartir alguna ayuda dentro de mis posibilidades.',
      'Cuando escucho que se necesita sangre, considero importante donar cuando cumplo con los requisitos y puedo hacerlo de manera segura.',
      'Colaboro con mis compañeros de escuela cuando necesitan ayuda para comprender una tarea o un tema.'
    ],
    description: 'Elige una acción solidaria durante 4 días: apoyo escolar a compañeros, participación en campañas escolares o compartir recursos.',
    instructions: [
      'Elige tu modalidad: ayuda académica, colecta o apoyo escolar.',
      'Registra 1 evidencia diaria en tiempo real por cada uno de los 4 días de tu reto.',
      'Responde la pregunta sobre qué aportaste (tiempo, conocimiento u objeto).'
    ],
    durationDays: 4,
    durationText: '4 días',
    xpReward: 170,
    pointsReward: 50,
    icon: '🤝',
    evidenceRequirements: {
      type: 'photos',
      minPhotos: 4,
      maxPhotos: 4,
      requiresDailyEvidence: true,
      promptText: '1 evidencia diaria en tiempo real (4 días) de materiales o sesiones de estudio solidario.',
      reflectionQuestion: '¿Qué aportaste: tiempo, conocimiento, un objeto o apoyo? ¿De qué manera ayudó a otra persona?'
    }
  },

  // --- EQUIDAD ---
  {
    id: 'act_equ_1',
    title: 'Reto: En casa, las tareas son de todos',
    subtitle: 'Corresponsabilidad doméstica libre de estereotipos de género',
    type: 'challenge',
    category: 'Equidad',
    associatedQuestionIds: ['q18', 'q19'],
    associatedQuestionsText: [
      'Considero que las decisiones sobre los gastos del hogar deben tomarse de manera justa entre esposas y esposos.',
      'Considero que hombres y mujeres deben compartir de manera justa las responsabilidades de limpieza y cuidado del hogar.'
    ],
    description: 'Durante 4 días, participa activamente en tareas domésticas del hogar (lavar platos, barrer, cocinar, ordenar) promoviendo la equidad sin roles de género.',
    instructions: [
      'Observa cómo se distribuyen las labores en tu hogar.',
      'Participa proactivamente cada día en tareas de limpieza o preparación.',
      'Registra 1 fotografía en tiempo real en cada uno de los 4 días (del área o actividad, sin personas).',
      'Completa la frase de reflexión sobre la colaboración familiar equitativa.'
    ],
    durationDays: 4,
    durationText: '4 días',
    xpReward: 160,
    pointsReward: 50,
    icon: '🏠',
    evidenceRequirements: {
      type: 'photos',
      minPhotos: 4,
      maxPhotos: 4,
      requiresDailyEvidence: true,
      promptText: '1 foto diaria en tiempo real por cada uno de los 4 días de las tareas domésticas colaborativas.',
      fillSentencePrompt: 'En casa todos podemos colaborar en '
    }
  },
  {
    id: 'act_equ_2',
    title: 'Misión: Mismas oportunidades',
    subtitle: 'Simulador interactivo de selección justa e inclusiva',
    type: 'interactive',
    category: 'Equidad',
    associatedQuestionIds: ['q20', 'q21'],
    associatedQuestionsText: [
      'Considero que las personas de distintos orígenes étnicos deben tener las mismas oportunidades para participar y desarrollarse en los negocios.',
      'Considero que las personas de diferentes niveles económicos deben tener las mismas oportunidades para acceder a espacios y servicios de calidad.'
    ],
    description: 'Analiza 3 casos breves y toma decisiones de selección y asignación de oportunidades basándote en mérito, talento y capacidades pertinentes.',
    instructions: [
      'Ingresa al simulador de toma de decisiones equitativas.',
      'Evalúa 3 escenarios escolares y comunitarios donde diferentes personas postulan.',
      'Elige siempre considerando competencias y justicia, sin sesgos económicos u orígenes étnicos.',
      'Reflexiona sobre qué criterios deben tomarse en cuenta.'
    ],
    durationDays: 1,
    durationText: '1 día (Sesión Interactiva)',
    xpReward: 170,
    pointsReward: 50,
    icon: '⚖️',
    interactiveGameType: 'opportunities_game',
    evidenceRequirements: {
      type: 'decision_game',
      reflectionQuestion: '¿Qué características sí deberían considerarse para dar una oportunidad a una persona y cuáles no?'
    }
  },
  {
    id: 'act_equ_3',
    title: 'Reto: Tú decides, ¿quién tiene voz?',
    subtitle: 'Juego de deliberación escolar y democracia participativa',
    type: 'interactive',
    category: 'Equidad',
    associatedQuestionIds: ['q22'],
    associatedQuestionsText: [
      'Considero que las opiniones de los estudiantes deben ser escuchadas y tomadas en cuenta, al igual que las de los docentes, según la situación.'
    ],
    description: 'Participa en 5 situaciones de convivencia escolar y determina cómo equilibrar las voces de docentes y alumnos para enriquecer las decisiones grupales.',
    instructions: [
      'Analiza 5 situaciones escolares comunes.',
      'Decide quién debe participar en cada situación: Profesor, Estudiantes o Ambos.',
      'Recibe retroalimentación formativa sobre el valor del diálogo respetuoso.',
      'Al completar obtén la insignia especial "Voz equitativa".'
    ],
    durationDays: 1,
    durationText: '1 día (Sesión Interactiva)',
    xpReward: 200,
    pointsReward: 60,
    badge: 'Voz equitativa',
    icon: '🗣️',
    interactiveGameType: 'voice_game',
    evidenceRequirements: {
      type: 'decision_game',
      reflectionQuestion: 'Un estudiante tiene una propuesta para mejorar una actividad de clase. ¿Qué debería ocurrir?'
    }
  }
];

// -------------------------------------------------------------
// 10 COMPLEMENTARY ACTIVITIES (SECONDARY MISSIONS)
// -------------------------------------------------------------
export interface ComplementaryActivity {
  id: string;
  number: number;
  title: string;
  category: 'Complementaria';
  icon: string;
  pointsReward: number;
  bonusPoints?: number;
  badge?: string;
  description: string;
  mechanics: string;
  durationDays: number;
  durationText: string;
  evidenceType: 'observation' | 'sorting_game' | 'before_after_photo' | 'waste_hunt' | 'minigame' | 'secret_action' | 'interactive_scenarios' | 'chain_action' | 'puzzle_builder' | 'power_pledge';
}

export const COMPLEMENTARY_ACTIVITIES: ComplementaryActivity[] = [
  {
    id: 'comp_1',
    number: 1,
    title: 'Detective ecológico',
    category: 'Complementaria',
    icon: '🔍',
    pointsReward: 10,
    bonusPoints: 5,
    durationDays: 1,
    durationText: '1 día (Observación)',
    description: 'Observación e identificación de conductas y fallas ambientales en tu entorno escolar o del hogar.',
    mechanics: '+10 puntos si identificas al menos el 80% de los problemas ambientales en la escena. +5 adicionales si propones una solución para corregir uno.',
    evidenceType: 'observation'
  },
  {
    id: 'comp_2',
    number: 2,
    title: '¿En qué bote va?',
    category: 'Complementaria',
    icon: '🗑️',
    pointsReward: 10,
    bonusPoints: 5,
    durationDays: 1,
    durationText: '1 día (Minijuego)',
    description: 'Juego rápido de clasificación de residuos orgánicos, inorgánicos reciclables y no reciclables.',
    mechanics: '+10 puntos por completar la clasificación. Bonificación por respuestas consecutivas correctas sin errores.',
    evidenceType: 'sorting_game'
  },
  {
    id: 'comp_3',
    number: 3,
    title: 'Dale una segunda vida',
    category: 'Complementaria',
    icon: '🎨',
    pointsReward: 25,
    durationDays: 2,
    durationText: '2 días (Transformación)',
    description: 'Transforma creativamente un objeto que normalmente se desecharía (envase, caja, frasco) en algo útil o decorativo.',
    mechanics: 'Sube fotografía del antes y después del objeto transformado. +25 puntos.',
    evidenceType: 'before_after_photo'
  },
  {
    id: 'comp_4',
    number: 4,
    title: 'Cazador de desperdicios',
    category: 'Complementaria',
    icon: '🕵️‍♂️',
    pointsReward: 10,
    durationDays: 2,
    durationText: '2 días (Detección)',
    description: 'Encuentra 3 situaciones reales de desperdicio de agua, energía o materiales y describe una solución práctica para cada una.',
    mechanics: 'Registra las 3 situaciones y sus soluciones propuestas. +10 puntos.',
    evidenceType: 'waste_hunt'
  },
  {
    id: 'comp_5',
    number: 5,
    title: 'Ecoescape: salva el planeta',
    category: 'Complementaria',
    icon: '⏳',
    pointsReward: 15,
    badge: 'Ecoescape Maestro',
    durationDays: 1,
    durationText: '1 día (Desafío Contrarreloj)',
    description: 'Minijuego con 5 desafíos consecutivos contrarreloj para resolver dilemas de emergencia ambiental.',
    mechanics: '+15 puntos por completar. Insignia especial "Ecoescape Maestro" si lo consigues sin errores.',
    evidenceType: 'minigame'
  },
  {
    id: 'comp_6',
    number: 6,
    title: 'Misión: ayuda secreta',
    category: 'Complementaria',
    icon: '🤫',
    pointsReward: 10,
    durationDays: 1,
    durationText: '1 día (Acción Solidaria)',
    description: 'Realiza una acción positiva de ayuda hacia alguien de tu entorno sin que nadie sepa que fuiste tú ni esperar recompensa.',
    mechanics: 'Registra en tu diario qué hiciste de manera anónima. +10 puntos.',
    evidenceType: 'secret_action'
  },
  {
    id: 'comp_7',
    number: 7,
    title: '¿Qué harías tú?',
    category: 'Complementaria',
    icon: '🤔',
    pointsReward: 10,
    badge: 'Decisiones que ayudan',
    durationDays: 1,
    durationText: '1 día (Empatía Social)',
    description: 'Escenarios sociales interactivos donde analizas dilemas éticos y seleccionas respuestas con empatía.',
    mechanics: '+10 puntos al completar todos los escenarios interactivos. Desbloquea la insignia "Decisiones que ayudan".',
    evidenceType: 'interactive_scenarios'
  },
  {
    id: 'comp_8',
    number: 8,
    title: 'Cadena de favores',
    category: 'Complementaria',
    icon: '🔗',
    pointsReward: 15,
    durationDays: 2,
    durationText: '2 días (Cadena Solidaria)',
    description: 'Realiza una acción positiva por otra persona e invítala a pasar el favor a alguien más.',
    mechanics: 'Registra la acción inicial y la invitación a continuar la cadena solidaria. +15 puntos.',
    evidenceType: 'chain_action'
  },
  {
    id: 'comp_9',
    number: 9,
    title: 'Construye la solución',
    category: 'Complementaria',
    icon: '🧩',
    pointsReward: 10,
    durationDays: 1,
    durationText: '1 día (Puzzle Integral)',
    description: 'Puzzle interactivo para resolver problemas socioambientales combinando piezas de tecnología, comunidad y naturaleza.',
    mechanics: 'Resuelve el puzzle conectando los 3 pilares del problema. +10 puntos.',
    evidenceType: 'puzzle_builder'
  },
  {
    id: 'comp_10',
    number: 10,
    title: 'Mi superpoder sostenible',
    category: 'Complementaria',
    icon: '⚡',
    pointsReward: 20,
    durationDays: 3,
    durationText: '3 días (Compromiso Activo)',
    description: 'Elige tu superpoder: Ahorrador de agua, Guardián de energía, Maestro de reutilización o Agente solidario y mantén la misión por 3 días.',
    mechanics: 'Mantén el hábito durante 3 días y obtén +20 puntos y la insignia de tu superpoder seleccionado.',
    evidenceType: 'power_pledge'
  }
];

export function getRecommendedActivitiesForSurvey(
  categoryScores: Record<SurveyCategory, number>,
  answers: Record<string, { score: number; questionId: string }>
): string[] {
  const recommendedIds: string[] = [];

  // Check which questions had low score (< 300) and prioritize their associated activities
  MAIN_ACTIVITIES.forEach(activity => {
    const hasLowScoreQuestion = activity.associatedQuestionIds.some(qId => {
      const ans = answers[qId];
      return ans && ans.score <= 200;
    });

    if (hasLowScoreQuestion && !recommendedIds.includes(activity.id)) {
      recommendedIds.push(activity.id);
    }
  });

  // Ensure at least 1 activity per category is present in recommendations
  const categories: SurveyCategory[] = ['Conducta Pro-Ambiental', 'Austeridad', 'Altruismo', 'Equidad'];
  categories.forEach(cat => {
    const catActivities = MAIN_ACTIVITIES.filter(a => a.category === cat);
    const alreadyIncluded = catActivities.some(a => recommendedIds.includes(a.id));
    if (!alreadyIncluded && catActivities.length > 0) {
      // Find lowest scored question's activity or pick the first one
      recommendedIds.push(catActivities[0].id);
    }
  });

  return recommendedIds;
}

/**
 * 🔒 NORMALIZADOR PEDAGÓGICO DE RESULTADOS DE ENCUESTA (21 PREGUNTAS OFICIALES)
 * 
 * Permite que cualquier evaluación histórica o actual sea procesada y comparada
 * de forma consistente sobre las 21 preguntas oficiales vigentes.
 * 
 * - Si existen respuestas crudas (`answers`), recalcula exactamente sobre las 21 preguntas (excluyendo q1).
 * - Si es un registro legacy donde solo existen totales agregados, mapea con seguridad las escalas 
 *   antiguas (600-2400 / 2200-8800) a las escalas oficiales vigentes (500-2000 / 2100-8400) sin alterar la base de datos.
 */
export interface ComparableSurveyResult {
  totalScore: number;
  categoryScores: Record<SurveyCategory, number>;
  answers: Record<string, any>;
  completedAt?: number;
  normalizedPct: number;
  isLegacy: boolean;
  isDirectlyComparable: boolean;
  dimensionComparable: Record<SurveyCategory, boolean>;
  totalComparable: boolean;
  legacyNotice?: string;
}

/**
 * 🔒 NORMALIZADOR PEDAGÓGICO DE RESULTADOS DE ENCUESTA (21 PREGUNTAS OFICIALES)
 * 
 * Permite que cualquier evaluación histórica o actual sea procesada y comparada
 * de forma matemáticamente consistente sobre las 21 preguntas oficiales vigentes.
 * 
 * 1. REGISTROS CON RESPUESTAS CRUDAS (q1-q22 o q2-q22):
 *    - Recalcula exactamente sobre las 21 preguntas vigentes (q2 a q22).
 *    - Excluye q1 del cálculo sin mutar el documento histórico almacenado en Firestore.
 *    - Marca el resultado como 100% comparable directamente.
 * 
 * 2. REGISTROS HISTÓRICOS SIN RESPUESTAS CRUDAS (solo totales agregados antiguos):
 *    - NO realiza interpolación matemática inventada para Conducta Pro-Ambiental ni para el Total.
 *    - Conserva intactos los valores históricos originales almacenados.
 *    - Marca Conducta Pro-Ambiental y el Total como NO directamente comparables.
 *    - Mantiene Austeridad, Altruismo y Equidad como comparables (sus preguntas no cambiaron).
 */
export function getComparableSurveyResults(record: any): ComparableSurveyResult {
  if (!record) {
    return {
      totalScore: 0,
      categoryScores: {
        'Conducta Pro-Ambiental': 0,
        'Austeridad': 0,
        'Altruismo': 0,
        'Equidad': 0,
      },
      answers: {},
      normalizedPct: 0,
      isLegacy: false,
      isDirectlyComparable: false,
      dimensionComparable: {
        'Conducta Pro-Ambiental': false,
        'Austeridad': false,
        'Altruismo': false,
        'Equidad': false,
      },
      totalComparable: false,
    };
  }

  const rawAnswers = record.answers || {};
  const hasRawAnswers = Object.keys(rawAnswers).length > 0;

  if (hasRawAnswers) {
    const filteredAnswers: Record<string, any> = {};
    const categoryScores: Record<SurveyCategory, number> = {
      'Conducta Pro-Ambiental': 0,
      'Austeridad': 0,
      'Altruismo': 0,
      'Equidad': 0,
    };
    let totalScore = 0;

    for (const q of SURVEY_QUESTIONS) {
      const ans = rawAnswers[q.id];
      if (ans) {
        let score = 0;
        let selectedOption: SurveyOption = 'Nunca';
        if (typeof ans === 'object') {
          selectedOption = ans.selectedOption || ans.selected || 'Nunca';
          score = typeof ans.score === 'number' ? ans.score : calculateScore(selectedOption, q.reverseScoring);
        } else if (typeof ans === 'string') {
          selectedOption = (SURVEY_OPTIONS as readonly string[]).includes(ans) ? (ans as SurveyOption) : 'Nunca';
          score = calculateScore(selectedOption, q.reverseScoring);
        }
        filteredAnswers[q.id] = {
          questionId: q.id,
          category: q.category,
          questionText: q.text,
          selectedOption,
          score,
          reverseScoring: q.reverseScoring,
        };
        categoryScores[q.category] += score;
        totalScore += score;
      }
    }

    const answeredCount = Object.keys(filteredAnswers).length;
    const isComplete = answeredCount === TOTAL_SURVEY_QUESTIONS;
    const normalizedPct = Math.max(0, Math.min(100, Math.round(((totalScore - MIN_SURVEY_TOTAL_SCORE) / (MAX_SURVEY_TOTAL_SCORE - MIN_SURVEY_TOTAL_SCORE)) * 100)));
    const isLegacy = Boolean(rawAnswers.q1 || Object.keys(rawAnswers).length > 21);

    return {
      totalScore,
      categoryScores,
      answers: filteredAnswers,
      completedAt: record.completedAt,
      normalizedPct,
      isLegacy,
      isDirectlyComparable: isComplete,
      dimensionComparable: {
        'Conducta Pro-Ambiental': isComplete,
        'Austeridad': isComplete,
        'Altruismo': isComplete,
        'Equidad': isComplete,
      },
      totalComparable: isComplete,
    };
  }

  // Si no hay respuestas crudas, conservamos los valores históricos originales SIN interpolación
  const origCatScores = record.categoryScores || {};
  const envScore = origCatScores['Conducta Pro-Ambiental'] || 0;
  const ausScore = origCatScores['Austeridad'] || 0;
  const altScore = origCatScores['Altruismo'] || 0;
  const equScore = origCatScores['Equidad'] || 0;
  const totalScore = record.totalScore || (envScore + ausScore + altScore + equScore);

  const isLegacy = envScore > 2000 || totalScore > MAX_SURVEY_TOTAL_SCORE;

  const categoryScores: Record<SurveyCategory, number> = {
    'Conducta Pro-Ambiental': envScore, // Se preserva el valor histórico intacto sin interpolar
    'Austeridad': ausScore,
    'Altruismo': altScore,
    'Equidad': equScore,
  };

  return {
    totalScore, // Se preserva el total histórico intacto sin interpolar
    categoryScores,
    answers: {},
    completedAt: record.completedAt,
    normalizedPct: 0,
    isLegacy,
    isDirectlyComparable: false,
    dimensionComparable: {
      'Conducta Pro-Ambiental': false, // No comparable porque no se conoce el aporte de q1
      'Austeridad': ausScore > 0,      // Preguntas no cambiaron (5 preguntas)
      'Altruismo': altScore > 0,        // Preguntas no cambiaron (6 preguntas)
      'Equidad': equScore > 0,          // Preguntas no cambiaron (5 preguntas)
    },
    totalComparable: false,            // No comparable porque incluye Conducta Pro-Ambiental
    legacyNotice: 'Resultado histórico sin respuestas individuales por pregunta. Conducta Pro-Ambiental y el total no son directamente comparables con la versión actual.',
  };
}
