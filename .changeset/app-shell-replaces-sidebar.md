---
"@amfernandesinc/ui": minor
---

**AppShell** substitui a **Sidebar** (breaking). O `AppShell` é a moldura inteira da aplicação: menu lateral, navbar opcional e a área de conteúdo, que é a única que rola.

- Só `items` é obrigatório. `brand`/`brandText` (header do menu), `navbar` e `footer` são opcionais.
- A `navbar` tem 64px, a mesma altura do header do menu: as duas bordas ficam na mesma linha.
- O `footer` é uma área livre. A lib não renderiza mais usuário, perfil nem botão de sair.
- Padding padrão no conteúdo (24px no desktop, 16px no mobile). `contentPadding={false}` desliga.
- Abaixo de 768px: barra de 64px com botão de menu, marca e a navbar, e o menu num painel à esquerda que fecha ao escolher um item.
- O botão de recolher fica no pé do menu. A marca não recolhe mais o menu: com `onBrandClick`, ela vira um botão ("Voltar").
- Skip link "Pular para o conteúdo" e `<main id="conteudo">` embutidos.
- `useAppShell()` devolve `{ collapsed, isMobile, closeMenu }` para navbar, footer e página.
- Itens recolhidos ganham nome acessível (antes só tinham o ícone).

**Migração**

- `Sidebar` e o subpath `@amfernandesinc/ui/sidebar` saem. Use `AppShell` (subpath `@amfernandesinc/ui/app-shell`).
- Saem as props `user`, `onProfileClick`, `profileLabel`, `profileIcon`, `onNameClick`, `onSignOut`, `disableSignOutConfirm` e `brandLabel`, e o tipo `SidebarUser`. Monte a linha do usuário (e a confirmação de saída) no `footer`.
- `SidebarItem` vira `AppShellItem`. `SidebarItem` continua exportado como alias `@deprecated`.
- O wrapper do layout sai do app. Antes:

  ```tsx
  <div className="flex h-screen overflow-hidden">
    <Sidebar brand={brand} items={items} user={user} onSignOut={signOut} />
    <main className="flex-1 overflow-y-auto p-4">{children}</main>
  </div>
  ```

  Depois:

  ```tsx
  <AppShell brand={brand} items={items} footer={<MenuDaConta />}>
    {children}
  </AppShell>
  ```

- Embaixo de outra barra (ex.: title bar do Electron), passe `className="h-full"`: por padrão o shell ocupa a altura da tela.
- O estado recolhido continua na mesma chave do localStorage (`amf-ui:sidebar:collapsed`): a preferência dos usuários é mantida.
