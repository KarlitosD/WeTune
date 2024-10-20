import { PO_TOKEN, VISITOR_DATA } from "../data/youtubeCredentials"
import * as core from "@ybd-project/ytdl-core/serverless"

const ydtl = new core.YtdlCore({ poToken: PO_TOKEN, visitorData: VISITOR_DATA, fetcher: (url, options) => fetch(url, options) })

const BASE_URL = "https://www.youtube.com/watch?v="

export async function getInfoPlayer(videoId: string) {
  const info = await ydtl.getFullInfo(BASE_URL + videoId)
  return info
}

export async function getAudioFormats(videoId: string) {
    const info = await getInfoPlayer(videoId);
    const formats = info.formats;
    const audio = formats.filter(f => !f.mimeType.includes('video') && f.sourceClientName === "ios");
    
    const audiosSorted = audio.sort((a, b) => Number(b.contentLength) - Number(a.contentLength))
    return audiosSorted
}