/**
 * ═══════════════════════════════════════════════════════════
 * CEDEXX Agentic Website Engine v2.0
 * ═══════════════════════════════════════════════════════════
 * 
 * Self-optimizing website engine that tracks visitor behavior,
 * analyzes patterns, and auto-optimizes the site in real-time.
 * 
 * Key capabilities:
 *   • Real-time visitor behavior tracking (clicks, scroll, forms, time)
 *   • Pattern analysis with ML-style heuristics
 *   • Auto-optimization of meta titles, CTAs, content priority
 *   • A/B testing framework for CTA variants
 *   • Self-reporting dashboard
 *   • Integration with backend analytics API
 * 
 * No modifications to React/Vite frontend design required.
 * Simply include this script in index.html after build.
 * ═══════════════════════════════════════════════════════════
 */

(function() {
  'use strict';

  const CONFIG = window.AGENTIC_CONFIG || {
    siteId: 'cedexx',
    apiEndpoint: '/api/analytics',
    optimize: {
      metaTitle: true,
      metaDescription: true,
      ctaButtons: true,
      contentPriority: true,
      schemaOrg: true,
      aBTesting: true
    },
    primaryKeywords: [
      'telemedicine miami', 'pediatric virtual care', 'family healthcare florida',
      '24/7 doctor access', 'no insurance healthcare', 'health tech platform',
      'digital health', 'healthcare innovation'
    ],
    ctaVariants: [
      'Book Consultation', 'Request Demo', 'Explore Platform', 'Learn More', 'Get Started'
    ],
    conversionGoals: ['enroll', 'demo', 'contact', 'partner'],
    trackElements: ['[data-track]', 'a', 'button', '.cta', '[href*="enroll"]', '[href*="demo"]', '[href*="contact"]']
  };

  // ──────────────────────────────────────────────
  // CORE ENGINE
  // ──────────────────────────────────────────────
  class CedexxAgenticEngine {
    constructor(config) {
      this.config = config;
      this.siteId = config.siteId;
      this.apiEndpoint = config.apiEndpoint || '/api/analytics';
      this.eventQueue = [];
      this.sendTimeout = null;
      this.sessionStart = Date.now();
      this.patterns = null;
      this.optimizations = [];
      this.abTests = {};
      this.scrollMax = 0;
      this.engagementScore = 0;
      this.clickCount = 0;
      this.formInteractions = 0;
      this.pageLoadTime = performance.now();
      
      this.init();
    }

    init() {
      this.generateSessionId();
      this.injectTracking();
      this.startBehaviorAnalysis();
      this.setupAutoOptimization();
      this.setupABTesting();
      this.enhancePerformance();
      this.reportLoadMetrics();
      
      console.log(`[CEDEXX Agentic] Engine initialized for ${this.siteId}`);
    }

    // ── SESSION MANAGEMENT ─────────────────────
    generateSessionId() {
      let sid = sessionStorage.getItem('cedexx_agentic_sid');
      if (!sid) {
        sid = 'cx_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('cedexx_agentic_sid', sid);
      }
      this.sessionId = sid;
      
      // Persist visit count
      const visits = parseInt(localStorage.getItem('cedexx_visits') || '0') + 1;
      localStorage.setItem('cedexx_visits', visits.toString());
      this.visitCount = visits;
    }

    // ── TRACKING SYSTEM ────────────────────────
    injectTracking() {
      const self = this;

      // Click tracking with rich context
      document.addEventListener('click', (e) => {
        const target = e.target.closest('a, button, [data-track], [role="button"]') || e.target;
        const isCTA = !!target.closest('.cta, [data-track*="cta"], [href*="enroll"], [href*="demo"]');
        const isForm = !!target.closest('form, input, textarea, select');
        
        this.logEvent('click', {
          tag: target.tagName,
          id: target.id || null,
          class: (target.className || '').toString().substring(0, 100),
          text: (target.innerText || target.textContent || '').substring(0, 80),
          href: target.href || null,
          is_cta: isCTA,
          is_form_element: isForm,
          section: this.getSection(target),
          position: this.getElementPosition(target),
          time_on_page: Math.round((Date.now() - this.sessionStart) / 1000)
        });

        this.clickCount++;
        this.engagementScore += isCTA ? 5 : 1;

        // Track CTA variant performance for A/B
        if (isCTA && target.dataset.abVariant) {
          this.recordABResult(target.dataset.abVariant, 'click');
        }
      });

      // Scroll depth tracking (throttled)
      let scrollTicking = false;
      window.addEventListener('scroll', () => {
        if (scrollTicking) return;
        scrollTicking = true;
        requestAnimationFrame(() => {
          const scrollPercent = Math.round(
            (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
          ) || 0;
          
          if (scrollPercent > this.scrollMax) {
            this.scrollMax = scrollPercent;
            
            // Log at milestones
            if ([25, 50, 75, 90, 100].includes(scrollPercent)) {
              this.logEvent('scroll_depth', {
                percent: scrollPercent,
                section: this.getCurrentSection(),
                viewport_height: window.innerHeight,
                document_height: document.documentElement.scrollHeight
              });
              
              this.engagementScore += scrollPercent >= 75 ? 10 : (scrollPercent >= 50 ? 5 : 2);
            }
          }
          scrollTicking = false;
        });
      }, { passive: true });

      // Form interaction tracking
      document.querySelectorAll('form').forEach(form => {
        let started = false;
        
        form.addEventListener('focusin', () => {
          if (!started) {
            started = true;
            this.logEvent('form_start', {
              form_id: form.id || 'unnamed',
              form_action: form.action || null,
              section: this.getSection(form)
            });
          }
        });

        form.addEventListener('submit', (e) => {
          const formData = new FormData(form);
          const fields = {};
          formData.forEach((value, key) => {
            if (!key.match(/password|card|cvv|ssn|dob/i)) {
              fields[key] = typeof value === 'string' ? value.substring(0, 100) : 'file';
            }
          });

          this.logEvent('form_submit', {
            form_id: form.id || 'unnamed',
            fields: Object.keys(fields),
            field_count: Object.keys(fields).length,
            section: this.getSection(form),
            time_to_submit: Math.round((Date.now() - this.sessionStart) / 1000)
          });

          this.formInteractions++;
          this.engagementScore += 20;
        });
      });

      // Time tracking
      const visibilityTracker = () => {
        if (document.visibilityState === 'visible') {
          this.pageVisibleAt = Date.now();
        } else if (this.pageVisibleAt) {
          const visibleTime = Date.now() - this.pageVisibleAt;
          this.logEvent('visibility_change', {
            state: 'hidden',
            visible_duration_ms: visibleTime,
            total_session_ms: Date.now() - this.sessionStart
          });
        }
      };
      document.addEventListener('visibilitychange', visibilityTracker);

      // Page exit
      window.addEventListener('beforeunload', () => {
        const duration = Date.now() - this.sessionStart;
        this.logEvent('session_end', {
          duration_seconds: Math.round(duration / 1000),
          max_scroll_percent: this.scrollMax,
          click_count: this.clickCount,
          form_interactions: this.formInteractions,
          engagement_score: this.engagementScore,
          bounce: duration < 10000 && this.clickCount === 0,
          visit_count: this.visitCount
        });
        this.flushQueue(true); // synchronous-ish via sendBeacon
      });

      // Track external link clicks
      document.querySelectorAll('a[href^="http"]').forEach(link => {
        if (!link.href.includes(window.location.hostname)) {
          link.addEventListener('click', () => {
            this.logEvent('external_click', {
              url: link.href,
              text: (link.innerText || '').substring(0, 80),
              section: this.getSection(link)
            });
          });
        }
      });

      // Track video engagement
      document.querySelectorAll('video').forEach(video => {
        video.addEventListener('play', () => this.logEvent('video_play', { 
          video_src: video.currentSrc?.substring(0, 200) || 'unknown',
          duration: video.duration || 0 
        }));
        video.addEventListener('ended', () => this.logEvent('video_complete', { 
          watch_percent: 100 
        }));
      });

      // Initial page view
      this.logEvent('page_view', {
        url: window.location.href,
        path: window.location.pathname,
        referrer: document.referrer,
        viewport: { width: window.innerWidth, height: window.innerHeight },
        screen: { width: screen.width, height: screen.height },
        device_type: this.detectDeviceType(),
        language: navigator.language,
        visit_count: this.visitCount,
        utm_source: this.getQueryParam('utm_source'),
        utm_medium: this.getQueryParam('utm_medium'),
        utm_campaign: this.getQueryParam('utm_campaign')
      });
    }

    getSection(element) {
      const section = element.closest('section[id]');
      if (section) return section.id;
      const parent = element.closest('[id]');
      return parent ? parent.id : 'unknown';
    }

    getCurrentSection() {
      const sections = document.querySelectorAll('section[id]');
      let current = 'top';
      sections.forEach(s => {
        const rect = s.getBoundingClientRect();
        if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
          current = s.id || 'section';
        }
      });
      return current;
    }

    getElementPosition(element) {
      const rect = element.getBoundingClientRect();
      return {
        x: Math.round(rect.left),
        y: Math.round(rect.top),
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      };
    }

    detectDeviceType() {
      const ua = navigator.userAgent;
      if (/Mobile|Android|iPhone|iPad|iPod/.test(ua)) return 'mobile';
      if (/Tablet|iPad/.test(ua)) return 'tablet';
      return 'desktop';
    }

    getQueryParam(name) {
      return new URLSearchParams(window.location.search).get(name);
    }

    logEvent(type, data) {
      const event = {
        type,
        data,
        url: window.location.href,
        path: window.location.pathname,
        referrer: document.referrer,
        user_agent: navigator.userAgent.substring(0, 200),
        timestamp: new Date().toISOString(),
        session_id: this.sessionId
      };

      this.eventQueue.push(event);

      // Batch send every 5 seconds or when queue reaches 20
      clearTimeout(this.sendTimeout);
      if (this.eventQueue.length >= 20) {
        this.flushQueue();
      } else {
        this.sendTimeout = setTimeout(() => this.flushQueue(), 5000);
      }
    }

    flushQueue(sync = false) {
      if (this.eventQueue.length === 0) return;

      const batch = [...this.eventQueue];
      this.eventQueue = [];

      const payload = {
        site_id: this.siteId,
        events: batch
      };

      if (sync && navigator.sendBeacon) {
        navigator.sendBeacon(
          this.apiEndpoint,
          new Blob([JSON.stringify(payload)], { type: 'application/json' })
        );
      } else {
        fetch(this.apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true
        }).catch(() => {
          // Silently fail — analytics should never break UX
        });
      }

      // Also store locally for real-time analysis
      this.storeLocal(batch);
    }

    storeLocal(events) {
      const key = `cedexx_events_${this.siteId}`;
      const stored = JSON.parse(localStorage.getItem(key) || '[]');
      stored.push(...events);
      // Keep last 2000 events (about 2-3 days of browsing)
      while (stored.length > 2000) stored.shift();
      localStorage.setItem(key, JSON.stringify(stored));
    }

    getLocalEvents() {
      const key = `cedexx_events_${this.siteId}`;
      return JSON.parse(localStorage.getItem(key) || '[]');
    }

    // ── BEHAVIOR ANALYSIS ──────────────────────
    startBehaviorAnalysis() {
      // Analyze every 30 seconds for real-time optimization
      setInterval(() => this.analyzePatterns(), 30000);
      
      // Deep analysis every 5 minutes
      setInterval(() => this.deepAnalysis(), 300000);
      
      // Initial analysis after 10 seconds
      setTimeout(() => this.analyzePatterns(), 10000);
    }

    analyzePatterns() {
      const events = this.getLocalEvents();
      if (events.length < 5) return;

      const pageEvents = events.filter(e => e.url === window.location.href);
      
      this.patterns = {
        searchTerms: this.extractSearchTerms(events),
        popularClicks: this.extractPopularClicks(pageEvents),
        dropOffSections: this.extractDropOffSections(pageEvents),
        engagingSections: this.extractEngagingSections(pageEvents),
        conversionPaths: this.extractConversionPaths(events),
        deviceBreakdown: this.extractDeviceBreakdown(events),
        referrerQuality: this.extractReferrerQuality(events),
        formAbandonment: this.extractFormAbandonment(pageEvents)
      };

      // Apply lightweight real-time optimizations
      this.applyRealtimeOptimizations(this.patterns);
    }

    deepAnalysis() {
      const events = this.getLocalEvents();
      if (events.length < 50) return;

      const allTimePatterns = {
        peakHours: this.extractPeakHours(events),
        returnVisitors: this.extractReturnVisitors(events),
        contentAffinity: this.extractContentAffinity(events),
        ctaPerformance: this.extractCTAPerformance(events)
      };

      // Report to server for long-term learning
      fetch(this.apiEndpoint.replace('/analytics', '/agentic/report'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          site_id: this.siteId,
          patterns: allTimePatterns,
          timestamp: new Date().toISOString()
        })
      }).catch(() => {});
    }

    // Extractors
    extractSearchTerms(events) {
      const searches = events.filter(e => e.type === 'search' || (e.data?.text && e.data.text.length > 3));
      const terms = {};
      searches.forEach(e => {
        const query = (e.data.query || e.data.text || '').toLowerCase().trim();
        if (query.length > 2) {
          terms[query] = (terms[query] || 0) + 1;
        }
      });
      return Object.entries(terms).sort((a, b) => b[1] - a[1]).slice(0, 15);
    }

    extractPopularClicks(events) {
      const clicks = events.filter(e => e.type === 'click');
      const elements = {};
      clicks.forEach(e => {
        const key = e.data.is_cta ? `CTA:${e.data.text || e.data.id || 'unknown'}` : 
                    `${e.data.tag}#${e.data.id || 'no-id'}`;
        elements[key] = (elements[key] || 0) + 1;
      });
      return Object.entries(elements).sort((a, b) => b[1] - a[1]).slice(0, 10);
    }

    extractEngagingSections(events) {
      const scrolls = events.filter(e => e.type === 'scroll_depth');
      const deepScrolls = scrolls.filter(e => (e.data?.percent || 0) >= 50);
      const sections = {};
      deepScrolls.forEach(e => {
        const section = e.data.section || 'unknown';
        sections[section] = (sections[section] || 0) + 1;
      });
      return Object.entries(sections).sort((a, b) => b[1] - a[1]).slice(0, 8);
    }

    extractDropOffSections(events) {
      const exits = events.filter(e => e.type === 'session_end' && e.data?.bounce);
      const sections = {};
      exits.forEach(e => {
        // Look at last click before exit
        const lastClick = events
          .filter(ev => ev.type === 'click' && ev.session_id === e.session_id)
          .pop();
        const section = lastClick?.data?.section || 'top';
        sections[section] = (sections[section] || 0) + 1;
      });
      return Object.entries(sections).sort((a, b) => b[1] - a[1]).slice(0, 5);
    }

    extractConversionPaths(events) {
      const submissions = events.filter(e => e.type === 'form_submit');
      return submissions.map(form => {
        const sessionEvents = events.filter(e => e.session_id === form.session_id);
        const clicks = sessionEvents.filter(e => e.type === 'click');
        const path = clicks.map(e => e.data.section).filter((v, i, a) => a.indexOf(v) === i);
        
        return {
          form_type: form.data.form_id,
          path: path.slice(0, 10),
          clicks_before_convert: clicks.length,
          max_scroll: Math.max(...sessionEvents.filter(e => e.type === 'scroll_depth').map(e => e.data.percent || 0), 0),
          time_to_convert: Math.round((new Date(form.timestamp).getTime() - this.sessionStart) / 1000),
          device: sessionEvents[0]?.data?.device_type || 'unknown'
        };
      }).slice(-20);
    }

    extractDeviceBreakdown(events) {
      const breakdown = {};
      events.forEach(e => {
        const device = e.data?.device_type || 'unknown';
        breakdown[device] = (breakdown[device] || 0) + 1;
      });
      return breakdown;
    }

    extractReferrerQuality(events) {
      const sessions = {};
      events.forEach(e => {
        if (!sessions[e.session_id]) sessions[e.session_id] = { events: [], referrer: e.referrer };
        sessions[e.session_id].events.push(e);
      });

      const referrerStats = {};
      Object.values(sessions).forEach((s) => {
        const ref = (s.referrer || 'direct').replace(/^https?:\/\//, '').split('/')[0];
        if (!referrerStats[ref]) referrerStats[ref] = { sessions: 0, engagement: 0 };
        referrerStats[ref].sessions++;
        referrerStats[ref].engagement += s.events.filter(e => e.type === 'click').length;
      });

      return Object.entries(referrerStats)
        .map(([ref, stats]) => ({ referrer: ref, sessions: stats.sessions, avgEngagement: Math.round(stats.engagement / stats.sessions * 10) / 10 }))
        .sort((a, b) => b.sessions - a.sessions)
        .slice(0, 10);
    }

    extractFormAbandonment(events) {
      const starts = events.filter(e => e.type === 'form_start');
      const submits = events.filter(e => e.type === 'form_submit');
      
      return {
        started: starts.length,
        completed: submits.length,
        abandonmentRate: starts.length > 0 ? Math.round((1 - submits.length / starts.length) * 100) : 0,
        mostAbandonedForms: starts
          .filter(s => !submits.some(sub => sub.session_id === s.session_id))
          .reduce((acc, s) => {
            const formId = s.data.form_id || 'unknown';
            acc[formId] = (acc[formId] || 0) + 1;
            return acc;
          }, {})
      };
    }

    extractPeakHours(events) {
      const hours = {};
      events.forEach(e => {
        const hour = new Date(e.timestamp).getHours();
        hours[hour] = (hours[hour] || 0) + 1;
      });
      return Object.entries(hours).sort((a, b) => b[1] - a[1]).slice(0, 5);
    }

    extractReturnVisitors(events) {
      const sessions = new Set(events.map(e => e.session_id));
      return {
        totalSessions: sessions.size,
        estimatedReturnRate: this.visitCount > 1 ? 'returning' : 'new',
        visitCount: this.visitCount
      };
    }

    extractContentAffinity(events) {
      const pageViews = events.filter(e => e.type === 'page_view');
      const paths = {};
      pageViews.forEach(e => {
        const path = e.data?.path || '/';
        paths[path] = (paths[path] || 0) + 1;
      });
      return Object.entries(paths).sort((a, b) => b[1] - a[1]).slice(0, 10);
    }

    extractCTAPerformance(events) {
      const ctaClicks = events.filter(e => e.type === 'click' && e.data?.is_cta);
      const ctas = {};
      ctaClicks.forEach(e => {
        const text = (e.data.text || 'unknown').substring(0, 30);
        ctas[text] = (ctas[text] || 0) + 1;
      });
      return Object.entries(ctas).sort((a, b) => b[1] - a[1]).slice(0, 10);
    }

    // ── AUTO-OPTIMIZATION ──────────────────────
    setupAutoOptimization() {
      if (!this.config.optimize) return;
      
      // Run optimization check every 2 minutes
      setInterval(() => this.checkOptimizations(), 120000);
      
      // Initial optimization after 15 seconds
      setTimeout(() => this.checkOptimizations(), 15000);
    }

    applyRealtimeOptimizations(patterns) {
      if (!patterns) return;

      // 1. Smart CTA text based on page context
      if (this.config.optimize.ctaButtons) {
        this.optimizeCTAs(patterns);
      }

      // 2. Highlight engaging sections with subtle glow
      if (this.config.optimize.contentPriority && patterns.engagingSections?.length > 0) {
        const topSection = patterns.engagingSections[0]?.[0];
        if (topSection && topSection !== 'unknown') {
          const el = document.getElementById(topSection);
          if (el && !el.dataset.optimized) {
            el.dataset.optimized = 'true';
            // Subtle glow animation (non-destructive)
            const style = document.createElement('style');
            style.textContent = `
              [data-optimized="true"] { animation: cedexx-glow 3s ease-in-out; }
              @keyframes cedexx-glow { 
                0%, 100% { box-shadow: none; } 
                50% { box-shadow: 0 0 30px rgba(35, 217, 176, 0.15); } 
              }
            `;
            document.head.appendChild(style);
          }
        }
      }

      // 3. Update meta title if search terms indicate interest
      if (this.config.optimize.metaTitle && patterns.searchTerms?.length > 0) {
        const topTerm = patterns.searchTerms[0][0];
        const currentTitle = document.title;
        if (topTerm && !currentTitle.toLowerCase().includes(topTerm.toLowerCase())) {
          const newTitle = `${currentTitle} | ${topTerm.charAt(0).toUpperCase() + topTerm.slice(1)}`;
          document.title = newTitle.substring(0, 70);
          this.logOptimization('meta_title_dynamic', `Added search term: "${topTerm}"`);
        }
      }

      // 4. Prefetch likely next pages
      const popularPaths = patterns.contentAffinity?.slice(0, 3) || [];
      popularPaths.forEach(([path]) => {
        if (path !== window.location.pathname && path !== '/') {
          const link = document.createElement('link');
          link.rel = 'prefetch';
          link.href = path;
          if (!document.querySelector(`link[rel="prefetch"][href="${path}"]`)) {
            document.head.appendChild(link);
          }
        }
      });
    }

    optimizeCTAs(patterns) {
      // Determine best CTA variant based on context
      const path = window.location.pathname;
      let recommendedCTA = null;

      if (path.includes('enroll')) recommendedCTA = 'Complete Enrollment';
      else if (path.includes('demo')) recommendedCTA = 'Schedule My Demo';
      else if (path.includes('partner')) recommendedCTA = 'Become a Partner';
      else if (path.includes('contact')) recommendedCTA = 'Send Message';
      else if (patterns.conversionPaths?.length > 0) {
        // Use highest converting CTA text
        const bestCTA = patterns.conversionPaths
          .filter(p => p.form_type)
          .sort((a, b) => b.clicks_before_convert - a.clicks_before_convert)[0];
        if (bestCTA) {
          const formMap = {
            'contact': 'Get in Touch',
            'enroll': 'Start Membership',
            'demo': 'Book My Demo',
            'partner': 'Partner With Us'
          };
          recommendedCTA = formMap[bestCTA.form_type] || 'Get Started';
        }
      }

      if (recommendedCTA) {
        document.querySelectorAll('[data-track*="cta"], .cta, button[type="submit"]').forEach(btn => {
          if (!btn.dataset.originalText) btn.dataset.originalText = btn.innerText;
          
          // Only update if A/B testing isn't overriding
          if (!btn.dataset.abActive) {
            // Preserve any child icons
            const icon = btn.querySelector('svg, i, img');
            if (icon) {
              const span = document.createElement('span');
              span.textContent = ' ' + recommendedCTA;
              btn.innerHTML = '';
              btn.appendChild(icon);
              btn.appendChild(span);
            } else {
              btn.textContent = recommendedCTA;
            }
          }
        });
      }
    }

    checkOptimizations() {
      if (!this.patterns) return;

      const optimizations = [];

      // Meta description optimization
      if (this.config.optimize.metaDescription) {
        const topSearch = this.patterns.searchTerms?.[0]?.[0];
        if (topSearch) {
          const metaDesc = document.querySelector('meta[name="description"]');
          if (metaDesc) {
            const current = metaDesc.content;
            if (!current.toLowerCase().includes(topSearch.toLowerCase())) {
              const newDesc = `${current} Learn about ${topSearch} with CEDEXX.`;
              metaDesc.content = newDesc.substring(0, 160);
              optimizations.push({ type: 'meta_description', reason: `Top search: "${topSearch}"` });
            }
          }
        }
      }

      // Schema.org dynamic updates
      if (this.config.optimize.schemaOrg) {
        this.updateSchemaOrg();
      }

      // Form simplification suggestions (visual cue only)
      if (this.patterns.formAbandonment?.abandonmentRate > 60) {
        document.querySelectorAll('form').forEach(form => {
          if (!form.dataset.abandonmentWarned) {
            form.dataset.abandonmentWarned = 'true';
            // Add subtle helper text
            const note = document.createElement('div');
            note.style.cssText = 'font-size:11px;color:#64748b;margin-top:8px;font-style:italic;';
            note.textContent = 'Quick tip: Only fill required fields (*) to save time.';
            form.appendChild(note);
          }
        });
        optimizations.push({ type: 'form_ux_hint', reason: `High abandonment: ${this.patterns.formAbandonment.abandonmentRate}%` });
      }

      this.optimizations = optimizations;
      this.storeOptimizations(optimizations);
    }

    updateSchemaOrg() {
      // Update existing schema with dynamic data
      const existing = document.querySelector('script[type="application/ld+json"][data-schema-index="0"]');
      if (existing) {
        try {
          const schema = JSON.parse(existing.textContent);
          if (schema['@type'] === 'MedicalBusiness' || schema['@type'] === 'LocalBusiness') {
            // Update with real engagement data
            schema.potentialAction = schema.potentialAction || {};
            schema.potentialAction.target = {
              '@type': 'EntryPoint',
              urlTemplate: `${window.location.origin}/enroll?utm_source=agentic`
            };
            existing.textContent = JSON.stringify(schema, null, 2);
          }
        } catch (e) {
          // Silent fail
        }
      }
    }

    // ── A/B TESTING ────────────────────────────
    setupABTesting() {
      if (!this.config.optimize.aBTesting) return;

      const ctaVariants = this.config.ctaVariants || ['Get Started', 'Learn More', 'Book Now'];
      
      // Assign variant based on session (consistent per user)
      const variantIndex = this.sessionId.split('').reduce((a, b) => a + b.charCodeAt(0), 0) % ctaVariants.length;
      this.abVariant = ctaVariants[variantIndex];

      // Apply variant to hero CTAs
      document.querySelectorAll('[data-ab-test="cta-hero"]').forEach(btn => {
        btn.dataset.abVariant = this.abVariant;
        btn.dataset.abActive = 'true';
        btn.textContent = this.abVariant;
      });

      // Store variant for reporting
      localStorage.setItem('cedexx_ab_variant', this.abVariant);
    }

    recordABResult(variant, action) {
      const key = `cedexx_ab_results_${variant}`;
      const results = JSON.parse(localStorage.getItem(key) || '{"clicks":0,"conversions":0}');
      results[action === 'click' ? 'clicks' : 'conversions']++;
      localStorage.setItem(key, JSON.stringify(results));
    }

    // ── PERFORMANCE ENHANCEMENT ────────────────
    enhancePerformance() {
      // Lazy-load below-fold images
      if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target;
              if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
              }
            }
          });
        });

        document.querySelectorAll('img[data-src]').forEach(img => imageObserver.observe(img));
      }

      // Preconnect to critical domains
      ['https://cedexx.net', 'https://fonts.googleapis.com'].forEach(domain => {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = domain;
        document.head.appendChild(link);
      });
    }

    reportLoadMetrics() {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const nav = performance.getEntriesByType('navigation')[0];
          if (nav) {
            this.logEvent('performance', {
              ttfb: Math.round(nav.responseStart - nav.startTime),
              fcp: Math.round(nav.domContentLoadedEventStart - nav.startTime),
              lcp_estimate: Math.round(nav.loadEventStart - nav.startTime),
              dom_size: document.querySelectorAll('*').length,
              image_count: document.querySelectorAll('img').length,
              script_count: document.querySelectorAll('script').length
            });
          }
        }, 100);
      });
    }

    // ── DASHBOARD API ──────────────────────────
    getDashboard() {
      return {
        site_id: this.siteId,
        session_id: this.sessionId,
        timestamp: new Date().toISOString(),
        current_page: window.location.href,
        patterns: this.patterns,
        optimizations: this.optimizations,
        ab_test: {
          variant: this.abVariant,
          results: this.getABResults()
        },
        engagement: {
          score: this.engagementScore,
          clicks: this.clickCount,
          scroll_max: this.scrollMax,
          forms: this.formInteractions,
          session_duration_seconds: Math.round((Date.now() - this.sessionStart) / 1000)
        },
        recent_events: this.getLocalEvents().slice(-50),
        stats: {
          total_events: this.getLocalEvents().length,
          unique_sessions: new Set(this.getLocalEvents().map(e => e.session_id)).size,
          visit_count: this.visitCount
        }
      };
    }

    getABResults() {
      const variants = this.config.ctaVariants || [];
      return variants.map(v => {
        const key = `cedexx_ab_results_${v}`;
        const data = JSON.parse(localStorage.getItem(key) || '{"clicks":0,"conversions":0}');
        return { variant: v, ...data };
      });
    }

    logOptimization(action, reason) {
      console.log(`[CEDEXX Agentic] ${action}: ${reason}`);
      this.optimizations.push({ action, reason, timestamp: new Date().toISOString() });
    }

    storeOptimizations(optimizations) {
      const key = `cedexx_optimizations_${this.siteId}`;
      const history = JSON.parse(localStorage.getItem(key) || '[]');
      history.push({
        timestamp: new Date().toISOString(),
        page: window.location.pathname,
        optimizations
      });
      localStorage.setItem(key, JSON.stringify(history.slice(-100)));
    }
  }

  // ──────────────────────────────────────────────
  // GLOBAL EXPORT
  // ──────────────────────────────────────────────
  window.CedexxAgenticEngine = CedexxAgenticEngine;

  // Auto-initialize if config exists
  if (window.AGENTIC_CONFIG) {
    window.cedexxAgentic = new CedexxAgenticEngine(window.AGENTIC_CONFIG);
  }
})();
