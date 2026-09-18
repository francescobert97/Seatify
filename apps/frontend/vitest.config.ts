import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.spec.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "./coverage",
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/main.tsx",
        "src/types/**",
        "src/vite-env.d.ts",
        "tests/**",
        "dist/**",
        "vitest.config.ts",
      ],
    },
  },
  esbuild: {
    loader: "tsx",
    include: /src\/.*\.[tj]sx?$|tests\/.*\.[tj]sx?$/,
  },
});
