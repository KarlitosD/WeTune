import { defineHandler } from "nitro"
import { searchSongs } from "../services/youtube"

export default defineHandler(async (event) => {
    const request = event.req
    try {
        if(request.method !== "GET") return

        const { searchParams } = new URL(request.url)
        const query = searchParams.get("query")

        if(!query) return Response.json([])

        const result = await searchSongs(query)

        const response = Response.json(result)

        response.headers.set("Cache-Control", "public, max-age=30, s-maxage=60, stale-while-revalidate=30, immutable")

        return response
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        console.log(message)
        return Response.json({ error: message }, { status: 400 })
    }
})
