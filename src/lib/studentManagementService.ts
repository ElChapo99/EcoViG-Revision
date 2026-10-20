import { auth } from './firebase';
import { getAuthHeader } from './authHeader';
import { apiFetch, safeReadJson } from './apiClient';
import { User, DiagnosticSurveyRecord, SurveyResults, CompletedActivityRecord } from '../types';

export type StudentOverallStatus = 'pending_initial' | 'in_progress' | 'final_available' | 'completed';

export interface StudentSummary {
  uid: string;
  id: string;
  name: string;
  email: string;
  role: 'student';
  schoolId?: string | null;
  schoolName: string;
  grade?: string | null;
  group?: string | null;
  teacherId?: string | null;
  xp: number;
  level: number;
  coins: number;
  streak: number;
  initialSurveyCompleted: boolean;
  finalSurveyCompleted: boolean;
  completedMandatoryCount: number;
  totalMandatoryCount: number;
  completedComplementaryCount: number;
  totalCompletedActivities: number;
  initialTotalScore: number;
  finalTotalScore: number;
  overallStatus: StudentOverallStatus;
  createdAt: number;
  updatedAt: number;
}

export interface StudentDetail extends StudentSummary {
  initialSurvey?: DiagnosticSurveyRecord | SurveyResults | null;
  finalSurvey?: DiagnosticSurveyRecord | null;
  completedActivities: Record<string, CompletedActivityRecord>;
  ecosystem: {
    trees: number;
    water: number;
    animals: number;
  };
  activeMission?: any;
  badges?: string[];
}

export interface TeacherStudentsResponse {
  success: boolean;
  teacher: {
    uid: string;
    name: string;
    email: string;
    linkCode: string;
    schoolId?: string | null;
  };
  students: StudentSummary[];
  totalCount: number;
  totalMandatoryActivities: number;
}

export interface AdminStudentsResponse {
  success: boolean;
  students: StudentSummary[];
  totalCount: number;
  totalMandatoryActivities: number;
}

/**
 * Consulta la lista de estudiantes asignados al docente autenticado.
 */
export async function fetchTeacherStudents(): Promise<TeacherStudentsResponse> {
  const headers = await getAuthHeader();
  const res = await apiFetch('/api/teacher/students', { headers });
  return await safeReadJson<TeacherStudentsResponse>(res, 'Error al cargar los estudiantes del docente');
}

/**
 * Consulta el expediente detallado de un estudiante para el docente.
 */
export async function fetchTeacherStudentDetail(studentId: string): Promise<StudentDetail> {
  const headers = await getAuthHeader();
  const res = await apiFetch(`/api/teacher/students/${encodeURIComponent(studentId)}`, { headers });
  const data = await safeReadJson<{ student: StudentDetail }>(res, 'Error al cargar el detalle del estudiante');
  return data.student;
}

/**
 * Consulta el listado global de todos los estudiantes para el creador/admin.
 */
export async function fetchAdminStudents(): Promise<AdminStudentsResponse> {
  const headers = await getAuthHeader();
  const res = await apiFetch('/api/admin/students', { headers });
  return await safeReadJson<AdminStudentsResponse>(res, 'Error al consultar el listado global de estudiantes');
}

/**
 * Consulta el expediente detallado de un estudiante para el creador/admin.
 */
export async function fetchAdminStudentDetail(studentId: string): Promise<StudentDetail> {
  const headers = await getAuthHeader();
  const res = await apiFetch(`/api/admin/students/${encodeURIComponent(studentId)}`, { headers });
  const data = await safeReadJson<{ student: StudentDetail }>(res, 'Error al cargar el detalle del estudiante');
  return data.student;
}
