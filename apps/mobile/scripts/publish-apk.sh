#!/usr/bin/env bash
# Compila el APK release, verifica la firma y publica una GitHub Release con el
# APK y su checksum. El tag queda apuntando al commit compilado.
#
# Uso: ./scripts/publish-apk.sh [tag]
#   tag  por defecto v<version> de app.json
#
# Requiere gh autenticado y el keystore local de build-release-android.sh.
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPO_DIR="$(cd "$APP_DIR/../.." && pwd)"
cd "$REPO_DIR"

VERSION="$(node -p "require('./apps/mobile/app.json').expo.version")"
VERSION_CODE="$(node -p "require('./apps/mobile/app.json').expo.android?.versionCode ?? 1")"
TAG="${1:-v$VERSION}"

if [[ "$TAG" != "v$VERSION" ]]; then
  echo "Aviso: el tag $TAG no coincide con la versión $VERSION de app.json." >&2
fi

if ! command -v gh >/dev/null; then
  echo "Falta gh (GitHub CLI)." >&2
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "gh no está autenticado (gh auth login)." >&2
  exit 1
fi

if ! git remote get-url origin >/dev/null 2>&1; then
  echo "No hay remoto origin." >&2
  exit 1
fi

require_clean_tree() {
  if [[ -n "$(git status --porcelain)" ]]; then
    echo "Hay cambios sin commitear: el APK no correspondería al tag." >&2
    git status --short >&2
    exit 1
  fi
}

require_clean_tree

if git rev-parse -q --verify "refs/tags/$TAG" >/dev/null; then
  echo "El tag $TAG ya existe localmente." >&2
  exit 1
fi

if git ls-remote --exit-code --tags origin "refs/tags/$TAG" >/dev/null 2>&1; then
  echo "El tag $TAG ya existe en origin." >&2
  exit 1
fi

echo "==> build release"
"$APP_DIR/scripts/build-release-android.sh"

require_clean_tree

APK="$APP_DIR/android/app/build/outputs/apk/release/app-release.apk"
if [[ ! -f "$APK" ]]; then
  echo "No se generó $APK" >&2
  exit 1
fi

echo "==> checksum"
CHECKSUM="$APK.sha256"
( cd "$(dirname "$APK")" && sha256sum "$(basename "$APK")" > "$(basename "$CHECKSUM")" )
SHA256="$(cut -d' ' -f1 "$CHECKSUM")"

SDK_DIR="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-}}"
if [[ -z "$SDK_DIR" && -f "$APP_DIR/android/local.properties" ]]; then
  SDK_DIR="$(sed -n 's/^sdk\.dir=//p' "$APP_DIR/android/local.properties" | tail -n 1)"
fi

APKSIGNER=""
if [[ -n "$SDK_DIR" ]]; then
  APKSIGNER="$(find "$SDK_DIR/build-tools" -maxdepth 2 -type f -name apksigner 2>/dev/null | sort -V | tail -n 1)"
fi
if [[ -z "$APKSIGNER" ]]; then
  echo "No encontré apksigner; define ANDROID_HOME o revisa el SDK." >&2
  exit 1
fi

echo "==> verificar firma"
if ! CERT_INFO="$("$APKSIGNER" verify --print-certs "$APK")"; then
  echo "La firma del APK no es válida." >&2
  exit 1
fi
echo "$CERT_INFO"
CERT_SHA256="$(sed -n 's/.*certificate SHA-256 digest: //p' <<<"$CERT_INFO" | head -n 1)"
if [[ -z "$CERT_SHA256" ]]; then
  echo "No pude leer el certificado de firma del APK." >&2
  exit 1
fi

NOTES="$(mktemp)"
trap 'rm -f "$NOTES"' EXIT

cat > "$NOTES" <<EOF
APK de WeTune $VERSION (versionCode $VERSION_CODE), compilado desde \`$(git rev-parse --short HEAD)\`.

- SHA-256 del APK: \`$SHA256\`
- Certificado de firma: \`$CERT_SHA256\`

Instalar o actualizar (misma firma y \`applicationId\`):

\`\`\`bash
adb install -r app-release.apk
\`\`\`

Verificar la descarga:

\`\`\`bash
sha256sum -c app-release.apk.sha256
\`\`\`
EOF

echo "==> tag $TAG"
git tag -a "$TAG" -m "WeTune $VERSION"
git push origin "$TAG"

echo "==> GitHub Release"
gh release create "$TAG" "$APK" "$CHECKSUM" \
  --title "WeTune $TAG" \
  --notes-file "$NOTES"
