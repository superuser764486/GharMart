import bcrypt from 'bcryptjs';
import { query, transaction } from '../database/connection';
import { generateTokens, verifyToken, TokenPayload } from './jwt';
import { generateSimpleOTP, verifySimpleOTP, clearOTP } from './otp-service';
import { sendEmail, emailTemplates } from '../email/nodemailer';

export interface User {
  id: string;
  email: string;
  phone: string;
  fullName: string;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  tokens?: {
    accessToken: string;
    refreshToken: string;
  };
  error?: string;
}

// Hash password
async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Compare password
async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Sign up new customer
export async function signUp(email: string, password: string, fullName: string, phone?: string): Promise<AuthResponse> {
  try {
    // Validate input
    if (!email || !password || !fullName) {
      return { success: false, message: 'Email, password, and name are required', error: 'MISSING_FIELDS' };
    }

    // Check if user already exists
    const existingUser = await query('SELECT id FROM customers WHERE email = $1', [email.toLowerCase()]);
    if (existingUser.rows.length > 0) {
      return { success: false, message: 'Email already registered', error: 'USER_EXISTS' };
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const result = await query(
      `INSERT INTO customers (email, password_hash, full_name, phone, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING id, email, phone, full_name, created_at, updated_at`,
      [email.toLowerCase(), hashedPassword, fullName, phone || null]
    );

    const user = result.rows[0];

    // Generate tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      phone: user.phone,
      role: 'customer',
    });

    // Send welcome email
    await sendEmail({
      to: user.email,
      ...emailTemplates.welcomeEmail(fullName, user.email),
    }).catch(err => console.error('Welcome email failed:', err));

    return {
      success: true,
      message: 'Account created successfully',
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        fullName: user.full_name,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
      tokens,
    };
  } catch (error) {
    console.error('Sign up error:', error);
    return { success: false, message: 'Failed to create account', error: 'SIGNUP_ERROR' };
  }
}

// Sign in with email and password
export async function signIn(email: string, password: string): Promise<AuthResponse> {
  try {
    if (!email || !password) {
      return { success: false, message: 'Email and password are required', error: 'MISSING_FIELDS' };
    }

    // Find user
    const result = await query('SELECT * FROM customers WHERE email = $1', [email.toLowerCase()]);
    if (result.rows.length === 0) {
      return { success: false, message: 'Invalid email or password', error: 'INVALID_CREDENTIALS' };
    }

    const user = result.rows[0];

    // Verify password
    const passwordMatch = await comparePassword(password, user.password_hash);
    if (!passwordMatch) {
      return { success: false, message: 'Invalid email or password', error: 'INVALID_CREDENTIALS' };
    }

    // Update last login
    await query('UPDATE customers SET last_login = NOW() WHERE id = $1', [user.id]);

    // Generate tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      phone: user.phone,
      role: 'customer',
    });

    return {
      success: true,
      message: 'Signed in successfully',
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        fullName: user.full_name,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        lastLogin: new Date(),
      },
      tokens,
    };
  } catch (error) {
    console.error('Sign in error:', error);
    return { success: false, message: 'Failed to sign in', error: 'SIGNIN_ERROR' };
  }
}

// Send OTP for phone verification
export async function sendOTP(email: string): Promise<AuthResponse> {
  try {
    // Generate OTP
    const otp = generateSimpleOTP(6);

    // Send OTP via email
    await sendEmail({
      to: email,
      ...emailTemplates.otpEmail(otp, 10),
    });

    // Store OTP (in production, use Redis with expiry)
    // For now, storing in memory via generateSimpleOTP
    
    return {
      success: true,
      message: 'OTP sent to your email',
    };
  } catch (error) {
    console.error('OTP send error:', error);
    return { success: false, message: 'Failed to send OTP', error: 'OTP_SEND_ERROR' };
  }
}

// Verify OTP and sign in
export async function signInWithOTP(email: string, otp: string, storedOTP: string): Promise<AuthResponse> {
  try {
    if (!email || !otp) {
      return { success: false, message: 'Email and OTP are required', error: 'MISSING_FIELDS' };
    }

    // Verify OTP
    const isValid = verifySimpleOTP(email, otp, storedOTP, 10);
    if (!isValid) {
      return { success: false, message: 'Invalid or expired OTP', error: 'INVALID_OTP' };
    }

    // Find or create user
    let result = await query('SELECT * FROM customers WHERE email = $1', [email.toLowerCase()]);
    
    let user;
    if (result.rows.length === 0) {
      // Create new user with OTP
      const createResult = await query(
        `INSERT INTO customers (email, full_name, phone, is_email_verified, created_at, updated_at)
         VALUES ($1, $2, $3, true, NOW(), NOW())
         RETURNING id, email, phone, full_name, created_at, updated_at`,
        [email.toLowerCase(), email.split('@')[0], null]
      );
      user = createResult.rows[0];
    } else {
      user = result.rows[0];
      // Update email verification
      await query('UPDATE customers SET is_email_verified = true WHERE id = $1', [user.id]);
    }

    // Clear OTP
    clearOTP(email);

    // Update last login
    await query('UPDATE customers SET last_login = NOW() WHERE id = $1', [user.id]);

    // Generate tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      phone: user.phone,
      role: 'customer',
    });

    return {
      success: true,
      message: 'Signed in successfully with OTP',
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        fullName: user.full_name,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        lastLogin: new Date(),
      },
      tokens,
    };
  } catch (error) {
    console.error('OTP sign in error:', error);
    return { success: false, message: 'OTP verification failed', error: 'OTP_VERIFY_ERROR' };
  }
}

// Request password reset
export async function requestPasswordReset(email: string): Promise<AuthResponse> {
  try {
    // Check if user exists
    const result = await query('SELECT id FROM customers WHERE email = $1', [email.toLowerCase()]);
    if (result.rows.length === 0) {
      // Don't reveal if email exists
      return { success: true, message: 'If email exists, password reset link sent' };
    }

    const userId = result.rows[0].id;

    // Generate reset token (valid for 24 hours)
    const resetToken = generateTokens({
      userId,
      email,
      role: 'customer',
    }).accessToken;

    // Store reset token
    await query(
      'INSERT INTO password_resets (user_id, token, expires_at, created_at) VALUES ($1, $2, NOW() + INTERVAL \'24 hours\', NOW())',
      [userId, resetToken]
    );

    // Send email with reset link
    const resetLink = `${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password?token=${resetToken}`;
    await sendEmail({
      to: email,
      ...emailTemplates.passwordResetEmail(resetLink, 24),
    });

    return {
      success: true,
      message: 'Password reset link sent to your email',
    };
  } catch (error) {
    console.error('Password reset request error:', error);
    return { success: false, message: 'Failed to process password reset', error: 'RESET_REQUEST_ERROR' };
  }
}

// Reset password with token
export async function resetPassword(token: string, newPassword: string): Promise<AuthResponse> {
  try {
    if (!token || !newPassword) {
      return { success: false, message: 'Token and new password are required', error: 'MISSING_FIELDS' };
    }

    // Verify token
    const payload = verifyToken(token);
    if (!payload) {
      return { success: false, message: 'Invalid or expired reset token', error: 'INVALID_TOKEN' };
    }

    // Check reset token in database (hasn't expired and matches)
    const result = await query(
      'SELECT * FROM password_resets WHERE user_id = $1 AND token = $2 AND expires_at > NOW()',
      [payload.userId, token]
    );

    if (result.rows.length === 0) {
      return { success: false, message: 'Invalid or expired reset token', error: 'INVALID_TOKEN' };
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password in transaction
    await transaction(async (client) => {
      await client.query('UPDATE customers SET password_hash = $1, updated_at = NOW() WHERE id = $2', [
        hashedPassword,
        payload.userId,
      ]);
      await client.query('DELETE FROM password_resets WHERE user_id = $1', [payload.userId]);
    });

    return {
      success: true,
      message: 'Password reset successfully',
    };
  } catch (error) {
    console.error('Password reset error:', error);
    return { success: false, message: 'Failed to reset password', error: 'RESET_ERROR' };
  }
}

// Get current user from token
export async function getCurrentUser(token: string): Promise<AuthResponse> {
  try {
    const payload = verifyToken(token);
    if (!payload) {
      return { success: false, message: 'Invalid or expired token', error: 'INVALID_TOKEN' };
    }

    // Fetch user from database
    const result = await query('SELECT id, email, phone, full_name, created_at, updated_at, last_login FROM customers WHERE id = $1', [
      payload.userId,
    ]);

    if (result.rows.length === 0) {
      return { success: false, message: 'User not found', error: 'USER_NOT_FOUND' };
    }

    const user = result.rows[0];
    return {
      success: true,
      message: 'User retrieved successfully',
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        fullName: user.full_name,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        lastLogin: user.last_login,
      },
    };
  } catch (error) {
    console.error('Get current user error:', error);
    return { success: false, message: 'Failed to get user', error: 'GET_USER_ERROR' };
  }
}

export default {
  signUp,
  signIn,
  sendOTP,
  signInWithOTP,
  requestPasswordReset,
  resetPassword,
  getCurrentUser,
};
