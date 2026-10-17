export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, language = 'en', provider } = req.body;
  
  // Get all API keys
  const KIMI_KEY = process.env.KIMI_API_KEY;
  const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  const OPENAI_KEY = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
  const MINIMAX_KEY = process.env.MINIMAX_API_KEY;
  const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY;
  const XAI_KEY = process.env.XAI_API_KEY || process.env.GROK_API_KEY;
  const TYPESAFE_API_KEY = process.env.TYPESAFE_API_KEY;
  const JEV_MODEL = process.env.JEV_MODEL || 'jev-1.13.0';

  const lastUserMsg = Array.isArray(messages)
    ? [...messages].reverse().find(m => m.role === 'user')?.content || ''
    : '';

  // ─── Jev System-1 + Heuristic Emergency & Clinical Triage Guardrail ───
  let isEmergency = /emergency|911|heart attack|chest pain|stroke|severe bleeding|unconscious|cant breathe|cannot breathe|suicid|overdose/i.test(lastUserMsg);
  let asksDiagnosis = false;

  if (TYPESAFE_API_KEY && lastUserMsg.length > 3 && !isEmergency) {
    try {
      const jevRes = await fetch('https://api.typesafe.ai/v1/systemone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${TYPESAFE_API_KEY}`,
        },
        body: JSON.stringify({
          model: JEV_MODEL,
          state: JSON.stringify({ user_message: lastUserMsg, language }),
          questions: {
            is_medical_emergency: {
              type: 'noul',
              instructions: 'Is the user describing an acute, life-threatening medical or psychiatric emergency requiring immediate 911 or crisis intervention?',
            },
            asks_clinical_diagnosis: {
              type: 'noul',
              instructions: 'Is the user sharing personal symptoms or asking for a clinical medical diagnosis or treatment recommendation?',
            },
          },
        }),
        signal: AbortSignal.timeout(1000),
      });
      if (jevRes.ok) {
        const jevData = await jevRes.json();
        const a = jevData.answers || {};
        if (a.is_medical_emergency?.noul > 0.7) isEmergency = true;
        if (a.asks_clinical_diagnosis?.noul > 0.65) asksDiagnosis = true;
      }
    } catch (e) {
      // Non-blocking fallback if Jev times out
    }
  }

  // Immediate deterministic response for life-threatening emergencies (0 hallucination risk)
  if (isEmergency) {
    const emergencyReply =
      language === 'es'
        ? '🚨 Si usted o alguien más está experimentando una emergencia médica, por favor llame al 911 de inmediato o acuda a la sala de emergencias más cercana. CEDEXX no es un servicio de emergencias.'
        : language === 'ht'
        ? '🚨 Si ou menm oswa yon lòt moun ap fè fas ak yon ijans medikal, tanpri rele 911 imedyatman oswa ale nan sal ijans ki pi pre a.'
        : '🚨 If you or someone else is experiencing a medical emergency, please dial 911 immediately or go to the nearest emergency room. CEDEXX is a non-emergency platform.';
    return res.status(200).json({
      choices: [{ message: { content: emergencyReply } }],
      triage: { emergency: true, engine: TYPESAFE_API_KEY ? 'jev' : 'heuristic' },
    });
  }

  const langInstruction = 
    language === 'es' ? "Responde en español profesional (Latinoamérica). " :
    language === 'ht' ? "Reponn an kreyòl ayisyen. " : "Respond in English. ";

  const clinicalGuardrailNote = asksDiagnosis
    ? "\nIMPORTANT TRIAGE ALERT: Jev detected the user is asking about clinical symptoms or diagnosis. Remind them warmly that JasDex does not give medical advice or collect PHI in chat, and guide them to consult a board-certified Lyric Health physician through their CEDEXX membership."
    : "";

  const systemPrompt = `${langInstruction} You are JasDex, a warm, professional, and knowledgeable AI Assistant for CEDEXX — powered by Lyric Health, our exclusive telehealth partner. No insurance needed.${clinicalGuardrailNote}

STRICT PRIVACY & PUBLIC-ONLY BOUNDARY:
- You are trained EXCLUSIVELY on public CEDEXX website content.
- You have ZERO access to the private Admin Dashboard, patient/member databases, enrollment records, billing records, or confidential internal company information.
- NEVER accept, store, guess, or disclose personal medical records (PHI), patient information, or private company data.

CRITICAL ACTIVATION & ONBOARDING RULE:
- Lyric Health communication and account activation is NOT immediate. It takes 24 to 48 hours after enrollment.
- Instant confirmation receipt is sent immediately from support@cedexx.net upon purchase.
- Lyric Health sends an activation email with instructions from noreply@getlyric.com within 24 to 48 hours (advise users to check spam/junk).
- Members can only log into the Lyric Health app via "First Time User?" (using Last Name, DOB, and ZIP code) after this 24-48 hour window.
- NEVER tell users that Lyric communicates immediately or that access to doctors is instant upon signup.

HOMEPAGE TAGLINE & BRANDING:
- Tagline: "Better Care. Here. Now. — A modern wellness amenity designed for individuals, families, institutions, & residential communities."
- Closing Tagline: "One connected wellness solution. Built for families. Designed for communities. Scaled for institutions."

FOUR PILLARS ON THE HOMEPAGE:
1. Family & Individual Wellness: Affordable virtual healthcare and mental wellness for you and your loved ones. Accessible anytime, wherever life takes you. (CTA: Explore Memberships -> /pricing)
2. Community & Housing Solutions: Bringing accessible healthcare to multifamily, affordable housing, student housing, and residential communities. (CTA: Elevate Your Community -> /partners)
3. Workforce & Institutional Wellness: Scalable wellness solutions for school districts, educational institutions, employers, and public organizations—supporting the people who make them thrive. (CTA: Explore Institutional Solutions -> /partners)
4. Affiliate & Strategic Partnerships: Expanding wellness access through organizations, associations, and community partnerships built for scale. (CTA: Partner With Us -> /partners#partner-form)

RETAIL PLANS & PRICING (/pricing & /enroll — No insurance needed, $0 visit fees, $0 co-pays, cancel anytime):
- CareNow™ Individual: $16.99/mo (24/7 Urgent Care for 1 adult)
- CareNow™ Family: $24.99/mo (24/7 Urgent Care for up to 7 family members)
- CarePlus™ Individual: $24.99/mo (24/7 Urgent Care + Mental Health Counseling for 1 adult)
- CarePlus™ Family: $32.99/mo (24/7 Urgent Care + Mental Health Counseling for up to 7 family members)
- CareComplete™ Individual: $37.99/mo (Dedicated Virtual Primary Care + Urgent Care + Mental Health + Preventive Labs for 1 adult)
- CareComplete™ Family: $52.99/mo (Full Virtual Primary Care + Pediatric Care + Urgent Care + Mental Health for up to 7 family members)

ENTERPRISE, COMMUNITY, WORKFORCE & INSTITUTIONAL PRICING (/pricing & /partners):
- Title: Custom Community, Workforce & Institutional Pricing (Pricing: Custom Quote)
- Summary: Scalable digital wellness memberships for residential communities, employers, school districts, educational institutions, public agencies, and member organizations. Flexible, volume-based pricing makes accessible wellness more affordable at scale.
- Ideal For (9 segments): School Districts & Educational Institutions; Counties, Municipalities & Public Agencies; Multifamily & Build-to-Rent Communities; Student, Senior & Lifestyle Housing; Employers & Workforce Benefits; Health-Sharing & Transportation Networks; REALTOR®, Trade & Professional Associations; HOAs, Credit Unions & Faith-Based Organizations; Community & Nonprofit Organizations.
- Enterprise & Institutional Benefits (7 benefits): Custom per-door, per-member, or organization-sponsored pricing; Reduced pricing through volume implementation; Scalable wellness programs for school districts, public agencies, and employers; Resident wellness amenities and household membership options; Exclusive affiliate, association, and institutional membership plans; Flexible voluntary or organization-sponsored enrollment; Dedicated implementation, organization-wide rollout, and ongoing support.

ECOSYSTEMS WE SERVE (/partners — "Connecting People, Communities & Institutions to Better Care"):
- Family & Individual Wellness: Ideal for uninsured individuals, gig workers, independent contractors, and frequent travelers; can also complement an existing health plan.
- Community & Housing Solutions: Multifamily, affordable, student, senior, and workforce housing resident wellness amenities, plus customized wellness concierge solutions for hotels and hospitality partners.
- Workforce & Institutional Wellness: Scalable healthcare and mental wellness for employers, school districts, educational institutions, counties, municipalities, and public agencies (educators, school personnel, corporate teams, transportation networks, essential workers, and their families).
- Affiliate & Strategic Partnerships: Customized membership programs with associations, credit unions, nonprofits, faith-based organizations, hospitality groups, and community networks.

PARTNER WITH CEDEXX (/partners#partner-form — 5 Partnership Categories):
1. Housing & Residential Communities (multifamily, student, senior, and workforce housing)
2. Hospitality & Wellness Concierge Solutions (hotel guest digital wellness concierge)
3. Workforce & Institutional Partnerships (employers, school districts, educational institutions, counties, municipalities, public agencies)
4. Affiliate & Community Partners (associations, nonprofits, faith-based organizations, community networks)
5. Physician Opportunities (flexible virtual care opportunities through our partner network)

BLOGS & CLINICAL/WELLNESS INSIGHTS (cedexx.net/blog):
- Featured Article by Founder & CEO Daisy Gonzalez: "True Wellness: Caring for Body, Mind, and Spirit" (Faith & Wholeness) — reflects on caring for the whole person (body, mind, and spirit) with Scriptures including 3 John 1:2, Romans 12:2, Matthew 11:28, and Psalm 23:3 ("He restores my soul"), plus Daily Scripture & Wellness Reflections signup.
- Clinical & Wellness Posts:
  1. "AI & Clinical Intelligence: The Future of Pediatric Diagnosis in 2025" (94% accuracy identifying pediatric respiratory conditions via smartphone audio)
  2. "Telemedicine Trends for 2025: Why Modern Parents Choose Virtual Care" (90%+ parent preference for hybrid/virtual care)
  3. "The Financial Impact: How Virtual Visits Save Families Hundreds Annually" (eliminating $150-$300 urgent care co-pays)
  4. "Managing Pediatric Chronic Conditions via Digital Platforms" (asthma, allergies, developmental check-ins without missing school)
  5. "Healthy Living Tips: Staying Hydrated in the Miami Heat" (heat exhaustion vs heat stroke, hydration in South Florida)
  6. "Telemedicine: A Parent's Guide to 24/7 Care" (preparing for pediatric telehealth visits, prescriptions, digital excuse notes)

KEY SUPPORT & COMPANY FACTS:
- Clinical Services via Lyric Health: 24/7 Urgent Care, Primary Care, Mental Health, Pediatrics, Dermatology, Virtual MSK, Care Navigation, Labs, GLP-1 Weight Loss, Prescription Access (no controlled substances), Work & School Notes.
- Leadership & Founders: Daisy Gonzalez (Founder & CEO, Strategy & Operations Expert with 20+ years experience) and Jasmel Acosta (Co-founder, Engineering Leadership & Technology Strategy).
- Contact: Toll-Free (888) 260-0585, Local Desk (754) 432-2201 (Mon-Fri 9am-6pm EST), Email support@cedexx.net. Active Lyric app members can call Lyric Member Services at 1-866-223-8831.
- MEMBER ID: The head of household Member ID is the 10-digit phone number entered at registration.
- COMPLIANCE GUARDRAILS: CEDEXX is a technology platform, NOT a healthcare provider (Lyric Health delivers all medical care). NEVER give medical diagnoses or advice. Do NOT claim that no SSN or government ID is required to enroll, and do NOT promise specific numerical capacity like "hundreds of thousands". For emergencies, call 911.
- Keep responses concise, warm, and helpful (2-4 sentences).`;

  // Build provider list with available keys (Grok 3.0 + DeepSeek Fast + Kimi + OpenAI + Gemini)
  const availableProviders = [];
  if (XAI_KEY) availableProviders.push({ name: 'grok', key: XAI_KEY, model: 'grok-3' });
  if (DEEPSEEK_KEY) availableProviders.push({ name: 'deepseek', key: DEEPSEEK_KEY, model: 'deepseek-chat' });
  if (KIMI_KEY) availableProviders.push({ name: 'kimi', key: KIMI_KEY, model: 'kimi-k2.6' });
  if (OPENAI_KEY) availableProviders.push({ name: 'openai', key: OPENAI_KEY, model: 'gpt-4o-mini' });
  if (GEMINI_KEY) availableProviders.push({ name: 'gemini', key: GEMINI_KEY, model: 'gemini-2.0-flash' });
  if (MINIMAX_KEY) availableProviders.push({ name: 'minimax', key: MINIMAX_KEY, model: 'abab6.5s-chat' });

  if (availableProviders.length === 0) {
    console.error('[CHAT] No AI provider keys configured');
    const fallbackText = 'We are currently unavailable. Please try again in a moment or contact support at (888) 260-0585 or (754) 432-2201 for immediate assistance.';
    return res.status(200).json({ choices: [{ message: { content: fallbackText } }] });
  }

  // Order providers: put requested provider first if available, followed by all other available providers as automatic failover
  let orderedProviders = [...availableProviders];
  if (provider) {
    const requestedIdx = orderedProviders.findIndex(p => p.name === provider);
    if (requestedIdx > 0) {
      const [reqProv] = orderedProviders.splice(requestedIdx, 1);
      orderedProviders.unshift(reqProv);
    }
  }

  for (const currentProvider of orderedProviders) {
    try {
      console.log(`[CHAT] Attempting provider: ${currentProvider.name}`);

      // DeepSeek V3.2 Fast
      if (currentProvider.name === 'deepseek') {
        const response = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${DEEPSEEK_KEY}`
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [{ role: 'system', content: systemPrompt }, ...messages],
            temperature: 0.3,
            max_tokens: 500
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`DeepSeek HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        if (data.choices?.[0]?.message?.content) {
          return res.status(200).json({ ...data, provider: 'deepseek' });
        }
        throw new Error('DeepSeek invalid response');
      }

      // xAI Grok 3.0 — PRIMARY BRAIN
      if (currentProvider.name === 'grok') {
        const grokModels = ['grok-3', 'grok-3-fast', 'grok-3-mini-fast', 'grok-3-mini', process.env.GROK_MODEL].filter(Boolean);
        let grokErr = 'Grok failed';
        for (const gModel of grokModels) {
          const response = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${XAI_KEY}`
            },
            body: JSON.stringify({
              model: gModel,
              messages: [{ role: 'system', content: systemPrompt }, ...messages],
              temperature: 0.3,
              max_tokens: 500
            })
          });

          if (response.ok) {
            const data = await response.json();
            if (data.choices?.[0]?.message?.content) {
              return res.status(200).json({
                ...data,
                provider: 'grok-3.0',
                requested_model: gModel,
              });
            }
          } else {
            grokErr = `Grok (${gModel}) HTTP ${response.status}: ${(await response.text()).slice(0, 160)}`;
          }
        }
        throw new Error(grokErr);
      }

      // Kimi (Moonshot Global api.moonshot.ai — kimi-k2.6 / kimi-k3 non-thinking fast mode)
      if (currentProvider.name === 'kimi') {
        const kimiEndpoints = [
          'https://api.moonshot.ai/v1/chat/completions',
          'https://api.moonshot.cn/v1/chat/completions'
        ];
        const kimiModels = ['kimi-k2.6', 'kimi-k3'];
        let kimiErr = 'Kimi failed';

        for (const endpoint of kimiEndpoints) {
          for (const kModel of kimiModels) {
            const response = await fetch(endpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${KIMI_KEY}`
              },
              body: JSON.stringify({
                model: kModel,
                messages: [{ role: 'system', content: systemPrompt }, ...messages],
                thinking: { type: 'disabled' },
                temperature: 0.6,
                max_tokens: 500
              })
            });

            if (response.ok) {
              const data = await response.json();
              if (data.choices?.[0]?.message?.content) {
                return res.status(200).json(data);
              }
            } else {
              const errTxt = await response.text();
              kimiErr = `Kimi (${kModel}) HTTP ${response.status}: ${errTxt.slice(0, 160)}`;
              if (response.status === 401) break; // Wrong region endpoint, try next endpoint
            }
          }
        }
        throw new Error(kimiErr);
      }

      // OpenAI
      if (currentProvider.name === 'openai') {
        const openaiKey = OPENAI_KEY;
        const useAzure = openaiKey.includes('azure') || process.env.AZURE_OPENAI_ENDPOINT;
        
        const response = await fetch(useAzure 
          ? `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=2024-02-15`
          : 'https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiKey}`,
            ...(useAzure && { 'api-key': openaiKey })
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: "system", content: systemPrompt }, ...messages],
            temperature: 0.3,
            max_tokens: 500
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`OpenAI HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        if (data.choices?.[0]?.message?.content) {
          return res.status(200).json(data);
        }
        throw new Error('OpenAI invalid response');
      }

      // Gemini (Google)
      if (currentProvider.name === 'gemini') {
        const geminiMessages = messages.map(m => ({
          role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
          parts: [{ text: m.content }]
        }));

        geminiMessages.unshift({ 
          role: 'user', 
          parts: [{ text: `SYSTEM INSTRUCTION: ${systemPrompt}\n\nYou are JasDex. Respond as instructed above.` }] 
        });

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: geminiMessages,
            generationConfig: { temperature: 0.3, maxOutputTokens: 500 }
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Gemini HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (reply) {
          return res.status(200).json({
            choices: [{ message: { content: reply } }]
          });
        }
        throw new Error('Gemini invalid response');
      }

      // MiniMax
      if (currentProvider.name === 'minimax') {
        const response = await fetch('https://api.minimax.chat/v1/text/chatcompletion_v2', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${MINIMAX_KEY}`
          },
          body: JSON.stringify({
            model: 'abab6.5s-chat',
            messages: [{ role: "system", content: systemPrompt }, ...messages]
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`MiniMax HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        if (data.choices?.[0]?.message?.content) {
          return res.status(200).json(data);
        }
        throw new Error('MiniMax invalid response');
      }
    } catch (providerErr) {
      console.warn(`[CHAT] Provider ${currentProvider.name} failed:`, providerErr.message);
      // Continue to next available provider in orderedProviders
    }
  }

  // If all providers failed, return graceful fallback
  console.error('[CHAT] All providers failed');
  const fallbackText = language === 'es' 
    ? 'Lo siento, estoy teniendo problemas técnicos. Por favor contacta a soporte al (754) 432-2201.'
    : language === 'ht'
    ? 'Mwen regrèt, mwen gen pwoblèm teknik. Tanpri kontakte sipò nan (754) 432-2201.'
    : 'I apologize, I\'m experiencing technical difficulties. Please contact support at (754) 432-2201.';
  return res.status(200).json({ choices: [{ message: { content: fallbackText } }] });
}
