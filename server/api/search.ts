import { Innertube } from "youtubei.js"
import { Song } from "~/db/schema"

export default async function handler(request: Request){
    try {
        if(request.method !== "GET") return
        const innertube = await Innertube.create()

        const { searchParams } = new URL(request.url)
        const query = searchParams.get("query")

        if(!query) return Response.json([])     

        const [itemsSongs, itemsVideos] = await Promise.all([
            innertube.music.search(query, { type: "song" }),
            innertube.music.search(query, { type: "video" })
        ])

        const songs = formatSongsSearched(itemsSongs.contents);
        const videos = formatVideoSearched(itemsVideos.contents);

        const response = Response.json({ songs, videos })

        // response.headers.set("Cache-Control", "public, max-age=30, s-maxage=60, stale-while-revalidate=30, immutable") 

        return response
    } catch (error) {
        console.log(error)
        return Response.json({ error: error.message }, {
            status: 400
        })
    }
}


function formatSongsSearched(content: any[]): Song[] {
    const indexContent = content.findIndex(item => item.type !== "ItemSection") 
    const items = content[indexContent].contents

    return items.slice(0, 10).map(song => {
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
        })
}

function formatVideoSearched(content: any[]): Song[] {
    const indexContent = content.findIndex(item => item.type !== "ItemSection") 
    const items = content[indexContent].contents

    return items.slice(0, 10).map(song => {
            return {
                youtubeId: song.id,
                title: song.title,
                type: "video",
                thumbnailUrl: `https://i.ytimg.com/vi/${song.id}/mqdefault.jpg`,
                duration: song.duration.seconds,
                author: {
                    name: song.authors?.[0]?.name ?? "",
                    id: song.authors?.[0]?.channel_id ?? ""
                }
            } as Song
        })
}