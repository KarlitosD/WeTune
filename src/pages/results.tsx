import { createSignal, ErrorBoundary, For, Show } from "solid-js"
import { type RouteSectionProps, createAsync } from "@solidjs/router"

import { searchResults } from "./results.data"
import { usePlaylist } from "~/context/playlist"
import { SongItem, SongItemSkeleton } from "~/components/SongItem"
import { useI18nContext } from "~/i18n/i18n-solid"


function ResultList(props: { search: string }) {
  const [activeTab, setActiveTab] = createSignal("songs")

  const results = createAsync(() => searchResults(props.search))

  const { playSong } = usePlaylist()

  const { LL } = useI18nContext()

  const resultsSelected = () => (activeTab() === "songs" ? results()?.songs : results()?.videos) ?? []

  return (
    <>
      <div class="flex flex-col gap-2 p-4 h-full overflow-y-scroll scrollbar-track-base-100 scrollbar-thumb-primary">
        <div role="tablist" class="tabs tabs-boxed">
          <a role="tab" class="tab" classList={{ "tab-active": activeTab() === "songs" }} onClick={() => setActiveTab("songs")}>{LL().SONGS()}</a>
          <a role="tab" class="tab" classList={{ "tab-active": activeTab() === "videos" }} onClick={() => setActiveTab("videos")}>{LL().VIDEOS()}</a>
        </div>
        <Show when={Boolean(results()?.songs) && Boolean(results()?.videos)} fallback={<ResultFallback />}>
          <For each={resultsSelected() ?? []} fallback={<ResultEmpty />}>
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
      <ResultList search={props.location.query.search as string} />
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