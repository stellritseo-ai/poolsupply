// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Rollup plugin: inject `createRequire` shim into every chunk that uses require().
// MongoDB v7 internally calls require() inside resolveRuntimeAdapters(), which fails
// in an ESM-bundled .mjs file. This fixes it without un-bundling the package.
const cjsRequireShimPlugin = {
  name: "cjs-require-shim",
  renderChunk(code: string) {
    if (!code.includes("require(")) return null;
    return {
      code: `import { createRequire as __createRequire } from 'module';\nconst require = __createRequire(import.meta.url);\n${code}`,
      map: null,
    };
  },
};

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  nitro: {
    preset: "vercel",
    rollupConfig: {
      plugins: [cjsRequireShimPlugin],
    },
  },
});




