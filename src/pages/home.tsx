import { createEffect, createSignal, For, Show } from "solid-js"
import IconPlus from "~/components/Icons/IconPlus"
import IconMusic from "~/components/Icons/IconMusic"
import type { Playlist } from "~/types/playlist"

const playlistCardSize = "w-32 h-32"

function PlaylistWithoutImage() {
    return (
        <div class="w-full h-full rounded bg-neutral flex justify-center items-center">
            <IconMusic size={36} />
        </div>
    )
}

export default function Home() {
    const [playlists, setPlaylists] = createSignal<Playlist[]>([])
    const playlistsSaved = localStorage.getItem("playlists")
    if (playlistsSaved) setPlaylists(JSON.parse(playlistsSaved) as Playlist[])

    const [open, setOpen] = createSignal(false)

    createEffect(() => {
        localStorage.setItem("playlists", JSON.stringify(playlists()))
    })

    return (
        <div class="px-4 text-white">
            <h1 class="text-left text-white text-3xl my-4">Playlists</h1>
            <div class="flex gap-4">
                <For each={playlists()}>{playlist => (
                    <div>
                        <div class={`${playlistCardSize} rounded overflow-hidden`}>
                            <Show when={playlist?.songs?.length > 0} fallback={<PlaylistWithoutImage />}>
                                <img class="object-cover w-full h-full" width={128} height={128} src={playlist?.songs[0]?.thumbnailUrl} />
                            </Show>
                        </div>
                        <p class="font-medium text-center mt-1 hover:underline">{playlist.title}</p>
                        <p>{playlist.songs.length} canciones</p>
                    </div>
                )}</For>


                <label for="playlist-modal" class="cursor-pointer">
                    <div class={`${playlistCardSize} rounded flex justify-center items-center text-white bg-neutral`}>
                        <IconPlus size={48} />
                    </div>
                    <p class="font-medium text-center mt-1 hover:underline">Nueva playlist</p>
                </label>
                <CreatePlaylistModal open={open()} setOpen={setOpen} setPlaylists={setPlaylists} />
            </div>
        </div>
    )
}

function CreatePlaylistModal(props) {
    const createPlaylist = (e: SubmitEvent) => {
        e.preventDefault()

        const $form = e.currentTarget as HTMLFormElement
        const formData = new FormData($form)

        const newPlaylist: Playlist = {
            id: crypto.randomUUID(),
            title: formData.get("title") as string,
            songs: []
        }
        props.setPlaylists(playlists => [...playlists, newPlaylist])
        props.setOpen(false)
        $form.reset()
    }

    const importPlaylist = async (e: SubmitEvent) => {
        e.preventDefault()

        const $form = e.currentTarget as HTMLFormElement
        const formData = new FormData($form)

        const url = new URL(formData.get("url") as string)
        if(
            !(url.host === "www.youtube.com") || 
            !(url.pathname === "/playlist") ||
            !url.searchParams.has("list")
        ) return
        
        const res = await fetch(`/api/playlist?list=${url.searchParams.get("list")}`)
        const playlist = await res.json()
        props.setPlaylists(playlists => [...playlists, playlist])
        props.setOpen(false)
        $form.reset()
    }

    return (
        <>
            <input type="checkbox" id="playlist-modal" class="modal-toggle" checked={props.open} onChange={e => props.setOpen(e.currentTarget.value)} />
            <label for="playlist-modal" class="modal">
                <div class="modal-box">
                    <h1 class="text-white text-2xl text-center mb-5">Crear playlist</h1>
                    <form class="flex justify-center gap-2" onSubmit={importPlaylist}>
                        <input type="url" name="url" class="input input-bordered" placeholder="Youtube Playlist URL" />
                        <button class="btn btn-neutral uppercase">Importar</button>
                    </form>
                    <div class="divider">OR</div>
                    <form onSubmit={createPlaylist} class="flex justify-center gap-2">
                        <input type="text" name="title" class="input input-bordered" placeholder="Nombre de la Playlist" />
                        <button class="btn btn-neutral uppercase">Agregar</button>
                    </form>
                </div>
                <label class="modal-backdrop" for="playlist-modal">Close</label>
            </label>
        </>
    )
} 