(function() {
  'use strict';

  // ============================================
  // Universal AI Agent Chatbot v3.0
  // Tool use + Dynamic block generation + Intent routing
  // For: 305business, MBMB, CEDEXX, Building Innovation, AIDynamic.pro
  // ============================================

  const DEFAULT_CONFIG = {
    apiKey: '',
    apiEndpoint: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o-mini',
    position: 'bottom-right',
    voiceEnabled: false,
    languages: ['en'],
    defaultLanguage: 'en',
    primaryColor: '#2563eb',
    secondaryColor: '#1e40af',
    showBranding: false,
    siteName: 'Your Website',
    knowledgeBase: '',
    tools: {},
    callbacks: {
      onMessage: null,
      onToolCall: null,
      onBlockGenerated: null
    }
  };

  class AgenticChatbot {
    constructor(config) {
      this.config = Object.assign({}, DEFAULT_CONFIG, config);
      this.messages = [];
      this.isOpen = false;
      this.isTyping = false;
      this.sessionId = 'chat_' + Math.random().toString(36).slice(2, 11);
      this.intent = null;
      this.tools = this.buildTools();
      this.init();
    }

    init() {
      this.injectStyles();
      this.createUI();
      this.bindEvents();
      this.loadHistory();
      
      // Notify agentic engine
      if (window._agenticInstance) {
        window._agenticInstance.logEvent('chatbot_init', { sessionId: this.sessionId });
      }
    }

    // ============================================
    // TOOL SYSTEM
    // ============================================
    buildTools() {
      const defaultTools = {
        generateBlock: {
          description: 'Generate a dynamic content block (faq, comparison, pricing, testimonial, cta, features)',
          parameters: {
            type: { type: 'string', enum: ['faq', 'comparison', 'pricing', 'testimonial', 'cta', 'features', 'alert'] },
            data: { type: 'object' },
            targetSelector: { type: 'string', optional: true }
          },
          execute: (params) => {
            if (window.agentic && window.agentic.generateBlock) {
              const block = window.agentic.generateBlock(params.type, params.data, params.targetSelector);
              if (this.config.callbacks.onBlockGenerated) {
                this.config.callbacks.onBlockGenerated(params.type, block);
              }
              return { success: true, blockType: params.type, injected: !!block };
            }
            return { success: false, error: 'Agentic engine not available' };
          }
        },
        modifyPage: {
          description: 'Modify the page in real-time (move_cta, hide_element, show_element, change_text, highlight, add_urgency)',
          parameters: {
            action: { type: 'string', enum: ['move_cta', 'hide_element', 'show_element', 'change_text', 'highlight', 'add_urgency'] },
            params: { type: 'object' }
          },
          execute: (params) => {
            if (window.agentic && window.agentic.modifyPage) {
              window.agentic.modifyPage(params.action, params.params);
              return { success: true, action: params.action };
            }
            return { success: false, error: 'Agentic engine not available' };
          }
        },
        getAnalytics: {
          description: 'Get recent analytics data from this session',
          parameters: {},
          execute: () => {
            if (window.agentic && window.agentic.getAnalytics) {
              return { success: true, data: window.agentic.getAnalytics() };
            }
            return { success: false, error: 'Analytics not available' };
          }
        },
        scrollToSection: {
          description: 'Scroll the page to a specific section',
          parameters: {
            selector: { type: 'string', description: 'CSS selector or element ID' }
          },
          execute: (params) => {
            const el = document.querySelector(params.selector);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              return { success: true, scrolledTo: params.selector };
            }
            return { success: false, error: 'Section not found' };
          }
        },
        openUrl: {
          description: 'Open a URL in a new tab or navigate to it',
          parameters: {
            url: { type: 'string' },
            newTab: { type: 'boolean', default: true }
          },
          execute: (params) => {
            if (params.newTab) {
              window.open(params.url, '_blank');
            } else {
              window.location.href = params.url;
            }
            return { success: true, url: params.url };
          }
        },
        showForm: {
          description: 'Show a specific form or lead capture modal',
          parameters: {
            formId: { type: 'string', description: 'ID of form element to show/focus' },
            autoFill: { type: 'object', optional: true }
          },
          execute: (params) => {
            const form = document.getElementById(params.formId) || document.querySelector(params.formId);
            if (form) {
              form.scrollIntoView({ behavior: 'smooth' });
              if (params.autoFill) {
                Object.entries(params.autoFill).forEach(([key, value]) => {
                  const input = form.querySelector(`[name="${key}"], [id="${key}"]`);
                  if (input) input.value = value;
                });
              }
              // Focus first input
              const firstInput = form.querySelector('input, textarea, select');
              if (firstInput) setTimeout(() => firstInput.focus(), 500);
              return { success: true, formId: params.formId };
            }
            return { success: false, error: 'Form not found' };
          }
        },
        trackEvent: {
          description: 'Track a custom analytics event',
          parameters: {
            eventName: { type: 'string' },
            properties: { type: 'object', optional: true }
          },
          execute: (params) => {
            if (window._agenticInstance) {
              window._agenticInstance.logEvent(params.eventName, params.properties || {});
            }
            return { success: true, event: params.eventName };
          }
        }
      };

      return Object.assign(defaultTools, this.config.tools || {});
    }

    // ============================================
    // UI CREATION
    // ============================================
    injectStyles() {
      const styles = `
        .agentic-chat-widget {
          position: fixed;
          ${this.config.position === 'bottom-left' ? 'left: 20px;' : 'right: 20px;'}
          bottom: 20px;
          z-index: 99999;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .agentic-chat-button {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: ${this.config.primaryColor};
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 20px rgba(0,0,0,0.2);
          transition: transform 0.2s, box-shadow 0.2s;
          animation: agenticChatPulse 2s infinite;
        }
        .agentic-chat-button:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 24px rgba(0,0,0,0.3);
        }
        .agentic-chat-panel {
          position: absolute;
          ${this.config.position === 'bottom-left' ? 'left: 0;' : 'right: 0;'}
          bottom: 70px;
          width: 380px;
          max-height: 600px;
          height: 600px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.2);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: transform 0.3s, opacity 0.3s;
          transform: scale(0.95);
          opacity: 0;
          pointer-events: none;
        }
        .agentic-chat-panel.open {
          transform: scale(1);
          opacity: 1;
          pointer-events: auto;
        }
        .agentic-chat-header {
          background: ${this.config.primaryColor};
          color: white;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .agentic-chat-header-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .agentic-chat-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
        }
        .agentic-chat-header-text h3 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
        }
        .agentic-chat-header-text p {
          margin: 0;
          font-size: 0.75rem;
          opacity: 0.8;
        }
        .agentic-chat-close {
          background: none;
          border: none;
          color: white;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 4px;
          line-height: 1;
        }
        .agentic-chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          scroll-behavior: smooth;
        }
        .agentic-chat-message {
          max-width: 85%;
          padding: 12px 16px;
          border-radius: 16px;
          font-size: 0.9375rem;
          line-height: 1.5;
          word-wrap: break-word;
        }
        .agentic-chat-message.user {
          align-self: flex-end;
          background: ${this.config.primaryColor};
          color: white;
          border-bottom-right-radius: 4px;
        }
        .agentic-chat-message.bot {
          align-self: flex-start;
          background: #f1f5f9;
          color: #1e293b;
          border-bottom-left-radius: 4px;
        }
        .agentic-chat-message.tool-call {
          align-self: flex-start;
          background: #eff6ff;
          color: #1e40af;
          border: 1px solid #bfdbfe;
          font-size: 0.8125rem;
          padding: 8px 12px;
        }
        .agentic-chat-typing {
          display: flex;
          gap: 4px;
          padding: 12px 16px;
          align-self: flex-start;
        }
        .agentic-chat-typing-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #94a3b8;
          animation: agenticTyping 1.4s infinite;
        }
        .agentic-chat-typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .agentic-chat-typing-dot:nth-child(3) { animation-delay: 0.4s; }
        .agentic-chat-input-area {
          padding: 12px 16px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          gap: 8px;
          align-items: flex-end;
        }
        .agentic-chat-input {
          flex: 1;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 10px 16px;
          font-size: 0.9375rem;
          outline: none;
          resize: none;
          min-height: 20px;
          max-height: 120px;
          font-family: inherit;
        }
        .agentic-chat-input:focus {
          border-color: ${this.config.primaryColor};
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }
        .agentic-chat-send {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: ${this.config.primaryColor};
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: transform 0.2s;
        }
        .agentic-chat-send:hover {
          transform: scale(1.05);
        }
        .agentic-chat-send:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .agentic-chat-suggestions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          padding: 0 16px 8px;
        }
        .agentic-chat-suggestion {
          padding: 6px 12px;
          border-radius: 16px;
          background: #f1f5f9;
          color: #475569;
          font-size: 0.8125rem;
          cursor: pointer;
          border: 1px solid #e2e8f0;
          transition: all 0.2s;
        }
        .agentic-chat-suggestion:hover {
          background: ${this.config.primaryColor};
          color: white;
          border-color: ${this.config.primaryColor};
        }
        .agentic-chat-block-preview {
          margin: 8px 0;
          padding: 12px;
          background: #f8fafc;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }
        .agentic-chat-block-preview-title {
          font-size: 0.75rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        @keyframes agenticChatPulse {
          0%, 100% { box-shadow: 0 4px 20px rgba(0,0,0,0.2); }
          50% { box-shadow: 0 4px 30px rgba(37, 99, 235, 0.4); }
        }
        @keyframes agenticTyping {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-4px); opacity: 1; }
        }
        @media (max-width: 480px) {
          .agentic-chat-panel {
            width: calc(100vw - 40px);
            height: 70vh;
            max-height: 70vh;
            ${this.config.position === 'bottom-left' ? 'left: 10px;' : 'right: 10px;'}
            bottom: 70px;
          }
        }
      `;
      const styleEl = document.createElement('style');
      styleEl.textContent = styles;
      document.head.appendChild(styleEl);
    }

    createUI() {
      const container = document.createElement('div');
      container.className = 'agentic-chat-widget';
      container.innerHTML = `
        <button class="agentic-chat-button" id="agenticChatToggle" aria-label="Open chat">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
        <div class="agentic-chat-panel" id="agenticChatPanel">
          <div class="agentic-chat-header">
            <div class="agentic-chat-header-info">
              <div class="agentic-chat-avatar">🤖</div>
              <div class="agentic-chat-header-text">
                <h3>${this.config.siteName} AI Assistant</h3>
                <p>Online now — Ask me anything</p>
              </div>
            </div>
            <button class="agentic-chat-close" id="agenticChatClose" aria-label="Close chat">×</button>
          </div>
          <div class="agentic-chat-messages" id="agenticChatMessages"></div>
          <div class="agentic-chat-suggestions" id="agenticChatSuggestions"></div>
          <div class="agentic-chat-input-area">
            <textarea class="agentic-chat-input" id="agenticChatInput" placeholder="Type your message..." rows="1"></textarea>
            <button class="agentic-chat-send" id="agenticChatSend" aria-label="Send message">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(container);

      this.elements = {
        toggle: document.getElementById('agenticChatToggle'),
        panel: document.getElementById('agenticChatPanel'),
        messages: document.getElementById('agenticChatMessages'),
        input: document.getElementById('agenticChatInput'),
        send: document.getElementById('agenticChatSend'),
        close: document.getElementById('agenticChatClose'),
        suggestions: document.getElementById('agenticChatSuggestions')
      };
    }

    bindEvents() {
      this.elements.toggle.addEventListener('click', () => this.toggleChat());
      this.elements.close.addEventListener('click', () => this.toggleChat(false));
      this.elements.send.addEventListener('click', () => this.sendMessage());
      this.elements.input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });
      this.elements.input.addEventListener('input', () => {
        this.elements.input.style.height = 'auto';
        this.elements.input.style.height = Math.min(this.elements.input.scrollHeight, 120) + 'px';
      });
    }

    toggleChat(force) {
      this.isOpen = force !== undefined ? force : !this.isOpen;
      this.elements.panel.classList.toggle('open', this.isOpen);
      if (this.isOpen) {
        this.elements.input.focus();
        this.showSuggestions();
        if (this.messages.length === 0) {
          this.addWelcomeMessage();
        }
      }
    }

    addWelcomeMessage() {
      const welcome = this.getWelcomeMessage();
      this.addMessage('bot', welcome);
    }

    getWelcomeMessage() {
      const lang = this.config.defaultLanguage;
      const defaults = {
        en: `Hi there! 👋 I'm the ${this.config.siteName} AI Assistant.

I can help you with:
• Answering questions about our services
• Finding the right information on our site
• Comparing options and pricing
• Booking a consultation or demo
• Generating helpful content on the fly

What can I help you with today?`,
        es: `¡Hola! 👋 Soy el Asistente de IA de ${this.config.siteName}.

¿En qué puedo ayudarte hoy?`,
        ru: `Привет! 👋 Я AI-ассистент ${this.config.siteName}.

Чем могу помочь?`,
        ht: `Bonjou! 👋 Mwen se asistan AI ${this.config.siteName}.

Kouman mwen ka ede w?`
      };
      return (this.config.welcomeMessage && this.config.welcomeMessage[lang]) || defaults[lang] || defaults.en;
    }

    showSuggestions() {
      const suggestions = this.config.suggestions || [
        'How does this work?',
        'Show me pricing',
        'Book a consultation',
        'Compare options',
        'What services do you offer?'
      ];
      this.elements.suggestions.innerHTML = suggestions.map(s => 
        `<button class="agentic-chat-suggestion" data-suggestion="${s}">${s}</button>`
      ).join('');
      
      this.elements.suggestions.querySelectorAll('.agentic-chat-suggestion').forEach(btn => {
        btn.addEventListener('click', (e) => {
          this.elements.input.value = e.target.dataset.suggestion;
          this.sendMessage();
        });
      });
    }

    // ============================================
    // MESSAGE HANDLING
    // ============================================
    addMessage(role, text, isToolCall) {
      const msg = document.createElement('div');
      msg.className = `agentic-chat-message ${role}`;
      if (isToolCall) msg.classList.add('tool-call');
      msg.textContent = text;
      this.elements.messages.appendChild(msg);
      this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
      this.messages.push({ role, text, timestamp: Date.now() });
      this.saveHistory();
      return msg;
    }

    addTyping() {
      const typing = document.createElement('div');
      typing.className = 'agentic-chat-typing';
      typing.id = 'agenticChatTyping';
      typing.innerHTML = '<div class="agentic-chat-typing-dot"></div><div class="agentic-chat-typing-dot"></div><div class="agentic-chat-typing-dot"></div>';
      this.elements.messages.appendChild(typing);
      this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
      return typing;
    }

    removeTyping() {
      const typing = document.getElementById('agenticChatTyping');
      if (typing) typing.remove();
    }

    async sendMessage() {
      const text = this.elements.input.value.trim();
      if (!text || this.isTyping) return;

      this.elements.input.value = '';
      this.elements.input.style.height = 'auto';
      this.addMessage('user', text);
      this.isTyping = true;
      this.elements.send.disabled = true;

      const typing = this.addTyping();

      try {
        // Track via agentic engine
        if (window._agenticInstance) {
          window._agenticInstance.logEvent('chat_message', { 
            message: text.substring(0, 200),
            sessionId: this.sessionId
          });
        }

        const response = await this.getAIResponse(text);
        this.removeTyping();
        this.addMessage('bot', response);
      } catch (err) {
        console.error('Chat error:', err);
        this.removeTyping();
        this.addMessage('bot', 'Sorry, I had trouble processing that. Please try again or contact our team directly.');
      } finally {
        this.isTyping = false;
        this.elements.send.disabled = false;
      }
    }

    async getAIResponse(text) {
      // Build system prompt with tools
      const toolsDesc = Object.entries(this.tools).map(([name, tool]) => {
        return `${name}: ${tool.description}\nParameters: ${JSON.stringify(tool.parameters)}`;
      }).join('\n\n');

      const systemPrompt = `You are the AI assistant for ${this.config.siteName}. 

${this.config.knowledgeBase}

AVAILABLE TOOLS:
${toolsDesc}

When you need to use a tool, output ONLY a JSON object in this format:
{"tool": "toolName", "params": {}}

Otherwise, respond naturally to the user. Keep responses concise and helpful. If the user asks about pricing, use the generateBlock tool to show a pricing table. If they ask about features, use the generateBlock tool with features type. If they want to compare, use comparison. If they want to book, use the showForm or openUrl tool. If you want to guide them to a section, use scrollToSection.`;

      const messages = [
        { role: 'system', content: systemPrompt },
        ...this.messages.slice(-10).map(m => ({ role: m.role === 'bot' ? 'assistant' : 'user', content: m.text })),
        { role: 'user', content: text }
      ];

      // If using OpenAI API
      if (this.config.apiKey && this.config.apiKey.startsWith('sk-')) {
        const response = await fetch(this.config.apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`
          },
          body: JSON.stringify({
            model: this.config.model,
            messages: messages,
            temperature: 0.7,
            max_tokens: 1000
          })
        });
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || 'I\'m not sure how to help with that. Can you rephrase?';
        return this.processResponse(content);
      }

      // Fallback: rule-based with tool detection
      return this.ruleBasedResponse(text);
    }

    processResponse(content) {
      // Check if response is a tool call
      try {
        const toolCall = JSON.parse(content);
        if (toolCall.tool && this.tools[toolCall.tool]) {
          // Execute tool
          const result = this.tools[toolCall.tool].execute(toolCall.params || {});
          
          // Show tool call in chat
          this.addMessage('bot', `✓ ${toolCall.tool}`, true);
          
          // Return follow-up based on tool result
          if (result.success) {
            return this.getToolSuccessMessage(toolCall.tool, toolCall.params);
          } else {
            return `I tried to do that but encountered an issue: ${result.error}`;
          }
        }
      } catch (e) {
        // Not JSON, return as-is
      }
      return content;
    }

    getToolSuccessMessage(tool, params) {
      const messages = {
        generateBlock: `✅ I've generated a ${params.type} block for you right here on the page!`,
        scrollToSection: `✅ Scrolling to that section for you...`,
        openUrl: `✅ Opening that page for you...`,
        showForm: `✅ I've highlighted the form for you. Just fill it out and we'll get back to you within 24 hours!`,
        modifyPage: `✅ Page updated!`,
        trackEvent: `✅ Got it!`
      };
      return messages[tool] || `✅ Done!`;
    }

    ruleBasedResponse(text) {
      const lower = text.toLowerCase();
      
      // Pricing intent
      if (lower.includes('price') || lower.includes('cost') || lower.includes('how much') || lower.includes('fee')) {
        setTimeout(() => {
          if (window.agentic && window.agentic.generateBlock) {
            window.agentic.generateBlock('pricing', {
              title: 'Our Services',
              tiers: this.config.pricingTiers || [
                { name: 'Basic', price: 'Contact us', features: ['Core services', 'Email support', 'Standard delivery'], cta: 'Get Started' },
                { name: 'Professional', price: 'Custom', features: ['Everything in Basic', 'Priority support', 'Advanced analytics', 'Dedicated manager'], cta: 'Request Quote', highlighted: true },
                { name: 'Enterprise', price: 'Custom', features: ['Full customization', 'SLA guarantee', 'White-label options', 'API access'], cta: 'Contact Sales' }
              ]
            });
          }
        }, 500);
        return "I've pulled up our pricing for you above! Each tier is designed to match different needs. Would you like to book a free consultation to discuss which fits best?";
      }
      
      // Comparison intent
      if (lower.includes('compare') || lower.includes('difference') || lower.includes('vs') || lower.includes('versus')) {
        setTimeout(() => {
          if (window.agentic && window.agentic.generateBlock) {
            window.agentic.generateBlock('comparison', {
              title: 'How We Compare',
              features: [
                { name: 'AI-Powered', key: 'ai' },
                { name: 'Personalized Service', key: 'personal' },
                { name: 'Fast Turnaround', key: 'speed' },
                { name: 'Transparent Pricing', key: 'transparent' },
                { name: 'Local Expertise', key: 'local' }
              ],
              items: [
                { name: 'Us', ai: true, personal: true, speed: true, transparent: true, local: true },
                { name: 'Others', ai: false, personal: false, speed: true, transparent: false, local: false }
              ]
            });
          }
        }, 500);
        return "Here's a quick comparison of what makes us different. As you can see, we focus on combining AI efficiency with personalized human service.";
      }
      
      // FAQ intent
      if (lower.includes('how') || lower.includes('what') || lower.includes('why') || lower.includes('help')) {
        setTimeout(() => {
          if (window.agentic && window.agentic.generateBlock) {
            window.agentic.generateBlock('faq', {
              title: 'Common Questions',
              items: this.config.faqs || [
                { question: 'How do I get started?', answer: 'Simply reach out through our contact form or chat. We\'ll schedule a free consultation to understand your needs.' },
                { question: 'How long does it take?', answer: 'Most projects start within 48 hours. Timelines vary based on complexity, but we always keep you updated.' },
                { question: 'Is there a guarantee?', answer: 'Yes — we stand behind our work. If you\'re not satisfied, we\'ll make it right.' }
              ]
            });
          }
        }, 500);
        return "I've generated a helpful FAQ section for you right above! Let me know if you have a specific question I can answer.";
      }
      
      // Booking/Contact intent
      if (lower.includes('book') || lower.includes('schedule') || lower.includes('appointment') || lower.includes('meeting') || lower.includes('call') || lower.includes('contact')) {
        // Try to find and scroll to a form
        const form = document.querySelector('form, [data-track="contact"], [data-track="booking"]') || 
                     document.getElementById('contact') || 
                     document.getElementById('booking');
        if (form) {
          setTimeout(() => form.scrollIntoView({ behavior: 'smooth', block: 'center' }), 500);
        }
        return "I'd love to connect! I've scrolled to our contact form for you. Just fill it out and we'll reach out within 24 hours. Or if you prefer, you can also call us directly.";
      }
      
      // Services intent
      if (lower.includes('service') || lower.includes('offer') || lower.includes('do') || lower.includes('what')) {
        setTimeout(() => {
          if (window.agentic && window.agentic.generateBlock) {
            window.agentic.generateBlock('features', {
              title: 'What We Offer',
              features: this.config.services || [
                { icon: '🔍', title: 'Discovery & Strategy', description: 'We analyze your needs and create a tailored roadmap.' },
                { icon: '⚡', title: 'Fast Implementation', description: 'Quick deployment without compromising quality.' },
                { icon: '📊', title: 'Analytics & Insights', description: 'Track performance with real-time dashboards.' },
                { icon: '🤝', title: 'Ongoing Support', description: 'We stick with you long after launch.' }
              ]
            });
          }
        }, 500);
        return "Here are our core services. Each is designed to work together or standalone — whatever fits your needs best.";
      }
      
      // Default: scroll to services
      return "Great question! Let me help you find what you're looking for. I've pulled up some relevant information on the page. Can you tell me more about what you're trying to accomplish?";
    }

    // ============================================
    // HISTORY & STORAGE
    // ============================================
    saveHistory() {
      try {
        localStorage.setItem('agentic_chat_' + this.config.siteName, JSON.stringify(this.messages.slice(-50)));
      } catch (e) {}
    }

    loadHistory() {
      try {
        const saved = localStorage.getItem('agentic_chat_' + this.config.siteName);
        if (saved) {
          this.messages = JSON.parse(saved);
        }
      } catch (e) {}
    }
  }

  // Expose globally
  window.AgenticChatbot = AgenticChatbot;
  
  // Auto-init if config exists
  if (window.AGENTIC_CHATBOT_CONFIG) {
    window._agenticChatbot = new AgenticChatbot(window.AGENTIC_CHATBOT_CONFIG);
  }
})();
