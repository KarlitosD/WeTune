import { $ } from "bun"

const tableSongs = await $`netlify blobs:list songs`


const keys = tableSongs.split("\n").slice(5, -2).map(line => {
    const [, key] = line.split("|")
    return key.trim()
})

for (const key of keys) {
    try {
        await $`netlify blobs:delete songs ${key}`
        console.log(`deleted ${key}`)
    } catch (e) {
        console.log(`failed to delete ${key}`)
    }
}