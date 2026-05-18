import type { Meta, StoryObj } from "@storybook/react-vite"

import { Image } from "./image"

const meta = {
  title: "Data/Image",
  component: Image,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Componente de imagem otimizado: lazy-load nativo, placeholder configurável, fallback de erro e `alt` obrigatório.",
          "",
          "**Props principais:**",
          "- `src` — URL da imagem (obrigatório).",
          "- `alt` — texto alternativo (obrigatório por acessibilidade).",
          "- `aspectRatio` — razão `width / height` (ex.: `16/9`). Quando setado, o wrapper aplica `aspect-ratio` CSS e reserva o espaço evitando CLS.",
          "- `placeholder` — `'skeleton'` (default, usa `<Skeleton>` do DS), `'blur'` (fundo `bg-muted` borrado) ou `'none'`.",
          "- `objectFit` — como a imagem preenche o wrapper: `'cover'` (default), `'contain'`, `'fill'`, `'none'`, `'scale-down'`.",
          "- `rounded` — borda arredondada: `'none'` (default), `'sm'`, `'md'`, `'lg'`, `'full'` (para avatares).",
          "- `loading` — `'lazy'` (default) ou `'eager'`. Mapeia direto para o atributo nativo do `<img>`.",
          "- Em erro de carregamento, renderiza um fallback `Falha ao carregar imagem` no lugar.",
          "",
          "**Exemplo de uso:**",
          "",
          "```tsx",
          'import { Image } from "@am-fernandes/ui"',
          "",
          "<Image",
          '  src="https://example.com/foto.jpg"',
          '  alt="Workspace com laptop e caderno"',
          "  aspectRatio={16 / 9}",
          '  rounded="md"',
          "/>",
          "```",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    src: {
      control: "text",
      description: "URL da imagem.",
      table: { type: { summary: "string" } },
    },
    alt: {
      control: "text",
      description: "Texto alternativo. Obrigatório por acessibilidade.",
      table: { type: { summary: "string" } },
    },
    aspectRatio: {
      control: { type: "number", min: 0, step: 0.1 },
      description: "Razão `width / height`. Reserva espaço e evita layout shift.",
      table: { type: { summary: "number" } },
    },
    placeholder: {
      control: "inline-radio",
      options: ["skeleton", "blur", "none"],
      description: "Placeholder exibido enquanto a imagem carrega.",
      table: {
        type: { summary: "'blur' | 'skeleton' | 'none'" },
        defaultValue: { summary: "'skeleton'" },
      },
    },
    objectFit: {
      control: "inline-radio",
      options: ["cover", "contain", "fill", "none", "scale-down"],
      description: "Como a imagem preenche o wrapper.",
      table: {
        type: { summary: "'cover' | 'contain' | 'fill' | 'none' | 'scale-down'" },
        defaultValue: { summary: "'cover'" },
      },
    },
    rounded: {
      control: "inline-radio",
      options: ["none", "sm", "md", "lg", "full"],
      description: "Borda arredondada. `'full'` para avatares circulares.",
      table: {
        type: { summary: "'none' | 'sm' | 'md' | 'lg' | 'full'" },
        defaultValue: { summary: "'none'" },
      },
    },
    loading: {
      control: "inline-radio",
      options: ["lazy", "eager"],
      description: "Estratégia de carregamento nativa do `<img>`.",
      table: {
        type: { summary: "'lazy' | 'eager'" },
        defaultValue: { summary: "'lazy'" },
      },
    },
    onLoad: { control: false, table: { category: "Eventos" } },
    onError: { control: false, table: { category: "Eventos" } },
  },
} satisfies Meta<typeof Image>

export default meta
type Story = StoryObj<typeof meta>

const SAMPLE = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800"
const AVATAR = "https://github.com/shadcn.png"
const BROKEN = "https://example.com/does-not-exist.png"

export const Default: Story = {
  args: { src: SAMPLE, alt: "Workspace com laptop e caderno" },
  render: (args) => (
    <div className="w-[320px]">
      <Image {...args} />
    </div>
  ),
}

export const WithAspectRatio: Story = {
  args: { src: SAMPLE, alt: "Workspace com laptop e caderno", aspectRatio: 16 / 9 },
  render: (args) => (
    <div className="w-[480px]">
      <Image {...args} />
    </div>
  ),
}

export const Rounded: Story = {
  args: { src: AVATAR, alt: "Avatar do usuário", rounded: "full" },
  render: () => (
    <div className="flex items-center gap-4">
      <Image src={AVATAR} alt="Avatar do usuário" rounded="full" className="size-20" />
      <div className="w-[200px]">
        <Image src={SAMPLE} alt="Workspace" aspectRatio={1} rounded="lg" />
      </div>
    </div>
  ),
}

export const Skeleton: Story = {
  args: {
    src: SAMPLE,
    alt: "Workspace com laptop e caderno",
    aspectRatio: 4 / 3,
    placeholder: "skeleton",
  },
  render: (args) => (
    <div className="w-[400px]">
      <Image {...args} />
    </div>
  ),
}

export const Blur: Story = {
  args: {
    src: SAMPLE,
    alt: "Workspace com laptop e caderno",
    aspectRatio: 4 / 3,
    placeholder: "blur",
  },
  render: (args) => (
    <div className="w-[400px]">
      <Image {...args} />
    </div>
  ),
}

export const ErrorState: Story = {
  args: { src: BROKEN, alt: "Imagem inválida", aspectRatio: 4 / 3 },
  render: (args) => (
    <div className="w-[400px]">
      <Image {...args} />
    </div>
  ),
}
