import { searchMusics } from "node-youtube-music"

export default async function handler(request: Request){
    try {
        if(request.method !== "GET") return
        const { searchParams } = new URL(request.url)
        const query = searchParams.get("query")

        if(!query) return Response.json([])     
        const items = await searchMusics(query)

        const songs = items.slice(0, 15).map(({ isExplicit, ...item }) => ({
           ...item,
            artists: item.artists[0],
            thumbnailUrl: `https://i.ytimg.com/vi/${item.youtubeId}/mqdefault.jpg`,
            thumbnailFallback: item.thumbnailUrl
        }))
        return Response.json(songs)
    } catch (error) {
        return Response.json({ error: error.message }, {
            status: 400
        })
    }
}