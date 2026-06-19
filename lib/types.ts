import type { Timestamp } from "firebase/firestore";

// A product the kitchen offers, e.g. "Salami pizza" with its default ingredients.
export interface MenuItem {
  id: string;
  name: string;
  ingredients: string[];
  price: number;
}

// One line in an order — a chosen menu item with the guest's modifications.
export interface OrderLine {
  menuItemId: string;
  name: string;
  price: number;
  removedIngredients: string[]; // default ingredients the guest doesn't want, e.g. "cheese"
  addedIngredients: string[]; // extra ingredients the guest wants, e.g. "sour cream"
  note: string; // free-form request, e.g. "extra crispy"
}

export type OrderStatus = "pending" | "done";

export interface Order {
  id: string;
  lines: OrderLine[];
  total: number;
  status: OrderStatus;
  createdAt: Timestamp | null;
  doneAt: Timestamp | null;
}

// Collection names kept in one place to avoid typos.
export const MENU_COLLECTION = "menu";
export const ORDERS_COLLECTION = "orders";
