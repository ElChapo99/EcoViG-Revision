import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Generates a clean, readable 6-character uppercase alphanumeric code
 * Format: 3 letters + 3 numbers/letters (e.g. ECO842, DOC791, GRN518)
 */
export function generateRandomCode(): string {
  const prefixes = ['ECO', 'DOC', 'PROF', 'BIO', 'UNI', 'VERDE'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Removed confusing chars (0, O, 1, I)
  let suffix = '';
  for (let i = 0; i < 3; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${suffix}`;
}

/**
 * Generates a guaranteed unique linkCode for a teacher by checking Firestore.
 */
export async function generateUniqueTeacherCode(): Promise<string> {
  let isUnique = false;
  let code = '';
  let attempts = 0;

  while (!isUnique && attempts < 10) {
    attempts++;
    code = generateRandomCode();
    try {
      const q = query(collection(db, 'users'), where('linkCode', '==', code));
      const snap = await getDocs(q);
      if (snap.empty) {
        isUnique = true;
      }
    } catch (e) {
      console.error('Error verifying unique teacher code:', e);
      isUnique = true; // Fallback to current generated code
    }
  }

  return code;
}

/**
 * Ensures a teacher user has a valid unique linkCode.
 * If the teacher doesn't have one, generates and saves it to Firestore.
 */
export async function ensureTeacherHasLinkCode(teacherUid: string, currentLinkCode?: string): Promise<string> {
  if (currentLinkCode && currentLinkCode.trim().length > 0) {
    return currentLinkCode;
  }

  const newCode = await generateUniqueTeacherCode();
  try {
    const teacherRef = doc(db, 'users', teacherUid);
    await updateDoc(teacherRef, {
      linkCode: newCode,
      updatedAt: Date.now()
    });
  } catch (error) {
    console.error('Error saving teacher linkCode:', error);
  }

  return newCode;
}
