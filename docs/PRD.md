# BearBargain: Product Requirements Document (PRD)

## 1. Overview
### 1.1 Product Summary
BearBargain is a mobile-first iOS app designed as a companion tool for Charles Schwab users investing in cryptocurrency through ETFs. It empowers users to implement a "buy low, sell high" strategy with minimal stress, focusing on dollar-cost averaging (DCA) during market dips, long-term holding (HODL), and AI-assisted insights. The app transforms volatile crypto exposure into an engaging, educational experience—think of it as a "dip-hunting bear" that sniffs out bargains in BTC, ETH, and thematic ETFs like IBIT, ETHA, and STCE.

Inspired by the v0 iOS app's chatty AI and fluid animations, BearBargain prioritizes delight: Staggered fades for alerts, springy bounces on trades, and a voice-enabled "Trade Whisperer" chat that feels like texting a savvy advisor. No direct Schwab trading (due to API limits)—instead, it simulates strategies, queues actions, and deep-links to Schwab for execution. Future-proofed for Schwab's upcoming crypto integrations (e.g., spot BTC ETF and direct trading by mid-2026).

### 1.2 Version History
- **v1.0 (MVP)**: Core dashboard, AI chat, DCA alerts, portfolio tracking. Target launch: Q1 2026.
- **Future Iterations**: Android support, full Schwab API integration, premium features (e.g., advanced simulations).

### 1.3 Key Inspirations
- **v0 iOS App**: Mimic the streaming chat UX, staggered animations, keyboard-aware flows, and native polish (e.g., liquid-glass blurs, LegendList for scrolls).
- **Crypto Strategy**: DCA + HODL from our discussions—70% BTC ETFs, 20% ETH, 10% thematic; buy on dips (10-15% drops), sell on doubles or rebalances.
- **Branding**: Grizzly bear theme—paws for buttons, claws on charts, roars on sells. Logo: Bear snagging a glowing BTC "salmon" with bargain tags.

## 2. Goals and Objectives
### 2.1 Business Goals
- Empower beginner-to-intermediate Schwab users to engage with crypto ETFs without direct coin custody risks.
- Reduce "annoying" barriers (e.g., like ChatGPT refusals) by providing open, unrestricted strategy tools.
- Build a viral, fun app that encourages long-term investing over gambling—target 10K downloads in first year via App Store and crypto communities.
- Monetization: Free core; premium ($4.99/mo) for AI simulations, custom alerts.

**Review Question (Business & Product #21)**: "10K downloads in first year": What's the acquisition strategy beyond "App Store and crypto communities"? The PRD doesn't mention paid acquisition, influencer partnerships, or content marketing. **Is this a realistic target with zero marketing budget?** (To iterate: Suggest adding a section on marketing channels, e.g., X posts, Reddit AMAs, or App Store Optimization.)

### 2.2 User Goals
- Easily spot and act on "buy low" opportunities (e.g., during dips like recent BTC pullbacks to $90K-100K).
- Simulate "sell high" scenarios without real-money stress.
- Get personalized, non-moralizing advice via AI chat (e.g., "Hold ETHA—upgrades incoming").
- Track portfolio performance with Schwab-friendly imports (CSV, manual entry).

### 2.3 Success Metrics
- **Engagement**: 70% weekly retention; average 5+ sessions/week per user.
- **Conversion**: 20% of users upgrade to premium; 50% execute at least one DCA via deep-links.
- **Feedback**: App Store rating >4.5; NPS >70.
- **Growth**: Organic shares of "win" screenshots; track via analytics (e.g., Firebase).

**Review Question (Business & Product #20)**: Premium Tier: You mention "$4.99/mo for AI simulations" but the MVP already includes AI chat with Grok. **What's the actual paywall boundary?** More tokens? Advanced prompts? Or are simulations separate from chat? (To iterate: Clarify premium as "unlimited simulations + custom AI personas" vs. free "basic chat.")

## 3. Target Audience
- **Primary**: Schwab brokerage users (25-45 years old) new to crypto—tech-savvy but risk-averse, with $500-5K to invest. They use ETFs for simplicity, hate volatility but love "bargain hunting."
- **Secondary**: Crypto enthusiasts frustrated with restrictive tools (e.g., "fuck OpenAI"); educators/hackathon builders wanting a demo app.
- **Persona Example**: "Alex the Dip Hunter"—30-year-old software dev with a Schwab account, invests $100/week in ETFs, checks prices daily but needs nudges to buy lows.

## 4. Features
Prioritized for MVP; grouped by module.

### 4.1 Dip Dashboard (Core Home Screen)
- Live ETF tracking: Real-time prices for IBIT (BTC), ETHA (ETH), STCE (thematic) via public APIs (CoinGecko/Coinbase WebSockets).
- Visuals: Candlestick charts with "dip splash" animations (Reanimated waves on 10%+ drops); bear paw indicators for buy signals.
- Actions: Quick-tap DCA buttons (e.g., "$100 buy now") with deep-link to Schwab app/site.
- Customization: Set dip thresholds (10-30%), portfolio split (default: 70/20/10).

**Review Question (Animation Specifics #10)**: "Dip splash" animation: Your PRD mentions "Reanimated waves on 10%+ drops" but **what triggers the end of the animation?** Price recovery? Time? User dismissal? Animations without clear termination conditions cause memory leaks and battery drain. (To iterate: Define end as "5s timeout or manual dismiss.")

### 4.2 AI Trade Whisperer Chat
- iMessage-style interface: Voice/text input for queries (e.g., "Should I sell 20% ETHA?").
- Responses: Streamed advice with staggered fades (e.g., "Based on macro yields... hold for rebound"). Uses Grok API or similar for unrestricted, edgy insights—no disclaimers beyond basics.
- Features: Simulate HODL scenarios ("What if BTC hits $150K?"); parse voice for actions (Expo Speech).
- Guardrails: Always simulate (testnet/offline); flag risks without lecturing.

**Review Question (Chat UX #4)**: Blank Size Problem: v0 spent "dozens of hours" solving the problem of making new messages scroll to the TOP of the screen (not bottom). Your PRD mentions "iMessage-style interface" but doesn't address this. **Will new user messages anchor to the top, middle, or bottom of the viewport?** If top, you'll need `contentInset` manipulation. (To iterate: Specify top-anchoring with contentInset.)

**Review Question (AI Integration #17)**: Voice Input: You mention "Expo Speech" but **is this STT (speech-to-text) or TTS (text-to-speech)?** Both? The PRD says "voice-enabled Trade Whisperer" but doesn't specify the full audio pipeline. (To iterate: Confirm STT for input, TTS for responses.)

**Review Question (AI Integration #18)**: Response Chunking: Your AGENTS.md shows Trade Whisperer outputs 6 chunks for stagger animation. **But what if the AI returns 3 chunks? Or 12?** Is the UI flexible or hardcoded to 6? (To iterate: Make UI flexible with dynamic chunking.)

### 4.3 Portfolio Tracker & Simulations
- Import: Manual entry or local sim data import; auto-parse positions.
- Views: Pie chart of holdings; line graphs with animated "growth arcs" (Reanimated morphs).
- Simulations: "What-if" tool for sells (e.g., take 20-30% profits on doubles); offline queue for trades.
- History: Virtualized list of past DCAs/sims with confetti on "wins."

**Review Question (API & Data #15)**: Schwab CSV Import: You say "auto-parse positions" but Schwab CSVs have changed format multiple times. **Do you have a Zod schema that handles format versioning?** Or a fallback to manual column mapping? (To iterate: Add Zod schema with versioning.)

### 4.4 Alerts & HODL Guardrails
- Push notifications: "IBIT dipped 15%—DCA alert!" (Expo Push; custom sounds like bear growls).
- In-app: Bottom sheets with liquid-glass blurs for confirms; swipe gestures for HODL/dismiss.
- Rules: Auto-rebalance suggestions (e.g., trim if BTC >80%); stop-loss optional at 20-30% down.

### 4.5 Onboarding & Sharing
- Flow: Quick setup—link Schwab (manual), set stake (5-10% portfolio), choose split.
- Education: Tooltips on strategy (DCA beats timing 70% of time); links to Schwab resources.
- Sharing: Export "My BearBargain Win" as image (chart + stats) via native menus.

### 4.6 Additional MVP Polish
- Themes: Dark/light with bear-fur textures (Unistyles).
- Offline Mode: Queue actions, sync on reconnect (Zustand + SQLite).
- Accessibility: VoiceOver support; high-contrast modes.

**Review Question (Testing & Quality #24)**: Accessibility: You mention "VoiceOver support" but **have you tested streaming AI text with VoiceOver?** Rapidly updating text nodes can cause VoiceOver to repeat or skip content. (To iterate: Add testing plan for dynamic content.)

## 5. User Flows
### 5.1 Onboarding Flow
1. Splash screen: Bear logo fade-in.
2. Welcome: Voice/text intro—"Ready to hunt dips?"
3. Setup: Import Schwab CSV → Set budget/thresholds → First sim.
4. Home: Dashboard loads with staggered ETF cards.

### 5.2 Core Usage Flow (DCA on Dip)
1. Open app: See live dashboard; dip detected → Alert fades in.
2. Tap alert: AI chat opens—"Snag $100 IBIT? Projected gains..."
3. Confirm: Simulate → Deep-link to Schwab → Log as history.
4. Review: Portfolio updates with spring animation.

**Review Question (Business & Product #19)**: "Deep-link to Schwab": iOS deep-linking requires URL schemes or Universal Links. **Have you verified Schwab's app supports the specific deep-link format you need?** (e.g., `schwab://trade/IBIT`). If not, you'll land on their homepage, not a trade screen. (To iterate: Verify and fallback to web URL.)

### 5.3 Sell High Flow
1. Query chat: "Time to sell ETHA?"
2. Response streams: "Doubled? Take 20% profits."
3. Simulate: Chart arcs up → Confetti on "win."
4. Execute: Queue/share deep-link.

## 6. Technical Requirements
### 6.1 Platform
- iOS 15+ (React Native with Expo for rapid dev; future Android).

**Review Question (Architecture #3)**: The v0 team explicitly chose NOT to share UI/state between web and native. You mention "future Android support" but haven't defined a code-sharing boundary. **What's your "seam" between platform-specific and shared code?** (To iterate: Define shared logic in /core, platform in /ios, /android.)

### 6.2 Tech Stack
- **Framework**: React Native + Expo.
- **Animations**: Reanimated (staggers, springs, shared values); Liquid-Glass for blurs.
- **UI**: LegendList (lists), Zeego (menus), Keyboard Controller (inputs).
- **State/API**: Zustand/Context; Tanstack Query for CoinGecko/Coinbase; Zod for validation.
- **Backend**: Vercel Edge Functions for AI (Grok integration); no user data stored (local-only).
- **Integrations**: Expo modules (Speech, Push, Siri); public crypto APIs (no keys needed for basics).

**Review Question (Animation Specifics #12)**: Liquid Glass: You mention "liquid-glass blurs" but v0 uses `@callstack/liquid-glass` with `LiquidGlassContainerView` for morphing effects. **Is your "liquid glass" aesthetic CSS blur, or true iOS Liquid Glass?** These are very different implementations. (To iterate: Specify true iOS Liquid Glass.)

### 6.3 Performance
- Throttle WebSockets to avoid jitter; virtualize lists; cap animations to 5 concurrent.
- Offline: SQLite for persistence.

### 6.4 Security & Compliance
- No real trades/money handling—simulations only.
- Disclaimers: Inline warnings (e.g., "Not financial advice; crypto volatile").
- Data: Local storage; no cloud sync without consent.

## 7. UI/UX Guidelines
- **Style**: Playful bear motifs—greens/reds for ups/downs; sans-serif fonts for readability.
- **Animations**: Mirror v0—fades (0.3s), springs (bouncy taps), staggers (streaming text).
- **Accessibility**: ARIA labels; color contrasts >4.5:1.
- **Tone**: Edgy, fun—no moralizing. Responses like "Hell yeah, dip time!" but with risk notes.

**Review Question (Brand & Tone #25)**: Bear Theme Coherence: You list many bear metaphors (paws, claws, roars, salmon) but **is there a design language document?** Without one, you'll get inconsistent interpretations from different developers/designers. (To iterate: Add a DesignLanguage.md file.)

**Review Question (Brand & Tone #26)**: "Edgy, fun—no moralizing": This tone conflicts with required legal disclaimers. **How do you reconcile "Hell yeah, dip time!" with "Not financial advice"?** The juxtaposition could feel jarring or undermine trust. (To iterate: Style disclaimers as "Bear Growl Warnings" in fun font.)

## 8. Risks & Challenges
- **Schwab Limits**: No API—rely on CSV/deeplinks; mitigate with seamless imports.
- **API Reliability**: Crypto feeds flaky—fallback to cached data; error handling with friendly bears ("Market hibernating—try later").
- **AI Accuracy**: Hallucinations possible—enforce schemas; user feedback loop.
- **Battery/Perf**: Animations drain—optimize with eviction pools; test on older devices.
- **Legal**: Emphasize educational/sim only; consult lawyer for disclaimers.
- **Scope Creep**: Stick to MVP—defer full trading until Schwab APIs drop.

**Review Question (Missing Spec #Error UI)**: Error UI for API failures (v0 mentions "friendly bears" but your spec doesn't define error states). (To iterate: Add error states like "Bear Nap" modal for offline.)

**Review Question (API & Data #13)**: Offline Queue: You say "Queue actions, sync on reconnect" but **what's the conflict resolution strategy?** If a user queues a DCA alert while offline and price moves 20% before reconnect, do you: Execute the stale action? Re-evaluate the trigger condition? Prompt the user? (To iterate: Specify re-evaluation + prompt.)

## 9. Next Steps & Iteration
- **Prototype**: Build MVP in Expo Go (2-4 weeks)—start with useDipDetector hook.
- **Testing**: Beta with 10 users; iterate on feedback (e.g., more bear sounds?).
- **Launch**: App Store submission; promo via X/crypto forums.
- **Your Input**: Read this, then hit me with changes—e.g., add Flutter? Tweak features? Let's refine! 🚀

**Review Question (Testing & Quality #22)**: "Beta with 10 users": How are you recruiting them? Your spec doesn't mention TestFlight distribution, feedback collection tools (Instabug? Intercom?), or crash reporting beyond "Sentry DSN." (To iterate: Add TestFlight + Firebase Analytics.)

**Review Question (Testing & Quality #23)**: Animation Performance: You mention "test on older devices" but **what's the minimum device target?** iPhone 8? iPhone X? A 5-year-old device may not handle 5 concurrent Reanimated animations at 60fps. (To iterate: Set min iPhone 11.)
