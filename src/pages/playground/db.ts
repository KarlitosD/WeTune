import { Collection } from '@signaldb/core';
import createIndexedDBAdapter from '@signaldb/indexeddb';
import solidReactivityAdapter from '@signaldb/solid';

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
  persistence: createIndexedDBAdapter("items")
});

await new Promise(res => items.on("persistence.init", () => res(null)))