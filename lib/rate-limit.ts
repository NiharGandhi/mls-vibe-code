/**
 * In-memory rate limit: one send per email per windowMs.
 * For multi-instance production, replace with Redis or similar.
 */
const RESEND_WINDOW_MS = 60 * 1000; // 1 minute
const lastSentByEmail = new Map<string, number>();

export function checkResendVerificationRateLimit(email: string): { allowed: boolean; retryAfterSeconds?: number } {
  const normalized = email.trim().toLowerCase();
  const now = Date.now();
  const last = lastSentByEmail.get(normalized);
  if (last == null) {
    return { allowed: true };
  }
  const elapsed = now - last;
  if (elapsed >= RESEND_WINDOW_MS) {
    return { allowed: true };
  }
  const retryAfterSeconds = Math.ceil((RESEND_WINDOW_MS - elapsed) / 1000);
  return { allowed: false, retryAfterSeconds };
}

export function recordResendVerificationSent(email: string): void {
  lastSentByEmail.set(email.trim().toLowerCase(), Date.now());
}
