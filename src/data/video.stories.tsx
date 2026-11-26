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
          "- `objectFit` — `'contain'` (default: mostra o quadro inteiro, sem cortar vídeo vertical de celular), `'cover'` ou `'fill'`. O `className` vai para o invólucro.",
          '- `crossOrigin` — não é definido por padrão, então um vídeo em servidor sem cabeçalhos CORS toca. Legendas de outra origem precisam de `crossOrigin="anonymous"` e CORS no servidor delas (há um aviso em desenvolvimento).',
          "- Estados: um indicador de carregamento até os metadados chegarem; em erro de rede ou codec, a mensagem de `labels.error` e o botão `labels.retry`. Com `src` recusado, `labels.invalid`. Os dois estados levam o nome do vídeo.",
          '- `allowedProtocols` **substitui** a lista padrão (`http:`, `https:`). Para uma prévia `blob:`, use `[...DEFAULT_ALLOWED_RESOURCE_PROTOCOLS, "blob:"]`.',
          "",
          "**Exemplo de uso:**",
          "",
          "```tsx",
          'import { Video } from "@amfernandesinc/ui"',
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

const SAMPLE = "https://samplelib.com/mp4/sample-5s.mp4"
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

export const VerticalVideo: Story = {
  name: "Vertical video (contain × cover)",
  args: { src: SAMPLE, "aria-label": "Tour do imóvel", aspectRatio: 9 / 16 },
  render: (args) => (
    <div className="flex gap-4">
      <div className="w-[200px]">
        <Video {...args} />
      </div>
      <div className="w-[200px]">
        <Video {...args} aria-label="Tour do imóvel, cortado" objectFit="cover" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Com o padrão `contain` o quadro aparece inteiro, com faixas; `cover` preenche a caixa e corta as bordas. Para o tour vertical gravado no celular, deixe `contain`.",
      },
    },
  },
}

export const ErrorState: Story = {
  args: {
    src: "https://example.com/does-not-exist.mp4",
    "aria-label": "Tour do imóvel",
  },
  render: (args) => (
    <div className="w-[560px]">
      <Video {...args} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Falha de rede, arquivo ausente ou codec não suportado: mensagem e botão para tentar de novo, no lugar do player vazio.",
      },
    },
  },
}
