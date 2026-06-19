import Link from "next/link";

const cards = [
  {
    href: "/order",
    title: "Přijmout objednávku",
    body: "Vytvořte si menu a posílejte objednávky do kuchyně s vlastními úpravami.",
    emoji: "🧾",
  },
  {
    href: "/kitchen",
    title: "Kuchyňský displej",
    body: "Živé objednávky řazené podle doby čekání. Klepněte na objednávku, až je hotová.",
    emoji: "👩‍🍳",
  },
  {
    href: "/stats",
    title: "Statistiky",
    body: "Podívejte se, kolik jste prodali a kolik jste vydělali.",
    emoji: "📊",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Objednávky a kuchyně</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Jednoduchý proces: přijměte objednávky u pultu, uvařte je v kuchyni a spočítejte tržby.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group rounded-xl border border-zinc-200 bg-white p-6 transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="text-3xl">{c.emoji}</div>
            <h2 className="mt-3 text-lg font-semibold group-hover:text-orange-600">
              {c.title}
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{c.body}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
