// Currency used across the app. Change this single constant to suit your locale,
// e.g. ["en-US", "USD"], ["cs-CZ", "CZK"], ["de-DE", "EUR"].
const LOCALE = "cs-CZ";
const CURRENCY = "CZK";

const currencyFmt = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: CURRENCY,
});

export function money(amount: number): string {
  return currencyFmt.format(amount);
}
