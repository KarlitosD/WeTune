import { RouteSectionProps } from "@solidjs/router";
import { For, Show, createMemo } from "solid-js";
import { IconPause, IconPlay } from "~/components/Icons";
import { SongItem } from "~/components/SongItem";
import { usePlaylist } from "~/context/playlist";

export default function PlaylistPage (props: RouteSectionProps) {
    const { playlists, actualPlaylist, playSong, removeSong } = usePlaylist()
    const playlist = createMemo(() => playlists().find(p => p.id === props.params.playlistId))

    const isActualPlaylist = () => actualPlaylist().id === playlist().id

    const handlePlayPlaylist = () => {
        if(!isActualPlaylist()) {
            const firstSong = playlist().songs[0]
            playSong(firstSong, playlist().id)
        }
    }

    return (
        <section class="h-full">
            <Show when={playlist()?.id}>
                <header class="flex justify-between items-center py-3 px-6 border-b border-b-gray-500">
                    <h1 class="text-xl text-base-content">{playlist().title}</h1>
                    <button class="btn btn-primary rounded-full" onClick={handlePlayPlaylist}>
                        <Show when={isActualPlaylist()} fallback={<IconPlay />}>
                            <IconPause />
                        </Show>
                    </button>
                </header>
                <article class="flex flex-col my-4 px-4 gap-2 max-h-[700px] sm:max-h-[750px] h-[85%] overflow-y-scroll scrollbar scrollbar-track-base-100 scrollbar-thumb-primary">
                    <For each={playlist().songs}>
                        {song =>
                            <SongItem song={song} onSelect={() => playSong(song, playlist().id)}>
                                <li>
                                    <div>
                                        <button
                                            onClick={() => removeSong(song, playlist().id)}
                                            class="text-error p-1"
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