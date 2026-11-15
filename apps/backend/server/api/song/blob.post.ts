import { defineHandler } from "nitro"
import { useKV } from "nitro/kv"
import { setHeaders } from "nitro/h3"
import { blobToUint8Array } from "undio"
import type { Quality } from "../../services/player"

// LEGACY: la app móvil resuelve el audio en el dispositivo
// (apps/mobile/src/lib/youtube.ts). Esta ruta se conserva para clientes viejos;
// en Vercel el KV es en memoria y no persiste entre invocaciones.
const getIdItem = (songId: string, quality: Quality) => `song_${songId}_${quality}`

export default defineHandler(async (event) => {
    const req = event.req
    setHeaders(event, { "X-WeTune-Deprecated": "song-blob" })
    try {
        const storage = useKV("songs")

        const { searchParams } = new URL(req.url)

        const quality = searchParams.get("quality") as Quality ?? "highest"
        const songId = searchParams.get("songId")

        if (!songId) return new Response("Song not provided", { status: 400, statusText: "Song not provided" })


        const songIdItem = getIdItem(songId, quality)
        const hasSong = await storage.hasItem(songIdItem)

        if(hasSong){
            return new Response("Song already exists", { status: 409, statusText: "Song already exists" })
        }

        const formData = await req.formData()
        if(!formData || !formData.get("audioBlob")) {
            return new Response("Audio blob not provided", { status: 400, statusText: "Audio blob not provided" })
        }

        const audioBlob = formData.get("audioBlob") as File

        const audioBuffer = await blobToUint8Array(audioBlob)
        await storage.setItemRaw(songIdItem, audioBuffer)

        return new Response("Song uploaded successfully", { status: 201, statusText: "Song uploaded successfully" })
    } catch (e) {
        const message = e instanceof Error ? e.message : String(e)
        console.log(message)
        return new Response(message, { status: 500, statusText: "Internal Server Error" })
    }
})
