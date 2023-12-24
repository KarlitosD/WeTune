import { Show } from "solid-js";
import { type RouteSectionProps } from "@solidjs/router";
import { usePlaylist } from "~/context/playlist";
import AudioPlayer from "~/components/AudioPlayer";

export default function HomeWrapper(props: RouteSectionProps) {
  const { selected } = usePlaylist()
  
  // onMount(() => {
  //   const lastSongString = window.localStorage.getItem("last")
  //   if (lastSongString) setPlaylist([JSON.parse(lastSongString)])
  // })

  return (
    <>
      <main class="container h-full mx-auto text-center text-gray-700">
        {props.children}
        <div class="fixed left-0 bottom-0 w-full bg-indigo-800">
          <Show when={selected?.song}>
            <AudioPlayer song={selected.song} selected={selected} />
          </Show>
        </div>
      </main>
    </>
  );
}
