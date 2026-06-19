// Firestore data access for menu items and orders.
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import {
  MENU_COLLECTION,
  ORDERS_COLLECTION,
  type MenuItem,
  type Order,
  type OrderLine,
} from "./types";

/* ----------------------------- Menu items ----------------------------- */

// Subscribe to the menu, sorted by name. Returns an unsubscribe function.
export function subscribeMenu(onChange: (items: MenuItem[]) => void) {
  const q = query(collection(db, MENU_COLLECTION), orderBy("name"));
  return onSnapshot(q, (snap) => {
    onChange(
      snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<MenuItem, "id">) }))
    );
  });
}

export function createMenuItem(item: Omit<MenuItem, "id">) {
  return addDoc(collection(db, MENU_COLLECTION), item);
}

export function deleteMenuItem(id: string) {
  return deleteDoc(doc(db, MENU_COLLECTION, id));
}

/* ------------------------------- Orders ------------------------------- */

// Place a new order. Total is computed from the lines so it can't drift.
export function createOrder(lines: OrderLine[]) {
  const total = lines.reduce((sum, l) => sum + l.price, 0);
  return addDoc(collection(db, ORDERS_COLLECTION), {
    lines,
    total,
    status: "pending",
    createdAt: serverTimestamp(),
    doneAt: null,
  });
}

// Subscribe to pending orders, oldest first (longest waiting at the top).
// Sorted client-side so no Firestore composite index is required.
export function subscribePendingOrders(onChange: (orders: Order[]) => void) {
  const q = query(
    collection(db, ORDERS_COLLECTION),
    where("status", "==", "pending")
  );
  return onSnapshot(q, (snap) => {
    const orders = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Order, "id">),
    }));
    orders.sort(
      (a, b) =>
        (a.createdAt?.toMillis() ?? Infinity) -
        (b.createdAt?.toMillis() ?? Infinity)
    );
    onChange(orders);
  });
}

// Subscribe to completed orders (for stats).
export function subscribeDoneOrders(onChange: (orders: Order[]) => void) {
  const q = query(
    collection(db, ORDERS_COLLECTION),
    where("status", "==", "done")
  );
  return onSnapshot(q, (snap) => {
    onChange(
      snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Order, "id">) }))
    );
  });
}

export function markOrderDone(id: string) {
  return updateDoc(doc(db, ORDERS_COLLECTION, id), {
    status: "done",
    doneAt: serverTimestamp(),
  });
}
