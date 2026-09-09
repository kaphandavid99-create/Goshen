import { useSyncExternalStore } from "react";

function subscribe() {
  return () => undefined;
}

export function useHasMounted() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
