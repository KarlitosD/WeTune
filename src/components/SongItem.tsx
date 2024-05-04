import type { Song } from "~/types/playlist"
import { For, Show, type ParentProps } from "solid-js"

import { usePlaylist } from "~/context/playlist"
import Thumbnail from "~/components/Thumbnail"
import IconEllipsis from "~/components/Icons/IconEllipsis"
import { formatSeconds } from "~/utils/seconds"
import { getThumbnailUrl } from "~/utils/thumbnail"
import { existsAudioInCache } from "~/services/cache"
import { IconCircleArrowDown, IconPlus, IconShare } from "./Icons"
import { useShare } from "~/hooks/useShare"

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
          <summary class="p-1 list-none flex items-center gap-2">
            <IconPlus size={14}/>
            Agregar playlist
          </summary>
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
    const { handleShare, isCompatible: shareIsCompatible } = useShare(props.song)

    return (
      <div class="flex items-center justify-between text-slate-300">
        <div class="flex items-center gap-2 w-80 sm:w-96 cursor-pointer text-left" onClick={props.onSelect}>
          <Thumbnail src={getThumbnailUrl(props.song.youtubeId)} title={props.song.title} />
          <div class="text-left">
            <p class="text-sm font-semibold w-fit">{props.song.title}</p>
            <p class="text-xs text-ellipsis leading-4">
              {props.song?.author?.name && <span>{props.song?.author?.name}</span>}
              {props.song?.album?.name && <span> - {props.song?.album?.name}</span>}
              <span> - {formatSeconds(props.song.duration)}</span>
              {existsAudioInCache(props.song.youtubeId) ? <span> <IconCircleArrowDown class="inline ml-1" size={16} /></span> : ""} 
            </p>
          </div>
        </div>
        <div class="dropdown dropdown-end">
          <div tabIndex={0} class="p-1 cursor-pointer"><IconEllipsis /></div>
          <ul tabIndex={0} class="p-2 shadow menu dropdown-content z-[1] bg-base-200 rounded-box w-52">
            <li><PlaylistDropdown song={props.song} /></li>
            
            <Show when={shareIsCompatible()}>
              <li>
                <div>
                  <button class="p-1 flex items-center gap-2" onClick={handleShare} >
                    <IconShare size={14} />
                    <span>Compartir</span>
                  </button>
                </div>   
              </li>
            </Show>

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