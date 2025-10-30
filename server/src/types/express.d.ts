import { Request } from 'express';

// Placeholder for User interface - adjust based on your actual User model
interface User {
  id: string;
  // Add other user properties here if needed
}

declare global {
  namespace Express {
    interface Request {
      user?: User | { id: string }; // depends on how you attach the user
    }
  }
}