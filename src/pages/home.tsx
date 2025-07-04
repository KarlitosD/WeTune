import { For, Show } from "solid-js"
import { fetch } from "@tauri-apps/plugin-http"
import IconMusic from "~/components/Icons/IconMusic"
import type { Playlist } from "~/types/playlist"
import { createId } from "~/utils/id"
import { usePlaylist } from "~/context/playlist"
import { getThumbnailUrl } from "~/utils/thumbnail"
import { useI18nContext } from "~/i18n/i18n-solid"
import { PLAYLISTS } from "~/consts"
import { getApiUrl } from "~/config"

const playlistCardSize = "w-32 h-32"

export default function Home() {
    const { playlists, addPlaylist } = usePlaylist()

    const { LL } = useI18nContext()

    return (
        <div class="px-4 text-white grid place-items-center sm:block">
            <h1 class="text-left text-white text-3xl my-4">{LL().PLAYLISTS()}</h1>
            <div class="grid grid-cols-2 items-start sm:flex sm:items-start gap-6 sm:gap-4">   
                <CreatePlaylistModal addPlaylist={addPlaylist}  />
                <For each={playlists()}>{playlist => <PlaylistCard playlist={playlist} />}</For>
            </div>
        </div>
    )
}

function CreatePlaylistModal(props: { addPlaylist: (playlist: Playlist) => void }) {
    const { LL } = useI18nContext()

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

        const hasListId = url.searchParams.has("list")

        if(
            !hasListId ||
            !["music.youtube.com", "www.youtube.com"].includes(url.host)
        ) return
        
        const res = await fetch(getApiUrl(`playlist?list=${url.searchParams.get("list")}`))
        const playlist = await res.json()
        
        props.addPlaylist(playlist)
        $form.reset()
        $dialog.close()
    }

    return (
        <>
            <button class="cursor-pointer outline-none" onClick={() => $dialog.showModal()}>
                <div class={`${playlistCardSize} rounded flex justify-center items-center text-white bg-neutral`}>
                    <IconMusic size={48} />
                </div>
                <p class="font-medium text-center mt-1 hover:underline">{LL().NEW_PLAYLIST()}</p>
            </button>

            <dialog class="modal" ref={$dialog}>
                <div class="modal-box">
                    <h2 class="text-white text-2xl text-center mb-5">{LL().CREATE_PLAYLIST()}</h2>
                    <form class="mx-auto flex justify-center gap-2 w-full sm:w-4/5 " onSubmit={importPlaylist}>
                        <input type="url" name="url" class="input input-bordered w-full max-w-64" placeholder="Youtube Playlist URL" />
                        <button class="w-[86px] btn btn-neutral uppercase">{LL().IMPORT()}</button>
                    </form>
                    <div class="divider uppercase">{LL().OR()}</div>
                    <form onSubmit={createPlaylist} class="mx-auto flex justify-center gap-2 w-full sm:w-4/5">
                        <input type="text" name="title" class="input input-bordered w-full max-w-64" placeholder={LL().NAME_PLAYLIST()} /> 
                        <button class="w-[86px] btn btn-neutral uppercase">{LL().ADD()}</button>
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
    const { LL } = useI18nContext()

    return (
        <a href={`/playlist/${props.playlist.id}`}>
            <div class={`${playlistCardSize} flex rounded overflow-hidden`}>
                <Show when={props.playlist?.songs?.length > 0} fallback={<PlaylistWithoutImage />}>
                    <img class="object-cover w-full h-full" width={128} height={128} src={getThumbnailUrl(props.playlist?.songs[0]?.youtubeId)} />
                </Show>
            </div>
            <p class="font-medium text-center mt-1 hover:underline">
                {props.playlist.id === PLAYLISTS.HISTORY ? LL().RECENTS() : props.playlist.title}
            </p>
            <p>{LL().SONGS_IN_PLAYLIST({ songs: props.playlist.songs.length })}</p>
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