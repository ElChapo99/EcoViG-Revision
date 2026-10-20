export type Role = 'admin' | 'teacher' | 'student' | 'evaluator';

export type SurveyCategory = 'Conducta Pro-Ambiental' | 'Austeridad' | 'Altruismo' | 'Equidad';
export type SurveyOption = 'Nunca' | 'Casi nunca' | 'Casi siempre' | 'Siempre';

export interface SurveyAnswer {
  questionId: string;
  category: SurveyCategory;
  questionText: string;
  selectedOption: SurveyOption;
  score: number;
  reverseScoring: boolean;
  imageUrl?: string | null;
}

export interface ManagedSurveyQuestion {
  id: string;
  order: number;
  category: SurveyCategory;
  text: string;
  reverseScoring: boolean;
  imageUrl?: string | null;
  imageStoragePath?: string | null;
  retired?: boolean;
  wasEverPublished?: boolean;
  createdInVersionId?: string;
}

export interface DimensionScoreRange {
  minScore: number;
  maxScore: number;
  count: number;
}

export interface SurveyScoreRanges {
  minTotal: number;
  maxTotal: number;
  categories: Record<SurveyCategory, DimensionScoreRange>;
}

export interface SurveyVersion {
  versionId: string;
  versionNumber: number;
  name: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: number;
  updatedAt: number;
  publishedAt?: number | null;
  createdBy?: string;
  questionCount: number;
  questions: ManagedSurveyQuestion[];
  categoryCounts: Record<SurveyCategory, number>;
  scoreRanges: SurveyScoreRanges;
}

export interface SurveyVersionSummary {
  versionId: string;
  versionNumber: number;
  name: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: number;
  updatedAt: number;
  publishedAt?: number | null;
  createdBy?: string;
  questionCount: number;
  categoryCounts: Record<SurveyCategory, number>;
  scoreRanges: SurveyScoreRanges;
  isCurrentPublished?: boolean;
  isActiveDraft?: boolean;
  usageCount?: number;
}

export interface SurveySystemConfig {
  currentPublishedVersionId: string;
  activeDraftVersionId?: string | null;
  publishedVersionCounter: number;
  updatedAt: number;
}

export interface SurveyResults {
  completedAt: number;
  totalScore: number;
  surveyVersion?: string;
  surveyVersionId?: string;
  categoryScores: {
    'Conducta Pro-Ambiental': number;
    'Austeridad': number;
    'Altruismo': number;
    'Equidad': number;
  };
  answers: Record<string, SurveyAnswer>;
  recommendedActivityIds: string[];
}

export interface DiagnosticSurveyRecord {
  completed: boolean;
  completedAt: number;
  rewardGranted?: boolean;
  surveyVersion?: string;
  surveyVersionId?: string;
  totalScore: number;
  categoryScores: {
    'Conducta Pro-Ambiental': number;
    'Austeridad': number;
    'Altruismo': number;
    'Equidad': number;
  };
  answers: Record<string, SurveyAnswer>;
  recommendedActivityIds?: string[];
}

export interface DimensionComparisonItem {
  category: SurveyCategory;
  initialScore: number;
  finalScore: number;
  maxScore: number;
  minScore: number;
  deltaScore: number;
  initialNormalized: number;
  finalNormalized: number;
  deltaPercentagePoints: number;
  tendency: 'increase' | 'decrease' | 'stable';
  neutralDescription: string;
}

export interface SurveyComparisonSummary {
  isCompatible: boolean;
  initialVersion: string;
  finalVersion: string;
  initialTotal: number;
  finalTotal: number;
  deltaTotal: number;
  initialTotalNormalized: number;
  finalTotalNormalized: number;
  deltaTotalPercentagePoints: number;
  dimensions: Record<SurveyCategory, DimensionComparisonItem>;
}

export interface CompletedActivityRecord {
  completedAt: number;
  pointsEarned: number;
  badgeEarned?: string;
  evidenceType: string;
  evidenceData?: any;
  feedback?: string;
}

export interface DailyCheckInRecord {
  day: number;
  evidenceDay?: number;
  timestamp: number;
  submittedAt?: number;
  capturedAt?: number;
  activityId?: string;
  studentId?: string;
  photoUrl?: string;
  videoUrl?: string;
  note?: string;
  reflection?: string;
  status?: 'completed' | 'accepted' | 'pending';
  verifiedByServer?: boolean;
}

export interface ActiveMissionInfo {
  activityId: string;
  title: string;
  category: string;
  icon: string;
  startedAt: number; // timestamp ms
  durationDays: number;
  completedDays?: number;
  lastEvidenceSubmittedAt?: number;
  dailyCheckIns?: DailyCheckInRecord[];
  dailyEvidences?: DailyCheckInRecord[];
  simulatedDaysOffset?: number;
}

export interface ElementPosition {
  x: number; // horizontal percentage 0 - 100
  y: number; // bottom percentage 0 - 100
}

export type BiomeWorldLayout = Record<string, ElementPosition>; // { [elementId]: { x, y } }
export type WorldLayouts = Record<string, BiomeWorldLayout>; // { [biomeId]: { [elementId]: { x, y } } }

export interface User {
  uid: string;
  email: string;
  name: string;
  role: Role;
  schoolId?: string;
  teacherId?: string;
  linkCode?: string;
  xp?: number;
  surveyPoints?: number;
  mainMissionPoints?: number;
  complementaryPoints?: number;
  badges?: string[];
  level?: number;
  streak?: number;
  coins?: number;
  unlockedDecorations?: string[];
  activeDecorations?: Record<string, string[]>; // { 'forest': ['cat_1', 'dog_2'], ... }
  worldLayouts?: WorldLayouts;
  ecosystem?: {
    trees: number;
    water: number;
    animals: number;
  };
  surveyResults?: SurveyResults;
  initialSurvey?: DiagnosticSurveyRecord;
  finalSurvey?: DiagnosticSurveyRecord;
  surveyRewardGranted?: boolean;
  initialSurveyCompleted?: boolean;
  finalSurveyCompleted?: boolean;
  completedActivities?: Record<string, CompletedActivityRecord>;
  activeMissions?: string[];
  activeMission?: ActiveMissionInfo | null;
  createdAt: number;
  updatedAt: number;
}

export type EducationLevel = 'Secundaria' | 'Bachillerato' | 'Universidad' | 'Otro';

export interface School {
  id: string;
  name: string;
  normalizedName: string;
  educationLevel: EducationLevel;
  city?: string;
  state?: string;
  active: boolean;
  studentCount?: number;
  teacherCount?: number;
  createdAt: number;
  updatedAt: number;
}

export interface RoleRequest {
  id: string;
  userId: string;
  email: string;
  name: string;
  requestedRole: 'teacher' | 'student';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
}


export type RequestType = 'account_deletion' | 'academic_withdrawal';

export type DeletionRequestStatus = 
  | 'pending' 
  | 'approved' 
  | 'rejected' 
  | 'processing' 
  | 'completed' 
  | 'cancelled' 
  | 'failed'
  | 'pending_verification'
  | 'verified'
  | 'in_progress'
  | 'requires_admin_review';

export interface AccountDeletionRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  type?: RequestType; // 'account_deletion' vs 'academic_withdrawal'
  teacherId?: string | null;
  teacherName?: string | null;
  schoolId?: string | null;
  schoolName?: string | null;
  grade?: string | null;
  group?: string | null;
  status: DeletionRequestStatus;
  reason?: string;
  source?: 'in_app' | 'public_web';
  verifiedAt?: number;
  trackingId?: string;
  retainedRecordsNote?: string;
  createdAt: number;
  updatedAt?: number;
  cancelledAt?: number;
  reviewedAt?: number;
  reviewedBy?: string;
  reviewerRole?: string;
  reviewNote?: string;
  completedAt?: number;
  completedBy?: string;
  error?: string;
}

export interface Question {
  id: string;
  text: string;
  category: string;
  options: { text: string; score: number }[];
}

export interface Activity {
  id: string;
  name: string;
  description: string;
  category: string;
  durationDays: number;
  target?: number;
  xpReward: number;
}

export interface Mission {
  id: string;
  studentId: string;
  teacherId: string;
  activityId: string;
  name: string;
  description: string;
  category: string;
  status: 'active' | 'completed' | 'expired';
  progress: number;
  target: number;
  xpReward: number;
  createdAt: number;
  updatedAt: number;
}

export interface Evidence {
  id: string;
  studentId: string;
  missionId: string;
  type: 'photo' | 'video' | 'audio' | 'text';
  url?: string;
  text?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
}
