import { Collection } from "@signaldb/core"
import createIndexedDBAdapter from '@signaldb/indexeddb';
import solidReactivityAdapter from '@signaldb/solid';
import { Playlist } from './schema';
import { PLAYLISTS } from '~/consts';

export const playlistCollection = new Collection<Playlist>({
  reactivity: solidReactivityAdapter,
  persistence: createIndexedDBAdapter("playlist")
});

await new Promise(res => playlistCollection.on("persistence.init", () => res(null)))

if(playlistCollection.find({}, { reactive: false }).fetch().length === 0){
    playlistCollection.insert({ id: PLAYLISTS.HISTORY, title: "Recents", songs: [] })
}

export const db = {
    playlist: playlistCollection
}