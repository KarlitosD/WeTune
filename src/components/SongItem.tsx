import type { Song } from "~/types/playlist"
import { For, type ParentProps } from "solid-js"

import { usePlaylist } from "~/context/playlist"
import Thumbnail from "~/components/Thumbnail"
import IconEllipsis from "~/components/Icons/IconEllipsis"
import { formatSeconds } from "~/utils/seconds"

function PlaylistDropdown(props: { song: Song }){
    const { addSong, playlists } = usePlaylist()

    const handleAdd = (playlistId: string) => {
        addSong(props.song, playlistId)
        // @ts-ignore
        document.activeElement?.blur()
    }

    return (
      <div>
        <details class="dropdown dropdown-left">
          <summary class="rounded-full mx-auto p-1 list-none shadow-white hover:text-white hover:shadow-lg">Agregar playlist</summary>
          <ul class="p-2 shadow menu dropdown-content z-[2] bg-base-200 rounded-box w-52">
            <For each={playlists()}>
              {playlist => <li><a onClick={() => handleAdd(playlist.id)}>{playlist.title}</a></li>}
            </For>
          </ul>
        </details>
      </div>
    )
  }
  
  export function SongItem(props: ParentProps & {
    song: Song
    onSelect: () => void
  }) {
    return (
      <div class="flex items-center justify-between text-slate-300">
        <div class="flex items-center gap-2 w-80 sm:w-96 cursor-pointer text-left" onClick={props.onSelect}>
          <Thumbnail src={props.song.thumbnailUrl} title={props.song.title} />
          <div class="text-left">
            <p class="text-sm font-semibold w-fit">{props.song.title}</p>
            <p class="text-xs text-ellipsis">{props.song?.author?.name} - {props.song?.album?.name ?? ""} - {formatSeconds(props.song.duration)}</p>
          </div>
        </div>
        <div class="dropdown dropdown-end">
          <div tabIndex={0} class="rounded-full cursor-pointer p-1 list-none shadow-white hover:text-white hover:shadow-lg"><IconEllipsis /></div>
          <ul tabIndex={0} class="p-2 shadow menu dropdown-content z-[1] bg-base-200 rounded-box w-52">
            <li><PlaylistDropdown song={props.song} /></li>
            {props.children}
          </ul>
        </div>
      </div>
    )
  }
  
 export function SongItemSkeleton() {
    return (
      <div class="flex items-center gap-2 w-80 sm:w-96 cursor-pointer text-left text-slate-300" role="status">
        <div class="aspect-square w-[60px] h-[60px] skeleton rounded-none"></div>
        <div class="text-left flex flex-col gap-1">
          <div class="h-4 w-24 rounded-full skeleton"></div>
          <div class="h-3 w-48 rounded-full skeleton"></div>
        </div>
      </div>
    )
  }