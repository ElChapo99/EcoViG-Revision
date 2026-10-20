import { 
  MAIN_ACTIVITIES, 
  COMPLEMENTARY_ACTIVITIES, 
  MainMissionActivity, 
  ComplementaryActivity, 
  SurveyCategory,
  CATEGORIES_CONFIG
} from '../data/surveyData';

export type ActivityModalType = 
  | 'survey' 
  | 'evidence' 
  | 'budget' 
  | 'opportunities' 
  | 'voice' 
  | 'complementary';

export interface ActivityInstructionsMeta {
  title: string;
  subtitle: string;
  category: string;
  icon: string;
  description: string;
  objective: string;
  steps: string[];
  durationDays: number;
  durationText: string;
  xpReward: number;
  pointsReward: number;
  badge?: string;
  associatedQuestion?: string;
  mechanics?: string;
  criterias: string[];
  warnings: string[];
}

export interface ResolvedActivityDestination {
  modalType: ActivityModalType;
  activityId: string;
  activity: MainMissionActivity | ComplementaryActivity | null;
  routePath?: string;
  durationDays: number;
  isMultiDay: boolean;
  requiresCamera: boolean;
  interactiveGameType?: 'budget_game' | 'opportunities_game' | 'voice_game';
  instructions: ActivityInstructionsMeta;
}

/**
 * Helper to look up any activity by its unique ID
 */
export function getActivityById(activityId: string): MainMissionActivity | ComplementaryActivity | null {
  if (!activityId) return null;
  const main = MAIN_ACTIVITIES.find(a => a.id === activityId);
  if (main) return main;
  const comp = COMPLEMENTARY_ACTIVITIES.find(a => a.id === activityId);
  if (comp) return comp;
  return null;
}

/**
 * Central Activity Resolver for EcoViG
 * Analyzes any activity, mission, challenge or survey, and deterministically
 * resolves the target experience interface, modal, route and instructional metadata.
 */
export function resolveActivityDestination(
  activityOrId: MainMissionActivity | ComplementaryActivity | string
): ResolvedActivityDestination {
  // If a string was passed (like 'survey' or an activity ID)
  if (typeof activityOrId === 'string') {
    if (activityOrId === 'survey' || activityOrId === 'initial_survey' || activityOrId === 'questionnaire') {
      return {
        modalType: 'survey',
        activityId: 'initial_survey',
        activity: null,
        routePath: '/questionnaire',
        durationDays: 1,
        isMultiDay: false,
        requiresCamera: false,
        instructions: {
          title: 'Encuesta Diagnóstica Socioambiental',
          subtitle: 'Evaluación de hábitos y actitudes socioambientales',
          category: 'Diagnóstico Inicial',
          icon: '🧭',
          description: 'Responde 21 preguntas diagnósticas divididas en 4 dimensiones para personalizar tus misiones formativas.',
          objective: 'Establecer tu línea base socioambiental para desbloquear Mi Mundo, la EcoTienda y las 12 misiones.',
          steps: [
            'Lee cada pregunta con atención y selecciona la opción que refleje tu comportamiento cotidiano real.',
            'Avanza a través de las 4 categorías: Conducta Pro-Ambiental, Austeridad, Altruismo y Equidad.',
            'Al enviar tus respuestas, recibirás tus primeras 500 EcoMonedas 🪙 y 150 XP de recompensa.'
          ],
          durationDays: 1,
          durationText: '10 - 15 minutos',
          xpReward: 150,
          pointsReward: 500,
          criterias: [
            'Responder las 21 preguntas diagnósticas',
            'Completar con honestidad basada en tu comportamiento habitual'
          ],
          warnings: ['Paso obligatorio antes de iniciar cualquier misión o compra en la EcoTienda']
        }
      };
    }

    const foundActivity = getActivityById(activityOrId);
    if (foundActivity) {
      return resolveActivityDestination(foundActivity);
    }
  }

  const activity = typeof activityOrId === 'object' ? activityOrId : null;

  // Fallback if not found
  if (!activity) {
    return {
      modalType: 'evidence',
      activityId: 'unknown',
      activity: null,
      durationDays: 1,
      isMultiDay: false,
      requiresCamera: false,
      instructions: {
        title: 'Actividad Socioambiental',
        subtitle: 'EcoViG',
        category: 'Conducta Pro-Ambiental',
        icon: '🌱',
        description: 'Completa tu actividad formativa siguiendo las indicaciones correspondientes.',
        objective: 'Desarrollar hábitos socioambientales positivos.',
        steps: ['Sigue las instrucciones del docente y registra tu evidencia.'],
        durationDays: 1,
        durationText: '1 día',
        xpReward: 50,
        pointsReward: 10,
        criterias: ['Completar el registro requerido'],
        warnings: []
      }
    };
  }

  const durationDays = activity.durationDays || 1;
  const isMultiDay = durationDays > 1;

  // 1. Interactive game missions (Main activities with interactiveGameType)
  if ('interactiveGameType' in activity && activity.interactiveGameType) {
    if (activity.interactiveGameType === 'budget_game') {
      return {
        modalType: 'budget',
        activityId: activity.id,
        activity,
        durationDays: 1,
        isMultiDay: false,
        requiresCamera: false,
        interactiveGameType: 'budget_game',
        instructions: buildMainMissionInstructions(activity, [
          'Gestionar responsablemente el presupuesto de $500 asignado.',
          'Diferenciar claramente necesidades primordiales de compras impulsivas o prescindibles.',
          'Registrar la justificación reflexiva del gasto evitado.'
        ])
      };
    }

    if (activity.interactiveGameType === 'opportunities_game') {
      return {
        modalType: 'opportunities',
        activityId: activity.id,
        activity,
        durationDays: 1,
        isMultiDay: false,
        requiresCamera: false,
        interactiveGameType: 'opportunities_game',
        instructions: buildMainMissionInstructions(activity, [
          'Analizar los 3 casos prácticos de convivencia escolar y comunitaria.',
          'Tomar decisiones basadas en méritos, justicia y equidad libre de discriminación.',
          'Completar la reflexión ética sobre los criterios de igualdad de oportunidades.'
        ])
      };
    }

    if (activity.interactiveGameType === 'voice_game') {
      return {
        modalType: 'voice',
        activityId: activity.id,
        activity,
        durationDays: 1,
        isMultiDay: false,
        requiresCamera: false,
        interactiveGameType: 'voice_game',
        instructions: buildMainMissionInstructions(activity, [
          'Evaluar las 5 situaciones escolares de toma de decisiones colectivas.',
          'Determinar el balance adecuado de participación entre docentes y estudiantes.',
          'Reflexionar sobre la importancia del diálogo democrático para obtener la insignia "Voz equitativa".'
        ])
      };
    }
  }

  // 2. Complementary Activities
  if (activity.category === 'Complementaria') {
    const compAct = activity as ComplementaryActivity;

    // Upcycling (comp_3) requires photos
    if (compAct.id === 'comp_3') {
      return {
        modalType: 'evidence',
        activityId: compAct.id,
        activity: compAct,
        durationDays: compAct.durationDays || 2,
        isMultiDay: (compAct.durationDays || 2) > 1,
        requiresCamera: true,
        instructions: buildComplementaryInstructions(compAct, [
          'Identificar un objeto o material reutilizable en desuso.',
          'Transformarlo creativamente en un elemento funcional o decorativo.',
          'Capturar fotografía en tiempo real del antes y después de la transformación.'
        ])
      };
    }

    // All other complementary activities go to complementary form/minigame
    return {
      modalType: 'complementary',
      activityId: compAct.id,
      activity: compAct,
      durationDays: compAct.durationDays || 1,
      isMultiDay: (compAct.durationDays || 1) > 1,
      requiresCamera: false,
      instructions: buildComplementaryInstructions(compAct)
    };
  }

  // 3. Main photographic/challenge missions
  const mainAct = activity as MainMissionActivity;
  return {
    modalType: 'evidence',
    activityId: mainAct.id,
    activity: mainAct,
    durationDays: mainAct.durationDays || 1,
    isMultiDay: (mainAct.durationDays || 1) > 1,
    requiresCamera: true,
    instructions: buildMainMissionInstructions(mainAct, [
      `Mantener la conducta ambiental de manera constante durante los ${mainAct.durationDays} días del reto.`,
      'Capturar 1 fotografía diaria en tiempo real con la cámara (no se permiten fotos de galería).',
      'No incluir rostros de personas ni datos privados en las evidencias.',
      'Completar la reflexión o compromiso formativo al finalizar el periodo.'
    ])
  };
}

/**
 * Builds standard instructions metadata for Main Mission Activities
 */
function buildMainMissionInstructions(
  act: MainMissionActivity,
  defaultCriterias: string[] = []
): ActivityInstructionsMeta {
  const instructionsList = act.instructions && act.instructions.length > 0
    ? act.instructions
    : [act.description];

  const warnings: string[] = [
    'Solo se permite 1 misión activa a la vez para fomentar la constancia.',
    'Capturas exclusivamente en tiempo real (anti-galería) para validar hábitos reales.'
  ];

  if (act.associatedQuestionsText && act.associatedQuestionsText.length > 0) {
    warnings.push(`Esta misión refuerza tu respuesta: "${act.associatedQuestionsText[0]}"`);
  }

  return {
    title: act.title,
    subtitle: act.subtitle,
    category: act.category,
    icon: act.icon,
    description: act.description,
    objective: act.subtitle || act.description,
    steps: instructionsList,
    durationDays: act.durationDays || 1,
    durationText: act.durationText,
    xpReward: act.xpReward,
    pointsReward: act.pointsReward,
    badge: act.badge,
    associatedQuestion: act.associatedQuestionsText?.[0],
    criterias: defaultCriterias.length > 0 ? defaultCriterias : instructionsList,
    warnings
  };
}

/**
 * Builds standard instructions metadata for Complementary Activities
 */
function buildComplementaryInstructions(
  act: ComplementaryActivity,
  customCriterias?: string[]
): ActivityInstructionsMeta {
  const steps = [
    act.description,
    act.mechanics
  ];

  return {
    title: act.title,
    subtitle: `Actividad ${act.number} • Desafío Secundario`,
    category: act.category,
    icon: act.icon,
    description: act.description,
    objective: act.description,
    steps,
    durationDays: act.durationDays || 1,
    durationText: act.durationText,
    xpReward: 50,
    pointsReward: act.pointsReward,
    badge: act.badge,
    mechanics: act.mechanics,
    criterias: customCriterias || [
      'Cumplir la mecánica formativa especificada',
      'Registrar las respuestas y propuestas con pensamiento crítico'
    ],
    warnings: [
      'Disponible tras haber completado las 12 Misiones Obligatorias'
    ]
  };
}
