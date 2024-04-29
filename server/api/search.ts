import { Innertube } from "youtubei.js"
import { Song } from "~/db/schema"

export default async function handler(request: Request){
    try {
        if(request.method !== "GET") return
        const innertube = await Innertube.create()

        const { searchParams } = new URL(request.url)
        const query = searchParams.get("query")

        if(!query) return Response.json([])     

        const items = await innertube.music.search(query, { type: "song" })
        const songs = formatSongsSearched(items.contents[0].contents);

        return Response.json(songs)
    } catch (error) {
        console.log(error)
        return Response.json({ error: error.message }, {
            status: 400
        })
    }
}


function formatSongsSearched(items: any): Song[] {
    return items.slice(0, 15).map(song => {
            return {
                youtubeId: song.id,
                title: song.title,
                type: "song",
                album: {
                    name: song.album.name,
                    id: song.album.id
                },
                thumbnailUrl: `https://i.ytimg.com/vi/${song.id}/mqdefault.jpg`,
                duration: song.duration.seconds,
                author: {
                    name: song.artists?.[0]?.name,
                    id: song.artists?.[0]?.channel_id ?? ""
                }
            } as Song
        })
}