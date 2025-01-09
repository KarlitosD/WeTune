import { ReactiveSet } from "@solid-primitives/set"
import { createEffect, createRoot } from "solid-js"
import { getApiUrl } from "~/config"

export const audioCache = await caches.open("audios")

export const audiosCached = new ReactiveSet<string>(JSON.parse(localStorage.getItem("audioCached") ?? "[]"))

const getAudioUrl = (id: string) => getApiUrl("song/blob?songId=" + id)

export const existsAudioInCache = (id: string) => audiosCached.has(id)

export async function getAudioFromCache(id: string){
    if(!id || id.includes("undefined")) return "blob:"

    const url = getAudioUrl(id)
    const res = await audioCache.match(url)
    if(!res) return url + "&quality=lowest"
    
    const blob = await res.blob()
    return URL.createObjectURL(blob)
}

export async function addAudioToCache(id: string){
    const exists = existsAudioInCache(id)
    const url = getAudioUrl(id)
    if(!exists) {
        await audioCache.add(url)
        audiosCached.add(id)
    }
}

export async function removeAudioFromCache(id: string){
    const exists = existsAudioInCache(id)
    const url = getAudioUrl(id)
    if(exists) {
        await audioCache.delete(url)
        audiosCached.delete(id)
    }
}

createRoot(() => {
    createEffect(() => {
        const entries = [...audiosCached]
        localStorage.setItem("audioCached", JSON.stringify(entries))
    })
})