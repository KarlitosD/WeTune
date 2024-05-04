import { Innertube } from "youtubei.js"
import { VideoInfo } from "youtubei.js/dist/src/parser/youtube"
import { Song } from "~/db/schema"


export default async function handler(req: Request){
    if(req.method !== "GET") return 
    const { searchParams } = new URL(req.url)
    const songId = searchParams.get("songId")

    if(!songId) return Response.json({}, { status: 404, statusText: "Song not found" })

    const innertube = await Innertube.create({ lang: "es", location: "ES" })

    const songRawData = await innertube.getInfo(songId)
    
    const isMusic = songRawData.basic_info.category === "Music" && songRawData.basic_info.channel.name.includes("Topic")

    const song = isMusic ? formatFromVideoInfoMusic(songRawData) : formatFromVideoInfo(songRawData)

    const response = Response.json(song)
    response.headers.set("Cache-Control", "public, max-age=120, s-maxage=120, stale-while-revalidate=60, immutable")
    return response
}


function formatFromVideoInfo(content: VideoInfo): Song {
    const info = content.basic_info
    return {
        youtubeId: info.id,
        title: info.title,
        type: "video",
        author: {
            name: content?.secondary_info?.owner?.author?.name,
            id: content?.secondary_info?.owner?.author?.id
        },
        thumbnailUrl: `https://i.ytimg.com/vi/${info.id}/mqdefault.jpg`,
        duration: info?.duration,
        album: undefined
    } as Song
}

function formatFromVideoInfoMusic(content: VideoInfo): Song {
    const info = content.basic_info

    const albumName = info.short_description.split("\n").filter(Boolean)[2].replaceAll("\n", "")

    return {
        youtubeId: info.id,
        title: info.title,
        type: "song",
        author: {
            name: info?.channel?.name?.split(" - ")?.[0],
            id: info?.channel?.id
        },
        thumbnailUrl: `https://i.ytimg.com/vi/${info.id}/mqdefault.jpg`,
        duration: info?.duration,
        album: {
            id: "",
            name: albumName
        },
    }
}