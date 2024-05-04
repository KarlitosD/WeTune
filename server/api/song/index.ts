import { Innertube } from "youtubei.js"
import { parseFromVideoInfo } from "../../parsers/youtube"


export default async function handler(req: Request){
    if(req.method !== "GET") return 
    const { searchParams } = new URL(req.url)
    const songId = searchParams.get("songId")

    if(!songId) return Response.json({}, { status: 404, statusText: "Song not found" })

    const innertube = await Innertube.create({ lang: "es", location: "ES" })

    const songRawData = await innertube.getInfo(songId)
    
    const song = parseFromVideoInfo(songRawData)

    const response = Response.json(song)
    response.headers.set("Cache-Control", "public, max-age=120, s-maxage=120, stale-while-revalidate=60, immutable")
    return response
}
