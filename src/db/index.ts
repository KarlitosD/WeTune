import { createRxDatabase, addRxPlugin  } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { RxDBUpdatePlugin } from 'rxdb/plugins/update';

import { songSchema, playlistSchema } from './schema';

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

const playlistHistory = await db.playlist.findOne({ selector: { id: "history" } }).exec()
if(playlistHistory == null){
    await db.playlist.insert({ id: "history", title: "Recents", songs: [] })
}