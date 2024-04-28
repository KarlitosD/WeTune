import { For, Show  } from "solid-js"
import IconPlus from "~/components/Icons/IconPlus"
import IconMusic from "~/components/Icons/IconMusic"
import type { Playlist } from "~/types/playlist"
import { createId } from "~/utils/id"
import { usePlaylist } from "~/context/playlist"

const playlistCardSize = "w-32 h-32"

export default function Home() {
    const { playlists, addPlaylist } = usePlaylist()

    return (
        <div class="px-4 text-white">
            <h1 class="text-left text-white text-3xl my-4">Playlists</h1>
            <div class="flex items-start gap-4">
                <For each={playlists()}>{playlist => <PlaylistCard playlist={playlist} />}</For>
                <CreatePlaylistModal addPlaylist={addPlaylist}  />
            </div>
        </div>
    )
}

function CreatePlaylistModal(props: { addPlaylist: (playlist: Playlist) => void }) {
    let $dialog: HTMLDialogElement

    const createPlaylist = (e: SubmitEvent) => {
        e.preventDefault()

        const $form = e.currentTarget as HTMLFormElement
        const formData = new FormData($form)

        const newPlaylist: Playlist = {
            id: createId(),
            title: formData.get("title") as string,
            songs: []
        }
        props.addPlaylist(newPlaylist)
        $form.reset()
        $dialog.close()
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
        
        props.addPlaylist(playlist)
        $form.reset()
        $dialog.close()
    }

    return (
        <>
            <button class="cursor-pointer outline-none" onClick={() => $dialog.showModal()}>
                <div class={`${playlistCardSize} rounded flex justify-center items-center text-white bg-neutral`}>
                    <IconPlus size={48} />
                </div>
                <p class="font-medium text-center mt-1 hover:underline">Nueva playlist</p>
            </button>

            <dialog class="modal" ref={$dialog}>
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
                <form method="dialog" class="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>
        </>
    )
} 

function PlaylistCard(props: { playlist: Playlist }) {
    return (
        <a href={`/playlist/${props.playlist.id}`}>
            <div class={`${playlistCardSize} flex rounded overflow-hidden`}>
                <Show when={props.playlist?.songs?.length > 0} fallback={<PlaylistWithoutImage />}>
                    <img class="object-cover w-full h-full" width={128} height={128} src={props.playlist?.songs[0]?.thumbnailUrl} />
                </Show>
            </div>
            <p class="font-medium text-center mt-1 hover:underline">{props.playlist.title}</p>
            <p>{props.playlist.songs.length} canciones</p>
        </a>
    )
}

function PlaylistWithoutImage() {
    return (
        <div class="w-full h-full rounded bg-neutral flex justify-center items-center">
            <IconMusic size={48} />
        </div>
    )
}