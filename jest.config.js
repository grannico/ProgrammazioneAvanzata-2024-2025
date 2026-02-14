const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  // Diciamo a Jest di cercare solo i file .ts all'interno delle cartelle
  testMatch: ["**/*.test.ts"],
  // Manteniamo anche l'ignore per sicurezza, usando il prefisso <rootDir>
  testPathIgnorePatterns: ["/node_modules/", "<rootDir>/dist/"]
};