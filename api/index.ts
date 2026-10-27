import type { Request, Response } from 'express';
import { app } from '../src/server/app';

// Vercel Serverless Function entry point
export default function handler(req: Request, res: Response) {
  // If Vercel passed the original matched path in headers, use it
  const matchedPath = req.headers['x-matched-path'];
  if (typeof matchedPath === 'string' && matchedPath.startsWith('/api')) {
    req.url = matchedPath;
  }
  return app(req, res);
}
