import ytdl from "ytdl-core"
import { buffer } from "node:stream/consumers"

// import type { VercelRequest, VercelResponse } from '@vercel/node';

const YOUTUBE_URL = "https://www.youtube.com/watch?v="

function getAudioStream(songId, quality){

    const stream = ytdl(YOUTUBE_URL + songId, {
        format: "mp3",
        quality: quality + "audio"
    })
    return buffer(stream)
}

// type QueryParams = {
//     quality: string,
//     song: string
// }

const cacheSongs = new Map()

export default async function handler(req, res){
    if(req.method !== "GET") return 

    // const { quality = "highest", song: songId = "lS4NHib1ft4" } = req.query as QueryParams
    const { quality = "highest", song: songId = "lS4NHib1ft4" } = req.query
    
    let audioBuffer

    if(cacheSongs.has(songId)) {
        audioBuffer = cacheSongs.get(songId)
    } else {
        audioBuffer = await getAudioStream(songId, quality)
        cacheSongs.set(songId, audioBuffer)
    }


    res.setHeader("Content-Type", "audio/mpeg")
    res.setHeader("Accept-Ranges", "bytes")
    res.setHeader("Content-Length", audioBuffer.byteLength)
    res.setHeader("cache-control", "max-age=3000000, public")
    res.status(200)

    res.send(audioBuffer)
}
 