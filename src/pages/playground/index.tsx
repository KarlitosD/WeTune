import { startWith } from "rxjs"
import { createEffect, from, onMount } from "solid-js"
import { db } from "~/db"
import { Playlist } from "~/types/playlist"

export default function Playground(){
    const playlists = from<Playlist>(db.playlist.find({}).$.pipe(startWith([])))
 
    createEffect(() => {
        console.log(playlists())
    })

    return (
        <>
            <button class="bg-primary text-white p-3 rounded">Click</button>
        </>
    )
}