/**
 * Simple in-memory rate limiter for Next.js API routes
 * Uses a sliding window approach
 */

// Store request counts per user
const requestCounts = new Map();

// Configuration
const RATE_LIMITS = {
    'gmail-scan': { maxRequests: 5, windowMs: 60 * 1000 },      // 5 scans per minute
    'add-job': { maxRequests: 30, windowMs: 60 * 1000 },        // 30 jobs per minute
    'update-job': { maxRequests: 60, windowMs: 60 * 1000 },     // 60 updates per minute
    'default': { maxRequests: 100, windowMs: 60 * 1000 }        // 100 requests per minute
};

/**
 * Check if a request should be rate limited
 * @param {string} userId - The user's ID
 * @param {string} action - The action being performed (e.g., 'gmail-scan')
 * @returns {{ allowed: boolean, remaining: number, resetIn: number }}
 */
export function checkRateLimit(userId, action = 'default') {
    const config = RATE_LIMITS[action] || RATE_LIMITS.default;
    const key = `${userId}:${action}`;
    const now = Date.now();

    // Get or create user's request history
    let userRequests = requestCounts.get(key);

    if (!userRequests) {
        userRequests = { timestamps: [], windowStart: now };
        requestCounts.set(key, userRequests);
    }

    // Remove expired timestamps (outside the window)
    userRequests.timestamps = userRequests.timestamps.filter(
        ts => now - ts < config.windowMs
    );

    // Check if rate limited
    if (userRequests.timestamps.length >= config.maxRequests) {
        const oldestRequest = userRequests.timestamps[0];
        const resetIn = Math.ceil((oldestRequest + config.windowMs - now) / 1000);

        return {
            allowed: false,
            remaining: 0,
            resetIn: resetIn,
            limit: config.maxRequests
        };
    }

    // Add current request
    userRequests.timestamps.push(now);

    return {
        allowed: true,
        remaining: config.maxRequests - userRequests.timestamps.length,
        resetIn: Math.ceil(config.windowMs / 1000),
        limit: config.maxRequests
    };
}

/**
 * Clean up old entries periodically (call this in a setInterval or cron job)
 */
export function cleanupRateLimits() {
    const now = Date.now();
    const maxWindow = Math.max(...Object.values(RATE_LIMITS).map(r => r.windowMs));

    for (const [key, data] of requestCounts.entries()) {
        // Remove entries that haven't been accessed in 2x the max window
        if (data.timestamps.length === 0 ||
            now - data.timestamps[data.timestamps.length - 1] > maxWindow * 2) {
            requestCounts.delete(key);
        }
    }
}

/**
 * Get rate limit configuration for an action
 */
export function getRateLimitConfig(action) {
    return RATE_LIMITS[action] || RATE_LIMITS.default;
}

/**
 * Create rate limit headers for response
 */
export function rateLimitHeaders(result, action = 'default') {
    const config = RATE_LIMITS[action] || RATE_LIMITS.default;
    return {
        'X-RateLimit-Limit': config.maxRequests.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': result.resetIn.toString()
    };
}
