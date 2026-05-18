import type { Meta, StoryObj } from "@storybook/react-vite"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs"

const meta = {
  title: "Navigation/Tabs",
  component: Tabs,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Tabs horizontais. API composicional ou `items={[{value, label, content}]}` para casos simples.",
      },
    },
  },
} satisfies Meta<typeof Tabs>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="conta" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="conta">Conta</TabsTrigger>
        <TabsTrigger value="senha">Senha</TabsTrigger>
        <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
      </TabsList>
      <TabsContent value="conta">
        <p className="text-sm text-muted-foreground">Gerencie as informações da sua conta.</p>
      </TabsContent>
      <TabsContent value="senha">
        <p className="text-sm text-muted-foreground">
          Altere sua senha e configurações de segurança.
        </p>
      </TabsContent>
      <TabsContent value="notificacoes">
        <p className="text-sm text-muted-foreground">Defina suas preferências de notificação.</p>
      </TabsContent>
    </Tabs>
  ),
}

export const WithItemsAPI: Story = {
  render: () => (
    <Tabs
      defaultValue="conta"
      className="w-[400px]"
      items={[
        {
          value: "conta",
          label: "Conta",
          content: (
            <p className="text-sm text-muted-foreground">Gerencie as informações da sua conta.</p>
          ),
        },
        {
          value: "senha",
          label: "Senha",
          content: (
            <p className="text-sm text-muted-foreground">
              Altere sua senha e configurações de segurança.
            </p>
          ),
        },
        {
          value: "notificacoes",
          label: "Notificações",
          content: (
            <p className="text-sm text-muted-foreground">
              Defina suas preferências de notificação.
            </p>
          ),
        },
      ]}
    />
  ),
}
