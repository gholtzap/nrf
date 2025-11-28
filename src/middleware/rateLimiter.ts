import rateLimit from 'express-rate-limit';
import { configService } from '../services/configService';

const config = configService.get();

export const rateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    type: 'application/problem+json',
    title: 'Too Many Requests',
    status: 429,
    detail: `Too many requests from this IP, please try again later. Limit: ${config.rateLimit.maxRequests} requests per ${config.rateLimit.windowMs / 1000} seconds.`
  },
  skip: () => !config.rateLimit.enabled
});
