import { PO_TOKEN, VISITOR_DATA } from "../data/youtubeCredentials.ts"
import { YtdlCore } from "@ybd-project/ytdl-core"

const ydtl = new YtdlCore({ poToken: PO_TOKEN, visitorData: VISITOR_DATA })

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