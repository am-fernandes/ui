import type { Meta, StoryObj } from "@storybook/react-vite"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./accordion"

const meta = {
  title: "Navigation/Accordion",
  component: Accordion,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Accordion>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { type: "single", collapsible: true },
  render: () => (
    <Accordion type="single" collapsible className="w-[400px]">
      <AccordionItem value="item-1">
        <AccordionTrigger>É acessível?</AccordionTrigger>
        <AccordionContent>
          Sim. Segue as práticas de WAI-ARIA e funciona com leitores de tela.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>É estilizado?</AccordionTrigger>
        <AccordionContent>
          Sim. Vem com estilos prontos baseados no design system, totalmente customizáveis.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>É animado?</AccordionTrigger>
        <AccordionContent>
          Sim. Inclui animações suaves de abertura e fechamento, respeitando o motion do usuário.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
}

export const WithItemsAPI: Story = {
  args: { type: "single", collapsible: true },
  render: () => (
    <Accordion
      type="single"
      collapsible
      className="w-[400px]"
      items={[
        {
          value: "item-1",
          title: "É acessível?",
          content: "Sim. Segue as práticas de WAI-ARIA e funciona com leitores de tela.",
        },
        {
          value: "item-2",
          title: "É estilizado?",
          content:
            "Sim. Vem com estilos prontos baseados no design system, totalmente customizáveis.",
        },
        {
          value: "item-3",
          title: "É animado?",
          content:
            "Sim. Inclui animações suaves de abertura e fechamento, respeitando o motion do usuário.",
        },
      ]}
    />
  ),
}
