import { logger } from '../utils/logger';

export const connectDatabase = (): void => {
  import mongoose from 'mongoose';
  
  const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/arcium-privacy-service';
  
  mongoose.connect(DB_URI)
    .then(() => {
      logger.info('MongoDB connected successfully');
    })
    .catch((error) => {
      logger.error('MongoDB connection failed:', error);
      process.exit(1);
    });
};