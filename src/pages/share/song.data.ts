import { query } from "@solidjs/router"
import { getApiUrl } from "~/config"
import { Song } from "~/db/schema"

export const getSongData = query(async (songId: string) => {
    const res = await fetch(getApiUrl(`song?songId=${songId}`))
    if (!res.ok) throw new Error("An unexpected error has occurred")
    const result = await res.json()
    return result as Song
}, "song")