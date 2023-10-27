import { rateLimit } from "express-rate-limit";

const rateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 10 minutes).
  standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  message: "Too many requests, please try again in 10 minutes.",
  // store: ... , // Use an external store for consistency across multiple server instances.
});

export default rateLimiter;
