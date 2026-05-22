// CEDEXX Agentic Website Configuration
// Auto-optimizes SEO based on user behavior

window.AGENTIC_CONFIG = {
  siteId: 'cedexx',
  siteName: 'CEDEXX',
  
  track: {
    searches: true,
    clicks: true,
    scrollDepth: true,
    forms: true,
    timeOnPage: true
  },
  
  optimize: {
    metaTitle: true,
    metaDescription: true,
    ctaButtons: true,
    contentPriority: true,
    schemaOrg: true
  },
  
  primaryKeywords: [
    'telemedicine miami',
    'pediatric virtual care',
    'family healthcare florida',
    '24/7 doctor access',
    'no insurance healthcare',
    'health tech platform',
    'medical technology',
    'healthcare innovation',
    'digital health',
    'patient care technology'
  ],
  
  conversionGoals: [
    'consultation_booking',
    'blog_signup',
    'partner_inquiry',
    'demo_request'
  ],
  
  ctaVariants: [
    'Book Consultation',
    'Request Demo',
    'Explore Platform',
    'Learn More',
    'Get Started'
  ],
  
  targetLocations: ['Miami', 'Miami-Dade', 'Broward', 'Florida'],
  targetServices: ['telemedicine', 'pediatric care', 'family medicine', 'mental health', 'wellness'],
  targetLanguages: ['English', 'Spanish'],
  
  contentOptimization: true,
  autoMetaGeneration: true,
  aBTesting: true,
  
  schemaTypes: {
    homepage: 'MedicalWebPage',
    services: 'MedicalBusiness',
    about: 'Organization',
    blog: 'Blog',
    contact: 'ContactPage'
  },
  
  // AI Search visibility rules (Google May 2026)
  aiOptimization: {
    generateCitations: true,
    trackFeaturedSnippets: true,
    monitorAIPresence: true,
    contentFreshness: 7,
    structuredDataPriority: ['MedicalBusiness', 'FAQPage', 'Service']
  },
  
  trackElements: ['[data-track]', 'a', 'button', '.cta', '.book-now', '.consultation']
};
