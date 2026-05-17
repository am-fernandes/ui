import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: { compilerOptions: { jsx: "react-jsx" } },
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: ["react", "react-dom"],
  tsconfig: "./tsconfig.build.json",
})
