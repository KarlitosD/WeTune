import { createEffect } from "solid-js"
import { PlaylistContextData } from "~/context/playlist"


type UseMediaSessionProps = {
    selected: PlaylistContextData["selected"],
    controls: {
        play: () => void,
        pause: () => void,
        handlePrevious: () => void,
        handleNext: () => void,
        seek: (time: number) => void
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
                    src: song()?.thumbnailUrl,
                    sizes: "128x128",
                    type: "image/png"
                }
            ]
        })
    })
    
    navigator.mediaSession.setActionHandler("play", props.controls.play)
    navigator.mediaSession.setActionHandler("pause", props.controls.pause)
    navigator.mediaSession.setActionHandler("previoustrack", props.controls.handlePrevious)
    navigator.mediaSession.setActionHandler("nexttrack", props.selected.hasNext ? props.controls.handleNext : null)
    navigator.mediaSession.setActionHandler("seekto", (e) => {
        props.controls.seek(e.seekTime)
    })
       
}