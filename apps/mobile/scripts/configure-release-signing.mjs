#!/usr/bin/env node
// Parchea android/app/build.gradle (generado por expo prebuild) para firmar
// release con el keystore local. Los secretos se leen de env en tiempo de
// Gradle; este script no los lee ni los escribe.
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const MARKER = "// @wetune-release-signing";
const buildGradle = resolve(process.cwd(), "android/app/build.gradle");

let contents = await readFile(buildGradle, "utf8");

if (contents.includes(MARKER)) {
  console.log("La firma release ya está configurada.");
  process.exit(0);
}

const definitions = `${MARKER}
def wetuneKeystorePath = System.getenv("WETUNE_KEYSTORE_PATH")
def wetuneKeystorePassword = System.getenv("WETUNE_KEYSTORE_PASSWORD")
def wetuneKeyAlias = System.getenv("WETUNE_KEY_ALIAS")
def wetuneKeyPassword = System.getenv("WETUNE_KEY_PASSWORD")
def wetuneHasReleaseSigning = [wetuneKeystorePath, wetuneKeystorePassword, wetuneKeyAlias, wetuneKeyPassword].every { it != null && !it.isEmpty() }
gradle.taskGraph.whenReady { graph ->
    if (!wetuneHasReleaseSigning && graph.allTasks.any { it.name == "assembleRelease" || it.name == "bundleRelease" }) {
        throw new GradleException("Faltan WETUNE_KEYSTORE_PATH/PASSWORD/KEY_ALIAS/KEY_PASSWORD para firmar release")
    }
}
`;

contents = `${definitions}\n${contents}`;

const signingConfig = `signingConfigs {
        ${MARKER}
        if (wetuneHasReleaseSigning) {
            release {
                storeFile file(wetuneKeystorePath)
                storePassword wetuneKeystorePassword
                keyAlias wetuneKeyAlias
                keyPassword wetuneKeyPassword
            }
        }`;

if (!contents.includes("signingConfigs {")) {
  throw new Error("No encontré signingConfigs en android/app/build.gradle");
}
contents = contents.replace("signingConfigs {", signingConfig);

const buildTypesIndex = contents.indexOf("buildTypes {");
if (buildTypesIndex === -1) {
  throw new Error("No encontré buildTypes en android/app/build.gradle");
}

const beforeBuildTypes = contents.slice(0, buildTypesIndex);
const buildTypes = contents.slice(buildTypesIndex);
const patchedBuildTypes = buildTypes.replace(
  /(\n\s*release\s*\{[\s\S]*?)signingConfig\s+signingConfigs\.debug/,
  "$1signingConfig wetuneHasReleaseSigning ? signingConfigs.release : signingConfigs.debug",
);

if (!patchedBuildTypes.includes("wetuneHasReleaseSigning ? signingConfigs.release")) {
  throw new Error("No pude cambiar el signingConfig de release");
}

contents = beforeBuildTypes + patchedBuildTypes;

await writeFile(buildGradle, contents);
console.log("Firma release configurada en android/app/build.gradle.");
