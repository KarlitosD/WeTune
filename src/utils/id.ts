import { customAlphabet } from "nanoid"

const ALPHABET = "1234567890abcdefghijklmnopqrstuvwxyz"

export const createId = customAlphabet(ALPHABET, 5)