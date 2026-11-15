import type { YT, YTNodes } from "youtubei.js";
import type { Song } from "../schema";

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