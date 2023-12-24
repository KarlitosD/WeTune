import { YoutubeAPIClient } from "youtube-api-v3-wrapper"

export const getYoutubeClient = (apiKey: string) => new YoutubeAPIClient("key", apiKey)