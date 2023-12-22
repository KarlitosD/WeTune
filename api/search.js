// import type { VercelRequest, VercelResponse } from '@vercel/node';
import { searchMusics } from "node-youtube-music"

// export default async function handler(req: VercelRequest, res: VercelResponse){
export default async function handler(req, res){
    try {
        if(req.method !== "GET") return 
        const { query } = req.query

        if(!query) return res.json([])     
        const items = await searchMusics(query)

        const songs = items.slice(0, 15).map(({ isExplicit, ...item }) => ({
           ...item,
            artists: item.artists[0],
            thumbnailUrl: `https://i.ytimg.com/vi/${item.youtubeId}/mqdefault.jpg`,
            thumbnailFallback: item.thumbnailUrl
        }))
        return res.json(songs)
    } catch (error) {
        return res.status(400).json({ error: error.message })
    }
}