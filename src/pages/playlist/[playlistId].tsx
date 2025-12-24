import { RouteSectionProps, useNavigate } from "@solidjs/router";
import { For, Show, createMemo } from "solid-js";
import { usePlaylist } from "~/context/playlist";
import { Dropdown, DropdownItem } from "~/components/Dropdown";
import { SongItem } from "~/components/SongItem";
import { IconLabel } from "~/components/IconLabel";
import { IconPause, IconPlay, IconEllipsis, IconTrash, IconOutlineArrowDownCircle } from "~/components/Icons";
import { Playlist } from "~/db/schema";
import { audioPlayerEvent } from "~/utils/events";
import { addAudioToCache, existsAudioInCache } from "~/services/cache";
import { PLAYLISTS } from "~/consts";
import { useI18nContext } from "~/i18n/i18n-solid";

export default function PlaylistPage(props: RouteSectionProps) {
    const { LL } = useI18nContext()
    const { playlists, playSong, removeSong } = usePlaylist()
    const playlist = createMemo(() => playlists().find(p => p.id === props.params.playlistId))

    return (
        <section class="h-full">
            <Show when={playlist()?.id}>
                <PlaylistHeader playlist={playlist()} />
                <article class="flex flex-col my-4 px-4 gap-2 max-h-175 sm:max-h-187.5 h-[85%] overflow-y-scroll scrollbar scrollbar-track-base-100 scrollbar-thumb-primary">
                    <For each={playlist().songs}>{ song =>
                        <SongItem song={song} onSelect={() => playSong(song, playlist().id)}>
                            <DropdownItem>
                                <button class="text-error p-1 flex items-center gap-3" onClick={() => removeSong(song, playlist().id)}>
                                    <IconLabel icon={<IconTrash size={14} />} label={LL().DELETE()} />
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
    const navigate = useNavigate()
    const { LL } = useI18nContext()
    const { actualPlaylist, playSong, removePlaylist } = usePlaylist()

    const isActualPlaylist = () => actualPlaylist().id === props.playlist.id

    const handlePlayPlaylist = () => {
        if (!isActualPlaylist()) {
            const firstSong = props.playlist.songs[0]
            playSong(firstSong, props.playlist.id)
        } else {
            audioPlayerEvent.emit("togglePlay",)
        }
    }

    const allSongsCached = () => props.playlist.songs.every(song => existsAudioInCache(song.youtubeId))
    const handleDownloadPlaylist = async () => {
        if(allSongsCached()) return
        const songs = props.playlist.songs
        for(const song of songs) {
            await addAudioToCache(song.youtubeId)
        }
    }

    const handleRemovePlaylist = () => {
        navigate("/")
        removePlaylist(props.playlist.id)
    }

    return (
        <header class="flex justify-between items-center py-3 px-6 border-b border-b-gray-500">
            <div class="flex items-end gap-3">
                <h1 class="text-xl text-base-content">{props.playlist.id == PLAYLISTS.HISTORY ? LL().RECENTS() : props.playlist.title}</h1>
                <button classList={{ "text-primary": allSongsCached(), "text-white": !allSongsCached() }} onClick={handleDownloadPlaylist}><IconOutlineArrowDownCircle size={22} /></button>
                <Show when={props.playlist.id !== PLAYLISTS.HISTORY}>
                    <Dropdown class="text-white" summary={<IconEllipsis />}>
                        <DropdownItem>
                            <button class="p-1 flex items-center gap-3 text-error" onClick={handleRemovePlaylist}>
                                <IconLabel icon={<IconTrash size={14} />} label={LL().DELETE()} />
                            </button>
                        </DropdownItem>
                    </Dropdown>
                </Show>
            </div>
            <button class="btn btn-primary rounded-full size-14" onClick={handlePlayPlaylist}>
                <Show when={isActualPlaylist()} fallback={<IconPlay />}>
                    <IconPause />
                </Show>
            </button>
        </header>
    )
}