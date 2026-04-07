# VentureStack - Setup Guide

Everything you need to go from this code to a live App Store app.

---

## Prerequisites

- **Node.js 18+** — `brew install node` or https://nodejs.org
- **Expo CLI** — `npm install -g expo-cli eas-cli`
- **Apple Developer Account** — $99/yr at https://developer.apple.com
- **Xcode** (for simulator testing) — App Store → Xcode
- **iPhone** (for real device testing)

---

## Step 1: Install Dependencies

```bash
cd VentureStack
npm install
```

---

## Step 2: Supabase Setup

1. Go to https://supabase.com → **New Project**
2. Name it `venturestack`, pick a region, set a DB password
3. Once created, go to **Settings → API** and copy:
   - Project URL → paste into `src/env.ts` as `SUPABASE_URL`
   - `anon` public key → paste as `SUPABASE_ANON_KEY`

4. Go to **SQL Editor** → **New Query**
5. Paste the ENTIRE contents of `supabase/migrations/001_initial_schema.sql`
6. Click **Run** ✅

7. **Storage bucket for receipts:**
   - Go to **Storage** → **New Bucket**
   - Name: `receipts`
   - Public: ✅ Yes
   - Go to **Policies** for that bucket and add:
     - INSERT: `auth.uid()::text = (storage.foldername(name))[1]`
     - SELECT: Allow all (public)

8. **Enable Apple Auth:**
   - Go to **Authentication → Providers → Apple**
   - Toggle ON
   - Follow Supabase docs to add your Apple Service ID and key

---

## Step 3: OpenAI Setup

1. Go to https://platform.openai.com/api-keys
2. Create a new key
3. Paste into `src/env.ts` as `OPENAI_API_KEY`
4. Add a few dollars of credits ($5 is plenty for months of usage)

---

## Step 4: RevenueCat Setup

1. Go to https://app.revenuecat.com → **Create New Project**
2. Add your Apple app (needs your bundle ID: `com.yourname.venturestack`)
3. Get your **Apple API Key** → paste into `src/env.ts` as `REVENUECAT_API_KEY`

4. **In App Store Connect:**
   - Create 2 auto-renewable subscriptions:
     - `venturestack_monthly` — $7.99/mo
     - `venturestack_annual` — $59.99/yr
   - Group them in a subscription group called "VentureStack Pro"

5. **In RevenueCat:**
   - Create Products matching those subscription IDs
   - Create an Entitlement called `pro`
   - Create an Offering called `default` with Monthly and Annual packages
   - Map the products to the packages

---

## Step 5: Configure Your App

Edit `app.json`:
```json
"ios": {
  "bundleIdentifier": "com.YOURNAME.venturestack"
}
```

Edit `src/env.ts` with all your keys (already done if you followed steps above).

---

## Step 6: Test on Simulator

```bash
npx expo start --ios
```

This opens the app in iOS Simulator. Test:
- ✅ Auth flow (use email for simulator, Apple Sign In on device)
- ✅ Add a venture
- ✅ Add transactions
- ✅ Dashboard shows P&L
- ✅ Timer start/stop
- ✅ Tax center calculations

---

## Step 7: Test on Physical Device

```bash
npx expo start
```

Scan the QR code with Expo Go on your iPhone. Note: Apple Sign In
and RevenueCat won't work in Expo Go — you need a dev build for that:

```bash
npx eas build --profile development --platform ios
```

Install the resulting build on your device, then:
```bash
npx expo start --dev-client
```

---

## Step 8: Build for App Store

```bash
# Login to EAS
npx eas login

# Configure EAS (first time only)
npx eas build:configure

# Build production binary
npx eas build --platform ios --profile production

# Submit to App Store
npx eas submit --platform ios
```

---

## Step 9: App Store Listing

You'll need these for App Store Connect:
- **App Name:** VentureStack
- **Subtitle:** P&L Dashboard for Multi-Hustlers
- **Keywords:** income tracker, side hustle, profit loss, quarterly tax, self employed, multiple income, venture tracker, gig worker, freelance tax, hustle dashboard
- **Category:** Finance
- **Screenshots:** 6.7" and 6.1" iPhone screenshots (build the app and take them)
- **Description:**

```
See which of your ventures actually makes money.

VentureStack is the P&L dashboard built for people juggling multiple income streams — whether you're trading, flipping products, freelancing, running a SaaS, or doing wholesale deals.

• VENTURE-LEVEL P&L — Track revenue, expenses, and net profit for each business separately.
• TRUE $/HOUR — Log time per venture and see your real hourly rate. Your card flips might gross $2K/mo, but if you're spending 40 hours, that's $50/hr.
• QUARTERLY TAX ESTIMATES — Aggregates all income streams, calculates SE tax + income tax for all 50 states, and tells you exactly what to set aside.
• AI KILL/SCALE SCORECARD — AI analyzes your ventures and recommends where to double down or cut losses.
• RECEIPT SNAP — Photo receipts, tag to a venture. Export CSV for your accountant.

Free: 2 ventures, full P&L, time tracking.
Pro: Unlimited ventures, tax center, AI scorecard, CSV export.
```

---

## Project Structure

```
VentureStack/
├── App.tsx                    # Entry point
├── app.json                   # Expo config
├── package.json               # Dependencies
├── src/
│   ├── env.ts                 # ← YOUR KEYS GO HERE
│   ├── types/index.ts         # TypeScript types
│   ├── theme/index.ts         # Design system
│   ├── lib/
│   │   ├── supabase.ts        # DB client
│   │   ├── tax-engine.ts      # IRS 2026 tax math
│   │   ├── ai-scorecard.ts    # OpenAI integration
│   │   ├── revenue-cat.ts     # Subscriptions
│   │   └── utils.ts           # Formatters
│   ├── hooks/
│   │   ├── useAuth.ts         # Auth state
│   │   ├── useVentures.ts     # Ventures + P&L
│   │   ├── useTransactions.ts # CRUD transactions
│   │   ├── useTimeLog.ts      # Timer + manual logs
│   │   └── usePro.ts          # Subscription state
│   ├── components/
│   │   ├── VentureCard.tsx     # Dashboard venture card
│   │   ├── TransactionItem.tsx # Transaction row
│   │   ├── StatCard.tsx        # Summary metric card
│   │   └── ScoreCardItem.tsx   # AI score result
│   ├── screens/
│   │   ├── AuthScreen.tsx      # Login / Apple Sign In
│   │   ├── DashboardScreen.tsx # Main hub
│   │   ├── VenturesScreen.tsx  # All transactions list
│   │   ├── VentureDetailScreen.tsx
│   │   ├── AddTransactionScreen.tsx
│   │   ├── AddVentureScreen.tsx
│   │   ├── TimeLogScreen.tsx
│   │   ├── TaxCenterScreen.tsx
│   │   ├── ScorecardScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   └── PaywallScreen.tsx
│   └── navigation/
│       └── AppNavigator.tsx    # Tabs + Stack
└── supabase/
    └── migrations/
        └── 001_initial_schema.sql  # ← RUN THIS IN SUPABASE
```

---

## Troubleshooting

**"Module not found" errors:**
```bash
rm -rf node_modules && npm install
npx expo start --clear
```

**Apple Sign In not working in simulator:**
That's expected. Use email auth for testing, Apple Sign In only works on real devices.

**RevenueCat products not loading:**
Make sure your App Store Connect subscriptions are in "Ready to Submit" state and your RevenueCat products/offerings are configured correctly.

**Supabase RLS errors (row-level security):**
If you get permission denied errors, double-check that RLS policies were created correctly in the SQL migration.

---

## What's Next (V2 Ideas)

- Plaid bank linking for auto-import transactions
- Push notifications for quarterly tax deadlines
- Widgets for iOS home screen
- Charts / graphs for P&L trends
- Multi-currency support
- Recurring transaction auto-generation via pg_cron
- Share financial reports as PDF
