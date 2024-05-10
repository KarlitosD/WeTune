import type { Song } from "~/types/playlist"
import { For, Show, type ParentProps } from "solid-js"

import { usePlaylist } from "~/context/playlist"
import { useShare } from "~/hooks/useShare"
import Thumbnail from "~/components/Thumbnail"
import { Dropdown, DropdownItem } from "~/components/Dropdown"
import { IconLabel } from "./IconLabel"
import { IconCircleArrowDown, IconDownload, IconPlus, IconShare, IconEllipsis } from "~/components/Icons"
import { existsAudioInCache } from "~/services/cache"
import { formatSeconds } from "~/utils/seconds"
import { getThumbnailUrl } from "~/utils/thumbnail"


function PlaylistDropdown(props: { song: Song }) {
  const { addSong, playlists } = usePlaylist()

  const handleAdd = (playlistId: string) => {
    addSong(props.song, playlistId)
    // @ts-ignore
    document.activeElement?.blur()
  }

  return (
    <details class="dropdown dropdown-left">
      <summary class="p-1 list-none flex items-center gap-3">
        <IconLabel icon={<IconPlus size={14} />} label="Agregar playlist" />
      </summary>
      <ul class="p-2 shadow menu dropdown-content z-[2] bg-base-200 rounded-box w-52">
        <For each={playlists()}>
          {playlist => <li><a onClick={() => handleAdd(playlist.id)}>{playlist.title}</a></li>}
        </For>
      </ul>
    </details>
  )
}

export function SongItem(props: ParentProps & {
  song: Song
  onSelect: () => void
}) {
  const { handleShare, isCompatible: shareIsCompatible } = useShare(() => props.song)

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
      <Dropdown end summary={<IconEllipsis />}>
        <DropdownItem><PlaylistDropdown song={props.song} /></DropdownItem>
        <DropdownItem>
          <a class="p-1 flex items-center gap-3" href={`/api/song/blob?songId=${props.song.youtubeId}`} download={`${props.song.title} - ${props?.song?.author?.name}.mp3`}>
            <IconLabel icon={<IconDownload size={14} />} label="Descargar MP3" />
          </a>
        </DropdownItem>
        <Show when={shareIsCompatible()}>
          <DropdownItem >
            <button class="p-1 flex items-center gap-3" onClick={handleShare} >
              <IconLabel icon={<IconShare size={14} />} label="Compartir" />
            </button>
          </DropdownItem>
        </Show>
        {props.children}
      </Dropdown>
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