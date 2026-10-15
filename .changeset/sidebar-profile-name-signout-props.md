---
"@amfernandesinc/ui": minor
---

**Sidebar**:

- Novas props `profileLabel` (default `"Editar perfil"`) e `profileIcon` (default `UserCog`) para o rótulo/tooltip do avatar e o ícone do botão de perfil.
- Nova prop `onNameClick`: quando informada, o nome do usuário vira um botão.
- `onSignOut` passa a ser opcional: sem ela o botão "Sair" e o diálogo de confirmação não são renderizados. Nesse caso a lib não oferece logout: o app precisa ter um fluxo próprio de saída.

Sem mudança de comportamento para quem não usa as novas props.
