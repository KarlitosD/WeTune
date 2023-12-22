import { createResource } from "solid-js"
import { Song } from "~/types/playlist"

import type { RouteDataFuncArgs } from "@solidjs/router"

export function resultsData({ location, navigate }: RouteDataFuncArgs){
    const search = () => location.query.search
    
    if (!search()) navigate("/")
    const [songs] = createResource(search, async search => {
      try {
        const res = await fetch(`/api/search?query=${search}`)
        if (!res.ok) throw new Error("An unexpected error has occurred")
        const result = await res.json()
        return result as Song[]
      } catch (error) {
        return []
      }
    })
    return { songs }
} 


