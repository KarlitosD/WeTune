import type { Song } from "~/types/playlist"
import { query, redirect } from "@solidjs/router"
import { fetch } from "@tauri-apps/plugin-http"
import { getApiUrl } from "~/config"

export const searchResults = query(async (search: string) => {
    if (!search) throw redirect("/")
    try {
      const url = getApiUrl(`search?query=${search}`)
      const res = await fetch(url)
      // if (!res.ok) throw new Error("An unexpected error has occurred")
      const result = await res.json() as { songs: Song[], videos: Song[] }
      console.log(result)
      return {
        songs: result.songs.filter(Boolean),
        videos: result.videos.filter(Boolean)
      }
    } catch (error) {
      console.error(error)
      // throw error
      return []
    }
}, "search")
