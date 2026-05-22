// Agentic Website Engine
// Tracks user behavior, auto-optimizes SEO, self-improves content

class AgenticWebsite {
  constructor(config) {
    this.siteId = config.siteId;
    this.apiEndpoint = config.apiEndpoint || '/api/agentic';
    this.trackers = {};
    this.optimizations = [];
    this.config = config; // Store full config
    this.init();
  }

  init() {
    this.injectTracking();
    this.startBehaviorAnalysis();
    this.setupAutoOptimization();
    this.applyInitialOptimizations(); // NEW: Apply config rules immediately
  }

  // 1. TRACK USER BEHAVIOR
  injectTracking() {
    // Track all clicks
    document.addEventListener('click', (e) => {
      const target = e.target.closest('[data-track]') || e.target;
      this.logEvent('click', {
        element: target.tagName,
        id: target.id,
        class: target.className,
        text: target.innerText?.substring(0, 50),
        href: target.href,
        section: this.getSection(target),
        timestamp: Date.now()
      });
    });

    // Track scroll depth
    let maxScroll = 0;
    window.addEventListener('scroll', () => {
      const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        if (maxScroll >= 25 || maxScroll >= 50 || maxScroll >= 75 || maxScroll >= 90) {
          this.logEvent('scroll_depth', { percent: Math.round(maxScroll) });
        }
      }
    });

    // Track search queries
    const searchInputs = document.querySelectorAll('input[type="search"], input[placeholder*="search" i]');
    searchInputs.forEach(input => {
      input.addEventListener('change', (e) => {
        this.logEvent('search', { query: e.target.value });
        this.analyzeSearchIntent(e.target.value);
      });
    });

    // Track time on page
    this.sessionStart = Date.now();
    window.addEventListener('beforeunload', () => {
      const duration = Date.now() - this.sessionStart;
      this.logEvent('session_end', { duration_seconds: Math.round(duration / 1000) });
    });

    // Track form interactions
    document.querySelectorAll('form').forEach(form => {
      form.addEventListener('submit', (e) => {
        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => {
          if (!key.includes('password') && !key.includes('card')) {
            data[key] = value;
          }
        });
        this.logEvent('form_submit', { form_id: form.id, fields: Object.keys(data) });
      });
    });
  }

  getSection(element) {
    const section = element.closest('section[id]');
    return section ? section.id : 'unknown';
  }

  logEvent(type, data) {
    const event = {
      type,
      data,
      url: window.location.href,
      referrer: document.referrer,
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      session_id: this.getSessionId()
    };

    // Send to analytics endpoint
    this.sendToServer(event);
    
    // Store locally for real-time analysis
    this.storeLocal(event);
  }

  getSessionId() {
    let sessionId = sessionStorage.getItem('agentic_session_id');
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('agentic_session_id', sessionId);
    }
    return sessionId;
  }

  sendToServer(event) {
    // Batch events and send every 5 seconds
    if (!this.eventQueue) this.eventQueue = [];
    this.eventQueue.push(event);
    
    clearTimeout(this.sendTimeout);
    this.sendTimeout = setTimeout(() => {
      if (this.eventQueue.length > 0) {
        fetch(this.apiEndpoint + '/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ site_id: this.siteId, events: this.eventQueue })
        }).catch(() => {}); // Silent fail
        this.eventQueue = [];
      }
    }, 5000);
  }

  storeLocal(event) {
    const key = 'agentic_events_' + this.siteId;
    const events = JSON.parse(localStorage.getItem(key) || '[]');
    events.push(event);
    // Keep last 1000 events
    if (events.length > 1000) events.shift();
    localStorage.setItem(key, JSON.stringify(events));
  }

  // 2. ANALYZE BEHAVIOR
  startBehaviorAnalysis() {
    // Analyze every 30 seconds
    setInterval(() => this.analyzePatterns(), 30000);
    
    // Also analyze on page load
    this.analyzePatterns();
  }

  analyzePatterns() {
    const events = this.getLocalEvents();
    if (events.length < 10) return; // Need more data

    const patterns = {
      // Most searched terms
      searchTerms: this.extractSearchTerms(events),
      
      // Most clicked elements
      popularClicks: this.extractPopularClicks(events),
      
      // Drop-off points (where people leave)
      dropOffPoints: this.extractDropOffs(events),
      
      // High-engagement sections
      engagingSections: this.extractEngagingSections(events),
      
      // Conversion paths
      conversionPaths: this.extractConversionPaths(events)
    };

    this.patterns = patterns;
    this.applyOptimizations(patterns);
  }

  extractSearchTerms(events) {
    const searches = events.filter(e => e.type === 'search');
    const terms = {};
    searches.forEach(e => {
      const query = e.data.query?.toLowerCase().trim();
      if (query) {
        terms[query] = (terms[query] || 0) + 1;
      }
    });
    return Object.entries(terms)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20);
  }

  extractPopularClicks(events) {
    const clicks = events.filter(e => e.type === 'click');
    const elements = {};
    clicks.forEach(e => {
      const key = `${e.data.element}#${e.data.id}.${e.data.class}`;
      elements[key] = (elements[key] || 0) + 1;
    });
    return Object.entries(elements)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }

  extractDropOffs(events) {
    // Find pages with high bounce rate
    const sessions = {};
    events.forEach(e => {
      if (!sessions[e.session_id]) sessions[e.session_id] = [];
      sessions[e.session_id].push(e);
    });

    const shortSessions = Object.values(sessions)
      .filter(session => {
        const duration = Math.max(...session.map(e => new Date(e.timestamp).getTime())) - 
                        Math.min(...session.map(e => new Date(e.timestamp).getTime()));
        return duration < 10000; // Less than 10 seconds
      });

    // Find common last sections
    const lastSections = {};
    shortSessions.forEach(session => {
      const lastEvent = session[session.length - 1];
      const section = lastEvent.data.section || 'unknown';
      lastSections[section] = (lastSections[section] || 0) + 1;
    });

    return Object.entries(lastSections)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }

  extractEngagingSections(events) {
    const scrolls = events.filter(e => e.type === 'scroll_depth');
    const deepScrolls = scrolls.filter(e => e.data.percent >= 75);
    
    const sections = {};
    deepScrolls.forEach(e => {
      // Get section from last click before scroll
      const lastClick = events
        .filter(ev => ev.type === 'click' && new Date(ev.timestamp) <= new Date(e.timestamp))
        .pop();
      const section = lastClick?.data.section || 'unknown';
      sections[section] = (sections[section] || 0) + 1;
    });

    return Object.entries(sections)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }

  extractConversionPaths(events) {
    const forms = events.filter(e => e.type === 'form_submit');
    const paths = [];
    
    forms.forEach(form => {
      const sessionEvents = events.filter(e => e.session_id === form.session_id);
      const clickPath = sessionEvents
        .filter(e => e.type === 'click')
        .map(e => e.data.section)
        .filter((v, i, a) => a.indexOf(v) === i); // Unique
      
      paths.push({
        form: form.data.form_id,
        path: clickPath,
        time_to_convert: (new Date(form.timestamp).getTime() - 
                         new Date(sessionEvents[0].timestamp).getTime()) / 1000
      });
    });

    return paths;
  }

  getLocalEvents() {
    const key = 'agentic_events_' + this.siteId;
    return JSON.parse(localStorage.getItem(key) || '[]');
  }

  // 3. AUTO-OPTIMIZE
  setupAutoOptimization() {
    // Check for optimization opportunities every 5 minutes
    setInterval(() => this.checkOptimizations(), 300000);
  }

  checkOptimizations() {
    if (!this.patterns) return;

    const optimizations = [];

    // SEO: Update meta tags based on popular searches
    if (this.patterns.searchTerms.length > 0) {
      const topSearch = this.patterns.searchTerms[0][0];
      optimizations.push({
        type: 'meta_title',
        action: 'update',
        value: this.generateOptimizedTitle(topSearch),
        reason: `Top search: "${topSearch}" (${this.patterns.searchTerms[0][1]} searches)`
      });
    }

    // Content: Highlight popular sections
    if (this.patterns.engagingSections.length > 0) {
      const topSection = this.patterns.engagingSections[0][0];
      optimizations.push({
        type: 'content_priority',
        action: 'reorder',
        section: topSection,
        reason: `Most engaging section: ${topSection}`
      });
    }

    // UX: Fix drop-off points
    if (this.patterns.dropOffPoints.length > 0) {
      const dropOff = this.patterns.dropOffPoints[0][0];
      optimizations.push({
        type: 'ux_fix',
        action: 'simplify',
        section: dropOff,
        reason: `High drop-off at: ${dropOff}`
      });
    }

    // CTA: Optimize based on conversion paths
    if (this.patterns.conversionPaths.length > 0) {
      const bestPath = this.patterns.conversionPaths
        .sort((a, b) => a.time_to_convert - b.time_to_convert)[0];
      optimizations.push({
        type: 'cta_optimization',
        action: 'replicate_path',
        path: bestPath.path,
        reason: `Fastest conversion path: ${bestPath.path.join(' → ')}`
      });
    }

    this.optimizations = optimizations;
    this.applyOptimizations(optimizations);
  }

  generateOptimizedTitle(topSearch) {
    const currentTitle = document.title;
    // Include top search term if not already present
    if (!currentTitle.toLowerCase().includes(topSearch.toLowerCase())) {
      return `${currentTitle} | ${topSearch.charAt(0).toUpperCase() + topSearch.slice(1)}`;
    }
    return currentTitle;
  }

  applyOptimizations(optimizations) {
    optimizations.forEach(opt => {
      switch(opt.type) {
        case 'meta_title':
          if (opt.action === 'update') {
            document.title = opt.value;
            this.logOptimization('Updated title tag', opt.reason);
          }
          break;

        case 'meta_description':
          if (opt.action === 'update') {
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) {
              metaDesc.content = opt.value;
              this.logOptimization('Updated meta description', opt.reason);
            }
          }
          break;

        case 'content_priority':
          // Move engaging sections higher in the page
          const section = document.getElementById(opt.section);
          if (section && section.parentElement) {
            section.parentElement.insertBefore(section, section.parentElement.firstChild);
            this.logOptimization('Reordered content', opt.reason);
          }
          break;

        case 'ux_fix':
          // Add visual cues to drop-off sections
          const dropSection = document.getElementById(opt.section);
          if (dropSection) {
            dropSection.style.border = '2px dashed #ff6b6b';
            dropSection.setAttribute('data-needs-improvement', 'true');
            this.logOptimization('Flagged section for improvement', opt.reason);
          }
          break;

        case 'cta_optimization':
          // Highlight successful conversion paths
          opt.path.forEach((sectionId, index) => {
            const el = document.getElementById(sectionId);
            if (el) {
              el.setAttribute('data-conversion-step', index + 1);
            }
          });
          this.logOptimization('Mapped conversion path', opt.reason);
          break;
      }
    });

    // Store optimizations for reporting
    this.storeOptimizations(optimizations);
  }

  logOptimization(action, reason) {
    console.log(`[Agentic] ${action}: ${reason}`);
    this.sendToServer({
      type: 'optimization_applied',
      data: { action, reason },
      timestamp: new Date().toISOString()
    });
  }

  storeOptimizations(optimizations) {
    const key = 'agentic_optimizations_' + this.siteId;
    const history = JSON.parse(localStorage.getItem(key) || '[]');
    history.push({
      timestamp: new Date().toISOString(),
      optimizations
    });
    localStorage.setItem(key, JSON.stringify(history.slice(-50))); // Keep last 50
  }

  // 4. SCHEMA.ORG AUTO-UPDATE
  updateSchemaOrg(data) {
    // Remove existing schema
    const existing = document.querySelectorAll('script[type="application/ld+json"]');
    existing.forEach(el => el.remove());

    // Generate new schema based on page content
    const schema = {
      '@context': 'https://schema.org',
      '@type': data.type || 'WebPage',
      'name': document.title,
      'description': document.querySelector('meta[name="description"]')?.content || '',
      'url': window.location.href,
      'dateModified': new Date().toISOString(),
      ...data
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  }

  // 5. REAL-TIME DASHBOARD (for admin view)
  getDashboard() {
    return {
      site_id: this.siteId,
      patterns: this.patterns,
      optimizations: this.optimizations,
      recent_events: this.getLocalEvents().slice(-50),
      stats: {
        total_events: this.getLocalEvents().length,
        unique_sessions: new Set(this.getLocalEvents().map(e => e.session_id)).size,
        avg_session_duration: this.calculateAvgSession(),
        top_search: this.patterns?.searchTerms?.[0]?.[0] || 'N/A',
        top_section: this.patterns?.engagingSections?.[0]?.[0] || 'N/A'
      }
    };
  }

  calculateAvgSession() {
    const events = this.getLocalEvents();
    const sessions = {};
    events.forEach(e => {
      if (!sessions[e.session_id]) sessions[e.session_id] = { start: Infinity, end: 0 };
      const time = new Date(e.timestamp).getTime();
      sessions[e.session_id].start = Math.min(sessions[e.session_id].start, time);
      sessions[e.session_id].end = Math.max(sessions[e.session_id].end, time);
    });

    const durations = Object.values(sessions).map(s => (s.end - s.start) / 1000);
    return durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;
  }

  // 6. APPLY INITIAL OPTIMIZATIONS FROM CONFIG RULES
  applyInitialOptimizations() {
    if (!this.config || !this.config.rules) return;
    
    this.config.rules.forEach(rule => {
      // Check if condition is URL-based or immediate
      if (rule.condition.includes('search_contains') && window.location.search) {
        const searchParams = new URLSearchParams(window.location.search);
        const query = searchParams.get('q') || searchParams.get('search') || '';
        const keywords = rule.condition.match(/"([^"]+)"/g)?.map(s => s.replace(/"/g, '')) || [];
        
        if (keywords.some(kw => query.toLowerCase().includes(kw.toLowerCase()))) {
          this.executeRuleAction(rule.action);
        }
      }
      
      // Check referrer-based conditions
      if (rule.condition.includes('referrer_contains')) {
        const ref = document.referrer.toLowerCase();
        const keywords = rule.condition.match(/"([^"]+)"/g)?.map(s => s.replace(/"/g, '')) || [];
        
        if (keywords.some(kw => ref.includes(kw.toLowerCase()))) {
          this.executeRuleAction(rule.action);
        }
      }
    });
  }

  executeRuleAction(action) {
    const match = action.match(/update_cta_to:\s*"([^"]+)"/);
    if (match) {
      const ctaText = match[1];
      document.querySelectorAll('[data-track="cta-hero"], button[data-track^="cta"]').forEach(btn => {
        const icon = btn.querySelector('i');
        btn.innerHTML = icon ? `${icon.outerHTML}${ctaText}` : ctaText;
      });
      this.logOptimization('cta_update', `CTA updated to: ${ctaText}`);
    }
    
    const headlineMatch = action.match(/update_headline_to:\s*"([^"]+)"/);
    if (headlineMatch) {
      const headline = headlineMatch[1];
      const heroHeadline = document.getElementById('heroHeadline');
      if (heroHeadline) {
        const span = heroHeadline.querySelector('span');
        heroHeadline.innerHTML = `${headline}${span ? ' ' + span.outerHTML : ''}`;
      }
      this.logOptimization('headline_update', `Headline updated to: ${headline}`);
    }
    
    const serviceMatch = action.match(/highlight_service:\s*"([^"]+)"/);
    if (serviceMatch) {
      const service = serviceMatch[1];
      document.querySelectorAll(`[data-service="${service}"]`).forEach(el => {
        el.style.border = '2px solid #00D4FF';
        el.style.transform = 'scale(1.02)';
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      this.logOptimization('service_highlight', `Highlighted service: ${service}`);
    }
    
    const sectionMatch = action.match(/move_section_up:\s*"([^"]+)"/);
    if (sectionMatch) {
      const sectionId = sectionMatch[1];
      const section = document.getElementById(sectionId);
      if (section && section.parentElement) {
        section.parentElement.prepend(section);
        this.logOptimization('section_reorder', `Moved section up: ${sectionId}`);
      }
    }
  }

  logOptimization(action, reason) {
    console.log(`[Agentic] ${action}: ${reason}`);
    this.sendToServer({
      type: 'optimization_applied',
      data: { action, reason },
      timestamp: new Date().toISOString()
    });
  }
}
}

// Initialize on page load
window.AgenticWebsite = AgenticWebsite;

// Auto-initialize if config exists
if (window.AGENTIC_CONFIG) {
  window.agentic = new AgenticWebsite(window.AGENTIC_CONFIG);
}
