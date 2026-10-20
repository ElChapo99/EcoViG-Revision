/**
 * Centralized Legal and Support Configuration for EcoViG
 */

export const SUPPORT_CONFIG = {
  appName: 'EcoViG',
  supportEmail: ((import.meta as any).env?.VITE_SUPPORT_EMAIL as string) || 'ecovig.soporte@outlook.com',
  lastPoliciesUpdate: 'Octubre 2026',
  accountDeletionInAppAvailable: true,
};
