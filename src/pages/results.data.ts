import type { Song } from "~/types/playlist"
import { cache, redirect } from "@solidjs/router"
import { getApiUrl } from "~/config"

export const searchResults = cache(async (search: string) => {
    if (!search) throw redirect("/")
    try {
      const res = await fetch(getApiUrl(`search?query=${search}`))
      if (!res.ok) throw new Error("An unexpected error has occurred")
      const result = await res.json() as { songs: Song[], videos: Song[] }
      return {
        songs: result.songs.filter(Boolean),
        videos: result.videos.filter(Boolean)
      }
    } catch (error) {
      console.error(error)
      throw error
      // return []
    }
}, "search")
