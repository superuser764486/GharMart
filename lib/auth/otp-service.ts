import { authenticator } from 'otplib';

const OTP_WINDOW = 1; // Allow OTP from ±1 time window
const OTP_LENGTH = 6;

// In-memory OTP store (for demo purposes; use Redis in production)
const otpStore = new Map<string, { secret: string; createdAt: number; attempts: number; maxAttempts: number }>();

// Generate OTP for a user
export function generateOTP(email: string): string {
  // Use email as secret for consistent OTP generation
  const secret = Buffer.from(email).toString('base64');
  
  // Generate 6-digit OTP
  const otp = authenticator.generate(secret);
  
  // Store OTP metadata
  otpStore.set(email, {
    secret,
    createdAt: Date.now(),
    attempts: 0,
    maxAttempts: 5,
  });
  
  return otp;
}

// Generate numeric OTP (alternative simple method)
export function generateSimpleOTP(length: number = OTP_LENGTH): string {
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10);
  }
  return otp;
}

// Verify OTP
export function verifyOTP(email: string, otp: string, expiryMinutes: number = 10): boolean {
  const otpData = otpStore.get(email);
  
  if (!otpData) {
    console.error('No OTP found for email:', email);
    return false;
  }
  
  // Check if OTP has expired
  const ageInMinutes = (Date.now() - otpData.createdAt) / 1000 / 60;
  if (ageInMinutes > expiryMinutes) {
    otpStore.delete(email);
    console.error('OTP expired for email:', email);
    return false;
  }
  
  // Check if max attempts exceeded
  if (otpData.attempts >= otpData.maxAttempts) {
    otpStore.delete(email);
    console.error('Max OTP attempts exceeded for email:', email);
    return false;
  }
  
  // Increment attempts
  otpData.attempts += 1;
  
  // Verify OTP (using authenticator library)
  const isValid = authenticator.check(otp, otpData.secret);
  
  if (isValid) {
    // Clear OTP after successful verification
    otpStore.delete(email);
    return true;
  }
  
  return false;
}

// Simple numeric OTP verification (alternative method)
export function verifySimpleOTP(
  email: string,
  otp: string,
  storedOTP: string,
  expiryMinutes: number = 10
): boolean {
  const otpData = otpStore.get(email);
  
  if (!otpData) {
    return false;
  }
  
  // Check expiry
  const ageInMinutes = (Date.now() - otpData.createdAt) / 1000 / 60;
  if (ageInMinutes > expiryMinutes) {
    otpStore.delete(email);
    return false;
  }
  
  // Check attempts
  if (otpData.attempts >= otpData.maxAttempts) {
    otpStore.delete(email);
    return false;
  }
  
  otpData.attempts += 1;
  
  // Compare OTPs
  if (otp === storedOTP) {
    otpStore.delete(email);
    return true;
  }
  
  return false;
}

// Get remaining time for OTP (in seconds)
export function getOTPRemainingTime(email: string, expiryMinutes: number = 10): number {
  const otpData = otpStore.get(email);
  
  if (!otpData) {
    return 0;
  }
  
  const ageInSeconds = (Date.now() - otpData.createdAt) / 1000;
  const expirySeconds = expiryMinutes * 60;
  const remainingSeconds = Math.max(0, expirySeconds - ageInSeconds);
  
  return Math.floor(remainingSeconds);
}

// Clear OTP
export function clearOTP(email: string): void {
  otpStore.delete(email);
}

// Get OTP attempts remaining
export function getOTPAttemptsRemaining(email: string): number {
  const otpData = otpStore.get(email);
  
  if (!otpData) {
    return 0;
  }
  
  return Math.max(0, otpData.maxAttempts - otpData.attempts);
}

export default {
  generateOTP,
  generateSimpleOTP,
  verifyOTP,
  verifySimpleOTP,
  getOTPRemainingTime,
  clearOTP,
  getOTPAttemptsRemaining,
};
