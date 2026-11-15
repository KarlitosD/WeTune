import { defineHandler } from "nitro"
import { getSong } from "../../services/youtube"

export default defineHandler(async (event) => {
    const req = event.req
    if(req.method !== "GET") return
    const { searchParams } = new URL(req.url)
    const songId = searchParams.get("songId")

    if(!songId) return Response.json({ error: "song_unavailable" }, { status: 404, statusText: "Song not found" })
    if(!/^[a-zA-Z0-9_-]{11}$/.test(songId)) return Response.json({ error: "invalid_song" }, { status: 400, statusText: "Invalid songId" })

    try {
        const song = await getSong(songId)
        const response = Response.json(song)
        response.headers.set("Cache-Control", "public, max-age=120, s-maxage=120, stale-while-revalidate=60, immutable")
        return response
    } catch (error) {
        console.error("[song] unavailable", songId, error instanceof Error ? error.message : error)
        return Response.json({ error: "song_unavailable" }, { status: 422, statusText: "Song unavailable" })
    }
})
