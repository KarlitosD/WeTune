import { ReactiveSet } from "@solid-primitives/set"
import { createEffect, createRoot } from "solid-js"
import { downloadYoutubeAudio } from "~/lib/youtube"

export const audioCache = await caches.open("audios")

export const audiosCached = new ReactiveSet<string>(JSON.parse(localStorage.getItem("audioCached") ?? "[]"))

const getCacheKey = (id: string) => `audio:${id}`

export const existsAudioInCache = (id: string) => audiosCached.has(id)

export async function fetchAudioURL(id: string){
    if(!id || id.includes("undefined")) return "blob:"

    let blob: Blob
    const cacheKey = getCacheKey(id)
    const res = await audioCache.match(cacheKey)
    if(res) {
        blob = await res.blob()
    } else {
        blob = await downloadYoutubeAudio(id, "lowest")
    }
    
    return URL.createObjectURL(blob)
}

export async function addAudioToCache(id: string){
    const exists = existsAudioInCache(id)
    const cacheKey = getCacheKey(id)
    if(!exists) {
        audiosCached.add(id)
        const blob = await downloadYoutubeAudio(id, "highest")
        audioCache.put(cacheKey, new Response(blob))
    }
}

export async function removeAudioFromCache(id: string){
    const exists = existsAudioInCache(id)
    const cacheKey = getCacheKey(id)
    if(exists) {
        await audioCache.delete(cacheKey)
        audiosCached.delete(id)
    }
}

createRoot(() => {
    createEffect(() => {
        const entries = [...audiosCached]
        localStorage.setItem("audioCached", JSON.stringify(entries))
    })
})