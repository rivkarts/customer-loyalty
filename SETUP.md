# LoyaltyApp — Setup

Everything is now wired to real Supabase data and localized to Nigeria (Naira-style
earning rate, jollof/suya/zobo/puff-puff catalog, member currency in points).

## 1. Create a Supabase project
Go to supabase.com → New project (free tier is fine).

## 2. Run the schema
Supabase Dashboard → SQL Editor → New query → paste the full contents of
`supabase/schema.sql` → Run.
This creates every table, security policy, the auto-profile trigger, and the
`redeem_reward` / `use_voucher` functions, and seeds the rewards catalog.

## 3. Get your API keys
Dashboard → Settings → API → copy the **Project URL** and **anon public key**.

## 4. Configure the app
```
cp .env.example .env
```
Paste your URL and anon key into `.env`.

## 5. Install and run
```
npm install
npm run dev
```

## What's now working
- **Sign up / log in / log out** — real Supabase Auth, protected routes (anyone
  signed out is bounced to `/login`).
- **Settings gear, Personal Information, Payment Methods, Notifications, Privacy &
  Security, Help & Support** — each opens its own real page, backed by its own table.
- **Drinks / Food / Discounts tabs and search** on Rewards — actually filter the list.
- **Redeem / Unlock now / Use today** — call the `redeem_reward` / `use_voucher`
  database functions, which atomically deduct points and log the activity — no more
  static "2,480 pts" everywhere.
- **Bell icon** → a real notifications feed (mark read / mark all read).
- **Avatar pencil** → pick a new photo, saved to your profile.
- **Share / Copy code buttons** in Wallet → native share sheet or clipboard.
- New sign-ups get a 500-point welcome bonus, two starter vouchers, and two
  welcome notifications, via a database trigger.

## Note on Payment Methods
No real card numbers are ever stored — it only saves brand, last 4 digits, and
expiry, same as the "display card" pattern most apps use. Wiring this up to a real
charge processor (e.g. Paystack/Flutterwave) would be the next step if you want
actual payments, not just a saved-card list.
