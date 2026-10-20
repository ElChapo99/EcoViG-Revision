import { User as AppUser } from '../types';

export type StudentOnboardingState = 'UNAUTHENTICATED' | 'NEEDS_SCHOOL' | 'NEEDS_TEACHER' | 'READY';

/**
 * 🔒 Centralized Student Onboarding State Guard
 * Evaluates whether an authenticated user has completed all mandatory onboarding steps:
 * 1. Has an assigned official school (schoolId).
 * 2. Is actively linked to a verified teacher (teacherId).
 * 
 * Non-student roles (teacher, admin, creator, evaluator) are immediately READY.
 */
export function getStudentOnboardingState(user: AppUser | null | undefined): StudentOnboardingState {
  if (!user) {
    return 'UNAUTHENTICATED';
  }

  // Non-student roles do not require student onboarding
  if (user.role !== 'student') {
    return 'READY';
  }

  // 1. Mandatory School Check
  if (!user.schoolId || typeof user.schoolId !== 'string' || user.schoolId.trim() === '') {
    return 'NEEDS_SCHOOL';
  }

  // 2. Mandatory Teacher Link Check
  if (!user.teacherId || typeof user.teacherId !== 'string' || user.teacherId.trim() === '') {
    return 'NEEDS_TEACHER';
  }

  return 'READY';
}
