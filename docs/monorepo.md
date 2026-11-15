# Monorepo pnpm + Turborepo

> **Estado (2026-11-14):** fases 1–4 y 6–7 ejecutadas en la rama `feat/monorepo`
> (layout `apps/`, pnpm, Turborepo, CI, docs). Falta la fase 5
> (`packages/contracts`) y la verificación en device/EAS (G6–G7).

## Objetivo

Tener app y backend en un solo repositorio para iterar más rápido:

- Un solo `install` y un solo lockfile.
- Contrato de API compartido (`packages/contracts`), sin duplicación ni drift.
- Un comando para typecheck/lint/test de todo.
- Cambios de API y de cliente en el mismo commit y el mismo PR.

**No** es objetivo: acelerar builds nativos ni unificar despliegue. EAS y el VPS
siguen siendo dos caminos separados.

La migración a Nitro v3 está analizada aparte, en
[`docs/nitro-v3.md`](./nitro-v3.md): no forma parte de este plan y conviene
hacerla después del movimiento.

## Hechos verificados (2026-11-14)

| Comprobación | Resultado |
| --- | --- |
| Turborepo exige un framework | No. Es un runner sobre workspaces |
| El backend usa APIs de Bun | No. `grep "Bun\."` → 0. Bun es solo runner |
| `legacy-peer-deps=true` es necesario | **No.** Resolución limpia sin el flag en npm 12 y npm 10 (Node 22, el de CI) |
| Origen de `legacy-peer-deps` | Commit `ba89707` (scaffold), una línea, sin justificación |
| pnpm resuelve `mobile` | Sí: 875 paquetes, 11.4 s, solo warnings de peers |
| pnpm resuelve `wetune-backend` | Sí: 449 paquetes, 4.9 s |
| Expo soporta pnpm aislado | Sí desde SDK 54 (este repo es SDK 57) |
| `android/` e `ios/` | Generados (CNG) y en `.gitignore` |
| Historial del backend | No es importante → no hace falta `subtree` |

Warnings de peers que hoy tapa `legacy-peer-deps` y que conviene conocer:

```
react-native-worklets  0.13.1 instalado  vs  ^0.7.4–^0.10.0 (expo-modules-core)
@react-native/metro-config  0.88.1       vs  0.86.3 (@react-native/community-cli-plugin)
react-dom  faltante  (Radix/vaul, deps web de Expo Router)
```

Ninguno bloquea. No son parte de este plan.

## Estado de partida (⚠️ leer antes de empezar)

El working tree **no está limpio**: hay una migración TypeBox → Zod sin commitear.

```
 M AGENTS.md
 M mobile/README.md
 D mobile/metro.config.js
 M mobile/package-lock.json
 M mobile/package.json          (zod ^4.6.7, sin @sinclair/typebox)
 M mobile/src/api/client.ts
 M mobile/src/db/drizzle-schema.ts
 M mobile/src/db/schema.test.ts
 M mobile/src/db/schema.ts
```

El backend sigue en TypeBox (`server/schema/index.ts`, `server/services/youtube.ts`)
y arrastra 14 archivos modificados sin commitear.

**Regla:** no mezclar este movimiento con la migración Zod ni con el WIP del
backend. Un diff que mueve 300 archivos y cambia de librería de validación no se
puede revisar.

## Decisiones

### pnpm, no npm ni bun

- Un solo lockfile para ambos proyectos.
- `strict-peer-dependencies=false` es el default de pnpm → sustituye a
  `legacy-peer-deps` sin flag.
- Turborepo lee `pnpm-workspace.yaml` de forma nativa.
- El `.npmrc` del backend ya tenía sintaxis de pnpm desde 2024.
- `nodeLinker` aislado es el default y está soportado desde SDK 54.
- Escape si un módulo nativo falla: `nodeLinker: hoisted` en
  `pnpm-workspace.yaml`.

### Un solo repo sin historial del backend

Un repo anidado o un submódulo rompe el hashing de turbo (turbo no ve archivos
que el repo raíz no trackea). Al no importar el historial, el backend entra con
un `mv` normal.

### `packages/contracts` en Zod

`AGENTS.md` ya declara Zod como librería de validación del proyecto. Eso obliga
a migrar también el backend; si no, el paquete compartido no comparte nada real.

## Layout objetivo

```
wetune/
├── package.json              # privado, scripts con turbo
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── turbo.json
├── .github/workflows/ci.yml
├── apps/
│   ├── mobile/               # hoy: mobile/
│   └── backend/              # hoy: ../wetune-backend
├── packages/
│   └── contracts/            # Zod compartido
├── app-links/
├── brand/
└── docs/
```

---

## Fase 0 — Cerrar la migración Zod (prerrequisito)

- [ ] Revisar el diff actual de Zod y verificar:

  ```bash
  cd mobile
  npm run typecheck && npm run lint && npm test
  npx expo export --platform android
  ```

- [ ] Commit propio, sin mezclar nada más:

  ```bash
  git add -A mobile AGENTS.md
  git commit -m "feat(mobile): migrar validación de TypeBox a Zod"
  ```

- [ ] Confirmar que `react-native-track-player` quedó fijado a `5.0.0-alpha0`
      exacto (cambio ya presente en el working tree) y decidir si va en este
      commit o en otro: es independiente y conviene separarlo.

**Gate G0:** árbol limpio en `mobile/` y los cuatro comandos en verde.

## Fase 1 — Rama y punto de retorno

```bash
git checkout -b feat/monorepo
git tag pre-monorepo
```

- [ ] El tag permite volver con `git reset --hard pre-monorepo`.
- [ ] No borrar `/home/karlitosd/Documentos/Code/wetune-backend` hasta que el
      monorepo compile y despliegue.

## Fase 2 — Mover la app

```bash
mkdir -p apps packages
git mv mobile apps/mobile
```

- [ ] `apps/mobile/node_modules` no se versiona: borrarlo antes de instalar en la
      raíz (`rm -rf apps/mobile/node_modules`).
- [ ] `android/` e `ios/` están en `.gitignore` y son regenerables. Recomendado
      borrarlos antes del movimiento y regenerar después con
      `npx expo prebuild --clean`: arrastran rutas absolutas de Gradle/CocoaPods
      que quedan obsoletas. Si se mueven tal cual, el build puede reconstruir solo.
- [ ] Borrar `apps/mobile/.npmrc` (`legacy-peer-deps`). Ya no aplica con pnpm.
- [ ] Borrar `apps/mobile/package-lock.json`; el lockfile pasa a la raíz.
- [ ] Limpiar caché de Metro una vez: `npx expo start --clear`.

## Fase 3 — Traer el backend

```bash
# el backend debe estar commiteado o stasheado: su WIP son 14 archivos
cd ../wetune-backend && git status --short
```

- [ ] Commitear o stashear el WIP del backend (decisión del autor, no del
      movimiento).
- [ ] Copiar sin `.git` y sin `node_modules`:

  ```bash
  rsync -a --exclude .git --exclude node_modules --exclude .data \
    --exclude .output --exclude .nitro \
    /home/karlitosd/Documentos/Code/wetune-backend/ apps/backend/
  ```

- [ ] Borrar `apps/backend/bun.lock` y `apps/backend/.npmrc` (queda subsumido por
      la configuración de pnpm).
- [ ] Renombrar en `apps/backend/package.json`: `"name": "@wetune/backend"`.
- [ ] Opcional pero recomendado: quitar `"bun"` de `dependencies` (es un runner,
      no una librería; hoy obliga a un postinstall) y mover `@types/bun` a
      `devDependencies`. Si se mantiene, pnpm requiere aprobar su script de
      instalación.

## Fase 4 — Raíz pnpm + Turborepo

### `pnpm-workspace.yaml`

```yaml
packages:
  - "apps/*"
  - "packages/*"

# pnpm 10+ no ejecuta lifecycle scripts sin aprobación.
# esbuild lo necesita (nitro); bun solo si se conserva como dependencia.
onlyBuiltDependencies:
  - esbuild

# Solo si un módulo nativo falla con el linker aislado:
# nodeLinker: hoisted
```

### `package.json` raíz

```json
{
  "name": "wetune",
  "private": true,
  "packageManager": "pnpm@11.17.0",
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "typecheck": "turbo run typecheck",
    "lint": "turbo run lint",
    "test": "turbo run test"
  },
  "devDependencies": {
    "turbo": "^2"
  }
}
```

- [ ] Instalar turbo con la versión vigente en vez de fijarla a mano:
      `pnpm add -D -w turbo@latest`.
- [ ] `packageManager` fija la versión de pnpm para EAS y CI. Si se usa, no
      declarar `version` también en `pnpm/action-setup` (da error por duplicado).

### `turbo.json`

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".output/**"]
    },
    "typecheck": { "dependsOn": ["^build"] },
    "lint": {},
    "test": {},
    "dev": { "cache": false, "persistent": true }
  }
}
```

- [ ] `typecheck` depende de `^build` porque el backend necesita
      `.nitro/types` generado. Añadir en `apps/backend/package.json`:
      `"typecheck": "nitro prepare && tsc --noEmit"`.
- [ ] `i18n` queda fuera de turbo: solo lo usa la app y se ejecuta a mano.

### Scripts por paquete

- [ ] `apps/mobile`: sin cambios (`start`, `android`, `ios`, `typecheck`, `lint`,
      `test`, `i18n`).
- [ ] `apps/backend`: `dev`, `build`, `start`, más el `typecheck` nuevo.
- [ ] Verificar que `apps/mobile/package.json` tiene `"private": true`.

### Instalación

```bash
pnpm install
```

**Gate G1:** `pnpm install --frozen-lockfile` desde la raíz sin errores.

## Fase 5 — `packages/contracts`

### `packages/contracts/package.json`

```json
{
  "name": "@wetune/contracts",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": { ".": "./src/index.ts" },
  "types": "./src/index.ts",
  "dependencies": { "zod": "^4.6.7" }
}
```

### `packages/contracts/src/index.ts`

Mover el contenido actual de `apps/mobile/src/db/schema.ts` tal cual
(`songSchema`, `playlistSchema`, `Song`, `Playlist`). Los campos locales
`favorite` y `lastPlayedAt` se quedan opcionales: el backend no los devuelve.

### Consumidores

- [ ] `apps/mobile/package.json`: `"@wetune/contracts": "workspace:*"`
      y quitar `zod` de sus dependencias (lo aporta contracts).
- [ ] `apps/mobile/src/db/schema.ts`:

  ```ts
  // El contrato vive en packages/contracts; se re-exporta para no tocar los
  // imports existentes (~/db/schema).
  export * from "@wetune/contracts"
  ```

- [ ] `apps/backend/package.json`: `"@wetune/contracts": "workspace:*"`,
      quitar `@sinclair/typebox` y añadir `zod` si no viene transitivamente.
- [ ] `apps/backend/server/schema/index.ts`: `export * from "@wetune/contracts"`.
- [ ] `apps/backend/server/services/youtube.ts`: `Value.Check(songSchema, song)`
      → `songSchema.safeParse(song).success`.
- [ ] `pnpm install` de nuevo para enlazar el workspace.

**Gate G2:** `pnpm why -r zod` muestra una sola versión.

### Nota sobre resolución

`exports` apunta a fuente TypeScript. Metro (watchFolders automático desde
SDK 52) y Nitro (bundle con esbuild/rollup) lo resuelven. Si Nitro falla al
empaquetar, el escape es compilar contracts a `dist` con `tsc` y añadir
`dependsOn: ["^build"]` en `typecheck`/`test`.

## Fase 6 — CI

Reemplazar `.github/workflows/mobile.yml` por `ci.yml` con dos jobs sobre pnpm.

```yaml
name: ci

on:
  push:
    branches: [main]
  pull_request:

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  mobile:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm turbo run typecheck lint test --filter=wetune-mobile
      - run: pnpm --filter wetune-mobile exec expo export --platform android

  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm turbo run typecheck build --filter=@wetune/backend
```

- [ ] `pnpm/action-setup` sin `version` cuando `packageManager` está en el root.
- [ ] GitHub Actions no admite `paths:` por job: solo a nivel de workflow. Si se
      quiere evitar correr todo en cada push, usar `dorny/paths-filter` con un
      `if:` por job, o dejar ambos jobs y confiar en el cache de turbo. El
      filtro de turbo no sustituye al trigger de GitHub.

## Fase 7 — EAS y docs

- [ ] `eas.json` se queda en `apps/mobile`; los builds se lanzan desde ahí.
- [ ] EAS detecta el workspace root por el lockfile de la raíz. No mover
      `pnpm-lock.yaml` a un subdirectorio.
- [ ] Confirmar que el perfil de build usa pnpm (EAS lo infiere del lockfile).
- [ ] Actualizar `AGENTS.md`: rutas `mobile/` → `apps/mobile/`, comandos
      `cd mobile` → `pnpm --filter wetune-mobile`, y sección de comandos con
      turbo.
- [ ] Actualizar `mobile/README.md` (rutas y comandos) y el mapa del repo en
      `AGENTS.md` para incluir `apps/backend/` y `packages/contracts/`.
- [ ] Nota en `docs/expo-migration.md` si menciona la estructura anterior.

## Fase 8 — Verificación

| Gate | Comando | Esperado |
| --- | --- | --- |
| G1 | `pnpm install --frozen-lockfile` | sin cambios de lockfile |
| G2 | `pnpm why -r zod` / `pnpm why -r react-native` | una sola versión de cada |
| G3 | `pnpm turbo run typecheck lint test` | verde |
| G4 | `pnpm --filter wetune-mobile exec expo export --platform android` | bundle correcto |
| G5 | `pnpm --filter @wetune/backend run build` + `node apps/backend/.output/server/index.mjs` | servidor arriba |
| G6 | `pnpm --filter wetune-mobile exec expo run:android` | build nativo en device |
| G7 | `eas build --profile development` desde `apps/mobile` | build EAS |
| G8 | `turbo run typecheck --filter='...[origin/main]'` | solo paquetes afectados |

G6 y G7 son manuales y no los cubre CI. Sin ellos el movimiento no está
validado del todo.

## Riesgos y mitigación

| Riesgo | Prob. | Mitigación |
| --- | --- | --- |
| Linker aislado rompe un nativo | Media | `nodeLinker: hoisted` y reinstalar |
| Bundle idéntico pero distinto árbol de deps | Media | G3 + G4 + G6 antes de mergear |
| Nitro no resuelve contracts TS | Baja | compilar contracts a `dist` |
| EAS no detecta el root | Baja | `packageManager` en root + lockfile en la raíz |
| Pérdida del WIP del backend | Baja | commitear antes; copia intacta en el repo original |
| CI silenciosamente verde por filtros mal puestos | Baja | correr un PR de prueba tocando `packages/contracts` |

## Rollback

1. `git reset --hard pre-monorepo` (todo el movimiento está en un solo branch).
2. El repo `wetune-backend` no se toca ni se borra: sigue siendo el origen.
3. Si el problema es solo pnpm: volver a npm workspaces reusando el layout,
   sin deshacer el movimiento.

## Esfuerzo estimado

| Fase | Tiempo |
| --- | --- |
| 0 — cerrar Zod | 15 min + verificación |
| 1–3 — rama y movimientos | 20 min |
| 4 — pnpm + turbo | 30 min + `install` |
| 5 — contracts + backend Zod | 45 min |
| 6–7 — CI, EAS, docs | 40 min |
| 8 — verificación | 30 min + build nativo |

Total: ~2.5 h de trabajo mecánico más la verificación en device.

## Qué no hacer

- No meter el backend como repo anidado ni submódulo: rompe el cacheo de turbo.
- No conservar dos lockfiles.
- No dejar `legacy-peer-deps` "por si acaso": esconde justo los conflictos que
  pnpm ahora te muestra.
- No mezclar este movimiento con la migración Zod ni con cambios de
  comportamiento de la API.
- No borrar el repo del backend hasta que G5 y G7 pasen.
