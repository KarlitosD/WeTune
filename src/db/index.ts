import { Collection, createLocalStorageAdapter } from 'signaldb';
import solidReactivityAdapter from 'signaldb-plugin-solid';
import { Playlist } from './schema';
import { PLAYLISTS } from '~/consts';

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