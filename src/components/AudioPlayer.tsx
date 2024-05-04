import { Show, batch, createEffect, createResource, createSignal } from "solid-js";

import type { PlaylistContextData } from "~/context/playlist";
import { createAudio } from "~/hooks/createAudio";
import { useMediaSession } from "~/hooks/createMediaSession";
import { createPersistedSignal } from "~/hooks/createPersistedSignal";
import { 
    IconBackwardStep, IconCircleArrowDown, IconForwardStep, IconPause, 
    IconPlay, IconRepeat, IconShuffle, IconVolumeHigh, IconVolumeXmark 
} from "~/components/Icons";
import Thumbnail from "~/components/Thumbnail";
import { ShareSongButton } from "~/components/ShareSongButton";

import { getAudioFromCache, addAudioToCache, existsAudioInCache } from "~/services/cache";
import { formatSeconds } from "~/utils/seconds";
import { getThumbnailUrl } from "~/utils/thumbnail";
import { isMobile } from "~/utils/device";
import { audioPlayerEvent } from "~/utils/events";

type AudioPlayerProps = {
    selected: PlaylistContextData["selected"]
    song: PlaylistContextData["selected"]["song"],
}

const getDefaultVolumenAccordingToDevice = () => isMobile() ? 1 : 0.5

export default function AudioPlayer(props: AudioPlayerProps) {
    const youtubeId  = () => props.song.youtubeId
    const [audioUrl] = createResource(youtubeId, youtubeId => getAudioFromCache(youtubeId))

    const [playing, setPlaying] = createSignal(false)

    const [volume, setVolume] = createPersistedSignal("volume", getDefaultVolumenAccordingToDevice())
    const volumeLevelAlvaMajo = () => volume() ** 2

    const [lastVolumeLevel, setLastVolumeLevel] = createPersistedSignal("lastVolumeLevel", 0)

    const togleVolumeLevel = () => {
        const volumeLevel = volume()
        batch(() => {
            setVolume(lastVolumeLevel())
            setLastVolumeLevel(volumeLevel)
        })
    }

    const [currentTime, setCurrentTime] = createSignal(0)
    const [loop, setLoop] = createPersistedSignal("loop", false)
    const [shuffle, setShuffle] = createPersistedSignal("shuffle", false)
    
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

    const [isSeeking, setIsSeeking] = createSignal(false)
    const preSeek = () => {
        setIsSeeking(true)
        pause()
    }
    const postSeek = () => {
        setIsSeeking(false)
        play()
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
    audio.addEventListener("ended", () => {
        if(props.selected.hasNext && !loop()){
            handleNext()
        }else if(!loop()){
            setPlaying(false)
            setCurrentTime(0)
        }
    })

    const [downloading, setDownloading] = createSignal(false)     
    const isAudioDownloaded = () => existsAudioInCache(props.song.youtubeId)

    const handleDownload = async () => {
        if(isAudioDownloaded()) return
        setDownloading(true)
        await addAudioToCache(youtubeId())
        setDownloading(false)
    }

    const [isFirstSong, setIsFirstSong] = createSignal(true)

    audio.addEventListener("canplaythrough", () => {
        if(!isFirstSong() && !isSeeking()){
            play()
        }
    })

    createEffect(() => {
        if(isFirstSong() && playing()){
            setIsFirstSong(false)
        }
    })

    const controls = { play, pause, handlePrevious, handleNext, seek }
    useMediaSession({ 
        selected: props.selected, 
        controls, 
        times: { duration, current: currentTime } 
    })

    audioPlayerEvent.on("togglePlay", () => setPlaying(playing => !playing))

    return (
        <div class="container min-h-12 mx-auto flex flex-col sm:flex-row sm:justify-between items-center gap-2 py-3 text-white"> 
            <div class="my-1 sm:my-0 max-w-lg min-w-[290px] sm:min-w-min flex items-center gap-2"> 
                <Thumbnail src={getThumbnailUrl(props.song.youtubeId)} title={props.song.title} isSmall={true} />
                <div class="text-left">
                    <p class="w-64 truncate" title={props.song.title}>{props.song?.title}</p>
                    <div class="max-w-32 lg:max-w-48">
                        <small class="block w-full truncate" title={props.song.title}>{props.song.author?.name}</small>
                    </div>
                </div>
            </div>
            <div class="flex h-fit flex-col justify-center gap-2 mb-1 sm:mb-0">
                <div class="flex justify-around items-center order-2 sm:order-1">
                    <ShareSongButton song={props.song} />
                    <div class="flex gap-4 justify-center">
                        <button onClick={toggleShuffle} class="active:scale-90 transition-transform" classList={{ "text-primary": shuffle() }}>
                            <IconShuffle size={20} color="inherit" />
                        </button>
                        <button onClick={handlePrevious} class="active:scale-90 transition-transform">
                            <IconBackwardStep size={28} />
                        </button>
                        <button onClick={() => playing() ? pause() : play()}>
                            {playing() ? <IconPause size={32} /> : <IconPlay size={32} />}
                        </button>
                        <button onClick={handleNext} disabled={!shuffle() && !props.selected.hasNext} class="disabled:text-gray-400 active:scale-90 transition-transform">
                            <IconForwardStep size={28} />
                        </button>
                        <button onClick={toggleLoop} class="active:scale-90 transition-transform" classList={{ "text-primary": loop() }}>
                            <IconRepeat size={20} />
                        </button>
                    </div>
                    <button onClick={handleDownload} disabled={isAudioDownloaded()} class="w-fit" classList={{ "text-primary": isAudioDownloaded() }}>
                        <Show when={!downloading()} fallback={<div class="loading size-5 text-primary"></div>}>
                            <IconCircleArrowDown size={20} />
                        </Show>
                    </button>
                </div>
                <div class="h-4 flex items-center gap-1 order-1 sm:order-2">
                    <label for="currentTime">{formatSeconds(currentTime())}</label>
                    <input
                        type="range"
                        class="w-56 h-1 accent-white active:accent-primary hover:accent-primary bg-transparent"
                        max={duration()}
                        value={currentTime()}
                        onMouseDown={preSeek}
                        onTouchStart={preSeek}
                        onInput={e => seek(+e.currentTarget.value)}
                        onChange={postSeek}
                        id="currentTime"
                    />
                    <label for="currentTime">{formatSeconds(duration())}</label>
                </div>
            </div>
            <div class="w-64 gap-2 hidden sm:flex items-center justify-center">
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
                />
            </div>
        </div>
    )
}
