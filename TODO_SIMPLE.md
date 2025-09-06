# Lista de Tarefas — Entradas Individuais

Ficheiro de acompanhamento com as subtarefas individuais extraídas do `TODO.md`. Cada item abaixo é independente e pode ser atacado separadamente. Mantenha `Status`, `Responsável` e `Atualizado` atualizados.

## Como usar

- Edite o `Status` para 📋 TODO / 🔄 IN_PROGRESS / ✅ DONE.
- Registe `Atualizado` com data (YYYY-MM-DD) quando alterar o status.
- Adicione `Notas` curtas para contexto ou links para issues/PRs.

## Template de tarefa

- ID: (ex: 1.1)
- Título: Curto e descritivo
- Prioridade: 🔴 Alta / 🟡 Média / 🟢 Baixa
- Status: 📋 TODO / 🔄 IN_PROGRESS / ✅ DONE
- Responsável:
- Estimativa: (opcional)
- Atualizado: (YYYY-MM-DD)
- Notas:

---

## Tarefas (cada entrada é tratada individualmente)

1.1 - Unificar configuração do ESLint

- Prioridade: 🔴 Alta
- Status: ✅ DONE
- Responsável:
- Atualizado: 2025-09-06
- Notas: Consolidei as regras em `eslint.config.js` e removi `.eslintrc.cjs`. Testes locais: `npm install`, `npm run build` e `npm start` executaram (build com avisos de a11y no Svelte; app Electron arrancou). Não foram encontrados erros de runtime relacionados ao ESLint.

  1.2 - Corrigir inconsistência nos eventos Socket.IO

- Prioridade: 🔴 Alta
- Status: ✅ DONE
- Atualizado: 2025-09-06
- Notas: Substituído cast inseguro por `EVENTS.UPDATE_QUESTION` em `src/client/services/socket.ts` e mantidos tipos em `src/types/global-types.ts`.

  1.2.1 - Encapsular emits em ClientApi / ServerApi (API de eventos)

- Prioridade: 🔴 Alta
- Status: ✅ DONE
- Atualizado: 2025-09-06
- Notas: Criado `src/client/services/socket-api.ts` e migrado `HostView.svelte` para usar `ClientApi.*` em vez de emits espalhados. Execute `npx prettier --write . && npm install && npm run build && npm start` para validar.

  1.2.2 - Migrar emits server-side para ServerApi

- Prioridade: 🔴 Alta
- Status: ✅ DONE
- Atualizado: 2025-09-06
- Notas: Criado `src/server/services/server-api.ts` e atualizado `src/server/socket/handler.ts` para usar `ServerApi.*` em vez de `io.emit`/`socket.emit` direta.

  1.3 - Evento explícito para limpeza de sessão (SESSION_CLEARED)

- Prioridade: 🟡 Média
- Status: 📋 TODO
- Notas: Emitir do servidor quando anfitrião avança a pergunta.

  2.1 - Componentização da Interface do Cliente

- Prioridade: 🟡 Média
- Status: ✅ DONE
- Atualizado: 2025-09-06
- Notas: Componentização completa realizada: `ElectronControls.svelte` e `Respostas.svelte` criados e totalmente funcionais. Todas as responsabilidades foram adequadamente separadas entre componentes especializados.

  2.1.1 - HostView: extrair ElectronControls

- Prioridade: 🟡 Média
- Status: ✅ DONE
- Atualizado: 2025-09-06
- Notas: Extraído `ElectronControls.svelte` com lógica completa de Electron auto-encapsulada. Controles, detecção, auto-resize e gestão de estado movidos do `HostView.svelte`. Build e funcionalidade verificados.

  2.1.2 - HostView: extrair RespostaGraficoItem

- Prioridade: 🟡 Média
- Status: ✅ DONE
- Atualizado: 2025-09-06
- Notas: Criado componente `Respostas.svelte` que encapsula toda a lógica de visualização, ordenação, seleção (incluindo múltipla com Ctrl+Click) e drag-and-drop. CSS modularizado em `respostas.css`. Layout das barras corrigido.

  2.1.3 - ParticipantView: extrair RespostaItem

- Prioridade: 🟡 Média
- Status: ✅ DONE
- Atualizado: 2025-09-06
- Notas: Extraído componente `RespostaItem.svelte` do `ParticipantView.svelte` com CSS modularizado em `resposta-item.css`. Backup criado com sufixo `.old`. Lógica de edição e remoção movida para o componente (encapsulamento adequado), mantendo acessibilidade (role, tabindex, keyboard events) e animações. Interface simplificada: ParticipantView apenas recebe `onEditStart` callback. Testado com sucesso: `npx prettier --write . && npm install && npm run build && npm start`.

  2.1.4 - Otimizar interface do componente Respostas

- Prioridade: 🟢 Baixa
- Status: ✅ DONE
- Atualizado: 2025-09-06
- Notas: Simplificada interface do `Respostas.svelte` removendo props não utilizadas (`dndItems`, `respostaDestacada`, `ordenarPor`, `onToggleOrdenar`, `handleDestacar`). Consolidada lógica de ordenação internamente eliminando duplicação (`localOrdenarPor`). Componente agora gerencia completamente seu estado interno (seleção, ordenação, DnD). Interface reduzida para apenas 4 props essenciais. Testado com sucesso: funcionalidades mantidas, código mais limpo e manutenível.

  2.1.4 - Implementar seleção múltipla de respostas (Ctrl+Click)

- Prioridade: 🟡 Média
- Status: ✅ DONE
- Atualizado: 2025-09-06
- Notas: Implementada funcionalidade de seleção múltipla usando Ctrl+Click no componente `Respostas.svelte`. Lógica encapsulada internamente com visual unificado (mesma cor para seleção única e múltipla). Funcionalidade testada e validada.

  2.2 - Implementar autoResizeHeight (Electron main)

- Prioridade: 🟡 Média
- Status: 📋 TODO
- Notas: Implementar em `src/server/main.ts` e expor via preload se necessário.

  2.3 - Remover duplicação de CSS em `host.css`

- Prioridade: 🟢 Baixa
- Status: ✅ DONE
- Atualizado: 2025-09-06
- Notas: Consolidada duplicação em `src/client/components/host.css` e criado `respostas.css` modular. CSS das barras do gráfico corrigido para altura adequada (30px), largura responsiva e texto visível.

  2.4 - Corrigir layout e aparência das barras do gráfico de respostas

- Prioridade: 🟡 Média
- Status: ✅ DONE
- Atualizado: 2025-09-06
- Notas: Corrigidos problemas de altura excessiva das barras, largura não responsiva e texto invisível. CSS modularizado em `respostas.css` com override de estilos globais de botões. Visual agora funciona corretamente.

  3.1 - Projeto Multi-Sala: separar nome de exibição e roomId

- Prioridade: 🔴 Alta
- Status: 📋 TODO

  3.2 - Projeto Multi-Sala: criar RoomState e RoomManager

- Prioridade: 🔴 Alta
- Status: 📋 TODO

  3.3 - Projeto Multi-Sala: adaptar handlers Socket.IO para roomId

- Prioridade: 🔴 Alta
- Status: 📋 TODO

  3.4 - Projeto Multi-Sala: UI para criar/juntar sala e QR com roomId

- Prioridade: 🔴 Alta
- Status: 📋 TODO

  4.1 - Layout a 100% no Electron (CSS)

- Prioridade: 🟡 Média
- Status: ✅ DONE
- Atualizado: 2025-09-06
- Notas: Implementado CSS específico para Electron com `body.electron-host` que força layout a 100% da janela. Os containers principais (`#host-view`, `#respostas-container`, `.respostas-list`) agora usam flex e preenchem toda a janela. Testado com sucesso: `npx prettier --write . && npm install && npm run build && npm start`.

  4.2 - Implementar Modo Bolha (minimizar para bolha always-on-top)

- Prioridade: 🟡 Média
- Status: 📋 TODO

  4.3 - Implementar temas Claro/Escuro

- Prioridade: 🟡 Média
- Status: 📋 TODO

  4.4 - Modo de foco para QR Code (lightbox)

- Status: ✅ DONE
- Notas: Implementado modo de foco (lightbox) no `InfoPanel.svelte` com suporte a teclado (Escape para fechar), foco automático e estilos em `info.css`. Testado localmente (build em progresso abaixo).

  5.1 - Adicionar suporte i18n (avaliar svelte-i18n)

- Prioridade: 🟡 Média
- Status: 📋 TODO

  6.1 - Modo Semi-Anónimo (pseudónimos)

- Prioridade: 🟡 Média
- Status: 📋 TODO

  6.2 - Limite de respostas por participante

- Prioridade: 🟡 Média
- Status: 📋 TODO

  6.3 - Temporizador para submissão (host-defined)

- Prioridade: 🟢 Baixa
- Status: 📋 TODO

  7.1 - Modo de jogo: marcar respostas corretas

- Prioridade: 🟡 Média
- Status: 📋 TODO

  7.2 - Modo de jogo: sistema de pontuação no backend

- Prioridade: 🟡 Média
- Status: 📋 TODO

  7.3 - Modo de jogo: criar Leaderboard UI e evento UPDATE_LEADERBOARD

- Prioridade: 🟡 Média
- Status: 📋 TODO

  8.1 - Exportar resultados da sessão (CSV/TXT)

- Prioridade: 🟢 Baixa
- Status: 📋 TODO

  8.2 - Botão para copiar todas as respostas

- Prioridade: 🟢 Baixa
- Status: ✅ DONE
- Atualizado: 2025-09-06
- Notas: Adicionado botão no `HostView.svelte` que copia todas as respostas (texto + contagem) para a área de transferência em formato TSV (Resposta\tContagem).

  8.3 - Visualização em nuvem de palavras

- Prioridade: 🟢 Baixa
- Status: 📋 TODO

  8.4 - Revelação sequencial de respostas (mostrar uma a uma)

- Prioridade: 🟢 Baixa
- Status: ✅ DONE
- Atualizado: 2025-09-06
- Notas: Implementação completa com botão composto de sobreposição transparente sobre o botão original "Revelar Respostas". Funcionalidades: 🏆 revelar melhor resposta (incremental), 🎲 revelar resposta aleatória (incremental), 📝 revelar todas (comportamento original). CSS com sobreposição transparente, altura fixa 40px e linhas de separação alinhadas. Bloqueio automático de cancelamento dos participantes quando inicia modo sequencial. Limpeza adequada de estado na função "Próxima Pergunta". Testado com sucesso em modo desenvolvimento.

  9.1 - Permitir que o Electron se ligue a um servidor remoto

- Prioridade: 🟡 Média
- Status: 📋 TODO

  10.1 - Preparar scripts de deployment / render.yaml

- Prioridade: 🟡 Média
- Status: 📋 TODO

  10.2 - Criar workflow de CI (GitHub Actions)

- Prioridade: 🟡 Média
- Status: 📋 TODO

  10.3 - Integrar SonarCloud e adicionar `sonar-project.properties`

- Prioridade: 🟡 Média
- Status: 📋 TODO

  11.1 - Alterar licença para GNU GPL v3 (se confirmado)

- Prioridade: 🟢 Baixa
- Status: 📋 TODO

  11.2 - Atualizar README.MD (eventos e versão Node)

- Prioridade: 🟢 Baixa
- Status: 📋 TODO

  11.3 - Alinhar versão do Node.js em `package.json`
  - Status: ✅ DONE
  - Notas: Corrigida a entrada `engines.node` em `package.json` removendo espaço extra e normalizando a constraint para `>=24.7.0`.

Última atualização: 2025-09-06
