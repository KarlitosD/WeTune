import { blobToUint8Array, uint8ArrayToBlob } from "undio";
import { downloadYoutubeAudio, type Quality } from "~/services/player";


const getIdItem = (songId: string, quality: Quality) => `song_${songId}_${quality}`

export default defineEventHandler(async (event) => {
    const req = await toWebRequest(event);
    try {
        const storage = useStorage<Uint8Array>("songs")

        const { searchParams } = new URL(req.url)

        const quality = searchParams.get("quality") as Quality ?? "highest"
        const songId = searchParams.get("songId")

        if (!songId) return new Response("Song not found", { status: 404, statusText: "Song not found" })

        const songIdItem = getIdItem(songId, quality)

        let audioBlob: Blob;
        if (quality === "lowest" && await storage.hasItem(songIdItem)) {
            console.log("song: cache hit")
            const audioBuffer = await storage.getItemRaw(songIdItem)
            audioBlob = uint8ArrayToBlob(audioBuffer, { type: "audio/webm" })
        } else {
            console.log("song: cache miss")
            audioBlob = await downloadYoutubeAudio(songId, quality)

            if(audioBlob == null) return new Response("Song not found", { status: 404, statusText: "Song not found" })

            if (quality === "lowest") {
                const audioBuffer = await blobToUint8Array(audioBlob)
                await storage.setItemRaw(songIdItem, audioBuffer)
            }
        }


        setHeaders(event, {
            "Content-Type": audioBlob.type,
            "Accept-Ranges": "bytes",
            "Content-Length": String(audioBlob.size),
            "Content-Range": `bytes 0-${audioBlob.size - 1}/${audioBlob.size}`,
            "cache-control": "public, max-age=3000000, s-maxage=100000, immutable",
        })

        return audioBlob
    } catch (e) {
        console.log(e.message)
        return new Response(e.message, { status: 500, statusText: "Internal Server Error" })
    }
})