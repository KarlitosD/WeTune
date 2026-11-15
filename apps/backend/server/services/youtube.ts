import type { Song } from "../schema"

import { Innertube } from "youtubei.js"
import type { YTNodes } from "youtubei.js"
import { cookie } from "../data/cookies"
import {
    parseAndValidateSong,
    parseFromPlaylistVideo,
    parseSongFromYTNodeLike,
} from "../parsers/youtube"

const innertube = await Innertube.create({ cookie: cookie })

export async function getPlaylist(listId: string){
    if(!listId) throw new Error("List not found")

    const playlistRawData = await innertube.getPlaylist(listId)
    const items = playlistRawData.items

    const playlist = {
        id: listId,
        title: playlistRawData.info.title,
        songs: items
            .filter((item): item is YTNodes.PlaylistVideo => item.type === "PlaylistVideo")
            .map(parseFromPlaylistVideo)
    }

    return playlist
}

export async function getSong(songId: string){
    if(!songId) throw new Error("Song not found")

    // YTMUSIC suele traer mejores metadatos, pero para algunos IDs devuelve
    // basic_info incompleto (title/id/duration undefined). Validar y caer al
    // cliente por defecto evita responder un Song parcial al cliente móvil.
    let song: Song | null = null
    try {
        song = parseAndValidateSong(await innertube.getInfo(songId))
    } catch {
        song = null
    }
    if (!song) {
        try {
            song = parseAndValidateSong(await innertube.getInfo(songId, { client: "YTMUSIC" }))
        } catch {
            song = null
        }
    }
    if (!song) throw new Error("song_unavailable")

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

function formatSongsSearched(content: Awaited<ReturnType<typeof innertube.music.search>>["contents"]): Song[]{ 
    const items = content ?? []
    const indexContent = items.findIndex(item => item.type !== "ItemSection") 
    const sectionItems = (items[indexContent]?.contents ?? []) as YTNodes.MusicResponsiveListItem[]

    return sectionItems
        .filter(item => item?.id)
        .slice(0, 10)
        .map(item => parseSongFromYTNodeLike(item))
        .filter((song): song is Song => song !== null)
}