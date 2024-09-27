import type { PlaylistVideo } from "youtubei.js/dist/src/parser/nodes"
import type { ObservedArray } from "youtubei.js/dist/src/parser/helpers"
import type { ItemSection, MusicCardShelf, MusicResponsiveListItem, MusicShelf } from "youtubei.js/dist/src/parser/nodes"
import type { Song } from "~/db/schema"

import { Innertube, Log } from "youtubei.js"
import { parseFromPlaylistVideo, parseFromVideoInfo, parseSongFromYTNodeLike } from "../parsers/youtube"
import { getStore } from "@netlify/blobs"

const innertube = await Innertube.create()

export async function getPlaylist(listId: string){
    if(!listId) throw new Error("List not found")

    const playlistRawData = await innertube.getPlaylist(listId)
    const items = playlistRawData.items as PlaylistVideo[]

    const playlist = {
        id: listId,
        title: playlistRawData.info.title,
        songs: items.map(parseFromPlaylistVideo).filter(Boolean)
    }

    return playlist
}

export async function getSong(songId: string){
    if(!songId) throw new Error("Song not found")
    const store = getStore("help")
    // Log.setLevel(Log.Level.NONE)
    const songRawData = await innertube.getInfo(songId, "YTMUSIC")
    await store.set(songId, JSON.stringify(songRawData, null, 2))
    // console.log(songRawData.basic_info)
    const song = parseFromVideoInfo(songRawData)

    return song
}

export async function searchSongs(query: string){
    if(!query) throw new Error("Query is required")

    const [itemsSongs, itemsVideos] = await Promise.all([
        innertube.music.search(query, { type: "song" }),
        innertube.music.search(query, { type: "video" })
    ])

    const songs = formatSongsSearched(itemsSongs.contents).filter(Boolean);
    const videos = formatSongsSearched(itemsVideos.contents).filter(Boolean);

    return { songs, videos }
}

function formatSongsSearched(content: ObservedArray<MusicShelf | MusicCardShelf | ItemSection>): Song[]{ 
    const indexContent = content.findIndex(item => item.type !== "ItemSection") 
    const items = content[indexContent]?.contents as MusicResponsiveListItem[] ?? [] 

    return items.filter(item => item?.id).slice(0, 10).map(item => parseSongFromYTNodeLike(item))
}