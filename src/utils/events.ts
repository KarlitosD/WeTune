import { createEmitter } from "@solid-primitives/event-bus";


export const audioPlayerEvent = createEmitter<{ "play": void; "pause": void, "togglePlay": void }>()