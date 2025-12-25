# WeTune - Agent Guidelines

## Tech Stack
- **Frontend**: SolidJS (JSX, reactive signals), TypeScript, Tailwind CSS + DaisyUI
- **Desktop**: Tauri v2 (Rust backend, cross-platform)
- **Database**: SignalDB with IndexedDB adapter
- **Build**: Vite 7.x
- **i18n**: typesafe-i18n

## Available Commands

```bash
# Development (runs typesafe-i18n watcher + Vite dev server)
npm run dev

# Production build
npm run build

# Preview production build
npm run serve

# Tauri commands
npm run tauri <command>  # e.g., `npm run tauri dev`, `npm run tauri build`
```

**No test runner configured** - Add testing infrastructure before writing tests.

## Code Style Guidelines

### Imports & Path Aliases
- Use `~` alias for src directory imports: `~/components/...`, `~/utils/...`, etc.
- Import order: 1) External dependencies, 2) Internal with `~` alias, 3) Relative imports
- Group imports by type (React/Solid primitives, types, components, utils)
- Use barrel exports (`index.ts`) for component groups (e.g., Icons, services)

```typescript
import { createSignal, createEffect } from "solid-js"
import type { Song } from "~/db/schema"
import { fetchAudioURL } from "~/services/cache"
import { formatSeconds } from "~/utils/seconds"
```

### Component Conventions
- Use PascalCase for component files and exports (`AudioPlayer.tsx`)
- Define props interfaces before the component function
- Use PascalCase for component prop types with descriptive names
- Export default for main component, named exports for utilities

```typescript
type AudioPlayerProps = {
    selected: PlaylistContextData["selected"]
    song: PlaylistContextData["selected"]["song"]
}

export default function AudioPlayer(props: AudioPlayerProps) {
    // ...
}
```

### TypeScript & Types
- Use `@sinclair/typebox` for runtime validation schemas in `src/db/schema.ts`
- Export types from TypeBox schemas: `export type Song = Static<typeof songSchema>`
- Prefer explicit type annotations for function parameters
- Use `Accessor<T>` for signal arguments, direct return values for signals
- Avoid `any` - never suppress type errors

### SolidJS Reactive Patterns
- Use `createSignal` for primitive state, `createMemo` for derived state
- Use `createEffect` for side effects, `onCleanup` for cleanup
- Use `createMutable` for objects with internal mutability (like `selected` in context)
- Wrap related state updates in `batch()` to avoid unnecessary re-renders
- Call signals as functions: `volume()`, not `volume`

```typescript
const [playing, setPlaying] = createSignal(false)
const volumeLevel = () => volume() ** 2

// Batch updates together
batch(() => {
    setVolume(lastVolumeLevel())
    setLastVolumeLevel(volumeLevel)
})
```

### Naming Conventions
- **Components**: PascalCase (`AudioPlayer`, `PlaylistCard`)
- **Functions**: camelCase (`createAudio`, `playSong`, `handleDownload`)
- **Event handlers**: `handle*` prefix (`handlePrevious`, `handleNext`, `handleSubmit`)
- **Constants**: SCREAMING_SNAKE_CASE only for true constants (`PLAYLISTS.HISTORY`)
- **Signals**: descriptive names with `get` prefix if accessor pattern (`getYoutubeId()`)

### Error Handling
- Throw descriptive `Error` objects for validation failures
- Return early on preconditions: `if(!playlistId || !song) throw new Error("PlaylistId and song are required")`
- Use async/await for all async operations
- No empty catch blocks - always handle errors appropriately

### Styling (Tailwind + DaisyUI)
- Use `class` attribute (not `className`) for SolidJS
- Leverage DaisyUI utility classes: `btn`, `input`, `modal`, `dialog`, `divider`
- Use `classList={{ "active": condition }}` for conditional classes
- Responsive design: prefix mobile-first, use `sm:` for larger screens
- Size utilities: `text-3xl`, `w-32`, `h-32`, `p-4`, `gap-2`, etc.

### File Organization
```
src/
├── components/        # UI components (PascalCase files)
│   ├── Icons/         # Icon components with barrel export (index.ts)
│   └── Layout/        # Layout components
├── hooks/             # Custom Solid hooks (create* pattern)
├── context/           # Solid contexts with Provider + use* hook
├── services/          # Business logic, API calls, data layer
├── utils/             # Pure utility functions
├── db/                # Database schemas and access
├── types/             # Type definitions (avoid if using schema exports)
├── pages/             # Route components with .data.ts for data fetching
└── router/            # Route definitions
```

### Icon Components
- Wrap lucide-solid icons in thin wrapper components
- Export from `index.ts` barrel file
- Pass through all props using spread operator

```typescript
export default function IconPlay(props: IconProps) {
    return <Play {...props} />
}
```

### Data Fetching & API
- Use custom `fetch` wrapper from `~/utils/fetch` (handles Tauri vs web)
- Tauri builds use `@tauri-apps/plugin-http`, web builds use native fetch
- API URLs from `~/config` with `getApiUrl()`
- Cache API responses in Cache API for offline support

### i18n (Internationalization)
- Get context: `const { LL } = useI18nContext()`
- Use `LL()` to access translations: `LL().PLAYLISTS()`, `LL().SONGS_IN_PLAYLIST({ songs: count })`
- Run `npm run dev` to start typesafe-i18n watcher
- Locale files in `src/i18n/` with formatters in `src/i18n/formatters.ts`

### State Persistence
- Use `createPersistedSignal` from `~/hooks/createPersistedSignal` for localStorage
- Pass key and default value: `const [volume, setVolume] = createPersistedSignal("volume", 0.5)`

### Audio Caching
- Audio files cached using Cache API (`audios` cache)
- Track cached IDs in ReactiveSet persisted to localStorage
- Use `~/services/cache` for audio caching operations

## Tauri-Specific Notes
- Rust backend in `src-tauri/`
- Use `@tauri-apps/plugin-http` for HTTP requests in Tauri builds
- Check for Tauri environment: `typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window`
- Tauri dev server runs on fixed port (see vite.config.ts)

## When in Doubt
- Follow existing patterns in the codebase
- Check similar components/files for conventions
- SolidJS docs: https://www.solidjs.com
- Tauri docs: https://tauri.app
