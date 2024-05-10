import { Navigate, createAsync, useSearchParams } from "@solidjs/router"
import { getSongData } from "./song.data"
import { Show } from "solid-js"
import { usePlaylist } from "~/context/playlist"
import { Song } from "~/db/schema"
import { PLAYLISTS } from "~/consts"

export default function ShareSong(){
    const [searchParams] = useSearchParams()    
    const songData = createAsync(() => getSongData(searchParams.songId))
    const { actualPlaylist } = usePlaylist()

    return (
        <>
            <Show when={songData() && actualPlaylist()} fallback={<LoadingSong />}>
                <Play song={songData()} />
            </Show>
        </>
    )
}

function Play(props: { song: Song }){
    const { playSong } = usePlaylist()
    playSong(props.song, PLAYLISTS.HISTORY)

    return (
        <Navigate href="/" />
    )
}

function LoadingSong(){
    return (
        <>
            <div class="container h-5/6 mx-auto grid place-content-center">
                <div class="loading loading-ring w-24 text-primary"></div> 
            </div>
        </>
    )
}