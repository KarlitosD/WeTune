import { fetch } from '~/utils/fetch';
import { cookie } from './cookie';

export type Quality = 'highest' | 'lowest';

const INNERTUBE_CLIENTS = {
  android_sdkless: {
    clientName: 'ANDROID',
    clientVersion: '20.10.38',
    userAgent: 'com.google.android.youtube/20.10.38 (Linux; U; Android 11) gzip',
    osName: 'Android',
    osVersion: '11',
  },
};

async function fetchYT(videoId: string, clientKey: string): Promise<any> {
  const clientConfig = INNERTUBE_CLIENTS[clientKey as keyof typeof INNERTUBE_CLIENTS];
  if (!clientConfig) {
    throw new Error(`Unknown client: ${clientKey}`);
  }

  const url = new URL('https://www.youtube.com/youtubei/v1/player');
  url.searchParams.set('key', 'AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8');
  url.searchParams.set('prettyPrint', 'false');

  const requestBody = {
    context: {
      client: {
        clientName: clientConfig.clientName,
        clientVersion: clientConfig.clientVersion,
        ...(clientConfig.osName && { osName: clientConfig.osName }),
        ...(clientConfig.osVersion && { osVersion: clientConfig.osVersion }),
        hl: 'en',
        timeZone: 'UTC',
        utcOffsetMinutes: 0,
      },
    },
    videoId,
    playbackContext: {
      contentPlaybackContext: {
        vis: 0,
        splay: false,
        lactMilliseconds: '-1',
      },
    },
    contentCheckOk: true,
    racyCheckOk: true,
  };

  const headers: Record<string, string> = {
    'content-type': 'application/json',
    'Cookie': cookie,
    'Accept': '*/*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Origin': 'https://www.youtube.com',
    'Referer': 'https://www.youtube.com/',
    'x-goog-authuser': '0',
  };

  if (clientConfig.userAgent) {
    headers['User-Agent'] = clientConfig.userAgent;
  }

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers,
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    console.log(await response.text())
    throw new Error(`API call failed: ${response.status}`);
  }

  return await response.json();
}

/**
 * Download audio from YouTube by videoId
 * @param videoId - YouTube video ID (11 characters)
 * @param quality - 'best' for highest quality, 'worst' for lowest quality
 * @returns Blob containing the audio data
 */
export async function downloadYoutubeAudio(
  videoId: string,
  quality: Quality = 'highest'
): Promise<Blob> {
  if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    throw new Error('Invalid videoId');
  }

  const apiResponse = await fetchYT(videoId, 'android_sdkless');
  const streamingData = apiResponse?.streamingData;

  if (!streamingData) {
    throw new Error('No streaming data available');
  }

  const formats = streamingData.adaptiveFormats || streamingData.formats || [];
  const audioFormats = formats.filter(
    (f: any) => f.mimeType?.startsWith('audio/') && f.url
  );

  if (audioFormats.length === 0) {
    throw new Error('No audio formats with direct URLs available');
  }

  // Prefer AAC/MP4 format for maximum browser compatibility
  const aacFormats = audioFormats.filter((f: any) => f.mimeType?.includes('mp4a'));
  const compatibleFormats = aacFormats.length > 0 ? aacFormats : audioFormats;

  // Sort by bitrate and select based on quality preference
  compatibleFormats.sort((a: any, b: any) => (a.bitrate || 0) - (b.bitrate || 0));
  const selectedFormat = quality === 'highest'
    ? compatibleFormats[compatibleFormats.length - 1]
    : compatibleFormats[0];
  const downloadUrl = selectedFormat.url;

  // Download with single Range request (fast and simple)
  const headResponse = await fetch(downloadUrl, { method: 'HEAD' });
  const totalBytes = parseInt(headResponse.headers.get('content-length') || '0');

  const response = await fetch(downloadUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Range': `bytes=0-${totalBytes - 1}`
    }
  });

  if (!response.ok && response.status !== 206) {
    throw new Error(`Download failed: ${response.status}`);
  }

  return new Blob([await response.arrayBuffer()], { type: selectedFormat.mimeType.split(';')[0] });
}
