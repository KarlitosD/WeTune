import { getStore } from "@netlify/blobs";
import { youtubeCookieString } from "../data/cookies";
import { getAudioFormats } from "../services/player";

type Quality = "highest" | "lowest"


async function getAudioBlob(songId: string, quality: Quality) {
    try {
        const audioFormats = await getAudioFormats(songId)

        const format = quality === "lowest" ? audioFormats.at(-1) : audioFormats.at(0)

        try {
            const audioRes = await fetch(format.url, {
                headers: { "range": "bytes=0-", 'Cookie': youtubeCookieString, }
            })
    
            if(!audioRes.ok) return null
    
            const blob = await audioRes.blob()
    
            return blob
        } catch (error) {
            console.log("Error fetching audio", error.message)
            return null
        }
    } catch (e) {
        console.log("Error getting audio format", e.message)
        console.error(e.message)

        return null
    }
}


export default async function handler(req: Request) {
    try {
        const cacheSongs = getStore("songs")

        if (req.method !== "GET") return

        const { searchParams } = new URL(req.url)

        const quality = searchParams.get("quality") as Quality ?? "highest"
        const songId = searchParams.get("songId")

        if (!songId) return new Response("Song not found", { status: 404, statusText: "Song not found" })

        let audioBlob: Blob;
        if (quality === "lowest" && await cacheSongs.getMetadata(songId)) {
            console.log("song: cache hit")
            audioBlob = await cacheSongs.get(songId, { type: "blob" })
        } else {
            console.log("song: cache miss")
            audioBlob = await getAudioBlob(songId, quality)

            if(audioBlob == null) return new Response("Song not found", { status: 404, statusText: "Song not found" })

            if (quality === "lowest") {
                await cacheSongs.set(songId, audioBlob)
            }
        }


        return new Response(audioBlob, {
            status: 200,
            headers: {
                "Content-Type": audioBlob.type,
                "Accept-Ranges": "bytes",
                "Content-Length": String(audioBlob.size),
                "cache-control": "public, max-age=3000000, s-maxage=100000, immutable"
            }
        })
    } catch (e) {
        console.log(e.message)
        return new Response(e.message, { status: 500, statusText: "Internal Server Error" })
    }
}