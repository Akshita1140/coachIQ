import rateLimit from "express-rate-limit";

/**
 * Rate limiter for Groq-backed routes.
 * Must run AFTER requireAuth, since it keys on req.user.uid.
 * Falls back to IP if, for some reason, req.user isn't set.
 *
 * Limits: 20 requests per 5 minutes per user.
 * Tune these numbers based on how many people are testing during the hackathon.
 */
export const groqRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20,
  standardHeaders: true, // return rate limit info in RateLimit-* headers
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.uid || req.ip,
  message: {
    error: "You're going a bit fast! Please wait a few minutes before trying again.",
  },
  handler: (req, res, next, options) => {
    console.warn(`[rateLimit] Blocked request from user: ${req.user?.uid || req.ip}`);
    res.status(429).json(options.message);
  },
});