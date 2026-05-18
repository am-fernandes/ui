import type { Meta, StoryObj } from "@storybook/react-vite"

import { Video } from "./video"

const meta = {
  title: "Data/Video",
  component: Video,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Componente de vídeo com **lazy load via `IntersectionObserver`** (carrega `src`/`preload` só quando entra no viewport — `rootMargin: 200px`). Suporta posters, autoPlay-mute pattern, captions e aspect-ratio fixo.",
          "",
          "**Props principais:**",
          "- `src` — URL do vídeo (obrigatório).",
          "- `aria-label` ou `aria-labelledby` — rótulo acessível (obrigatório).",
          "- `poster` — imagem exibida antes do play.",
          "- `aspectRatio` — razão `width / height`. Default `16/9`. O wrapper aplica `aspect-ratio` CSS para reservar espaço.",
          "- `autoPlay` — quando `true`, força `muted` (política dos browsers) e dispara o play assim que o vídeo carrega.",
          "- `muted` — silencia o áudio.",
          "- `controls` — exibe os controles nativos. Default `true`.",
          "- `loop` — repete em loop.",
          '- `captions: VideoCaptionTrack[]` — legendas com `{ src, srcLang, label, default? }`. Renderiza um `<track kind="captions">` por entrada.',
          "- `preload` — `'none'`, `'metadata'` (default) ou `'auto'`. Aplicado apenas quando o vídeo entra no viewport.",
          "",
          "**Exemplo de uso:**",
          "",
          "```tsx",
          'import { Video } from "@am-fernandes/ui"',
          "",
          "<Video",
          '  src="https://example.com/video.mp4"',
          '  aria-label="Vídeo de apresentação"',
          '  poster="https://example.com/poster.jpg"',
          "  aspectRatio={16 / 9}",
          "  controls",
          "/>",
          "```",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    src: {
      control: "text",
      description: "URL do vídeo.",
      table: { type: { summary: "string" } },
    },
    poster: {
      control: "text",
      description: "Imagem exibida antes do play.",
      table: { type: { summary: "string" } },
    },
    aspectRatio: {
      control: { type: "number", min: 0, step: 0.1 },
      description: "Razão `width / height` aplicada via CSS `aspect-ratio`.",
      table: { type: { summary: "number" }, defaultValue: { summary: "16/9" } },
    },
    autoPlay: {
      control: "boolean",
      description:
        "Reproduz automaticamente (força `muted` para respeitar políticas dos browsers).",
      table: { type: { summary: "boolean" } },
    },
    muted: {
      control: "boolean",
      description: "Silencia o áudio. Forçado a `true` quando `autoPlay`.",
      table: { type: { summary: "boolean" } },
    },
    controls: {
      control: "boolean",
      description: "Exibe os controles nativos do `<video>`.",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    loop: {
      control: "boolean",
      description: "Reproduz em loop.",
      table: { type: { summary: "boolean" } },
    },
    preload: {
      control: "inline-radio",
      options: ["none", "metadata", "auto"],
      description: "Estratégia de pré-carregamento (aplicada quando o vídeo entra no viewport).",
      table: {
        type: { summary: "'none' | 'metadata' | 'auto'" },
        defaultValue: { summary: "'metadata'" },
      },
    },
    captions: {
      control: "object",
      description:
        'Legendas (`<track kind="captions">`). Cada item: `{ src, srcLang, label, default? }`.',
      table: { type: { summary: "VideoCaptionTrack[]" } },
    },
    "aria-label": {
      control: "text",
      description: "Rótulo acessível. Obrigatório (a menos que `aria-labelledby` esteja setado).",
      table: { type: { summary: "string" } },
    },
  },
} satisfies Meta<typeof Video>

export default meta
type Story = StoryObj<typeof meta>

const SAMPLE = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
const POSTER = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800"

export const Default: Story = {
  args: { src: SAMPLE, "aria-label": "Vídeo de exemplo Big Buck Bunny" },
  render: (args) => (
    <div className="w-[560px]">
      <Video {...args} />
    </div>
  ),
}

export const WithPoster: Story = {
  args: {
    src: SAMPLE,
    "aria-label": "Vídeo de exemplo com poster",
    poster: POSTER,
  },
  render: (args) => (
    <div className="w-[560px]">
      <Video {...args} />
    </div>
  ),
}

export const AutoPlayMuted: Story = {
  args: {
    src: SAMPLE,
    "aria-label": "Vídeo com reprodução automática silenciada",
    autoPlay: true,
    loop: true,
    playsInline: true,
  },
  render: (args) => (
    <div className="w-[560px]">
      <Video {...args} />
    </div>
  ),
}
