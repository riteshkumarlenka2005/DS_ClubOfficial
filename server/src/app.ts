import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import { env } from './config/env';
import { registerRoutes } from './routes';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';
import { apiLimiter } from './middlewares/rateLimit.middleware';

const app = express();

// ==========================================
// GLOBAL MIDDLEWARE
// ==========================================

// Trust proxy — required for Railway/Vercel (reverse proxy)
// Ensures express-rate-limit reads X-Forwarded-For correctly
app.set('trust proxy', 1);

// Security headers
app.use(helmet());

// CORS — allow frontend origins (with and without www)
const allowedOrigins = [
  env.CLIENT_URL,
  env.CLIENT_URL.replace('://www.', '://'),
  env.CLIENT_URL.replace('://', '://www.'),
].filter((v, i, a) => a.indexOf(v) === i);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true, // Required for cookies
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Parse cookies
app.use(cookieParser());

// Request logging
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting
app.use('/api', apiLimiter);

// ==========================================
// HEALTH CHECK
// ==========================================
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'DSC GIETU API is running',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// ==========================================
// REGISTER ALL ROUTES
// ==========================================
registerRoutes(app);

// ==========================================
// ERROR HANDLING
// ==========================================
app.use(notFoundHandler);
app.use(errorHandler);

export default app;

