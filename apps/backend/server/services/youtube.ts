import type { Song } from "../schema"

import { Innertube, YTNodes } from "youtubei.js"
import { cookie } from "../data/cookies"
import {
    parseAndValidateSong,
    parseFromLockupView,
    parseFromPlaylistVideo,
    parseSongFromYTNodeLike,
} from "../parsers/youtube"

const innertube = await Innertube.create({ cookie: cookie })

type PlaylistPage = Awaited<ReturnType<typeof innertube.getPlaylist>>

// Un tope alto evita un bucle infinito si YouTube devuelve continuaciones
// inválidas; el máximo real de una playlist (5000) entra de sobra.
const MAX_PLAYLIST_PAGES = 500

export async function getPlaylist(listId: string){
    if(!listId) throw new Error("List not found")

    const firstPage = await innertube.getPlaylist(listId)
    const title = firstPage.info.title
    const songs = parsePlaylistPage(firstPage)

    // El renderer nuevo entrega 22 ítems por página; el clásico, 100.
    // Sin seguir las continuaciones una playlist larga se importa truncada.
    let page = firstPage
    let pageCount = 1
    while (page.has_continuation && pageCount < MAX_PLAYLIST_PAGES) {
        page = await page.getContinuation()
        songs.push(...parsePlaylistPage(page))
        pageCount++
    }

    return {
        id: listId,
        title,
        songs
    }
}

function parsePlaylistPage(page: PlaylistPage): Song[] {
    return page.items
        .map((item) => {
            if (item.is(YTNodes.PlaylistVideo)) return parseFromPlaylistVideo(item)
            if (item.is(YTNodes.LockupView)) return parseFromLockupView(item)
            return null
        })
        .filter((song): song is Song => song !== null)
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