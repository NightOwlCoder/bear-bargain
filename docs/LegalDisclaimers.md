# ⚠️ BearBargain Legal Disclaimers

**Version 1.0** - Placeholder copy. **LAWYER APPROVAL REQUIRED** before App Store submission.

All disclaimers styled as "Bear Growl Warnings" with consistent theming:
- Brown bubble background (`--bear-secondary`)
- Claw border decoration
- 12px caption font (Micro scale)
- Bear paw icon prefix

---

## 📋 Disclaimer Inventory

| Location | Trigger | Style | Dismissable |
|----------|---------|-------|-------------|
| Onboarding | First app launch | Full-screen modal | Must accept |
| Settings Footer | Always visible | Inline text | No |
| Trade Confirm Popup | Every simulation | Header banner | No |
| AI Chat Response | Every response | Inline micro text | No |
| Share Card | Export image | Watermark | No |
| Push Notification | Alert text | Suffix | No |

---

## 1. Core Disclaimer (Onboarding / First Launch)

**Display**: Full-screen modal with "I Understand" button (required to proceed)

```
┌────────────────────────────────────────────┐
│  🐻 BEAR GROWL WARNING 🐾                  │
│                                            │
│  BearBargain is for EDUCATIONAL            │
│  SIMULATIONS ONLY.                         │
│                                            │
│  ❌ NO REAL TRADES happen here             │
│  ❌ NO MONEY is moved or invested          │
│  ❌ NO FINANCIAL ADVICE is provided        │
│                                            │
│  Cryptocurrency and ETFs are volatile.     │
│  You could lose your entire investment.    │
│  Past performance does not predict         │
│  future results.                           │
│                                            │
│  This app is NOT affiliated with Charles   │
│  Schwab or any financial institution.      │
│                                            │
│  By continuing, you confirm:               │
│  • You are 18+ years old                   │
│  • You understand this is simulation only  │
│  • You will not rely on this for           │
│    investment decisions                    │
│                                            │
│  Questions? support@bearbargain.app        │
│                                            │
│  ┌──────────────────────────────────────┐  │
│  │         I UNDERSTAND 🐾              │  │
│  └──────────────────────────────────────┘  │
└────────────────────────────────────────────┘
```

**Implementation**:
```typescript
// components/OnboardingDisclaimer.tsx
const DISCLAIMER_VERSION = '1.0';

const OnboardingDisclaimer = ({ onAccept }: { onAccept: () => void }) => {
  const [hasRead, setHasRead] = useState(false);
  
  // Track scroll to bottom before enabling button
  const handleScroll = (event: NativeScrollEvent) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isAtBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
    if (isAtBottom) setHasRead(true);
  };
  
  const handleAccept = async () => {
    await AsyncStorage.setItem('disclaimer_accepted', DISCLAIMER_VERSION);
    onAccept();
  };
  
  return (
    <Modal visible animationType="fade">
      <ScrollView onScroll={handleScroll} scrollEventThrottle={16}>
        {/* Disclaimer content */}
      </ScrollView>
      <Button 
        disabled={!hasRead}
        onPress={handleAccept}
        title="I UNDERSTAND 🐾"
      />
    </Modal>
  );
};
```

---

## 2. Settings Footer Disclaimer

**Display**: Always visible at bottom of Settings screen

```
────────────────────────────────────────────
🐻 LEGAL STUFF (The Boring But Important Part)

BearBargain provides educational simulations only. 
We do not execute trades, hold funds, or provide 
investment advice. Cryptocurrency and ETF investments 
carry significant risk. Always consult a licensed 
financial advisor before making investment decisions.

Not affiliated with Charles Schwab & Co., Inc.

App Version: 1.0.0 | Privacy Policy | Terms of Service
────────────────────────────────────────────
```

---

## 3. Trade Simulation Disclaimer (Popup Header)

**Display**: Top of every TradeConfirmPopup

```
┌────────────────────────────────────────────┐
│ 🐻 CLAW MARK: SIMULATION MODE ACTIVE       │
│                                            │
│ This is NOT a real trade. Your portfolio   │
│ updates locally for tracking purposes.     │
│ To execute real trades, use Schwab.        │
└────────────────────────────────────────────┘
```

**Additional text below projection**:
```
📊 Projections are estimates based on historical 
patterns and are NOT predictions. Markets can 
move against you. Past dips don't guarantee 
future gains.
```

---

## 4. AI Chat Disclaimer (Inline)

**Display**: Appended as final "chunk" to every AI response (micro font, gray text)

```
────
🐻 TradeWhisperer is AI-powered entertainment, not advice. 
Verify all information. DYOR.
```

**Implementation**:
```typescript
// Always append this as the last chunk
const AI_DISCLAIMER_CHUNK = {
  text: '🐻 TradeWhisperer is AI-powered entertainment, not advice. Verify all information. DYOR.',
  style: 'disclaimer', // Renders in micro font, gray
  isDisclaimer: true,
};

const processAIResponse = (chunks: string[]): DisplayChunk[] => {
  const displayChunks = chunks.map(text => ({ text, style: 'normal' }));
  return [...displayChunks, AI_DISCLAIMER_CHUNK];
};
```

---

## 5. Share Card Watermark

**Display**: Bottom-right of exported "My BearBargain Win" images

```
┌────────────────────────────────────────────┐
│                                            │
│     [USER'S CHART + STATS]                 │
│                                            │
│                                            │
│              SIMULATED RESULTS             │
│          Not actual trading gains          │
│                  🐻                        │
└────────────────────────────────────────────┘
```

**Watermark specs**:
- Font: 10px, semi-transparent white (0.7 opacity)
- Position: Centered at bottom
- Background: Slight dark gradient overlay

---

## 6. Push Notification Suffix

**Display**: Appended to all push notification bodies

```
Alert: "IBIT dipped 15%! 🐻📉"
Full text: "IBIT dipped 15%! 🐻📉 [Sim only]"
```

**Implementation**:
```typescript
// services/notifications.ts
const NOTIFICATION_SUFFIX = ' [Sim only]';

const sendPushNotification = async (title: string, body: string) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body: body + NOTIFICATION_SUFFIX,
    },
    trigger: null, // Immediate
  });
};
```

---

## 7. Privacy Policy Summary

**Full policy at**: `bearbargain.app/privacy`

**In-app summary** (Settings > Privacy):

```
🐻 YOUR DATA STAYS WITH YOU

What we store locally (on your device):
• Portfolio simulations
• Price alert preferences  
• Theme settings
• Chat history

What we DON'T collect:
• Personal financial data
• Real brokerage credentials
• Location data
• Contact information

Third-party services:
• Expo (push notifications) - their privacy policy applies
• RevenueCat (subscriptions) - their privacy policy applies
• CoinGecko (price data) - no user data shared

We cannot access your Schwab account. 
CSV imports are processed locally and never uploaded.

Data deletion: Clear all data in Settings > Reset App
```

---

## 8. Terms of Service Summary

**Full terms at**: `bearbargain.app/terms`

**Key points** (displayed during onboarding):

```
By using BearBargain, you agree:

1. SIMULATION ONLY
   All "trades" are simulations. No real money moves.

2. NO ADVICE
   Nothing in this app constitutes financial advice.

3. YOUR RISK
   Any real investment decisions are solely your 
   responsibility.

4. AGE REQUIREMENT
   You must be 18+ to use this app.

5. NO WARRANTY
   The app is provided "as is" without guarantees 
   of accuracy or availability.

6. LIMITATION OF LIABILITY
   BearBargain is not liable for any losses from 
   investment decisions, simulated or real.

7. CHANGES
   We may update terms. Continued use = acceptance.
```

---

## 9. App Store Description Disclaimer

**Required text for App Store listing**:

```
IMPORTANT: BearBargain is an EDUCATIONAL TOOL for learning 
about dollar-cost averaging and crypto ETF strategies. 

This app:
• Does NOT execute real trades
• Does NOT connect to brokerage accounts
• Does NOT provide financial advice
• Is NOT affiliated with Charles Schwab

All portfolio tracking and simulations are for educational 
purposes only. Cryptocurrency and ETF investments carry 
significant risk. Consult a licensed financial advisor 
before making any investment decisions.

18+ only.
```

---

## 📝 Implementation Checklist

- [ ] Create `OnboardingDisclaimer.tsx` component
- [ ] Add disclaimer version tracking in AsyncStorage
- [ ] Implement Settings footer with legal links
- [ ] Add header banner to `TradeConfirmPopup.tsx`
- [ ] Append disclaimer chunk to all AI responses
- [ ] Add watermark to share image generation
- [ ] Update push notification service with suffix
- [ ] Create `bearbargain.app/privacy` page
- [ ] Create `bearbargain.app/terms` page
- [ ] Write full App Store description
- [ ] **GET LAWYER REVIEW** before launch

---

## 🔄 Update History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-XX-XX | Initial placeholder copy |

**Next review**: Before App Store submission

**Legal contact**: [TBD - Add lawyer contact]
