import { ErrorBoundary, For, Show } from "solid-js"
import { type RouteSectionProps, createAsync } from "@solidjs/router"

import { searchResults } from "./results.data"
import { usePlaylist } from "~/context/playlist"
import { SongItem, SongItemSkeleton } from "~/components/SongItem"


function ResultList(props: { search: string }) {
  const songs = createAsync(() => searchResults(props.search))

  const { addSong } = usePlaylist()
  return (
    <>
      <div class="flex flex-col gap-2 p-4">
        <For each={songs()} fallback={<ResultFallback />}>
          {result => <SongItem song={result} onSelect={() => addSong(result)} />}
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



function ResultFallback() {
  return (
    <For each={Array.from({ length: 15 }, (_, i) => i)}>
      {SongItemSkeleton}
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

function NoConnectionPage() {
  return (
    <div class="h-96 flex flex-col gap-1 justify-center items-center">
      <h1 class="text-3xl text-base-content font-medium">No hay internet </h1>
      <h2 class="text-xl">Por favor revise su conexion</h2>
    </div>
  )
}