import { type MusicResponsiveListItem } from "youtubei.js/dist/src/parser/nodes";
import { VideoInfo } from "youtubei.js/dist/src/parser/youtube";
import { Song } from "~/db/schema";

export function parseSongFromYTNodeLike(item: MusicResponsiveListItem): Song{
    const basicData = {
        youtubeId: item.id,
        title: item.title,
        duration: item.duration.seconds,
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
                name: item.album?.name,
                id: item.album?.id
            },
            author: {
                name: item.artists?.[0]?.name,
                id: item.artists?.[0]?.channel_id ?? ""
            }
        }
    }
}
