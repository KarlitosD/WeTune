import { ReactiveSet } from "@solid-primitives/set"
import { createEffect } from "solid-js"

export const audioCache = await caches.open("audios")

export const audiosCached = new ReactiveSet<string>(JSON.parse(localStorage.getItem("audioCached") ?? "[]"))

export async function getAudioFromCache(id: string){
    if(!id || id.includes("undefined")) return "blob:"

    const url = "/api/song/blob?songId=" + id
    const res = await audioCache.match(url)
    if(!res) return url + "&quality=lowest"
    
    const blob = await res.blob()
    return URL.createObjectURL(blob)
}

export async function addAudioToCache(id: string){
    const exists = existsAudioInCache(id)
    const url = "/api/song/blob?songId=" + id
    if(!exists) {

        await audioCache.add(url)
        audiosCached.add(id)
    }
}

export const existsAudioInCache = (id: string) => audiosCached.has(id)

createEffect(() => {
    const entries = [...audiosCached]
    localStorage.setItem("audioCached", JSON.stringify(entries))
})