import { Innertube } from "youtubei.js"
import { Song } from "~/db/schema"


export default async function handler(req: Request){
    if(req.method !== "GET") return 
    const { searchParams } = new URL(req.url)
    const songId = searchParams.get("songId")

    if(!songId) return Response.json({}, { status: 404, statusText: "Song not found" })

    const innertube = await Innertube.create()

    const songRawData = await innertube.music.search(songId, { type: "song" })
    const song = formatSong(songRawData.contents)
    
        
    const response = Response.json(song)
    response.headers.set("Cache-Control", "public, max-age=30, s-maxage=60, stale-while-revalidate=30, immutable") 
    return response
}


function formatSong(content: any): Song {
    const indexContent = content.findIndex(item => item.type !== "ItemSection") 
    const [song] = content[indexContent].contents
    return {
        youtubeId: song.id,
        title: song.title,
        type: "song",
        album: song.album ? {
            name: song.album.name,
            id: song.album.id
        } : null,
        thumbnailUrl: `https://i.ytimg.com/vi/${song.id}/mqdefault.jpg`,
        duration: song.duration.seconds,
        author: {
            name: song.artists?.[0]?.name,
            id: song.artists?.[0]?.channel_id ?? ""
        }
    } as Song
}