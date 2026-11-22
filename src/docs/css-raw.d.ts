// Vite's `?raw` suffix imports a file as text. The docs use it to read the
// values in tokens.css (see _color-vision.tsx).
declare module "*.css?raw" {
  const content: string
  export default content
}
