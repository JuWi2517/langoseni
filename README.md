# Langoš — Ordering & Kitchen Display

A small Next.js 16 app for taking food orders out front and showing them live in
the kitchen, backed by Firebase (Firestore).

## Pages

- **`/order`** — Build your menu (name, ingredients, price) and place orders.
  Per line you can remove ingredients (e.g. "no cheese") and add a note.
- **`/kitchen`** — Live tickets with a timer that starts when the order arrives.
  Oldest-waiting orders are at the top; colour escalates after 5 and 10 minutes.
  Tap **✓ Done** to clear a ticket.
- **`/stats`** — Revenue, items sold, orders completed, and a per-product
  breakdown. Counts every completed (done) order.

Orders sync in real time across all open pages via Firestore listeners.

## Setup

1. Create a Firebase project and a **Firestore database** (test mode is fine to
   start) at <https://console.firebase.google.com>.
2. In **Project settings → General → Your apps**, register a Web app and copy
   the config values.
3. Copy the env template and fill it in:

   ```bash
   cp .env.local.example .env.local
   # then edit .env.local with your Firebase values
   ```

4. Install and run:

   ```bash
   npm install
   npm run dev
   ```

   Open <http://localhost:3000>.

## Data model (Firestore)

- **`menu`** collection — `{ name, ingredients: string[], price: number }`
- **`orders`** collection — `{ lines, total, status: "pending" | "done",
  createdAt, doneAt }` where each line is
  `{ menuItemId, name, price, removedIngredients: string[], note }`

No composite indexes are required — queries use a single filter and sort in the
client.

## Deploying to GitHub Pages

The app is exported as a static site (`output: "export"`) and published by the
workflow in `.github/workflows/deploy.yml`. One-time setup:

1. **Push the repo to GitHub** (the workflow runs on every push to `main`).
2. **Enable Pages:** repo **Settings → Pages → Build and deployment → Source →
   "GitHub Actions"**.
3. **Add your Firebase config** under **Settings → Secrets and variables →
   Actions → New repository secret**, one per value (the same names as in
   `.env.local.example`):
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`

   (These end up in the public client bundle anyway — that's normal for Firebase
   web apps. Security is enforced by Firestore rules, not by hiding the config.)
4. Push to `main`. The **Actions** tab shows the build; when it finishes, the
   site is live at `https://<your-user>.github.io/<repo>/`.

The base path (`/<repo>/`) is detected automatically by `actions/configure-pages`
and passed to the build, so you don't need to hardcode the repo name. A
user/organization page (`<user>.github.io`) gets an empty base path
automatically.

## Notes

- Currency formatting lives in `lib/format.ts` — change `LOCALE`/`CURRENCY`
  there to switch from USD.
- There's no authentication; lock down Firestore security rules before any real
  deployment.
