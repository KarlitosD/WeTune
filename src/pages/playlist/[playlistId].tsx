import { RouteSectionProps } from "@solidjs/router";
import { For, Show, createMemo } from "solid-js";
import { Dropdown, DropdownItem } from "~/components/Dropdown";
import { IconPause, IconPlay } from "~/components/Icons";
import IconEllipsis from "~/components/Icons/IconEllipsis";
import IconTrash from "~/components/Icons/IconTrash";
import { SongItem } from "~/components/SongItem";
import { usePlaylist } from "~/context/playlist";
import { Playlist } from "~/db/schema";
import { audioPlayerEvent } from "~/utils/events";

export default function PlaylistPage(props: RouteSectionProps) {
    const { playlists, playSong, removeSong } = usePlaylist()
    const playlist = createMemo(() => playlists().find(p => p.id === props.params.playlistId))

    return (
        <section class="h-full">
            <Show when={playlist()?.id}>
                <PlaylistHeader playlist={playlist()} />
                <article class="flex flex-col my-4 px-4 gap-2 max-h-[700px] sm:max-h-[750px] h-[85%] overflow-y-scroll scrollbar scrollbar-track-base-100 scrollbar-thumb-primary">
                    <For each={playlist().songs}>{ song =>
                        <SongItem song={song} onSelect={() => playSong(song, playlist().id)}>
                            <DropdownItem>
                                <button class="text-error p-1 flex items-center gap-3" onClick={() => removeSong(song, playlist().id)}>
                                    <IconTrash size={14} />
                                    <span>Eliminar</span>
                                </button>
                            </DropdownItem>
                        </SongItem>
                    }</For>
                </article>
            </Show>
        </section>
    )
}

function PlaylistHeader(props: { playlist: Playlist }) {
    const { actualPlaylist, playSong } = usePlaylist()
    const isActualPlaylist = () => actualPlaylist().id === props.playlist.id

    const handlePlayPlaylist = () => {
        if (!isActualPlaylist()) {
            const firstSong = props.playlist.songs[0]
            playSong(firstSong, props.playlist.id)
        } else {
            audioPlayerEvent.emit("togglePlay",)
        }
    }

    return (
        <header class="flex justify-between items-center py-3 px-6 border-b border-b-gray-500">
            <div class="flex items-end gap-3">
                <h1 class="text-xl text-base-content">{props.playlist.title}</h1>
                <Dropdown class="text-white" summary={<IconEllipsis />}>
                    <DropdownItem>
                        <button class="p-1 flex">Test</button>
                    </DropdownItem>
                </Dropdown>
            </div>
            <button class="btn btn-primary rounded-full" onClick={handlePlayPlaylist}>
                <Show when={isActualPlaylist()} fallback={<IconPlay />}>
                    <IconPause />
                </Show>
            </button>
        </header>
    )
}