import type { Song } from "~/types/playlist"
import { cache, redirect } from "@solidjs/router"

export const searchResults = cache(async (search: string) => {
    if (!search) redirect("/")
    try {
      const res = await fetch(`/api/search?query=${search}`)
      if (!res.ok) throw new Error("An unexpected error has occurred")
      const result = await res.json()
      return result as Song[]
    } catch (error) {
      return []
    }
}, "search")
