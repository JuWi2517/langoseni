"use client";

import { useEffect, useMemo, useState } from "react";
import ConfigBanner from "@/app/components/ConfigBanner";
import { subscribeDoneOrders } from "@/lib/db";
import { money } from "@/lib/format";
import type { Order } from "@/lib/types";

interface ProductStat {
  name: string;
  count: number;
  revenue: number;
}

export default function StatsPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => subscribeDoneOrders(setOrders), []);

  const { totalRevenue, itemsSold, perProduct } = useMemo(() => {
    const byProduct = new Map<string, ProductStat>();
    let revenue = 0;
    let items = 0;

    for (const order of orders) {
      for (const line of order.lines) {
        revenue += line.price;
        items += 1;
        const existing = byProduct.get(line.name) ?? {
          name: line.name,
          count: 0,
          revenue: 0,
        };
        existing.count += 1;
        existing.revenue += line.price;
        byProduct.set(line.name, existing);
      }
    }

    return {
      totalRevenue: revenue,
      itemsSold: items,
      perProduct: [...byProduct.values()].sort((a, b) => b.count - a.count),
    };
  }, [orders]);

  return (
    <div className="flex flex-col gap-8">
      <ConfigBanner />
      <h1 className="text-3xl font-bold tracking-tight">Statistiky</h1>
      <p className="-mt-4 text-sm text-zinc-500">
        Na základě {orders.length}{" "}
        {orders.length === 1 ? "dokončené objednávky" : "dokončených objednávek"}.
      </p>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Tržby" value={money(totalRevenue)} />
        <StatCard label="Prodáno položek" value={String(itemsSold)} />
        <StatCard label="Dokončené objednávky" value={String(orders.length)} />
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Podle produktu</h2>
        {perProduct.length === 0 ? (
          <p className="text-sm text-zinc-500">
            Zatím nic prodáno. Dokončené objednávky se zobrazí zde.
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-sm">
              <thead className="bg-zinc-100 text-left text-zinc-500 dark:bg-zinc-800">
                <tr>
                  <th className="px-4 py-2 font-medium">Produkt</th>
                  <th className="px-4 py-2 text-right font-medium">Prodáno</th>
                  <th className="px-4 py-2 text-right font-medium">Tržby</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {perProduct.map((p) => (
                  <tr key={p.name} className="bg-white dark:bg-zinc-900">
                    <td className="px-4 py-2 font-medium">{p.name}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{p.count}</td>
                    <td className="px-4 py-2 text-right tabular-nums">
                      {money(p.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="text-sm text-zinc-500">{label}</div>
      <div className="mt-1 text-3xl font-bold tabular-nums">{value}</div>
    </div>
  );
}
