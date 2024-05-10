import { searchSongs } from "../services/youtube"

export default async function handler(request: Request){
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
        console.log(error)
        return Response.json({ error: error.message }, {
            status: 400
        })
    }
}