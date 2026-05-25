/**
 * In-Memory Challenge Store with TTL
 *
 * Stores WebAuthn challenges temporarily to prevent replay attacks.
 * Each challenge is stored with an expiration time.
 *
 * Production Note: For scaling to multiple servers, replace with Redis
 */

class ChallengeStore {
  constructor(ttlSeconds = 300) {
    this.challenges = new Map(); // key: challengeKey, value: { challenge, expiresAt }
    this.ttlSeconds = ttlSeconds; // Default: 5 minutes
  }

  /**
   * Store a challenge for a specific email + type (registration/login)
   * @param email - User email
   * @param type - 'registration' or 'login'
   * @param challenge - Challenge from SimpleWebAuthn
   * @returns challengeKey to send to frontend
   */
  store(email, type, challenge) {
    const challengeKey = `${email}:${type}`;
    const expiresAt = Date.now() + this.ttlSeconds * 1000;

    this.challenges.set(challengeKey, {
      challenge,
      expiresAt,
      createdAt: Date.now(),
    });

    console.log(`💾 Challenge stored for ${email} (${type})`);
    return challengeKey;
  }

  /**
   * Retrieve and verify a challenge
   * @param email - User email
   * @param type - 'registration' or 'login'
   * @returns challenge if valid, null if expired/not found
   */
  get(email, type) {
    const challengeKey = `${email}:${type}`;
    const stored = this.challenges.get(challengeKey);

    if (!stored) {
      console.warn(`⚠️ Challenge not found for ${email} (${type})`);
      return null;
    }

    // Check if expired
    if (Date.now() > stored.expiresAt) {
      console.warn(`⚠️ Challenge expired for ${email} (${type})`);
      this.challenges.delete(challengeKey);
      return null;
    }

    return stored.challenge;
  }

  /**
   * Remove a challenge after verification (one-time use)
   * @param email - User email
   * @param type - 'registration' or 'login'
   */
  remove(email, type) {
    const challengeKey = `${email}:${type}`;
    this.challenges.delete(challengeKey);
    console.log(`🗑️ Challenge removed for ${email} (${type})`);
  }

  /**
   * Clean up expired challenges (optional maintenance)
   * Could be called periodically via cron job
   */
  cleanup() {
    let removed = 0;
    const now = Date.now();

    for (const [key, value] of this.challenges.entries()) {
      if (now > value.expiresAt) {
        this.challenges.delete(key);
        removed++;
      }
    }

    if (removed > 0) {
      console.log(`🧹 Cleaned up ${removed} expired challenges`);
    }
  }
}

// Singleton instance
export const challengeStore = new ChallengeStore(300); // 5-minute TTL
