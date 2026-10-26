import rateLimit from "express-rate-limit";

const msg = (m: string) => ({ success: false, message: m });

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: msg("Too many login attempts. Try again after 15 minutes."),
});

export const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: msg("Too many attempts. Try again after 15 minutes."),
});

export const publicFormLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: msg("Too many requests from this network. Please call us instead."),
});
