---
"@amfernandesinc/ui": minor
---

**Paleta do grupo.** As cores passam a sair do marinho que AM Fernandes e Ponto Forte dividem: neutros na escala Grafite (o matiz do marinho, quase sem saturação) e primária no marinho-950. Todos os valores mudaram nos dois temas; os nomes dos tokens que já existiam continuam os mesmos.

- **Novos tokens:** `--primary-hover`, `--primary-pressed`, `--subtle-foreground` (terceiro nível de texto), `--link`, `--selection`, `--selection-foreground`, `--border-strong`, `--destructive-text`, `--chart-6`, `--chart-seq-1` a `-5` e `--chart-div-1` a `-7`, com as classes correspondentes (`text-link`, `text-subtle-foreground`, `border-border-strong`, `text-destructive-text`…).
- **Texto em três níveis:** `--foreground`, `--muted-foreground` e `--subtle-foreground`. O placeholder usa o terceiro. No escuro o texto principal desce para o grafite-200, sem o branco puro.
- **Borda de campo a 3:1 ou mais** (`--input`).
- **Status:** erro e informação são os do clique-estoque; o alerta é um ouro com texto escuro e o sucesso, um verde puxado para o azul. Cada um fica numa luminosidade, para se distinguirem também sob daltonismo.
- **Categorias** (`--category-*`): as nove continuam, com croma baixo e uma luminosidade para cada sólido.
- **Gráficos:** três paletas em vez de cinco cores soltas. `--chart-1` a `--chart-6` (categórica, sempre nesta ordem), `--chart-seq-*` (sequencial, um matiz) e `--chart-div-*` (divergente, vermelho e marinho em torno de um neutro).
- **Tema escuro:** página grafite-950, superfícies 900 e camadas flutuantes 850; o item ativo usa o marinho-700, a cor das marcas.
- `::selection` passa a usar a paleta.

**Telas do app mudam:** todas as cores mudam de valor. `--chart-2` a `--chart-5` mudaram de matiz: confira gráficos que dependiam de uma cor específica. `--accent` deixou de ser um cinza e agora é o azul do item selecionado: onde era usado como fundo neutro, troque por `--muted`.
