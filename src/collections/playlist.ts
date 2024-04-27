import type { Playlist } from '~/types/playlist'

import { Collection, createLocalStorageAdapter  } from 'signaldb'


export const playlistCollection = new Collection<Playlist>({
    reactivity: solidReactivityAdapter,
    // persistence: createLocalStorageAdapter("playlist"),
})

// await new Promise(r => playlistCollection.on("persistence.init", () => r(true)))

