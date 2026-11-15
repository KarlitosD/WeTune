import { blobToUint8Array } from "undio";
import { Quality } from "~/services/player";

const getIdItem = (songId: string, quality: Quality) => `song_${songId}_${quality}`

export default defineEventHandler(async (event) => {
    const req = await toWebRequest(event);
    try {
        const storage = useStorage<Uint8Array>("songs")

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
        console.log(e.message)
        return new Response(e.message, { status: 500, statusText: "Internal Server Error" })
    }
})