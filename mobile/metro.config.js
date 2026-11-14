// Metro elige el build ESM (.mjs) de TypeBox y el interop CJS falla en Hermes
// con "Cannot read property 'defineProperty' of undefined". Forzamos el build
// CJS solo para este paquete; el resto sigue con la resolución de Expo.
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

const typeboxCjs = {
  "@sinclair/typebox": require.resolve("@sinclair/typebox"),
  "@sinclair/typebox/value": require.resolve("@sinclair/typebox/value"),
};

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const override = typeboxCjs[moduleName];
  if (override) return { filePath: override, type: "sourceFile" };
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
