import { Song } from "~/db/schema";
import { IconShare } from "./Icons";
import { Show } from "solid-js";
import { useShare } from "~/hooks/useShare";

export function ShareSongButton(props: { song: Song }) {
    const { handleShare, isCompatible } = useShare(() => props.song)

    return ( 
        <Show when={isCompatible} fallback={<div class="w-[20px]" />}>
            <button onClick={handleShare} class="w-fit">
                <IconShare size={20} />
            </button>
        </Show>
    )
}