import { Song } from "~/db/schema"

const WSRV_NL_URL = "https://wsrv.nl"

const YOUTUBE_THUMBNAIL_URL = "https://i.ytimg.com/vi/"

const getWsrvUrl = () => new URL(WSRV_NL_URL)

const getYoutubeThumbnailUrl = (id, resolution: Resolution) => new URL(`${id}/${resolution}.jpg`, YOUTUBE_THUMBNAIL_URL)

export enum Resolution {
    Lowest = "default",
    Medium = "mqdefault",
    High = "hqdefault",
    Standard = "sddefault",
    Max = "maxresdefault",
}

type OptionsThumbnail = {
    resolution: Resolution, 
    w: string,
    h: string,
    fit: string,
}

export const getThumbnailUrl = (id: Song["youtubeId"], options?: OptionsThumbnail) => {
    const defaultOptions = {
        resolution: Resolution.Medium,
    }

    const wsrvUrl = getWsrvUrl()

    const youtubeUrl = getYoutubeThumbnailUrl(id, options?.resolution ?? defaultOptions.resolution)

    wsrvUrl.searchParams.set("url", youtubeUrl.href)
    if(options?.w) wsrvUrl.searchParams.set("w", options.w)
    if(options?.h) wsrvUrl.searchParams.set("h", options.h)
    if(options?.fit) wsrvUrl.searchParams.set("fit", options.fit)

    return wsrvUrl.href
}