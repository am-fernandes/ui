# Changelog

## 0.6.0

### Minor Changes

- 4bd6211: **Migração da 0.5 para a 0.6: leia antes de atualizar.** O passo a passo, com antes, depois e o que fazer, está na página **Migração 0.6** do Storybook (`src/docs/Migration.mdx`). As mudanças que quebram, em ordem de impacto:

  - Os tokens de status claros (`--status-*-bg`, `-text`, `-border` e as classes `bg-status-*`, `text-status-*`, `border-status-*`) saem: o app compila e só perde a cor. Troque por `bg-success text-success-foreground` e equivalentes.
  - `Sidebar` sai; entra `AppShell` (`@amfernandesinc/ui/app-shell`), dono do layout.
  - `Button` nasce com `type="button"`: o botão que envia o formulário precisa de `type="submit"`.
  - `lib/date` trabalha em `America/Sao_Paulo`: um instante em UTC aparece na hora de Brasília (`14:30Z` → `11:30`).
  - `DateInput` é um campo de texto: o `ref` é `HTMLInputElement` e o papel é `textbox`.
  - `--accent` deixa de ser cinza (use `bg-muted` para fundo neutro), `--background` é só a página (superfícies em `bg-card`) e todas as cores mudam de valor.
  - Raio em três níveis (`rounded-md` passa a 8px, `rounded-lg`+ a 12px) e borda translúcida em dois níveis (`border-border-strong` nas molduras).
  - `Badge` é `<span>`, `Video` usa `objectFit="contain"`, `Image` sem `src` mostra "Sem imagem", `addMonths` para no fim do mês e a exportação da `DataTable` não traz mais o `xlsx`.

- e93d54d: **`Accordion`: nível do título, ação fora do título e anel de foco inteiro.** `headingLevel` (2 a 6, padrão 3) escolhe o nível do título de cada seção, para caber no sumário da página. A `action` de um item fica ao lado do título, não dentro dele: o leitor de tela lê "Item A", não "Item A Remover Item A". Um campo ou botão no topo de uma seção aberta tem o anel de foco inteiro; antes as bordas eram cortadas.
- 9f0979d: **`Accordion` ganha `keepMounted`.** Uma seção fechada era desmontada, e a API por `items` não dava escape: num formulário longo com `type="single"`, abrir a seção 2 apagava os campos não controlados da 1. Com `keepMounted`, as seções fechadas ficam no DOM, escondidas, e guardam o que têm.
- 95c3348: **`addMonths` não estoura mais o fim do mês.** `addMonths("2024-01-31", 1)` devolve 29/02/2024 (antes, 02/03/2024): quando o mês de destino não tem o dia de origem, a data para no último dia dele. Parcelas com vencimento em 29, 30 ou 31 deixam de pular fevereiro. Para gerar um carnê, some a partir da data base (`addMonths(base, i)`), assim o vencimento volta ao dia 31 nos meses que têm 31.

  **Como migrar:** revise os cálculos de vencimento que contavam com o estouro para o mês seguinte.

- f204bfb: **`AlertDialog` espera um `onConfirm` assíncrono.** Se `onConfirm` devolver uma Promise (o pedido por trás de "Aprovar" ou "Excluir"), o diálogo não fecha na hora: o botão de confirmar mostra o spinner e fica com `aria-busy`, os dois botões e o Esc deixam de responder, e o diálogo fecha quando a Promise resolve. Se ela rejeitar, o diálogo continua aberto e os botões voltam a funcionar, para você mostrar o erro dentro dele (em `children`) ou num toast e o usuário tentar de novo.

  Os botões ficam com `aria-disabled` em vez de `disabled` durante a espera, para o foco não cair no `<body>`. Um `onConfirm` síncrono continua fechando na hora, como antes.

- 248a126: **`AppShell`: menu recolhido controlável.** `collapsed` + `onCollapsedChange` deixam o estado com o app (persistir por usuário no backend, recolher num quadro em tela cheia); `onCollapsedChange` também avisa no modo não controlado. `storageKey` troca a chave do localStorage (padrão `"amf-ui:sidebar:collapsed"`), e `storageKey={false}` não lê nem grava nada. `useAppShell()` ganha `toggle`, para ligar um atalho de teclado.
- 734ca25: **`AppShell` imprime a página inteira e expõe o `<main>`.** Ao imprimir, o casco deixa de ter a altura da tela e a rolagem interna, e o menu lateral sai do papel: uma lista longa sai completa, não cortada na primeira tela. A nova prop `mainRef` entrega o `<main>` que rola, para a restauração de rolagem do roteador. O botão da marca reage com a camada de estado da lib, como os outros botões, e a largura do menu anima com os tokens de movimento.
- 697961a: **`AppShell` aceita o Link do roteador.** Com `renderLink={({ href, ...props }) => <Link to={href} {...props} />}` (React Router) ou `renderLink={(props) => <Link {...props} />}` (Next.js), os itens com `href` navegam sem recarregar a página. Repasse todas as props: elas levam as classes, o `aria-current` e o clique que fecha o menu no celular.

  O `onClick` do item passa a receber o evento (`event.preventDefault()` cancela o link), e Ctrl/⌘/Shift-clique abre o link em outra aba sem mexer na página atual: o menu não fecha e o `onClick` não roda. O item ativo leva `aria-current="page"` também quando é uma ação (sem `href`) ou um grupo.

- 408bd3d: **AppShell** substitui a **Sidebar** (breaking). O `AppShell` é a moldura inteira da aplicação: menu lateral, navbar opcional e a área de conteúdo, que é a única que rola.

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

- 8fcefc8: **`AppShell`: seções, `target` e motivo de item desabilitado.** Os itens agora ficam em listas (`ul`/`li`), e o leitor de tela anuncia quantos são e a hierarquia dos grupos. Um item `{ type: "section", label: "Vendas", items: [...] }` dá título a um conjunto de itens (o título é o nome da lista; no trilho recolhido vira um divisor). Links aceitam `target` (`"_blank"` também põe `rel="noopener noreferrer"`), e `disabledReason` num item `disabled` explica por quê ("Disponível para o perfil Gestor") num tooltip; o item segue alcançável pelo teclado e lê o motivo como descrição.
- c7aa4ee: **`Badge` ganha `dot`.** `<Badge variant="success" dot>Aprovado</Badge>` mostra um ponto na cor da variante ao lado de texto comum, sem fundo. É a forma para tabelas densas, onde uma coluna de badges cheios pesaria mais que o conteúdo; o fundo cheio fica para alertas e contadores. O rótulo herda a cor do texto em volta, então funciona também numa linha selecionada.

  O `Badge` passa a pedir a impressão do fundo (`print-color-adjust: exact`), para o texto claro não sumir no papel.

- c954336: **`Badge` passa a ser um `<span>` (quebra).** Era um `<div>`: dentro de um `<p>`, como num texto "Proposta <Badge>Aprovada</Badge> ontem", o HTML ficava inválido e o React avisava "<div> cannot be a descendant of <p>", com erro de hidratação no SSR. O visual não muda (`inline-flex` como antes).

  Para migrar: quem tipava o ref como `HTMLDivElement` troca por `HTMLSpanElement` (`React.useRef<HTMLSpanElement>(null)`), e seletores CSS ou de teste como `div[data-slot="badge"]` passam a `[data-slot="badge"]`. Se precisar de um bloco, use `asChild` com o elemento que quiser.

- 66fd8e2: **Borda em dois níveis.** `--border` (10% da primária) fica para os divisores de dentro de uma superfície. As molduras que separam camadas passam a usar `--border-strong` (18%): Card, DataTable, Schedule, Alert padrão, DropdownMenu, Popover, Tour, Dialog, AlertDialog, Sheet, toasts e as bordas do menu lateral e da navbar do AppShell (`--sidebar-border`).

  **Como migrar:** nas telas do app, a moldura que separa uma camada da outra (um painel, um card feito à mão, a borda de uma barra fixa) passa a `border-border-strong`; as divisórias de dentro de uma superfície (entre linhas, entre seções de um card) ficam com `border-border`. Quem usava `--sidebar-border` continua igual: ele agora aponta para `--border-strong`.

- f89faeb: **`Breadcrumb` aceita o link do roteador.** `renderLink={({ href, ...props }) => <Link to={href} {...props} />}` desenha os passos com o `<Link>` do React Router ou do Next.js, e um clique navega sem recarregar a página. Cada item ganha `onClick`, que recebe o evento.
- 0a32faa: **`Breadcrumb`: trilha longa recolhida, nome em português e lista válida.** `maxItems` mostra o primeiro passo, um botão "…" com os passos ocultos num menu e os últimos. O `<nav>` passa a se chamar "Trilha de navegação" (texto em `labels.navigation`; `ariaLabel` continua funcionando, mas está obsoleto). Os separadores ficam dentro de cada item e escondidos do leitor de tela, então a lista passa na regra `list` do axe. Um passo do meio sem `href` aparece como texto simples; só a página atual fica em destaque.
- d87e411: **`Button` ganha `size` e todas as variantes passam a ter a mesma caixa.** `size="sm"` (32px), `"md"` (40px, padrão) e `"lg"` (44px) definem a altura da caixa inteira, borda incluída, pelos tokens de altura de controle. Antes a altura saía do padding: o botão `outline` media 42px e os outros 40px.

  Toda variante agora tem 1px de borda (transparente fora do `outline`), então um botão com borda e um sem borda do mesmo tamanho têm a mesma altura e, com o mesmo texto, a mesma largura. Na prática: o `outline` fica 2px mais baixo e os demais 2px mais largos.

  `buttonVariants()` aceita `size` e, sem ele, devolve o botão `md`. Quem sobrescreve a altura por `className` (`h-8`, `size-9`) continua funcionando.

- a0e7fc8: **`Button` nasce com `type="button"` (mudança que quebra).** Sem `type`, todo `<Button>` dentro de um `<form>` era um botão de envio: um "Cancelar" ou "Adicionar item" com `onClick` enviava o formulário junto. Agora o padrão é `type="button"`, igual ao `IconButton`.

  **Como migrar:** no botão que envia o formulário, passe `type="submit"` (`<Button type="submit">Salvar</Button>`). Botões que já tinham `type` e botões fora de formulário não mudam. Com `asChild` nenhum `type` é aplicado ao filho.

- 474d3d9: **`Calendar`: nomes acessíveis em português.** O leitor de tela ouvia "Go to the Previous Month", "Go to the Next Month", "…, selected" e "Today, …", porque o locale do date-fns traduz só os nomes de mês e de dia. O calendário passa a usar o `ptBR` do `react-day-picker`: "Ir para o mês anterior", "Ir para o próximo mês", "…, selecionado", "Hoje, …". Vale também para o `DateInput` e o `DateRangePicker`. A prop `labels` do `DayPicker` continua sobrepondo esses textos.
- 81a26b4: **Textos da navegação rápida do `Calendar` em `labels`.** "Escolher ano", "Escolher mês" e "… — voltar para a seleção de ano" eram fixos. A prop `labels` do `Calendar`, que já repassava os textos do `react-day-picker` (`labelNext`, `labelDayButton`…), aceita também `chooseYear`, `chooseMonth` e `backToYears`, com os padrões em `defaultCalendarLabels`.
- 1f2cbc0: **`Card`: `padding` e `headingLevel`.** `padding="none"` deixa uma tabela, lista ou gráfico encostar na borda do Card, sem a margem dupla de antes; `"compact"` reduz o respiro para painéis densos. `headingLevel` (2 a 6, padrão 3) escolhe o nível do título. Um título em duas linhas deixa de ter as linhas coladas.
- 47923a6: **`CEPInput` ganha `onComplete` e `loading`, para a consulta de endereço.** `onComplete(cep)` é chamado com os oito dígitos quando o CEP fica completo por uma edição (o oitavo dígito digitado, ou um CEP inteiro colado), e de novo se o CEP for corrigido; não dispara por um `value` que chega pronto. `loading` mostra um indicador dentro do campo, marca `aria-busy` e anuncia "Buscando endereço…" ao leitor de tela, sem travar a edição.

  ```tsx
  <CEPInput
    label="CEP"
    value={cep}
    onValueChange={setCep}
    onComplete={buscarEndereco}
    loading={buscando}
  />
  ```

  O texto anunciado fica em `labels` (`defaultCEPInputLabels`).

- 42c75d2: **Gráficos: `BarChart`, `LineChart` e `Sparkline`** (`@amfernandesinc/ui/bar-chart`, `/line-chart`, `/sparkline`), em SVG desenhado pelo React, sem dependência nova, com as cores de gráfico que a biblioteca já tinha.

  - Até seis séries nas cores `--chart-1`…`--chart-6`, sempre nesta ordem; uma sétima é erro de desenvolvimento, com a orientação de agrupar em "Outros". A cor é da série: ocultar uma série pela legenda não repinta as outras, e `color` fixa a cor quando a lista muda.
  - `BarChart`: `data`, `category`, `series`, `orientation` (`"horizontal"` para nomes longos), `stacked`, valores negativos a partir da linha do zero. Barras finas (até 24px), ponta arredondada e base reta, 2px de respiro entre barras e segmentos.
  - `LineChart`: `x` como categoria ou data ISO (`"2026-03"` vira "mar."), `area` com uma série, pontos `null` interrompem a linha. Com duas a quatro séries, o nome vai no fim de cada linha quando não há colisão.
  - Duas séries ou mais têm legenda (que mostra e oculta séries); uma série não tem. Eixos e grade discretos, números arredondados no formato brasileiro, compactos a partir de 10 mil; `formatValue` e `formatX` para dinheiro e unidades.
  - Tooltip ao passar o mouse (por categoria nas barras, com linha vertical nas linhas) e o mesmo pelo teclado: o gráfico recebe foco, as setas percorrem os pontos e cada um é anunciado. Uma tabela com os mesmos números está sempre disponível para o leitor de tela; `showTable` a mostra.
  - `title` obrigatório (é o nome acessível), `description`, `loading`, `emptyMessage` e `labels`. A largura acompanha o contêiner; em 360px a legenda vai para baixo e os rótulos rareiam. Visíveis em cores forçadas.
  - `Sparkline`: tendência pequena para célula de tabela ou card, sem eixos nem tooltip, com `label` obrigatório que diz a tendência em palavras.

- bdf1de0: **`Checkbox` ganha o estado misto.** `checked="indeterminate"` (ou `defaultChecked="indeterminate"`) mostra um traço e é anunciado como "parcialmente marcada": é o "selecionar todos" quando só parte dos itens está marcada. Um clique no estado misto marca a caixa.

  `onCheckedChange` passa a receber sempre `true` ou `false`. Quem escrevia `onCheckedChange={(v) => setChecked(v === true)}` pode passar `setChecked` direto.

- cd10302: **`isValidCNPJ` e `formatCNPJ` aceitam o CNPJ alfanumérico.** A Receita emite CNPJ com letras desde julho de 2026 (IN RFB 2.229/2024): as doze primeiras posições podem ter dígitos ou letras maiúsculas e os dois dígitos verificadores continuam numéricos. `isValidCNPJ("12.ABC.345/01DE-35")` agora é verdadeiro e `formatCNPJ("12ABC34501DE35")` devolve `"12.ABC.345/01DE-35"`. Os CNPJs só com números continuam válidos e formatados como antes.

  Como letra passou a fazer parte do número, um texto com rótulo (`"CNPJ 11.222.333/0001-81"`) deixa de validar: passe só o número. Letras minúsculas são lidas como maiúsculas.

- 2a53376: **`CNPJInput` aceita o CNPJ alfanumérico.** A Receita emite CNPJ com letras desde julho de 2026 (IN RFB 2.229/2024) e o campo descartava as letras: `12.ABC.345/01DE-35` virava `12.345.013/5`. Agora as doze primeiras posições aceitam dígitos ou letras, o que é digitado passa para maiúsculas e os dois dígitos verificadores continuam só numéricos. A máscara é `XX.XXX.XXX/XXXX-DD` e o pai recebe os 14 caracteres sem máscara (`"12ABC34501DE35"`).

  O campo passa a abrir o teclado de texto no celular (`inputMode="text"` com `autoCapitalize="characters"`), porque o teclado numérico não tem letras. Como letra agora faz parte do número, um rótulo digitado junto conta como valor; na colagem, o CNPJ completo é achado no meio do texto (`"CNPJ: 12.ABC.345/01DE-35"` entra certo).

- 1526c42: **`Collapsible` ganha `disabled`, e `title` com `trigger` vira erro de tipo.** `disabled` trava a seção: o gatilho fica desabilitado (o padrão esmaece, com cursor normal) e uma seção aberta continua legível. Um `trigger` próprio também recebe o `disabled`.

  `title` e `trigger` eram mutuamente exclusivos só num comentário: passados juntos, `title` era ignorado em silêncio. Agora o TypeScript acusa. Se o seu código passa os dois, tire o `title`, que já não aparecia.

- 42db95e: **`Collapsible` ganha `keepMounted`.** Fechar uma seção desmontava o conteúdo: num formulário longo com seções recolhíveis, um campo não controlado voltava vazio ao reabrir. Com `keepMounted`, a seção fechada continua no DOM, escondida e fora da ordem do Tab, e o que foi digitado fica. Nesse modo ela fecha na hora, sem a animação de recolher. O padrão continua `false`.
- b6b179d: **`Combobox` abre pelo teclado como um select.** Com o foco no gatilho fechado, a seta para baixo não abria a lista e digitar uma letra não fazia nada (só Espaço e Enter abriam). Agora as setas para baixo e para cima abrem a lista, e digitar um caractere abre a lista já com ele na busca, com o cursor depois dele para as próximas letras.
- 7033f58: **Todos os textos do `Combobox` em `labels`.** "Limpar seleção", "Remover …", "Usar: …", "Selecione...", "Buscar..." e "Nenhuma opção encontrada." eram fixos, e a lista se chamava "Suggestions" para o leitor de tela. Agora a lista se chama "Opções", e todos esses textos vêm de `labels` (padrões em `defaultComboboxLabels`). `placeholder`, `searchPlaceholder` e `emptyMessage` continuam valendo e ganham de `labels`.
- befa5ac: **`Combobox` serve para listas grandes e busca no servidor.** Com milhares de opções, abrir a lista e cada tecla levavam centenas de milissegundos, porque todas as opções eram montadas. Agora só as primeiras 100 que casam com a busca ficam na tela (`maxVisibleOptions`), mais as escolhidas, e uma linha diz quantas ficaram de fora e pede para continuar digitando (texto em `labels.hiddenOptions`).

  Para buscar no servidor, `onSearchChange(termo)` recebe o que a pessoa digita, as opções que voltam vão em `options` e `shouldFilter={false}` desliga o filtro local. Com `loading`, a lista diz "Carregando…" (`labels.loading`) em vez de "Nenhuma opção encontrada.". A opção escolhida continua com o nome no gatilho mesmo quando a busca seguinte não a traz.

- bb1d26f: **`Combobox` aceita `onBlur`.** Sem ele, o React Hook Form com `mode: "onBlur"` não validava o campo ao sair dele, e `touched` nunca ficava verdadeiro. `onBlur` é chamado quando o foco sai do campo inteiro: abrir a lista e digitar na busca, voltar ao gatilho depois de escolher, ou passar para o botão de limpar e para o × de um item não contam. Passe `onBlur={field.onBlur}` no `Controller`.
- 9d979f3: **`Combobox` ganha `readOnly`.** Uma tela de consulta precisava usar `disabled`, a 50% de opacidade e fora do Tab e do envio. Com `readOnly`, a escolha aparece num fundo esmaecido, sem reação ao hover: o gatilho recebe foco e é lido (`aria-readonly`), a lista não abre, não há botão de limpar nem × nos itens, e o valor vai junto no envio do formulário.
- 41ac4e8: **`Combobox` ganha `size`.** O gatilho tinha altura mínima fixa e crescia com o conteúdo. Agora `size` (`"sm"`, `"md"` ou `"lg"`, padrão `"md"`) dá a altura da caixa inteira, 32, 40 ou 44 px, a mesma de um botão, campo ou select do mesmo tamanho, e o texto longo é cortado com reticências.
- a4bce6f: **`Combobox` funciona sem estado externo e em formulário nativo.** Sem `value` e `onValueChange`, nada era selecionado, em silêncio. Agora, sem `value`, o campo guarda a própria escolha a partir de `defaultValue` (uma string, ou uma lista no modo `multiple`) e volta a ela no reset do formulário. Com `name`, um `<input type="hidden">` envia o valor bruto da opção (no modo múltiplo, uma entrada por valor, lida com `formData.getAll(name)`; sem nada escolhido, nenhuma entrada, como num `<select multiple>`); campo desabilitado não envia nada.
- dc9cf5c: **`CommandPalette`: itens com o mesmo rótulo funcionam.** Dois "Exportar" (um em Clientes, outro em Contratos) ficavam destacados juntos, a seta pulava o último e o Enter disparava sempre o primeiro; numa lista de clientes homônimos, abria o registro errado. Cada item ganha `id`, que identifica o item no teclado e é o que `value`/`onValueChange` informam. Sem `id`, o rótulo continua sendo o valor, e um rótulo repetido é desambiguado pela posição.
- 0f628ba: **`CommandPalette`: nomes em português para o leitor de tela.** O campo de busca passa a ser nomeado pelo `title` (antes, só pelo placeholder), a lista de resultados deixa de se chamar "Suggestions" (novo `labels.list`, padrão "Resultados") e o indicador de carregamento deixa de se chamar "Loading..." (usa `labels.loading`). `heading` de um grupo aceita qualquer `ReactNode`, como o tipo prometia; antes, o que não fosse texto era descartado.
- acf0bd8: **`CommandPalette` expõe o termo buscado.** `search` e `onSearchChange` dão o texto digitado no campo (controlado ou não), e `shouldFilter={false}` desliga o filtro local para mostrar os resultados do servidor como vieram: dá para buscar um lead pelo CPF com `loading` enquanto a requisição corre (veja a story `ServerSearch`).

  `value` e `onValueChange` continuam sendo o item destacado (o que o Enter escolheria), não o termo buscado, como a documentação dizia antes. `onValueChange` agora é chamado também quando `value` não é passado.

- 714a4b6: **`MultiInput`, `InputOTP` e `FileUpload` aceitam `onBlur`.** Sem ele, o React Hook Form com `mode: "onBlur"` não validava esses campos ao sair deles, e `touched` nunca ficava verdadeiro. `onBlur` é chamado quando o foco sai do campo inteiro: passar do campo de digitação para o × de um item (`MultiInput`), ou da dropzone para a lista de arquivos e para o diálogo da imagem (`FileUpload`), não conta. No `MultiInput`, o texto digitado já virou item quando `onBlur` chega.
- 1afe797: **Altura de controle em token.** `tokens.css` ganha `--spacing-control-sm` (32px), `--spacing-control-md` (40px) e `--spacing-control-lg` (44px), usados como `h-control-md`, `min-h-control-md` e `size-control-md`. A altura passa a ser a da caixa inteira, borda incluída: um controle com borda e um sem borda do mesmo tamanho ficam alinhados numa linha.

  Os gatilhos com cara de campo (Combobox, DateInput, DateRangePicker) já usam o token e medem 40px, não mais 42px.

- 14be013: **`CurrencyInput` ganha `allowNegative`.** Sem a prop (o padrão), o campo continua só com valores positivos. Com `allowNegative`, a tecla de menos torna o valor negativo, uma segunda (ou `+`) volta a positivo, e um número negativo colado mantém o sinal: digitar `-50` dá `-0,50` (antes, `0,50`), e um valor `-50` vindo de fora não perde mais o sinal na primeira tecla. Serve para estorno, desconto e saldo devedor.

  Com `allowNegative` o campo abre o teclado de texto no celular, porque o teclado numérico do iOS não tem o sinal de menos; passe `inputMode` para trocar.

- 556c178: **Colar no `CurrencyInput` não erra mais o valor por 10 ou 100 vezes.** A colagem seguia a regra da digitação (centavos primeiro): `350.000` copiado de uma planilha virava R$ 3.500,00 e `1.234,5` virava R$ 123,45. Agora o texto colado é lido como um número escrito por um brasileiro e substitui o valor do campo: com vírgula, ela é o separador decimal (`1500,5` → R$ 1.500,50); sem vírgula, um ponto seguido de um ou dois dígitos é decimal (`2350.9`, `1500.00`) e os demais pontos são de milhar (`350.000`); sem separador são reais inteiros (`1500` → R$ 1.500,00). `R$`, espaços e texto em volta são ignorados. A digitação continua preenchendo os centavos primeiro.

  O leitor também é exportado: `parseBRNumber("R$ 2.350,90")` devolve `2350.9`, e `null` quando o texto não tem número.

- 8bf88d6: **Tema escuro.** Ponha a classe `dark` no `<html>` (ou num ancestral) e todos os componentes trocam de tema: cada token de cor ganhou um valor em `.dark`, com o mesmo papel do claro, e o `color-scheme` acompanha (barras de rolagem e campos nativos escurecem junto).

  - Os componentes não usam `dark:`: quem muda são os tokens. A variante `dark:` do Tailwind fica configurada para ajustes nas telas do app.
  - Num ancestral, o tema vale para tudo o que está dentro: bordas e divisores, o texto solto (a cor do texto acompanha o tema; o fundo da seção continua sendo escolha do app) e também as camadas que abrem dali — menus, popovers, listas de `Select`, tooltips, dialogs, sheets e o `Tour` —, mesmo renderizadas no `<body>`. Os aliases `--color-*` são redeclarados em `.dark`, então o CSS do app que lê `var(--color-border)` também acompanha. Só os toasts seguem o tema do `<html>`.
  - No escuro, os preenchimentos de status `--destructive`, `--success` e `--warning` são os mesmos do claro, com o mesmo texto sobre eles. Só o `--info` fica mais claro, para se separar das superfícies escuras. Popovers e menus ficam um tom acima do fundo, já que a lib não usa sombra (o Dialog já se separa pelo backdrop).
  - Compatível com `next-themes` (`attribute="class"`) e com toggles do shadcn que já alternam `.dark`.
  - `bun run audit:contrast` mede os pares que os componentes desenham nos dois temas (texto ≥ 4,5:1, anel de foco e tons sólidos ≥ 3:1), e o test-runner do Storybook roda o axe em cada story no claro e no escuro.
  - Storybook: seletor **Claro / Escuro** na barra de ferramentas.

- 4ea2d61: **`DataTable`: alinhamento por coluna.** `meta: { align: "right" }` (ou `"center"`) alinha o cabeçalho, as células e o rodapé da coluna; antes o `th` era sempre `text-left`. O `formattedColumn` de números (dinheiro, quantidade, percentual) passa a alinhar à direita sozinho, e o de texto continua à esquerda; a nova opção `align` do `formattedColumn` escolhe outro alinhamento.
- 2e5c113: **`DataTable`: ids de coluna com chave aninhada e `ColumnDef` exportado.** `searchableColumns`, `sortableColumns`, `pinnedColumns` e `meta.exportOnly` aceitam a `accessorKey` como escrita (`"cliente.nome"`), além do id do TanStack (`"cliente_nome"`); antes só o segundo funcionava, e `exportOnly` numa chave aninhada não escondia a coluna. As listas passam a ser tipadas (`DataTableColumnKey<TData>`): o editor sugere as chaves da linha e aceita qualquer outro id.

  `ColumnDef`, `PaginationState` e `SortingState` são reexportados por `@amfernandesinc/ui`, então não é mais preciso importar `@tanstack/react-table`, que é uma dependência transitiva.

- e646a95: **`DataTable`: `.csv` para o Excel brasileiro.** Com `downloadable.filename` terminado em `.csv`, a lib escreve ela mesma o arquivo: UTF-8 com BOM (os acentos abrem certos), `;` entre as células, vírgula decimal sem separador de milhar, datas em `dd/mm/aaaa` (com `hh:mm` quando há hora) e `'` na frente de texto que começa com `=`, `+`, `-` ou `@`, para o Excel não rodá-lo como fórmula. Antes o arquivo saía com vírgula como separador, `1234.56`, datas `5/18/26` e fórmulas vivas.
- 4d9c4a6: **`dateColumn`: fuso, `id` e `accessorFn`.** Um instante (`Date`, epoch ou ISO com `Z`/deslocamento) agora aparece no fuso de São Paulo, não no da máquina, e a nova opção `timeZone` escolhe outro: `"2026-05-19T00:00:00.000Z"` continua aparecendo como "18/05/2026 21:00" em São Paulo, e com `timeZone: "UTC"` vira "19/05/2026". Uma data pura (`"2026-05-19"`, `"19/05/2026"`) nunca muda de dia, em nenhum fuso, e um horário sem deslocamento (`"2026-05-19T14:30"`, `"19/05/2026 14:30"`) é lido como está.

  `dateColumn` aceita `id` + `accessorFn` (campos aninhados, valores calculados), como `formattedColumn`. A ordenação compara instantes, a busca lê o texto da célula e a exportação grava a data e a hora que a célula mostra. `DateColumnOptions` passa a ser um tipo (união de `accessorKey` ou `accessorFn` + `id`).

- 1c35781: **`DataTable`: `density="compact"`.** Linhas de cerca de 36 px (`py-2`), cabeçalho mais baixo e paginação de 32 px, para listas densas de back-office. O padrão (`"default"`) continua com as linhas `py-2.5 px-3` da lib, de cerca de 41 px. A raiz ganha `data-density`.
- ff31c11: **`DataTable`: a planilha sai como a tela.** Sem `rowToRecord`, a exportação deixa de fora as colunas sem dado (ações), mantém lado a lado colunas com o mesmo título (antes uma sobrescrevia a outra), "Exportar dados filtrados" segue a ordenação da tela e `dateColumn` sai como data do Excel, não como o texto ISO. Uma coluna pode sair do arquivo com `meta.export: false` ou dar o próprio valor com `meta.export: (row, value) => ...`.

  Uma exportação que falha (um `fetchAll` que rejeita, o arquivo que não pode ser escrito) não passa mais em silêncio: chama o novo `downloadable.onExportError(error)` e mostra `labels.exportError` ("Não foi possível exportar os dados. Tente de novo.") sob a barra até a próxima tentativa.

- 13d325b: **`DataTable`: rodapé de colunas (totais).** O `footer` de uma coluna (`ColumnDef.footer`), que era ignorado, agora aparece num `<tfoot>` sob as linhas, com o estilo de `tableStyles().footer`. Use para totais, médias ou contagens; a função recebe o contexto do TanStack e pode somar as linhas filtradas. Sem nenhum `footer`, a tabela não ganha `<tfoot>`.
- c91ca65: **`DataTable`: `getRowId`.** `getRowId={(row, index) => row.id}` dá a cada linha uma identidade estável. A tabela usa esse id como chave das linhas, então o que está dentro de uma linha (um campo digitado, um menu aberto) fica com aquela linha quando a página, a ordem ou os dados mudam; antes a chave era a posição, e uma anotação da linha 1 aparecia ao lado do cliente da página seguinte. Sem `getRowId`, a chave continua sendo o índice em `data`.
- b3f7b7f: **`DataTable`: cabeçalho agrupado.** Uma coluna com `columns` (um grupo, como "Cliente" sobre "Nome" e "Cidade") agora ocupa as suas colunas, com `colSpan` e `scope="colgroup"`; antes eram 2 `th` sobre 3 colunas. Só os cabeçalhos das colunas finais ordenam e recebem `aria-sort`, e o esqueleto de carregamento tem uma célula por coluna final.
- 9646b85: **`DataTable`: o rodapé usa a `Pagination` da lib.** No lugar dos botões anterior/próxima de 36 px, o rodapé mostra a `Pagination`: números de página com reticências, a faixa ("11–20 de 243") e o seletor de tamanho, com controles de 40 px. Os textos de `DataTableLabels` continuam valendo (`paginationPrevious`, `paginationNext`, `pageSize`), e o novo `labels.pagination` ajusta os outros textos da `Pagination`; `pageIndicator` fica obsoleto.

  Passar só `onPaginationChange`, sem `pageIndex`, não congela mais a página: a tabela segue paginando e só avisa. Um novo array `data` com a mesma busca, filtros e ordenação não leva mais o usuário de volta à página 1 (um refetch ou uma linha editada mantêm a página); a volta acontece quando a busca, um filtro ou a ordenação mudam, e a nova prop `autoResetPage` liga ou desliga isso (padrão `true`, `false` com `manualPagination`). Se os dados encolhem abaixo da página atual, a tabela vai para a última página que existe.

- 14b0065: **`DataTable`: colunas fixas à esquerda.** `pinnedColumns={{ left: ["numero", "cliente.nome"] }}` (por id ou `accessorKey`) leva essas colunas para a esquerda, na ordem dada, e as mantém no lugar quando a tabela rola para o lado, com uma linha depois da última. As células fixas não quebram linha e seguem a cor da linha (hover, seleção, `rowClassName`).
- 4e6d4cd: **`DataTable` aceita `ref` e atributos na raiz.** `ref`, `id`, `data-*`, `title`, eventos e os demais atributos de `<div>` vão para o elemento raiz (`data-slot="data-table"`), como em `Card` e `EmptyState`. `aria-label` e `aria-labelledby` continuam indo para a `<table>`.
- 5e4be90: **`DataTable`: modo servidor com o total certo.** A nova prop `rowCount` recebe o total de linhas no servidor: o rodapé (`showRowCount`) mostra esse número, não o tamanho da página, e a contagem de páginas sai dele quando `pageCount` não é passado. Sem nenhum dos dois, a tabela não mostra mais "Página 1 de -1": omite o total e mantém "próxima" disponível; com paginação no servidor e sem `rowCount`, a contagem de registros some em vez de mostrar o tamanho da página.

  Na exportação, os escopos que a tabela não consegue preencher somem do menu: com `manualPagination`, "Exportar todos os dados" e "Exportar dados filtrados" só aparecem com `fetchAll` e `fetchFiltered`; com `manualFiltering`, "todos" pede `fetchAll`. Antes eles exportavam só a página atual com o nome de "todos".

- 9ddb562: **`DataTable`: a caixa que rola é alcançável pelo teclado.** Quando a tabela rola (colunas largas, `maxHeight`), a caixa de rolagem entra na ordem do Tab como uma região com o nome da tabela (ou `labels.scrollRegion`, "Tabela com rolagem"), com o anel de foco por dentro: quem usa teclado rola com as setas mesmo sem nenhum controle na tabela. Enquanto nada rola, ela não acrescenta parada de Tab.
- 843e192: **`DataTable`: seleção de linhas.** `selectable` põe uma caixa por linha, com o nome da linha ("Selecionar C-2026-001", do texto da primeira coluna), e uma no cabeçalho, que seleciona as linhas da página e mostra o estado misto quando só algumas estão marcadas. A seleção é uma lista de ids (`getRowId`), então sobrevive à troca de página, à ordenação e às páginas do servidor. Controle com `selectedRowIds` + `onSelectionChange(ids)` ou comece com `defaultSelectedRowIds`.

  Enquanto há algo selecionado, uma barra acima da tabela mostra a contagem, as ações de `selectionActions={(ids) => ...}` e "Limpar seleção". As linhas selecionadas ficam marcadas (`data-state="selected"`, fundo de destaque) e, em cores forçadas, ganham um contorno do sistema. As caixas têm alvo de 24 × 24 px. Os textos estão em `labels` (`selectPage`, `selectRow`, `selectedCount`, `clearSelection`).

- e2d566d: **`DataTable`: nome da tabela e cabeçalhos certos.** Novas props `aria-label`, `aria-labelledby` e `caption` dão nome à `<table>` (a `caption` também aparece, sob as linhas). Os `<th>` ganham `scope="col"`.

  O botão de ordenar de cada coluna passa a se chamar pelo texto do cabeçalho ("Número"), e "Ordenar por Número" (`labels.sortBy`) vira a descrição dele. Antes o `aria-label` do botão virava o nome da coluna, e o leitor de tela lia "Ordenar por Número" a cada célula; com cabeçalho que não é texto, lia o id da coluna. Testes que procuravam `getByRole("button", { name: "Ordenar por Número" })` passam a usar `{ name: "Número" }` (ou `{ description: "Ordenar por Número" }`). O anel de foco desse botão fica por dentro, para não ser cortado na primeira coluna.

- 6afde00: **`DataTable`: carregando, vazio e erro.** "Carregando dados…" agora chega ao leitor de tela: ficava dentro de uma linha `aria-hidden`. A tabela tem uma única região de status, no DOM desde o início, que anuncia o carregamento e a busca que esvazia a tabela; a mensagem de vazio visível deixa de ser um `role="status"` que já nasce com texto. O esqueleto tem tantas linhas quanto o tamanho de página atual, inclusive depois de trocar o tamanho.

  Novo estado de erro: `error` (texto ou `true`, que usa `labels.error`) aparece no corpo como alerta, no lugar de "Nenhum resultado.", e `onRetry` mostra um botão "Tentar de novo" (`labels.retry`). Testes que procuravam "Nenhum resultado." com `getByText` passam a achar o texto também na região de status: procure pela célula (`getByRole("cell", { name })`).

- be9ab2a: **`DataTable`: `maxHeight` e `stickyHeader`.** `maxHeight` (`320`, `"50vh"`) limita a altura da tabela: o corpo rola dentro da caixa e o cabeçalho fica visível no topo (`stickyHeader`, ligado por padrão quando há `maxHeight`; passe `false` para desligar). A linha sob o cabeçalho acompanha a rolagem.
- 7821d1d: **`DataTable`: exportação sem o pacote `xlsx`.** O `.xlsx` agora é gerado com `write-excel-file` (MIT, sem alertas de segurança), no lugar do `xlsx@0.18.5`, que tem dois alertas de severidade alta sem versão corrigida no npm. Continua sendo carregado só no primeiro export. A dependência `xlsx` sai do pacote.

  Datas (`Date`) saem como datas do Excel no mesmo dia e hora que a tabela mostra, em qualquer fuso do navegador: antes, uma data à meia-noite em São Paulo abria no Excel como o dia anterior. O cabeçalho sai em negrito e congelado, e as colunas com a largura do conteúdo. Nomes terminados em `.xls`, `.xlsm`, `.xlsb`, `.ods` ou `.txt` passam a sair como `.xlsx` (é o formato gravado); `.csv` continua CSV.

  **Como migrar:** nada a fazer na tabela. Se o app usava o pacote `xlsx` que vinha com a lib, declare-o no `package.json` do app.

- 36e07f2: **`DateInput` ganha `min` e `max`, e `disabledDays` vale também para a data digitada.** `min` e `max` (ISO) desligam os dias fora do intervalo no calendário e param a navegação nos limites. Uma data digitada fora do intervalo, ou num dia que `disabledDays` exclui, não é reportada; ao sair do campo, ele diz o motivo ("A data deve ser a partir de 01/06/2025.", "A data deve ser até 31/12/2025.", "Esta data não está disponível.", textos em `labels`) e reporta `""`.
- af4b385: **`DateInput` aceita `name`.** Num formulário nativo, o campo não enviava nada. Com `name`, um `<input type="hidden">` envia a data ISO (`1990-03-15`), a mesma que `onValueChange` reporta, e não o texto `15/03/1990` que aparece na tela; o campo visível fica sem `name`. Desabilitado, não envia.
- d9c543e: **`DateInput` aceita `onBlur`.** Sem ele, o React Hook Form com `mode: "onBlur"` não validava o campo ao sair, e `touched` nunca ficava verdadeiro. `onBlur` é chamado quando o foco sai do campo inteiro, depois de uma data inválida virar `""`: passar do texto para o botão do calendário ou para o calendário aberto não conta. Passe `onBlur={field.onBlur}` no `Controller`.
- 5da8d56: **`DateInput` reporta por `onValueChange`.** Os outros campos de valor (`Combobox`, `DateRangePicker`, os de domínio) usam `onValueChange(valor)`; o `DateInput` usava `onChange(valor)`, que parece o evento de um `<input>`. `onValueChange` recebe a mesma string ISO (ou `""`). `onChange` continua funcionando e está marcado como obsoleto.
- d1415e2: **`DateInput` ganha `readOnly`.** Com `readOnly`, a data aparece num fundo esmaecido, sem reação ao hover e sem o botão do calendário: o campo recebe foco, pode ser copiado e vai junto no envio do formulário (com `name`), mas não aceita digitação nem colagem. Antes, uma tela de consulta precisava usar `disabled`, a 50% de opacidade e fora do Tab e do envio.
- a36ebb6: **`DateInput` ganha `size`.** `size` (`"sm"`, `"md"` ou `"lg"`, padrão `"md"`) dá a altura da caixa inteira, 32, 40 ou 44 px, a mesma de um botão, campo ou select do mesmo tamanho; o botão do calendário acompanha. Antes o gatilho tinha altura própria, que não alinhava com os outros controles.
- d78248a: **`DateInput` mostra a data de um valor com hora.** Um `value` vindo da API como `"2025-03-14T00:00:00Z"` aparecia como campo vazio. Agora o campo mostra a parte da data (`14/03/2025`) e o calendário abre nela; o que o campo reporta continua sendo só a data (`"2025-03-14"`).
- e2b735c: **`DateInput` é digitável.** O campo era um botão: só dava para escolher a data no calendário, e uma data de nascimento pedia gatilho, legenda, ano, mês e dia. Agora é um campo de texto com máscara `dd/mm/aaaa` (as barras entram sozinhas, o cursor fica onde estava ao editar no meio, colar `15/03/1990` ou `1990-03-15` preenche) e um botão "Abrir calendário" no fim. O valor continua a string ISO `yyyy-MM-dd` e é sempre a data da tela: uma data inteira e válida reporta o ISO; enquanto o texto está incompleto, não existe (`31/02/2026`) ou cai fora de `min`/`max`, o campo reporta `""` e o texto fica para ser corrigido (como o `<input type="date">` nativo). Ao sair do campo nesse estado, ele mostra "Data inválida" (texto em `labels.invalidDate`, a menos que você passe `error`). Num formulário nativo, um texto que não é data deixa o campo inválido para o navegador, com a mesma mensagem: Enter, que envia sem tirar o foco, para no campo em vez de enviar a data anterior. O calendário abre com o foco no dia escolhido, e Enter nele mantém a data em vez de apagá-la. O nome acessível vem do `label` e o leitor de tela lê o valor do campo.

  **Migração.** `ref` agora aponta para o `<input>` de texto, não para o botão: troque `useRef<HTMLButtonElement>` por `useRef<HTMLInputElement>`. Testes que procuravam o campo como `getByRole("button", { name: "Data…" })` passam a usar `getByRole("textbox", { name: "Data…" })`; o botão do calendário se chama "Abrir calendário" (`labels.openCalendar`).

- 1ce810c: **`DateInput` funciona sem estado externo.** `value` era obrigatório. Agora, sem `value`, o campo guarda a própria data a partir de `defaultValue` (ISO) e volta a ela quando o formulário é resetado, como um `<input>` nativo.
- 32160f0: **`DateRangePicker`: o leitor de tela ouve o período escolhido.** O gatilho recebia um `aria-label` igual ao rótulo, que escondia o período na tela, o "obrigatório" do rótulo e qualquer rótulo que não fosse texto simples (virava "Selecionar período"). Agora o nome do gatilho é o rótulo seguido do período ("Período de vigência obrigatório 01/01/2025 — 31/01/2025"); sem período, é só o rótulo, sem o placeholder. Um `aria-label` passado continua valendo no lugar do rótulo, e sem nenhum dos dois o nome é "Período" (`labels.field`).
- a6d545b: **`DateRangePicker` ganha `labels`.** "Limpar" e "Confirmar" eram texto fixo, e um produto não conseguia ajustar a cópia (por exemplo, "Aplicar"). `labels` recebe esses textos, com os padrões em português em `defaultDateRangePickerLabels`.
- df02890: **`DateRangePicker` ganha `min`, `max` e `disabledDays`.** Não havia como proibir dias no período (por exemplo, datas futuras num relatório de apuração). `min` e `max` (ISO) desligam os dias fora do intervalo e param a navegação nos limites; `disabledDays` aceita os mesmos presets, datas e funções do `Calendar` e do `DateInput`.
- 5af3421: **`DateRangePicker` aceita `name`.** Num formulário nativo o seletor não enviava nada. Com `name="vigencia"`, dois `<input type="hidden">` enviam `vigencia-from` e `vigencia-to` com as datas ISO (`""` para um extremo aberto). Desabilitado, não envia.
- 9c82e1f: **`DateRangePicker` aceita `onBlur`.** Sem ele, o React Hook Form com `mode: "onBlur"` não validava o seletor ao sair dele, e `touched` nunca ficava verdadeiro. `onBlur` é chamado quando o foco sai do seletor inteiro: entrar no calendário aberto, navegar entre os meses e usar "Limpar" ou "Confirmar" não contam. Passe `onBlur={field.onBlur}` no `Controller`.
- b2d53db: **`DateRangePicker` ganha `readOnly`.** Com `readOnly`, o período aparece num fundo esmaecido, sem reação ao hover: o gatilho recebe foco e é lido, não anuncia nem abre o calendário, e o período vai junto no envio do formulário (com `name`). Antes, uma tela de consulta precisava usar `disabled`.
- bad5bc5: **`DateRangePicker` ganha `size`.** `size` (`"sm"`, `"md"` ou `"lg"`, padrão `"md"`) dá a altura do gatilho, 32, 40 ou 44 px, a mesma de um botão, campo ou select do mesmo tamanho, para alinhar o seletor numa linha de filtros.
- c69fa4d: **`DateRangePicker` funciona sem estado externo.** `value` e `onValueChange` eram obrigatórios. Agora, sem `value`, o seletor guarda o próprio período a partir de `defaultValue` e volta a ele quando o formulário é resetado. Um valor com hora (`"2025-03-14T00:00:00Z"`) passa a mostrar a data em vez de ficar vazio.
- e1dc537: **Os helpers de data passam a trabalhar no fuso de São Paulo, e data pura nunca muda de dia.** `src/lib/date` lia e formatava tudo em UTC. Às 21h30 em São Paulo já é o dia seguinte em UTC, então `formatDate(new Date(), "us")` devolvia a data de amanhã, `isPast("2026-11-23")` dizia que amanhã já tinha passado e `formatDate("2024-01-15T23:30:00-03:00", "brl-full")` mostrava `16/01/2024 02:30`.

  Agora há um modelo só:

  - **Data pura** (`"2024-01-15"`) é um dia do calendário: sai no mesmo dia em qualquer fuso. Em `isPast` e `isFuture`, hoje não é passado nem futuro.
  - **Instante** (um `Date`, ou texto com `Z` ou deslocamento) é mostrado e comparado em `America/Sao_Paulo`: `formatDate("2024-01-15T23:30:00-03:00", "brl-full")` devolve `15/01/2024 23:30`.
  - **Data e hora sem deslocamento** (`"2024-01-15T14:30"`) é o relógio da parede, igual no servidor e no navegador.

  Todas as funções ganharam um último argumento opcional `timeZone` (o padrão é exportado como `DEFAULT_TIME_ZONE`). As assinaturas antigas continuam valendo; mudam os resultados:

  - `formatDate("2024-01-15T14:30:00Z", "brl-full")` devolve `15/01/2024 11:30` (antes, `14:30`).
  - `parseDate("2024-01-15", "14:30")` é 14h30 em São Paulo (`17:30Z`), e `parseDate("2024-01-15")` é a meia-noite de São Paulo (`03:00Z`).
  - `isSameDay`, `startOfDay`, `endOfDay`, `startOfMonth`, `endOfMonth`, `addDays` e `addMonths` usam o calendário de São Paulo, inclusive nos anos com horário de verão.

  **Como migrar.** Se o seu backend devolve datas puras como instante em UTC (`"2024-01-15T00:00:00.000Z"`), elas passam a cair às 21h do dia anterior. Passe `"UTC"` como `timeZone` (`formatDate(valor, "brl", "UTC")`) ou corte o texto para `YYYY-MM-DD` antes de formatar. Com `"UTC"` em todas as chamadas, o comportamento é o de antes.

- d58b7aa: **Com `name`, os campos formatados enviam o valor limpo.** `CPFInput`, `CNPJInput`, `CEPInput`, `PhoneInput`, `CurrencyInput` e `PercentageInput` repassavam o `name` ao campo visível, e um `<form>` nativo (ou `FormData`) recebia o texto com máscara (`529.982.247-25`, `1.234,56`) enquanto `onValueChange` entregava o valor limpo. Agora o `name` vai para um `<input type="hidden">` com o mesmo valor que `onValueChange` reporta: os dígitos do documento, ou o número (`1234.56`) nos campos de dinheiro e percentual. O campo visível fica sem `name`.

  Quem lia `form.elements[name].value` esperando a máscara passa a receber o valor limpo; para exibir, use `formatCPF`, `formatCNPJ`, `formatCEP`, `formatPhone` ou `toBRLMoney`.

- f3de7f4: **Estado somente leitura nos campos formatados.** `CPFInput`, `CNPJInput`, `CEPInput`, `PhoneInput`, `CurrencyInput` e `PercentageInput` com `readOnly` mostram o valor num fundo esmaecido, sem reação ao hover: ele continua legível, recebe foco, pode ser copiado e é enviado no formulário, mas não aceita digitação nem colagem. É o estado para tela de consulta, que antes só dava para imitar com `disabled`, a 50% de opacidade e fora do Tab e do envio.
- a172898: **Os campos formatados ganham `size` e passam a medir 40px.** `CPFInput`, `CNPJInput`, `CEPInput`, `PhoneInput`, `CurrencyInput` e `PercentageInput` aceitam `size="sm" | "md" | "lg"` (32, 40 e 44px; padrão `md`). A altura vem do token de controle, borda incluída, e não mais do padding: o campo padrão passa de 42px para 40px e fica alinhado com botões e gatilhos do mesmo tamanho.

  `size` deixa de ser o atributo nativo de largura em caracteres do `<input>`; para largura, use `className`.

- 0534bee: **DropdownMenu** (novo): menu de ações preso a um gatilho (`@amfernandesinc/ui/dropdown-menu`). Data-driven, como o resto da lib: as linhas vêm em `items`.

  - Ação (padrão): `label`, `icon`, `shortcut`, `onSelect`, `variant: "destructive"`, `disabled`, `keepOpen`. Com `href` (e `target`), a linha vira um link de verdade; protocolos inseguros são descartados.
  - `{ type: "checkbox" }`, `{ type: "radio" }`, `{ type: "group" }` (com título), `{ type: "separator" }` e `{ type: "submenu" }`.
  - `trigger` aceita qualquer elemento focável — `Button`, `IconButton`…
  - Teclado completo (setas, Home/End, busca por letra, Esc devolve o foco ao gatilho). Dentro de um `Dialog`, Esc e o clique num item fecham só o menu.

  Nova dependência: `@radix-ui/react-dropdown-menu`.

- 3f25887: **EmptyState** (novo): placeholder para áreas sem dados — ícone, título, descrição e ações (`@amfernandesinc/ui/empty-state`).

  - `headingLevel` muda só a tag do título (h1–h6), sem mudar o tamanho.
  - `compact` para cards, popovers e colunas estreitas (ações empilhadas).
  - `announce` lê título e descrição no leitor de tela quando o estado vazio aparece por uma ação do usuário (busca ou filtro sem resultado).
  - Funciona como `emptyMessage` da `DataTable`.

- 4e77afe: **`FileUpload`: uma parada de Tab a menos, e a dica e o erro passam a ser anunciados.** O `<input type="file">` oculto era uma segunda parada de Tab, de 1×1 px e sem nome; agora ele fica fora da ordem de Tab e da árvore de acessibilidade, e só a dropzone é operada.

  A dropzone era nomeada por `aria-label`, que escondia do leitor de tela a dica de tipo e tamanho. Agora ela é nomeada pelo rótulo visível (`aria-labelledby`, inclusive quando o `label` não é texto) e descrita pela dica e pela mensagem de `error` (`aria-describedby`). `labels.dropzoneAriaLabel` ficou sem uso e está marcado como obsoleto.

- b69091f: **`FileUpload` ganha `id`, `name`, `required` e `ref`.** Com `name`, um `<input type="file">` oculto carrega os arquivos da lista, e o `FormData` de um form nativo os recebe sob esse nome (os `items`, que já estão no servidor, não vão). Com `required`, a dropzone mostra um `*`, o nome acessível ganha "(obrigatório)" e o form nativo não é enviado com a lista vazia: o aviso "Selecione um arquivo." aparece embaixo da dropzone e o foco vai para ela. O reset do formulário (um botão `type="reset"`, `form.reset()`, o reset que o React 19 faz depois de uma `action` ou o `reset()` do react-hook-form) esvazia a lista, como num `<input type="file">`; controlado, a lista é do app e continua indo no envio.

  `id` vai para a dropzone (um `<label htmlFor>` de fora abre o seletor) e `ref` aponta para ela, de modo que o React Hook Form consegue focar o campo num erro. Os textos novos ficam em `labels` (`required`, `requiredError`).

- de9f9b8: **`FileUpload` mostra anexos que já estão no servidor e o estado de cada envio.** A nova prop `items` (`{ id, name, size?, url?, status?, progress?, error? }[]`, tipo `FileUploadItem`) entra na mesma lista, antes dos arquivos escolhidos: com `url`, uma imagem ganha miniatura e abre ampliada, um PDF abre em outra aba e o resto é baixado; `status: "uploading"` mostra uma barra de progresso (sem `progress`, só "Enviando…") e `status: "error"` mostra o motivo (`error`, ou "Falha no envio"). Uma `url` que não seja `http:`, `https:` ou relativa é ignorada.

  `onRemoveItem(id)` recebe a remoção de um item (sem ela, o item não tem botão de remover) e os itens contam para `maxFiles`. O fluxo usual é receber o arquivo em `onValueChange`, começar o envio e passá-lo para `items`. `value: File[]` continua funcionando como antes. Os textos novos ficam em `labels` (`uploading`, `uploadFailed`, `uploadProgress`).

- dce4aef: **`FileUpload` só abre imagem e PDF; o resto é baixado.** Na lista de arquivos, qualquer arquivo que não fosse imagem abria numa nova aba por um blob URL. Um blob URL pertence à origem da página: um `.html` escolhido pelo usuário rodava o script dele com os cookies e o `localStorage` da aplicação.

  Agora uma imagem continua abrindo ampliada, um PDF abre em outra aba e qualquer outro arquivo é **baixado**. O botão desses arquivos passa a se chamar "Baixar {nome}" (`labels.downloadFile`), com ícone de download; o nome usado quando o arquivo não tem um fica em `labels.fileFallbackName`.

- 304bad4: **`FileUpload` aceita `readOnly`.** Some o dropzone, a câmera e o botão de remover; os arquivos continuam abríveis e vão no formulário; no lugar do dropzone ficam o `label` e, sem arquivos, "Nenhum arquivo." (`labels.noFiles`). A story que se chamava `ReadOnly` (só `removable={false}`) agora é `AppendOnly`.
- dc87c28: **`FileUpload` explica por que recusou um arquivo.** Sem `onReject`, um arquivo acima de `maxSize`, de tipo fora de `accept` ou além de `maxFiles` sumia sem aviso; a foto da câmera passava pelo mesmo filtro. Agora o motivo de cada recusa aparece embaixo da dropzone ("planta.pdf: maior que 2,0 MB"), é anunciado ao leitor de tela e some na tentativa seguinte.

  Os textos ficam em `labels` (`rejectedType`, `rejectedSize`, `rejectedMaxFiles`). `onReject` continua sendo chamado. Quem já avisa por conta própria, com um toast por exemplo, pode desligar a mensagem embutida com `showRejections={false}`.

- 814039b: **`FileUpload` escreve os tamanhos em português.** A lista, a dica da dropzone e a mensagem de recusa mostravam "até 1.0 KB", com ponto decimal. Agora saem "até 1,0 KB" e "2,5 MB", e a unidade sobe quando o número chegaria a 1.024 (1.048.575 bytes são "1,0 MB", não "1024.0 KB").

  O "até" da dica e as unidades entram em `labels`: `maxSizeHint: (limit) => string` e `sizeUnits: { bytes, kilobytes, megabytes, gigabytes }` (tipo `FileSizeUnits`). Quem conferia o texto antigo em teste precisa trocar o ponto pela vírgula.

- 13819ae: **A miniatura de um arquivo no `FileUpload` usa a camada de estado no hover.** Ao passar o mouse, a miniatura inteira ficava a 80% de opacidade, fora do padrão de hover e pressionado da biblioteca. Agora uma camada (`data-slot="file-upload-tile-layer"`) pinta o tom de hover e de pressionado por cima da miniatura, imagem incluída, e ela continua com opacidade total.
- 6a1a369: **Foco e campos do Astryx.**

  - **Controles:** um anel só, contorno de 2px sólido na cor `--ring`, 3px afastado, em `:focus-visible`. Tokens `--focus-outline-width`, `--focus-outline-style`, `--focus-outline-color` e `--focus-outline-offset`; utilitários `focus-outline` e `focus-outline-inset` (células e itens que um contêiner cortaria). O mesmo anel é o padrão de todo elemento focável, então links e botões do app saem iguais aos da lib.
  - **Campos** (Input, Textarea, inputs brasileiros, MultiInput, TimePicker, InputOTP, selects de paginação): visual de campo do Astryx (`field-states`). No foco, a borda vira a primária e ganha um anel interno de 2px da primária a 20% (25% no escuro); no hover, um anel interno da cor da borda a 30%. Com erro (`border-destructive field-error`), a borda fica vermelha também no foco e o hover usa o vermelho.
  - Os gatilhos de **Combobox, DateInput e DateRangePicker** passam a ter o visual de campo (antes eram botões "outline") e agora mostram a borda vermelha de erro, que antes não mostravam.
  - O × de remover do `Combobox` múltiplo, que não mostrava foco, passa a mostrar.

- b54e027: **`formatCPF`, `formatCNPJ`, `formatCEP` e `formatPhone` escrevem como os campos.** Os helpers de `lib/format` tinham máscaras próprias, diferentes das de `CPFInput`, `CNPJInput`, `CEPInput` e `PhoneInput`. Agora usam as mesmas: uma tabela e o formulário que edita o valor mostram o mesmo texto.

  Muda na prática: `formatPhone("+55 11 98765-4321")` passa a dar "(11) 98765-4321" (sem o código do país e o zero de operadora, como o `PhoneInput`), em vez de devolver o texto como veio; e um valor que não é um documento inteiro sai limpo em vez de mascarado pela metade (`formatCPF("123456789001")` dá "123456789001", não "123.456.789-001").

- 8d7fef5: **Textos padrão do `Combobox` e do `DateInput` no índice.** `defaultComboboxLabels` e `defaultDateInputLabels`, com os tipos `ComboboxLabels` e `DateInputLabels`, podem ser importados de `@amfernandesinc/ui`, como os dos outros componentes, para montar uma cópia a partir dos padrões.
- 7da3c26: **Azul funcional.** Link, foco e "onde estou" ganham uma cor só deles, o marinho-500 (marinho-300 no escuro); a primária continua nos preenchimentos.

  - **Foco:** o anel dos controles e a borda e o anel interno dos campos (`field-states`) usam `--ring`, o azul funcional.
  - **Botão principal:** hover e pressed trocam de tom (`--primary-hover`, `--primary-pressed`) em vez de usar a camada de 5%, que mal aparecia sobre o marinho-950. Vale também para o `IconButton` primário.
  - **Botão `link`:** usa `--link`.
  - **AppShell:** o item inativo do menu recua para `--muted-foreground`; o ativo usa `--accent`, peso maior e um marcador de 3px no azul funcional. O fundo do item ativo fica mais forte que o do hover.
  - **Checkbox, Radio e o indicador do Combobox múltiplo:** desmarcados usam a borda `--input`; marcados continuam na primária.
  - **DataTable:** a linha selecionada usa `--accent`.

- 171d0b9: **Paleta do grupo.** As cores passam a sair do marinho que AM Fernandes e Ponto Forte dividem: neutros na escala Grafite (o matiz do marinho, quase sem saturação) e primária no marinho-950. Todos os valores mudaram nos dois temas; os nomes dos tokens que já existiam continuam os mesmos.

  - **Novos tokens:** `--primary-hover`, `--primary-pressed`, `--subtle-foreground` (terceiro nível de texto), `--link`, `--selection`, `--selection-foreground`, `--border-strong`, `--destructive-text`, `--chart-6`, `--chart-seq-1` a `-5` e `--chart-div-1` a `-7`, com as classes correspondentes (`text-link`, `text-subtle-foreground`, `border-border-strong`, `text-destructive-text`…).
  - **Texto em três níveis:** `--foreground`, `--muted-foreground` e `--subtle-foreground`. O placeholder usa o terceiro. No escuro o texto principal desce para o grafite-200, sem o branco puro.
  - **Borda de campo a 3:1 ou mais** (`--input`).
  - **Status:** erro e informação são os do clique-estoque; o alerta é um ouro com texto escuro e o sucesso, um verde puxado para o azul. Cada um fica numa luminosidade, para se distinguirem também sob daltonismo.
  - **Categorias** (`--category-*`): as nove continuam, com croma baixo e uma luminosidade para cada sólido.
  - **Gráficos:** três paletas em vez de cinco cores soltas. `--chart-1` a `--chart-6` (categórica, sempre nesta ordem), `--chart-seq-*` (sequencial, um matiz) e `--chart-div-*` (divergente, vermelho e marinho em torno de um neutro).
  - **Tema escuro:** página grafite-950, superfícies 900 e camadas flutuantes 850; o item ativo usa o marinho-700, a cor das marcas.
  - `::selection` passa a usar a paleta.

  **Telas do app mudam:** todas as cores mudam de valor. `--chart-2` a `--chart-5` mudaram de matiz: confira gráficos que dependiam de uma cor específica. `--accent` deixou de ser um cinza e agora é o azul do item selecionado: onde era usado como fundo neutro, troque por `--muted`.

- 99029f9: **IconButton** (novo): botão quadrado só com ícone (`@amfernandesinc/ui/icon-button`).

  - `label` é obrigatório: vira o nome acessível e o tooltip (`tooltip={false}` desliga).
  - Mesmas cores do `Button` (`variant`), com `ghost` como padrão. `size`: `sm` (32px), `md` (40px, a altura do `Button`) e `lg` (44px, alvo de toque).
  - `loading` troca o ícone por um spinner e desabilita o botão.
  - Nasce com `type="button"`, para não enviar o formulário em que estiver.
  - O tooltip aparece no hover e no foco pelo teclado, mas não quando o foco é posto por código depois de um clique (ex.: o `Dialog` focando o primeiro botão, ou um menu devolvendo o foco ao gatilho) — assim ele não segura o próximo Esc.

- c2ac917: **`Image`: estado "sem imagem", `fallback`, `labels` e `blurDataURL`.**

  - `src` aceita vazio, `null` ou `undefined`: um imóvel sem foto mostra um ícone e "Sem imagem", não mais "Falha ao carregar imagem".
  - `fallback` troca o que aparece no lugar da imagem (sem `src`, endereço recusado ou erro de carga), por exemplo as iniciais de um lead. O texto padrão vem de `labels` (`empty`, `error`) e some em caixas com menos de 8rem.
  - O `alt` continua com o leitor de tela quando a imagem falha ou o endereço é recusado: o fallback vira `role="img"` com esse nome. Antes, com endereço recusado, ele sumia.
  - `placeholder="blur"` com `blurDataURL` mostra a miniatura borrada até a foto chegar; sem ela continua sendo um bloco neutro (agora documentado assim).
  - Uma imagem que já estava carregada quando o React montou (SSR com cache) aparece, em vez de ficar transparente.
  - A documentação de `allowedProtocols` dizia "opt in": ela **substitui** a lista padrão. Para acrescentar, use `[...DEFAULT_ALLOWED_RESOURCE_PROTOCOLS, "data:"]`.
  - O fade usa os tokens de movimento e some com movimento reduzido. O `ref` aponta para o `<img>` e é `null` enquanto o fallback aparece.

  **Como migrar:** um `src` vazio deixa de ser erro e mostra "Sem imagem"; para outra coisa no lugar, use `fallback`.

- f5cc223: **`Input` ganha `wrapperClassName` e `fieldClassName`.** O `className` do `Input` cai no `<input>` de dentro, que não tem borda nem fundo, e não havia como estilizar a caixa nem o campo inteiro. Agora `wrapperClassName` vai na caixa com a borda e o fundo, e `fieldClassName` no campo com rótulo e mensagens (largura, margens).

  O `className` continua no `<input>`, para alinhamento de texto e `tabular-nums`. Para um ícone dentro da caixa use `leadingIcon` ou `trailingIcon` em vez de `pl-*` no `className`.

- 999f42d: **`InputOTP` ganha `name`, anuncia o obrigatório e funciona sem `value`.** Com `name`, o form nativo recebe o código digitado. Com `required`, o campo recebe `aria-required` e um form nativo não é enviado com ele vazio. `value` e `onValueChange` passaram a ser opcionais: sem `value`, o campo guarda o próprio código a partir de `defaultValue` e volta a ele quando o formulário é resetado. Quem já passava `value` não precisa mudar nada.
- 20d0a3f: **`InputOTP` abre o teclado certo para o `pattern`.** O teclado do celular era sempre numérico, mesmo com um `pattern` que aceita letras: um token de convite como "A7K2Q9" não podia ser digitado. Agora o padrão (só dígitos) abre o teclado numérico e um `pattern` que aceita letras abre o de texto. A nova prop `inputMode` (`"numeric"` ou `"text"`) escolhe o teclado à mão, quando for preciso.
- 2f37ad7: **`InputOTP` aceita `readOnly`.** O código aparece em caixas com fundo `muted` e sem cursor piscando; digitar, colar ou apagar não o muda; continua focável e vai no formulário.
- 81c301f: **`Input` ganha `size` e passa a medir 40px.** `size="sm"` (32px), `"md"` (40px, padrão) e `"lg"` (44px) definem a altura da caixa com a borda, pelos tokens de altura de controle. Antes a altura saía do padding e dava 42px, 2px a mais que o `Button` ao lado.

  `size` é a prop do design system, não o atributo nativo `size` do `<input>` (que o componente já não repassava).

- 31ea5ec: **Estados de hover, pressed e disabled do Astryx.**

  - Hover e pressed viram uma camada translúcida da cor do texto do próprio controle (5% e 10%) por cima do fundo (`state-layer`), em vez de trocar o fundo (`hover:bg-accent`, `hover:bg-primary/90`…). A mesma regra serve para toda variante e para os dois temas. O hover só aparece em dispositivos com mouse.
  - Itens de menu, combobox e command palette destacados (teclado ou ponteiro) usam a mesma camada (`state-hover`).
  - Pressed encolhe o botão para 98% só com mouse, nunca no toque nem com movimento reduzido.
  - Desabilitado fica `opacity-50` com cursor normal (antes `not-allowed`), sem reação a hover ou clique.

- 241db60: **Novos subpaths `@amfernandesinc/ui/lib/date` e `@amfernandesinc/ui/lib/format`.** Os helpers de data (`formatDate`, `parseDate`, `addMonths`…) e de formatação (`formatCPF`, `formatCNPJ`…) só podiam ser importados da raiz do pacote, ao contrário de `lib/brazil`, `lib/currency` e dos demais. Agora têm o próprio subpath, para quem importa só o helper sem passar pelo índice.
- 1cd55dc: **Busca sem acento e ordenação em português num helper só.** `normalizeText`, `matchesSearch` e `compareText` (também em `@amfernandesinc/ui/lib/text`): `matchesSearch("João Álvares", "joao")` é verdadeiro, e `nomes.sort(compareText)` põe "Álvaro" antes de "Bruno" e "Bloco 2" antes de "Bloco 10". O Combobox já usa o mesmo helper.
- 81413c1: **`CPFInput`, `CNPJInput`, `CEPInput` e `PhoneInput` funcionam sem `value` e não quebram com valor nulo.** `value={null}` ou `value={undefined}` (o que o react-hook-form entrega antes do `defaultValues`) lançava `Cannot read properties of null (reading 'replace')`. Agora `null` é campo vazio.

  Sem `value`, o campo é **não controlado**: parte de `defaultValue`, guarda o que é digitado e continua chamando `onValueChange`, que passou a ser opcional. Num `<form>` nativo, `<CPFInput name="cpf" defaultValue="52998224725" />` basta, e o reset do formulário devolve o `defaultValue`.

- f2e8895: **`footer` de `Dialog` e `Sheet` aceita uma função que recebe `close`.** Um modal não controlado não tinha como fechar pelo rodapé: o "Cancelar" não fazia nada, a menos que você controlasse `open` só para isso. Agora:

  ```tsx
  <Dialog
    trigger={<Button>Editar proposta</Button>}
    title="Editar proposta"
    footer={({ close }) => (
      <>
        <Button variant="outline" onClick={close}>Cancelar</Button>
        <Button type="submit" form="proposta">Salvar</Button>
      </>
    )}
  >
  ```

  `close` fecha como o X: chama `onOpenChange(false)` e devolve o foco. Um `footer` comum (nó React) continua funcionando como antes.

- a1eb62f: **Durações e curvas do Astryx.** Novos tokens `--duration-{fast,medium,slow}` (175/410/975ms), cada um com `-min` e `-max`, mais `--duration-exit`, e as curvas `--ease-standard` (entrada, desacelera) e `--ease-exit` (saída, acelera).

  - Tooltip e DropdownMenu entram em 175ms; Popover e Tour em 310ms; Sheet e o menu mobile do AppShell em 410ms; Dialog e AlertDialog em 550ms. Toda saída leva 175ms.
  - Accordion, Collapsible e as transições de hover (`transition*`) usam 175ms com a curva padrão.
  - `--motion-fast`, `--motion-default`, `--motion-slow` e `--motion-slowest` continuam por uma versão, apontando para o token novo de cada papel, e estão deprecated.

- 805d3c0: **`MultiInput` desabilitado anuncia o grupo como desabilitado.** Os itens de um campo desabilitado ficavam esmaecidos sem nada dizer que o grupo estava inativo: o leitor de tela lia os itens como se pudessem ser editados. O grupo agora recebe `aria-disabled="true"` enquanto `disabled`.
- 851811a: **`MultiInput` ganha `ref`, `name` e `className`, e anuncia o obrigatório.** `ref` aponta para o campo de digitação, então o React Hook Form consegue focá-lo num erro. Com `name`, um input oculto leva a lista para o form nativo separada por vírgula (`"urgente,fiscal"`, `"10,35"`). `className` vai para a caixa que desenha a borda.

  Com `required`, o campo de digitação recebe `aria-required` e um form nativo não é enviado com a lista vazia (o navegador mostra o aviso no próprio campo); com pelo menos um item, ele passa.

- 2305773: **`MultiInput` ganha `labels`.** Os textos fixos do campo ("Adicione um item", "Adicione um número", "Lista de itens", "Lista de números" e o "Remover …" de cada item) entram em `labels?: Partial<MultiInputLabels>`, com os padrões em português exportados como `defaultMultiInputLabels`. As props `placeholder` e `aria-label` continuam valendo e ganham de `labels`.
- 0bbe7ab: **No `MultiInput`, `maxItems` recusa os itens novos em vez de descartar os antigos.** No modo número a lista era ordenada e depois cortada: `[10, 20, 30]` mais `5` com limite 3 virava `[5, 10, 20]`, e o 30 que já estava lá sumia. Agora quem já está na lista fica; os novos entram na ordem digitada enquanto há espaço e os demais são recusados com `onReject("max-items")`.

  Com a lista cheia, `onValueChange` não é mais chamado e o texto digitado continua no campo, para a pessoa ver que não entrou. Um item repetido também não dispara `onValueChange`.

- 8b679c3: **`MultiInput` é anunciado pelo rótulo e os itens saem pelo teclado.** O campo de texto era nomeado pelo `placeholder` e o grupo por "Lista de itens": quem usa leitor de tela nunca ouvia o `label`. Agora os dois são nomeados pelo rótulo visível. Sem `label`, use a nova prop `aria-label`; o `placeholder` fica como último recurso.

  O botão de remover de cada item recebia foco, mas só reagia ao mouse. Enter, Espaço, Delete e Backspace agora removem o item, e o foco segue para o item vizinho (ou volta ao campo de texto quando a lista esvazia), em vez de se perder na página. O clique no × continua sem tirar o foco do campo nem confirmar o texto em digitação.

- 521280c: **`MultiInput` aceita `readOnly`.** Os itens aparecem sem o botão de remover; nada digitado, colado ou apagado muda a lista; o campo continua focável, com o fundo de somente leitura da biblioteca, e a lista vai no formulário (ao contrário de `disabled`).
- da48ec3: **`MultiInput` ganha `size` e fica da altura dos outros controles.** A caixa media 44 px numa linha, mais alta que um campo ou botão vizinho (40 px). Agora a prop `size` (`"sm"`, `"md"` ou `"lg"`, padrão `"md"`) dá a altura mínima da caixa, borda incluída: 32, 40 ou 44 px, a mesma de `Button` e dos campos. Com mais itens do que cabem numa linha, ela continua crescendo.
- 906029f: **O `MultiInput` em modo número não aceita mais número malformado.** O campo usava `parseInt`, que lê o começo do texto e ignora o resto: `10.000` virava 10, `12x` virava 12 e `3,5` virava os itens 3 e 5. Agora cada pedaço precisa ser um inteiro positivo por inteiro; o que não for é recusado com `onReject("invalid")` e o texto fica no campo para ser corrigido. Os pedaços válidos do mesmo texto continuam entrando.

  A vírgula segue separando itens (`30,60,90` e `10, 20`), com uma exceção: uma vírgula sozinha, encostada entre dois números (`3,5`), é lida como decimal e recusada. Para dois itens, use espaço, ponto e vírgula ou vírgula e espaço.

- a14843c: **`MultiInput` funciona sem `value`.** O campo só funcionava controlado: sem `value` ele quebrava, e num form nativo era preciso guardar um estado só para ele existir. Agora `value` e `onValueChange` são opcionais; sem `value`, o campo guarda a própria lista a partir de `defaultValue` e volta a ela quando o form é resetado. Com `name`, o form nativo recebe a lista do mesmo jeito. Quem já passava `value` não precisa mudar nada.
- 34e5bf3: **Novo `NumberInput`** (`@amfernandesinc/ui/number-input`): campo de número para quantidades, áreas, andares e parcelas (dinheiro continua no `CurrencyInput`, percentual no `PercentageInput`).

  - `value: number | null` + `onValueChange`, ou `defaultValue`; vazio é `null`, nunca `0`.
  - Formato brasileiro: vírgula decimal e ponto de milhar quando o campo não tem foco (`1.250,5`); `decimals` (padrão 0), `min`, `max`, `step` (padrão 1). Fora da faixa, o número fica como foi digitado, o campo mostra o erro (`labels.belowMin`, `labels.aboveMax`) e barra o envio nativo; setas e botões param nos limites.
  - Digitação aceita dígitos, uma vírgula (o ponto do teclado numérico vira vírgula) e o menos só com `min` negativo; colar segue a regra do `CurrencyInput`.
  - `role="spinbutton"` com `aria-valuenow`/`min`/`max`/`valuetext`; ↑/↓ um passo, PageUp/PageDown dez, Home/End vão a `min`/`max`. A roda do mouse nunca muda o valor.
  - `steppers`: botões − e + de 24px que não tiram o foco e repetem enquanto pressionados (`labels.decrement`, `labels.increment`).
  - `prefix` e `suffix` (`m²`) dentro do campo; com `name`, o formulário recebe o número bruto com ponto decimal, e um reset do formulário volta ao `defaultValue`. Anatomia de campo, `size` e `readOnly` como no `Input`; teclado numérico no celular e texto de 16px em telas de toque.

- d8f138e: **`CurrencyInput` e `PercentageInput` sabem ficar vazios e funcionam sem `value`.** Os dois só tinham `value: number`: limpar o campo voltava a `0,00`, o `required` nativo nunca falhava e "não informado" era igual a zero.

  A nova prop `emptyValue` decide o que vale um campo vazio. O padrão, `"zero"`, é o comportamento de sempre. Com `emptyValue="null"`, `value` aceita `null`, limpar o campo reporta `null`, o placeholder aparece (por padrão, `0,00`) e `onValueChange` passa a ser `(value: number | null) => void`; zero digitado continua sendo um valor.

  ```tsx
  const [entrada, setEntrada] = useState<number | null>(null)
  <CurrencyInput label="Entrada" emptyValue="null" value={entrada} onValueChange={setEntrada} />
  ```

  Sem `value`, os dois campos são **não controlados**: partem de `defaultValue`, guardam o que é digitado e voltam ao `defaultValue` no reset do formulário. `value` e `onValueChange` passaram a ser opcionais.

- b42c10d: **`CurrencyInput` ganha `min` e `max`; `PercentageInput` ganha `min` e deixa de trocar o valor pelo teto.** No `PercentageInput`, digitar além de `max` trocava o número por 100 em silêncio: `12345` mostrava `100,00`, um valor que ninguém digitou. Agora, nos dois campos, o valor fora da faixa fica como foi digitado ou colado e o campo mostra o erro (`labels.belowMin` e `labels.aboveMax`) quando perde o foco depois de uma edição, no Enter ou no envio. O envio nativo do formulário é barrado enquanto o valor estiver fora, e o erro some quando ele volta para a faixa. No `PercentageInput`, um `min` negativo libera percentual negativo, com a tecla de menos.

  `onValueChange` entrega o valor mesmo fora da faixa: num formulário com `noValidate`, valide os limites no app.

  ```tsx
  <CurrencyInput
    label="Parcela"
    min={100}
    max={5000}
    value={parcela}
    onValueChange={setParcela}
  />
  ```

- 4d54124: **Overlays aceitam `ref` e `contentProps` no painel.** `Dialog`, `AlertDialog`, `Sheet`, `Popover`, `Tooltip`, `DropdownMenu` e `Tour` agora encaminham `ref` para o painel (o elemento com `data-slot="…-content"`) e aceitam `contentProps` com `id`, `data-*`, `aria-*` e handlers para ele, como pede um teste ou uma medição. As props do próprio overlay (o `data-slot`, os handlers de que ele precisa) prevalecem.
- e00e133: **Véus dos overlays viram tokens.** O fundo escuro atrás de `Dialog`, `AlertDialog` e `Sheet` (preto a 80%) e o escurecimento em volta do alvo do `Tour` (preto a 50%) eram cores fixas no código. Agora vêm dos tokens `--color-scrim` e `--color-scrim-light` (utilitários `bg-scrim` e `outline-scrim-light`), com os mesmos valores de antes: nada muda na tela, e um produto pode ajustá-los no tema.
- 60b1df1: **`Pagination` aceita o Link do roteador.** Com `getPageHref`, passe `renderLink={({ href, ...props }) => <Link to={href} {...props} />}` (o mesmo contrato do `AppShell`, do `Breadcrumb` e do `Token`) e trocar de página não recarrega mais a aplicação. Repasse todas as props: levam as classes, o `aria-current` e o clique que informa a página.
- 601b01a: **Pagination** (novo): paginação independente para listas, cards e tabelas paginadas no servidor (`@amfernandesinc/ui/pagination`).

  - Total conhecido (`totalItems` + `pageSize`, ou `totalPages`) ou cursor (`hasMore`: só anterior/próxima).
  - `variant="pages"` (padrão): números com reticências, sempre com o mesmo número de posições — o controle não muda de largura ao paginar, e uma reticência nunca esconde uma página só. `variant="compact"`: “Página 3 de 10”.
  - Com `totalItems`, mostra o resumo “11–20 de 243”. `pageSizeOptions` + `onPageSizeChange` mostram o seletor de itens por página (o mesmo da `DataTable`); trocar o tamanho volta para a página 1.
  - `showFirstLast`, `siblingCount`, `size` (`md` = 40px, `sm` = 32px), `disabled` e `labels` em pt-BR.
  - `getPageHref` gera links de verdade (`?page=3`), com checagem de protocolo; `onPageChange` roda logo depois que o navegador segue o link.
  - `<nav aria-label="Paginação">`, `aria-current="page"` e reticências escondidas do leitor de tela. Exporta também `getPaginationItems` e `defaultPaginationLabels`.

- 759ee37: **`PercentageInput` ganha `decimals`.** O campo só tinha duas casas. `decimals` aceita `2` (o padrão, `12,50`), `1` (`12,5`) ou `0` (`12`): os dígitos digitados preenchem a última casa primeiro, um valor colado é arredondado para as casas do campo e o pai recebe o número já nessa precisão.
- 19c3467: **`Popover` ganha `anchor`.** `trigger` é opcional, mas sem ele o popover não tinha para onde apontar: abria acima da tela, fora de vista, e ainda levava o foco. Quando outra coisa abre o popover (um botão em outro lugar, um atalho), passe em `anchor` o elemento para onde ele aponta e abra com `open`:

  ```tsx
  <Popover
    open={open}
    onOpenChange={setOpen}
    anchor={<span>Unidade 101</span>}
    aria-label="Detalhes"
  >
    …
  </Popover>
  ```

  Em desenvolvimento, um `Popover` sem `trigger` nem `anchor` avisa no console.

- d34e75b: **`Progress` respeita `max` e tem estado indeterminado.** `max` era ignorado: `<Progress value={3} max={7} />` desenhava 3% em vez de 3/7, e o leitor de tela ouvia o valor errado. Agora a barra e o `aria-valuemax` seguem `max`.

  Sem `value` (ou com `null`), a barra fica indeterminada: uma faixa corre de um lado ao outro, `data-state="indeterminate"` e sem `aria-valuenow`, para quando não se sabe quanto falta. Antes isso virava uma barra vazia, que parecia "0%". Com movimento reduzido a faixa fica parada no meio.

- fb59828: **`RadioGroup` aceita `options`, e o erro pinta os rádios.** A lista de escolhas se chamava `values` aqui e `options` no `SegmentedControl` e nos outros componentes. Agora o `RadioGroup` aceita `options`; `values` continua funcionando, marcado como obsoleto. Com `error`, os rádios ganham a borda de erro, e não só o texto abaixo do grupo.
- 7ed2fc5: **Raio por papel, em três níveis.** Sai o raio único de 4px; entram `--radius-inner` (4px), `--radius-element` (8px) e `--radius-container` (12px), com os utilitários `rounded-inner`, `rounded-element` e `rounded-container`. Os níveis sobem de 4 em 4, o passo do espaço interno padrão (`p-1`), então peça dentro de peça fecha exata pela regra do concêntrico (raio de dentro = raio de fora − espaço).

  - **container** (12px): Card, Alert, Dialog, AlertDialog, Popover, painel do DropdownMenu, balão do Tour, moldura da DataTable e do Schedule, Video.
  - **element** (8px): botões, campos, Toggle, Tooltip, trilho das Tabs e do SegmentedControl, itens de menu (12 − 4), de navegação e da Tree.
  - **inner** (4px): Badge, Token, caixa do Checkbox, abas e segmentos (8 − 4), dias do Calendar (12 − 8), chips dentro de campos, eventos do Schedule, Skeleton, barras (Progress, linha do Stepper, barra de rolagem).
  - A escala do Tailwind cai nos três níveis: `rounded-xs`/`rounded-sm` → 4px, `rounded-md` → 8px, `rounded-lg` até `rounded-4xl` → 12px. **Telas do app mudam:** o que usava `rounded-md` (4px) passa a 8px, e `rounded-lg` ou maior passa a 12px.
  - `rounded-full` fica só para círculos (Radio, Avatar, Switch, pontos). Progress, a linha do Stepper e a barra de rolagem deixam de ser pílulas.
  - `--radius` continua como sinônimo de `--radius-element` (agora 8px), deprecated.
  - A moldura da DataTable passa a cortar o conteúdo nos cantos (`overflow-hidden`), para o cabeçalho não vazar do raio de 12px.
  - Nova página **Foundations/Radius** no Storybook, com a explicação e uma demo do concêntrico.

- 0fddf10: **Contrato `renderLink` para o link do roteador.** Os tipos `RenderLink` e `RenderLinkProps` (também em `@amfernandesinc/ui/lib/render-link`) descrevem a função que troca o `<a>` da lib pelo link do React Router ou do Next.js, sem recarregar a página: `renderLink={({ href, ...props }) => <Link to={href} {...props} />}`. Os componentes de navegação passam a aceitar essa prop.
- fa53762: **"Obrigatório" lido uma vez só, e traduzível onde aparece.** Em `CPFInput`, `CNPJInput`, `CEPInput`, `PhoneInput`, `CurrencyInput`, `PercentageInput`, `DateInput`, `MultiInput`, `InputOTP` e `Combobox` o leitor de tela dizia "CPF obrigatório, editar texto, obrigatório": o rótulo trazia a palavra e o campo já anunciava `required`. Agora o rótulo desenha só o asterisco, como no `Input` e no `Select`.

  O `DateRangePicker` (um botão) e o `TimePicker` (um grupo) não têm como anunciar `required` sozinhos e continuam dizendo a palavra no nome, agora vinda de `labels.required` (padrão "obrigatório"). Quem monta um `DateRangePickerLabels` ou `TimePickerLabels` completo para outro idioma ganha uma chave nova a preencher.

- 37a0126: **`Schedule` aceita `locale`.** Os nomes de dias e meses e a ordem das datas vinham fixos em português, mesmo com `labels`. A nova prop `locale` ("pt-BR" por padrão, "en-US", "es"...) passa a decidir esses nomes e formatos, pelo `Intl` do navegador; os textos fixos continuam em `labels`. Em pt-BR nada muda: "15 – 21 de nov. de 2026", "sábado, 21 de novembro".
- 8b7f19b: **`Schedule`: muitos eventos no mesmo horário continuam legíveis.** Na semana e no dia, eventos simultâneos dividiam a coluna sem limite: com dez visitas às 10h, cada bloco ficava com 12px. Agora cabem até `maxColumns` lado a lado (3 na semana, 6 no dia); a última coluna mostra "+N mais", que abre a lista dos demais.
- 6f62eaf: **`Schedule`: eventos só leitura não são paradas de Tab, e a grade de horas rola pelo teclado.** Sem `onEventClick` nem `renderEventDetails`, cada evento deixa de ser um botão: o Tab não para mais em dezenas de eventos que não fazem nada, e o leitor de tela continua lendo o nome completo de cada um. Com qualquer um dos dois, os eventos voltam a ser botões. A grade de horas da semana e do dia vira uma região nomeada ("Grade de horários", em `labels.timeGrid`) que recebe foco e rola com as setas e PageDown.
- 1e12409: **`Schedule`: altura da grade e eventos por dia no mês viram props.** `timeGridMaxHeight` (padrão `"36rem"`; número em px ou `"none"` para mostrar todas as horas sem rolagem interna) e `monthMaxEvents` (padrão 3, quantos eventos um dia do mês mostra antes de "+N mais") substituem os valores fixos. Os eventos passam a ser filtrados e ordenados só quando a lista ou o período mudam, não a cada minuto do relógio.
- 4500d56: **`Schedule`: agendar num horário vazio e buscar o período na tela.**

  - `onSlotClick(date)` recebe o dia clicado no mês (às 00h) ou o horário clicado na grade da semana e do dia, arredondado para a meia hora. Pelo teclado, o número de cada dia vira um botão "Novo evento em sábado, 21 de novembro", que entrega o dia às `scrollToHour` horas. O texto do botão fica em `labels.newEvent`.
  - `onRangeChange({ start, end, view })` informa o período na tela ao montar e sempre que ele muda, para buscar os eventos no servidor, contando as semanas vizinhas que o mês mostra.
  - `getScheduleRange(view, date, { weekStartsOn, listDays })` calcula o mesmo período antes do primeiro render.

- 1029b0e: **Schedule** (novo): calendário de eventos com visões de mês, semana, dia e lista (`@amfernandesinc/ui/schedule`). Data-driven: passe `events` com `start`/`end` em `Date` (instantes, mostrados no fuso `timeZone`, `America/Sao_Paulo` por padrão, como os helpers de `lib/date`).

  - **Mês:** semanas inteiras, hoje destacado, dias de fora do mês esmaecidos. Eventos de dia inteiro e que atravessam a meia-noite viram barras que se estendem pelos dias (e continuam na semana seguinte); eventos com horário viram chips. Até 3 linhas por dia — o resto vira **+N mais**, que abre a lista do dia.
  - **Semana e dia:** grade de horas com linha de "dia inteiro", eventos posicionados pelo horário, sobrepostos lado a lado, linha da hora atual e rolagem inicial em `scrollToHour` (8h). `minHour`/`maxHour` limitam o horário; `weekStartsOn={1}` começa na segunda.
  - **Lista:** os próximos `listDays` dias agrupados por data, com `EmptyState` quando não há eventos.
  - Cabeçalho com "Hoje", anterior/próximo e troca de visão (`SegmentedControl`); título do período anunciado ao navegar.
  - `renderEventDetails` abre um popover ao clicar no evento; `onEventClick` avisa o clique. Cada evento é um botão com nome completo em pt-BR (título, dia e horário).
  - 9 cores de categoria (`color`), com contraste AA. `today` fixa o que conta como hoje (testes e capturas). `view`/`date` podem ser controlados; textos trocáveis em `labels`.
  - **Renderização no servidor (Next.js, Remix):** dias, horários e títulos saem no fuso `timeZone` em qualquer máquina, então um servidor em UTC e um navegador em Brasília escrevem o mesmo HTML. O relógio do navegador só entra depois da hidratação: sem `today`, o servidor não marca o "hoje" nem desenha a linha da hora atual; sem `date`, `defaultDate` ou `today`, o servidor manda o cabeçalho e a moldura, e o período chega no navegador. Passe `defaultDate` e `today` para o servidor já mandar a agenda pronta. `getScheduleRange` aceita o mesmo `timeZone`. Eventos de dia inteiro começam à meia-noite desse fuso.

- a2bfa7d: **`SegmentedControl` vira um campo de formulário completo.** A API era fechada: não aceitava `id`, `aria-describedby`, `aria-labelledby`, `onBlur` nem `data-testid`, e o `label` nunca aparecia, então um formulário escrevia o rótulo à mão com `aria-hidden`. Agora:

  - os atributos de um `<div>` (`id`, `aria-*`, `data-*`, handlers como `onBlur`) vão para o grupo;
  - `labelPosition` (`"hidden"`, o padrão de sempre, `"up"` ou `"left"`) desenha o rótulo, que passa a nomear o grupo;
  - `description` e `error` aparecem abaixo e descrevem o grupo (`aria-describedby`, e `aria-invalid` com erro);
  - `fieldClassName` estiliza o campo em volta.

  Sem rótulo visível nem mensagens, o campo em volta não ocupa caixa (`display: contents`): o controle numa barra de ferramentas fica exatamente como antes.

- e598eb8: **`SegmentedControl` ganha `size="lg"`.** Os tamanhos passam a ser `sm` (32px), `md` (40px, padrão) e `lg` (44px, alvo de toque), a altura da trilha inteira pelos mesmos tokens de altura de controle de `Button` e `Input`. `sm` e `md` medem o mesmo de antes.
- f642499: **SegmentedControl** (novo): uma linha de 2 a 5 opções exclusivas, sempre visíveis, com exatamente uma marcada (`@amfernandesinc/ui/segmented-control`).

  - É um campo (grupo de rádio), não navegação: use para mudar como o mesmo conteúdo aparece ("Lista | Grade", "Dia | Semana | Mês") ou como escolha compacta num formulário. Para conteúdos diferentes, cada um com seu painel, continue usando `Tabs`.
  - `options` com `label`, `icon` e `disabled`; `value`/`defaultValue`/`onValueChange`; `label` obrigatório (nome do grupo para o leitor de tela).
  - `size` (`sm`/`md`), `fill` (segmentos iguais ocupando a largura), `iconOnly` (rótulos viram nome acessível + tooltip), `disabled`.
  - `name` e `required`: a escolha vai junto no envio do formulário.
  - Teclado: uma parada só do Tab; setas movem e selecionam, inclusive num toque rápido de tecla com a página ocupada.

- e544a2d: **Novo `Select`** (`@amfernandesinc/ui/select`): seleção simples para listas curtas, sem busca ("Sim / Não / Talvez", estágio do lead, linhas por página), onde o `Combobox` é pesado demais.

  - `options` com `{ value, label, disabled? }` ou grupos `{ label, options }`; `value`/`onValueChange` ou `defaultValue`; `placeholder` (ou `labels.placeholder`, padrão "Selecione…").
  - Anatomia de campo da biblioteca: `label`, `labelPosition`, `description`, `error`, `required`, `disabled`, `readOnly` e `size` (`sm`/`md`/`lg`, a mesma altura de um `Input`).
  - Com `name`, um `<select>` nativo leva o valor ao `FormData`: nada é enviado antes de uma escolha, `required` é checado pelo navegador e o reset do formulário volta ao `defaultValue`.
  - Teclado e busca por letra do Radix; a opção escolhida tem um ✓; a lista segue o visual do `DropdownMenu` e cabe no espaço disponível; funciona dentro de um `Dialog` sem fechá-lo.
  - Nova dependência: `@radix-ui/react-select`.

- fc04671: **`Sheet` ganha `size`, `dismissible` e `onOpenAutoFocus`, como o `Dialog`.** A largura dos painéis laterais era fixa em 384px. Agora `size="sm"` dá 320px (uma lista curta de filtros), `"md"` continua com os 384px de hoje e é o padrão, e `"lg"` dá 672px (um detalhe com formulário em duas colunas). No celular o painel segue com 3/4 da tela; painéis de cima e de baixo continuam com a largura toda.

  `dismissible={false}` esconde o X e faz o Esc e o clique fora não fecharem, para uma etapa que precisa terminar num botão do rodapé. `onOpenAutoFocus` escolhe o primeiro campo focado ao abrir.

- d743466: **`Skeleton` sai da árvore de acessibilidade e ganha `SkeletonGroup`.** Cada bloco era um `role="status"` vazio: uma tabela carregando virava 16 regiões vivas sem nada a dizer, e o leitor de tela não ouvia que algo carregava. Agora cada `Skeleton` é `aria-hidden`, e o novo `SkeletonGroup` em volta dos blocos de uma área é o único status e diz "Carregando…" uma vez (texto em `labels.loading`, padrão em `defaultSkeletonLabels`).

  ```tsx
  <SkeletonGroup
    labels={{ loading: "Carregando propostas…" }}
    className="flex flex-col gap-2"
  >
    <Skeleton className="h-4 w-48" />
    <Skeleton className="h-4 w-32" />
  </SkeletonGroup>
  ```

  Testes que procuravam o skeleton com `getByRole("status")` passam a achar o `SkeletonGroup`, ou devem usar `[data-slot="skeleton"]`.

- 7752cb7: **Novo `Slider`** (`@amfernandesinc/ui/slider`): escolha de um valor ou de uma faixa arrastando (área mínima, faixa de preço, desconto).

  - `value`/`onValueChange` com um número, ou com `range` dois polegares e um par `[mínimo, máximo]`; cada polegar tem nome próprio ("Preço mínimo", "Preço máximo", de `labels`), e os valores ficam sempre em ordem.
  - `min`, `max`, `step`, `minStepsBetweenThumbs`; `showValue` mostra o valor ao lado do rótulo, formatado por `formatValue` (padrão: número brasileiro), que também é o que o leitor de tela ouve.
  - `marks` desenha traços com rótulos opcionais, alinhados ao centro do polegar em cada valor.
  - Polegares de 24px com o anel de foco da biblioteca; trilha e preenchimento por tokens; visível em cores forçadas; `aria-disabled` quando desabilitado.
  - `label` (ou `aria-label`), `description`, `error`, `disabled`; com `name`, o formulário recebe o valor (uma faixa envia o nome duas vezes) e o reset volta ao `defaultValue`.
  - Nova dependência: `@radix-ui/react-slider`.

- f898dfe: **Status com um fundo forte só.** `Alert` (`info`, `success`, `warning`, `destructive`) e os marcadores de erro e de alerta do `Stepper` deixam o fundo claro e passam ao fundo forte do status, com o texto do token `-foreground` (escuro no alerta, branco nos outros).

  - **Toasts:** por padrão continuam neutros (a superfície do popover), com o ícone na cor do status. Com `<Toaster richColors />`, usam o fundo forte do status em vez da paleta clara do Sonner.
  - **Erro sobre superfície** (mensagem e borda de campo, item destrutivo do DropdownMenu, asterisco de obrigatório) usa `--destructive-text`, que no escuro é um vermelho clareado. A classe de erro dos campos passa a ser `border-destructive-text field-error`.
  - Dentro de um `Alert` de status, o anel de foco usa a cor do texto do alerta.
  - O `Alert` pede a impressão do fundo (`print-color-adjust: exact`), para o texto claro não sumir no papel.

  **Quebra:** os tokens de fundo claro de status (`--status-success-bg`, `--status-success-text`, `--status-success-border` e os equivalentes de `warning`, `info` e `destructive`) e as classes `bg-status-*`, `text-status-*` e `border-status-*` deixam de existir. Troque por `bg-success text-success-foreground` (e os equivalentes), que são o fundo forte do status, ou por `<Badge variant="success" dot>` quando for uma célula de tabela.

- fdf096c: **`Stepper` compacto escreve o status da etapa.** No celular, um erro ou alerta na etapa atual era só a cor da barra, e a `description` ("CEP inválido") sumia. O resumo compacto agora mostra, abaixo de "Etapa 2 de 4 · Endereço", um ícone e o texto do status com a descrição ("Com erro: CEP inválido"); sem status, a descrição aparece sozinha. Os textos vêm de `labels.error` e `labels.warning`.
- f050186: **`Stepper` ganha `isStepClickable`.** Com `onStepClick`, toda etapa virava botão, inclusive as futuras; para o assistente comum (voltar sim, pular não) era preciso marcá-las `disabled`, e elas ficavam esmaecidas como se fossem proibidas. Agora `isStepClickable={(i) => i < activeStep}` faz só as etapas escolhidas virarem botões; as outras aparecem normais. As setas do modo compacto seguem a mesma regra (e ficam `aria-disabled` nas pontas, sem perder o foco).
- 2e34ac4: **`Stepper`: `keepMounted` e `id` nas etapas.** Na vertical só o `content` da etapa atual era montado: ao voltar, os campos não controlados da etapa anterior estavam vazios. Com `keepMounted`, o conteúdo de todas as etapas fica no DOM, escondido fora da etapa atual. As etapas aceitam `id`, para manter cada uma no lugar quando etapas entram ou saem em tempo de execução (uma etapa "Cônjuge", por exemplo). `activeStep` continua a partir de 0.
- 5a70911: **Stepper** (novo): sequência numerada de etapas para fluxos longos (`@amfernandesinc/ui/stepper`). Data-driven, como `Tabs`.

  - `steps`: `{ label, description?, optional?, disabled?, status?: "error" | "warning", content? }`. `activeStep` começa em 0: as anteriores ficam concluídas, e `activeStep={steps.length}` conclui todas.
  - Indicadores com número, check (concluída) ou ícone de erro/alerta. Linhas de ligação preenchidas até a etapa atual.
  - `onStepClick` deixa as etapas clicáveis (navegação não linear). Etapas `disabled` não podem ser escolhidas.
  - `orientation="vertical"` empilha as etapas e mostra o `content` da etapa atual embaixo dela.
  - Na horizontal, quando o contêiner não comporta as etapas, vira um resumo "Etapa 2 de 4 · Endereço" com barra de progresso (e setas, com `onStepClick`). O corte usa container queries, não a largura da tela.
  - Leitor de tela: lista ordenada "Progresso", `aria-current="step"` na etapa atual e estado de cada etapa (concluída, etapa atual, com erro).

- b6eee25: **O `styles` declara o `@source` da lib: o app não precisa mais da linha.** O Tailwind v4 não lê `node_modules`, e sem um `@source "../node_modules/@amfernandesinc/ui/dist"` no CSS do app as classes usadas só dentro dos componentes não eram geradas (num app novo, 30 KB de CSS em vez de 128 KB): Dialog, Popover e Select abriam sem estilo. O README nem mencionava a linha. Agora o `tokens.css` publicado traz `@source "./"`, relativo a ele mesmo na `dist/`, e os dois imports bastam. Quem já tem a linha pode tirá-la ou deixá-la (o resultado é o mesmo).
- 4e5ee56: **`Tabs`: `aria-label` nomeia a lista de abas.** O `aria-label` (ou `aria-labelledby`) passado ao componente ia para o `div` de fora, e a lista de abas (`tablist`) ficava sem nome. Agora ele vai para a lista, que o leitor de tela anuncia ao entrar nas abas.
- ce2abe5: **`Tabs` ganha `keepMounted`.** Um painel inativo era sempre desmontado, com ou sem `lazy`: formulário, filtros de tabela ou upload dentro de uma aba zeravam a cada troca. Com `keepMounted`, os painéis ficam no DOM, escondidos, e guardam o que têm. `lazy` passa a valer junto com ele: monta cada painel só na primeira visita e o mantém depois. Sem `keepMounted` nada muda (só o painel ativo existe); a documentação que atribuía ao `lazy` esse comportamento foi corrigida.
- 1915445: **`Textarea`: o contador deixa de ser anunciado a cada tecla.** O contador de `maxLength` era uma região viva (`aria-live="polite"`): o leitor de tela lia "27/500", "28/500"… a cada caractere digitado, e não lia nada quando o campo recebia foco.

  Agora o contador faz parte da descrição do campo (`aria-describedby`): ao focar, o leitor ouve "27 de 500 caracteres"; ao digitar, nada. Quando o texto chega ao limite, isso é anunciado uma vez ("Limite de 500 caracteres atingido"). Os dois textos são ajustáveis pela nova prop `labels` (`characterCount`, `limitReached`), com os padrões em `defaultTextareaLabels`. Na tela continua "27/500".

- 8877c8a: **`Textarea` ganha `size`.** `size="sm" | "md" | "lg"` define a altura mínima e o padding pelos tokens de altura de controle. Com `rows={1}` a caixa mede 32, 40 ou 44px, a altura de um `Input` do mesmo tamanho, e o texto fica na mesma linha de um campo ao lado: serve para um campo de mensagem com o botão de enviar na mesma linha.

  A altura mínima deixa de ser fixa em 60px: o padrão de duas linhas mede 60px (eram 62px) e um `rows={1}` agora mede 40px.

- bf6bba3: **`TimePicker` aceita `defaultValue`.** Sem `value`, o seletor guarda o próprio horário a partir de `defaultValue` (`"HH:MM"`) e volta a ele quando o formulário é resetado, como um `<input>` nativo.
- ddccb7c: **`TimePicker`: o grupo é nomeado pelo rótulo.** O grupo recebia um `aria-label` copiado do rótulo: um rótulo que não fosse texto simples virava "Horário", e o "obrigatório" do rótulo ficava de fora. Agora o grupo aponta para o próprio rótulo (`aria-labelledby`); um `aria-label` passado continua valendo, e sem rótulo o nome é "Horário" (`labels.group`).
- 0efc098: **`TimePicker` ganha `labels`.** "Horas", "Minutos" e "Horário" eram texto fixo, e um produto não conseguia ajustar a cópia. `labels` recebe os nomes dos dois campos e do grupo, com os padrões em português em `defaultTimePickerLabels`. Com outro nome no campo da hora, o Backspace no campo dos minutos vazio continua voltando para a hora.
- fb83851: **`TimePicker` aceita `name`.** Num formulário nativo o seletor não enviava nada. Com `name`, um `<input type="hidden">` envia `"HH:MM"` (ou `""` enquanto o horário está incompleto); os dois campos visíveis ficam sem `name`. Desabilitado, não envia.
- 4a8f713: **`TimePicker` aceita `onBlur`.** Sem ele, o React Hook Form com `mode: "onBlur"` não validava o seletor ao sair dele. `onBlur` é chamado quando o foco sai dos dois campos, depois de o campo deixado ser completado ou limpo; passar da hora para os minutos não conta.
- 7c9a806: **`TimePicker` reporta por `onValueChange`.** Como os outros campos de valor, o `TimePicker` passa a chamar `onValueChange("HH:MM")` (ou `""` enquanto incompleto) a cada edição que muda o horário: apagar a hora ou digitar uma fora da faixa reporta `""` na hora, sem esperar o campo perder o foco. `onChange` continua funcionando e está marcado como obsoleto.
- 2efad53: **`TimePicker` ganha `readOnly`.** Com `readOnly`, o horário aparece num fundo esmaecido, sem reação ao hover: os campos recebem foco, podem ser copiados e vão junto no envio do formulário (com `name`), mas digitar, as setas e colar não mudam nada. Antes, uma tela de consulta precisava usar `disabled`.
- e96172b: **`TimePicker` com a altura dos outros campos, e `size`.** A caixa media 46 px, porque a altura vinha do respiro vertical, e não alinhava com um campo ou botão ao lado. Agora a altura vem do tamanho de controle: `size` (`"sm"`, `"md"` ou `"lg"`, padrão `"md"`) dá 32, 40 ou 44 px. O texto fica em 16 px em telas de toque (antes dependia da largura da tela).
- 997c618: **Toast de erro fica até ser fechado, todo toast tem X e os rótulos estão em português.** `toast.error` (e o erro de `toast.promise`) sumia nos 4 segundos do Sonner, muitas vezes antes de ser lido ou de alguém clicar em "Tentar de novo". Agora ele fica até o usuário fechar; os outros tipos continuam saindo em 4s, e um `duration` passado no toast continua valendo.

  O `Toaster` passa a mostrar o X em todo toast por padrão (`closeButton={false}` desliga). O X se chama "Fechar notificação" e a região, "Notificações" (eram "Close toast" e "Notifications"). Para trocar os textos use a prop nova `labels` (`{ region, close }`, padrões em `defaultToasterLabels`) ou as do Sonner, `containerAriaLabel` e `toastOptions.closeButtonAriaLabel`.

  `toast` agora é exportado pela lib com essa diferença no erro; quem importa `toast` direto de `sonner` não a recebe.

- abf479c: **`Toggle`: `size` passa a ser `sm | md | lg`, nas alturas dos outros controles.** O `Toggle` media 34, 42 e 46px (a altura saía do padding mais a borda) e chamava o tamanho do meio de `"default"`. Agora mede 32, 40 e 44px, borda incluída, e fica alinhado com um `Button`, `IconButton` ou `Input` do mesmo tamanho.

  O padrão é `"md"`. `size="default"` continua aceito como nome antigo de `"md"`, mas está depreciado: troque por `"md"` (ou tire a prop).

- 48fcbb4: **`@amfernandesinc/ui/toggle` passa a existir.** O `Toggle` estava no barrel, mas faltava o subpath no `package.json`: `import { Toggle } from "@amfernandesinc/ui/toggle"` falhava. Agora funciona como os outros componentes.
- dd88d19: **`Token` aceita os atributos de um `<span>` e mostra o rótulo cortado no `title`.** O `Token` tinha API fechada: não dava para passar `id`, `data-testid`, `aria-describedby` nem handlers. Agora eles vão para o chip. Um rótulo cortado pelas reticências ganha `title` com o texto inteiro ao passar o mouse.

  A story `Removable` mostra como devolver o foco ao remover pelo teclado: o foco vai para o × do token que ocupa o lugar (ou do anterior) e, sem nenhum, para a mensagem de vazio, em vez de cair no `<body>`.

- 5c71af7: **O link do `Token` conversa com o roteador.** O `Token` com `href` renderizava um `<a>` comum e chamava `onClick` sem o evento: `href="/propostas/1042"` recarregava a página e perdia o formulário aberto. Agora:

  - `renderLink` troca o `<a>` pelo `<Link>` do seu roteador: `renderLink={({ href, ...props }) => <Link to={href} {...props} />}`;
  - `onClick` recebe o evento, então `event.preventDefault()` segura a navegação. Um `onClick={() => …}` sem parâmetro continua funcionando.

- 8e7f1ff: **Token** (novo): chip compacto para metadados, filtros e seleções (`@amfernandesinc/ui/token`).

  - 9 cores categóricas (`gray`, `red`, `orange`, `yellow`, `green`, `teal`, `blue`, `purple`, `pink`) sobre os novos tokens `--category-*`; texto ≥ 7,3:1 sobre o fundo.
  - `onRemove` mostra o × (“Remover {label}”); `onClick` torna o chip inteiro um botão; `href` (+ `target`), um link com checagem de protocolo.
  - O clique e o × são irmãos, nunca aninhados: a área clicável cobre o chip todo e o × fica por cima, sem disparar o clique.
  - `size` (`md` = 28px, `sm` = 24px), `icon`, `disabled` e `labels`.
  - Diferente do `Badge`: o `Badge` é rótulo de status em cor sólida; o `Token` é chip claro, clicável e removível.

- 339d4c2: **Um `Dialog` aberto durante o `Tour` fica por cima do balão.** O tour não é modal, então o alvo da etapa continua clicável, e muitas vezes ele abre um `Dialog` ("Nova proposta"). O balão ficava na camada dos popovers, acima de todo modal: aparecia por cima do diálogo, sem responder a nada. Agora o diálogo cobre e escurece o balão até ser fechado, e o Esc fecha o diálogo antes do tour.
- e23f080: **Tour** (novo): tour guiado de onboarding (`@amfernandesinc/ui/tour`). Um balão por etapa, apontando para um elemento da página.

  - `steps`: `{ target, title, content?, side?, align? }`. O `target` pode ser um ref, um seletor CSS ou uma função que devolve o elemento. Sem alvo na página, o balão aparece centralizado.
  - `open` controla quando o tour roda. `onClose(reason)` diz como terminou: `"completed"` (Concluir na última etapa) ou `"dismissed"` (X ou Esc). Salve a conclusão ali para não repetir o tour.
  - `spotlight` escurece a página em volta do alvo (padrão ligado), sem sombra, e acompanha rolagem e redimensionamento. `showProgress` mostra "2 de 5".
  - Não é modal: clicar fora não encerra o tour. O foco vai para o balão a cada etapa, a troca de etapa é anunciada ao leitor de tela e, no fim, o foco volta para onde estava.
  - Etapa controlada (`step`/`onStepChange`) ou não (`defaultStep`, que reinicia a cada abertura). Textos em pt-BR, trocáveis por `labels`.

- dc6ea48: **Borda translúcida.** `--border` (divisores, cards, tabelas, menus) passa a ser 10% da cor primária, translúcida, e lê igual sobre qualquer superfície e nos dois temas. A borda dos campos (`--input`) continua sólida.

  **Telas do app mudam:** uma borda do app com `border-border` (ou a borda padrão, sem cor) passa a ser translúcida, a 10% da primária. Para quem desenhava molduras de painel com ela, veja `--border-strong` (changeset `border-strong`). Bordas de campo feitas à mão devem usar `border-input`, que continua sólida a 3:1.

- 62342bf: **`Tree` funciona pelo teclado em qualquer nível e carrega filhos sob demanda.**

  - As setas percorrem todos os itens visíveis, inclusive os aninhados; antes a seta para baixo parava no segundo nível. Uma tecla num item aninhado age só nele (Enter em "Unidade 102" não seleciona mais o bloco e o empreendimento junto). Digitar uma letra pula para o próximo item que começa com ela.
  - O anel de foco fica na linha, não em volta do ramo inteiro, e cada item é nomeado só pelo seu rótulo.
  - A seta abre e fecha sem mudar a seleção; o nome seleciona e abre uma pasta fechada. Espaço seleciona; Enter seleciona e abre ou fecha a pasta.
  - `onLoadChildren(node)`: um nó com `hasChildren: true` e sem `children` pede os filhos ao abrir e mostra "Carregando…" até eles chegarem.
  - `expanded` e `defaultExpanded` aceitam array ou `Set`; `defaultSelected` permite seleção não controlada; `labels` traduz os textos fixos, agora em português.
  - Numa árvore grande, uma seta re-renderiza só os dois itens envolvidos.
  - Em cores forçadas, o item selecionado ganha um contorno.

- aedd03b: **Dois fundos.** `--background` passa a ser só **a página** (a área de conteúdo), um tom abaixo das superfícies. Tudo que é peça pinta `--card`: Card, moldura da DataTable e do Schedule, campos (Input, Textarea, inputs brasileiros, MultiInput, TimePicker, gatilhos de Combobox e de data, selects de paginação), botão `outline`, Toggle, aba ativa das Tabs, segmento ativo do SegmentedControl, marcadores do Stepper e o polegar do Switch. Menu lateral e navbar do AppShell pintam `--sidebar`. Dialog, AlertDialog e Sheet pintam `--popover`, como o Popover e o DropdownMenu. O Calendar deixa de ter fundo próprio e assume o da superfície em que está.

  **Telas do app mudam:** um bloco que usava `bg-background` como superfície (um painel, uma barra de filtros) passa a ter o tom da página. Troque por `bg-card` com `border-border-strong`.

- 9403c21: **`useCopyToClipboard` diz quando copiou.** O hook passa a devolver `{ copy, copied }`: `copied` fica `true` por `resetAfter` milissegundos (padrão 2000) depois de uma cópia, para o botão trocar o ícone por um check, e `copy(texto)` resolve `true` ou `false`. As mensagens vêm de opções (`successMessage`, `errorMessage`; `false` não mostra o toast). O erro usa o `toast` da lib e fica até ser fechado. Fora de HTTPS, onde não existe `navigator.clipboard`, o hook usa o comando de cópia do navegador. Quem só usava `copy` não precisa mudar nada.
- b105105: **`useIsMobile` usa o mesmo ponto de quebra do CSS.** A consulta passa de `max-width: 767px` para o complemento de `md:` em rem (`not all and (min-width: 48rem)`). Com a fonte padrão do navegador maior que 16px, o hook e o layout do Tailwind deixam de discordar: antes, entre 768px e o `md:` real, o CSS mostrava o layout de celular e o hook dizia que não era celular. A constante `MOBILE_QUERY` fica exportada pelo módulo.
- 6959bbb: **`Video`: `objectFit` (padrão `contain`), `crossOrigin` livre, estados de carga e erro, `labels`.**

  - O vídeo usava `object-cover` fixo, que cortava o tour vertical gravado no celular numa caixa 16:9. Agora `objectFit` é `"contain"` por padrão (o quadro aparece inteiro); passe `"cover"` para o comportamento antigo.
  - Legendas não forçam mais `crossOrigin="anonymous"`, que impedia o vídeo de tocar em servidor sem cabeçalhos CORS. Legendas de outra origem precisam de `crossOrigin="anonymous"` passado por você; há um aviso em desenvolvimento.
  - Um indicador de carregamento aparece até os metadados chegarem (`aria-busy` no invólucro). Em erro de rede, arquivo ausente ou codec, aparece "Não foi possível carregar o vídeo" com o botão "Tentar de novo", no lugar do player vazio. Os textos vêm de `labels` (`error`, `invalid`, `retry`) e os estados levam o nome do vídeo.
  - Um `src` que começa recusado (prévia `blob:`) e passa a ser aceito agora carrega e entrega o `ref`.
  - Aviso em desenvolvimento para `autoPlay` + `loop` sem `controls` (sem como pausar, WCAG 2.2.2).

  **Como migrar:** para o corte antigo (o vídeo preenchendo a caixa), passe `objectFit="cover"`.

### Patch Changes

- 5dfdc85: **`Accordion`: item desabilitado parece desabilitado.** O gatilho de um item `disabled` tinha cursor de mão, opacidade cheia e sublinhava no hover, como os outros. Agora o item fica a 50% (uma vez, no item inteiro), com cursor padrão e sem reação ao hover, como manda a regra de Disabled da lib.
- 0236fda: **`AlertDialog`: um clique duplo confirma uma vez só.** Enquanto o diálogo fechava (175ms de animação), os botões continuavam montados e clicáveis: um segundo clique, ou o Enter segurado, chamava `onConfirm` de novo e "Aprovar proposta" ou "Excluir" disparava duas requisições. Agora "Confirmar" e "Cancelar" só respondem com o diálogo aberto.

  Um `AlertDialog` controlado que o consumidor mantém aberto (`open` continua `true` depois do `onConfirm`) segue aceitando cada clique.

- 70cc220: **Esc no `AlertDialog` chama `onCancel`.** O Esc fechava o diálogo sem avisar: `onOpenChange(false)` era chamado, mas `onCancel` só respondia ao botão "Cancelar". Quem limpava estado em `onCancel` (rascunho a descartar, seleção a desfazer) ficava com o fluxo pela metade quando o usuário saía pelo teclado. Agora o Esc conta como "Cancelar", uma vez só.
- 7202ec7: **`Alert` só interrompe o leitor de tela quando precisa.** Toda variante era `role="alert"`, então um aviso de `info` ou `success` inserido na página cortava o que o leitor de tela estava lendo, como um erro faria. Agora `destructive` e `warning` continuam `role="alert"`, e `default`, `info` e `success` passam a `role="status"`, lidos quando o leitor fica livre. Para forçar outro papel, passe `role`.

  Se seus testes procuravam um `Alert` informativo com `getByRole("alert")`, troque para `getByRole("status")`.

- 1fdcb2f: **`AppShell`: o grupo da página atual abre sozinho.** Quando `isActive` marca um filho (link direto para "Propostas › Aprovadas", por exemplo), o grupo já aparece aberto no primeiro render, no menu lateral e no menu do celular. No trilho recolhido, ou com o grupo fechado, o próprio grupo fica marcado como ativo (`aria-current="true"`), já que o filho não está à vista. O menu do celular também passa a lembrar os grupos que a pessoa abriu ou fechou entre uma abertura e outra.
- f388798: **`AppShell`: recolher pelo teclado não perde o foco.** Enter em "Recolher menu" jogava o foco para o `body` (o botão era remontado) e o próximo Tab recomeçava do topo da página. O botão agora é o mesmo nos dois estados e o foco fica nele.
- 4e3e250: **`AppShell` monta o `footer` e a navegação uma vez só.** Abaixo de 768px o menu lateral fica escondido, mas continuava montado: o `footer` (e os links do app, pelo `renderLink`) existiam ali e de novo no menu aberto. Um footer que busca a conta, faz polling ou registra atalhos rodava tudo em dobro. Agora, no celular, eles só existem dentro do menu aberto; no desktop, só no menu lateral.

  `useIsMobile` passa a acertar desde o primeiro render no navegador (continua `false` no servidor e durante a hidratação), então o que só aparece de um lado do ponto de quebra não monta antes do lado errado.

- 2ebbc55: **`AppShell` hidrata sem erro com o menu salvo.** Em Next.js e Remix, quem tinha expandido (ou recolhido) o menu numa visita anterior fazia o React descartar o HTML do servidor a cada carga ("Hydration failed… this tree will be regenerated on the client"). A escolha salva no localStorage agora é lida depois da hidratação: o servidor e o primeiro render do navegador concordam, e o menu assume o estado salvo logo em seguida. Uma mudança feita em outra aba também passa a valer nesta.
- 68751a1: **`AppShell`: grupo no trilho recolhido abre um menu com as páginas.** Antes, clicar em "Propostas" com o menu recolhido só trocava o `aria-expanded` e nada aparecia: as subpáginas ficavam inalcançáveis até achar "Expandir menu". Agora o grupo abre, ao lado do trilho, um menu com os filhos (clique, Enter ou Espaço; setas percorrem; Esc fecha e devolve o foco ao grupo). Os links do menu usam o mesmo `renderLink` e marcam a página atual com `aria-current="page"`.
- e27001c: **`AppShell`: o trilho recolhido não perde informação.** O `badge` de um item virava nada no trilho (o leitor ouvia só "Leads, link"); agora aparece um ponto ao lado do ícone e a contagem entra no nome acessível ("Leads, 3"). Um item sem `icon` virava um link vazio; agora mostra a inicial do rótulo. O rótulo segue no DOM, escondido da vista, como nome do item.
- 058c871: **`AppShell`: "Pular para o conteúdo" não muda a URL.** O link era um `href="#conteudo"` comum. Num app com hash router (`HashRouter`, `createHashHistory`, comum em Electron), mudar o hash é navegar: o link abria uma página "não encontrada". Nos outros, deixava `#conteudo` no endereço e um passo a mais no "voltar". Agora ele leva o foco ao conteúdo sem tocar na URL; o `href` continua para página sem JavaScript.
- 191377a: **`AppShell`: recolher e expandir funcionam com o localStorage cheio.** Quando só a gravação falhava (`QuotaExceededError` com o armazenamento cheio, ou o Safari antigo em modo privado), a escolha ia para a memória da página, mas a leitura continuava indo ao localStorage, que devolvia nada ou uma escolha antiga: o botão parecia quebrado, e `onCollapsedChange` avisava um estado que a tela não mostrava. Agora a escolha que não pôde ser salva vale até a página fechar, e uma mudança feita em outra aba volta a valer.
- 4229091: **Foto que não é quadrada não deforma mais no `Avatar`.** Uma foto em retrato ou paisagem era esticada para caber no círculo. Agora é recortada no centro (`object-cover`), como se espera de uma foto de perfil.
- 8849f86: **As iniciais do `Avatar` acompanham o tamanho.** O fallback tinha `text-sm` fixo: num avatar `size-6` as iniciais vazavam do círculo e num `size-16` ficavam miúdas. Agora medem 35% da largura do avatar (14px no padrão de 40px, como antes).

  A documentação de `allowedProtocols` foi corrigida: a lista substitui a padrão, então para aceitar `data:` além de https passe `[...DEFAULT_ALLOWED_RESOURCE_PROTOCOLS, "data:"]`. `["data:"]` sozinho bloqueia as fotos https.

- 7b02a27: **O `alt` do `Avatar` não some mais com o fallback.** O `alt`, obrigatório, só ia para a foto: sem `src`, com a foto carregando ou quebrada, "Ana Souza" não existia na página e o leitor de tela lia "AS" ou nada. Agora o avatar inteiro é `role="img"` com `aria-label={alt}`, igual com foto ou com iniciais; a foto e o fallback de dentro não repetem o nome.
- f8625ce: **`Button asChild` passa a respeitar `disabled` e `loading`.** Com um link como filho (`<Button asChild disabled><a href="…">`), saía um `<a disabled>`: o atributo não significa nada num link, que continuava com cara de ativo, clicável e navegando.

  Agora o filho recebe `aria-disabled="true"` e `data-disabled` (e `aria-busy` com `loading`), fica esmaecido e sem cursor de clique, continua alcançável pelo teclado e o clique não navega nem chama os handlers, nem o do `Button` nem o do próprio filho. O spinner continua não sendo injetado no filho.

- 0d992b4: **`Button` em `loading` mantém o foco e a largura.** Antes o `loading` desabilitava o botão de verdade: quem apertava Enter em "Salvar" perdia o foco do teclado para o corpo da página, o spinner entrava antes do texto e alargava o botão (de 127 para 151px num "Salvar proposta") e o leitor de tela não ouvia nada.

  Agora, enquanto `loading`:

  - o botão fica `aria-disabled` e `aria-busy`, continua focado e ignora clique, Enter, espaço e o Enter dado num campo do formulário (nada é enviado duas vezes);
  - o spinner fica no lugar do rótulo, que continua ocupando o seu espaço: a largura não muda. O rótulo não aparece durante o carregamento, então não troque o texto para "Salvando...";
  - o início é anunciado ao leitor de tela ("Carregando…", ajustável com `labels={{ loading: "Salvando proposta" }}`; padrão em `defaultButtonLabels`).

  Um `disabled` passado junto com `loading` continua desabilitando o botão de verdade. Testes que esperavam `toBeDisabled()` num botão só com `loading` devem conferir `aria-disabled="true"`.

- 59f7e9c: **`Calendar` legível em alto contraste.** No modo de cores forçadas do Windows os fundos somem, e o dia selecionado, o intervalo e o dia de hoje ficavam iguais aos outros. Agora os extremos e o dia selecionado ganham um contorno sólido, os dias no meio de um intervalo um contorno tracejado, hoje um sublinhado, e o ano e o mês escolhidos na navegação rápida também ficam contornados.
- 186eadb: **`Calendar`: as setas voltam a mover o foco entre os dias.** Com o foco num dia, seta, Home, End, PageUp e PageDown não faziam nada (ou jogavam o foco para o `<body>` ao trocar de mês), e só o dia selecionado ou o de hoje era alcançável pelo teclado. Agora o foco anda como o `react-day-picker` define: setas por dia e semana, Home e End para o começo e o fim da semana, PageUp e PageDown para o mês anterior e o seguinte. Vale também para o calendário do `DateInput` e do `DateRangePicker`.
- 1dc6898: **`Calendar` volta a anunciar o mês ao trocar.** A legenda clicável (que abre a escolha rápida de ano e mês) tinha descartado a região viva do `react-day-picker`, e o leitor de tela não dizia nada ao passar para o mês seguinte. Uma região viva escondida ao lado da legenda anuncia o novo mês ("julho 2025").
- 4be8833: **`Calendar`: Escape na escolha de ano e mês volta para os dias.** Dentro do popover do `DateInput` e do `DateRangePicker` (ou de qualquer `Popover` ou `Dialog`), Escape na navegação rápida fechava o popover inteiro. Agora o primeiro Escape volta para a grade de dias, com o foco no título; o segundo fecha o popover.
- b4d90b7: **Navegação rápida do `Calendar`: setas na grade de anos e de meses.** Os 201 botões de ano estavam todos na ordem do Tab e as setas não faziam nada. Agora cada grade é uma parada só do Tab (o ano ou mês escolhido), e dentro dela as setas andam por um e por linha, Home e End vão às pontas e PageUp e PageDown pulam quatro linhas; meses fora de `startMonth`/`endMonth` são pulados.
- 720a96b: **`Calendar`: o popover não muda de largura ao abrir a escolha de ano e mês.** A grade de anos e meses tinha 212 px e a de dias 296 px, então o popover do `DateInput` encolhia ao clicar no título e voltava a crescer ao escolher o mês; com dois meses, no `DateRangePicker`, encolhia para menos da metade. Agora os painéis de ano e mês têm a largura da grade de dias que substituem, inclusive com vários meses lado a lado. O dia passa a ter exatamente 40 px, o tamanho que já tinha na prática.
- 9782c11: **`Calendar` marca o "hoje" de São Paulo, igual no servidor e no navegador.** O dia de hoje, o mês que abre sem `month`/`defaultMonth` e os atalhos `disabledDays` `"past"`, `"future"` e `"today"` (também no `DateInput` e no `DateRangePicker`) vinham do relógio da máquina. Entre 21h e meia-noite em Brasília, um servidor em UTC já está no dia seguinte: o servidor marcava um dia, o navegador outro, e a hidratação falhava. Agora o "hoje" é o de `America/Sao_Paulo`, como nos helpers de `lib/date`; a prop `today` continua valendo para outro fuso.
- 0a6d2f0: **`Calendar`: cabeçalho dos dias da semana na escala de tipo.** As iniciais dos dias da semana usavam 12,8 px, fora da escala do sistema. Passam a usar `text-xs` (12 px), como as outras legendas.
- ccd22ed: **Gráficos: o anúncio pelo teclado não repete o ponto.** Ao percorrer um `LineChart` por mês, o leitor de tela recebia "dez.. Residencial Bosque: 17": o nome do mês já termina em ponto. Agora sai "dez. Residencial Bosque: 17", no `LineChart` e no `BarChart`.
- e49f1cb: **`BarChart` e `LineChart`: o gráfico não fica mais vazio quando só sobra a série oculta.** Se `series` mudava e restava apenas uma série escondida pela legenda, não havia barras nem legenda para reexibir. Nesse caso ela volta a aparecer.
- 0fc76a7: **Gráficos: SSR sem erro de hidratação.** `BarChart` e `LineChart` mediam o texto de um jeito no servidor e de outro no navegador. Agora a medida real só é usada depois da hidratação.
- 67a9a0b: `BarChart` e `LineChart` medem os eixos de novo quando a fonte web da página termina de carregar. Antes, um gráfico desenhado antes de a Geist chegar ficava com as margens calculadas para a fonte reserva, e o primeiro hover redesenhava tudo, deslocando o gráfico alguns pixels.
- a015e8e: **`formattedColumn`: `truncate` alcançável por teclado, toque e leitor de tela.** O texto cortado passa a ser uma parada de Tab que abre o texto inteiro no foco; um toque abre e outro fecha; e o leitor de tela lê o texto inteiro no lugar do cortado. Antes o Tooltip ficava num `<span>` sem foco, só para o mouse. Dentro do botão de uma linha clicável, o texto cortado não vira uma segunda parada de Tab. Testes que liam `textContent` da célula passam a encontrar também o texto inteiro (num `sr-only`).
- de0daee: **`Combobox` com `required` anuncia que é obrigatório.** O asterisco do rótulo era o único sinal; o gatilho agora tem `aria-required="true"`, e o leitor de tela diz que o campo é obrigatório ao chegar nele.
- acdfbf5: **`Combobox`: o × dos itens é mais fácil de acertar.** O botão de remover um item media 12 × 12 px, abaixo do mínimo de 24 px para alvos de ponteiro (WCAG 2.5.8). O ícone continua do mesmo tamanho, e a área que responde ao clique ou toque passa a ter 24 × 24 px em volta dele.
- 0ee46cf: **`Combobox` abre na opção escolhida e diz qual é.** A lista abria sempre na primeira opção, com a escolhida fora da vista, e Enter logo depois de abrir trocava o valor pela primeira. Agora a lista abre com a escolhida (a primeira escolhida, no modo múltiplo) destacada e rolada até a vista, e Enter nela mantém o valor. O leitor de tela passa a saber o que está marcado: as opções escolhidas têm `aria-checked="true"`, separado do destaque do teclado (`aria-selected`).

  Num `Combobox` único com `required`, clicar na opção já escolhida a mantém. Sem `required`, o clique nela continua limpando o campo.

- 6c7c9e6: **`Combobox`: o botão de limpar fica fora do gatilho e some quando o campo está desabilitado.** Antes ele era um `span` focável dentro do `<button>` do gatilho: com o campo desabilitado, o Tab ainda chegava nele e o Enter apagava o valor. Agora é um `<button>` de verdade ao lado do gatilho, com alvo de 24 px, que não aparece em campo desabilitado; depois de limpar, o foco volta para o gatilho.
- e56cd95: **`Combobox` múltiplo desabilitado não perde itens.** Os × dos itens acima do campo continuavam clicáveis com `disabled`, e um clique (ou Tab e Enter) tirava a opção. Agora o campo desabilitado mostra os itens sem o botão de remover.
- f495fee: **`Combobox` legível em alto contraste.** A opção destacada pelo teclado era marcada só por uma camada de cor, que some no modo de cores forçadas do Windows: não dava para ver onde estava o destaque. Agora ela ganha um contorno nesse modo.
- 9618cd1: **`Combobox`: a lista tem a largura do campo.** A classe de largura do popover estava escrita no formato do Tailwind 3 e o Tailwind 4 a ignorava: num campo de 396 px a lista abria com 252 px. Agora ela acompanha o gatilho (a prop `popoverWidth` continua valendo). O `aria-controls` do gatilho passa a apontar para a lista que está na tela, e o gatilho deixa de declarar `aria-autocomplete`, que não se aplica a um botão.
- ce9d00b: **`Combobox`: a busca olha o rótulo e as palavras-chave, não o `value`.** Com ids numéricos como valor, digitar "10" achava a opção de id 101 mesmo sem "10" no texto dela. Agora a busca compara só o que a pessoa lê, sem acento nem caixa. Para achar uma opção por outro termo (sigla, código, nome antigo), passe `keywords` nela: `{ value: "1", label: "São Paulo", keywords: ["SP"] }`.
- 1005785: **Busca do `Combobox` com 16 px em telas de toque.** No iPhone, focar a busca da lista, com texto de 14 px, dava zoom na página. Em telas de toque o texto da busca passa a ter 16 px, como nos outros campos; com mouse continua 14 px.
- df4ddc2: **`CommandPalette` acha sem acento.** "configuracoes" encontra "Configurações" e "usuario" encontra "Convidar usuário": a busca ignora acento e caixa no rótulo e nas `keywords`, como o `Combobox`. O `id` de um item não entra na busca.
- fe299a6: **`CommandPalette` fecha ao escolher um item.** Depois do `onSelect`, a paleta chama `onOpenChange(false)`; não é mais preciso fechar à mão em cada item, e no celular, onde não há Esc, escolher um item já tira a paleta da frente. Passe `closeOnSelect={false}` para uma paleta que fica aberta entre comandos. Um clique ou toque fora dela também fecha.
- ee04f8e: **`CommandPalette` sem faixa vazia acima do campo.** O título e a descrição, que só existem para o leitor de tela, ainda ocupavam linhas e espaços do modal: sobrava uma faixa de 17px (33px com descrição) acima da busca. Agora o campo começa no topo da paleta, e o título e a descrição continuam nomeando e descrevendo o diálogo.
- c54ec13: **Exportação CSV: fórmula depois de vírgula.** Um texto como `x,=1+1` virava fórmula se o arquivo fosse aberto com vírgula como separador. O `'` agora entra também depois de vírgula ou tabulação.
- 49c59f2: **Tema escuro: cores sobre popovers.** `--info`, `--chart-2` e `--chart-3` ficaram um pouco mais claros e passam de 3:1 sobre menus e popovers. A auditoria de contraste agora mede status e gráficos também sobre `--popover`.
- 475a982: **`DataTable` mantém a página controlada enquanto os dados não chegam.** Com `pageIndex` vindo da URL e `data={query.data ?? []}`, a tabela limitava a página à última que existia no primeiro render, sem nenhuma linha, e chamava `onPaginationChange({ pageIndex: 0 })`: o link para a página 4 abria na página 1. O mesmo acontecia num refetch que esvaziava `data`. O limite agora espera as linhas (`loading` desligado e ao menos uma página); dados que diminuem com a tabela carregada continuam levando à última página.
- a10b76a: **`DataTable`: células vazias ficam juntas na ordenação.** `undefined` ia para a ponta oposta a `null` e a texto vazio. Na ordem padrão e no `dateColumn`, os três agora vêm primeiro na crescente e por último na decrescente. Colunas com `sortingFn` própria não mudam.
- 2e53513: **`DataTable`: a planilha traz o mesmo valor da célula.** A exportação lê cada coluna pelo seu acessor, o mesmo que a tabela usa: uma coluna `accessorKey: "cliente.nome"` (chave aninhada) deixa de sair vazia, e as colunas com `accessorFn` continuam saindo com o valor calculado.
- 704d7e8: **`DataTable`: o menu de exportação é o `DropdownMenu` da lib.** O menu deixa de ser um `role="menu"` sem setas dentro de um popover de diálogo: setas, Home/End, digitação e Escape funcionam, e o foco volta ao botão ao fechar. Enquanto o arquivo é gerado, o botão fica ocupado (`aria-busy`, sem perder o foco) em vez de desativado. Os itens passam a ter `data-slot="dropdown-menu-item"` (antes `data-table-download-*`).
- 475a982: **`DataTable` exporta um arquivo por vez.** Durante uma exportação lenta (um `fetchAll` que demora), o menu abria de novo e uma segunda exportação começava: duas requisições, dois downloads, e o indicador de carregando sumia com a primeira ainda em andamento. Agora o gatilho ocupado não abre o menu e uma exportação nova só começa quando a anterior termina.
- 9a06e13: **`DataTable` no telefone.** A barra (busca, limpar filtros, exportar) e o rodapé (contagem e paginação) quebram linha em vez de espremer: a 375 px a busca ficava com 89 px ao lado de "Exportar para Excel" e os botões de página encolhiam até sair da caixa. Agora, a 360 px, a busca mantém uma largura usável, as ações descem para a linha de baixo e nada sai da tabela. A busca deixa de ficar presa a `max-w-sm` abaixo de 640 px.
- 969a980: **`DataTable`: a linha clicável continua sendo linha.** Com `onRowClick`, o `<tr>` deixa de ser `role="button"`: o leitor de tela volta a ver as linhas e as células da tabela, e o teclado chega à ação por um `<button>` que envolve o conteúdo da primeira célula, com o mesmo nome (Tab, Enter, Espaço). O clique do mouse em qualquer ponto da linha continua chamando `onRowClick`.

  Clique ou tecla que começa num controle dentro da linha (botão, link, campo, menu de ações, inclusive o conteúdo do menu aberto em portal) agora é só do controle: não chama mais `onRowClick` nem cancela a ação do controle. Testes que procuravam a linha com `getByRole("button")` passam a procurar o botão pelo texto da primeira célula.

- d9e5a19: **`DataTable`: a busca acha o que está na tela, sem acento.** Buscar `joao`, `123.456`, `1.234,50` ou `19/05/2026` agora encontra a linha que mostra "João", "123.456.789-01", "R$ 1.234,50" e "19/05/2026". A busca ignora acento e caixa (`matchesSearch`) e compara o texto que a célula mostra, não o valor bruto: um `t` deixa de casar com o "T" de toda data ISO.

  Cada coluna pode dar o texto pesquisável em `meta.searchText: (row, value) => string`; `dateColumn` e `formattedColumn` já preenchem com a saída formatada, e nas outras vale o valor como texto. Sem `searchableColumns`, um `globalFilter` controlado procura em todas as colunas visíveis. O tipo `DataTableColumnMeta` descreve as chaves de `meta` que a tabela lê.

- d1ddd15: **`DataTable`: ordem alfabética em português.** As colunas ordenáveis comparam texto com `compareText`: acento e caixa não contam, então "Álvaro" vem antes de "ana" e "Ângela", e não depois de "Zuleica"; números dentro do texto seguem a ordem numérica ("Bloco 2" antes de "Bloco 10"). Números ordenam pelo valor, datas pelo tempo, e o `sortingFn` próprio de uma coluna continua valendo.
- e07e9e3: **`DateRangePicker` abre no mês do período salvo.** Com 01–31/01/2025 escolhido, o calendário abria no mês atual, e era preciso voltar mês a mês para ver ou ajustar o período. Agora abre no mês do início do período (ou do fim, se só ele existir); sem período, continua no mês atual.
- 7e7b3a4: **`DateRangePicker` cabe na tela.** No celular o popover empilhava dois meses e media mais de 700 px: começava acima do topo da tela e o "Confirmar" ficava fora dela; mesmo num notebook de 800 px de altura ele passava do topo. Agora, abaixo do breakpoint `md` (768 px), o calendário mostra um mês só, e o popover nunca passa do espaço que tem na tela: se for preciso, o calendário rola dentro dele e os botões "Limpar" e "Confirmar" continuam à vista.
- 023e770: **`Checkbox` e `Switch` mostram a `description` mesmo sem `label`.** Sem rótulo visível (com `aria-label`, numa linha de tabela por exemplo), a descrição não aparecia e o `aria-describedby` apontava para um id que não existia na página. Agora ela aparece ao lado do controle e o descreve.
- 5c82e67: **`Dialog` volta a fechar com clique fora.** Para não fechar quando o clique vinha de um popover aninhado, o `Dialog` perguntava se existia em qualquer lugar do documento um `[role="grid"]`, um calendário, uma lista de comandos ou um popper aberto. Numa página com tabela, campo de data ou busca isso é sempre verdade, e o clique no fundo não fechava mais nada. A `CommandPalette`, que é um `Dialog` em volta de uma lista de comandos e não tem X, só fechava com Esc ou escolhendo um item.

  Essa adivinhação saiu. Um clique num popover, menu, calendário ou lista aberto a partir do diálogo continua contando como clique dentro (eles são renderizados dentro do diálogo); qualquer outro clique fora fecha, como `dismissible` promete. O módulo também deixa de registrar um listener global de `pointerdown` ao ser importado.

- 5abb4fb: **`Dialog` e `AlertDialog` não passam mais da altura da tela.** Um formulário longo num notebook ou num celular deixava o título acima da tela e o rodapé abaixo, e nada rolava. Agora o diálogo tem altura máxima (`100dvh` menos 1rem em cima e embaixo): título e descrição ficam no topo, o rodapé (ou os botões do `AlertDialog`) fica embaixo e só o corpo rola, com a barra de rolagem na borda do diálogo.

  Não é mais preciso `max-h-*` + `overflow-y-auto` no `children`; quem já usa continua funcionando. O corpo passa a ser `[data-slot="dialog-body"]` com `overflow-y: auto` (no `AlertDialog`, os `children` ganham um invólucro `[data-slot="alert-dialog-body"]`, com o mesmo espaço de 16px entre eles). Um `Dialog` com padding próprio no `className` (`p-0`, `px-8`…) mantém o corpo dentro desse padding.

- 7304e27: **Título do `Dialog` com entrelinha de texto.** O título tinha `leading-none`: em duas linhas, a distância entre elas era igual ao tamanho da fonte (18px) e os acentos encostavam na linha de cima. Agora ele usa a entrelinha de `text-lg` (28px), como os títulos de `AlertDialog` e `Sheet`, e o X fica alinhado à primeira linha. Um título de uma linha fica 10px mais alto.
- e5265ec: **Campo desabilitado fica esmaecido por inteiro, rótulo incluído.** Em `Checkbox`, `Switch` e `RadioGroup` desabilitados só a peça de 16px caía a 50%: o rótulo ao lado continuava a 100%, com cara de ativo. Agora o campo todo (controle, rótulo, descrição e erro) fica a 50%, uma vez só, como já acontecia no `Input`. No `RadioGroup`, uma opção desabilitada esmaece a sua linha inteira.

  **O rótulo ganha `cursor: pointer`** enquanto o controle está habilitado, já que o clique nele marca a caixa ou foca o campo, e volta ao cursor normal quando o controle está desabilitado.

- f576a04: **Os campos de domínio não dão mais zoom no iPhone.** `CPFInput`, `CNPJInput`, `CEPInput`, `PhoneInput`, `CurrencyInput`, `PercentageInput` e o campo de digitação do `MultiInput` usavam texto de 14 px, e o Safari do iOS ampliava a página toda ao focar um deles. Em telas de toque (ponteiro grosso) o texto digitado passa a ter 16 px; com mouse continua com 14 px. A altura dos campos não muda.
- 5830ca2: **Item do `DropdownMenu` focado pelo teclado fica visível.** O item destacado só se distinguia por uma camada de 5% (cerca de 1,1:1) e, em cores forçadas (alto contraste do Windows), não se distinguia de jeito nenhum. Agora, navegando pelo teclado, o item focado ganha o anel de foco interno; com o mouse continua só a camada de hover, sem anel seguindo o ponteiro. Em cores forçadas o item destacado usa a cor de destaque do sistema, como um menu nativo.
- 3db02ed: **`EmptyState`: como anunciar dentro de uma `DataTable`.** A região de status da tabela só lê mensagens de texto; um `EmptyState` passado em `emptyMessage` fica mudo sem `announce`. A documentação agora orienta ligar `announce` à busca ou ao filtro (`announce={busca !== ""}`), para o anúncio sair uma vez só e não ler uma tabela que já carrega vazia.
- 8ba3e64: **Um `aria-describedby` passado de fora não apaga mais a descrição e o erro do campo.** Em `Input`, `Textarea`, `Checkbox`, `Switch` e `RadioGroup`, a prop `aria-describedby` do consumidor substituía a que o componente monta: com `aria-describedby="dica"`, o leitor de tela deixava de ler a `description` e, pior, a mensagem de `error`.

  Agora os ids são somados: primeiro a descrição e o erro do componente, depois os que você passar (pode ser mais de um, separados por espaço).

- 8217785: **`Input` e `Textarea` com `readOnly` agora parecem somente leitura.** Antes o campo ficava idêntico a um editável, e um valor calculado ou travado parecia digitável. Agora ganha fundo `muted` e perde o anel de hover; continua focável, o texto pode ser copiado e o valor vai no envio do formulário.

  Use `readOnly`, e não `disabled`, para mostrar um valor que não se edita: `disabled` apaga o campo e tira o valor do `FormData`. Com os dois ao mesmo tempo vale a aparência de desabilitado.

- d6e1572: **`FileUpload`: passar de `maxFiles` recusa só os arquivos novos.** Com a lista já acima do limite (anexos em `items` que chegaram depois da escolha, por exemplo), escolher outro arquivo removia também um já escolhido. Os escolhidos agora ficam.
- 50fd29c: **`FileUpload` não repete um arquivo na lista.** Com `multiple`, escolher de novo um arquivo que já estava na lista (ou soltá-lo duas vezes de uma vez) o colocava duas vezes, e ele seria enviado duas vezes. Agora o repetido fica de fora em silêncio: ele já está à vista. Conta como o mesmo arquivo o que tem nome, tamanho, data de modificação e tipo iguais; dois arquivos diferentes com o mesmo nome continuam entrando.
- 268ba7c: **Item ativo visível em alto contraste na `CommandPalette` e no menu do trilho do `AppShell`.** O item marcado pelas setas tinha só a camada de cor (`state-hover`), uma imagem de fundo que o modo de cores forçadas do Windows remove. Na `CommandPalette` o foco fica no campo de busca, então nem o anel aparecia: dava para andar com as setas sem ver onde estava, e o Enter executava um comando às cegas. Agora o item ativo ganha um contorno nesse modo (como no `Combobox`), e as linhas do menu do trilho recolhido ganham o realce do sistema (como no `DropdownMenu`).
- d33c019: **Estados continuam visíveis com cores forçadas e na impressão.** O sistema é flat e muito estado era só um preenchimento. Com o Alto Contraste do Windows (`forced-colors: active`) o navegador troca os fundos pela cor da página: o `Toggle` ligado ficava igual ao desligado, o segmento escolhido do `SegmentedControl` sumia, o `Switch` ligado ficava igual ao desligado, e o `Separator` e o `Skeleton` desapareciam. Agora o que está ligado, marcado ou escolhido usa as cores de seleção do sistema (`Highlight`), o polegar do `Switch` é sólido, o `Separator` vira uma linha e o `Skeleton` um bloco cinza. O `Button` `link` não ganha moldura.

  Na impressão sem gráficos de fundo, `Toggle`, `SegmentedControl`, `Switch`, `Checkbox` e `Button` pedem `print-color-adjust: exact`: o Checkbox marcado não sai mais vazio e o texto branco do botão primário não some.

- bfa0955: **`Switch`, `RadioGroup` e `SegmentedControl` avisam o reset do formulário uma vez só.** As versões novas do Radix (Switch 1.4, RadioGroup 1.5) também voltam ao estado inicial num `form.reset()`, e junto com o reset da própria lib o `onCheckedChange`/`onValueChange` era chamado duas vezes com o mesmo valor: um efeito colateral no callback (salvar a preferência, registrar um evento) rodava em dobro. Agora duas chamadas no mesmo evento contam como uma.
- 9227dc8: **`Switch`, `RadioGroup` e `SegmentedControl` voltam ao estado inicial num `form.reset()`.** Um `<button type="reset">` ou `form.reset()` devolvia os inputs e o `Checkbox`, mas esses três continuavam com a escolha antiga, na tela e no `FormData`. Agora voltam ao `defaultChecked` ou `defaultValue` (ou a nada escolhido). Controlados, pedem o estado inicial pelo `onCheckedChange` ou `onValueChange`, como o `Checkbox` já fazia.
- ff71378: **`RadioGroup` e `SegmentedControl` desabilitados dizem isso no grupo.** O Radix desabilita cada opção, mas o grupo (`role="radiogroup"`) não dizia que estava indisponível: o leitor de tela anunciava o nome do grupo como de um grupo ativo, e o axe cobrava contraste do rótulo esmaecido. Agora o grupo desabilitado tem `aria-disabled="true"`.
- 2c3d687: **`IconButton` desabilitado continua com tooltip e alcançável pelo teclado.** Com o `disabled` nativo, o ícone ficava mudo: nenhum tooltip no hover e o Tab pulava o botão. Numa ação de linha de tabela não dava para saber o que era nem que estava travada.

  Agora `disabled` (e `loading`) usam `aria-disabled`: o botão fica esmaecido, ignora clique, Enter e espaço e não envia o formulário, mas continua na ordem do Tab e mostra o tooltip. Em `loading` ele mantém o foco e o início é anunciado ao leitor de tela (`labels={{ loading }}`).

  O atributo `disabled` deixa de existir no `<button>`: em testes, troque `toBeDisabled()` por `toHaveAttribute("aria-disabled", "true")`; em CSS, troque `:disabled` por `[aria-disabled="true"]`. Isso vale também para as setas de `Pagination` e do `Stepper` compacto, que usam o `IconButton`.

- d7d2c22: **`IconButton` não encolhe mais numa linha apertada.** Num `flex` sem espaço, o botão de 40px era espremido até uns 19px de largura e deixava de ser quadrado (e de ser um alvo de 24px). Agora ele mantém o tamanho e quem cede é o texto ao lado.
- 1cf2687: **Clicar no ícone ou na borda interna do `Input` foca o campo.** Antes só o texto respondia: um clique no ícone de busca ou no respiro da caixa deixava o foco na página. Agora a caixa inteira funciona como o campo. Um botão ou link dentro de `leadingIcon` ou `trailingIcon` (mostrar senha, limpar) continua recebendo o próprio clique.
- cd13b21: **`InputOTP` desabilitado esmaece uma vez só.** As caixas do código ficavam a 25% de opacidade, porque o contêiner aplicava `opacity-50` por cima do `opacity-50` que o campo inteiro já recebe; ficavam bem mais apagadas que o rótulo e que os outros campos desabilitados. Agora o campo inteiro, rótulo e caixas, fica a 50%, como os demais.
- 1351bdf: **`InputOTP` com `error` marca as caixas do código.** Com erro, só a mensagem embaixo mudava: as caixas tinham a mesma borda de um campo válido, diferente dos outros campos da biblioteca. Agora cada caixa fica com a borda vermelha do erro (e `data-invalid`), inclusive a que está com o foco.
- 3a1eed8: **Rótulo à esquerda alinhado com a caixa do campo.** Com `labelPosition="left"`, o rótulo era centralizado no bloco inteiro: com descrição e erro abaixo da caixa, ele descia até 22px do centro do campo. Agora fica na linha da caixa, em qualquer `size`, por mais alto que seja o que vem abaixo.

  Para alinhar os rótulos de um formulário numa coluna, defina a largura num contêiner: `<form className="[--field-label-width:8rem]">`.

- 960881f: **Rótulos com altura de linha de texto.** O rótulo dos campos tinha `line-height` igual ao tamanho da fonte (14px em 14px): quando quebrava em duas ou mais linhas, elas encostavam uma na outra, e a caixa do `Checkbox` ficava no meio do bloco em vez de na primeira linha.

  Agora o rótulo usa linhas de 20px. `Checkbox`, `Switch` e as opções do `RadioGroup` alinham o controle com a primeira linha do rótulo, em qualquer número de linhas. Efeito no layout: o rótulo acima de um campo ocupa 20px (eram 14px) com 4px até o campo (eram 6px), e a linha de um `Checkbox` passa de 16 para 20px; no `RadioGroup` a distância entre as opções continua a mesma (28px).

- 4bb8c60: **`CPFInput`, `CNPJInput`, `CEPInput` e `PhoneInput` mantêm o cursor no lugar.** Corrigir um dígito no meio do campo jogava o cursor para o fim e o dígito seguinte entrava no lugar errado, embaralhando o número. Agora o cursor fica onde a pessoa está, ao digitar e ao apagar.

  Backspace logo depois de um separador (o ponto de `123.|456`) apaga o dígito anterior a ele, e Delete logo antes apaga o seguinte; antes a tecla não apagava nada.

- f0a6099: **Colar em `CPFInput`, `CNPJInput`, `CEPInput` e `PhoneInput` não perde mais dígitos.** O campo tinha `maxLength` do tamanho da máscara, e o navegador cortava o texto colado antes da limpeza: `" 529.982.247-25"` virava `529.982.247-2` e `"CPF: 529.982.247-25"` virava `529.982.2`. O `maxLength` saiu; o texto é limpo primeiro e limitado depois, e o número é achado no meio de rótulo, espaço e outros números (o CEP no fim de um endereço colado, por exemplo). Um número completo colado substitui o que estava no campo.

  No `PhoneInput`, um número com mais de 11 dígitos perde o código do país e o zero de operadora: `+55 11 98765-4321` e `011 98765-4321` viram `(11) 98765-4321` (antes, `(55) 11987-6543`, que passava em `isValidPhone`). Vale também para quem digita o 55 na frente e para um `value` que já chega com ele.

  Quem digitava num campo cheio continua sem conseguir: a tecla é recusada, sem empurrar o último dígito para fora.

- c8b8c86: **Campos mascarados: colar num campo cheio não corta mais o final.** Colar um trecho no meio de um CPF, CNPJ, CEP ou telefone já completo empurrava os últimos dígitos para fora, sem aviso. A colagem agora é recusada, como a digitação já era.
- b017d89: **O X de `Dialog` e `Sheet` virou um `IconButton` de 32px chamado "Fechar".** Era um ícone de 16×16px que clareava no hover, um alvo pequeno para o mouse e para o dedo, com o nome "Close" em inglês. Agora é um botão de 32px com a camada de estado no hover e no clique, como os outros controles, e `closeLabel` tem o padrão "Fechar". O título deixa espaço para o X e quebra antes dele.

  Se você passava `closeLabel="Fechar"` só para traduzir, pode tirar.

- 2814d40: **Modal sem `description` não aponta mais para uma descrição inexistente.** `Dialog`, `Sheet` e `AlertDialog` sem `description` saíam com `aria-describedby` apontando para um id que nenhum elemento tinha, e o Radix avisava no console. Agora o atributo só existe quando há descrição. No `AlertDialog` a descrição continua recomendada: o Radix segue avisando, em desenvolvimento, quando ela falta.
- f4e7e79: **Listas dentro de `Popover` voltam a rolar quando ele está num `Dialog`, `AlertDialog` ou `Sheet`.** O modal trava a rolagem do resto da página, e o popover era renderizado no `<body>`, fora do modal: a roda do mouse e o dedo não rolavam a lista de um `Combobox` com 40 opções.

  Dentro de um modal, `Popover`, `DropdownMenu` (com os submenus) e `Tooltip` agora são renderizados dentro do conteúdo do modal. Além de rolar, eles acompanham a animação de abrir e fechar do modal, ficam atrás de um segundo modal empilhado por cima, e um clique neles conta como clique dentro do modal. Fora de um modal nada muda: continuam indo para o `<body>`. Vale para tudo que usa o `Popover` da lib (`Combobox`, `DateInput`, `DateRangePicker`).

  **Ao atualizar:** testes que procuravam o popover fora do diálogo (`within(dialog)` não o achava) agora o encontram dentro dele. Se o `className` do `Dialog` ou do `Sheet` tiver `overflow-*` (o jeito antigo de rolar o modal inteiro), os popovers desse modal continuam no `<body>`, para não serem cortados; tire o `overflow-*`, que o corpo já rola sozinho, e eles passam a rolar também.

- fc7dd50: **`Dialog`, `AlertDialog` e `Sheet` devolvem o foco ao fechar mesmo sem `trigger`.** Um modal aberto por estado (`open`), a partir de um botão da página ou de um item de menu, deixava o foco no `<body>` ao fechar: quem usa teclado recomeçava do topo da página. Agora o foco volta para o elemento que o tinha quando o modal abriu. Se esse elemento sumiu com o popup em que estava (o item do "…" de uma linha de tabela, um botão dentro de um popover), o foco vai para o gatilho desse popup. Com `trigger`, nada muda.

  Os três ganham `onCloseAutoFocus(event)`, para mandar o foco para outro lugar com `event.preventDefault()`.

- 291af37: **O × de um item do `MultiInput` fica fácil de acertar.** O botão de remover media 12 por 12 px, abaixo do mínimo de 24 px da WCAG 2.2 (2.5.8), e no celular era comum errar o toque. O ícone continua do mesmo tamanho e o item não cresce; a área que aceita o clique ou o toque em volta dele passou a ter 24 por 24 px. Cada item ganhou `data-slot="multi-input-item"`.
- a212e22: **`CurrencyInput` e `PercentageInput` mantêm o cursor no lugar.** Corrigir um dígito no meio de `1.234,56` jogava o cursor para o fim e os dígitos seguintes entravam no lugar errado. Agora o cursor fica onde a pessoa está, ao digitar e ao apagar, e Backspace logo depois do ponto de milhar ou da vírgula apaga o dígito anterior a ele.

  Com o campo em zero, a digitação preenche os centavos primeiro onde quer que o cursor esteja: um foco por script (`autoFocus`, `setFocus` do formulário), que deixa o cursor antes do `0,00`, não muda mais o resultado.

  Um `value` que não é número (`undefined`, `NaN`) mostra `0,00` em vez de `NaN,NaN`. O 16º dígito digitado é recusado, em vez de empurrar o último para fora.

- ea03dd8: **Gatilho em texto funciona.** `trigger` é tipado como `ReactNode`, mas o Radix só sabe ligar o gatilho a um elemento: `trigger="Abrir"` não renderizava nada, sem erro. Agora, em `Dialog`, `AlertDialog`, `Sheet`, `Popover`, `DropdownMenu` e `Collapsible`, um gatilho em texto vira um `Button` `outline` com esse texto. No `Tooltip`, um texto (um termo, uma sigla) vira um trecho focável com sublinhado pontilhado, alcançável pelo Tab; no `anchor` do `Popover`, um `<span>`.
- e189f41: **`Pagination` não quebra em duas linhas no celular.** Com números (`variant="pages"`), quando o espaço não comporta todos os controles numa linha, a paginação passa sozinha ao layout compacto ("Página 3 de 10" entre anterior e próxima), por container query: vale o espaço do contêiner, não a tela. Abaixo de 320px os atalhos de primeira e última página também saem.

  A `<nav>` da paginação passa a ocupar a largura do pai (`w-full`) para medir o espaço que tem. Dentro de uma linha flex, dê a ela o espaço que deve ocupar (`flex-1`, por exemplo) com `className`.

- 9895b05: **`Pagination`: o foco não cai no `body` nas pontas.** Enter em "Próxima página" até a última página jogava o foco para o `body`, e o Tab recomeçava do topo da página. Nas pontas, anterior e próxima ficam `aria-disabled` e continuam no Tab (também no modo link, inclusive com `renderLink`), então o foco fica onde estava. "Página anterior" na página 1 passa a ser alcançável pelo Tab, anunciada como indisponível.
- 400e564: **`Pagination` com `getPageHref`: Ctrl/⌘-clique não mexe na aba atual.** Abrir a página 4 numa nova aba fazia a aba original também marcar a página 4 (com a URL intacta). Um clique com Ctrl, ⌘, Shift ou o botão do meio agora fica só com o navegador: a nova aba abre e a atual continua onde estava, sem chamar `onPageChange`.
- 25dc5e1: **`Pagination` nunca mostra "NaN".** Uma página que não é número (um `NaN` vindo de uma query string ruim) vira a página 1, e um total que não é número é ignorado no lugar de virar "NaN–NaN de 243". Em desenvolvimento, uma página fora do intervalo gera um aviso no console, porque o estado do consumidor ainda guarda o valor errado. A `DataTable` passa a página já ajustada enquanto volta para a última página depois que os dados encolhem.
- a9a39a0: **Colar no `PercentageInput` lê o número como ele foi escrito.** A colagem seguia a regra da digitação (centésimos primeiro) e `12,5` colado virava 1,25. Agora o texto colado é lido com a mesma regra do `CurrencyInput` e substitui o valor do campo: `12,5`, `12.5` e `12,50%` viram 12,50; `7` vira 7,00. A digitação não muda.
- e3c4a23: **`Popover` não passa mais da borda da tela.** Sem altura máxima, um conteúdo alto (uma lista de 40 colunas, um formulário de filtros) continuava para baixo da tela e não havia como chegar ao fim. Agora o popover para no espaço que sobra entre o gatilho e a borda (menos `collisionPadding`) e o resto rola, como já fazia o `DropdownMenu`.
- 2122421: **`Popover` sempre tem nome.** O conteúdo do `Popover` é um `role="dialog"`, e um diálogo sem nome deixa o leitor de tela anunciar só "diálogo". Agora, sem `aria-label` nem `aria-labelledby`, o popover leva o nome do seu `trigger` (como um menu leva o do botão que o abre); o `id` que o gatilho já tiver é mantido. Sem nome e sem `trigger` (só `anchor`), um aviso em desenvolvimento pede o `aria-label`.
- 5e89fc1: **`Progress` visível em cores forçadas.** Trilho e preenchimento eram só cores de fundo, que o modo de alto contraste do Windows achata na cor da janela: a barra sumia. Agora, nesse modo, o trilho ganha um contorno e a parte preenchida usa a cor de destaque do sistema.
- acabec1: **`Progress` desliza até o valor novo.** A transição estava declarada para `width`, mas a barra anda por `transform`: cada mudança de valor era um salto. Agora a barra desliza em 310ms com a curva padrão do sistema (e respeita o movimento reduzido).
- 9ce47b0: **`RadioGroup`: o grupo passa a ter nome acessível.** O `label` era um `<label for>` apontando para o `div[role=radiogroup]`, que não é um controle: o leitor de tela lia as opções sem a pergunta. Agora o grupo aponta para o texto com `aria-labelledby` e o leitor anuncia "Plano, grupo de opções". Sem `label`, passe `aria-label` ou `aria-labelledby`.
- 6e2299b: **`RadioGroup`: `required` deixa de ser só o asterisco.** A prop não chegava ao grupo: `aria-required` ficava `"false"` e o formulário era enviado sem nenhuma opção marcada. Agora o grupo é anunciado como obrigatório e, com `name`, a validação nativa do formulário barra o envio até uma opção ser escolhida.
- 3c31921: **Campo somente leitura não mostra placeholder.** Vazio e com `readOnly`, `Input`, `Textarea`, `NumberInput`, os campos formatados (`CPFInput`, `CNPJInput`, `CEPInput`, `PhoneInput`, `CurrencyInput`, `PercentageInput`), `MultiInput`, `DateInput` (`dd/mm/aaaa`), `TimePicker` (`--`), `DateRangePicker`, `Combobox` e `Select` ficam sem a dica. Ela era desenhada sobre o fundo esmaecido do somente leitura com contraste de 4,3:1 no claro e 4,1:1 no escuro, abaixo dos 4,5:1 da WCAG 1.4.3 (que isenta só o desabilitado), e uma dica de digitação num campo que não aceita digitação também orienta mal.
- 05d90f0: **`IconButton` e `Textarea` respeitam o cleanup de ref do React 19.** Um ref de callback que devolve uma função de limpeza (`ref={(el) => { observar(el); return () => parar() }}`) perdia essa função nesses dois componentes: a limpeza nunca rodava e o callback era chamado de novo com `null`. Agora a limpeza roda ao desmontar, como em `Button` e `Input`.
- 8227b39: **O asterisco de campo obrigatório não entra mais no nome do campo.** Em `Input`, `Textarea`, `Checkbox`, `Switch` e `RadioGroup` o asterisco tinha `aria-label="obrigatório"`: o leitor de tela lia "E-mail obrigatório, obrigatório", porque o próprio controle já anuncia `required`. Agora o asterisco é só visual (`aria-hidden`) e o nome do campo é o rótulo.

  Os campos cujo controle é um botão (`Combobox`, `DateInput`, `DateRangePicker`, `TimePicker`) continuam dizendo "obrigatório" junto do rótulo, agora num texto só para leitor de tela.

- bbf25eb: **Dependências mínimas sobem para as versões testadas.** As faixas de `dependencies` (Radix, cmdk, react-day-picker, sonner, tailwind-merge, date-fns e as outras) passam a começar nas versões com que a suíte inteira roda, que são as que um app instala do zero (por exemplo `@radix-ui/react-dialog` `^1.3.1`, `@radix-ui/react-select` `^2.4.1`, `@radix-ui/react-tooltip` `^1.4.1`). Antes, a lib era testada com versões mais antigas que as que os apps recebiam.
- ade8342: **`Schedule` em cores forçadas.** No alto contraste do Windows o círculo do dia de hoje e o fundo das barras e blocos desapareciam. Agora hoje ganha um contorno na cor de destaque do sistema, barras e blocos ganham borda e os pontos de categoria ficam na cor do texto.
- d495846: **`Schedule`: data inválida não derruba a tela.** Um `date` ou `defaultDate` inválido lançava `Invalid time value`. Agora a agenda mostra o período de hoje. Um `today` inválido também conta como ausente: o relógio dá o dia marcado como hoje, e o botão "Hoje" não entrega mais uma data inválida a `onDateChange`.
- 8bd6050: **`Schedule`: o nome de cada evento começa pelo que está escrito nele.** Quem usa controle por voz diz o texto que vê; um evento do mês mostra "15:00 Comitê de obras", mas se chamava "Comitê de obras, terça-feira, 3 de novembro, 15:00 – 16:30" (WCAG 2.5.3, rótulo no nome). Agora o nome segue a ordem da tela e completa com o que não aparece: no mês, "15:00 Comitê de obras, terça-feira, 3 de novembro, 15:00 – 16:30"; na semana e no dia, "Comitê de obras, 15:00 – 16:30, terça-feira, 3 de novembro"; na lista, "09:00 – 10:30 Daily, quarta-feira, 18 de novembro". Testes que acham eventos pelo nome com `^Título` precisam acompanhar a nova ordem.
- f328d1e: **`Schedule`: a lista não diz "Nenhum evento" enquanto carrega.**
- f11da70: **`Schedule`: plantão que vira a noite fica na grade de horas, e o horário de verão não desloca os eventos.** Nas visualizações de semana e dia, um evento com hora marcada de menos de 24 horas que cruza a meia-noite (um plantão das 22h à 1h) é desenhado na grade dos dois dias, cortado em cada um, em vez de ir para a faixa "Dia inteiro". Eventos de dia inteiro e de 24 horas ou mais continuam na faixa. A posição dos blocos passa a vir da hora do relógio, então um evento das 10h fica na linha das 10h mesmo no dia em que o horário de verão começa ou termina. No mês nada muda.
- 583f17e: **`Schedule`: eventos com alvo de 24px e texto de 12px no mínimo.** Chips, barras e o botão "+N mais" passam de 20 para 24px de altura (a medida mínima de alvo da WCAG 2.2), com as faixas do mês e do "Dia inteiro" acompanhando. Um evento curto na grade de horas também fica com 24px. As horas da grade, o rótulo "Dia inteiro" e o selo "Hoje" da lista sobem de 10 e 11px para 12px.
- c123f26: **`ScrollArea` rola pelo teclado e a barra aparece.** A área de rolagem não recebia foco: sem um link ou botão dentro, quem usa só o teclado não conseguia rolar. Agora ela é uma parada de Tab e rola com as setas e PageDown; com `aria-label` ou `aria-labelledby` vira uma região nomeada. O polegar da barra passa da cor de divisória (1,25:1 contra o fundo) para a de borda de campo (3:1 ou mais nos dois temas), e fica na cor do texto em alto contraste.
- 0661d88: **`SegmentedControl` desabilitado fica a 50%, não a 25%.** Com `disabled` no controle inteiro, a trilha e cada segmento aplicavam `opacity-50` ao mesmo tempo, e o texto ficava a 25%, quase ilegível. Agora a opacidade entra uma vez só: na trilha quando o controle todo está desabilitado, no segmento quando só aquela opção está.
- 7343372: **`SegmentedControl` controlado chama `onValueChange` uma vez por seta.** Com `value` controlado, cada seta do teclado disparava `onValueChange` duas vezes com o mesmo valor (`["semana", "semana"]`): uma seleção do componente e outra do Radix, antes de o pai renderizar de novo. Quem buscava dados, registrava analytics ou fazia `router.push` no callback fazia tudo em dobro. Agora é uma chamada por troca, com a tecla segurada ou num toque rápido.
- ed00a2b: **`SegmentedControl` responde às quatro setas.** ↑ e ↓ não faziam nada: só ← e → moviam a seleção. Um grupo de rádio usa as quatro (→ e ↓ avançam, ← e ↑ voltam), e é isso que quem usa leitor de tela espera. O grupo deixa de expor `aria-orientation`.
- 4dd3196: **`Select`: um `value` fora das opções vai no `FormData` como está.** Com `name` e um valor que não está na lista (uma opção desativada ou ainda não carregada), o formulário enviava a primeira opção. Agora envia o próprio valor.
- f9ec550: **Fundo e painel do `Sheet` saem juntos.** Ao fechar, o fundo escuro sumia em 175ms (o tempo de saída dos diálogos) enquanto o painel ainda deslizava por 410ms: a página clareava com o painel na frente. Agora o fundo do `Sheet` segue o tempo do painel, na entrada e na saída.
- bd3e4d1: **`Sheet`: o painel vira uma coluna de verdade.** O painel era `display: block`, então o `gap-4` e o `mt-auto` do rodapé não faziam nada: título, descrição e corpo ficavam colados, o rodapé parava logo abaixo do conteúdo e um formulário longo empurrava o "Salvar" para fora da tela, sem rolagem.

  Agora título, descrição, corpo e rodapé ficam a 16px um do outro, o rodapé vai para o fim do painel e o corpo (`[data-slot="sheet-body"]`) rola quando o conteúdo é mais alto que o espaço. Painéis `top` e `bottom` crescem com o conteúdo até a altura da tela menos 2rem.

  **Ao atualizar:** se você colocava margem ou `py-4` no `children` para afastá-lo do título, remova: o espaço agora vem do painel.

- 534c4c9: **Modal aberto sobre outro escurece o de baixo.** O fundo escuro de todo modal ficava numa camada abaixo de todos os modais: um `AlertDialog` de "Descartar alterações?" aberto sobre um `Dialog` aparecia branco ao lado de um diálogo branco e claro, sem deixar óbvio qual dos dois esperava a resposta. Agora o fundo fica na camada do próprio modal, logo antes dele, e um modal novo escurece também os que estão abertos por baixo. Vale para `Dialog`, `AlertDialog`, `Sheet` e o menu móvel do `AppShell`.
- fb17747: **`Stepper`: rótulo cortado tem `title` e o limiar cresce com as etapas.** Um rótulo cortado pelas reticências mostra o texto inteiro no `title` ao passar o mouse (só quando cortado, para não ser lido duas vezes). E o ponto em que a lista horizontal vira o resumo compacto acompanha o número de etapas (~8rem cada) até 12 etapas; antes ficava parado em 56rem a partir de 7, e os rótulos ficavam ilegíveis.
- 91158cc: **`Switch`: o rótulo quebra em linhas em vez de sair do contêiner.** O rótulo tinha `whitespace-nowrap`: um texto de 411px num espaço de 220px passava por cima do que estivesse ao lado. Agora ele quebra dentro do contêiner, com o switch na altura da primeira linha.

  O `Button` continua numa linha só (a altura dele é a do controle). A story `Primitives/Button/Long Label` documenta as duas saídas para um texto maior que o espaço: truncar (`max-w-full` e o texto num `<span className="min-w-0 truncate">`) ou deixar quebrar (`h-auto min-h-control-md py-2 whitespace-normal`).

- 5977db1: **`tableStyles()` com a densidade e a seleção do `DataTable`.** `head` e `cell` passam de `px-4 py-4` para `px-3 py-2.5`, a densidade de linha da lib (linhas de cerca de 41 px, antes 53 px), e a linha selecionada (`data-state="selected"`) usa `bg-accent text-accent-foreground`, como no `DataTable`, com contorno do sistema em cores forçadas. O `DataTable` passa a se desenhar com as mesmas classes, então os dois não se afastam mais. Tabelas feitas com `tableStyles()` ficam mais baixas.
- 055259a: **`Tabs` abre a primeira aba quando não há `value` nem `defaultValue`.** Antes nenhuma aba ficava selecionada e nenhum painel aparecia, embora a documentação prometesse "Default: primeiro item". Agora a primeira aba habilitada começa aberta.
- dc9a520: **`Tabs`: aba ativa visível em cores forçadas.** No modo de alto contraste do Windows o fundo mais claro da aba ativa desaparece; agora ela ganha uma borda na cor de destaque do sistema.
- 318773b: **`Tabs`: a lista de abas rola quando não cabe.** A lista era `inline-flex` com rótulos que não quebram: três abas curtas num contêiner de 240px vazavam para 266px, e a ficha de um lead com 8 abas estourava a tela do celular. Agora a lista fica do tamanho do contêiner e rola de lado, e a aba ativa (por clique ou pelas setas, Home e End) é rolada para a vista, sem rolar a página. O anel de foco das abas passa a ser interno, para a rolagem não cortá-lo.
- afa60a3: **Tailwind 4.1 ou mais novo.** O peer passa de `^4` para `^4.1`: os componentes usam as variantes `pointer-*`, que não existem no 4.0. **Como migrar:** atualize o `tailwindcss` do app para 4.1 ou mais novo.
- 80b874f: **`Textarea`: o contador e o `autoResize` acompanham o valor real do campo.** Antes os dois só enxergavam o `onChange`, então com `register` do react-hook-form o contador ficava em "0/500" mesmo com `defaultValues`, não mudava no `reset()` nem no `setValue()` e não voltava num `form.reset()`. Com `autoResize`, um texto carregado por código ficava cortado, sem barra de rolagem, e estreitar a caixa escondia o fim do texto.

  Agora o contador e a altura leem o valor do próprio `<textarea>`: valem para o que o usuário digita, para o que é escrito pelo `ref`, para o reset do formulário e para a mudança de largura da caixa. Nada muda na API.

- f2a542d: **`TimePicker` com `required` anuncia que é obrigatório.** Só o asterisco do rótulo dizia isso; agora os campos de hora e de minutos têm `aria-required="true"`.
- 1b4c7f0: **`TimePicker`: digitar "9:30" dá 09:30.** O `:` depois de um dígito era ignorado: o "3" entrava na hora ("93") e, ao sair, o campo apagava tudo. Agora o `:` completa a hora com zero à esquerda e passa para os minutos (no campo dos minutos ele é ignorado). Uma hora ou um minuto inválido é limpo ao sair sem levar o outro campo junto: antes, uma hora inválida apagava também os minutos.
- 6ba5c3b: **`TimePicker`: colar um horário preenche os dois campos.** Colar "14:30" guardava só "14" na hora. Agora um horário inteiro no texto colado ("14:30", "9h05", "Reunião às 14:30" ou "1430") preenche hora e minutos, em qualquer dos dois campos. Um texto com separador que não é um horário ("25:99") não muda nada; dígitos soltos entram como se fossem digitados.
- 0ea1363: **`toBRLMoney` nunca mostra mais de duas casas e lê texto em formato brasileiro.** `toBRLMoney(1000 / 3)` devolvia `"333,333"` e `toBRLMoney("1.234,56")` devolvia `"1,234"`, porque o texto era lido com `parseFloat`. Agora o resultado tem sempre duas casas (`"333,33"`) e um texto é lido nos dois formatos: `"1234.56"`, `"1.234,56"` e `"R$ 1.234,56"` dão `"1.234,56"`.

  Um texto como `"1.234"`, que antes saía como `"1,234"`, agora é lido como mil duzentos e trinta e quatro (`"1.234,00"`). O que não for número (`"abc"`, `NaN`) devolve `""` em vez de `"NaN"`.

- 417e4d7: **Toast legível no tema escuro.** A descrição do toast e o X de fechar vinham com as cores fixas do tema claro do Sonner (`#3f3f3f` e quase preto): sobre a superfície escura davam contraste de 1,5:1 e 1,1:1. A descrição agora usa `--muted-foreground` e o X veste as cores do próprio toast (neutro ou, com `richColors`, o preenchimento do status), nos dois temas; o hover do X é a camada de estado dos outros controles, não mais um fundo quase branco.

  As regras ficam num bloco de `tokens.css`, fora de camada como o CSS do Sonner. Quem importa `@amfernandesinc/ui/styles` não precisa fazer nada.

- 473cdb0: **Toast plano, como o resto do sistema.** O CSS do Sonner, fora de camada, vencia as regras da lib: o toast tinha sombra, texto de 13px, o raio de 8px do `--radius` obsoleto e um X de 20px. Agora ele não tem sombra, usa o texto de 14px do sistema e o raio dos containers flutuantes (12px, como `Popover` e `Dialog`), e o X tem 24px. No foco pelo teclado, toast, X e botão de ação mostram o anel de foco do sistema em vez da sombra do Sonner.
- 0e6ee57: **As props do `Toaster` somam com os padrões da lib.** Antes, passar `toastOptions`, `style`, `icons` ou `className` substituía o objeto inteiro da lib: `<Toaster richColors toastOptions={{ duration: 8000 }} />` perdia a classe que colore o ícone (ele ficava da cor do fundo) e um `style={{ "--width": "420px" }}` apagava a paleta e o z-index. Agora cada uma é mesclada chave por chave: `toastOptions.classNames` soma classe por parte do toast, `style` acrescenta ou troca só as variáveis que você passar, `icons` troca só os ícones que você nomear e `className` soma com a do Toaster.
- fe5c6dd: **Os toasts continuam usáveis com um modal aberto.** Com um `Dialog`, `AlertDialog` ou `Sheet` aberto, o toast ficava inerte: o clique em "Tentar de novo" não chegava ao botão e ainda contava como clique fora, fechando o diálogo e perdendo o formulário; pelo teclado, Alt+T e Tab não chegavam ao toast.

  Agora:

  - o `Toaster` volta a aceitar o ponteiro mesmo com o modal aberto, e um clique num toast não fecha `Dialog` nem `Sheet`;
  - Alt+T leva o foco para os toasts mesmo de dentro de um modal, Tab percorre os botões do toast e depois volta para o modal;
  - Esc com o foco num toast devolve o foco para onde estava e não fecha o modal; o Esc seguinte fecha.

- 171a574: **`Toggle` padrão ligado ganha borda visível.** Na variante `default`, o estado ligado era o tom de seleção (`accent`) com borda da mesma cor: 1,22:1 contra a superfície (1,39:1 no escuro), mais apagado que o desligado. Agora a borda do ligado é o azul funcional (`ring`): 5,6:1 contra a superfície e 4,6:1 contra o próprio preenchimento (8,2 e 5,9 no tema escuro). As variantes de status não mudam.
- 2ee3791: **O × do `Token` tem área de toque de 24px.** O botão de remover media 16px (`sm`) e 20px (`md`), sobre um chip que também é clicável: fácil errar e acionar o chip. O desenho continua do mesmo tamanho; a área que responde ao clique passa a 24 por 24px, o mínimo do WCAG 2.2 (SC 2.5.8).
- 52bf7c9: **`Tooltip` funciona em botão desabilitado.** Um botão `disabled` não recebe eventos de ponteiro nem foco, então o tooltip dele nunca abria: "por que Excluir está desabilitado?" ficava sem resposta. Agora, quando o filho do `Tooltip` está `disabled`, ele é envolvido num `<span>` focável que abre o tooltip no hover e no Tab. Vale também para o `IconButton` desabilitado, que mostra o rótulo.

  No celular o tooltip não abre (o toque aciona o controle): diga o motivo também na página.

- 239d543: **`Tooltip` volta a ter animação de entrada.** As classes de entrada esperavam `data-state="open"`, que o Radix nunca põe num tooltip (ele usa `delayed-open` e `instant-open`): o tooltip aparecia de uma vez e só a saída era animada. Agora ele surge com o fade e o zoom curtos do sistema.
- f9a1095: **`Tooltip` com largura máxima.** Sem limite, um texto de 200 caracteres virava uma linha de mais de mil pixels, atravessando a tela. Agora o tooltip para em 320px (ou na largura da tela menos 16px, se for menor) e o texto quebra em linhas.
- 27ab433: **`Tour` anuncia o conteúdo da etapa.** A partir da segunda etapa o leitor de tela ouvia só "2 de 4: título": o foco fica em "Próximo", então a descrição do balão não era lida de novo. O anúncio agora inclui o texto do `content` da etapa ("2 de 4: Encontre qualquer lead. Busque por nome, telefone ou CPF.").
- 76f3c0f: **`Tour`: a lista de passos pode esvaziar com o tour aberto.** Passado o primeiro passo, `steps={[]}` derrubava a tela com `TypeError`. Agora o balão só some.
- 8e5e012: **`Tour`: o balão fecha no lugar.** Ao fechar o tour (X, Concluir ou Escape), o balão saltava para o centro da tela e sumia lá. Agora a animação de saída acontece junto ao alvo.
- 659d4e7: **`Tour` usável em cores forçadas.** O destaque do `Tour` escurece a página com um contorno enorme semitransparente; no modo de alto contraste do Windows esse contorno vira uma cor opaca e cobria a página inteira. Nesse modo o destaque agora é um anel de 2px na cor de destaque do sistema em volta do alvo, e o resto da página continua à vista.
- bf13d8c: **O `Tour` não prende mais o teclado.** O tour é não modal para o mouse, mas o Tab só dava voltas no balão (X, Próximo, X…): quem usa teclado não chegava ao elemento de que a etapa fala nem ao resto da página. Agora o Tab, passando do último botão do balão (ou o Shift+Tab antes do primeiro), vai para o alvo da etapa e segue pela página, com o tour aberto. O Esc continua encerrando o tour.
- 042fc9f: **`Tour` encontra um alvo que aparece depois ou que é trocado.** O alvo de cada etapa era procurado uma vez só, quando ela abria. Se o elemento ainda não existia (dados carregando), o balão ficava no centro da tela; se o React trocava o nó por outro com o mesmo seletor, o destaque ia para o canto da página. Agora, enquanto a etapa está aberta, o `Tour` procura de novo quando a página muda e o alvo atual sumiu ou não foi achado.
- 714ea58: **`Tree`: reabrir um nó pede os filhos de novo.** Se `onLoadChildren` falhava, o nó ficava em "Carregando…" para sempre. Fechar e abrir agora chama de novo enquanto os filhos não chegarem. Devolva a promise da carga em `onLoadChildren`: enquanto ela roda, fechar e abrir não pede de novo (um app que acrescenta o que chega receberia cada filho duas vezes), e uma carga que falhou volta a ser pedida ao reabrir.
- 919c780: **Texto cortado da `DataTable`: o segundo toque fecha o texto inteiro.** Com o Radix Tooltip 1.4 (o que um app instala hoje), o toque que deveria fechar o balão o abria de novo: o Radix o fechava ao encostar o dedo e o clique em seguida o reabria. Agora o toque decide, ao encostar, se abre ou fecha.
- c283b91: **`Typography` herda a cor do texto em volta.** Ela forçava `text-foreground`: sobre um fundo cheio (botão primário, status, linha selecionada) o texto saía escuro em vez de usar o `-foreground` da superfície. Agora não tem cor própria (só a `caption` continua `muted-foreground`); na página o resultado é o mesmo, porque o `body` já é `foreground`. Ganha também `data-slot="typography"`.
- 57fc305: **`Button` e `IconButton` ocupados não abrem menus.** Com `loading`, ou indisponíveis sem o `disabled` nativo (`asChild`, `IconButton` desabilitado), eles só ignoravam o clique. O `DropdownMenu` (e o `Select` do Radix) abrem no `pointerdown` e nas teclas Enter, Espaço e ↓, então um gatilho ocupado abria o menu do mesmo jeito: na `DataTable`, dava para exportar de novo com a primeira exportação ainda rodando. Agora o ponteiro e essas teclas também não fazem nada; o botão continua focável, e as outras teclas (Tab, Esc) chegam ao `onKeyDown`.
- 6f1ea68: **`"use client"` volta aos arquivos publicados.** O build descartava a diretiva, e num app com React Server Components (Next.js App Router) importar um componente da lib dentro de um Server Component quebrava. Os arquivos que contêm código de cliente voltam a declará-la; os helpers de `lib/*`, o `Breadcrumb`, o `Badge`, o `Skeleton` e a `Typography` continuam utilizáveis no servidor. Os três hooks (`useDebounce`, `useIsMobile`, `useCopyToClipboard`) passam a declarar a diretiva.

## 0.5.1

### Patch Changes

- 1ee321d: **formattedColumn**: deixa de emitir `sortingFn: undefined` e `enableSorting: undefined` quando as opções não são informadas. O TanStack Table monta a coluna com `{ ...defaults, ...columnDef }`, então a chave própria com valor `undefined` sobrescrevia o default `"auto"` e `getSortingFn()` passava a devolver `undefined`. Em tabelas com coluna ordenada e filtro/busca ativos, isso derrubava a página com `r.sortingFn is not a function`. Agora, sem `sortingFn`, a coluna volta a usar o comparador automático do TanStack, como a documentação da opção já descrevia. Quem passa `sortingFn`/`enableSorting` explícitos não é afetado.

## 0.5.0

### Minor Changes

- 8174bf9: **Combobox**: a busca passa a considerar o `label` das opções, além do `value`, e ignora acentos (`coracao` encontra `Coração`).

  - Vale para o modo normal e para o `creatable`, que usam o mesmo filtro. A busca é por trecho, sem o ranqueamento fuzzy do cmdk: a ordem das opções é mantida.
  - O `value` continua pesquisável.
  - A lista do dropdown não propaga o scroll para o container pai (página, Sheet ou Dialog) nem em desktop nem em toque.

  Sem mudança de tipos públicos.

- b725af6: **DataTable**: `downloadable.filename` aceita `(scope: "filtered" | "page" | "all") => string`, permitindo refletir filtros ativos ou a página atual no nome do `.xlsx`. String continua funcionando igual; retorno falsy cai no default `"export.xlsx"`. A função não deve lançar: uma exceção interrompe a exportação. O tipo `ExportScope` passa a ser exportado para anotar a função. `.xlsx` é acrescentado ao final quando o nome resolvido não termina em extensão de planilha ou CSV (`.xlsx`, `.xlsm`, `.xlsb`, `.xls`, `.csv`, `.ods`, `.txt`). Nomes com essas extensões são salvos como informados, como antes.
- 2386f31: **FileUpload**: nova prop `downloadable` (default `false`). Com `true`, o lightbox de imagem exibe o botão de download; sem ela, o lightbox continua só de visualização, como antes.
- 15e0bd3: **FileUpload**:

  - Nova prop `removable` (default `true`). Com `false`, o botão de remover some, mas a linha continua abrível e novos arquivos ainda podem ser adicionados pelo dropzone (append-only).
  - `ImageLightbox` ganha botão "Fechar" explícito e, com a prop `downloadable`, botão "Baixar imagem" (`showSaveFilePicker` com fallback `<a download>`; `AbortError` é ignorado).
  - O toast de sucesso aparece só quando o picker salva o arquivo. No fallback `<a download>` não há toast, porque o navegador não confirma o início do download.
  - O botão de download fica desabilitado durante o salvamento e cai no `<a download>` quando `showSaveFilePicker` lança `SecurityError` (ex.: iframe) ou `NotAllowedError` (política negada).
  - O foco inicial do lightbox vai para o botão "Fechar", para que Enter/Espaço imediato não dispare o download.
  - Novos labels opcionais: `imageDownload`, `imageDownloadSuccess`, `imageDownloadError`, `imageClose` (defaults pt-BR), sem quebrar quem tipa `FileUploadLabels` completo.

- 6ee1e2c: **Popover**:

  - Nova prop opcional `collisionPadding`, repassada ao `PopoverPrimitive.Content`, para manter uma distância mínima das bordas da viewport ao dar flip/shift. Sem a prop, o comportamento é o mesmo de antes (padrão do Radix).
  - Novas props `aria-label` e `aria-labelledby`, repassadas ao conteúdo para dar nome acessível ao popover.

- bc276c7: **Sidebar**:

  - Novas props `profileLabel` (default `"Editar perfil"`) e `profileIcon` (default `UserCog`) para o rótulo/tooltip do avatar e o ícone do botão de perfil.
  - Nova prop `onNameClick`: quando informada, o nome do usuário vira um botão.
  - `onSignOut` passa a ser opcional: sem ela o botão "Sair" e o diálogo de confirmação não são renderizados. Nesse caso a lib não oferece logout: o app precisa ter um fluxo próprio de saída.

  Sem mudança de comportamento para quem não usa as novas props.

## 0.4.1

### Patch Changes

- 5dd8b2b: Calendar: fix the quick-nav caption not opening on a real mouse click. The
  react-day-picker nav (prev/next arrows) is absolutely positioned full-width over
  the caption row, and its empty middle was intercepting clicks meant for the
  interactive caption ("julho 2026") — so the year/month panel only opened via
  keyboard/programmatic clicks, not a normal mouse click. The nav container now
  passes pointer events through (`pointer-events-none`) while the arrow buttons
  keep them (`pointer-events-auto`).

## 0.4.0

### Minor Changes

- c8e1f3b: Calendar: seleção rápida de ano e mês pelo título (estilo MUI DateCalendar). Clicar no caption ("julho 2026") abre uma grade de anos e depois de meses, posicionando o grid de dias direto no mês escolhido — sem navegar mês a mês. Ativo por padrão em `Calendar`, `DateInput` e `DateRangePicker` quando `captionLayout="label"` (o default); `captionLayout="dropdown"` mantém o comportamento nativo do react-day-picker. Com `startMonth`/`endMonth`, anos fora do intervalo não são listados e meses fora do limite ficam desabilitados. `Esc` cancela e volta para os dias.

## 0.3.0

### Minor Changes

- df68d2b: DataTable: optional `pagination.pageSizeOptions`

  Pass an array of page sizes (e.g. `[10, 20, 50, 100]`) and the footer
  renders a "Linhas por página" select next to the page indicator. Picking
  an option resets the cursor to page 0 (atomically, via `setPagination`)
  and propagates the new pageSize through `onPaginationChange` — works for
  both client- and manual-paginated tables. When `pageSizeOptions` is set
  but `pagination.pageSize` is omitted, the initial size defaults to the
  first option (instead of 10) so the `<select>` value always matches.
  New label `pageSize` is overridable via the `labels` prop and doubles
  as the accessible name (no separate `aria-label` — visible text equals
  accessible name, satisfying WCAG 2.5.3).

  Existing consumers that don't pass `pageSizeOptions` keep the previous
  footer shape (no select rendered).

## 0.2.1

### Patch Changes

- c5b1b16: Release 0.2.1 — Toggle, Sidebar rewrite, DataTable upgrades, form polish.

  Highlights since 0.2.0 (84 commits):

  - **Sidebar**: full rewrite with collapsible rail, contextual mode, brand
    click-back, profile menu, badges, and a `React.memo`'d item tree for
    consumers with many items.
  - **DataTable**: searchable, sortable, paginated, downloadable, row-level
    click + custom row className, row-count footer with custom labels.
  - **Toggle**: scaling interaction states aligned with Button.
  - **Combobox**: `showBadges` + `selectedCountLabel` for compact multi mode.
  - **DateInput / DateRangePicker / Calendar / TimePicker**: holiday-aware
    disabled-day calculation, range data-attributes, time-picker keyboard
    shortcuts, disabledDays forwarding, "Confirmar" action on range picker.
  - **Dialog**: stays open when click originates inside a nested popper.
  - **Input**: improved icon alignment, password leading/trailing icon fixes.
  - **Switch / Checkbox**: alignment tweaks when description is present.
  - **Label**: demoted to internal (was effectively redundant with FieldShell);
    not a publicly imported component anymore.
  - **formatCount**: default cap raised 999 → 9999.

  Pre-1.0 reminder: API additions are landing as patches in 0.2.x; the next
  breaking change will move the package to 0.3.x.

## 0.1.0

### Minor Changes

- 7aeb2f5: Initial documented release. See CHANGELOG.md "Unreleased" section for the full list of additions, fixes, and three breaking changes since v0.0.2 (Typography `display` variant removed in favor of `heading`; DataTable per-column `enableSorting` replaced by top-level `sortableColumns` whitelist; DateRangePicker `onChange` renamed to `onValueChange`).

All notable changes to `@amfernandesinc/ui` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Releases from this point forward are managed via [changesets](https://github.com/changesets/changesets).

## [Unreleased]

### ⚠ BREAKING CHANGES

- **`Typography`**: the `display` variant has been removed. Rename it to `heading`, which now resolves to `text-3xl` / 30px (down from `display`'s `text-4xl` / 36px). The remaining variants were also renamed and resized: `subtitle` is now `text-xl` (20px), a new `lead` variant lives at `text-base` (16px), and the standalone `label`/`mono`/`overline` variants are gone — apply those tones via `className` overrides on the matching size sibling.
- **`DataTable`**: per-column `enableSorting` is no longer honored. Pass `sortableColumns={[...columnIds]}` on the `<DataTable>` to whitelist which headers render the sort button. Tables that previously relied on the implicit "everything sortable" default must now opt in explicitly. The controlled `sorting` / `onSortingChange` props were also removed in a follow-up — sort state is internal-only; reintroduce controlled sort via a future `defaultSorting` prop if needed.
- **`DateRangePicker`**: `onChange` was renamed to `onValueChange` for parity with every other form control (`Combobox`, `MultiInput`, `CurrencyInput`, `PercentageInput`, `RadioGroup`, `InputOTP`, `FileUpload`, …). The callback signature is unchanged — it still receives a `{ from, to }` `DateRangeValue`. Inside react-hook-form `Controller`, only the prop name changes: `onValueChange={field.onChange}`.

### Added

#### Brazilian inputs and validators

- `CPFInput` — masked `000.000.000-00` input, emits 11 cleaned digits.
- `CNPJInput` — masked `00.000.000/0000-00` input, emits 14 cleaned digits.
- `CEPInput` — masked `00000-000` input, emits 8 cleaned digits.
- `PhoneInput` — dynamic mask `(00) 0000-0000` ↔ `(00) 00000-0000` based on digit count (fixo vs celular).
- `isValidCPF`, `isValidCNPJ`, `isValidCEP`, `isValidPhone` — pure validators in `@amfernandesinc/ui/lib/brazil`. Canonical Receita Federal modulo-11 DV checks; reject all-same-digit and out-of-range area codes.

#### i18n labels

- `labels?: Partial<XLabels>` prop on `DataTable`, `FileUpload`, `Combobox`, `CommandPalette`, and `Calendar`. All keys optional, pt-BR defaults preserved, per-instance override (no global Provider).
- Exported label types and default constants: `DataTableLabels` / `defaultDataTableLabels` (13 keys: loading, empty, pagination prev/next, row count formatter, page indicator, sort-by, export trigger + 3 menu items, search placeholder + aria-label), `FileUploadLabels` / `defaultFileUploadLabels` (17 keys), `ComboboxLabels` / `defaultComboboxLabels` (7 keys), `CommandPaletteLabels` / `defaultCommandPaletteLabels` (3 keys), `CalendarLabels` (reserved for future wrapper copy — `react-day-picker`'s `locale` prop still drives day/month names).
- One `English` / `CustomLabels` story per component demonstrating the override pattern.

#### Tokens and motion

- Tiered z-index scale exposed as CSS variables: `--z-overlay` (40), `--z-modal` (50), `--z-popover` (60), `--z-tooltip` (70), `--z-toast` (80). Replaces the hardcoded `999999999` Sonner default.
- Motion duration tokens: `--motion-fast` (100ms), `--motion-default` (150ms), `--motion-slow` (200ms), `--motion-slowest` (300ms). Wired through Tooltip/Popover/Dialog/AlertDialog/Sheet.
- Global `@media (prefers-reduced-motion: reduce)` override so motion-sensitive users get effectively-instant transitions.
- `--font-mono` token (Geist Mono) applied to `InputOTP` slots (`font-mono` + `tabular-nums`) plus `tabular-nums` on `CurrencyInput` / `PercentageInput`.

#### Fonts

- Self-hosted Geist + Geist Mono via `@fontsource/geist` and `@fontsource/geist-mono` (only weights 400/500/600/700 sans, 400/500 mono). Drops Google Fonts CDN dependency (LGPD + render-blocking).
- Geist replaces the previous Google Sans Flex tagline as the default `--font-sans`.

#### DataTable improvements

- `loading` prop — replaces body rows with skeleton cells (count = `pagination.pageSize ?? 5`, rotating widths), swaps search input and footer for skeletons, disables pagination, sets `aria-busy="true"`.
- `downloadable` prop — renders an "Exportar para Excel" ghost button; opens a popover with three scopes (filtered / current page / all rows), each producing an `.xlsx` via lazy-imported `xlsx`. Accepts `boolean` or an object with `filename`, `sheetName`, `rowToRecord`.
- pt-BR thousands separator on `defaultRowCount` — large counts now render as "1.832 registros" via `Intl.NumberFormat("pt-BR")`.
- `onRowClick` + `rowClassName` props for interactive rows with inset focus rings.
- `dateColumn()` helper — dd/MM/yyyy auto-format plus timestamp-based `sortingFn` (handles BR strings, ISO, `Date` objects, epoch millis).
- New `Data/Table` simple story showcasing the `tableStyles()` helper for plain `<table>` markup.

#### DX and types

- Every public component now ships a typed `*Props` export: `CalendarProps`, `ProgressProps`, `SkeletonProps`, `ToasterProps`, `ScrollAreaProps`, `ScrollBarProps`, `LabelProps`. The internal `Label` used by `FieldShell` is renamed to `InternalLabelProps` to avoid collision.
- `asChild?: boolean` on `Badge` and `Label` (via `@radix-ui/react-slot`), matching the `Button` pattern. Lets consumers render as a `Link`, custom button, or arbitrary child while keeping the visual class set.
- Orphan types and values exported from the barrel: `DataTableDownloadable`, `DisabledDayPreset`, `DisabledDays`, `TypographyAs`, `ScrollBar`.
- `displayName` set on 10 previously-missing components: `Image`, `ScrollArea`, `Tree`, `Video`, `Progress`, `Toaster`, `Badge`, `Label`, `Skeleton`, `Typography`.
- `formatCount(count, max = 999)` helper for notification-style counter badges. Handles negative / NaN / Infinity / fractional inputs; renders `${max}+` past the cap.
- `Popover` exposes Radix outside-interaction callbacks: `onInteractOutside`, `onPointerDownOutside`, `onFocusOutside`, `onEscapeKeyDown` (types derived from `React.ComponentProps<typeof PopoverPrimitive.Content>`).
- Sidebar collapsible submenu with per-item `defaultOpen` flag.

#### Packaging

- Per-component subpath exports — `import { Button } from "@amfernandesinc/ui/button"` and pay only for what you use. The `exports` map grew from 3 entries to 53 (one per component + hooks + `lib/*` helpers + `./package.json`).
- `tsup` configured with `splitting: true` so shared helpers (`cn`, `cva`, `FieldShell`, `useFieldIds`, Radix re-exports) live in `chunk-*.js` and are deduped instead of inlined per entry. `sourcemap: false` drops ~354KB of `.map` files from the tarball — published size ~514KB → ~260KB.
- Subpath exports added for the Brazilian inputs and `./lib/brazil`.

### Changed

#### Spacing and density

- Inputs: vertical padding bumped to `py-3` across `Input`, `Textarea`, `CurrencyInput`, `PercentageInput`, `MultiInput`, `TimePicker`. Fixed `h-9` / `h-11` heights dropped — box height now flows from padding.
- `DateInput` trigger: aligned to `px-3 py-3`, no fixed height (matches sibling inputs).
- `Button`: `default` size goes `px-4` → `px-3` so buttons sit flush with inputs; `lg` size goes `px-8` → `px-6` (enterprise tooling, not landing-page hero).
- `DataTable`: cells move from `px-4 py-4` to `px-3 py-2.5`; footer gains `px-3` so its padding lines up with cells.
- Menu / tab / sidebar / tree rows unified at `py-1.5` (Tabs trigger: `py-1` → `py-1.5`).
- `space-y-*` swapped for `flex flex-col gap-*` on DataTable and FileUpload wrappers (matches the rest of the lib).
- `FileUpload` list rows: `px-3 py-2` → `px-2 py-1.5` (menu-item pattern).
- Icon spacing: `mr-*` margins removed inside `<Button>` (its base variant already declares `gap-2`); other flex parents gain `gap-2`/`gap-1` and lose per-icon margin (Combobox, CommandPalette, DateInput, DateRangePicker).

#### Tokens

- `--radius` flattened to `0.25rem` (4px) — every `--radius-{sm,md,lg,xl,2xl,3xl,4xl}` resolves to the same value. `rounded-full` is unaffected.
- Placeholder color routed through `--input` (the border color) — inputs, textareas, time picker, combobox, command palette all switch `placeholder:text-muted-foreground` → `placeholder:text-input`. The standalone `--placeholder` token introduced during the contrast pass was rolled back in favor of this unified low-emphasis tone.

#### Motion language

- Killed `transition-all` (anti-pattern: animates every property). `InputOTP` slot, Accordion trigger, Tabs trigger → `transition-colors`. Progress indicator → `transition-[width]`.
- Removed orphan `transition-[color]` from ScrollArea viewport.
- Chevron rotations normalized to default 150ms across Accordion, Sidebar, Tree (Accordion and Sidebar previously hardcoded `duration-200`).
- Added `transition-colors` to Tree rows, Sidebar menu items, Combobox options, CommandPalette items, and DataTable filter rows so every hoverable row in the lib feels consistent.
- Dialog backdrop and content both run at `--motion-slow` (backdrop was silently 150ms — desynced from 200ms content). Legacy slide classes (`slide-in-from-left-1/2`, `slide-in-from-top-[48%]`) dropped — dialogs are now pure fade + zoom-95.
- Sheet open and close both `--motion-slowest` (was asymmetric 500/300). Removes dead `ease-in-out` class.
- Tooltip gains `zoom-in-95` / `zoom-out-95` for parity with Popover.

### Fixed

#### Accessibility

- Sidebar disabled links are no longer keyboard-focusable or clickable (drop `href`, `tabIndex={-1}`, `aria-disabled`, `pointer-events-none`, intercept `onClick`). Active items announce `aria-current="page"` (links) / `"true"` (buttons).
- DataTable: inserts `sr-only role="status"` "Carregando dados…" during loading so VoiceOver/NVDA pick up the state transition. Empty-state text wrapped in `role="status" aria-live="polite"` so filter changes that flip row count to zero are announced.
- FileUpload: camera "Iniciando câmera…" wrapper gains `role="status"`.
- DateRangePicker trigger now mirrors `DateInput` (`aria-label`, `aria-describedby` via `useFieldIds`).
- TimePicker hour/minute inputs receive `aria-invalid` and `aria-describedby` pointing at FieldShell's error/description ids.
- InputOTP forwards `aria-invalid` and `aria-describedby` to OTPInput.
- CurrencyInput and PercentageInput forward `required` and `aria-required` to the underlying `<input>` (previously only the visual asterisk was set).

#### Contrast (WCAG AA hardening)

- `--destructive`: oklch(.628 .258 29.2) → oklch(.55 .19 29.2). Pure red (#ff0000) failed 4.5:1 on white text and on white background; the new deep red (#c93125) clears AA at 5.33:1.
- `--info`: oklch(.668 .151 236.3) → oklch(.5 .15 236.3). Light blue failed at 2.93:1 on white; the new corporate blue (#006cac) clears AA at 5.61:1.
- (Interim) introduced a `--placeholder` token at 4.85:1 on white, then folded the same role into `--input` — see _Changed → Tokens_ above.
- Drops the `color-contrast` a11y override on the `Typography` `WithClassName` story (the underlying issue is now fixed).

#### Focus rings (2-tier system finalized)

- **Tier 1 (fields)** — single rule across `Input`, `Textarea`, `CurrencyInput`, `PercentageInput`, `MultiInput`: `focus-within:border-primary focus-within:ring-1 focus-within:ring-ring`. Error state collapses to persistent red border + red ring on focus (previously three different behaviors).
- **Tier 2 (active controls)** — `Sheet` close button (was missing both `ring-ring` and `ring-offset-2` — rendered colorless ring), `Dialog` close button, Collapsible trigger, FileUpload thumbnail all gain `ring-offset-2`.
- RadioGroup migrated from Radix-v2 soft ring (`ring-[3px] ring-ring/50`) to the Tier 2 standard.
- ScrollArea viewport moved to Tier 1 (`ring-1`) — it's a content surface, not a control.
- DataTable interactive rows gain an inset focus ring (`focus-visible:ring-2 ring-ring ring-inset`) — the previous `focus-visible:bg-muted/60` was invisible against zebra stripes or hovered backgrounds.

#### Disabled state

- FieldShell wrapper and Label peer-disabled normalized to `opacity-50` (was `opacity-60` and `opacity-70` respectively).
- Removed inner `disabled:opacity-50` duplication on `Input`, `Textarea`, `MultiInput`, `TimePicker`, `CurrencyInput`, `PercentageInput` — FieldShell is now the sole owner of the visual fade (was compounding to 0.25 effective opacity).
- DateInput dropped `bg-muted` on disabled — every other field just fades; DateInput was the lone outlier painting a grey background.

#### Interactivity (post-Tailwind-v4 Preflight regression)

- Tailwind v4 dropped the default `cursor: pointer` on `<button>` — every Button in the lib was rendering the default arrow on hover. Restored on `Button` base (covers all variants), `Checkbox`, `RadioGroup` (parity with `Switch`), DataTable filter menu items + sort header, Combobox tag close + clear-all wrappers, Sidebar item base, Sheet/Dialog close buttons, Collapsible trigger.
- Hover semantics: Tabs inactive triggers gain `hover:bg-background/50` (previously no hover feedback). Combobox tag close switches to `hover:bg-secondary-foreground/20` for visible feedback over the `bg-muted` Badge. Combobox clear-all gains wrapper hover (was relying on icon-pixel-only `hover:opacity-100`). DataTable sort header gains `transition-colors` for smooth hover.

#### DateRangePicker

- Popover no longer closes prematurely while clicking inside the Calendar grid. Uses the new Popover `onInteractOutside` / `onFocusOutside` callbacks to detect clicks on `role="grid"`, `.rdp`, or `.rdp-root` and keep itself open.

### Removed

- Standalone Typography variants `label`, `mono`, `overline` — folded into same-size siblings; use `className` to apply the tonal overrides.
- `DataTable` `sorting` / `onSortingChange` controlled props (see _Breaking Changes_).
- Per-column `enableSorting` flag on DataTable columnDefs (see _Breaking Changes_).
- `bg-muted` disabled background on `DateInput`.
- Inline `disabled:opacity-50` rules on fields wrapped by FieldShell.
- Hardcoded Sonner `zIndex: 999999999` (now uses `var(--z-toast)`).
- `transition-all` from `InputOTP` slot, Accordion trigger, Tabs trigger.
- `transition-[color]` from ScrollArea viewport.
- Fixed `h-9` / `h-11` heights on input wrappers.
- The dead `ease-in-out` transition class on Sheet (never affected `@keyframes`).
- `sourcemap` output from the published tarball (~354KB saved).

### Internal

- `scripts/oklch-contrast.ts` — one-shot OKLCH → WCAG audit utility for verifying contrast ratios when tweaking the palette.
- `vitest.config.ts` — added `docs/**` to the exclude list so the component-template skeleton isn't run as a real test.
- New `CONTRIBUTING.md` (pt-BR) and `docs/component-template/` (copy-paste skeleton for a new field component).
- New `src/docs/FormIntegration.mdx` + `src/docs/_examples/rhf-form.stories.tsx` — Storybook page documenting react-hook-form integration (controlled-vs-uncontrolled audit, Controller recipes, error wiring, zod snippet, pitfalls).

### Migration guide

- **Typography**: `variant="display"` → `variant="heading"` (note: this also shrinks from 36px to 30px). If you specifically need 36px, set the size via `className` on `variant="heading"`.
- **DataTable sorting**: remove `enableSorting: false` from your `columnDef`s and pass `sortableColumns={["columnId", ...]}` on the `<DataTable>`. Drop any external `sorting` / `onSortingChange` wiring — sort state is now internal.
- **DateRangePicker**: rename the prop. `<DateRangePicker onChange={fn} />` → `<DateRangePicker onValueChange={fn} />`. Inside react-hook-form `Controller`: `onChange={field.onChange}` → `onValueChange={field.onChange}`.

## [0.0.2] — 2026-05-19

Initial private release. Subsequent history is tracked above.

[Unreleased]: https://github.com/am-fernandes/ui/compare/v0.0.2...HEAD
[0.0.2]: https://github.com/am-fernandes/ui/releases/tag/v0.0.2
