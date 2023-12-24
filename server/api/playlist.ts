import "@netlify/functions"
import { getYoutubeClient } from "../lib/youtube"

type EntryParams = [string, string]

async function getVideosByPlaylistId(playlistId: string, params: Record<string, string | number>){
    const API_URL = "https://youtube.googleapis.com/youtube/v3/playlistItems"
    const API_KEY = Netlify.env.get("VITE_YOUTUBE_API_KEY")
    const headers = { Authorization: API_KEY, Accept: "application/json" }

    const searchRaw = { ...params, part: "snippet", playlistId, key: API_KEY }    
    const searchParams = new URLSearchParams()
    Object.entries(searchRaw).forEach((entry: EntryParams) => searchParams.append(...entry))
    searchParams.append("part", "contentDetails")

    const endpoint = `${API_URL}?${searchParams.toString()}`

    const res = await fetch(endpoint, { headers })
    const data = await res.json()
    if(!res.ok) throw data
    
    return data
}

export default async function handler(request: Request){
    if(request.method !== "GET") return 
    try {
        const { searchParams } = new URL(request.url)
        const listId = searchParams.get("list")

        const youtube = getYoutubeClient(Netlify.env.get("VITE_YOUTUBE_API_KEY"))
        const [data, { items }] = await Promise.all([
            youtube.getPlaylistById(listId, { maxResults: 5 }),
            getVideosByPlaylistId(listId, { maxResults: 100 })
        ]) 

        const musicsMapped = items.map(({ snippet }) => ({
            youtubeId: snippet.resourceId.videoId,
            artists: { name: snippet.videoOwnerChannelTitle, id: snippet.videoOwnerChannelId  },
            title: snippet.title,
            thumbnailUrl: `https://i.ytimg.com/vi/${snippet.resourceId.videoId}/mqdefault.jpg`
        }))

        return Response.json({
            id: listId,
            title: data?.items[0]?.snippet?.localized.title,
            songs: musicsMapped
        })
    } catch (error) {
        console.log(error.message)
        return Response.json({ error: error.message }, { status: 400 })
    }
}