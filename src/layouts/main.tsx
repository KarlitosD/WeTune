import { Show } from "solid-js";
import { Outlet } from "@solidjs/router";
import { usePlaylist } from "~/context/playlist";
import AudioPlayer from "~/components/AudioPlayer";

export default function HomeWrapper() {
  const { selected } = usePlaylist()
  
  // onMount(() => {
  //   const lastSongString = window.localStorage.getItem("last")
  //   if (lastSongString) setPlaylist([JSON.parse(lastSongString)])
  // })

  return (
    <>
      <main class="container h-full mx-auto text-center text-gray-700">
        <Outlet />
        <div class="fixed left-0 bottom-0 w-full bg-indigo-800">
          <Show when={selected?.song}>
            <AudioPlayer song={selected.song} selected={selected} />
          </Show>
        </div>
      </main>
    </>
  );
}
