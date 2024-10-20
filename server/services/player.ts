import { youtubeCookieString } from "../data/cookies";

const API_KEY = 'AIzaSyB-63vPrdThhKuerbB2N_l7Kwwcxj6yUAc'

const PLAYER_DATA = {
    platform: "MOBILE",
    clientName: "ANDROID",
    clientVersion: "19.30.36",
    osName: "Android",
    osVersion : "14",
    sdkVersion: "34"
  }

const generateClientPlaybackNonce = (length: number) => {
  const CPN_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  return Array.from({ length }, () => CPN_CHARS[Math.floor(Math.random() * CPN_CHARS.length)]).join('');
}

const getBodyPlayer = (videoId: string) => ({
    videoId,
    cpn: generateClientPlaybackNonce(16),
    racyCheckOk: true,
    contentCheckOk: true,
    context: {
      client: {
        clientName: PLAYER_DATA.clientName,
        clientVersion: PLAYER_DATA.clientVersion,
        platform: PLAYER_DATA.platform,
        osName: PLAYER_DATA.osName,        
        osVersion: PLAYER_DATA.osVersion,
        androidSdkVersion: PLAYER_DATA.sdkVersion,
        hl: 'en',
        gl: "US",
        utcOffsetMinutes: -240,
      },
      request: {
        internalExperimentFlags: [],
        useSsl: true,
      },
      user: {
        lockedSafetyMode: false,
      },
    },
})



export async function getInfoPlayer(videoId: string) {
  const headers = {
    // "Cookie": youtubeCookieString,
    'X-YouTube-Client-Name': '5',
    'User-Agent': `com.google.android.youtube/${PLAYER_DATA.clientVersion} (Linux; U; Android ${PLAYER_DATA.osVersion}; en_US) gzip`,
    'content-type': 'application/json',
    'X-Goog-Api-Format-Version': '2'
  }
  
  const boby = getBodyPlayer(videoId)
  
  const res = await fetch(`https://www.youtube.com/youtubei/v1/player?key${API_KEY}&prettyPrint=false`, { method: 'POST', body: JSON.stringify(boby), headers });
  // throw an error when failed to get info
  if(!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const json = await res.json();
  return json;
}

export async function getAudioFormats(videoId: string) {
    const info = await getInfoPlayer(videoId);

    console.log(info)

    // get formats
    const formats = info.streamingData.adaptiveFormats;
    const audio = formats.filter(f => !f.mimeType.includes('video'));
    
    const audiosSorted = audio.sort((a, b) => Number(b.contentLength) - Number(a.contentLength))

    return audiosSorted as AudioPlaybackMetadata[]
}

type AudioPlaybackMetadata = {
    itag: number;
    url: string;
    mimeType: string;
    bitrate: number;
    initRange: {
      start: string;
      end: string;
    };
    indexRange: {
      start: string;
      end: string;
    };
    lastModified: string;
    contentLength: string;
    quality: string;
    projectionType: string;
    averageBitrate: number;
    audioQuality: string;
    approxDurationMs: string;
    audioSampleRate: string;
    audioChannels: number;
    loudnessDb: number;
  };