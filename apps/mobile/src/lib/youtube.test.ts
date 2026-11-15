import { describe, expect, it } from "vitest";
import {
  classifyPlayer,
  createYoutubeClient,
  downloadAudio,
  parseContentRange,
  pickAudio,
  type AudioSource,
} from "./youtube";

const basePlayer = {
  streamingData: {
    adaptiveFormats: [
      {
        mimeType: "audio/webm; codecs=opus",
        url: "https://media.example/opus.webm",
        bitrate: 160000,
        itag: 251,
      },
      {
        mimeType: "audio/mp4; codecs=mp4a.40.2",
        url: "https://media.example/aac-128.m4a",
        bitrate: 128000,
        itag: 140,
        approxDurationMs: "213000",
      },
      {
        mimeType: "audio/mp4; codecs=mp4a.40.2",
        url: "https://media.example/aac-256.m4a",
        bitrate: 256000,
        itag: 141,
      },
      {
        mimeType: "audio/mp4; codecs=mp4a.40.2",
        url: "https://media.example/drc.m4a",
        bitrate: 300000,
        isDrc: true,
      },
      {
        mimeType: "audio/mp4; codecs=mp4a.40.2",
        url: "https://media.example/dub.m4a",
        bitrate: 320000,
        audioTrack: { audioIsDefault: false },
      },
      {
        mimeType: "audio/mp4; codecs=mp4a.40.2",
        url: "https://media.example/drm.m4a",
        bitrate: 340000,
        drmFamilies: ["widevine"],
      },
      {
        mimeType: "video/mp4",
        url: "https://media.example/video.mp4",
        bitrate: 900000,
      },
    ],
  },
};

describe("pickAudio", () => {
  it("prefiere AAC y respeta highest/lowest", () => {
    expect(pickAudio(basePlayer, "dQw4w9WgXcQ", "highest")).toMatchObject({
      url: "https://media.example/aac-256.m4a",
      mimeType: "audio/mp4",
      bitrate: 256000,
      itag: 141,
      client: "visionos",
    });
    expect(pickAudio(basePlayer, "dQw4w9WgXcQ", "lowest")).toMatchObject({
      url: "https://media.example/aac-128.m4a",
      bitrate: 128000,
      durationMs: 213000,
    });
  });

  it("descarta DRC, DRM y pistas no default", () => {
    const source = pickAudio(basePlayer, "dQw4w9WgXcQ", "highest");
    expect(source?.url).not.toContain("drc");
    expect(source?.url).not.toContain("drm");
    expect(source?.url).not.toContain("dub");
  });

  it("cae a otros codecs si no hay AAC", () => {
    const player = {
      streamingData: {
        adaptiveFormats: [
          { mimeType: "audio/webm; codecs=opus", url: "https://media.example/low.webm", bitrate: 64 },
          { mimeType: "audio/webm; codecs=opus", url: "https://media.example/high.webm", bitrate: 128 },
        ],
      },
    };
    expect(pickAudio(player, "dQw4w9WgXcQ", "highest")?.url).toContain("high");
    expect(pickAudio(player, "dQw4w9WgXcQ", "lowest")?.url).toContain("low");
  });

  it("devuelve null sin streamingData", () => {
    expect(pickAudio({}, "dQw4w9WgXcQ", "highest")).toBeNull();
  });
});

describe("classifyPlayer", () => {
  it("acepta OK con streamingData", () => {
    expect(classifyPlayer({ playabilityStatus: { status: "OK" }, streamingData: {} }, "dQw4w9WgXcQ")).toEqual({
      ok: true,
      status: "OK",
    });
  });

  it("clasifica bot, edad, región y stub", () => {
    expect(
      classifyPlayer(
        { playabilityStatus: { status: "ERROR", reason: "Sign in to confirm you're not a bot" } },
        "dQw4w9WgXcQ",
      ),
    ).toMatchObject({ ok: false, kind: "bot", fatal: true });

    expect(
      classifyPlayer(
        { playabilityStatus: { status: "AGE_VERIFICATION_REQUIRED", reason: "age restricted" } },
        "dQw4w9WgXcQ",
      ),
    ).toMatchObject({ ok: false, kind: "age", fatal: false });

    expect(
      classifyPlayer(
        { playabilityStatus: { status: "ERROR", reason: "not available in your country" } },
        "dQw4w9WgXcQ",
      ),
    ).toMatchObject({ ok: false, kind: "region", fatal: false });

    expect(
      classifyPlayer({ videoDetails: { videoId: "AAAAAAAAAAA" } }, "dQw4w9WgXcQ"),
    ).toMatchObject({ ok: false, kind: "stub", fatal: true });
  });
});

describe("parseContentRange", () => {
  it("acepta rangos completos y total desconocido", () => {
    expect(parseContentRange("bytes 0-0/123")).toEqual({ start: 0, end: 0, total: 123 });
    expect(parseContentRange("bytes 2-3/*")).toEqual({ start: 2, end: 3, total: undefined });
  });

  it("rechaza rangos inválidos", () => {
    expect(() => parseContentRange(null)).toThrow("Content-Range");
    expect(() => parseContentRange("bytes 3-2/10")).toThrow("Content-Range");
    expect(() => parseContentRange("bytes 0-10/10")).toThrow("Content-Range");
  });
});

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("createYoutubeClient", () => {
  it("resuelve visitorData y devuelve la mejor pista AAC", async () => {
    const calls: { url: string; init?: RequestInit }[] = [];
    const fetchFn = (async (input: string | URL | Request, init?: RequestInit) => {
      const url = String(input);
      calls.push({ url, init });
      if (url.includes("/visitor_id")) {
        return jsonResponse({ responseContext: { visitorData: "VISITOR%3D123" } });
      }
      if (url.includes("/player")) {
        return jsonResponse(basePlayer);
      }
      throw new Error(`unexpected url ${url}`);
    }) as typeof fetch;

    const client = createYoutubeClient({ fetchFn });
    const source = await client.resolve("dQw4w9WgXcQ", "highest");

    expect(source.url).toBe("https://media.example/aac-256.m4a");
    const playerCall = calls.find((call) => call.url.includes("/player"));
    const headers = new Headers(playerCall?.init?.headers);
    expect(headers.get("x-goog-visitor-id")).toBe("VISITOR=123");
    expect(headers.get("x-youtube-client-name")).toBe("101");
    expect(headers.get("x-youtube-client-version")).toBe("1.02");
    const body = JSON.parse(String(playerCall?.init?.body));
    expect(body.context.client.visitorData).toBe("VISITOR=123");
    expect(body.videoId).toBe("dQw4w9WgXcQ");
  });

  it("no consulta YouTube con un id inválido", async () => {
    let called = false;
    const fetchFn = (async () => {
      called = true;
      return jsonResponse({});
    }) as typeof fetch;
    await expect(createYoutubeClient({ fetchFn }).resolve("corto")).rejects.toThrow("Invalid videoId");
    expect(called).toBe(false);
  });

  it("devuelve la metadata del player para links viejos de share", async () => {
    const fetchFn = (async (input: string | URL | Request) => {
      const url = String(input);
      if (url.includes("/visitor_id")) {
        return jsonResponse({ responseContext: { visitorData: "VISITOR%3D123" } });
      }
      if (url.includes("/player")) {
        return jsonResponse({
          videoDetails: {
            videoId: "dQw4w9WgXcQ",
            title: "Da Funk",
            author: "Daft Punk - Topic",
            channelId: "UCRr1xG_2WIDs18a6cIiCxeA",
            lengthSeconds: "329",
          },
          streamingData: {},
        });
      }
      throw new Error(`unexpected url ${url}`);
    }) as typeof fetch;

    await expect(createYoutubeClient({ fetchFn }).getVideoInfo("dQw4w9WgXcQ")).resolves.toEqual({
      videoId: "dQw4w9WgXcQ",
      title: "Da Funk",
      author: "Daft Punk - Topic",
      channelId: "UCRr1xG_2WIDs18a6cIiCxeA",
      duration: 329,
    });
  });

  it("rechaza un player sin título ni id", async () => {
    const fetchFn = (async (input: string | URL | Request) => {
      const url = String(input);
      if (url.includes("/visitor_id")) {
        return jsonResponse({ responseContext: { visitorData: "VISITOR%3D123" } });
      }
      return jsonResponse({ streamingData: {} });
    }) as typeof fetch;

    await expect(createYoutubeClient({ fetchFn }).getVideoInfo("dQw4w9WgXcQ")).rejects.toThrow(
      "metadata",
    );
  });
});

describe("downloadAudio", () => {
  it("valida probe y chunks antes de entregar bytes", async () => {
    const source: AudioSource = {
      videoId: "dQw4w9WgXcQ",
      url: "https://media.example/song.m4a",
      mimeType: "audio/mp4",
      bitrate: 128000,
      client: "visionos",
    };
    const fetchFn = (async (_input: string | URL | Request, init?: RequestInit) => {
      const range = new Headers(init?.headers).get("range");
      if (range === "bytes=0-0") {
        return new Response(null, { status: 206, headers: { "content-range": "bytes 0-0/5" } });
      }
      if (range === "bytes=0-4") {
        return new Response("hello", { status: 206, headers: { "content-range": "bytes 0-4/5" } });
      }
      throw new Error(`unexpected range ${range}`);
    }) as typeof fetch;

    const chunks: string[] = [];
    const total = await downloadAudio(source, {
      fetchFn,
      onChunk: (bytes) => {
        chunks.push(new TextDecoder().decode(bytes));
      },
    });
    expect(total).toBe(5);
    expect(chunks.join("")).toBe("hello");
  });

  it("espera la escritura de cada chunk antes de pedir el siguiente", async () => {
    const source: AudioSource = {
      videoId: "dQw4w9WgXcQ",
      url: "https://media.example/song.m4a",
      mimeType: "audio/mp4",
      bitrate: 128000,
      client: "visionos",
    };
    const chunkSize = 2 * 1024 * 1024;
    const total = chunkSize + 5;
    let writing = false;
    let concurrentWrite = false;

    const fetchFn = (async (_input: string | URL | Request, init?: RequestInit) => {
      const range = new Headers(init?.headers).get("range");
      if (range === "bytes=0-0") {
        return new Response(null, {
          status: 206,
          headers: { "content-range": `bytes 0-0/${total}` },
        });
      }
      if (writing) concurrentWrite = true;
      const [start, end] = /^bytes=(\d+)-(\d+)$/.exec(range ?? "")?.slice(1).map(Number) ?? [];
      return new Response(new Uint8Array(end - start + 1), {
        status: 206,
        headers: { "content-range": `bytes ${start}-${end}/${total}` },
      });
    }) as typeof fetch;

    const written: number[] = [];
    const downloaded = await downloadAudio(source, {
      fetchFn,
      onChunk: async (bytes) => {
        writing = true;
        // Simula la escritura real del archivo (expo-file-system es async).
        await Promise.resolve();
        written.push(bytes.length);
        writing = false;
      },
    });

    expect(concurrentWrite).toBe(false);
    expect(downloaded).toBe(total);
    expect(written).toEqual([chunkSize, 5]);
  });
});
