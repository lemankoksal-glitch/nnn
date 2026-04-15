import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: false, // explicit imports keep tests self-documenting
  },
  resolve: {
    alias: {
      // Mirror tsconfig.json paths: "@/*" -> "./*"
      "@": path.resolve(__dirname, "."),
    },
  },
});
