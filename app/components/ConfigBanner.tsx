"use client";

import { isFirebaseConfigured } from "@/lib/firebase";

// Shown on data pages when Firebase env vars are missing, so the app fails loudly
// with instructions instead of throwing a cryptic Firestore error.
export default function ConfigBanner() {
  if (isFirebaseConfigured) return null;
  return (
    <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
      <p className="font-semibold">Firebase ještě není nastavený.</p>
      <p className="mt-1">
        Zkopírujte <code className="font-mono">.env.local.example</code> do{" "}
        <code className="font-mono">.env.local</code>, vyplňte údaje svého Firebase
        projektu a restartujte vývojový server. Do té doby ukládání a načítání dat
        nebude fungovat.
      </p>
    </div>
  );
}
