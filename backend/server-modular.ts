/**
 * ═══════════════════════════════════════════════
 * CEDEXX Backend — Modular Server Entry Point
 * ═══════════════════════════════════════════════
 * Clean separation using route modules from ./routes/
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import {
  createContactRouter,
  createDemoRouter,
  createEnrollRouter,
  createPartnerRouter,
  createAdminRouter,
  createStripeRouter
} from './routes';

dotenv.config();

const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';
const ADMIN_SECRET = process.env.ADMIN_SECRET || '';

// ── CLIENTS ───────────────────────────────────
const app = express();
let supabase: SupabaseClient | null = null;
let resend: Resend | null = null;
let stripe: Stripe | null = null;

if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}
if (RESEND_API_KEY) {
  resend = new Resend(RESEND_API_KEY);
}
if (STRIPE_SECRET_KEY) {
  stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2025-06-30.basil' as any });
}

// ── HELPERS ─────────────────────────────────
function sanitizeText(input: string): string {
  return input?.replace(/[<>]/g, '').trim().substring(0, 5000) || '';
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
  if (Array.isArray(forwarded)) return forwarded[0].trim();
  return req.socket.remoteAddress || 'unknown';
}

async function sendNotification(subject: string, htmlBody: string, recipient = 'info@cedexx.net'): Promise<boolean> {
  try {
    if (resend) {
      await resend.emails.send({
        from: 'CEDEXX <notifications@cedexx.net>',
        to: [recipient],
        subject,
        html: htmlBody,
      });
      return true;
    }
    console.log('[EMAIL]', { subject, body: htmlBody.substring(0, 100) });
    return false;
  } catch (err) {
    console.error('[EMAIL ERR]', err);
    return false;
  }
}

function buildNotificationHtml(title: string, fields: Record<string, string>): string {
  const rows = Object.entries(fields)
    .map(([k, v]) => `<tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold;background:#f8fafc;width:30%">${k}</td><td style="padding:8px;border:1px solid #e2e8f0">${v || 'N/A'}</td></tr>`)
    .join('');
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
      <div style="background:#050249;color:white;padding:20px 24px"><h2 style="margin:0;font-size:18px">${title}</h2></div>
      <table style="width:100%;border-collapse:collapse;font-size:14px">${rows}</table>
      <div style="padding:16px 24px;background:#f8fafc;font-size:11px;color:#64748b">
        <p>HIPAA Notice: Non-PHI contact info only.</p>
      </div>
    </div>`;
}

const helpers = { sanitizeText, isValidEmail, getClientIp, sendNotification, buildNotificationHtml };

// ── AUTH ──────────────────────────────────────
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = (req.headers['x-admin-token'] as string) || (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ success: false, error: 'Admin token required' });
  if (token !== ADMIN_TOKEN && token !== ADMIN_SECRET) return res.status(403).json({ success: false, error: 'Invalid token' });
  next();
}

// ── MIDDLEWARE ────────────────────────────────
app.use(helmet({ contentSecurityPolicy: NODE_ENV === 'production', crossOriginEmbedderPolicy: false }));
app.use(cors({
  origin: ['https://cedexx.net', 'https://www.cedexx.net', 'http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Admin-Token'],
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
  max: parseInt(process.env.RATE_LIMIT_MAX || '30'),
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => res.status(429).json({ success: false, error: 'Too many requests' }),
});
app.use('/api/', limiter);

// ── ROUTES ────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({
  success: true, status: 'healthy', timestamp: new Date().toISOString(), version: '1.0.0',
  services: { supabase: !!supabase, resend: !!resend, stripe: !!stripe }
}));

app.use('/api/contact', createContactRouter(supabase, resend, { helpers }));
app.use('/api/demo', createDemoRouter(supabase, resend, { helpers }));
app.use('/api/enroll', createEnrollRouter(supabase, resend, { helpers }));
app.use('/api/partner', createPartnerRouter(supabase, resend, { helpers }));
app.use('/api/stripe', createStripeRouter(supabase, stripe));
app.use('/api/admin', requireAdmin, createAdminRouter(supabase, requireAdmin));

// ── ERRORS ────────────────────────────────────
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[SERVER ERROR]', err);
  res.status(500).json({ success: false, error: NODE_ENV === 'production' ? 'Internal server error' : err.message });
});
app.use((_req: Request, res: Response) => res.status(404).json({ success: false, error: 'Endpoint not found' }));

// ── START ─────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n╔═══════════════════════════════════════════════╗
║  CEDEXX Backend API v1.0.0                    ║
║  Port: ${PORT.toString().padEnd(38, ' ')}║
║  Environment: ${NODE_ENV.padEnd(30, ' ')}║
║  Supabase: ${(!!supabase ? 'connected' : 'fallback').padEnd(32, ' ')}║
║  Resend: ${(!!resend ? 'connected' : 'fallback').padEnd(34, ' ')}║
╚═══════════════════════════════════════════════╝
  `);
});

export default app;
