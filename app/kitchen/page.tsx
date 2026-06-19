"use client";

import { useEffect, useState } from "react";
import ConfigBanner from "@/app/components/ConfigBanner";
import { markOrderDone, subscribePendingOrders } from "@/lib/db";
import { money } from "@/lib/format";
import type { Order } from "@/lib/types";

export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [now, setNow] = useState(() => Date.now());

  // Live order feed (already sorted oldest-first by the query).
  useEffect(() => subscribePendingOrders(setOrders), []);

  // Tick once a second so the timers keep counting up.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <ConfigBanner />
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Kuchyně</h1>
        <span className="text-sm text-zinc-500">{orders.length} čeká</span>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 p-12 text-center text-zinc-500 dark:border-zinc-700">
          Žádné objednávky. 🎉
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => (
            <OrderTicket key={order.id} order={order} now={now} />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderTicket({ order, now }: { order: Order; now: number }) {
  const createdMs = order.createdAt ? order.createdAt.toMillis() : now;
  const elapsedSec = Math.max(0, Math.floor((now - createdMs) / 1000));

  // Escalate colour the longer a ticket waits.
  const urgency =
    elapsedSec >= 600
      ? "border-red-400 bg-red-50 dark:border-red-700 dark:bg-red-950/40"
      : elapsedSec >= 300
      ? "border-amber-400 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/40"
      : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900";

  return (
    <div className={`flex flex-col rounded-xl border p-4 ${urgency}`}>
      <div className="flex items-center justify-between">
        <span className="font-mono text-2xl font-bold tabular-nums">
          {formatElapsed(elapsedSec)}
        </span>
        <span className="text-sm text-zinc-500">{money(order.total)}</span>
      </div>

      <ul className="mt-3 flex flex-1 flex-col gap-2">
        {order.lines.map((line, i) => (
          <li key={i} className="border-t border-zinc-200 pt-2 dark:border-zinc-800">
            <span className="font-medium">{line.name}</span>
            {line.removedIngredients.length > 0 && (
              <div className="text-sm font-medium text-red-600 dark:text-red-400">
                {line.removedIngredients.map((ing) => `−${ing}`).join(", ")}
              </div>
            )}
            {line.addedIngredients?.length > 0 && (
              <div className="text-sm font-medium text-green-600 dark:text-green-400">
                {line.addedIngredients.map((ing) => `+${ing}`).join(", ")}
              </div>
            )}
            {line.note && (
              <div className="text-sm italic text-zinc-600 dark:text-zinc-400">
                “{line.note}”
              </div>
            )}
          </li>
        ))}
      </ul>

      <button
        onClick={() => markOrderDone(order.id)}
        className="mt-4 w-full rounded-lg bg-green-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-green-700"
      >
        ✓ Hotovo
      </button>
    </div>
  );
}

function formatElapsed(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
