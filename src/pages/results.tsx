import { ErrorBoundary, For, Show } from "solid-js"
import { type RouteSectionProps, createAsync } from "@solidjs/router"

import { searchResults } from "./results.data"
import { usePlaylist } from "~/context/playlist"
import { SongItem, SongItemSkeleton } from "~/components/SongItem"
import { useI18nContext } from "~/i18n/i18n-solid"


function ResultList(props: { search: string }) {
  const results = createAsync(() => searchResults(props.search))

  const { playSong } = usePlaylist()

  const { LL } = useI18nContext()
  return (
    <>
      <div class="flex flex-col gap-2 p-4 h-full overflow-y-scroll scrollbar-track-base-100 scrollbar-thumb-primary">
        <h2 class="text-2xl text-white self-start my-2">{LL().SONGS()}</h2>
        <Show when={Boolean(results()?.songs)} fallback={<ResultFallback />}>
          <For each={results()?.songs ?? []} fallback={<ResultEmpty />}>
            {result => <SongItem song={result} onSelect={() => playSong(result)} />}
          </For>
        </Show>
        <div class="divider"></div> 
        <h2 class="text-2xl text-white self-start my-2">{LL().VIDEOS()}</h2>
        <Show when={Boolean(results()?.videos)} fallback={<ResultFallback />}>
          <For each={results()?.videos ?? []} fallback={<ResultEmpty />}>
            {result => <SongItem song={result} onSelect={() => playSong(result)} />}
          </For>
        </Show>
      </div>
    </>
  )
}

export default function Results(props: RouteSectionProps) {
  return (
    <ErrorBoundary fallback={(error) => {
      console.error(error)
      return <ErrorPage />
    }}>
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

function ResultEmpty() {
  const { LL } = useI18nContext()
  return (
    <div class="flex flex-col justify-center items-center">
      <h2 class="text-2xl py-2 text-base-content font-medium">{LL().NO_RESULTS()}</h2>
    </div>
  )
}

function ErrorPage() {
  const { LL } = useI18nContext()
  return (
    <Show when={window.navigator.onLine} fallback={<NoConnectionPage />}>
      <div class="h-96 flex justify-center items-center">
        <h1 class="text-3xl text-base-content font-medium">{LL().RESULTS_ERROR()}</h1>
      </div>
    </Show>
  )
}

function NoConnectionPage() {
  const { LL } = useI18nContext()
  return (
    <div class="h-96 flex flex-col gap-1 justify-center items-center">
      <h1 class="text-3xl text-base-content font-medium">{LL().NO_INTERNET()}</h1>
      <h2 class="text-xl">{LL().CHECK_CONNECTION()}</h2>
    </div>
  )
}