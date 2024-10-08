import type { PlaylistVideo } from "youtubei.js/dist/src/parser/nodes"
import type { ObservedArray } from "youtubei.js/dist/src/parser/helpers"
import type { ItemSection, MusicCardShelf, MusicResponsiveListItem, MusicShelf } from "youtubei.js/dist/src/parser/nodes"
import type { Song } from "~/db/schema"

import { Innertube } from "youtubei.js"
import { parseFromPlaylistVideo, parseFromVideoInfo, parseSongFromYTNodeLike } from "../parsers/youtube"
import { youtubeCookieString } from "../data/cookies"

const innertube = await Innertube.create({
    cookie: youtubeCookieString
})

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
    const songRawData = await innertube.getInfo(songId, "YTMUSIC")
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