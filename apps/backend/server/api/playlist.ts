import { defineHandler } from "nitro"
import { getPlaylist } from "../services/youtube"

export default defineHandler(async (event) => {
    const request = event.req
    if(request.method !== "GET") return
    try {
        const { searchParams } = new URL(request.url)
        const listId = searchParams.get("list")

        if(!listId) return Response.json(null, { status: 404, statusText: "List not found" })

        const playlist = await getPlaylist(listId)

        return Response.json(playlist)
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        console.log(message)
        return Response.json({ error: message }, { status: 400 })
    }
})
