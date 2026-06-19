"use client";

import { useEffect, useMemo, useState } from "react";
import ConfigBanner from "@/app/components/ConfigBanner";
import {
  createMenuItem,
  createOrder,
  deleteMenuItem,
  subscribeMenu,
} from "@/lib/db";
import { money } from "@/lib/format";
import type { MenuItem, OrderLine } from "@/lib/types";

// A cart line carries a local uid so React can key it and the guest can have the
// same product twice with different changes.
interface CartLine extends OrderLine {
  uid: string;
}

let uidCounter = 0;
const nextUid = () => `line-${uidCounter++}`;

export default function OrderPage() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartLine[]>([]);

  useEffect(() => subscribeMenu(setMenu), []);

  const total = useMemo(
    () => cart.reduce((sum, l) => sum + l.price, 0),
    [cart]
  );

  // Every ingredient that appears anywhere on the menu — so any of them can be
  // added to any product, even if it isn't a default ingredient.
  const allIngredients = useMemo(() => {
    const set = new Set<string>();
    for (const item of menu) for (const ing of item.ingredients) set.add(ing);
    return [...set].sort((a, b) => a.localeCompare(b, "cs"));
  }, [menu]);

  function addToCart(item: MenuItem) {
    setCart((c) => [
      ...c,
      {
        uid: nextUid(),
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        removedIngredients: [],
        addedIngredients: [],
        note: "",
      },
    ]);
  }

  function updateLine(uid: string, patch: Partial<CartLine>) {
    setCart((c) => c.map((l) => (l.uid === uid ? { ...l, ...patch } : l)));
  }

  function removeLine(uid: string) {
    setCart((c) => c.filter((l) => l.uid !== uid));
  }

  function toggleRemoved(line: CartLine, ingredient: string) {
    const removed = line.removedIngredients.includes(ingredient)
      ? line.removedIngredients.filter((i) => i !== ingredient)
      : [...line.removedIngredients, ingredient];
    updateLine(line.uid, { removedIngredients: removed });
  }

  function toggleAdded(line: CartLine, ingredient: string) {
    const added = line.addedIngredients.includes(ingredient)
      ? line.addedIngredients.filter((i) => i !== ingredient)
      : [...line.addedIngredients, ingredient];
    updateLine(line.uid, { addedIngredients: added });
  }

  async function submitOrder() {
    if (cart.length === 0) return;
    // Drop the local-only `uid` before persisting.
    const lines: OrderLine[] = cart.map((l) => ({
      menuItemId: l.menuItemId,
      name: l.name,
      price: l.price,
      removedIngredients: l.removedIngredients,
      addedIngredients: l.addedIngredients,
      note: l.note,
    }));
    await createOrder(lines);
    setCart([]);
  }

  return (
    <div className="flex flex-col gap-8">
      <ConfigBanner />
      <h1 className="text-3xl font-bold tracking-tight">Přijmout objednávku</h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">

        {/* Right: current order */}
        <section className="lg:sticky lg:top-20 lg:h-fit">
          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-4 text-lg font-semibold">Aktuální objednávka</h2>
            {cart.length === 0 ? (
              <p className="text-sm text-zinc-500">
                Klepnutím na produkt jej přidáte sem.
              </p>
            ) : (
              <ul className="flex flex-col gap-4">
                {cart.map((line) => {
                  const item = menu.find((m) => m.id === line.menuItemId);
                  const base = item?.ingredients ?? [];
                  const addable = allIngredients.filter(
                    (i) => !base.includes(i)
                  );
                  return (
                    <li
                      key={line.uid}
                      className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{line.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{money(line.price)}</span>
                          <button
                            onClick={() => removeLine(line.uid)}
                            className="text-zinc-400 hover:text-red-500"
                            aria-label="Odebrat z objednávky"
                          >
                            ✕
                          </button>
                        </div>
                      </div>

                      {/* Default ingredients: + = included, − = removed */}
                      {base.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {base.map((ing) => {
                            const removed =
                              line.removedIngredients.includes(ing);
                            return (
                              <button
                                key={ing}
                                onClick={() => toggleRemoved(line, ing)}
                                className={`rounded-full px-2.5 py-1 text-xs transition-colors ${
                                  removed
                                    ? "bg-red-100 text-red-700 line-through dark:bg-red-950 dark:text-red-300"
                                    : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                                }`}
                                title={removed ? "Vrátit zpět" : "Odebrat"}
                              >
                                {removed ? `−${ing}` : `+${ing}`}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Extra ingredients the guest can add */}
                      {addable.length > 0 && (
                        <div className="mt-2">
                          <span className="text-xs text-zinc-400">Přidat:</span>
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            {addable.map((ing) => {
                              const added =
                                line.addedIngredients.includes(ing);
                              return (
                                <button
                                  key={ing}
                                  onClick={() => toggleAdded(line, ing)}
                                  className={`rounded-full px-2.5 py-1 text-xs transition-colors ${
                                    added
                                      ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                                      : "border border-dashed border-zinc-300 text-zinc-500 dark:border-zinc-700"
                                  }`}
                                  title={added ? "Odebrat" : "Přidat"}
                                >
                                  {added ? `+${ing}` : ing}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <input
                        value={line.note}
                        onChange={(e) =>
                          updateLine(line.uid, { note: e.target.value })
                        }
                        placeholder="Poznámka (např. extra křupavé)"
                        className="mt-2 w-full rounded-md border border-zinc-200 bg-transparent px-2 py-1 text-sm outline-none focus:border-orange-400 dark:border-zinc-700"
                      />
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="mt-5 flex items-center justify-between border-t border-zinc-200 pt-4 dark:border-zinc-800">
              <span className="text-sm text-zinc-500">Celkem</span>
              <span className="text-xl font-bold">{money(total)}</span>
            </div>
            <button
              onClick={submitOrder}
              disabled={cart.length === 0}
              className="mt-4 w-full rounded-lg bg-orange-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Odeslat do kuchyně
            </button>
          </div>
        </section>

            {/* Left: pick products + manage menu */}
        <div className="flex flex-col gap-8">
          <section>
            <h2 className="mb-3 text-lg font-semibold">Menu</h2>
            {menu.length === 0 ? (
              <p className="text-sm text-zinc-500">
                Zatím žádné produkty. Přidejte níže nějaký a začněte.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {menu.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => addToCart(item)}
                    className="flex flex-col items-start rounded-xl border border-zinc-200 bg-white p-4 text-left transition-colors hover:border-orange-400 hover:bg-orange-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-orange-500 dark:hover:bg-zinc-800"
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="font-medium">{item.name}</span>
                      <span className="font-semibold text-orange-600">
                        {money(item.price)}
                      </span>
                    </div>
                    {item.ingredients.length > 0 && (
                      <span className="mt-1 text-xs text-zinc-500">
                        {item.ingredients.join(", ")}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </section>

          <MenuManager menu={menu} />
        </div>

      </div>
    </div>
  );
}

/* ------------------------- Menu management form ------------------------- */

function MenuManager({ menu }: { menu: MenuItem[] }) {
  const [name, setName] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [price, setPrice] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    const parsedPrice = parseFloat(price);
    if (!trimmedName || Number.isNaN(parsedPrice)) return;

    setSaving(true);
    try {
      await createMenuItem({
        name: trimmedName,
        ingredients: ingredients
          .split(",")
          .map((i) => i.trim())
          .filter(Boolean),
        price: parsedPrice,
      });
      setName("");
      setIngredients("");
      setPrice("");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-xl border border-dashed border-zinc-300 p-5 dark:border-zinc-700">
      <h2 className="mb-1 text-lg font-semibold">Správa menu</h2>
      <p className="mb-4 text-sm text-zinc-500">
        Vytvořte produkt s výchozími ingrediencemi a cenou.
      </p>

      <form onSubmit={handleAdd} className="flex flex-col gap-3">
        <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Název (např. Pizza salám)"
            className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-orange-400 dark:border-zinc-700"
          />
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Cena"
            inputMode="decimal"
            className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-orange-400 dark:border-zinc-700"
          />
        </div>
        <input
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          placeholder="Ingredience oddělené čárkou (např. rajčatová omáčka, sýr, salám)"
          className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-orange-400 dark:border-zinc-700"
        />
        <button
          type="submit"
          disabled={saving}
          className="self-start rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {saving ? "Přidávám…" : "Přidat produkt"}
        </button>
      </form>

      {menu.length > 0 && (
        <ul className="mt-5 divide-y divide-zinc-200 dark:divide-zinc-800">
          {menu.map((item) => (
            <li key={item.id} className="flex items-center justify-between py-2">
              <div className="min-w-0">
                <span className="font-medium">{item.name}</span>
                <span className="ml-2 text-sm text-zinc-500">
                  {money(item.price)}
                </span>
                {item.ingredients.length > 0 && (
                  <p className="truncate text-xs text-zinc-400">
                    {item.ingredients.join(", ")}
                  </p>
                )}
              </div>
              <button
                onClick={() => deleteMenuItem(item.id)}
                className="ml-3 shrink-0 text-sm text-zinc-400 hover:text-red-500"
              >
                Smazat
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
