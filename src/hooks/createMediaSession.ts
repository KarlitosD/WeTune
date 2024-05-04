import { type Accessor, createEffect } from "solid-js"
import { M } from "vite/dist/node/types.d-aGj9QkWt"
import { PlaylistContextData } from "~/context/playlist"
import { Resolution, getThumbnailUrl } from "~/utils/thumbnail"


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
        const thumbnailOptios = {
            resolution: Resolution.Max,
            fit: "cover",
        }

        const thumbnailUrl512 = getThumbnailUrl(song()?.youtubeId, { ...thumbnailOptios, w: "512", h: "512" })
        const thumbnailUrl256 = getThumbnailUrl(song()?.youtubeId, { ...thumbnailOptios, w: "256", h: "256" })
        const thumbnailUrl192 = getThumbnailUrl(song()?.youtubeId, { ...thumbnailOptios, w: "192", h: "192" })

        navigator.mediaSession.metadata = new MediaMetadata({
            title: song()?.title,
            artist: song()?.author?.name,
            album: song()?.album?.name,
            artwork: [
                {
                    src: thumbnailUrl512, 
                    sizes: "512x512",
                    type: "image/jpg"
                },
                {
                    src: thumbnailUrl256, 
                    sizes: "256x256",
                    type: "image/jpg"
                },
                {
                    src: thumbnailUrl192, 
                    sizes: "192x192",
                    type: "image/jpg"
                }
            ]
        })
    })


    createEffect(() => {
        if(props.times.duration() > 0){
            navigator.mediaSession.setPositionState({
                duration: props.times.duration(),
                position: props.times.current()
            })
        }
    })
    
    navigator.mediaSession.setActionHandler("play", props.controls.play)
    navigator.mediaSession.setActionHandler("pause", props.controls.pause)
    navigator.mediaSession.setActionHandler("previoustrack", props.controls.handlePrevious)
    navigator.mediaSession.setActionHandler("nexttrack", props.selected.hasNext ? props.controls.handleNext : null)
    navigator.mediaSession.setActionHandler("seekto", (e) => {
        props.controls.seek(e.seekTime)
    })

    navigator.mediaSession.setActionHandler("stop", props.controls.pause)
       
}