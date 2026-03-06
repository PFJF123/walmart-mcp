import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/index.ts"],
    format: ["esm"],
    outDir: "dist",
    sourcemap: true,
    clean: true,
    dts: false,
    external: ["playwright"],
  },
  {
    entry: ["src/cli.ts"],
    format: ["esm"],
    outDir: "dist",
    sourcemap: true,
    banner: { js: "#!/usr/bin/env node" },
    external: ["playwright"],
  },
]);
