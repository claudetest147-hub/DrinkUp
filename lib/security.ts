/**
 * Security & Input Validation
 * Prevents abuse, SQL injection, and malicious input
 */

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Validate player name
 * Max 20 chars, alphanumeric + spaces only
 */
export function validatePlayerName(name: string): string {
  if (!name || typeof name !== 'string') {
    throw new ValidationError('Player name is required');
  }
  
  const trimmed = name.trim();
  
  if (trimmed.length === 0) {
    throw new ValidationError('Player name cannot be empty');
  }
  
  if (trimmed.length > 20) {
    throw new ValidationError('Player name too long (max 20 characters)');
  }
  
  // Only allow alphanumeric, spaces, and basic punctuation
  if (!/^[a-zA-Z0-9\s'-]+$/.test(trimmed)) {
    throw new ValidationError('Player name contains invalid characters');
  }
  
  return trimmed;
}

/**
 * Sanitize array of player names
 */
export function sanitizePlayerNames(names: string[]): string[] {
  if (!Array.isArray(names)) {
    throw new ValidationError('Player names must be an array');
  }
  
  if (names.length < 2) {
    throw new ValidationError('At least 2 players required');
  }
  
  if (names.length > 8) {
    throw new ValidationError('Maximum 8 players allowed');
  }
  
  const validated = names.map(name => validatePlayerName(name));
  
  // Check for duplicates
  const uniqueNames = new Set(validated.map(n => n.toLowerCase()));
  if (uniqueNames.size !== validated.length) {
    throw new ValidationError('Player names must be unique');
  }
  
  return validated;
}

/**
 * Rate limiting check (client-side)
 * Returns true if action is allowed
 */
interface RateLimitState {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const rateLimitState: RateLimitState = {};

export function checkRateLimit(
  key: string,
  limit: number = 10,
  windowMs: number = 60000 // 1 minute
): boolean {
  const now = Date.now();
  
  if (!rateLimitState[key]) {
    rateLimitState[key] = {
      count: 1,
      resetTime: now + windowMs,
    };
    return true;
  }
  
  const state = rateLimitState[key];
  
  // Reset if window expired
  if (now > state.resetTime) {
    state.count = 1;
    state.resetTime = now + windowMs;
    return true;
  }
  
  // Check if over limit
  if (state.count >= limit) {
    return false;
  }
  
  // Increment counter
  state.count++;
  return true;
}

/**
 * Clean old rate limit entries (run periodically)
 */
export function cleanupRateLimits() {
  const now = Date.now();
  for (const key in rateLimitState) {
    if (rateLimitState[key].resetTime < now) {
      delete rateLimitState[key];
    }
  }
}

// Clean up every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(cleanupRateLimits, 5 * 60 * 1000);
}

/**
 * Validate game parameters
 */
export function validateGameParams(params: {
  gameType: string;
  intensity: string;
  players: any[];
}) {
  const validGameTypes = ['truth_or_dare', 'would_you_rather', 'most_likely_to', 'never_have_i_ever'];
  const validIntensities = ['mild', 'spicy', 'extreme'];
  
  if (!validGameTypes.includes(params.gameType)) {
    throw new ValidationError('Invalid game type');
  }
  
  if (!validIntensities.includes(params.intensity)) {
    throw new ValidationError('Invalid intensity level');
  }
  
  // Check rate limit
  if (!checkRateLimit('startGame', 10, 60000)) {
    throw new ValidationError('Too many games started. Please wait a minute.');
  }
  
  return true;
}

/**
 * Content Security Policy headers (for web)
 */
export const CSP_HEADERS = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Required for React Native web
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "connect-src 'self' https://yicbsjkdioiknonuuhvf.supabase.co https://*.anthropic.com",
    "font-src 'self' data:",
  ].join('; '),
};
