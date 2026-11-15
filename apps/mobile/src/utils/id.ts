import { customAlphabet } from "nanoid/non-secure";

// NOTE: non-secure (Math.random) a posta: es solo para IDs de playlist
// locales y evita depender de crypto.getRandomValues en Hermes.
// IDs cortos para playlists locales.
const ALPHABET = "1234567890abcdefghijklmnopqrstuvwxyz";

export const createId = customAlphabet(ALPHABET, 5);
