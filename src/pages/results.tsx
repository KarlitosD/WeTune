import type { Song } from "~/types/playlist"
import { For } from "solid-js"
import { type RouteSectionProps, createAsync } from "@solidjs/router"

import { searchResults } from "./results.data"
import { usePlaylist } from "~/context/playlist"
import Thumbnail from "~/components/Thumbnail"


export default function Results(props: RouteSectionProps) {
  const songs = createAsync(() => searchResults(props.location.query.search))
  const { addSong } = usePlaylist()
  return (
    <>
      <div class="flex flex-col gap-2 p-4">
        <For each={songs()} fallback={<ResultFallback />}>
          {result => <ItemResult result={result} onSelect={() => addSong(result)} />}
        </For>
      </div>
    </>
  )
}

type ItemResultProps = {
  result: Song
  onSelect: () => void
}

function ItemResult(props: ItemResultProps) {
  return (
    <div class="flex items-center gap-2 w-80 sm:w-96 cursor-pointer text-left text-slate-300" onClick={props.onSelect}>
      <Thumbnail src={props.result.thumbnailUrl} title={props.result.title} />
      <div class="text-left">
        <p class="text-sm font-semibold w-fit">{props.result.title}</p>
        <p class="text-xs text-ellipsis">{props.result.artists.name} - {props.result.album} - {props.result.duration.label}</p>
      </div>
    </div>
  )
}

function ItemResultSkeleton() {
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

function ResultFallback () {
  return (
    <For each={Array.from({ length: 15 }, (_, i) => i)}>
      {ItemResultSkeleton}
    </For>
  )
}
