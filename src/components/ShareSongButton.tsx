import { Song } from "~/db/schema";
import IconShare from "./Icons/IconShare";

export function ShareSongButton(props: { song: Song }) {

    const handleShare = () => {
        const location = new URL(window.location.href)
        const url = new URL("/share/song", location.origin)

        url.searchParams.set("songId", props.song.youtubeId)

        navigator.share({
            title: props.song.title,
            text: props.song.title,
            url: url.href
        })
    }

    return ( 
        <button onClick={handleShare} class="w-fit">
            <IconShare size={20} />
        </button>
    )
}