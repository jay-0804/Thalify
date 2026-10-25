import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import morgan from 'morgan';
import { env } from './config/env.js';
import { ApiError } from './utils/ApiError.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import healthRoutes from './routes/health.routes.js';
import authRoutes from './routes/auth.routes.js';
import publicRoutes from './routes/public.routes.js';
import providerRoutes from './routes/provider.routes.js';
import subscriptionRoutes from './routes/subscriptions.routes.js';
import mealRoutes from './routes/meals.routes.js';
import billingRoutes from './routes/billing.routes.js';
import deliveryRoutes from './routes/delivery.routes.js';

const app = express();

// Security HTTP headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or Postman) or matching CLIENT_URL
      if (!origin || origin === env.CLIENT_URL || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS'));
      }
    },
    credentials: true,
  })
);

// Logging
if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body parsers
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Sanitize against NoSQL query injection
app.use(mongoSanitize());

// API Routes mounting
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/providers', publicRoutes);
app.use('/api/provider', providerRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/delivery', deliveryRoutes);

// Catch 404 for unmapped routes
app.use((req, res, next) => {
  next(ApiError.notFound(`Cannot ${req.method} ${req.originalUrl}`));
});

// Central error handler
app.use(errorHandler);

export { app };
export default app;
