#!/usr/bin/env bash
# Genera un APK release firmado con el keystore local.
# Requiere ~/.config/wetune/android-signing.env (o WETUNE_SIGNING_ENV).
set -euo pipefail

ENV_FILE="${WETUNE_SIGNING_ENV:-$HOME/.config/wetune/android-signing.env}"
if [[ ! -f "$ENV_FILE" ]]; then
  echo "Falta $ENV_FILE" >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

: "${WETUNE_KEYSTORE_PATH:?Falta WETUNE_KEYSTORE_PATH}"
: "${WETUNE_KEYSTORE_PASSWORD:?Falta WETUNE_KEYSTORE_PASSWORD}"
: "${WETUNE_KEY_ALIAS:?Falta WETUNE_KEY_ALIAS}"
: "${WETUNE_KEY_PASSWORD:?Falta WETUNE_KEY_PASSWORD}"

if [[ ! -f "$WETUNE_KEYSTORE_PATH" ]]; then
  echo "No existe el keystore: $WETUNE_KEYSTORE_PATH" >&2
  exit 1
fi

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$APP_DIR"

echo "==> prebuild Android"
npx expo prebuild --platform android --clean --no-install

echo "==> configurar firma release"
node scripts/configure-release-signing.mjs

ARCHS="${WETUNE_ARCHS:-arm64-v8a,x86_64}"
echo "==> assembleRelease ($ARCHS)"
cd android
./gradlew assembleRelease --console=plain --no-daemon -PreactNativeArchitectures="$ARCHS"

APK="$APP_DIR/android/app/build/outputs/apk/release/app-release.apk"
echo
echo "APK: $APK"
