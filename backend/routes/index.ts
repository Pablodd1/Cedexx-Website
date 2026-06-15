// ═══════════════════════════════════════════════
// CEDEXX Backend — Route Modules
// Express router modules for clean separation
// ═══════════════════════════════════════════════

import { Router, Request, Response } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';

export function createContactRouter(supabase: any, resend: any, config: any) {
  const router = Router();
  const { sendNotification, buildNotificationHtml, sanitizeText, getClientIp } = config.helpers;

  router.post('/',
    rateLimit({ windowMs: 15 * 60 * 1000, max: 10 }),
    [
      body('name').trim().isLength({ min: 2, max: 100 }),
      body('email').isEmail().normalizeEmail(),
      body('company').optional().trim().isLength({ max: 100 }),
      body('message').trim().isLength({ min: 10, max: 3000 }),
    ],
    async (req: Request, res: Response) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

      const data = {
        name: sanitizeText(req.body.name),
        email: req.body.email.toLowerCase().trim(),
        company: req.body.company ? sanitizeText(req.body.company) : null,
        message: sanitizeText(req.body.message),
        status: 'new',
        source: req.body.source || 'website',
        ip_address: getClientIp(req),
        user_agent: req.headers['user-agent']?.substring(0, 500) || null,
      };

      try {
        let dbResult = null;
        if (supabase) {
          const { data: inserted, error } = await supabase.from('contacts').insert(data).select().single();
          if (error) throw error;
          dbResult = inserted;
        }

        await sendNotification(
          `New Contact — ${data.name}`,
          buildNotificationHtml('Contact Form', {
            Name: data.name,
            Email: data.email,
            Company: data.company || '—',
            Message: data.message,
            ID: dbResult?.id || 'fallback'
          })
        );

        res.status(201).json({ success: true, message: 'Submitted successfully', id: dbResult?.id || null });
      } catch (err: any) {
        res.status(500).json({ success: false, error: 'Failed to process' });
      }
    }
  );

  return router;
}

export function createDemoRouter(supabase: any, resend: any, config: any) {
  const router = Router();
  const { sendNotification, buildNotificationHtml, sanitizeText, getClientIp } = config.helpers;

  router.post('/',
    rateLimit({ windowMs: 15 * 60 * 1000, max: 10 }),
    [
      body('name').trim().isLength({ min: 2, max: 100 }),
      body('email').isEmail().normalizeEmail(),
      body('facility_type').optional().trim(),
      body('notes').optional().trim().isLength({ max: 2000 }),
    ],
    async (req: Request, res: Response) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

      const data = {
        name: sanitizeText(req.body.name),
        email: req.body.email.toLowerCase().trim(),
        company: req.body.company ? sanitizeText(req.body.company) : null,
        facility_type: req.body.facility_type ? sanitizeText(req.body.facility_type) : null,
        preferred_date: req.body.preferred_date || null,
        preferred_time: req.body.preferred_time || null,
        notes: req.body.notes ? sanitizeText(req.body.notes) : null,
        status: 'pending',
        source: req.body.source || 'website',
        ip_address: getClientIp(req),
        user_agent: req.headers['user-agent']?.substring(0, 500) || null,
      };

      try {
        let dbResult = null;
        if (supabase) {
          const { data: inserted, error } = await supabase.from('demo_requests').insert(data).select().single();
          if (error) throw error;
          dbResult = inserted;
        }

        await sendNotification(
          `New Demo Request — ${data.name}`,
          buildNotificationHtml('Demo Request', {
            Name: data.name,
            Email: data.email,
            'Facility Type': data.facility_type || '—',
            Date: data.preferred_date || '—',
            Time: data.preferred_time || '—',
            Notes: data.notes || '—',
            ID: dbResult?.id || 'fallback'
          })
        );

        res.status(201).json({ success: true, message: 'Demo request submitted', id: dbResult?.id || null });
      } catch (err: any) {
        res.status(500).json({ success: false, error: 'Failed to process demo request' });
      }
    }
  );

  return router;
}

export function createEnrollRouter(supabase: any, resend: any, config: any) {
  const router = Router();
  const { sendNotification, buildNotificationHtml, sanitizeText, getClientIp } = config.helpers;

  router.post('/',
    rateLimit({ windowMs: 15 * 60 * 1000, max: 10 }),
    [
      body('first_name').trim().isLength({ min: 1, max: 50 }),
      body('last_name').trim().isLength({ min: 1, max: 50 }),
      body('email').isEmail().normalizeEmail(),
      body('role').isIn(['individual', 'hospitality', 'housing', 'affiliate']),
      body('plan').isIn(['family', 'individual']),
    ],
    async (req: Request, res: Response) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

      const data = {
        first_name: sanitizeText(req.body.first_name),
        last_name: sanitizeText(req.body.last_name),
        email: req.body.email.toLowerCase().trim(),
        phone: req.body.phone ? sanitizeText(req.body.phone) : null,
        date_of_birth: req.body.date_of_birth || null,
        role: req.body.role,
        plan: req.body.plan,
        status: 'pending_payment',
        source: req.body.source || 'website',
        ip_address: getClientIp(req),
        user_agent: req.headers['user-agent']?.substring(0, 500) || null,
      };

      try {
        let dbResult = null;
        if (supabase) {
          const { data: inserted, error } = await supabase.from('enrollments').insert(data).select().single();
          if (error) throw error;
          dbResult = inserted;
        }

        await sendNotification(
          `New Enrollment — ${data.first_name} ${data.last_name}`,
          buildNotificationHtml('New Enrollment', {
            Name: `${data.first_name} ${data.last_name}`,
            Email: data.email,
            Role: data.role,
            Plan: data.plan,
            ID: dbResult?.id || 'fallback'
          })
        );

        const planDetails: Record<string, any> = {
          family: { name: 'Family Plan', price: '$27.99/month', members: 'Up to 4' },
          individual: { name: 'Individual Plan', price: '$14.99/month', members: '1' },
        };

        res.status(201).json({
          success: true,
          message: 'Enrollment initiated',
          id: dbResult?.id || null,
          next_step: 'payment',
          plan_details: planDetails[data.plan]
        });
      } catch (err: any) {
        res.status(500).json({ success: false, error: 'Failed to process enrollment' });
      }
    }
  );

  return router;
}

export function createPartnerRouter(supabase: any, resend: any, config: any) {
  const router = Router();
  const { sendNotification, buildNotificationHtml, sanitizeText, getClientIp } = config.helpers;

  router.post('/',
    rateLimit({ windowMs: 15 * 60 * 1000, max: 10 }),
    [
      body('name').trim().isLength({ min: 2, max: 100 }),
      body('email').isEmail().normalizeEmail(),
      body('role').trim().isLength({ min: 1, max: 100 }),
      body('message').trim().isLength({ min: 10, max: 3000 }),
    ],
    async (req: Request, res: Response) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

      const data = {
        name: sanitizeText(req.body.name),
        email: req.body.email.toLowerCase().trim(),
        phone: req.body.phone ? sanitizeText(req.body.phone) : null,
        role: sanitizeText(req.body.role),
        organization: req.body.organization ? sanitizeText(req.body.organization) : null,
        message: sanitizeText(req.body.message),
        status: 'new',
        source: req.body.source || 'website',
        ip_address: getClientIp(req),
        user_agent: req.headers['user-agent']?.substring(0, 500) || null,
      };

      try {
        let dbResult = null;
        if (supabase) {
          const { data: inserted, error } = await supabase.from('partner_inquiries').insert(data).select().single();
          if (error) throw error;
          dbResult = inserted;
        }

        await sendNotification(
          `New Partnership — ${data.name}`,
          buildNotificationHtml('Partnership Inquiry', {
            Name: data.name,
            Email: data.email,
            Role: data.role,
            Organization: data.organization || '—',
            Message: data.message,
            ID: dbResult?.id || 'fallback'
          })
        );

        res.status(201).json({ success: true, message: 'Inquiry submitted', id: dbResult?.id || null });
      } catch (err: any) {
        res.status(500).json({ success: false, error: 'Failed to process inquiry' });
      }
    }
  );

  return router;
}

export function createAdminRouter(supabase: any, requireAdmin: any) {
  const router = Router();

  // Dashboard overview
  router.get('/dashboard', async (req: Request, res: Response) => {
    try {
      if (!supabase) return res.json({ success: true, data: { fallback: true } });

      const tables = ['contacts', 'demo_requests', 'enrollments', 'partner_inquiries', 'analytics_events'];
      const counts: Record<string, any> = {};
      for (const t of tables) {
        const { count } = await supabase.from(t).select('*', { count: 'exact', head: true });
        counts[t] = count || 0;
      }

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recent = await Promise.all(
        tables.filter(t => t !== 'analytics_events').map(async (table: string) => {
          const { data } = await supabase.from(table)
            .select('*')
            .gte('created_at', sevenDaysAgo.toISOString())
            .order('created_at', { ascending: false })
            .limit(5);
          return { table, data: data || [] };
        })
      );

      res.json({
        success: true,
        data: {
          counts,
          recent_submissions: Object.fromEntries(recent.map((r: any) => [r.table, r.data])),
          last_updated: new Date().toISOString()
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // List table records
  router.get('/:table', async (req: Request, res: Response) => {
    const allowed = ['contacts', 'demo_requests', 'enrollments', 'partner_inquiries', 'analytics_events'];
    const table = req.params.table as string;
    if (!allowed.includes(table)) return res.status(400).json({ error: 'Invalid table' });

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const status = req.query.status as string;
    const search = req.query.search as string;

    try {
      if (!supabase) return res.json({ success: true, data: [], fallback: true });

      let query = supabase.from(table as string).select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (status) query = query.eq('status', status as string);
      if (search) query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,message.ilike.%${search}%`);

      const { data, error, count } = await query;
      if (error) throw error;

      res.json({
        success: true,
        data,
        pagination: { page, limit, total: count || 0, total_pages: Math.ceil((count || 0) / limit) }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Update record
  router.patch('/:table/:id', async (req: Request, res: Response) => {
    const allowed = ['contacts', 'demo_requests', 'enrollments', 'partner_inquiries'];
    if (!allowed.includes(req.params.table as string)) return res.status(400).json({ error: 'Invalid table' });

    try {
      if (!supabase) return res.json({ success: true, message: 'Fallback mode' });
      const { data, error } = await supabase
        .from(req.params.table as string)
        .update({ ...req.body, updated_at: new Date().toISOString() })
        .eq('id', req.params.id as string)
        .select().single();
      if (error) throw error;
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Delete record
  router.delete('/:table/:id', async (req: Request, res: Response) => {
    const allowed = ['contacts', 'demo_requests', 'enrollments', 'partner_inquiries'];
    if (!allowed.includes(req.params.table as string)) return res.status(400).json({ error: 'Invalid table' });

    try {
      if (!supabase) return res.json({ success: true, message: 'Fallback mode' });
      const { error } = await supabase.from(req.params.table as string).delete().eq('id', req.params.id as string);
      if (error) throw error;
      res.json({ success: true, message: 'Deleted' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Analytics summary
  router.get('/analytics/summary', async (req: Request, res: Response) => {
    const days = Math.min(90, Math.max(1, parseInt(req.query.days as string) || 30));
    try {
      if (!supabase) return res.json({ success: true, data: [], fallback: true });

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: events } = await supabase
        .from('analytics_events')
        .select('event_type, created_at')
        .gte('created_at', startDate.toISOString());

      const daily: Record<string, any> = {};
      const eventTypes: Record<string, any> = {};
      (events || []).forEach((e: any) => {
        const day = e.created_at.split('T')[0];
        if (!daily[day]) daily[day] = {};
        if (!daily[day][e.event_type]) daily[day][e.event_type] = 0;
        daily[day][e.event_type]++;
        if (!eventTypes[e.event_type]) eventTypes[e.event_type] = 0;
        eventTypes[e.event_type]++;
      });

      res.json({
        success: true,
        data: {
          period_days: days,
          daily_breakdown: daily,
          event_type_summary: eventTypes,
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  return router;
}
