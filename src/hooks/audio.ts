import { Accessor, createEffect, createSignal, onCleanup } from "solid-js";

type CreateAudioProps = {
    playing: Accessor<boolean>,
    volume: Accessor<number>,
    loop: Accessor<boolean>
}

export function createAudio(src: Accessor<string>, { playing, volume, loop }: CreateAudioProps){
    let audio = new Audio()
    const [duration, setDuration] = createSignal(0)

    createEffect(() => audio.src = src())
    createEffect(() => playing() ? audio.play() : audio.pause())
    createEffect(() => audio.volume = volume())
    createEffect(() => audio.loop = loop())

    const seek = (time: number) => {
        audio.currentTime = time
    }

    onCleanup(() => {
        audio.pause();
        audio.currentTime = 0;
    })

    audio.addEventListener("durationchange", () => setDuration(audio.duration))

    return { audio, duration, seek }
}

export async function getAudioFromCache(id: string){
    if(!id || id.includes("undefined")) return "blob:"
    
    const cache = await caches.open("audios")

    let res = await cache.match(id)
    if(!res) return id + "&quality=lowest"
    
    const blob = await res.blob()
    return URL.createObjectURL(blob)
}

export async function addAudioToCache(id){
    const cache = await caches.open("audios")
    const res = await cache.match(id)
    if(!res) await cache.add(id)
}
