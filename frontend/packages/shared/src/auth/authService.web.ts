export type AuthRole = 'customer' | 'driver';
export const AUTH_FULL_NAME_MAX_LENGTH = 120;

export type AuthProfile = {
  id: number;
  role: 'CUSTOMER' | 'DRIVER' | 'ADMIN';
  firebaseUid: string;
  fullName: string | null;
  email: string | null;
  phoneNumber: string | null;
  status: string;
  verificationStatus?: string | null;
};

type User = {
  displayName: string | null;
  email: string | null;
  phoneNumber: string | null;
  getIdToken: (forceRefresh?: boolean) => Promise<string>;
};

export class AuthApiError extends Error {
  constructor(
    message: string,
    readonly code: string,
  ) {
    super(message);
    this.name = 'AuthApiError';
  }
}

export class AuthCancelledError extends Error {
  constructor() {
    super('Đã hủy đăng nhập');
    this.name = 'AuthCancelledError';
  }
}

const NATIVE_AUTH_MESSAGE =
  'Đăng nhập bằng OTP, Google và Facebook chỉ khả dụng trong ứng dụng di động. Hãy mở development build đã cài trên thiết bị.';

function nativeAuthRequired(): AuthApiError {
  return new AuthApiError(NATIVE_AUTH_MESSAGE, 'NATIVE_AUTH_REQUIRED');
}

export function getAuthFullNameValidationError(fullName: string): string | null {
  const normalized = fullName.trim();
  if (!normalized) return 'Họ và tên không được để trống.';
  if (normalized.length > AUTH_FULL_NAME_MAX_LENGTH) {
    return `Họ và tên không được dài quá ${AUTH_FULL_NAME_MAX_LENGTH} ký tự.`;
  }
  return null;
}

export function normalizeVietnamPhoneNumber(value: string): string {
  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, '');
  if (trimmed.startsWith('+')) return `+${digits}`;
  if (digits.startsWith('00')) return `+${digits.slice(2)}`;
  if (digits.startsWith('84')) return `+${digits}`;
  if (digits.startsWith('0')) return `+84${digits.slice(1)}`;
  return `+84${digits}`;
}

export function isValidVietnamPhoneNumber(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  if (digits.startsWith('84')) return digits.length === 11;
  if (digits.startsWith('0')) return digits.length === 10;
  return digits.length === 9;
}

export function getFirebaseUser(): User | null {
  return null;
}

export async function sendPhoneCode(
  _phoneNumber: string,
  _options: { linkToCurrentAccount?: boolean } = {},
): Promise<never> {
  throw nativeAuthRequired();
}

export async function confirmPhoneCode(_code: string): Promise<never> {
  throw nativeAuthRequired();
}

export async function signInWithGoogle(): Promise<never> {
  throw nativeAuthRequired();
}

export async function signInWithFacebook(): Promise<never> {
  throw nativeAuthRequired();
}

export async function authenticateWithBackend(
  _role: AuthRole,
  _user?: User,
): Promise<never> {
  throw nativeAuthRequired();
}

export async function registerWithBackend(
  _role: AuthRole,
  _fullName: string,
  _user?: User,
): Promise<never> {
  throw nativeAuthRequired();
}

export async function signOutFirebase(): Promise<void> {}
