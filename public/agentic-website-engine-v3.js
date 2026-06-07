(function() {
  'use strict';

  // ============================================
  // Agentic Website Engine v3.0 — Dynamic Blocks Edition
  // For: 305business, MBMB, CEDEXX, Building Innovation, AIDynamic.pro
  // ============================================

  class AgenticWebsite {
    constructor(config) {
      this.siteId = config.siteId || 'default';
      this.apiEndpoint = config.apiEndpoint || '/api/agentic';
      this.trackers = {};
      this.optimizations = [];
      this.config = config;
      this.sendTimeout = null;
      this.eventQueue = [];
      this.sessionId = 'sess_' + Math.random().toString(36).slice(2, 11);
      this.dynamicBlocks = [];
      this.init();
    }

    init() {
      this.injectTracking();
      this.startBehaviorAnalysis();
      this.setupAutoOptimization();
      this.applyInitialOptimizations();
      this.setupClarityBridge();
    }

    // ============================================
    // 1. MICROSOFT CLARITY BRIDGE
    // ============================================
    setupClarityBridge() {
      // Bridge Clarity data with our agentic engine
      if (window.clarity) {
        const originalClarity = window.clarity;
        window.clarity = function(...args) {
          // Log Clarity events to our queue
          if (args[0] === 'event') {
            this.logEvent('clarity_' + args[1], args[2] || {});
          }
          return originalClarity.apply(this, args);
        }.bind(this);
      }
    }

    // ============================================
    // 2. TRACK USER BEHAVIOR
    // ============================================
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
          x: e.clientX,
          y: e.clientY,
          timestamp: Date.now(),
          sessionId: this.sessionId
        });
      });

      // Track scroll depth
      let maxScroll = 0;
      let scrollThrottled = false;
      window.addEventListener('scroll', () => {
        if (scrollThrottled) return;
        scrollThrottled = true;
        setTimeout(() => scrollThrottled = false, 100);
        
        const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
        if (scrollPercent > maxScroll) {
          maxScroll = Math.min(scrollPercent, 100);
          const milestones = [25, 50, 75, 90, 100];
          const milestone = milestones.find(m => maxScroll >= m && !this.trackers['scroll_' + m]);
          if (milestone) {
            this.trackers['scroll_' + milestone] = true;
            this.logEvent('scroll_depth', { percent: milestone, sessionId: this.sessionId });
          }
        }
      });

      // Track search queries
      const searchInputs = document.querySelectorAll('input[type="search"], input[placeholder*="search" i], input[name*="search" i]');
      searchInputs.forEach(input => {
        let debounceTimer;
        input.addEventListener('input', (e) => {
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            if (e.target.value.length > 2) {
              this.logEvent('search', { query: e.target.value, sessionId: this.sessionId });
              this.analyzeSearchIntent(e.target.value);
            }
          }, 500);
        });
      });

      // Track time on page
      this.sessionStart = Date.now();
      this.sessionActive = true;
      
      // Track user engagement
      let lastActivity = Date.now();
      const activityEvents = ['mousemove', 'click', 'scroll', 'keypress', 'touchstart'];
      activityEvents.forEach(evt => {
        document.addEventListener(evt, () => { lastActivity = Date.now(); }, { passive: true });
      });

      // Idle detection
      setInterval(() => {
        const idle = Date.now() - lastActivity;
        if (idle > 30000 && this.sessionActive) {
          this.sessionActive = false;
          this.logEvent('user_idle', { idle_ms: idle, sessionId: this.sessionId });
        } else if (idle < 30000 && !this.sessionActive) {
          this.sessionActive = true;
          this.logEvent('user_active', { sessionId: this.sessionId });
        }
      }, 5000);

      window.addEventListener('beforeunload', () => {
        const duration = Date.now() - this.sessionStart;
        this.logEvent('session_end', { 
          duration_seconds: Math.round(duration / 1000),
          sessionId: this.sessionId,
          maxScroll: Math.round(maxScroll)
        });
        this.flushQueue();
      });

      // Track form interactions
      document.querySelectorAll('form').forEach(form => {
        const formFields = {};
        form.querySelectorAll('input, select, textarea').forEach(field => {
          field.addEventListener('change', (e) => {
            const key = field.name || field.id || field.placeholder;
            if (key && !key.toLowerCase().includes('password') && !key.toLowerCase().includes('card')) {
              formFields[key] = true;
            }
          });
        });
        
        form.addEventListener('submit', (e) => {
          const formData = new FormData(form);
          const data = {};
          formData.forEach((value, key) => {
            if (!key.toLowerCase().includes('password') && !key.toLowerCase().includes('card')) {
              data[key] = value;
            }
          });
          this.logEvent('form_submit', { 
            form_id: form.id || form.name,
            fields_filled: Object.keys(formFields).length,
            fields: Object.keys(data),
            sessionId: this.sessionId
          });
        });

        form.addEventListener('focusin', () => {
          if (!this.trackers['form_start_' + form.id]) {
            this.trackers['form_start_' + form.id] = true;
            this.logEvent('form_start', { form_id: form.id || form.name, sessionId: this.sessionId });
          }
        });
      });

      // Track video engagement
      document.querySelectorAll('video').forEach(video => {
        video.addEventListener('play', () => this.logEvent('video_play', { src: video.src, sessionId: this.sessionId }));
        video.addEventListener('pause', () => this.logEvent('video_pause', { currentTime: video.currentTime, sessionId: this.sessionId }));
        video.addEventListener('ended', () => this.logEvent('video_complete', { sessionId: this.sessionId }));
      });
    }

    // ============================================
    // 3. DYNAMIC BLOCK GENERATION
    // ============================================
    
    // Generate and inject a dynamic block into the page
    generateBlock(type, data, targetSelector) {
      const block = this.createBlock(type, data);
      if (block) {
        this.injectBlock(block, targetSelector);
        this.logEvent('dynamic_block_generated', { type, sessionId: this.sessionId });
        return block;
      }
      return null;
    }

    createBlock(type, data) {
      const container = document.createElement('div');
      container.className = 'agentic-block agentic-block-' + type;
      container.setAttribute('data-agentic-generated', 'true');
      container.style.cssText = 'animation: agenticFadeIn 0.5s ease; margin: 1rem 0;';

      switch(type) {
        case 'faq':
          container.innerHTML = this.renderFAQBlock(data);
          break;
        case 'comparison':
          container.innerHTML = this.renderComparisonBlock(data);
          break;
        case 'pricing':
          container.innerHTML = this.renderPricingBlock(data);
          break;
        case 'testimonial':
          container.innerHTML = this.renderTestimonialBlock(data);
          break;
        case 'cta':
          container.innerHTML = this.renderCTABlock(data);
          break;
        case 'features':
          container.innerHTML = this.renderFeaturesBlock(data);
          break;
        case 'alert':
          container.innerHTML = this.renderAlertBlock(data);
          break;
        default:
          return null;
      }

      return container;
    }

    renderFAQBlock(data) {
      const items = data.items || [];
      return `
        <div style="background: #f8fafc; border-radius: 12px; padding: 24px; border-left: 4px solid #2563eb;">
          <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 16px; color: #1e293b;">${data.title || 'Frequently Asked Questions'}</h3>
          <div class="agentic-faq-list">
            ${items.map((item, i) => `
              <details style="margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
                <summary style="cursor: pointer; font-weight: 600; color: #334155; padding: 8px 0; list-style: none;">
                  <span style="color: #2563eb; margin-right: 8px;">❯</span> ${item.question}
                </summary>
                <p style="color: #64748b; padding: 8px 0 0 24px; margin: 0;">${item.answer}</p>
              </details>
            `).join('')}
          </div>
        </div>
      `;
    }

    renderComparisonBlock(data) {
      const items = data.items || [];
      return `
        <div style="background: #fff; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 16px; color: #1e293b;">${data.title || 'Comparison'}</h3>
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #f1f5f9;">
                  <th style="padding: 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #e2e8f0;">Feature</th>
                  ${items.map(item => `<th style="padding: 12px; text-align: center; font-weight: 600; border-bottom: 2px solid #e2e8f0;">${item.name}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${(data.features || []).map(feature => `
                  <tr>
                    <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; font-weight: 500;">${feature.name}</td>
                    ${items.map(item => `
                      <td style="padding: 12px; text-align: center; border-bottom: 1px solid #f1f5f9;">
                        ${item[feature.key] ? '✅' : item[feature.key] === false ? '❌' : item[feature.key]}
                      </td>
                    `).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    renderPricingBlock(data) {
      const tiers = data.tiers || [];
      return `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; margin: 16px 0;">
          ${tiers.map((tier, i) => `
            <div style="background: ${tier.highlighted ? '#2563eb' : '#fff'}; color: ${tier.highlighted ? '#fff' : '#1e293b'}; border-radius: 12px; padding: 24px; border: ${tier.highlighted ? 'none' : '2px solid #e2e8f0'}; transform: ${tier.highlighted ? 'scale(1.05)' : 'none'}; transition: transform 0.2s;">
              <h4 style="font-size: 1.125rem; font-weight: 700; margin-bottom: 8px;">${tier.name}</h4>
              <div style="font-size: 2rem; font-weight: 800; margin-bottom: 16px;">${tier.price}</div>
              <ul style="list-style: none; padding: 0; margin: 0 0 16px 0;">
                ${(tier.features || []).map(f => `<li style="padding: 4px 0;">✓ ${f}</li>`).join('')}
              </ul>
              <button onclick="${tier.action || ''}" style="width: 100%; padding: 12px; border-radius: 8px; border: none; background: ${tier.highlighted ? '#fff' : '#2563eb'}; color: ${tier.highlighted ? '#2563eb' : '#fff'}; font-weight: 600; cursor: pointer;">
                ${tier.cta || 'Get Started'}
              </button>
            </div>
          `).join('')}
        </div>
      `;
    }

    renderTestimonialBlock(data) {
      const testimonials = data.items || [];
      return `
        <div style="background: #f8fafc; border-radius: 12px; padding: 24px;">
          <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 16px; color: #1e293b;">${data.title || 'What Our Clients Say'}</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
            ${testimonials.map(t => `
              <div style="background: #fff; border-radius: 8px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <p style="font-style: italic; color: #475569; margin-bottom: 12px;">"${t.text}"</p>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <div style="width: 40px; height: 40px; border-radius: 50%; background: #e2e8f0; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #64748b;">${t.name?.charAt(0) || 'U'}</div>
                  <div>
                    <div style="font-weight: 600; color: #1e293b;">${t.name}</div>
                    <div style="font-size: 0.875rem; color: #64748b;">${t.role || ''}</div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    renderCTABlock(data) {
      return `
        <div style="background: ${data.bgColor || '#2563eb'}; color: ${data.textColor || '#fff'}; border-radius: 12px; padding: 32px; text-align: center; margin: 16px 0;">
          <h3 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 12px;">${data.title || 'Ready to Get Started?'}</h3>
          <p style="margin-bottom: 20px; opacity: 0.9;">${data.subtitle || 'Take the next step today.'}</p>
          <button onclick="${data.action || ''}" style="padding: 12px 32px; border-radius: 8px; border: none; background: ${data.buttonColor || '#fff'}; color: ${data.buttonTextColor || '#2563eb'}; font-weight: 700; font-size: 1rem; cursor: pointer;">
            ${data.buttonText || 'Get Started'}
          </button>
        </div>
      `;
    }

    renderFeaturesBlock(data) {
      const features = data.features || [];
      return `
        <div style="background: #fff; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0;">
          <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 16px; color: #1e293b;">${data.title || 'Features'}</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
            ${features.map(f => `
              <div style="display: flex; align-items: flex-start; gap: 12px;">
                <div style="width: 40px; height: 40px; border-radius: 8px; background: ${f.iconBg || '#eff6ff'}; color: ${f.iconColor || '#2563eb'}; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; flex-shrink: 0;">${f.icon || '✓'}</div>
                <div>
                  <h4 style="font-weight: 600; color: #1e293b; margin: 0 0 4px 0;">${f.title}</h4>
                  <p style="color: #64748b; font-size: 0.875rem; margin: 0;">${f.description}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    renderAlertBlock(data) {
      return `
        <div style="background: ${data.type === 'warning' ? '#fef3c7' : data.type === 'error' ? '#fee2e2' : data.type === 'success' ? '#d1fae5' : '#eff6ff'}; 
                    border-left: 4px solid ${data.type === 'warning' ? '#f59e0b' : data.type === 'error' ? '#ef4444' : data.type === 'success' ? '#10b981' : '#2563eb'}; 
                    border-radius: 8px; padding: 16px; margin: 16px 0;">
          <div style="font-weight: 600; color: ${data.type === 'warning' ? '#92400e' : data.type === 'error' ? '#991b1b' : data.type === 'success' ? '#065f46' : '#1e40af'}; margin-bottom: 4px;">
            ${data.title || 'Note'}
          </div>
          <div style="color: ${data.type === 'warning' ? '#a16207' : data.type === 'error' ? '#b91c1c' : data.type === 'success' ? '#047857' : '#3b82f6'}; font-size: 0.875rem;">
            ${data.message}
          </div>
        </div>
      `;
    }

    injectBlock(block, selector) {
      let target;
      if (selector) {
        target = document.querySelector(selector);
      }
      if (!target) {
        // Find a good insertion point - after hero, before footer, or in main content
        target = document.querySelector('main') || 
                 document.querySelector('article') ||
                 document.querySelector('.content') ||
                 document.querySelector('#content') ||
                 document.body;
      }
      if (target) {
        target.appendChild(block);
        this.dynamicBlocks.push({ type: block.className, timestamp: Date.now() });
        
        // Track the block injection
        block.addEventListener('click', (e) => {
          if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A') {
            this.logEvent('dynamic_block_click', { 
              block_type: block.className,
              element: e.target.innerText?.substring(0, 50),
              sessionId: this.sessionId
            });
          }
        });
      }
    }

    // ============================================
    // 4. REAL-TIME PAGE MODIFICATION
    // ============================================
    modifyPage(action, params) {
      this.logEvent('page_modification', { action, params, sessionId: this.sessionId });
      
      switch(action) {
        case 'move_cta':
          this.moveElement(params.selector, params.target);
          break;
        case 'hide_element':
          this.hideElement(params.selector);
          break;
        case 'show_element':
          this.showElement(params.selector);
          break;
        case 'change_text':
          this.changeText(params.selector, params.text);
          break;
        case 'highlight':
          this.highlightElement(params.selector);
          break;
        case 'add_urgency':
          this.addUrgency(params.selector, params.message);
          break;
      }
    }

    moveElement(selector, targetSelector) {
      const el = document.querySelector(selector);
      const target = document.querySelector(targetSelector);
      if (el && target) {
        target.insertBefore(el, target.firstChild);
      }
    }

    hideElement(selector) {
      const el = document.querySelector(selector);
      if (el) el.style.display = 'none';
    }

    showElement(selector) {
      const el = document.querySelector(selector);
      if (el) el.style.display = '';
    }

    changeText(selector, text) {
      const el = document.querySelector(selector);
      if (el) el.textContent = text;
    }

    highlightElement(selector) {
      const el = document.querySelector(selector);
      if (el) {
        el.style.animation = 'agenticPulse 2s ease-in-out 3';
        setTimeout(() => { el.style.animation = ''; }, 6000);
      }
    }

    addUrgency(selector, message) {
      const el = document.querySelector(selector);
      if (el) {
        const badge = document.createElement('span');
        badge.style.cssText = 'background: #ef4444; color: #fff; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; margin-left: 8px; font-weight: 600;';
        badge.textContent = message || 'Limited Time';
        el.appendChild(badge);
      }
    }

    // ============================================
    // 5. BEHAVIOR ANALYSIS
    // ============================================
    startBehaviorAnalysis() {
      // Analyze patterns after 5 seconds of inactivity
      let analysisTimer;
      const resetTimer = () => {
        clearTimeout(analysisTimer);
        analysisTimer = setTimeout(() => this.analyzeSession(), 5000);
      };
      ['scroll', 'click', 'mousemove'].forEach(e => {
        document.addEventListener(e, resetTimer, { passive: true });
      });
    }

    analyzeSession() {
      const events = this.eventQueue;
      const clicks = events.filter(e => e.type === 'click');
      const searches = events.filter(e => e.type === 'search');
      const scrolls = events.filter(e => e.type === 'scroll_depth');
      const forms = events.filter(e => e.type === 'form_start');
      
      // Detect patterns
      const patterns = {
        bounced: scrolls.length === 0 && clicks.length < 2,
        researcher: searches.length > 2 || (clicks.length > 5 && forms.length === 0),
        engaged: scrolls.some(s => s.data.percent >= 75) && clicks.length > 3,
        ready_to_convert: forms.length > 0 || clicks.filter(c => c.data.text?.toLowerCase().includes('buy') || c.data.text?.toLowerCase().includes('book') || c.data.text?.toLowerCase().includes('contact')).length > 0
      };

      // Trigger actions based on patterns
      if (patterns.bounced) {
        this.triggerAction('bounce_prevention');
      }
      if (patterns.researcher && !patterns.ready_to_convert) {
        this.triggerAction('researcher_nurture');
      }
      if (patterns.ready_to_convert) {
        this.triggerAction('conversion_boost');
      }

      this.logEvent('session_analysis', { patterns, sessionId: this.sessionId });
    }

    triggerAction(action) {
      switch(action) {
        case 'bounce_prevention':
          // Show exit-intent offer if not already shown
          if (!this.trackers['exit_offer_shown']) {
            this.showExitIntent();
          }
          break;
        case 'researcher_nurture':
          // Generate a comparison or FAQ block
          this.generateBlock('faq', {
            title: 'Common Questions',
            items: this.getDefaultFAQs()
          });
          break;
        case 'conversion_boost':
          // Add urgency badge to CTA
          const mainCTA = document.querySelector('[data-track="cta_main"]') || document.querySelector('button[type="submit"]');
          if (mainCTA) {
            this.addUrgency(mainCTA, 'Almost there!');
          }
          break;
      }
    }

    getDefaultFAQs() {
      return [
        { question: 'How do I get started?', answer: 'Simply click the button above and fill out our quick form. We\'ll contact you within 24 hours.' },
        { question: 'Is there a free consultation?', answer: 'Yes! We offer a free 30-minute consultation to discuss your needs.' },
        { question: 'What makes you different?', answer: 'We combine AI-powered insights with personalized service to deliver the best results.' }
      ];
    }

    showExitIntent() {
      this.trackers['exit_offer_shown'] = true;
      // Generate a special offer block
      const block = this.generateBlock('cta', {
        title: 'Wait! Before You Go...',
        subtitle: 'Get our free guide to help you get started.',
        buttonText: 'Send Me the Guide',
        action: 'window.showLeadForm && window.showLeadForm()',
        bgColor: '#1e293b',
        textColor: '#fff',
        buttonColor: '#f59e0b',
        buttonTextColor: '#1e293b'
      });
      if (block) {
        block.style.position = 'fixed';
        block.style.bottom = '20px';
        block.style.right = '20px';
        block.style.zIndex = '9999';
        block.style.maxWidth = '400px';
        block.style.boxShadow = '0 10px 40px rgba(0,0,0,0.2)';
      }
    }

    // ============================================
    // 6. AUTO-OPTIMIZATION
    // ============================================
    setupAutoOptimization() {
      // Check for dead clicks (clicked but not interactive)
      document.addEventListener('click', (e) => {
        const target = e.target;
        const isInteractive = target.tagName === 'A' || target.tagName === 'BUTTON' || 
                               target.closest('a') || target.closest('button') ||
                               target.onclick || target.closest('[onclick]') ||
                               target.closest('[data-track]');
        if (!isInteractive && target.textContent?.trim()) {
          this.logEvent('dead_click', { 
            element: target.tagName, 
            text: target.innerText?.substring(0, 50),
            sessionId: this.sessionId 
          });
        }
      });
    }

    applyInitialOptimizations() {
      // Apply A/B test variants from config
      if (this.config.abTesting?.enabled) {
        const variants = this.config.abTesting.variants;
        const pickVariant = (variants) => {
          if (!variants || variants.length === 0) return null;
          const hash = this.sessionId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
          return variants[hash % variants.length];
        };

        // Apply headline variant
        if (variants.headline && variants.headline.length > 0) {
          const headline = pickVariant(variants.headline);
          const headlineEl = document.querySelector('h1') || document.querySelector('.hero-title') || document.querySelector('[data-ab="headline"]');
          if (headlineEl && headline) {
            headlineEl.textContent = headline;
            this.logEvent('ab_test_applied', { variant: 'headline', value: headline, sessionId: this.sessionId });
          }
        }

        // Apply CTA variant
        if (variants.cta && variants.cta.length > 0) {
          const cta = pickVariant(variants.cta);
          const ctaEl = document.querySelector('[data-ab="cta"]') || document.querySelector('button[type="submit"]');
          if (ctaEl && cta) {
            ctaEl.textContent = cta;
            this.logEvent('ab_test_applied', { variant: 'cta', value: cta, sessionId: this.sessionId });
          }
        }
      }
    }

    // ============================================
    // 7. UTILITIES
    // ============================================
    getSection(element) {
      let el = element;
      while (el && el !== document.body) {
        if (el.id) return el.id;
        if (el.className) {
          const classes = el.className.split(' ').filter(c => c);
          if (classes.length > 0) return classes[0];
        }
        el = el.parentElement;
      }
      return 'body';
    }

    analyzeSearchIntent(query) {
      const intent = {
        query: query,
        type: 'unknown',
        confidence: 0
      };
      
      const lower = query.toLowerCase();
      
      if (lower.includes('buy') || lower.includes('purchase') || lower.includes('get') || lower.includes('shop')) {
        intent.type = 'buyer';
        intent.confidence = 0.9;
      } else if (lower.includes('sell') || lower.includes('list') || lower.includes('valuation') || lower.includes('worth')) {
        intent.type = 'seller';
        intent.confidence = 0.9;
      } else if (lower.includes('price') || lower.includes('cost') || lower.includes('fee') || lower.includes('how much')) {
        intent.type = 'pricing_research';
        intent.confidence = 0.8;
      } else if (lower.includes('compare') || lower.includes('vs') || lower.includes('versus') || lower.includes('difference')) {
        intent.type = 'comparison';
        intent.confidence = 0.8;
      } else if (lower.includes('how') || lower.includes('what') || lower.includes('why') || lower.includes('help')) {
        intent.type = 'information';
        intent.confidence = 0.7;
      } else if (lower.includes('contact') || lower.includes('call') || lower.includes('email') || lower.includes('reach')) {
        intent.type = 'contact';
        intent.confidence = 0.9;
      } else if (lower.includes('book') || lower.includes('schedule') || lower.includes('appointment') || lower.includes('meeting')) {
        intent.type = 'booking';
        intent.confidence = 0.9;
      }
      
      this.logEvent('search_intent', { ...intent, sessionId: this.sessionId });
      
      // Trigger dynamic block based on intent
      if (intent.type === 'pricing_research') {
        this.generateBlock('pricing', this.getDefaultPricingData());
      } else if (intent.type === 'comparison') {
        this.generateBlock('comparison', this.getDefaultComparisonData());
      }
      
      return intent;
    }

    getDefaultPricingData() {
      return {
        title: 'Our Services',
        tiers: [
          { name: 'Starter', price: 'Free', features: ['Basic access', 'Email support', 'Community forum'], cta: 'Get Started', action: 'window.location.href="#signup"' },
          { name: 'Professional', price: '$99/mo', features: ['Full access', 'Priority support', 'Analytics dashboard', 'API access'], cta: 'Start Free Trial', highlighted: true, action: 'window.location.href="#signup"' },
          { name: 'Enterprise', price: 'Custom', features: ['Everything in Pro', 'Dedicated manager', 'Custom integrations', 'SLA guarantee'], cta: 'Contact Sales', action: 'window.location.href="#contact"' }
        ]
      };
    }

    getDefaultComparisonData() {
      return {
        title: 'How We Compare',
        features: [
          { name: 'AI-Powered', key: 'ai' },
          { name: '24/7 Support', key: 'support' },
          { name: 'Custom Solutions', key: 'custom' },
          { name: 'Free Trial', key: 'trial' },
          { name: 'API Access', key: 'api' }
        ],
        items: [
          { name: 'Us', ai: true, support: true, custom: true, trial: true, api: true },
          { name: 'Others', ai: false, support: true, custom: false, trial: false, api: false }
        ]
      };
    }

    // ============================================
    // 8. EVENT LOGGING
    // ============================================
    logEvent(type, data) {
      this.eventQueue.push({ type, data, timestamp: Date.now() });
      
      // Batch send every 30 seconds or when queue hits 20
      if (this.eventQueue.length >= 20) {
        this.flushQueue();
      } else {
        clearTimeout(this.sendTimeout);
        this.sendTimeout = setTimeout(() => this.flushQueue(), 30000);
      }
    }

    flushQueue() {
      if (this.eventQueue.length === 0) return;
      
      const events = [...this.eventQueue];
      this.eventQueue = [];
      
      // Send to API endpoint
      if (this.apiEndpoint && this.apiEndpoint !== '/api/agentic') {
        fetch(this.apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            siteId: this.siteId,
            sessionId: this.sessionId,
            events: events,
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: Date.now()
          }),
          keepalive: true
        }).catch(() => {
          // Store in localStorage for retry
          const stored = JSON.parse(localStorage.getItem('agentic_events') || '[]');
          stored.push(...events);
          localStorage.setItem('agentic_events', JSON.stringify(stored.slice(-100)));
        });
      } else {
        // Store in localStorage when no API endpoint
        const stored = JSON.parse(localStorage.getItem('agentic_events') || '[]');
        stored.push(...events);
        localStorage.setItem('agentic_events', JSON.stringify(stored.slice(-100)));
      }
    }
  }

  // Global CSS for animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes agenticFadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes agenticPulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.4); }
      50% { box-shadow: 0 0 0 10px rgba(37, 99, 235, 0); }
    }
    .agentic-block { animation: agenticFadeIn 0.5s ease; }
    .agentic-block details > summary::-webkit-details-marker { display: none; }
    .agentic-block details > summary { list-style: none; }
    .agentic-block details > summary::marker { display: none; }
  `;
  document.head.appendChild(style);

  // Expose globally
  window.AgenticWebsite = AgenticWebsite;
  window.agentic = {
    generateBlock: (type, data, selector) => {
      if (window._agenticInstance) return window._agenticInstance.generateBlock(type, data, selector);
      return null;
    },
    modifyPage: (action, params) => {
      if (window._agenticInstance) return window._agenticInstance.modifyPage(action, params);
    },
    getAnalytics: () => {
      return JSON.parse(localStorage.getItem('agentic_events') || '[]');
    }
  };
})();
