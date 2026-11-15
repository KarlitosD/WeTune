#!/usr/bin/env node
// Genera los archivos de App Links para el dominio wetune.app.
//
// Android: ANDROID_SHA256="AA:BB:...,CC:DD:..." (fingerprints separados por coma)
//
// Uso:
//   ANDROID_SHA256="..." node app-links/scripts/generate-app-links.mjs
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const ANDROID_PACKAGE = "com.wetune.dev";
const OUT_DIR = resolve(process.cwd(), "app-links", ".well-known");
const SHA256_RE = /^([0-9A-F]{2}:){31}[0-9A-F]{2}$/;

const fingerprints = (process.env.ANDROID_SHA256 ?? "")
  .split(",")
  .map((value) => value.trim().toUpperCase())
  .filter(Boolean);

if (!fingerprints.length) {
  console.error("Falta ANDROID_SHA256 (fingerprint SHA-256 del keystore de release).");
  process.exit(1);
}
for (const fingerprint of fingerprints) {
  if (!SHA256_RE.test(fingerprint)) {
    console.error(`Fingerprint inválido: ${fingerprint}`);
    process.exit(1);
  }
}

await mkdir(OUT_DIR, { recursive: true });

const assetlinks = [
  {
    relation: ["delegate_permission/common.handle_all_urls"],
    target: {
      namespace: "android_app",
      package_name: ANDROID_PACKAGE,
      sha256_cert_fingerprints: fingerprints,
    },
  },
];
await writeFile(resolve(OUT_DIR, "assetlinks.json"), `${JSON.stringify(assetlinks, null, 2)}\n`);
console.log("Escrito app-links/.well-known/assetlinks.json");
