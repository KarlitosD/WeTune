import { Collection, createLocalStorageAdapter, createReactivityAdapter } from 'signaldb';
import { createSignal, onCleanup } from 'solid-js';
import { Playlist } from './schema';
import { PLAYLISTS } from '~/consts';

const solidReactivityAdapter = createReactivityAdapter({
  create: () => {
    const [depend, rerun] = createSignal(0, { equals: false });
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

export const playlistCollection = new Collection<Playlist>({
  reactivity: solidReactivityAdapter,
  persistence: createLocalStorageAdapter("playlist")
});

await new Promise(res => playlistCollection.on("persistence.init", () => res(null)))

if(playlistCollection.find({}).fetch().length === 0){
    playlistCollection.insert({ id: PLAYLISTS.HISTORY, title: "Recents", songs: [] })
}

export const db = {
    playlist: playlistCollection
}