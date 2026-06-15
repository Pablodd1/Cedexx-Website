/**
 * Twilio Frontend Integration - Add to chatbots for SMS/Voice buttons
 * This module adds "Call me" and "Text me" buttons to existing chatbot widgets
 */

const TWILIO_API_BASE = 'https://twilio-api.yourdomain.com'; // Update with actual deployment URL

/**
 * Initialize Twilio buttons in a chatbot
 * @param {string} project - 'mbmb', '305business', or 'cedexx'
 * @param {HTMLElement} container - Chatbot container element
 * @param {object} userInfo - { name, phone, email, specialty/business/plan }
 */
function addTwilioButtons(project, container, userInfo = {}) {
  const btnContainer = document.createElement('div');
  btnContainer.className = 'twilio-action-buttons';
  btnContainer.style.cssText = 'display: flex; gap: 8px; margin-top: 10px; padding: 0 12px;';

  // Call me button
  const callBtn = document.createElement('button');
  callBtn.className = 'twilio-btn twilio-call-btn';
  callBtn.innerHTML = '📞 Call Me';
  callBtn.style.cssText = `
    padding: 8px 14px;
    border-radius: 20px;
    border: 1px solid #10b981;
    background: rgba(16, 185, 129, 0.1);
    color: #10b981;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 4px;
  `;
  callBtn.onmouseover = () => { callBtn.style.background = 'rgba(16, 185, 129, 0.2)'; };
  callBtn.onmouseout = () => { callBtn.style.background = 'rgba(16, 185, 129, 0.1)'; };
  callBtn.onclick = () => handleTwilioAction(project, 'call', userInfo, container);

  // Text me button
  const smsBtn = document.createElement('button');
  smsBtn.className = 'twilio-btn twilio-sms-btn';
  smsBtn.innerHTML = '💬 Text Me';
  smsBtn.style.cssText = `
    padding: 8px 14px;
    border-radius: 20px;
    border: 1px solid #3b82f6;
    background: rgba(59, 130, 246, 0.1);
    color: #3b82f6;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 4px;
  `;
  smsBtn.onmouseover = () => { smsBtn.style.background = 'rgba(59, 130, 246, 0.2)'; };
  smsBtn.onmouseout = () => { smsBtn.style.background = 'rgba(59, 130, 246, 0.1)'; };
  smsBtn.onclick = () => handleTwilioAction(project, 'sms', userInfo, container);

  btnContainer.appendChild(callBtn);
  btnContainer.appendChild(smsBtn);
  container.appendChild(btnContainer);
}

async function handleTwilioAction(project, action, userInfo, container) {
  // Show phone input
  const inputDiv = document.createElement('div');
  inputDiv.className = 'twilio-phone-input';
  inputDiv.style.cssText = 'padding: 10px 12px; display: flex; gap: 8px; align-items: center;';
  inputDiv.innerHTML = `
    <input type="tel" placeholder="+1 (555) 123-4567" 
      style="flex: 1; padding: 8px 12px; border-radius: 8px; border: 1px solid #ddd; font-size: 13px;"
      id="twilio-phone-input" value="${userInfo.phone || ''}"/>
    <button id="twilio-confirm-btn" style="padding: 8px 16px; border-radius: 8px; background: #3b82f6; color: white; border: none; cursor: pointer; font-size: 12px;">Send</button>
  `;
  
  container.appendChild(inputDiv);
  const phoneInput = inputDiv.querySelector('#twilio-phone-input');
  const confirmBtn = inputDiv.querySelector('#twilio-confirm-btn');
  phoneInput.focus();

  confirmBtn.onclick = async () => {
    const phone = phoneInput.value.trim();
    if (!phone || !isValidPhone(phone)) {
      alert('Please enter a valid phone number (e.g., +1 786 643 2099)');
      return;
    }

    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Sending...';

    const endpoint = action === 'call' 
      ? `/${project}/voice/welcome` 
      : `/${project}/sms/lead-followup`;
    
    try {
      const response = await fetch(`${TWILIO_API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          name: userInfo.name || 'there',
          specialty: userInfo.specialty,
          interest: userInfo.interest
        })
      });

      const result = await response.json();
      
      if (result.success) {
        inputDiv.innerHTML = `
          <div style="color: #10b981; font-size: 13px; padding: 8px;">
            ✅ ${action === 'call' ? 'Call queued' : 'SMS sent'}! You should receive it shortly.
          </div>
        `;
      } else {
        inputDiv.innerHTML = `
          <div style="color: #ef4444; font-size: 13px; padding: 8px;">
            ❌ Error: ${result.error || 'Failed to send'}
          </div>
        `;
      }
    } catch (err) {
      inputDiv.innerHTML = `
        <div style="color: #ef4444; font-size: 13px; padding: 8px;">
          ❌ Network error. Please try again.
        </div>
      `;
    }
  };

  phoneInput.onkeydown = (e) => { if (e.key === 'Enter') confirmBtn.click(); };
}

function isValidPhone(phone) {
  return /^\+?[1-9]\d{1,14}$/.test(phone.replace(/\D/g, ''));
}

// Export for use in each project's chatbot
window.TwilioIntegration = {
  addButtons: addTwilioButtons,
  handleAction: handleTwilioAction,
  setApiBase: (url) => { TWILIO_API_BASE = url; }
};