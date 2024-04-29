import { getStore } from "@netlify/blobs";
import ytdl from "ytdl-core"
import { blob } from "node:stream/consumers"

const YOUTUBE_URL = "https://www.youtube.com/watch?v="

function getAudioStream(songId: string, quality: string){

    const stream = ytdl(YOUTUBE_URL + songId, {
        quality: quality + "audio"
    })
    return blob(stream)
}


export default async function handler(req: Request){
    const cacheSongs = getStore("songs")

    if(req.method !== "GET") return 

    const { searchParams } = new URL(req.url)

    const quality = searchParams.get("quality") ?? "highest"
    const songId = searchParams.get("song") ?? "lS4NHib1ft4"
    
    // let audioBlob: Blob = await getAudioStream(songId, quality)
    
    let audioBlob: Blob;
    if(await cacheSongs.getMetadata(songId)) {
        console.log("song: cache hit")
        audioBlob = await cacheSongs.get(songId, { type: "blob" })
    } else {
        audioBlob = await getAudioStream(songId, quality)
        console.log("song: cache miss")
        await cacheSongs.set(songId, audioBlob)
    }


    return new Response(audioBlob, {
        status: 200,
        headers: {
            "Content-Type": "audio/mp4",
            "Accept-Ranges": "bytes",
            "Content-Length": String(audioBlob.size),
            "cache-control": "max-age=3000000, public",
        }
    })
}
 