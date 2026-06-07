// CEDEXX AI Chatbot Widget v1.0
// Standalone widget — inject into any HTML page
// Features: Chat, Voice toggle, Booking CTA, EN/ES/RU/HT support
// Configurable: Set CEDEXX_CONFIG.apiKey before loading

(function() {
  'use strict';

  // Default config (Gemini API - free tier)
  const DEFAULT_CONFIG = {
    apiKey: '',
    apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
    model: 'gemini-1.5-flash',
    siteName: 'CEDEXX',
    primaryColor: '#00D4FF',
    secondaryColor: '#FF6B6B',
    position: 'bottom-right',
    welcomeMessage: {
      en: "Hi! I'm CEDEXX's AI Health Assistant. I can help with virtual care info, health blog questions, or connecting you with a Lyric Health provider. How can I help?",
      es: "¡Hola! Soy el Asistente de Salud AI de CEDEXX. Puedo ayudar con información de atención virtual, preguntas sobre nuestro blog de salud, o conectarte con un proveedor de Lyric Health. ¿Cómo puedo ayudarte?",
      ru: "Здравствуйте! Я ИИ-помощник по здравоохранению CEDEXX. Я могу помочь с информацией о виртуальной помощи, вопросами о нашем блоге о здоровье или связать вас с провайдером Lyric Health. Чем могу помочь?",
      ht: "Bonjou! Mwen se Asistan Sante AI CEDEXX. Mwen ka ede w ak enfòmasyon sou swen vityèl, kesyon sou blog sante nou an, oswa konekte w ak yon founisè Lyric Health. Kijan mwen ka ede w?"
    },
    bookingUrl: 'https://cedexx.net/consultation',
    voiceEnabled: true,
    languages: ['en', 'es', 'ru', 'ht'],
    knowledgeBase: {
      en: `You are CEDEXX's AI Health Assistant. CEDEXX is a technology platform connecting families to Lyric Health integrated virtual care in Miami and across Florida.

Key facts:
- CEDEXX provides 24/7 virtual provider access
- No insurance required for many services
- Pediatric telemedicine specialists available
- Health blog with research-backed insights
- Services: general telemedicine, pediatric care, wellness consultations, mental health support
- Coverage: Miami-Dade, Broward, and throughout Florida
- Contact: info@cedexx.net

Always be empathetic, professional, and encourage users to consult with a real provider for medical emergencies. Never provide medical diagnosis.`,
      es: `Eres el Asistente de Salud AI de CEDEXX. CEDEXX es una plataforma tecnológica que conecta familias con la atención virtual integrada de Lyric Health en Miami y todo Florida.

Datos clave:
- CEDEXX ofrece acceso 24/7 a proveedores virtuales
- No se requiere seguro para muchos servicios
- Especialistas en telemedicina pediátrica disponibles
- Blog de salud con información basada en investigación
- Servicios: telemedicina general, cuidado pediátrico, consultas de bienestar, apoyo de salud mental
- Cobertura: Miami-Dade, Broward y todo Florida
- Contacto: info@cedexx.net

Sé empático, profesional, y anima a los usuarios a consultar con un proveedor real para emergencias médicas. Nunca proporciones diagnóstico médico.`,
      ru: `Вы — ИИ-помощник по здравоохранению CEDEXX. CEDEXX — это технологическая платформа, которая соединяет семьи с интегрированной виртуальной помощью Lyric Health в Майами и по всей Флориде.

Ключевые факты:
- CEDEXX предоставляет круглосутовой доступ к виртуальным провайдерам
- Для многих услуг страховка не требуется
- Доступны специалисты по детской телемедицине
- Блог о здоровье с информацией, подкрепленной исследованиями
- Услуги: общая телемедицина, детская медицина, консультации по вопросам здоровья, поддержка психического здоровья
- Охват: округа Майами-Дейд, Броуард и вся Флорида
- Контакт: info@cedexx.net

Всегда будьте эмпатичны и профессиональны, и призывайте пользователей обращаться к реальному врачу при медицинских чрезвычайных ситуациях. Никогда не ставьте медицинский диагноз.`,
      ht: `Ou se Asistan Sante AI CEDEXX. CEDEXX se yon platfòm teknoloji ki konekte fanmi ak swen vityèl entegre Lyric Health nan Miami ak atravè Florid.

Fè kle:
- CEDEXX ofri aksè 24/7 ak founisè vityèl
- Pa gen asirans ki obligatwa pou anpil sèvis
- Espesyalis telemedsin pediyatrik disponib
- Blog sante ak enfòmasyon ki baze sou rechèch
- Sèvis: telemedsin jeneral, swen pediyatrik, konsiltasyon byennèt, sipò sante mantal
- Kouvri: Miami-Dade, Broward, ak tout Florid
- Kontak: info@cedexx.net

Toujou montre konpasyon ak pwofesyonalis, ankouraje itilizatè pou yo konsilte ak yon vre doktè pou ijans medikal. Pa janm bay dyagnostik medikal.`
    }
  };

  const CONFIG = window.CEDEXX_CONFIG || DEFAULT_CONFIG;

  // State
  let isOpen = false;
  let isVoiceMode = false;
  let currentLang = 'en';
  let messages = [];
  let recognition = null;
  let synth = window.speechSynthesis;

  // Create styles
  const styles = document.createElement('style');
  styles.textContent = `
    .cedexx-widget-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .cedexx-toggle-btn {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: linear-gradient(135deg, ${CONFIG.primaryColor}, #0099cc);
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(0, 212, 255, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s, box-shadow 0.2s;
      color: white;
      font-size: 24px;
    }
    .cedexx-toggle-btn:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 30px rgba(0, 212, 255, 0.4);
    }
    .cedexx-chat-window {
      position: absolute;
      bottom: 70px;
      right: 0;
      width: 360px;
      max-height: 500px;
      background: rgba(10, 10, 20, 0.95);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      overflow: hidden;
      display: none;
      flex-direction: column;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
    }
    .cedexx-chat-window.active {
      display: flex;
    }
    .cedexx-header {
      padding: 16px 20px;
      background: linear-gradient(135deg, ${CONFIG.primaryColor}20, transparent);
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .cedexx-header-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .cedexx-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, ${CONFIG.primaryColor}, ${CONFIG.secondaryColor});
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    }
    .cedexx-header-text h3 {
      margin: 0;
      color: white;
      font-size: 14px;
      font-weight: 600;
    }
    .cedexx-header-text span {
      color: rgba(255, 255, 255, 0.5);
      font-size: 11px;
    }
    .cedexx-controls {
      display: flex;
      gap: 8px;
    }
    .cedexx-control-btn {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: white;
      cursor: pointer;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .cedexx-control-btn:hover {
      background: rgba(255, 255, 255, 0.2);
    }
    .cedexx-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .cedexx-message {
      max-width: 80%;
      padding: 10px 14px;
      border-radius: 14px;
      font-size: 13px;
      line-height: 1.5;
      word-wrap: break-word;
    }
    .cedexx-message.user {
      align-self: flex-end;
      background: ${CONFIG.primaryColor}30;
      color: white;
      border-bottom-right-radius: 4px;
    }
    .cedexx-message.bot {
      align-self: flex-start;
      background: rgba(255, 255, 255, 0.08);
      color: rgba(255, 255, 255, 0.9);
      border-bottom-left-radius: 4px;
    }
    .cedexx-message.bot a {
      color: ${CONFIG.primaryColor};
      text-decoration: none;
    }
    .cedexx-message.bot a:hover {
      text-decoration: underline;
    }
    .cedexx-input-area {
      padding: 12px 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .cedexx-input {
      flex: 1;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      padding: 8px 14px;
      color: white;
      font-size: 13px;
      outline: none;
    }
    .cedexx-input::placeholder {
      color: rgba(255, 255, 255, 0.4);
    }
    .cedexx-send-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: ${CONFIG.primaryColor};
      border: none;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
    }
    .cedexx-send-btn:hover {
      background: ${CONFIG.primaryColor}dd;
    }
    .cedexx-send-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .cedexx-voice-indicator {
      display: none;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      color: ${CONFIG.primaryColor};
      font-size: 12px;
    }
    .cedexx-voice-indicator.active {
      display: flex;
    }
    .cedexx-typing-indicator {
      display: none;
      padding: 8px 16px;
      color: rgba(255, 255, 255, 0.5);
      font-size: 12px;
      font-style: italic;
    }
    .cedexx-typing-indicator.active {
      display: block;
    }
    .cedexx-booking-cta {
      padding: 10px 16px;
      background: linear-gradient(135deg, ${CONFIG.secondaryColor}20, transparent);
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      text-align: center;
    }
    .cedexx-booking-cta a {
      color: ${CONFIG.secondaryColor};
      text-decoration: none;
      font-size: 12px;
      font-weight: 500;
    }
    .cedexx-booking-cta a:hover {
      text-decoration: underline;
    }
    .cedexx-voice-wave {
      display: flex;
      align-items: center;
      gap: 2px;
      height: 20px;
    }
    .cedexx-voice-bar {
      width: 3px;
      background: ${CONFIG.primaryColor};
      border-radius: 2px;
      animation: cedexxWave 0.5s ease-in-out infinite alternate;
    }
    @keyframes cedexxWave {
      0% { height: 4px; }
      100% { height: 16px; }
    }
    @media (max-width: 480px) {
      .cedexx-chat-window {
        width: calc(100vw - 40px);
        right: -10px;
      }
    }
  `;
  document.head.appendChild(styles);

  // Create widget HTML
  const widget = document.createElement('div');
  widget.className = 'cedexx-widget-container';
  widget.innerHTML = `
    <div class="cedexx-chat-window" id="cedexx-chat-window">
      <div class="cedexx-header">
        <div class="cedexx-header-info">
          <div class="cedexx-avatar">🩺</div>
          <div class="cedexx-header-text">
            <h3>CEDEXX AI Assistant</h3>
            <span id="cedexx-status">Online</span>
          </div>
        </div>
        <div class="cedexx-controls">
          <button class="cedexx-control-btn" id="cedexx-lang-btn" title="Switch language">EN</button>
          <button class="cedexx-control-btn" id="cedexx-voice-btn" title="Voice mode">🎙️</button>
          <button class="cedexx-control-btn" id="cedexx-close-btn" title="Close">✕</button>
        </div>
      </div>
      <div class="cedexx-messages" id="cedexx-messages"></div>
      <div class="cedexx-typing-indicator" id="cedexx-typing">AI is thinking...</div>
      <div class="cedexx-voice-indicator" id="cedexx-voice-indicator">
        <div class="cedexx-voice-wave">
          <div class="cedexx-voice-bar" style="animation-delay: 0s"></div>
          <div class="cedexx-voice-bar" style="animation-delay: 0.1s"></div>
          <div class="cedexx-voice-bar" style="animation-delay: 0.2s"></div>
          <div class="cedexx-voice-bar" style="animation-delay: 0.3s"></div>
          <div class="cedexx-voice-bar" style="animation-delay: 0.4s"></div>
        </div>
        <span>Listening...</span>
      </div>
      <div class="cedexx-input-area">
        <input type="text" class="cedexx-input" id="cedexx-input" placeholder="Ask about telemedicine..." />
        <button class="cedexx-send-btn" id="cedexx-send-btn">➤</button>
      </div>
      <div class="cedexx-booking-cta">
        <a href="${CONFIG.bookingUrl}" target="_blank">📅 Book a Virtual Consultation →</a>
      </div>
    </div>
    <button class="cedexx-toggle-btn" id="cedexx-toggle-btn">💬</button>
  `;
  document.body.appendChild(widget);

  // Elements
  const chatWindow = document.getElementById('cedexx-chat-window');
  const toggleBtn = document.getElementById('cedexx-toggle-btn');
  const closeBtn = document.getElementById('cedexx-close-btn');
  const sendBtn = document.getElementById('cedexx-send-btn');
  const input = document.getElementById('cedexx-input');
  const messagesContainer = document.getElementById('cedexx-messages');
  const typingIndicator = document.getElementById('cedexx-typing');
  const voiceIndicator = document.getElementById('cedexx-voice-indicator');
  const voiceBtn = document.getElementById('cedexx-voice-btn');
  const langBtn = document.getElementById('cedexx-lang-btn');

  // Toggle chat
  toggleBtn.addEventListener('click', () => {
    isOpen = !isOpen;
    chatWindow.classList.toggle('active', isOpen);
    toggleBtn.textContent = isOpen ? '✕' : '💬';
    if (isOpen && messages.length === 0) {
      addMessage('bot', CONFIG.welcomeMessage[currentLang]);
    }
  });

  closeBtn.addEventListener('click', () => {
    isOpen = false;
    chatWindow.classList.remove('active');
    toggleBtn.textContent = '💬';
  });

  // Language toggle
  const LANG_CYCLE = ['en', 'es', 'ru', 'ht'];
  langBtn.addEventListener('click', () => {
    const idx = LANG_CYCLE.indexOf(currentLang);
    currentLang = LANG_CYCLE[(idx + 1) % LANG_CYCLE.length];
    langBtn.textContent = currentLang.toUpperCase();
    // Re-show welcome in new language
    messagesContainer.innerHTML = '';
    messages = [];
    addMessage('bot', CONFIG.welcomeMessage[currentLang]);
  });

  // Voice mode toggle
  voiceBtn.addEventListener('click', () => {
    if (!CONFIG.voiceEnabled) {
      alert('Voice mode not enabled. Set CEDEXX_CONFIG.voiceEnabled = true');
      return;
    }
    isVoiceMode = !isVoiceMode;
    voiceBtn.style.background = isVoiceMode ? CONFIG.primaryColor + '40' : '';
    if (isVoiceMode) {
      startVoiceInput();
    } else {
      stopVoiceInput();
    }
  });

  // Send message
  function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    addMessage('user', text);
    input.value = '';
    showTyping(true);

    // Call AI API
    callAI(text).then(response => {
      showTyping(false);
      addMessage('bot', response);
      if (isVoiceMode) {
        speak(response);
      }
    }).catch(err => {
      showTyping(false);
      const errorMsgs = {
        en: "I'm having trouble connecting right now. Please try again or contact us at info@cedexx.net",
        es: "Estoy teniendo problemas de conexión. Por favor intenta de nuevo o contáctanos en info@cedexx.net",
        ru: "У меня сейчас проблемы с подключением. Пожалуйста, попробуйте еще раз или свяжитесь с нами по адресу info@cedexx.net",
        ht: "Mwen gen pwoblèm koneksyon kounye a. Tanpri eseye ankò oswa kontakte nou nan info@cedexx.net"
      };
      addMessage('bot', errorMsgs[currentLang] || errorMsgs.en);
      console.error('Chatbot error:', err);
    });
  }

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

  // Add message to UI
  function addMessage(sender, text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `cedexx-message ${sender}`;
    // Convert URLs to links
    const linkedText = text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
    msgDiv.innerHTML = linkedText;
    messagesContainer.appendChild(msgDiv);
    messages.push({ sender, text });
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function showTyping(show) {
    typingIndicator.classList.toggle('active', show);
    sendBtn.disabled = show;
  }

  // AI API call (Gemini format)
  async function callAI(userMessage) {
    if (!CONFIG.apiKey) {
      return getFallbackResponse(userMessage);
    }

    try {
      const systemPrompt = CONFIG.knowledgeBase[currentLang];
      const history = messages
        .filter(m => m.sender !== 'bot' || m.text !== CONFIG.welcomeMessage[currentLang])
        .map(m => ({
          role: m.sender === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        }));

      const contents = [
        { role: 'user', parts: [{ text: systemPrompt + '\n\nUser: ' + userMessage }] }
      ];

      // If there is conversation history, prepend it
      if (history.length > 0) {
        contents.unshift(...history.slice(-5)); // keep last 5 exchanges
      }

      const response = await fetch(`${CONFIG.apiEndpoint}?key=${CONFIG.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500
          },
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Gemini API error:', errorData);
        throw new Error('API error: ' + (errorData.error?.message || response.status));
      }

      const data = await response.json();
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
      } else if (data.error) {
        throw new Error(data.error.message);
      }
      throw new Error('Unexpected API response format');
    } catch (err) {
      console.error('API call failed:', err);
      return getFallbackResponse(userMessage);
    }
  }

  // Fallback responses (no API key needed)
  function getFallbackResponse(input) {
    const text = input.toLowerCase();
    const kb = {
      en: {
        greeting: "Hello! Welcome to CEDEXX. I can help you learn about our telemedicine services, health blog, or connect you with a virtual provider. What would you like to know?",
        telemedicine: "CEDEXX offers 24/7 virtual provider access for families. No insurance required for many consultations. We cover general medicine, pediatrics, wellness, and mental health support across Miami-Dade and Broward counties.",
        pediatric: "Our pediatric telemedicine specialists are available 24/7 for common childhood illnesses, wellness checks, and developmental questions. Book a consultation at cedexx.net/consultation",
        blog: "Our Health Blog features research-backed insights on pediatric care, wellness tips, and affordable healthcare options. Visit cedexx.net/blog to explore.",
        price: "Many CEDEXX consultations don't require insurance. Pricing varies by service type. Book a free initial consultation to discuss options.",
        insurance: "No insurance? No problem. CEDEXX offers affordable virtual care options that don't require traditional insurance. Contact us at info@cedexx.net for details.",
        booking: "You can book a virtual consultation at cedexx.net/consultation. Same-day appointments often available.",
        contact: "Reach us at info@cedexx.net or through our consultation booking page. We're here to help Miami families access quality virtual care.",
        hours: "CEDEXX virtual providers are available 24/7. Book anytime at cedexx.net/consultation.",
        location: "CEDEXX serves families across Miami-Dade, Broward, and throughout Florida. All consultations are virtual — no office visit needed.",
        default: "That's a great question. For detailed information about our telemedicine services, please visit cedexx.net or book a consultation. You can also email us at info@cedexx.net."
      },
      es: {
        greeting: "¡Hola! Bienvenido a CEDEXX. Puedo ayudarte a conocer nuestros servicios de telemedicina, blog de salud, o conectarte con un proveedor virtual. ¿Qué te gustaría saber?",
        telemedicine: "CEDEXX ofrece acceso 24/7 a proveedores virtuales para familias. No se requiere seguro para muchas consultas. Cubrimos medicina general, pediatría, bienestar y apoyo de salud mental en Miami-Dade y Broward.",
        pediatric: "Nuestros especialistas en telemedicina pediátrica están disponibles 24/7 para enfermedades comunes infantiles, chequeos de bienestar y preguntas de desarrollo. Reserva en cedexx.net/consultation",
        blog: "Nuestro Blog de Salud presenta información basada en investigación sobre cuidado pediátrico, consejos de bienestar y opciones de salud asequibles. Visita cedexx.net/blog.",
        price: "Muchas consultas de CEDEXX no requieren seguro. Los precios varían según el tipo de servicio. Reserva una consulta inicial gratuita para discutir opciones.",
        insurance: "¿Sin seguro? No hay problema. CEDEXX ofrece opciones de atención virtual asequibles que no requieren seguro tradicional. Contáctanos en info@cedexx.net.",
        booking: "Puedes reservar una consulta virtual en cedexx.net/consultation. Citas el mismo día a menudo disponibles.",
        contact: "Escríbenos a info@cedexx.net o a través de nuestra página de reservas. Estamos aquí para ayudar a las familias de Miami a acceder a atención virtual de calidad.",
        hours: "Los proveedores virtuales de CEDEXX están disponibles 24/7. Reserva en cualquier momento en cedexx.net/consultation.",
        location: "CEDEXX sirve a familias en Miami-Dade, Broward y todo Florida. Todas las consultas son virtuales — no se necesita visita presencial.",
        default: "Esa es una excelente pregunta. Para información detallada sobre nuestros servicios de telemedicina, visita cedexx.net o reserva una consulta. También puedes escribirnos a info@cedexx.net."
      }
    };

    const lang = kb[currentLang];
    if (text.match(/hi|hello|hey|hola|buenas|здравствуй|привет|bonjou|salut/)) return lang.greeting;
    if (text.match(/telemedicine|virtual care|virtual doctor|consulta virtual|телемедицина|telemedsin/)) return lang.telemedicine;
    if (text.match(/pediatric|niño|child|baby|bebé|pediatría|педиатрия|timoun|ti bebe/)) return lang.pediatric;
    if (text.match(/blog|article|post|блог|blog/)) return lang.blog;
    if (text.match(/price|cost|cuánto|pricing|precio|цена|стоимость|pri|koute/)) return lang.price;
    if (text.match(/insurance|seguro|coverage|cobertura|страховка|asirans/)) return lang.insurance;
    if (text.match(/book|schedule|appointment|cita|reservar|agendar|записаться|appointment|ranvou|resève/)) return lang.booking;
    if (text.match(/contact|email|call|llamar|escribir|phone|контакт|позвонить|kontak|rele/)) return lang.contact;
    if (text.match(/hours|time|horario|disponible|available|24|часы|доступно|lè|disponib/)) return lang.hours;
    if (text.match(/location|where|dónde|miami|florida|address|место|где|ki kote|adrès/)) return lang.location;
    return lang.default;
  }

  // Voice input (Web Speech API)
  function startVoiceInput() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice input not supported in this browser. Try Chrome or Edge.');
      isVoiceMode = false;
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = currentLang === 'es' ? 'es-ES' : currentLang === 'ru' ? 'ru-RU' : currentLang === 'ht' ? 'ht-HT' : 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      voiceIndicator.classList.add('active');
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      input.value = transcript;
      sendMessage();
    };

    recognition.onerror = (event) => {
      console.error('Voice error:', event.error);
      voiceIndicator.classList.remove('active');
    };

    recognition.onend = () => {
      voiceIndicator.classList.remove('active');
      if (isVoiceMode) {
        // Auto-restart for continuous listening
        setTimeout(() => {
          if (isVoiceMode) recognition.start();
        }, 500);
      }
    };

    recognition.start();
  }

  function stopVoiceInput() {
    if (recognition) {
      recognition.stop();
      recognition = null;
    }
    voiceIndicator.classList.remove('active');
  }

  // Text-to-speech
  function speak(text) {
    if (!synth) return;
    // Strip HTML
    const cleanText = text.replace(/<[^>]*>/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = currentLang === 'es' ? 'es-ES' : currentLang === 'ru' ? 'ru-RU' : currentLang === 'ht' ? 'ht-HT' : 'en-US';
    utterance.rate = 1;
    utterance.pitch = 1;
    synth.speak(utterance);
  }

  // Expose API for external control
  window.CEDEXX_CHATBOT = {
    open: () => toggleBtn.click(),
    close: () => { if (isOpen) toggleBtn.click(); },
    send: (text) => {
      if (!isOpen) toggleBtn.click();
      input.value = text;
      sendMessage();
    },
    setLanguage: (lang) => {
      if (CONFIG.languages.includes(lang)) {
        currentLang = lang;
        langBtn.textContent = lang.toUpperCase();
      }
    }
  };

  console.log('[CEDEXX Chatbot] Widget loaded. Configure API key: window.CEDEXX_CONFIG.apiKey = "your-key"');
})();
