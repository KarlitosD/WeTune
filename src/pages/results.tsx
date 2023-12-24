import { For, Show } from "solid-js"
import { useRouteData } from "@solidjs/router"
import { usePlaylist } from "~/context/playlist"
import Thumbnail from "~/components/Thumbnail"
import { resultsData } from "~/router/loaders"
import { Song } from "~/types/playlist"


export default function Results() {
  const { songs } = useRouteData<typeof resultsData>()
  const { addSong } = usePlaylist()

  return (
    <>
      <div class="flex flex-col gap-2 p-4">
        <Show when={!songs.loading}>
          <For each={songs()}>
            {result => <ItemResult result={result} onSelect={() => addSong(result)} />}
          </For>
        </Show>
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