// import "@netlify/functions"
// import { getYoutubeClient } from "../lib/youtube"
import { Innertube } from "youtubei.js"
import { parseFromPlaylistVideo } from "../parsers/youtube"
import { PlaylistVideo } from "youtubei.js/dist/src/parser/nodes"


export default async function handler(request: Request){
    if(request.method !== "GET") return 
    try {
        const { searchParams } = new URL(request.url)
        const listId = searchParams.get("list")

        if(!listId) return Response.json(null, { status: 404, statusText: "List not found" })

         const innertube = await Innertube.create()

        const playlistRawData = await innertube.getPlaylist(listId)
        // console.log(playlistRawData.items[0])

        const items = playlistRawData.items as PlaylistVideo[]

        console.log(items.map(parseFromPlaylistVideo)[0])

        return Response.json({
            id: listId,
            title: playlistRawData.info.title,
            songs: items.map(parseFromPlaylistVideo)
        })
    } catch (error) {
        console.log(error.message)
        return Response.json({ error: error.message }, { status: 400 })
    }
}