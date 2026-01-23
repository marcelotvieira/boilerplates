/**
 * Generate a random numeric verification code
 * @param length Length of the code (default: 6)
 * @returns String with random digits
 */
export function generateVerificationCode(length: number = 6): string {
  let code = ''
  for (let i = 0; i < length; i++) {
    code += Math.floor(Math.random() * 10).toString()
  }
  return code
}

/**
 * Calculate expiration date for verification codes
 * @param minutes Minutes until expiration
 * @returns Date object with expiration time
 */
export function calculateCodeExpiration(minutes: number): Date {
  const now = new Date()
  return new Date(now.getTime() + minutes * 60 * 1000)
}

/**
 * Check if a code has expired
 * @param expiresAt Expiration date
 * @returns true if expired, false otherwise
 */
export function isCodeExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt
}
