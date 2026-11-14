#!/usr/bin/env node
// Genera los archivos de App Links para el dominio web.
//
// Android: ANDROID_SHA256="AA:BB:...,CC:DD:..." (fingerprints separados por coma)
// iOS:     APPLE_TEAM_ID="XXXXXXXXXX" (opcional; sin él no se escribe AASA)
//
// Uso:
//   ANDROID_SHA256="..." APPLE_TEAM_ID="..." node scripts/generate-app-links.mjs
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const ANDROID_PACKAGE = "com.wetune.dev";
const IOS_BUNDLE_ID = "com.wetune.dev";
const OUT_DIR = resolve(process.cwd(), "public", ".well-known");
const SHA256_RE = /^([0-9A-F]{2}:){31}[0-9A-F]{2}$/;
const TEAM_ID_RE = /^[A-Z0-9]{10}$/;

const fingerprints = (process.env.ANDROID_SHA256 ?? "")
  .split(",")
  .map((value) => value.trim().toUpperCase())
  .filter(Boolean);
const teamId = (process.env.APPLE_TEAM_ID ?? "").trim().toUpperCase();

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
if (teamId && !TEAM_ID_RE.test(teamId)) {
  console.error(`APPLE_TEAM_ID inválido: ${teamId}`);
  process.exit(1);
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
console.log("Escrito public/.well-known/assetlinks.json");

if (!teamId) {
  console.warn("APPLE_TEAM_ID no definido: se omite apple-app-site-association (iOS App Links siguen desactivados).");
  process.exit(0);
}

const aasa = {
  applinks: {
    apps: [],
    details: [{ appID: `${teamId}.${IOS_BUNDLE_ID}`, paths: ["/share/*"] }],
  },
};
await writeFile(
  resolve(OUT_DIR, "apple-app-site-association"),
  `${JSON.stringify(aasa, null, 2)}\n`,
);
console.log("Escrito public/.well-known/apple-app-site-association");
