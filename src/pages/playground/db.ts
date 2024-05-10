import { Collection, createLocalStorageAdapter, createReactivityAdapter } from 'signaldb';
import { createSignal, onCleanup } from 'solid-js';

const solidReactivityAdapter = createReactivityAdapter({
  create: () => {
    const [depend, rerun] = createSignal(0);
    return {
      depend: () => {
        depend();
      },
      notify: () => {
        rerun(depend() + 1);
      },
    };
  },
  isInScope: undefined,
  onDispose: (callback) => {
    onCleanup(callback);
  },
});

type Item = { 
    id: string,
    text: string,
    cosasCount: number
    cosas: Array<{
      id: string,
    }>
 }

export const items = new Collection<Item>({
  reactivity: solidReactivityAdapter,
  persistence: createLocalStorageAdapter("items")
});

await new Promise(res => items.on("persistence.init", () => res(null)))