process.on('uncaughtException', (error) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', { name: error.name, message: error.message, stack: error.stack });
  // Give the logger a moment to flush its output before exiting
  setTimeout(() => {
    process.exit(1); // Exit process with failure
  }, 1000);
});

process.on('unhandledRejection', (reason: Error, promise: Promise<any>) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...', { reason: reason.message, stack: reason.stack, promise });
  // Give the logger a moment to flush its output before exiting
  setTimeout(() => {
    process.exit(1); // Exit process with failure
  }, 1000);
});

require('dotenv').config(); // Load environment variables first

console.log('Server script started execution.'); // Debugging line

import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { rateLimit } from 'express-rate-limit';
import { router } from './api/routes';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import { connectDatabase } from './config/database';
import { initializeServices } from './services';



const app: Application = express();
const PORT: number = parseInt(process.env.PORT || '8080', 10);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS configuration
// IMPORTANT: In production, configure CORS_ORIGIN to explicitly list allowed frontend domains for security.
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Initialize database
try {
  connectDatabase();
  logger.info('Database connected successfully.');
} catch (error: unknown) {
  logger.error('Failed to connect to database:', (error as Error).message);
  process.exit(1); // Exit process if database connection fails
}

// Initialize services
try {
  initializeServices();
  logger.info('Services initialized successfully.');
} catch (error: unknown) {
  logger.error('Failed to initialize services:', (error as Error).message);
  process.exit(1); // Exit process if service initialization fails
}

// Swagger documentation
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Arcium Privacy-as-a-Service API',
            version: '1.0.0',
            description: 'API for external dApps to access Arcium privacy features',
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
                description: 'Development server',
            },
        ],
    },
    apis: ['./src/api/routes/*.ts', './src/controllers/*.ts'], // files containing OpenAPI definitions
};
const specs = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// API routes
app.use('/api/v1', router);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: 'Arcium Privacy-as-a-Service API is running'
  });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Error handling middleware
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
  logger.info(`Arcium Privacy-as-a-Service Server running on port ${PORT}`);
  logger.info(`API Documentation available at http://localhost:${PORT}/api-docs`);
});

export default app;