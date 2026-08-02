import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

export const PASSWORD_SPECIAL_CHARS = '!@#$%^&*()<>?';
export const PASSWORD_MIN_LENGTH = 8;

const SCRYPT_KEY_LENGTH = 64;

export function generateSalt(): string {
    return randomBytes(16).toString('hex');
}

export function hashPassword(password: string, salt: string): string {
    return scryptSync(password, salt, SCRYPT_KEY_LENGTH).toString('hex');
}

// Constant-time comparison so timing side-channels can't leak the hash.
export function verifyPassword(password: string, salt: string, storedHash: string): boolean {
    const computed = hashPassword(password, salt);
    const a = Buffer.from(computed, 'hex');
    const b = Buffer.from(storedHash, 'hex');
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
}

export type PasswordValidationResult = {
    valid: boolean;
    errors: string[];
};

export function validatePassword(password: string): PasswordValidationResult {
    const errors: string[] = [];

    if (password.length < PASSWORD_MIN_LENGTH) {
        errors.push(`At least ${PASSWORD_MIN_LENGTH} characters`);
    }
    if (!/[a-z]/.test(password)) {
        errors.push('At least one lowercase letter');
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('At least one uppercase letter');
    }
    if (!/[0-9]/.test(password)) {
        errors.push('At least one number');
    }
    if (![...password].some((c) => PASSWORD_SPECIAL_CHARS.includes(c))) {
        errors.push(`At least one special character (${PASSWORD_SPECIAL_CHARS})`);
    }
    if (/\s/.test(password)) {
        errors.push('No spaces allowed');
    }

    return { valid: errors.length === 0, errors };
}

export const USERNAME_MAX_LENGTH = 30;

export type UsernameValidationResult = {
    valid: boolean;
    errors: string[];
};

export function validateUsername(username: string): UsernameValidationResult {
    const errors: string[] = [];
    if (!username) {
        errors.push('Username is required');
    }
    if (username.length > USERNAME_MAX_LENGTH) {
        errors.push(`Max ${USERNAME_MAX_LENGTH} characters`);
    }
    if (/\s/.test(username)) {
        errors.push('No spaces allowed');
    }
    return { valid: errors.length === 0, errors };
}
