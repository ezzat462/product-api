import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';
import { notFound } from './middlewares/notFound';
import { serveSwagger, setupSwagger } from './config/swagger';

dotenv.config();

const app: Application = express();

// Middlewares
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*'
  })
);
app.use(express.json());

// API Documentation
app.use('/api-docs', serveSwagger, setupSwagger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount API routes
app.use('/api', routes);

// 404 Route handler
app.use(notFound);

// Centralized Error handling middleware
app.use(errorHandler);

export default app;
