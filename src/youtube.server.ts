import { YoutubeAPIClient } from "youtube-api-v3-wrapper"

export const youtube = new YoutubeAPIClient("key", import.meta.env.VITE_YOUTUBE_API_KEY)