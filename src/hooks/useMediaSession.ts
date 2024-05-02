import { type Accessor, createEffect } from "solid-js"
import { PlaylistContextData } from "~/context/playlist"


type UseMediaSessionProps = {
    selected: PlaylistContextData["selected"],
    controls: {
        play: () => void,
        pause: () => void,
        handlePrevious: () => void,
        handleNext: () => void,
        seek: (time: number) => void
    },
    times: {
        duration: Accessor<number>,
        current: Accessor<number>
    }
}

export const useMediaSession = (props: UseMediaSessionProps) => {
    if(!("mediaSession" in navigator)) return

    const song = () => props.selected.song

    createEffect(() => {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: song()?.title,
            artist: song()?.author?.name,
            album: song()?.album?.name,
            artwork: [
                {
                    src: `https://wsrv.nl/?url=https://i.ytimg.com/vi/${song()?.youtubeId}/maxresdefault.jpg&fit=cover&w=256&h=256`, 
                    sizes: "256x256",
                    type: "image/jpg"
                }
            ]
        })
    })


    navigator.mediaSession.setPositionState({
        duration: props.times.duration(),
        position: props.times.current()
    })
    
    navigator.mediaSession.setActionHandler("play", props.controls.play)
    navigator.mediaSession.setActionHandler("pause", props.controls.pause)
    navigator.mediaSession.setActionHandler("previoustrack", props.controls.handlePrevious)
    navigator.mediaSession.setActionHandler("nexttrack", props.selected.hasNext ? props.controls.handleNext : null)
    navigator.mediaSession.setActionHandler("seekto", (e) => {
        props.controls.seek(e.seekTime)
    })

    navigator.mediaSession.setActionHandler("stop", null)
       
}