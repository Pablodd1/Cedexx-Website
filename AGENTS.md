# AGENTS.md — CEDEXX Repository Rules

**All agents operating in this repository MUST apply and follow both core skill sets on every task, without exception.**

---

## 1. GitHub Open Code Review & Verification

Every commit MUST pass the following gates:

### Pre-Commit Diff Check
- Review the full diff before committing — no blind `git add -A`
- Verify every changed file is intentional and necessary
- No debug code, no commented-out blocks, no `console.log` left in production paths

### Zero Secret Exposure
- NEVER commit API keys, tokens, passwords, or environment files (`.env*`)
- Scan diffs for patterns: `apikey_`, `sk-`, `ghp_`, `xkeysib-`, `Bearer `
- Use environment variables or GitHub Secrets exclusively

### Security Audits
- Validate all user input at trust boundaries (API endpoints, forms, webhooks)
- Sanitize output to prevent XSS in email templates and HTML responses
- Maintain HIPAA awareness for any health-related data fields

### Build Gates
- `npm run build` MUST complete with 0 errors before push
- No TypeScript errors, no unresolved imports, no missing dependencies

### Clean Commits
- One logical change per commit
- Descriptive commit messages following conventional commits (`feat:`, `fix:`, `chore:`, etc.)
- No WIP commits on `main`/`master`

### Code Review Standards
- Apply `code-review` skill: check for logic errors, edge cases, and anti-patterns
- Apply `autofix` skill: auto-correct lint issues, formatting, and common bugs before review
- Every PR requires self-review of the full diff before requesting human review

---

## 2. Modern Web Quality & React Best Practices

All frontend work MUST comply with:

### Waterfall Elimination
- No render-blocking resources in `<head>` — defer non-critical CSS/JS
- Inline critical CSS for above-the-fold content
- Use `font-display: swap` for web fonts
- Preload key assets (hero images, LCP elements)

### Bundle Optimization
- Tree-shake unused imports — no full-library imports (`import _ from 'lodash'`)
- Code-split routes with dynamic `import()` for non-critical pages
- Keep initial JS bundle under 200KB gzipped
- Use `size-limit` or equivalent on CI to enforce bundle budgets

### Technical SEO
- Canonical URLs with trailing slashes on all pages
- Valid `sitemap.xml` updated on content changes
- Valid `robots.txt` referencing the sitemap
- Structured data (JSON-LD) on all key pages
- Unique `<title>` and `<meta description>` per page
- Open Graph and Twitter Card meta tags on shareable pages

### WCAG 2.2 Accessibility
- All interactive elements keyboard-navigable
- Focus indicators visible on all focusable elements
- Color contrast ratio ≥ 4.5:1 for normal text, ≥ 3:1 for large text
- Alt text on all informative images (empty alt on decorative)
- Form inputs with associated `<label>` elements
- `aria-label` on icon-only buttons
- No `tabindex > 0` — natural tab order only

### Core Web Vitals Targets
| Metric | Threshold |
|--------|-----------|
| LCP (Largest Contentful Paint) | ≤ 2.5s |
| INP (Interaction to Next Paint) | ≤ 200ms |
| CLS (Cumulative Layout Shift) | ≤ 0.1 |
| TTFB (Time to First Byte) | ≤ 600ms |

### Performance Budget
- Total page weight ≤ 1.5MB on mobile
- Third-party scripts ≤ 3, each with `async` or `defer`
- Images: WebP/AVIF with responsive `srcset`
- No layout shifts from late-loading content — reserve space

---

## 3. Growth, LinkedIn Content Engineering, B2B Lead Gen & OpenSEO Skills

All marketing, social media, LinkedIn, SEO, and B2B outreach tasks in this repository MUST leverage the installed `.agents/skills/` suite:

### LinkedIn Content Engineering Suite (`sergebulaev/linkedin-skills` + `.agents/references/voice-profile.md`)
- **`linkedin-post-writer` & `linkedin-repurposer`:** Draft and repurpose blogs, videos, and mission updates into native 900–1,300 character LinkedIn posts using number-first hooks (never open with a question; place external links in `firstComment`, 0–2 hashtags at the end).
- **`linkedin-humanizer`:** Run the 4-pass forensic + strict humanizer scrub on all social captions, blog posts, and emails to eliminate AI vocabulary density, staccato fragments, and reveal bridges ("The result?", "It's not X, it's Y").
- **`linkedin-comment-drafter`, `linkedin-reply-handler`, `linkedin-hook-extractor`, `linkedin-content-planner`, `linkedin-profile-optimizer`, `linkedin-employee-advocacy`, `linkedin-engager-analytics`, `linkedin-interviewer`, `linkedin-thread-monitor`:** Use for founder authority, engagement cadence, and inbound B2B pipeline generation.

### B2B Local Lead Discovery, Agency Growth & OpenSEO (`gosom/google-maps-scraper`, `msitarzewski/agency-agents`, `every-app/open-seo`)
- **`b2b-local-lead-scraper`:** Build targeted local prospect lists (Multifamily Property Managers, Student Housing, School Districts, Restaurants/Employers) formatted for `api/b2b-campaign.ts`.
- **`agency-growth-specialists`:** Apply B2B Healthcare Outbound, Motion-Comic Social Creative Director, and Lyric Health Compliance Auditor workflows.
- **`open-seo-keyword-strategy`:** Map every blog post and landing page to high-intent telehealth, student mental wellness, and multifamily wellness amenity keywords.

---

## Verification Checklist (run before every push)

- [ ] `npm run build` passes with 0 errors, 0 warnings
- [ ] No secrets in diff
- [ ] No new dependencies without justification
- [ ] Core Web Vitals not regressed
- [ ] SEO meta tags present and unique
- [ ] Accessibility: keyboard navigation + screen reader labels verified
- [ ] Jev audit passes: `node scripts/jev-audit.mjs` → 0 errors

**Violations of these rules block the commit. No exceptions.**
