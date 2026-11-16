import type { YT, YTNodes } from "youtubei.js";
import { songSchema, type Song } from "../schema";

export function parseSongFromYTNodeLike(item: YTNodes.MusicResponsiveListItem): Song | null {
    if(!item.id) return null

    const basicData = {
        youtubeId: item.id,
        title: item.title,
        duration: item?.duration?.seconds ?? 1,
        thumbnailUrl: `https://i.ytimg.com/vi/${item.id}/mqdefault.jpg`,
    } as Song

    if(item.item_type === "video"){
        return {
            ...basicData,
            type: "video",
            author: {
                name: item.authors?.[0]?.name ?? "",
                id: item.authors?.[0]?.channel_id ?? ""
            }
        }
    }
    if(item.item_type === "song"){
        return {
            ...basicData,
            type: "song",
            album: {
                name: item.album?.name ?? "",
                id: item.album?.id ?? ""
            },
            author: {
                name: item.artists?.[0]?.name ?? "",
                id: item.artists?.[0]?.channel_id ?? ""
            }
        }
    }
    return null
}

export function parseFromVideoInfo(content: YT.VideoInfo): Song {
    const info: Partial<YT.VideoInfo["basic_info"]> = content?.basic_info ?? {}

    const basicData = {
        youtubeId: info.id ?? "",
        title: info.title ?? "",
        thumbnailUrl: `https://i.ytimg.com/vi/${info.id ?? ""}/mqdefault.jpg`,
        duration: info?.duration ?? 0,
    }

    const isMusic = info.category === "Music" && Boolean(info.channel?.name?.includes("Topic"))
    if(isMusic){
        const albumName = info.short_description?.split("\n").filter(Boolean)?.[2] ?? ""
        return {
            ...basicData,
            type: "song",
            author: {
                name: info.channel?.name?.split(" - ")?.[0] ?? "",
                id: info.channel?.id ?? ""
            },
            album: {
                id: "",
                name: albumName
            }
        } as Song
    }

    return {
        ...basicData,
        type: "video",
        author: {
            name: content?.secondary_info?.owner?.author?.name ?? "",
            id: content?.secondary_info?.owner?.author?.id ?? ""
        },
    } as Song
}

export function parseAndValidateSong(content: YT.VideoInfo): Song | null {
    try {
        const song = parseFromVideoInfo(content)
        // songSchema acepta strings vacíos; un basic_info incompleto generaría
        // un Song sin id/título (200 parcial) en vez de caer al siguiente cliente.
        if (!song.youtubeId || !song.title) return null
        return songSchema.safeParse(song).success ? song : null
    } catch {
        return null
    }
}

export function parseFromPlaylistVideo(content: YTNodes.PlaylistVideo): Song {
    return {        
        youtubeId: content.id,
        title: content.title.text ?? "",
        thumbnailUrl: `https://i.ytimg.com/vi/${content.id}/mqdefault.jpg`,
        duration: content.duration?.seconds ?? 1,
        type: "video",
        author: {
            id: content.author?.id ?? "",
            name: content.author?.name ?? ""
        }
    }
}

// YouTube sirve las playlists en dos renderers distintos según el cliente:
// playlistVideoRenderer (PlaylistVideo) y lockupViewModel (LockupView). El
// lockup no expone el channelId del autor, así que se conserva solo el nombre.
export function parseFromLockupView(content: YTNodes.LockupView): Song | null {
    const youtubeId = content.content_id ?? ""
    if (!youtubeId) return null

    const authorName =
        content.metadata?.metadata?.metadata_rows?.[0]?.metadata_parts?.[0]?.text?.toString() ?? ""

    return {
        youtubeId,
        title: content.metadata?.title?.toString() ?? "",
        thumbnailUrl: `https://i.ytimg.com/vi/${youtubeId}/mqdefault.jpg`,
        duration: content.duration?.seconds || 1,
        type: "video",
        author: {
            id: "",
            name: authorName
        }
    }
}