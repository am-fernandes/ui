---
"@amfernandesinc/ui": minor
---

**`Tabs` ganha `keepMounted`.** Um painel inativo era sempre desmontado, com ou sem `lazy`: formulário, filtros de tabela ou upload dentro de uma aba zeravam a cada troca. Com `keepMounted`, os painéis ficam no DOM, escondidos, e guardam o que têm. `lazy` passa a valer junto com ele: monta cada painel só na primeira visita e o mantém depois. Sem `keepMounted` nada muda (só o painel ativo existe); a documentação que atribuía ao `lazy` esse comportamento foi corrigida.
