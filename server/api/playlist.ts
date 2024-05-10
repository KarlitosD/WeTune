import { getPlaylist } from "../services/youtube"


export default async function handler(request: Request){
    if(request.method !== "GET") return 
    try {
        const { searchParams } = new URL(request.url)
        const listId = searchParams.get("list")

        if(!listId) return Response.json(null, { status: 404, statusText: "List not found" })

        const playlist = await getPlaylist(listId)

        return Response.json(playlist)
    } catch (error) {
        console.log(error.message)
        return Response.json({ error: error.message }, { status: 400 })
    }
}