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
import { useI18nContext } from "~/i18n/i18n-solid"
import { downloadYoutubeAudio } from "~/lib/youtube"
import { toast } from "~/hooks/createToast"


function PlaylistDropdown(props: { song: Song }) {
  const { LL } = useI18nContext()
  const { addSong, playlists } = usePlaylist()

  const handleAdd = (playlistId: string) => {
    addSong(props.song, playlistId)
    // @ts-ignore
    document.activeElement?.blur()
  }

  return (
    <div class="dropdown dropdown-left">
      <div tabIndex={0} role="button" class="p-1 list-none flex items-center gap-3">
        <IconLabel icon={<IconPlus size={14} />} label={LL().ADD_PLAYLIST()} />
      </div>
      {/* <ul class="menu dropdown-content p-2 shadow-sm z-10 bg-base-200 rounded-box w-full"> */}
      <ul tabIndex={-1} class="dropdown-content bg-base-100 rounded-box z-20 w-52 p-2 shadow-sm">
        <For each={playlists()}>
          {playlist => <li><a onClick={() => handleAdd(playlist.id)}>{playlist.title}</a></li>}
        </For>
      </ul>
    </div>
  )
}

export function SongItem(props: ParentProps & {
  song: Song
  onSelect: () => void
}) {
  const { LL } = useI18nContext()
  const { handleShare, isCompatible: shareIsCompatible } = useShare(() => props.song)

  const handleDownload = async () => {
    const blob = await downloadYoutubeAudio(props.song.youtubeId, "highest")
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.download = `${props.song.title} - ${props?.song?.author?.name}.mp3`
    link.click()

    URL.revokeObjectURL(url)
    const message = LL().DOWNLOAD_STARTED({ song: props.song.title })
    toast.success(message)
  }

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
          <button class="p-1 flex items-center gap-3" type="button" onClick={handleDownload}>
            <IconLabel icon={<IconDownload size={14} />} label={LL().DOWNLOAD_MP3()} />
          </button>
        </DropdownItem>
        <Show when={shareIsCompatible()}>
          <DropdownItem >
            <button class="p-1 flex items-center gap-3" onClick={handleShare} >
              <IconLabel icon={<IconShare size={14} />} label={LL().SHARE()} />
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