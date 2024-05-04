import type { Accessor } from "solid-js"
import type { Song } from "~/db/schema"

export function useShare(song: Song){
    const isCompatible = () => "share" in navigator

    const handleShare = () => {
        if (!isCompatible()) return

        const location = new URL(window.location.href)
        const url = new URL("/share/song", location.origin)

        url.searchParams.set("songId", song.youtubeId)

        navigator.share({
            title: song.title,
            text: song.title,
            url: url.href,
        })
    }

    return { handleShare, isCompatible }
}