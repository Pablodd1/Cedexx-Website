# AI Front Desk / Virtual Receptionist Test Plan

## Overview
Cedexx AI Virtual Receptionist ("Cedex") is an AI-powered front desk agent that helps users with general inquiries via text chat and voice interaction.

## Features Implemented

### 1. Text Chat Mode
- [x] Opens via SupportHub menu → "Text / Chat"
- [x] Displays initial welcome message
- [x] Auto-greeting after 5 seconds of opening (new conversations)
- [x] Callback offer after 60 seconds of inactivity
- [x] Voice input button (microphone icon)
- [x] Text input with Enter key submission
- [x] Message display with user/bot distinction
- [x] Speaking indicator when TTS is active
- [x] Voice enable/disable toggle

### 2. Voice Mode
- [x] Opens via SupportHub menu → "Voice call"
- [x] Real-time speech-to-text input
- [x] Text-to-speech (TTS) for responses
- [x] Visual feedback during listening/processing

### 3. API & Fallbacks
- [x] Primary API: Kimi (fast)
- [x] Fallback: MiniMax → OpenAI → Gemini
- [x] Offline fallback responses for common queries

### 4. UI/UX
- [x] SupportHub menu with 4 options (Chat, Voice, Email, Call)
- [x] Only one mode active at a time (no overlap)
- [x] Proper z-index positioning
- [x] Minimize/close functionality

## Manual Test Cases

### Test Case 1: Open Chat & Auto-Greeting
1. Open website
2. Click SupportHub button (bottom-right)
3. Select "Text / Chat"
4. Wait 5 seconds → verify greeting plays automatically

### Test Case 2: Send Text Message
1. Type "Hello" in input
2. Press Enter or click Send
3. Verify message appears in chat
4. Verify response received and TTS plays

### Test Case 3: Voice Input
1. Click microphone button
2. Speak a question clearly
3. Verify speech is converted to text
4. Verify auto-send and response received

### Test Case 4: Voice Mode
1. Open SupportHub → "Voice call"
2. Speak a question
3. Verify Cedex responds via TTS

### Test Case 5: API Fallback
1. Ensure API keys may not be configured
2. Send a message
3. Verify fallback response appears (not error)

### Test Case 6: Callback Offer
1. Open chat
2. Wait 60 seconds without activity
3. Verify callback offer message appears

### Test Case 7: No Overlap
1. Open SupportHub
2. Select "Text / Chat"
3. Switch to "Voice call"
4. Verify only one mode displays at a time

## Known Browser Limitations
- Speech-to-text requires user interaction first (click to unlock)
- TTS voice loading may have race conditions (handled)
- Safari: limited voice support
- Mobile: test both text and voice modes

## Deployment Checklist
- [ ] Deploy to Vercel/production
- [ ] Set environment variables: KIMI_API_KEY, MINIMAX_API_KEY, OPENAI_API_KEY, GEMINI_API_KEY
- [ ] Test on Chrome (recommended)
- [ ] Test on mobile devices
- [ ] Verify voice mode works

## Troubleshooting
- **No response**: Check API keys configured
- **Voice not working**: Click anywhere on page first (browser security)
- **TTS not playing**: Check browser supports speech synthesis