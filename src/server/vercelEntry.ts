import type { Request, Response } from 'express';
import { app } from './app';

// Vercel Serverless Function entry point
export default function handler(req: Request, res: Response) {
  // If Vercel rewrote /api/(.*) to /api/index, restore the matched path from header
  const matchedPath = req.headers['x-matched-path'];
  if (typeof matchedPath === 'string' && matchedPath.startsWith('/api')) {
    req.url = matchedPath;
  }
  return app(req, res);
}
