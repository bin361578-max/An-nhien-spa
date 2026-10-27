import type { Request, Response } from 'express';
import { app } from '../src/server/app';

// Vercel Serverless Function catch-all entry point for /api/*
export default function handler(req: Request, res: Response) {
  const matchedPath = req.headers['x-matched-path'];
  if (typeof matchedPath === 'string' && matchedPath.startsWith('/api')) {
    req.url = matchedPath;
  }
  return app(req, res);
}
