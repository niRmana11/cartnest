/**
 * In-Memory Challenge Store with TTL
 *
 */

class ChallengeStore {
  constructor(ttlSeconds = 300) {
    this.challenges = new Map(); 
    this.ttlSeconds = ttlSeconds; 
  }

  /**
   * Store a challenge for a specific email + type (registration/login)
   * @param email 
   * @param type 
   * @param challenge 
   * @returns 
   */
  store(email, type, challenge) {
    const challengeKey = `${email}:${type}`;
    const expiresAt = Date.now() + this.ttlSeconds * 1000;

    this.challenges.set(challengeKey, {
      challenge,
      expiresAt,
      createdAt: Date.now(),
    });

    console.log(`Challenge stored for ${email} (${type})`);
    return challengeKey;
  }

  /**
   * Retrieve and verify a challenge
   * @param email 
   * @param type 
   * @returns 
   */
  get(email, type) {
    const challengeKey = `${email}:${type}`;
    const stored = this.challenges.get(challengeKey);

    if (!stored) {
      console.warn(`Challenge not found for ${email} (${type})`);
      return null;
    }

    // Check if expired
    if (Date.now() > stored.expiresAt) {
      console.warn(`Challenge expired for ${email} (${type})`);
      this.challenges.delete(challengeKey);
      return null;
    }

    return stored.challenge;
  }

  /**
   * Remove a challenge after verification (one-time use)
   * @param email 
   * @param type 
   */
  remove(email, type) {
    const challengeKey = `${email}:${type}`;
    this.challenges.delete(challengeKey);
    console.log(`Challenge removed for ${email} (${type})`);
  }

  /**
   * Clean up expired challenges (optional maintenance)
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
      console.log(`Cleaned up ${removed} expired challenges`);
    }
  }
}

// Singleton instance
export const challengeStore = new ChallengeStore(300);
