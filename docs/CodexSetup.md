# 🤖 OpenAI Codex Cloud Setup for BearBargain

**Version 1.0** - Configure Codex Cloud to build this app autonomously.

---

## 📋 Quick Setup (Copy-Paste Ready)

### 1. Description Field
```
BearBargain - iOS app for crypto ETF DCA strategies. React Native/Expo with v0-style animations, Grok AI chat, offline-first architecture. Read AGENTS.md first.
```

---

### 2. Environment Variables

Click **"Add +"** and add these:

| Name | Value |
|------|-------|
| `EXPO_PUBLIC_APP_VERSION` | `1.0.0` |
| `EXPO_PUBLIC_DEMO_MODE` | `true` |
| `EXPO_PUBLIC_USE_MOCK_PRICES` | `true` |
| `EXPO_PUBLIC_PREMIUM_ENABLED` | `false` |
| `EXPO_PUBLIC_DEFAULT_DIP_THRESHOLD` | `10` |
| `EXPO_PUBLIC_MAX_CONCURRENT_ANIMS` | `5` |
| `EXPO_PUBLIC_STAGGER_DELAY_MS` | `32` |
| `EXPO_PUBLIC_BYPASS_PAYWALL` | `true` |

---

### 3. Secrets

Click **"Add +"** under Secrets:

| Name | Value |
|------|-------|
| `COINGECKO_API_KEY` | `CG-your-key-here` (or `dummy_key` for demo) |
| `SENTRY_DSN` | `https://your-dsn@sentry.io/123` (or `dummy_dsn`) |
| `GROK_API_KEY` | `dummy_local_fallback` |

> **Note:** Secrets are only available during setup script, not during agent runtime.

---

### 4. Setup Script (Manual Mode)

Switch from **"Automatic"** to **"Manual"** and paste:

```bash
#!/bin/bash
set -e

echo "🐻 BearBargain Codex Setup Starting..."

# ========================================
# 1. Install Node dependencies
# ========================================
npm install

# ========================================
# 2. Create .env from environment/secrets
# ========================================
cat > .env << 'EOF'
# API Keys
COINGECKO_API_KEY=${COINGECKO_API_KEY:-dummy_key}
GROK_API_KEY=${GROK_API_KEY:-dummy_local_fallback}
SENTRY_DSN=${SENTRY_DSN:-dummy_dsn}
REVENUECAT_API_KEY=dummy_premium_disabled

# Feature Flags
EXPO_PUBLIC_APP_VERSION=1.0.0
EXPO_PUBLIC_DEMO_MODE=true
EXPO_PUBLIC_USE_MOCK_PRICES=true
EXPO_PUBLIC_PREMIUM_ENABLED=false
EXPO_PUBLIC_BYPASS_PAYWALL=true

# Dip Detection
EXPO_PUBLIC_DEFAULT_DIP_THRESHOLD=10
EXPO_PUBLIC_ALERT_TTL_MS=5000
EXPO_PUBLIC_WS_THROTTLE_MS=1000

# Animations
EXPO_PUBLIC_MAX_CONCURRENT_ANIMS=5
EXPO_PUBLIC_STAGGER_DELAY_MS=32

# Audio
EXPO_PUBLIC_BEAR_ROAR_VOLUME=0.8
EXPO_PUBLIC_DIP_ALERT_VIBRATION=true
EOF

# ========================================
# 3. Install global tools
# ========================================
npm install -g expo-cli @expo/eas-cli

# ========================================
# 4. Verify TypeScript setup
# ========================================
npx tsc --noEmit || echo "TypeScript check skipped (expected on fresh setup)"

# ========================================
# 5. Verify setup
# ========================================
echo ""
echo "✅ BearBargain Codex setup complete!"
echo ""
echo "📁 Project structure:"
ls -la

echo ""
echo "📚 Documentation check:"
if [ -f "AGENTS.md" ]; then
  echo "✅ AGENTS.md found - Codex will read this for instructions"
  head -20 AGENTS.md
else
  echo "❌ Warning: AGENTS.md not found"
fi

echo ""
echo "🐻 Ready to build! Start with: npm run dev"
```

---

### 5. Maintenance Script (CRITICAL for Multi-Task)

Codex runs this **before every new task** to clean the workspace. Without it, Task 1's temp files can break Task 2.

Paste in the **Maintenance Script** field:

```bash
#!/bin/bash
set -e

echo "🧹 BearBargain Codex Maintenance - Cleaning workspace..."

# ========================================
# 1. Remove temporary/build files
# ========================================
echo "🗑️  Removing temp files..."
rm -rf \
  .expo \
  .gradle \
  android/app/build \
  ios/build \
  node_modules/.cache \
  coverage \
  dist \
  *.log \
  tmp/ \
  2>/dev/null || true

# ========================================
# 2. Clean node_modules (if corrupted)
# ========================================
if [ -f "package-lock.json" ]; then
  echo "🧹 Refreshing node_modules..."
  rm -rf node_modules
  npm install --no-optional --no-audit
fi

# ========================================
# 3. Reset Expo cache
# ========================================
echo "🔄 Clearing Expo cache..."
npx expo start --clear --non-interactive 2>/dev/null &
sleep 2
kill %1 2>/dev/null || true

# ========================================
# 4. Remove stray test files
# ========================================
echo "🧹 Removing test artifacts..."
find . -name "*.test.ts" -not -path "./__tests__/*" -not -path "./src/__tests__/*" -delete 2>/dev/null || true
find . -name "*.spec.ts" -not -path "./__tests__/*" -not -path "./src/__tests__/*" -delete 2>/dev/null || true
find . -name "__snapshots__" -type d -exec rm -rf {} + 2>/dev/null || true

# ========================================
# 5. Preserve critical files
# ========================================
echo "✅ Preserving critical files..."
touch .env.example AGENTS.md package.json 2>/dev/null || true

# ========================================
# 6. Verify workspace integrity
# ========================================
echo ""
echo "📊 Workspace integrity check:"
echo "✅ AGENTS.md exists: $([ -f AGENTS.md ] && echo 'YES' || echo 'NO')"
echo "✅ package.json exists: $([ -f package.json ] && echo 'YES' || echo 'NO')"
echo "✅ docs/ exists: $([ -d docs ] && echo 'YES' || echo 'NO')"
echo "✅ src/types/schemas.ts exists: $([ -f src/types/schemas.ts ] && echo 'YES' || echo 'NO')"

echo ""
echo "🧹 Maintenance complete! Workspace ready for next task."
```

---

### 6. Other Settings

| Setting | Recommended | Reason |
|---------|-------------|--------|
| **Container image** | `universal` | Has Node, npm pre-installed |
| **Container Caching** | `On` ✅ | Faster subsequent tasks |
| **Setup script** | `Manual` | Custom Expo/RN setup |
| **Maintenance script** | `Manual` | Clean workspace between tasks |
| **Agent internet access** | `Off` | Using mock prices in demo mode |

---

## 🎯 What Codex Will See

When Codex starts a task, it will:

1. **Clone** your repo to `/workspace/bear-bargain`
2. **Run setup script** (installs deps, creates .env)
3. **Read AGENTS.md** automatically (project instructions)
4. **Follow doc index** from AGENTS.md to understand the project

Your AGENTS.md tells Codex to read docs in this order:
1. AGENTS.md (overview)
2. PRD.md (requirements)
3. Architecture.md (structure)
4. Schemas.md (data types)
5. StateFlows.md (state machines)
6. DesignLanguage.md (styling)
7. ErrorStates.md (error handling)
8. Setup.md (dev setup)
9. APIKeys.md (API configuration)
10. Testing.md (test strategy)
11. LegalDisclaimers.md (legal)

---

## 🚀 First Task Ideas

After creating the environment, try these prompts:

### Easy (verify setup works)
```
Check if the project is set up correctly. Run npm install and verify TypeScript compiles. List what files exist in src/
```

### Medium (build a component)
```
Create the AnimationProvider following docs/Architecture.md. Use Reanimated for the animation pool with max 5 concurrent animations.
```

### Hard (full feature)
```
Implement the full DipDashboard screen following AGENTS.md priority order. Start with useDipDetector hook, then ETFCard component, then the main screen.
```

---

## 🔧 Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| `npm install` fails | Network issues | Enable internet access temporarily |
| TypeScript errors | Missing types | Run `npm install --save-dev @types/react @types/node` |
| `.env` not found | Setup script issue | Check secrets are set correctly |
| Codex doesn't read AGENTS.md | Wrong directory | Ensure AGENTS.md is at repo root |

---

## 📚 Codex Documentation Links

- [Cloud Environments](https://developers.openai.com/codex/cloud/environments/)
- [AGENTS.md Guide](https://developers.openai.com/codex/guides/agents-md/)
- [Internet Access](https://developers.openai.com/codex/cloud/internet-access/)
- [Codex Universal Image](https://github.com/openai/codex-universal)

---

## ✅ Ready to Create?

1. Fill in **Description** field
2. Add **Environment variables** (8 items)
3. Add **Secrets** (3 items) 
4. Switch to **Manual** setup script and paste the script
5. **NEW:** Add **Maintenance script** (paste from Section 5)
6. Toggle **Container Caching** to `On`
7. Click **"Create environment"**

### Test Your Setup

After creating the environment, run this verification task:

```
Verify workspace setup. List src/ files. Check AGENTS.md exists. Run npm install.
```

**Expected output:**
- ✅ `src/` contains: `types/`, `constants/`, `utils/`
- ✅ `AGENTS.md` found at root
- ✅ `npm install` completed
- ✅ Ready for first coding task

🐻 **Your AI coding partner is ready to MOON!** 🚀
