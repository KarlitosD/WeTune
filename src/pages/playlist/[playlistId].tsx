import { RouteSectionProps } from "@solidjs/router";
import { For, Show, createMemo } from "solid-js";
import { IconPause, IconPlay } from "~/components/Icons";
import { SongItem } from "~/components/SongItem";
import { usePlaylist } from "~/context/playlist";
import { Playlist } from "~/types/playlist";

export default function PlaylistPage (props: RouteSectionProps) {
    const { playlists, actualPlaylist, playSong, removeSong } = usePlaylist()
    const playlist = createMemo(() => playlists().find(p => p.id === props.params.playlistId))

    const isActualPlaylist = () => actualPlaylist().id === playlist().id

    const handlePlayPlaylist = () => {
        const firstSong = playlist().songs[0]
        playSong(firstSong, playlist().id)
    }

    return (
        <section>
            <Show when={playlist()?.id}>
                <header class="flex justify-between items-center py-2 border-b border-b-gray-500">
                    <h1 class="text-xl text-base-content">{playlist().title}</h1>
                    <button class="btn btn-primary rounded-full" onClick={handlePlayPlaylist}>
                        <Show when={isActualPlaylist()} fallback={<IconPlay />}>
                            <IconPause />
                        </Show>
                    </button>
                </header>
                <article class="flex flex-col gap-2 p-4">
                    <For each={playlist().songs}>
                        {song => 
                            <SongItem song={song} onSelect={() => playSong(song, playlist().id)}>
                                <li>
                                    <div>
                                        <button 
                                            onClick={() => removeSong(song, playlist().id)}
                                            class="rounded-full mx-auto p-1 list-none shadow-white hover:text-white hover:shadow-lg"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </li>
                            </SongItem>
                        }
                    </For>
                </article>
            </Show>
        </section>
    )
}