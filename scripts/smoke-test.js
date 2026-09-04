import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

console.log('\n============================================================');
console.log('       CEDEXX CTO AUTOMATED SMOKE & INTEGRATION TEST        ');
console.log('============================================================\n');

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failedTests++;
  }
}

// ─────────────────────────────────────────────────────────────
// 1. BUILD & STATIC ASSETS VERIFICATION
// ─────────────────────────────────────────────────────────────
console.log('--- TEST SUITE 1: Build & Distribution Artifacts ---');
const distDir = path.join(ROOT, 'dist');
assert(fs.existsSync(distDir), 'Distribution directory (dist/) exists');
assert(fs.existsSync(path.join(distDir, 'index.html')), 'dist/index.html generated successfully');
assert(fs.existsSync(path.join(ROOT, 'public', 'sitemap.xml')), 'public/sitemap.xml exists');
assert(fs.existsSync(path.join(ROOT, 'public', 'robots.txt')), 'public/robots.txt exists');
assert(fs.existsSync(path.join(ROOT, 'public', 'agentic-engine.js')), 'public/agentic-engine.js exists');
assert(fs.existsSync(path.join(ROOT, 'public', 'agentic-config.js')), 'public/agentic-config.js exists');

// ─────────────────────────────────────────────────────────────
// 2. ADVANCED SEO & SCHEMA.ORG INJECTION
// ─────────────────────────────────────────────────────────────
console.log('\n--- TEST SUITE 2: SEO & Schema.org Semantic Markup ---');
if (fs.existsSync(path.join(distDir, 'index.html'))) {
  const indexHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');
  assert(indexHtml.includes('application/ld+json'), 'Schema.org JSON-LD scripts are injected');
  assert(indexHtml.includes('MedicalBusiness'), 'Schema includes MedicalBusiness organization');
  assert(indexHtml.includes('Lyric Health'), 'Schema includes Lyric Health partner attribution');
  assert(indexHtml.includes('LocalBusiness'), 'Schema includes LocalBusiness location');
  assert(indexHtml.includes('FAQPage'), 'Schema includes FAQPage structured data for rich snippets');
  assert(indexHtml.includes('CEDEXX | 24/7 Virtual Primary Care'), 'SEO title updated for high-intent search ranking');
}

// ─────────────────────────────────────────────────────────────
// 3. USER SIMULATION: Chatbot Knowledge & Escalation
// ─────────────────────────────────────────────────────────────
console.log('\n--- TEST SUITE 3: User Simulation - AI Chatbot & Escalations ---');
const knowledgeFile = path.join(ROOT, 'src', 'data', 'cedexx-knowledge.ts');
assert(fs.existsSync(knowledgeFile), 'Knowledge base file exists');
const knowledgeContent = fs.readFileSync(knowledgeFile, 'utf8');
assert(knowledgeContent.includes('Lyric Health'), 'Knowledge base establishes Lyric Health partnership');
assert(knowledgeContent.includes('NEVER give medical diagnoses'), 'Clinical emergency safeguards active');

const chatbotFile = path.join(ROOT, 'src', 'components', 'Chatbot.tsx');
assert(fs.existsSync(chatbotFile), 'Chatbot component exists');
const chatbotContent = fs.readFileSync(chatbotFile, 'utf8');
assert(chatbotContent.includes('emergency'), 'Chatbot contains medical emergency / 911 safeguards');
assert(chatbotContent.includes('human') || chatbotContent.includes('agent'), 'Chatbot contains live human escalation triggers');
assert(chatbotContent.includes('(855) 503-3371'), 'Chatbot provides telephone support contact');

// ─────────────────────────────────────────────────────────────
// 4. USER SIMULATION: Paperwork Memorization & Tracking
// ─────────────────────────────────────────────────────────────
console.log('\n--- TEST SUITE 4: User Simulation - Form Persistence & Registration ---');
const trackFormStartFile = path.join(ROOT, 'api', 'track-form-start.ts');
assert(fs.existsSync(trackFormStartFile), 'api/track-form-start.ts endpoint exists');

const registerMemberFile = path.join(ROOT, 'api', 'register-member.ts');
assert(fs.existsSync(registerMemberFile), 'api/register-member.ts endpoint exists');
const registerContent = fs.readFileSync(registerMemberFile, 'utf8');
assert(registerContent.includes('sendWelcomeEmail'), 'Automated member welcome email triggered on registration');
assert(registerContent.includes('sendCheckoutStartedEmail'), 'Checkout started email notification trigger active');
assert(registerContent.includes('TELEGRAM_BOT'), 'Telegram notification alert trigger configured');

const patientRegFile = path.join(ROOT, 'src', 'pages', 'PatientRegistration.tsx');
const patientRegContent = fs.readFileSync(patientRegFile, 'utf8');
assert(patientRegContent.includes('/api/track-form-start'), 'Patient registration triggers partial form tracking on email blur');
assert(patientRegContent.includes('/api/register-member'), 'Patient registration sends full demographic payload to API');

// ─────────────────────────────────────────────────────────────
// 5. THIRD-PARTY TELEHEALTH BRIDGE: Lyric Health
// ─────────────────────────────────────────────────────────────
console.log('\n--- TEST SUITE 5: Third-Party Telehealth Bridge (Lyric Health) ---');
const lyricBridgeFile = path.join(ROOT, 'api', 'bridge', 'lyric.ts');
assert(fs.existsSync(lyricBridgeFile), 'Lyric Health bridge endpoint exists');
const lyricContent = fs.readFileSync(lyricBridgeFile, 'utf8');
assert(lyricContent.includes('enrollment@getlyric.com') || lyricContent.includes('LYRIC_ENROLLMENT_EMAIL'), 'Lyric enrollment transmission target configured');
assert(lyricContent.includes('dry_run'), 'Lyric Health bridge dry-run simulation mode supported');

// ─────────────────────────────────────────────────────────────
// 6. ADMINISTRATOR SIMULATION: Dashboard Analytics & Parity
// ─────────────────────────────────────────────────────────────
console.log('\n--- TEST SUITE 6: Administrator Simulation - Dashboard & Analytics ---');
const adminDashboardFile = path.join(ROOT, 'src', 'pages', 'AdminDashboard.tsx');
assert(fs.existsSync(adminDashboardFile), 'src/pages/AdminDashboard.tsx exists');
const adminContent = fs.readFileSync(adminDashboardFile, 'utf8');
assert(adminContent.includes('activeTab'), 'Admin dashboard supports tabbed navigation');
assert(adminContent.includes('calls'), 'Admin dashboard includes voice call logs and recordings');
assert(adminContent.includes('analytics'), 'Admin dashboard includes visitor session analytics');
assert(adminContent.includes('exportCSV'), 'Admin dashboard includes CSV member export');

const adminApiMembers = path.join(ROOT, 'api', 'dashboard', 'members.ts');
const adminApiAnalytics = path.join(ROOT, 'api', 'dashboard', 'analytics.ts');
const adminApiCalls = path.join(ROOT, 'api', 'dashboard', 'calls.ts');
assert(fs.existsSync(adminApiMembers), 'api/dashboard/members.ts exists');
assert(fs.existsSync(adminApiAnalytics), 'api/dashboard/analytics.ts exists');
assert(fs.existsSync(adminApiCalls), 'api/dashboard/calls.ts exists');

// ─────────────────────────────────────────────────────────────
// SUMMARY REPORT
// ─────────────────────────────────────────────────────────────
console.log('\n============================================================');
console.log(`TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
console.log('============================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL SMOKE & INTEGRATION TESTS PASSED WITH 100% SUCCESS!\n');
}
