import { createRxDatabase, addRxPlugin  } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { RxDBUpdatePlugin } from 'rxdb/plugins/update';

import { songSchema, playlistSchema } from './schema';
import { PLAYLISTS } from '~/consts';

addRxPlugin(RxDBUpdatePlugin);

export const db = await createRxDatabase({ 
  name: 'db',
  storage: getRxStorageDexie(),

});

await db.addCollections({ 
  //@ts-ignore
  song: { schema: songSchema }, 
  //@ts-ignore
  playlist: { schema: playlistSchema }, 
})

const playlistHistory = await db.playlist.findOne({ selector: { id: PLAYLISTS.HISTORY } }).exec()
if(playlistHistory == null){
    await db.playlist.insert({ id: PLAYLISTS.HISTORY, title: "Recents", songs: [] })
}