import { defineHandler } from "nitro"
import Innertube from "youtubei.js"

export default defineHandler(async (event) => {
    const req = event.req
    if(req.method !== "GET") return
    const { searchParams } = new URL(req.url)
    const songId = searchParams.get("songId")

    if(!songId) return Response.json({}, { status: 404, statusText: "Song not found" })

    const innertube = await Innertube.create({ po_token: process.env.PO_TOKEN, visitor_data: process.env.VISITOR_DATA })

    const song = await innertube.getStreamingData(songId, { client: "WEB_CREATOR", type: "audio" })

    const response = Response.json({ song })
    return response
})
