/**
 * Règles de validation du mot de passe pour tous les comptes.
 * - 8 caractères minimum
 * - Au moins une majuscule (A–Z)
 * - Au moins une minuscule (a–z)
 * - Au moins un chiffre (0–9)
 * - Au moins un symbole (!@#$%…)
 */

export const PASSWORD_RULES = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireDigit: true,
  requireSymbol: true,
};

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
  checks: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasDigit: boolean;
    hasSymbol: boolean;
  };
}

export function validatePassword(password: string): PasswordValidationResult {
  const checks = {
    minLength: password.length >= PASSWORD_RULES.minLength,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasDigit: /[0-9]/.test(password),
    hasSymbol: /[^A-Za-z0-9]/.test(password),
  };

  const errors: string[] = [];
  if (!checks.minLength) errors.push(`Au moins ${PASSWORD_RULES.minLength} caractères`);
  if (!checks.hasUppercase) errors.push("Au moins une lettre majuscule (A–Z)");
  if (!checks.hasLowercase) errors.push("Au moins une lettre minuscule (a–z)");
  if (!checks.hasDigit) errors.push("Au moins un chiffre (0–9)");
  if (!checks.hasSymbol) errors.push("Au moins un symbole (!@#$%…)");

  return {
    valid: errors.length === 0,
    errors,
    checks,
  };
}

export const PASSWORD_HINT = "Le mot de passe doit contenir au moins 8 caractères, avec une majuscule, une minuscule, un chiffre et un symbole.";
