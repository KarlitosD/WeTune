import { defineHandler } from "nitro"

export default defineHandler(async () => `
    <h1>Listen odd number</h1>
    <audio src="/api/song/blob?songId=w7GgAvVy6-M&quality=lowest" controls></audio>
`)
