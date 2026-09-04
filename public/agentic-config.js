/**
 * ═══════════════════════════════════════════════════════════
 * CEDEXX Agentic Website Engine Config v2
 * ═══════════════════════════════════════════════════════════
 * 
 * This config file loads before the agentic engine and provides
 * site-specific settings. The engine auto-optimizes based on
 * visitor behavior tracked and sent to /api/analytics.
 * 
 * Place in public/ and include in index.html:
 *   <script src="/agentic-config.js"></script>
 *   <script src="/agentic-engine.js"></script>
 * ═══════════════════════════════════════════════════════════
 */

(function() {
  'use strict';

  window.AGENTIC_CONFIG = {
    // Site identification
    siteId: 'cedexx',
    
    // Backend API endpoint for analytics events
    apiEndpoint: '/api/analytics',
    
    // Self-optimization features (all enabled by default)
    optimize: {
      // Dynamic meta title based on search term affinity
      metaTitle: true,
      
      // Dynamic meta description based on popular content
      metaDescription: true,
      
      // CTA button text optimization based on conversion data
      ctaButtons: true,
      
      // Content section priority highlighting
      contentPriority: true,
      
      // Schema.org markup updates based on traffic patterns
      schemaOrg: true,
      
      // A/B testing framework for hero CTAs
      aBTesting: true,
      
      // Image lazy loading and preconnect hints
      performance: true,
      
      // Form UX hints when abandonment is detected
      formOptimization: true
    },
    
    // Primary keywords for SEO optimization
    primaryKeywords: [
      'telemedicine miami',
      'pediatric virtual care',
      'family healthcare florida',
      '24/7 doctor access',
      'no insurance healthcare',
      'health tech platform',
      'digital health',
      'healthcare innovation',
      'virtual urgent care',
      'miami telehealth'
    ],
    
    // CTA text variants for A/B testing
    ctaVariants: [
      'Book Consultation',
      'Request Demo',
      'Explore Platform',
      'Learn More',
      'Get Started',
      'Start Membership',
      'Talk to a Doctor',
      'Join Free Trial'
    ],
    
    // Conversion goals for tracking
    conversionGoals: ['enroll', 'demo', 'contact', 'partner'],
    
    // Elements to track for analytics
    trackElements: [
      '[data-track]',
      'a',
      'button',
      '.cta',
      '[href*="enroll"]',
      '[href*="demo"]',
      '[href*="contact"]',
      '[data-ab-test]'
    ],
    
    // Performance settings
    performance: {
      // Lazy load images below this threshold (px from viewport bottom)
      lazyLoadThreshold: 200,
      
      // Preconnect to these domains
      preconnectDomains: [
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com'
      ],
      
      // Prefetch popular pages after idle
      prefetchOnIdle: true
    },
    
    // Form optimization settings
    forms: {
      // Show UX hints when abandonment rate exceeds this %
      abandonmentThreshold: 60,
      
      // Simplify form by highlighting required fields only
      highlightRequired: true
    },
    
    // Analytics batching
    analytics: {
      // Send events every N seconds
      flushInterval: 5000,
      
      // Max events before forced flush
      maxQueueSize: 20,
      
      // Retain local events for this many days
      localRetentionDays: 3
    },
    
    // Schema.org optimization
    schema: {
      // Update MedicalBusiness aggregateRating from reviews
      dynamicRating: true,
      
      // Add HowTo markup for high-traffic pages
      howToForPopularPages: true,
      
      // FAQ markup based on contact form inquiries
      dynamicFAQ: false // Requires backend NLP processing
    }
  };

  console.log('[CEDEXX Agentic] Config loaded for', window.AGENTIC_CONFIG.siteId);
})();
