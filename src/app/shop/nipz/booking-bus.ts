"use client";

type Listener = (itemName: string) => void;

const listeners = new Set<Listener>();

/** Fired when a customer taps "Book this" on a gallery card. */
export function requestBooking(itemName: string) {
  for (const listener of listeners) {
    listener(itemName);
  }
}

export function onBookingRequest(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
