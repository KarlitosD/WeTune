import { format } from "path"
import { Innertube } from "youtubei.js"
import { ObservedArray, YTNode } from "youtubei.js/dist/src/parser/helpers"
import { ItemSection, MusicCardShelf, MusicResponsiveListItem, MusicShelf } from "youtubei.js/dist/src/parser/nodes"
import { Song } from "~/db/schema"
import { parseSongFromYTNodeLike } from "../parsers/youtube"

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

        const songs = formatSongsSearchedBeta(itemsSongs.contents);
        const videos = formatSongsSearchedBeta(itemsVideos.contents);

        const response = Response.json({ songs, videos })

        response.headers.set("Cache-Control", "public, max-age=30, s-maxage=60, stale-while-revalidate=30, immutable") 

        return response
    } catch (error) {
        console.log(error)
        return Response.json({ error: error.message }, {
            status: 400
        })
    }
}

function formatSongsSearchedBeta(content: ObservedArray<MusicShelf | MusicCardShelf | ItemSection>): Song[]{ 
    const indexContent = content.findIndex(item => item.type !== "ItemSection") 
    const items = content[indexContent].contents as MusicResponsiveListItem[]

    return items.slice(0, 10).map(parseSongFromYTNodeLike)
}