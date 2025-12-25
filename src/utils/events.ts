import { createEmitter } from "@solid-primitives/event-bus";

export type ToastEventData = {
    type: "success" | "error" | "info" | "loading"
    title: string
    description?: string
    duration?: number
}

export const toastEvent = createEmitter<{ "add": ToastEventData; "dismiss": string }>()

export const audioPlayerEvent = createEmitter<{ "play": void; "pause": void, "togglePlay": void }>()