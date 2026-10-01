#!/usr/bin/env node
/**
 * jev-audit.mjs — Jev System-1 powered web error monitor for CEDEXX
 *
 * Uses TypeSafe's Jev model (System One) for fast, structured error
 * classification on key routes. Falls back to heuristic mode when
 * TYPESAFE_API_KEY is not set.
 *
 * Usage:
 *   node scripts/jev-audit.mjs
 *   BASE_URL=https://cedexx.net node scripts/jev-audit.mjs
 *   TYPESAFE_API_KEY=... node scripts/jev-audit.mjs
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ─── Configuration ──────────────────────────────────────────────────────────

const BASE_URL = (process.env.BASE_URL || 'https://www.cedexx.net').replace(/\/$/, '');
const TYPESAFE_API_KEY = process.env.TYPESAFE_API_KEY || '';
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || 'jasmelacosta@gmail.com';
const JEV_MODEL = process.env.JEV_MODEL || 'jev-1.13.0';
const NOTIFY_WEBHOOK = process.env.NOTIFY_WEBHOOK || '';

const ROUTES = [
  { path: '/', label: 'Homepage', critical: true },
  { path: '/categories', label: 'Categories', critical: false },
  { path: '/products', label: 'Products', critical: false },
  { path: '/contact', label: 'Contact', critical: true },
  { path: '/sitemap.xml', label: 'Sitemap', critical: false },
  { path: '/robots.txt', label: 'Robots', critical: false },
];

// ─── Types ──────────────────────────────────────────────────────────────────

/**
 * @typedef {Object} RouteResult
 * @property {string} path
 * @property {string} label
 * @property {number} status
 * @property {number} responseTimeMs
 * @property {boolean} ok
 * @property {string[]} errors
 * @property {boolean} is_operational
 * @property {string} severity
 * @property {boolean} should_alert
 * @property {string} classification
 * @property {boolean} usedFallback
 */

// ─── Heuristic Classifier (fallback) ───────────────────────────────────────

function heuristicClassify(status, errors, responseTimeMs, critical) {
  const isOperational = status >= 200 && status < 400;
  let severity = 'none';
  let shouldAlert = false;

  if (status >= 500) {
    severity = 'critical';
    shouldAlert = true;
  } else if (status === 404) {
    severity = critical ? 'high' : 'medium';
    shouldAlert = critical;
  } else if (status === 403 || status === 401) {
    severity = 'medium';
    shouldAlert = false;
  } else if (status >= 400) {
    severity = 'medium';
    shouldAlert = critical;
  } else if (responseTimeMs > 5000) {
    severity = 'low';
    shouldAlert = false;
  }

  const classification = !isOperational
    ? 'down'
    : severity === 'critical'
      ? 'server_error'
      : severity === 'high'
        ? 'missing_critical'
        : severity === 'medium'
          ? 'degraded'
          : 'healthy';

  return { is_operational: isOperational, severity, should_alert: shouldAlert, classification };
}

// ─── Jev Classifier (System One) ────────────────────────────────────────────

async function jevClassify(route, status, errors, responseTimeMs) {
  const state = JSON.stringify({
    route: route.path,
    label: route.label,
    http_status: status,
    response_time_ms: responseTimeMs,
    critical: route.critical,
    errors: errors.slice(0, 5),
    body_excerpt: '',
  });

  const questions = {
    is_operational: {
      type: 'noul',
      instructions: 'Is the web route operational and serving content correctly? A route is operational if it returns HTTP 200-399 without server errors.',
    },
    severity: {
      type: 'choice',
      instructions: 'Given the HTTP status, response time, and errors, what is the severity of this route issue?',
      criteria: {
        none: 'Route is healthy, no action needed',
        low: 'Minor issue, monitor but no immediate action',
        medium: 'Noticeable problem that should be investigated soon',
        high: 'Important route is broken or degraded, needs attention',
        critical: 'Severe outage or data loss risk, immediate action required',
      },
    },
    should_alert: {
      type: 'noul',
      instructions: 'Should the on-call team be alerted about this route right now? Alert if the route is critical and down, or if any route returns 5xx errors.',
    },
    classification: {
      type: 'choice',
      instructions: 'Classify the type of issue found on this route.',
      criteria: {
        healthy: 'Route is working normally',
        down: 'Route returns 5xx or connection failure',
        missing_critical: 'A critical page returns 404',
        degraded: 'Route works but has performance or partial errors',
        slow: 'Route is functional but response time is excessive (>5s)',
        misconfigured: 'Auth, redirect, or configuration issue (401/403/redirect loops)',
      },
    },
  };

  const res = await fetch('https://api.typesafe.ai/v1/systemone', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TYPESAFE_API_KEY}`,
    },
    body: JSON.stringify({ model: JEV_MODEL, state, questions }),
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Jev API ${res.status}: ${body.slice(0, 200)}`);
  }

  const data = await res.json();
  const a = data.answers || {};

  return {
    is_operational: a.is_operational ? a.is_operational.noul > 0.5 : status < 400,
    severity: a.severity?.choice || 'unknown',
    should_alert: a.should_alert ? a.should_alert.noul > 0.5 : false,
    classification: a.classification?.choice || 'unknown',
  };
}

// ─── Route Prober ───────────────────────────────────────────────────────────

async function probeRoute(route) {
  const url = `${BASE_URL}${route.path}`;
  const errors = [];
  const start = performance.now();

  let status = 0;
  let body = '';

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(15_000),
      headers: { 'User-Agent': 'CEDEXX-JevMonitor/1.0' },
      redirect: 'follow',
    });
    status = res.status;
    body = (await res.text()).slice(0, 5000);
  } catch (err) {
    errors.push(err.message || String(err));
    status = 0;
  }

  const responseTimeMs = Math.round(performance.now() - start);

  // Content checks
  if (status >= 200 && status < 400) {
    if (route.path === '/sitemap.xml' && !body.includes('<urlset') && !body.includes('<sitemapindex')) {
      errors.push('Invalid sitemap: missing <urlset> or <sitemapindex>');
    }
    if (route.path === '/robots.txt' && !body.includes('User-agent')) {
      errors.push('Invalid robots.txt: missing User-agent');
    }
    if (route.critical && route.path === '/' && body.length < 500) {
      errors.push('Homepage content suspiciously small (<500 chars)');
    }
  }

  return { route, status, errors, responseTimeMs, body };
}

// ─── Notification ───────────────────────────────────────────────────────────

async function sendNotification(results) {
  const alerts = results.filter((r) => r.should_alert);
  if (alerts.length === 0) return;

  const lines = alerts
    .map(
      (r) =>
        `• ${r.label} (${r.path}) — HTTP ${r.status}, severity: ${r.severity}, class: ${r.classification}`
    )
    .join('\n');

  const subject = `🚨 CEDEXX Jev Monitor — ${alerts.length} alert${alerts.length > 1 ? 's' : ''}`;
  const text = `Jev detected issues on ${BASE_URL}:\n\n${lines}\n\nFull audit run at ${new Date().toISOString()}`;

  // Webhook notification
  if (NOTIFY_WEBHOOK) {
    try {
      await fetch(NOTIFY_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, text, alerts, base_url: BASE_URL, ts: new Date().toISOString() }),
      });
      console.log('📡 Webhook notification sent');
    } catch (err) {
      console.error('Webhook failed:', err.message);
    }
  }

  // Resend email notification
  if (RESEND_API_KEY && NOTIFICATION_EMAIL) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'CEDEXX Monitor <monitor@cedexx.net>',
          to: [NOTIFICATION_EMAIL],
          subject,
          text,
        }),
      });
      if (res.ok) {
        console.log('📧 Email notification sent to', NOTIFICATION_EMAIL);
      } else {
        console.error('Resend error:', res.status, await res.text().slice(0, 200));
      }
    } catch (err) {
      console.error('Email notification failed:', err.message);
    }
  }

  if (!RESEND_API_KEY && !NOTIFY_WEBHOOK) {
    console.log('📋 Alerts detected (no notification channel configured):');
    console.log(text);
  }
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const mode = TYPESAFE_API_KEY ? 'jev' : 'heuristic';
  console.log(`\n🔍 CEDEXX Jev Audit — ${BASE_URL}`);
  console.log(`   Mode: ${mode}${mode === 'jev' ? ` (${JEV_MODEL})` : ' (fallback — set TYPESAFE_API_KEY for Jev)'}`);
  console.log(`   Time: ${new Date().toISOString()}\n`);

  const results = [];

  for (const route of ROUTES) {
    const probe = await probeRoute(route);
    let classification;
    let usedFallback = false;

    if (TYPESAFE_API_KEY) {
      try {
        classification = await jevClassify(
          probe.route,
          probe.status,
          probe.errors,
          probe.responseTimeMs
        );
      } catch (err) {
        console.warn(`   ⚠️  Jev failed for ${route.path}: ${err.message}. Using heuristic.`);
        classification = heuristicClassify(
          probe.status,
          probe.errors,
          probe.responseTimeMs,
          route.critical
        );
        usedFallback = true;
      }
    } else {
      classification = heuristicClassify(
        probe.status,
        probe.errors,
        probe.responseTimeMs,
        route.critical
      );
      usedFallback = true;
    }

    const result = {
      path: route.path,
      label: route.label,
      status: probe.status,
      responseTimeMs: probe.responseTimeMs,
      ok: probe.status >= 200 && probe.status < 400 && probe.errors.length === 0,
      errors: probe.errors,
      ...classification,
      usedFallback,
    };
    results.push(result);

    const icon = result.ok ? '✅' : result.severity === 'critical' ? '🔴' : result.severity === 'high' ? '🟠' : result.severity === 'medium' ? '🟡' : '🟢';
    console.log(
      `   ${icon} ${result.label.padEnd(14)} ${result.status || 'ERR'}  ${result.responseTimeMs}ms  ${result.classification}${usedFallback ? ' (heuristic)' : ''}`
    );
    if (result.errors.length > 0) {
      result.errors.forEach((e) => console.log(`      ↳ ${e}`));
    }
  }

  // Summary
  const errorCount = results.filter((r) => !r.ok).length;
  const alertCount = results.filter((r) => r.should_alert).length;
  const totalTime = results.reduce((s, r) => s + r.responseTimeMs, 0);

  console.log(`\n   ──────────────────────────────`);
  console.log(`   Routes checked: ${results.length}`);
  console.log(`   Errors: ${errorCount}`);
  console.log(`   Alerts: ${alertCount}`);
  console.log(`   Total probe time: ${totalTime}ms`);

  await sendNotification(results);

  // Exit code for CI
  process.exit(errorCount > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(2);
});
