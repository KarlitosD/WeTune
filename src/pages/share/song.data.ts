import { cache } from "@solidjs/router"
import { Song } from "~/db/schema"

export const getSongData = cache(async (songId: string) => {
    const res = await fetch(`/api/song?songId=${songId}`)
    if (!res.ok) throw new Error("An unexpected error has occurred")
    const result = await res.json()
    return result as Song
}, "song")