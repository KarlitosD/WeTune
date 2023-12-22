import { youtube } from "../src/youtube.server.js"
// import type { VercelRequest, VercelResponse } from '@vercel/node';

// type EntryParams = [string, string]

async function getVideosByPlaylistId(playlistId, params){
    const API_URL = "https://youtube.googleapis.com/youtube/v3/playlistItems"
    const API_KEY = process.env.VITE_YOUTUBE_API_KEY
    const headers = { Authorization: API_KEY, Accept: "application/json" }

    const searchRaw = { ...params, part: "snippet", playlistId, key: API_KEY }    
    const searchParams = new URLSearchParams()
    Object.entries(searchRaw).forEach((entry) => searchParams.append(...entry))
    searchParams.append("part", "contentDetails")

    // const endpoint = API_URL + "?" + searchParams.toString()
    const endpoint = `${API_URL}?${searchParams.toString()}`

    const res = await fetch(endpoint, { headers })
    const data = await res.json()
    if(!res.ok) throw data
    
    return data
}

// export default async function handler(req: VercelRequest, res: VercelResponse){
export default async function handler(req, res){
    if(req.method !== "GET") return 
    try {
        const { list: listId } = req.query

        const [data, { items }] = await Promise.all([
            youtube.getPlaylistById(listId, { maxResults: 100 }),
            getVideosByPlaylistId(listId, { maxResults: 100 })
        ]) 

        const musicsMapped = items.map(({ snippet }) => ({
            youtubeId: snippet.resourceId.videoId,
            artists: { name: snippet.videoOwnerChannelTitle, id: snippet.videoOwnerChannelId  },
            title: snippet.title,
            thumbnailUrl: `https://i.ytimg.com/vi/${snippet.resourceId.videoId}/mqdefault.jpg`
        }))
        return res.json({
            id: listId,
            title: data?.items[0]?.snippet?.localized.title,
            songs: musicsMapped
        })
    } catch (error) {
        console.log(error.message)
        return res.status(400).json({ error: error.message })
    }
}