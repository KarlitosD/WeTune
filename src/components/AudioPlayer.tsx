import { Show, createEffect, createMemo, createResource, createSignal } from "solid-js";
import { 
    IconBackwardStep, IconCircleArrowDown, IconForwardStep, IconPause, 
    IconPlay, IconRepeat, IconShuffle, IconVolumeHigh, IconVolumeXmark 
} from "./Icons";
import { addAudioToCache, createAudio, getAudioFromCache } from "~/hooks/audio";
import { formatSeconds } from "~/utils/seconds";
import Thumbnail from "./Thumbnail";
import type { PlaylistContextData } from "~/context/playlist";

type AudioPlayerProps = {
    selected: PlaylistContextData["selected"]
    song: PlaylistContextData["selected"]["song"],
}

export default function AudioPlayer(props: AudioPlayerProps) {
    const src = () => `/api/songs?song=${props.song.youtubeId}`
    const [audioUrl, { refetch }] = createResource(src, src => getAudioFromCache(src))
    
    const [playing, setPlaying] = createSignal(false)

    const [volume, setVolume] = createSignal(Number(localStorage.getItem("volume")) || 0.5)
    const volumeLevelAlvaMajo = () => volume() ** 2

    const [currentTime, setCurrentTime] = createSignal(0)
    const [loop, setLoop] = createSignal(false)
    const [shuffle, setShuffle] = createSignal(false)
    
    const { audio, duration, seek: seekAudio } = createAudio(audioUrl, {
        playing,
        volume: volumeLevelAlvaMajo,
        loop
    })

    const play = () => setPlaying(true)
    const pause = () => setPlaying(false)

    const seek = (time: number) => {
        setCurrentTime(time)
        seekAudio(time)
    }

    const toggleLoop = () => {
        setShuffle(false)
        setLoop(isLoop => !isLoop)
    }

    const toggleShuffle = () => {
        setLoop(false)
        setShuffle(isShuffle => !isShuffle)
    }

    const handlePrevious = () => {
        if(props.selected.hasPrevious && currentTime() < 10){
            return props.selected.index -= 1
        }
        pause()
        seek(0)
        play()
    }

    const handleNext = () => {
        if(shuffle()){
            return props.selected.setRandom()
        }
        if(props.selected.hasNext){
            return props.selected.index += 1
        }
        props.selected.index = 0
    }

    createEffect(() => setPlaying(playing() && audioUrl.state === "ready"))


    audio.addEventListener("timeupdate", () => playing() && setCurrentTime(audio.currentTime))
    audio.addEventListener("ended", () => !loop() && handleNext())

    const [downloading, setDownloading] = createSignal(false) 
    const isAudioDownloaded = createMemo(() => audioUrl()?.includes("blob:") ?? false)

    const handleDownload = async () => {
        if(isAudioDownloaded()) return
        setDownloading(true)
        await addAudioToCache(src())
        refetch()
        setDownloading(false)
    }

    const [lastVolumeLevel, setLastVolumeLevel] = createSignal(0)

    const togleVolumeLevel = () => {
        const volumeLevel = volume()
        setVolume(lastVolumeLevel())
        setLastVolumeLevel(volumeLevel)
    }

    return (
        <div class="container min-h-12 mx-auto flex justify-center sm:justify-between items-center py-3 text-white">
            <div class="hidden sm:flex max-w-lg items-center gap-2">
                <Thumbnail src={props.song.thumbnailUrl} title={props.song.title} isSmall={true} />
                <div class="text-left ">
                    <p>{props.song?.title}</p>
                    <div class="max-w-32 lg:max-w-48">
                        <small class="block w-full truncate">{props.song.artists?.name}</small>
                    </div>
                </div>
            </div>
            <div class="flex h-fit flex-col justify-center gap-2 mx-4" >
                <div class="flex justify-around items-center">
                    <div class="size-[20px]"></div>
                    <div class="flex gap-2 justify-center">
                        <button onClick={toggleShuffle} classList={{ "text-primary": shuffle() }}>
                            <IconShuffle size={20} color="inherit" />
                        </button>
                        <button onClick={handlePrevious}>
                            <IconBackwardStep size={28} />
                        </button>
                        <button onClick={() => playing() ? pause() : play()}>
                            {playing() ? <IconPause size={32} /> : <IconPlay size={32} />}
                        </button>
                        <button onClick={handleNext} disabled={!shuffle() && !props.selected.hasNext} class="disabled:text-gray-400">
                            <IconForwardStep size={28} />
                        </button>
                        <button onClick={toggleLoop} classList={{ "text-primary": loop() }}>
                            <IconRepeat size={20} />
                        </button>
                    </div>
                    <button onClick={handleDownload} class="w-fit" classList={{ "text-primary": isAudioDownloaded() }}>
                        <Show when={!downloading()} fallback={<div class="loading size-5 text-primary"></div>}>
                            <IconCircleArrowDown size={20} />
                        </Show>
                    </button>
                </div>
                <div class="h-4 flex items-center gap-1">
                    <label for="currentTime">{formatSeconds(currentTime())}</label>
                    <input
                        type="range"
                        class="w-56 h-1 accent-white hover:accent-primary bg-transparent"
                        max={duration()}
                        value={currentTime()}
                        onInput={e => seek(+e.currentTarget.value)}
                        onMouseDown={pause}
                        onTouchStart={pause}
                        onChange={play}
                        id="currentTime"
                    />
                    <label for="currentTime">{formatSeconds(duration())}</label>
                </div>
            </div>
            <div class="gap-2 items-center hidden sm:flex">
                <button onClick={togleVolumeLevel}>
                    { volume() > 0 ? <IconVolumeHigh size={20} /> : <IconVolumeXmark size={20} /> }
                </button>
                <input
                    type="range"
                    class="h-1 accent-primary cursor-pointer"
                    max="1"
                    step="0.01"
                    value={volume()}
                    title={~~(volume() * 100) + "%"}
                    onInput={e => setVolume(+e.currentTarget.value)}
                    onChange={e => localStorage.setItem("volume", e.currentTarget.value)}
                />
            </div>
        </div>
    )
}
