#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════
 * CEDEXX Build Integration Script
 * ═══════════════════════════════════════════════════════════
 * 
 * Run this after `npm run build` (Vite) to inject SEO schema markup
 * into all built HTML files. Also copies the agentic engine into dist.
 * 
 * Usage:
 *   node scripts/post-build.js
 *   
 * Or add to package.json:
 *   "build": "tsc && vite build && node scripts/post-build.js"
 * ═══════════════════════════════════════════════════════════
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const SEO_SCRIPT = path.join(ROOT, 'seo', 'inject-schema.js');

console.log('\n╔═══════════════════════════════════════════════════════════╗');
console.log('║  CEDEXX Post-Build Integration                            ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

// 1. Verify dist exists
if (!fs.existsSync(DIST)) {
  console.error('❌ dist/ directory not found. Run `npm run build` first.');
  process.exit(1);
}

// 2. Run SEO injection
console.log('🔍 Injecting Schema.org structured data...');
try {
  execSync(`node "${SEO_SCRIPT}" --dist "${DIST}"`, { stdio: 'inherit' });
} catch (err) {
  console.error('⚠️  SEO injection failed, but build continues');
}

// 3. Copy agentic engine to dist (if using static hosting)
const AGENTIC_V2 = path.join(ROOT, 'seo', 'agentic-engine-v2.js');
const AGENTIC_LEGACY = path.join(ROOT, 'public', 'agentic-engine.js');
const AGENTIC_DEST = path.join(DIST, 'agentic-engine.js');

if (fs.existsSync(AGENTIC_V2)) {
  fs.copyFileSync(AGENTIC_V2, AGENTIC_DEST);
  console.log('✅ Copied agentic-engine-v2.js → dist/agentic-engine.js');
} else if (fs.existsSync(AGENTIC_LEGACY)) {
  fs.copyFileSync(AGENTIC_LEGACY, AGENTIC_DEST);
  console.log('✅ Copied legacy agentic-engine.js → dist/agentic-engine.js');
}

// 4. Copy agentic-config.js if it exists
const CONFIG_SRC = path.join(ROOT, 'public', 'agentic-config.js');
const CONFIG_DEST = path.join(DIST, 'agentic-config.js');
if (fs.existsSync(CONFIG_SRC)) {
  fs.copyFileSync(CONFIG_SRC, CONFIG_DEST);
  console.log('✅ Copied agentic-config.js → dist/agentic-config.js');
}

// 5. Verify key pages have schema
const indexHtml = path.join(DIST, 'index.html');
if (fs.existsSync(indexHtml)) {
  const content = fs.readFileSync(indexHtml, 'utf8');
  const hasSchema = content.includes('"@context":"https://schema.org"') || 
                    content.includes('"@context": "https://schema.org"');
  const hasMedical = content.includes('MedicalBusiness') || content.includes('MedicalWebPage');
  
  console.log('\n📊 SEO Verification:');
  console.log(`   Schema.org present: ${hasSchema ? '✅' : '❌'}`);
  console.log(`   MedicalBusiness:    ${hasMedical ? '✅' : '❌'}`);
  
  if (!hasSchema) {
    console.warn('\n⚠️  WARNING: index.html missing Schema.org markup. Check SEO injection.');
  }
}

console.log('\n✨ Post-build complete!\n');
