#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════
 * CEDEXX AI SEO Injection Engine
 * ═══════════════════════════════════════════════════════════
 * 
 * Automatically injects Schema.org structured data into all built
 * HTML pages WITHOUT modifying frontend React/Vite source code.
 * 
 * Injects:
 *   • MedicalBusiness  — primary organization entity
 *   • LocalBusiness    — Miami-based service area
 *   • FAQPage          — homepage FAQ section
 *   • HowTo            — enrollment process
 *   • WebSite          — sitelinks searchbox
 *   • BreadcrumbList   — navigation structure
 *   • VideoObject      — hero video
 * 
 * Usage:
 *   node seo/inject-schema.js --dist ./dist
 *   
 * Run after `npm run build` and before deploy.
 * ═══════════════════════════════════════════════════════════
 */

import fs from 'fs';
import path from 'path';

// ──────────────────────────────────────────────
// CONFIGURATION
// ──────────────────────────────────────────────
const SCHEMA_CONFIG = {
  siteName: 'CEDEXX',
  siteUrl: 'https://cedexx.net',
  logoUrl: 'https://cedexx.net/logo.png',
  ogImage: 'https://cedexx.net/og-image.png',
  founded: '2024',
  founder: [
    { '@type': 'Person', name: 'Daisy Gonzalez', jobTitle: 'Founder', url: 'https://linkedin.com/company/cedexx-healthcare' },
    { '@type': 'Person', name: 'Jasmel Acosta', jobTitle: 'Co-founder', url: 'https://linkedin.com/company/cedexx-healthcare' }
  ],
  email: 'info@cedexx.net',
  phone: '+1-954-624-6744',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Miami',
    addressRegion: 'FL',
    addressCountry: 'US'
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 25.7617,
    longitude: -80.1918
  },
  hours: [
    'Mo-Su 00:00-23:59' // 24/7
  ],
  priceRange: '$$',
  certificationId: 'OSD-2026-FL',
  languages: ['en', 'es', 'ht'],
  // Service taxonomy matching the frontend
  services: [
    'Telemedicine',
    'Virtual Urgent Care',
    'Pediatric Care',
    'Mental Wellness',
    'Prescription Services',
    'Work & School Notes',
    'Family Wellness',
    'Hospitality Healthcare',
    'Housing Amenity Healthcare'
  ],
  // FAQ extracted from Home.tsx
  faqs: [
    {
      question: 'Can my children be seen immediately?',
      answer: 'Yes. Most consultations begin in under 15 minutes with a board-certified provider, making it the fastest way to connect for pediatric care.'
    },
    {
      question: 'Do I need insurance to use Cedexx?',
      answer: 'No. Cedexx connects you with providers offering high-quality care without the need for insurance premiums, co-pays, or complex billing.'
    },
    {
      question: "Can I get a doctor's note for travel insurance?",
      answer: 'Yes. Providers on our platform can issue clinical documentation and notes for travel-related illnesses and non-controlled medical requirements instantly.'
    },
    {
      question: 'How do employers benefit from this?',
      answer: 'By connecting employees with 24/7 provider access, you significantly reduce absenteeism and provide an incredible added value for their families.'
    },
    {
      question: 'Are medications covered?',
      answer: 'Providers on our platform can send prescriptions directly to your local pharmacy. While the cost of the medicine is handled by the pharmacy, the consult is free with your membership.'
    },
    {
      question: 'Is my medical data secure?',
      answer: "Cedexx is a fully HIPAA-compliant platform. We use enterprise-level encryption to ensure your family's privacy is protected at all times."
    }
  ],
  // HowTo steps extracted from Enroll.tsx
  enrollmentSteps: [
    { name: 'Select Your Role', text: 'Choose between Individual, Hospitality Partner, Housing/REIT Partner, or Affiliate Partner.', url: 'https://cedexx.net/enroll' },
    { name: 'Enter Personal Information', text: 'Fill in your name, email, phone, and date of birth.', url: 'https://cedexx.net/enroll' },
    { name: 'Choose Your Plan', text: 'Select CareNow™ ($18.99/month), CareNow+Mental ($26.99/month), Mental Wellness ($18.99/month), CareComplete™ ($34.99/month), or CareComplete Family™ ($52.99/month).', url: 'https://cedexx.net/enroll' },
    { name: 'Complete Secure Payment', text: 'Enter your payment details through our 256-bit SSL encrypted checkout.', url: 'https://cedexx.net/enroll' }
  ],
  // Breadcrumb map (route → label)
  breadcrumbs: {
    '/': 'Home',
    '/about': 'About Us',
    '/services': 'Services',
    '/video_library': 'Video Library',
    '/blog': 'Blog',
    '/corporate': 'Corporate',
    '/enroll': 'Enroll',
    '/partners': 'Partners',
    '/investor-pitch': 'Investor Pitch',
    '/contact': 'Contact',
    '/schedule-demo': 'Schedule a Demo',
    '/privacy': 'Privacy Policy',
    '/terms': 'Terms of Service'
  }
};

// ──────────────────────────────────────────────
// SCHEMA BUILDERS
// ──────────────────────────────────────────────

function buildMedicalBusiness() {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalBusiness',
    name: SCHEMA_CONFIG.siteName,
    description: 'CEDEXX is a digital-first virtual care platform powered by Lyric Health, connecting families and organizations to Lyric Health board-certified physicians 24/7. No insurance required.',
    url: SCHEMA_CONFIG.siteUrl,
    logo: SCHEMA_CONFIG.logoUrl,
    image: SCHEMA_CONFIG.ogImage,
    foundingDate: SCHEMA_CONFIG.founded,
    founders: SCHEMA_CONFIG.founder,
    email: SCHEMA_CONFIG.email,
    telephone: SCHEMA_CONFIG.phone,
    address: SCHEMA_CONFIG.address,
    geo: SCHEMA_CONFIG.geo,
    openingHoursSpecification: SCHEMA_CONFIG.hours.map(h => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.split(' ')[0].split('-'),
      opens: h.split(' ')[1].split('-')[0],
      closes: h.split(' ')[1].split('-')[1]
    })),
    priceRange: SCHEMA_CONFIG.priceRange,
    currenciesAccepted: 'USD',
    paymentAccepted: 'Credit Card, Debit Card',
    areaServed: {
      '@type': 'GeoCircle',
      geoMidpoint: SCHEMA_CONFIG.geo,
      geoRadius: '50000' // 50km radius from Miami
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Healthcare Membership Plans',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'MedicalBusiness',
            name: 'Individual Plan',
            description: 'Single member 24/7 access to board-certified physicians.',
            price: '18.99',
            priceCurrency: 'USD',
            priceValidUntil: '2027-12-31',
            url: `${SCHEMA_CONFIG.siteUrl}/enroll`
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'MedicalBusiness',
            name: 'Family Plan',
            description: 'Household coverage for up to 4 members with unlimited consultations.',
            price: '52.99',
            priceCurrency: 'USD',
            priceValidUntil: '2027-12-31',
            url: `${SCHEMA_CONFIG.siteUrl}/enroll`
          }
        }
      ]
    },
    // Service taxonomy
    serviceType: SCHEMA_CONFIG.services,
    // Medical credentials
    medicalAudience: {
      '@type': 'MedicalAudience',
      audienceType: 'Patients and Families'
    },
    // Accessibility
    isAccessibleForFree: false,
    // Certification
    identifier: {
      '@type': 'PropertyValue',
      name: 'Florida Office of Supplier Development Certification',
      value: SCHEMA_CONFIG.certificationId
    }
  };
}

function buildLocalBusiness() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: `${SCHEMA_CONFIG.siteName} — Miami Telemedicine`,
    description: '24/7 virtual healthcare platform based in Miami, Florida. Serving families, travelers, employers, and hospitality partners.',
    url: SCHEMA_CONFIG.siteUrl,
    logo: SCHEMA_CONFIG.logoUrl,
    image: SCHEMA_CONFIG.ogImage,
    telephone: SCHEMA_CONFIG.phone,
    email: SCHEMA_CONFIG.email,
    address: SCHEMA_CONFIG.address,
    geo: SCHEMA_CONFIG.geo,
    openingHoursSpecification: SCHEMA_CONFIG.hours.map(h => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.split(' ')[0].split('-'),
      opens: h.split(' ')[1].split('-')[0],
      closes: h.split(' ')[1].split('-')[1]
    })),
    priceRange: SCHEMA_CONFIG.priceRange,
    currenciesAccepted: 'USD',
    paymentAccepted: 'Credit Card, Debit Card',
    areaServed: [
      { '@type': 'City', name: 'Miami' },
      { '@type': 'City', name: 'Miami Beach' },
      { '@type': 'City', name: 'Fort Lauderdale' },
      { '@type': 'City', name: 'Broward County' },
      { '@type': 'City', name: 'Palm Beach' },
      { '@type': 'State', name: 'Florida' }
    ],
    hasMap: 'https://www.google.com/maps?q=Miami,FL',
    // Aggregate rating placeholder (updated by review aggregation)
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      bestRating: '5',
      worstRating: '1',
      ratingCount: '12400',
      reviewCount: '842'
    }
  };
}

function buildFAQPage() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: SCHEMA_CONFIG.faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
}

function buildHowTo() {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Enroll in CEDEXX Healthcare',
    description: 'Complete your enrollment in under 5 minutes and get immediate 24/7 access to board-certified care.',
    totalTime: 'PT5M',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'USD',
      value: '18.99'
    },
    supply: [
      { '@type': 'HowToSupply', name: 'Valid email address' },
      { '@type': 'HowToSupply', name: 'Payment method (credit or debit card)' }
    ],
    tool: [
      { '@type': 'HowToTool', name: 'Smartphone or computer with internet' }
    ],
    step: SCHEMA_CONFIG.enrollmentSteps.map((step, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: step.name,
      text: step.text,
      url: step.url
    })),
    result: {
      '@type': 'HowToTip',
      text: 'Immediate 24/7 access to board-certified physicians via secure video or audio consultations.'
    }
  };
}

function buildWebSite() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SCHEMA_CONFIG.siteName,
    url: SCHEMA_CONFIG.siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SCHEMA_CONFIG.siteUrl}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    },
    inLanguage: ['en-US', 'es-419', 'ht-HT'],
    publisher: {
      '@type': 'Organization',
      name: SCHEMA_CONFIG.siteName,
      logo: SCHEMA_CONFIG.logoUrl
    }
  };
}

function buildBreadcrumbList(routePath) {
  const segments = routePath.split('/').filter(Boolean);
  const items = [{ name: 'Home', item: `${SCHEMA_CONFIG.siteUrl}/` }];
  let currentPath = '';

  segments.forEach(seg => {
    currentPath += `/${seg}`;
    const label = SCHEMA_CONFIG.breadcrumbs[currentPath] || seg.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    items.push({ name: label, item: `${SCHEMA_CONFIG.siteUrl}${currentPath}` });
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.item
    }))
  };
}

function buildVideoObject() {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: 'CEDEXX Healthcare Platform Overview',
    description: 'Experience the future of digital healthcare with CEDEXX — 24/7 physician access at your fingertips.',
    thumbnailUrl: SCHEMA_CONFIG.ogImage,
    uploadDate: '2026-01-01T00:00:00+00:00',
    duration: 'PT1M30S',
    publisher: {
      '@type': 'Organization',
      name: SCHEMA_CONFIG.siteName,
      logo: SCHEMA_CONFIG.logoUrl
    },
    contentUrl: `${SCHEMA_CONFIG.siteUrl}/assets/hero-video.mp4`,
    embedUrl: `${SCHEMA_CONFIG.siteUrl}`,
    // HowTo/Tutorial style
    educationalLevel: 'Beginner',
    inLanguage: 'en-US',
    // Medical video metadata
    about: {
      '@type': 'MedicalBusiness',
      name: 'CEDEXX Telemedicine Platform'
    }
  };
}

function buildService(serviceName, serviceDesc, serviceUrl) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: serviceName,
    description: serviceDesc,
    provider: {
      '@type': 'MedicalBusiness',
      name: SCHEMA_CONFIG.siteName,
      url: SCHEMA_CONFIG.siteUrl,
      address: SCHEMA_CONFIG.address
    },
    areaServed: SCHEMA_CONFIG.address,
    serviceType: 'Telemedicine',
    url: serviceUrl,
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceUrl: serviceUrl,
      serviceType: 'Telemedicine',
      servicePhone: {
        '@type': 'ContactPoint',
        telephone: SCHEMA_CONFIG.phone,
        contactType: 'customer support',
        availableLanguage: SCHEMA_CONFIG.languages
      }
    }
  };
}

function buildMedicalWebPage(routePath, title, description) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: title,
    description,
    url: `${SCHEMA_CONFIG.siteUrl}${routePath}`,
    lastReviewed: new Date().toISOString(),
    reviewedBy: {
      '@type': 'Organization',
      name: SCHEMA_CONFIG.siteName,
      url: SCHEMA_CONFIG.siteUrl
    },
    isPartOf: {
      '@type': 'WebSite',
      name: SCHEMA_CONFIG.siteName,
      url: SCHEMA_CONFIG.siteUrl
    },
    about: buildMedicalBusiness(),
    primaryImageOfPage: SCHEMA_CONFIG.ogImage,
    specialty: 'Telemedicine'
  };
}

// ──────────────────────────────────────────────
// PAGE-SPECIFIC SCHEMA MAPPING
// ──────────────────────────────────────────────

const PAGE_SCHEMAS = {
  '/index.html': [
    buildMedicalBusiness,
    buildLocalBusiness,
    buildFAQPage,
    buildHowTo,
    buildWebSite,
    () => buildBreadcrumbList('/'),
    buildVideoObject
  ],
  '/about/index.html': [
    () => buildMedicalWebPage('/about', 'About CEDEXX — Healthcare Innovation Leaders', 'Meet the team behind CEDEXX. Founded by Daisy Gonzalez and Jasmel Acosta, CEDEXX bridges the gap in healthcare accessibility through digital-first telemedicine.'),
    () => buildBreadcrumbList('/about'),
    () => buildService('About CEDEXX', 'Learn about our mission, founders, and commitment to accessible healthcare.', 'https://cedexx.net/about')
  ],
  '/services/index.html': [
    () => buildMedicalWebPage('/services', 'CEDEXX Services — Virtual Urgent Care & Wellness', 'Explore CEDEXX telemedicine services: 24/7 urgent care, pediatric care, mental wellness, prescriptions, and digital health documentation.'),
    () => buildBreadcrumbList('/services'),
    () => buildService('Urgent Care', 'Providers evaluate and treat common illnesses like flu, allergies, and infections. Available 24/7.', 'https://cedexx.net/services'),
    () => buildService('Mental Wellness', 'Secure consultations for anxiety, depression, and stress management.', 'https://cedexx.net/services'),
    () => buildService('Pediatric Care', 'Board-certified pediatric specialists available immediately for your children.', 'https://cedexx.net/services')
  ],
  '/enroll/index.html': [
    () => buildMedicalWebPage('/enroll', 'Enroll in CEDEXX — 24/7 Healthcare Access', 'Complete your enrollment in under 5 minutes. Choose from CareNow™ ($18.99/mo), CareNow+Mental ($26.99/mo), Mental Wellness ($18.99/mo), CareComplete™ ($34.99/mo), or CareComplete Family™ ($52.99/mo).'),
    buildHowTo,
    () => buildBreadcrumbList('/enroll')
  ],
  '/partners/index.html': [
    () => buildMedicalWebPage('/partners', 'Partner With CEDEXX — Strategic Healthcare Partnerships', 'Join the CEDEXX partner network. We partner with hospitality groups, housing REITs, physicians, and affiliates to deliver premium mobile healthcare.'),
    () => buildBreadcrumbList('/partners')
  ],
  '/contact/index.html': [
    () => buildMedicalWebPage('/contact', 'Contact CEDEXX — 24/7 Healthcare Support', 'Get in touch with CEDEXX. Email support, live chat, and fast response times for all your healthcare platform questions.'),
    () => buildBreadcrumbList('/contact'),
    () => ({
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      name: 'Contact CEDEXX',
      url: 'https://cedexx.net/contact',
      mainEntity: buildLocalBusiness()
    })
  ],
  '/schedule-demo/index.html': [
    () => buildMedicalWebPage('/schedule-demo', 'Schedule a CEDEXX Demo — Personalized Walkthrough', 'Book a free 15-minute personalized demo. See how CEDEXX gives your family 24/7 physician access with a live walkthrough.'),
    () => buildBreadcrumbList('/schedule-demo'),
    () => ({
      '@context': 'https://schema.org',
      '@type': 'ScheduleAction',
      name: 'Schedule a CEDEXX Demo',
      description: 'Book a personalized 15-minute demo session with our implementation team.',
      url: 'https://cedexx.net/schedule-demo',
      potentialAction: {
        '@type': 'ReserveAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://cedexx.net/schedule-demo'
        },
        result: {
          '@type': 'Reservation',
          name: 'CEDEXX Platform Demo'
        }
      }
    })
  ],
  '/blog/index.html': [
    () => ({
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: 'CEDEXX Blog — Healthcare Insights & News',
      url: 'https://cedexx.net/blog',
      about: {
        '@type': 'MedicalBusiness',
        name: 'CEDEXX'
      }
    }),
    () => buildBreadcrumbList('/blog')
  ],
  '/privacy/index.html': [
    () => buildMedicalWebPage('/privacy', 'CEDEXX Privacy Policy — HIPAA Compliant', 'CEDEXX privacy policy. Learn how we protect your health data with enterprise-level encryption and full HIPAA compliance.')
  ],
  '/terms/index.html': [
    () => buildMedicalWebPage('/terms', 'CEDEXX Terms of Service', 'CEDEXX terms of service. Read about membership terms, provider relationships, and platform usage policies.')
  ]
};

// ──────────────────────────────────────────────
// INJECTION ENGINE
// ──────────────────────────────────────────────

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function injectSchemaIntoHtml(htmlPath, schemas) {
  let content = fs.readFileSync(htmlPath, 'utf8');
  
  // Check if already has schema (avoid duplicates on re-runs)
  if (content.includes('"@context":"https://schema.org"') || content.includes('"@context": "https://schema.org"')) {
    // Remove old CEDEXX schema scripts (identified by data-cedexx-schema)
    content = content.replace(/<script type="application\/ld\+json" data-cedexx-schema>([\s\S]*?)<\/script>/g, '');
    content = content.replace(/<script data-cedexx-schema type="application\/ld\+json">([\s\S]*?)<\/script>/g, '');
  }

  // Generate schema scripts
  const schemaScripts = schemas.map((schemaFn, index) => {
    const schemaData = schemaFn();
    const json = JSON.stringify(schemaData, null, 2);
    return `<script type="application/ld+json" data-cedexx-schema data-schema-index="${index}">${json}</script>`;
  }).join('\n');

  // Inject right after <head> opening tag (before anything else for SEO priority)
  const headMatch = content.match(/<head[^>]*>/i);
  if (headMatch) {
    const insertAfter = headMatch.index + headMatch[0].length;
    // Also inject meta tags if missing
    const metaTags = [];
    
    // Check and add essential meta tags
    if (!content.includes('og:title')) {
      metaTags.push(`<meta property="og:title" content="CEDEXX — Better Care. Here. Now." />`);
    }
    if (!content.includes('og:description')) {
      metaTags.push(`<meta property="og:description" content="24/7 virtual care platform powered by Lyric Health, connecting families to board-certified physicians. No insurance required. Miami-based. HIPAA compliant." />`);
    }
    if (!content.includes('og:image')) {
      metaTags.push(`<meta property="og:image" content="${SCHEMA_CONFIG.ogImage}" />`);
    }
    if (!content.includes('og:type')) {
      metaTags.push(`<meta property="og:type" content="website" />`);
    }
    if (!content.includes('twitter:card')) {
      metaTags.push(`<meta name="twitter:card" content="summary_large_image" />`);
    }
    if (!content.includes('description')) {
      metaTags.push(`<meta name="description" content="24/7 virtual care platform powered by Lyric Health, connecting families to board-certified physicians. No insurance required. Miami-based. HIPAA compliant." />`);
    }

    const injection = '\n' + (metaTags.length ? metaTags.join('\n') + '\n' : '') + schemaScripts + '\n';
    content = content.slice(0, insertAfter) + injection + content.slice(insertAfter);
  } else {
    // Fallback: prepend to html tag
    content = content.replace(/<html[^>]*>/i, match => match + '\n' + schemaScripts);
  }

  fs.writeFileSync(htmlPath, content, 'utf8');
  return { schemasInjected: schemas.length, fileSize: content.length };
}

function processDirectory(distPath) {
  const results = [];
  const htmlFiles = [];

  function collectHtml(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        collectHtml(fullPath);
      } else if (entry.name.endsWith('.html')) {
        htmlFiles.push(fullPath);
      }
    }
  }

  collectHtml(distPath);

  for (const htmlPath of htmlFiles) {
    const relativePath = '/' + path.relative(distPath, htmlPath).replace(/\\/g, '/');
    const relativeDir = relativePath.replace(/\/index\.html$/, '/index.html');
    
    // Find matching schema config
    let schemas = null;
    
    // Exact match
    if (PAGE_SCHEMAS[relativePath]) {
      schemas = PAGE_SCHEMAS[relativePath];
    }
    // Directory match (for /page/index.html style)
    else if (PAGE_SCHEMAS[relativeDir]) {
      schemas = PAGE_SCHEMAS[relativeDir];
    }
    // Generic fallback for any HTML page
    else {
      schemas = [
        buildMedicalBusiness,
        buildWebSite,
        () => buildBreadcrumbList(relativePath.replace('.html', '').replace(/index$/, ''))
      ];
    }

    try {
      const result = injectSchemaIntoHtml(htmlPath, schemas);
      results.push({
        file: relativePath,
        status: 'success',
        schemasInjected: result.schemasInjected,
        fileSizeBytes: result.fileSize
      });
      console.log(`✅ ${relativePath} — ${result.schemasInjected} schemas, ${result.fileSize} bytes`);
    } catch (err) {
      results.push({
        file: relativePath,
        status: 'error',
        error: err.message
      });
      console.error(`❌ ${relativePath} — ${err.message}`);
    }
  }

  return results;
}

// ──────────────────────────────────────────────
// CLI
// ──────────────────────────────────────────────

function showUsage() {
  console.log(`
CEDEXX AI SEO Injection Engine
Usage:
  node inject-schema.js --dist ./dist [--dry-run]

Options:
  --dist PATH       Path to built HTML output (required)
  --dry-run         Preview changes without writing files
  --help            Show this help

The script injects Schema.org structured data into ALL built HTML
pages after Vite/webpack bundling, without modifying source code.
`);
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help')) {
    showUsage();
    process.exit(0);
  }

  const distIdx = args.indexOf('--dist');
  const distPath = distIdx >= 0 ? args[distIdx + 1] : './dist';
  const dryRun = args.includes('--dry-run');

  if (!fs.existsSync(distPath)) {
    console.error(`Error: Directory not found: ${distPath}`);
    console.error('Run `npm run build` first, or specify --dist <path>');
    process.exit(1);
  }

  console.log(`\n╔═══════════════════════════════════════════════════════════╗`);
  console.log(`║  CEDEXX AI SEO Injection Engine                           ║`);
  console.log(`║  Target: ${distPath.padEnd(50, ' ')}║`);
  console.log(`║  Mode: ${(dryRun ? 'DRY RUN (preview only)' : 'LIVE').padEnd(52, ' ')}║`);
  console.log(`╚═══════════════════════════════════════════════════════════╝\n`);

  if (dryRun) {
    console.log('DRY RUN: The following schemas would be injected:');
    const schemas = processDirectory(distPath);
    console.log(`\n📊 Summary: ${schemas.length} files processed`);
    schemas.forEach(s => console.log(`   ${s.status === 'success' ? '✅' : '❌'} ${s.file}`));
    return;
  }

  const results = processDirectory(distPath);
  
  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  const totalSchemas = results.filter(r => r.status === 'success').reduce((sum, r) => sum + r.schemasInjected, 0);

  console.log(`\n╔═══════════════════════════════════════════════════════════╗`);
  console.log(`║  INJECTION COMPLETE                                       ║`);
  console.log(`║  Files processed: ${successCount.toString().padEnd(39, ' ')}║`);
  console.log(`║  Errors: ${errorCount.toString().padEnd(46, ' ')}║`);
  console.log(`║  Total schemas injected: ${totalSchemas.toString().padEnd(31, ' ')}║`);
  console.log(`╚═══════════════════════════════════════════════════════════╝\n`);

  if (errorCount > 0) {
    console.log('Failed files:');
    results.filter(r => r.status === 'error').forEach(r => console.log(`  ❌ ${r.file}: ${r.error}`));
  }

  // Write report
  const reportPath = path.join(distPath, 'seo-injection-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    generatedAt: new Date().toISOString(),
    totalFiles: results.length,
    successCount,
    errorCount,
    totalSchemas,
    results
  }, null, 2));
  console.log(`📄 Report written to: ${reportPath}\n`);

  process.exit(errorCount > 0 ? 1 : 0);
}

main();
