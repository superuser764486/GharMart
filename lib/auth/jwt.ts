import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.SESSION_SECRET || 'your-secret-key';
const TOKEN_EXPIRY = '15m'; // Access token expiry
const REFRESH_TOKEN_EXPIRY = '7d'; // Refresh token expiry

export interface TokenPayload {
  userId: string;
  email: string;
  phone?: string;
  role?: 'customer' | 'vendor' | 'admin';
  iat?: number;
  exp?: number;
}

// Generate access token
export function generateAccessToken(payload: Omit<TokenPayload, 'iat' | 'exp'>) {
  return jwt.sign(payload, SECRET_KEY, { expiresIn: TOKEN_EXPIRY });
}

// Generate refresh token
export function generateRefreshToken(payload: Omit<TokenPayload, 'iat' | 'exp'>) {
  return jwt.sign(payload, SECRET_KEY, { expiresIn: REFRESH_TOKEN_EXPIRY });
}

// Verify and decode token
export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, SECRET_KEY) as TokenPayload;
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

// Generate both tokens
export function generateTokens(payload: Omit<TokenPayload, 'iat' | 'exp'>) {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  return { accessToken, refreshToken };
}

// Refresh token pair using refresh token
export function refreshTokenPair(refreshToken: string) {
  const payload = verifyToken(refreshToken);
  if (!payload) {
    throw new Error('Invalid refresh token');
  }
  
  const { iat, exp, ...cleanPayload } = payload;
  return generateTokens(cleanPayload as Omit<TokenPayload, 'iat' | 'exp'>);
}

export default {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  generateTokens,
  refreshTokenPair,
};
