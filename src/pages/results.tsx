import type { Song } from "~/types/playlist"
import { ErrorBoundary, For, Show } from "solid-js"
import { type RouteSectionProps, createAsync } from "@solidjs/router"


import { searchResults } from "./results.data"
import { usePlaylist } from "~/context/playlist"
import Thumbnail from "~/components/Thumbnail"


function ResultList (props: { search: string }) {
  const songs = createAsync(() => searchResults(props.search))

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

export default function Results(props: RouteSectionProps) {
  return (
    <ErrorBoundary fallback={<ErrorPage />}>
      <ResultList search={props.location.query.search} />
    </ErrorBoundary>
  )
}


function ItemResult(props: {
  result: Song
  onSelect: () => void
}) {
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

function ResultFallback() {
  return (
    <For each={Array.from({ length: 15 }, (_, i) => i)}>
      {ItemResultSkeleton}
    </For>
  )
}

function ErrorPage() {
  return (
    <Show when={window.navigator.onLine} fallback={<NoConnectionPage />}>
      <div class="h-96 flex justify-center items-center">
        <h1 class="text-3xl text-base-content font-medium">Ha ocurrido un error en la busqueda </h1>
      </div>
    </Show>
  )
}

function NoConnectionPage(){
  return (
    <div class="h-96 flex flex-col gap-1 justify-center items-center">
      <h1 class="text-3xl text-base-content font-medium">No hay internet </h1>
      <h2 class="text-xl">Por favor revise su conexion</h2>
    </div>
  )
}