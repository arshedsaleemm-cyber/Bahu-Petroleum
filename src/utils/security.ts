/**
 * Security & Password Encryption Helpers
 */

export function simpleHashPassword(password: string): string {
  if (!password) return '';
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'bp_' + Math.abs(hash).toString(36) + '_' + password.length;
}

export function verifyPassword(inputPass: string, storedPass?: string): boolean {
  if (!storedPass) return false;
  if (storedPass === inputPass) return true;
  if (storedPass === simpleHashPassword(inputPass)) return true;
  return false;
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
