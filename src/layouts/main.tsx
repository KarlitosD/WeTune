import { Show } from "solid-js";
import { type RouteSectionProps } from "@solidjs/router";
import { usePlaylist } from "~/context/playlist";
import AudioPlayer from "~/components/AudioPlayer";

export default function HomeWrapper(props: RouteSectionProps) {
  const { selected } = usePlaylist()

  return (
    <>
      <main class="container max-h-full h-full mx-auto text-center text-gray-700">
        {props.children}
        <div class="fixed left-0 bottom-0 w-full bg-base-100 shadow-lg shadow-slate-50">
          <Show when={selected?.song}>
            <AudioPlayer song={selected.song} selected={selected} />
          </Show>
        </div>
      </main>
    </>
  );
}

