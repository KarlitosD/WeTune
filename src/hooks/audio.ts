import { type Accessor, createEffect, createSignal, onCleanup } from "solid-js";

type CreateAudioProps = {
    playing: Accessor<boolean>,
    volume: Accessor<number>,
    loop: Accessor<boolean>
}

export function createAudio(src: Accessor<string>, { playing, volume, loop }: CreateAudioProps){
    const audio = new Audio()
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