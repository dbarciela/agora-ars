# **Plano de Implementação para o Projeto Agora**

Este documento consolida todas as análises, correções e sugestões de funcionalidades para o projeto "Agora". O objetivo é servir como um roteiro para futuras iterações de desenvolvimento, organizado por prioridade e área de impacto.

## **Índice**

1. [Correções Críticas e Boas Práticas](https://www.google.com/search?q=%231-corre%C3%A7%C3%B5es-cr%C3%ADticas-e-boas-pr%C3%A1ticas)
   - [1.1. Unificar Configuração do ESLint](https://www.google.com/search?q=%2311-unificar-configura%C3%A7%C3%A3o-do-eslint)
   - [1.2. Corrigir Inconsistência nos Eventos Socket.IO](https://www.google.com/search?q=%2312-corrigir-inconsist%C3%AAncia-nos-eventos-socketio)
   - [1.3. Criar um Evento Explícito para Limpeza de Sessão](https://www.google.com/search?q=%2313-criar-um-evento-expl%C3%ADcito-para-limpeza-de-sess%C3%A3o)
2. [Refatorização e Qualidade de Código](https://www.google.com/search?q=%232-refatoriza%C3%A7%C3%A3o-e-qualidade-de-c%C3%B3digo)
   - [2.1. Componentização da Interface do Cliente](https://www.google.com/search?q=%2321-componentiza%C3%A7%C3%A3o-da-interface-do-cliente)
   - [2.2.](https://www.google.com/search?q=%2322-implementar-l%C3%B3gica-para-autoresizeheight) Implementar Lógica para autoResizeHeight
   - [2.3. Remover Duplicação de CSS](https://www.google.com/search?q=%2323-remover-duplica%C3%A7%C3%A3o-de-css)
3. [Arquitetura Futura: Sistema Multi-Sala](https://www.google.com/search?q=%233-arquitetura-futura-sistema-multi-sala)
   - [3.1. Implementar Sistema Multi-Sala ("Ágoras")](https://www.google.com/search?q=%2331-implementar-sistema-multi-sala-%C3%A1goras)
4. [Melhorias na Experiência do Anfitrião (UX)](https://www.google.com/search?q=%234-melhorias-na-experi%C3%AAncia-do-anfitri%C3%A3o-ux)
   - [4.1.](https://www.google.com/search?q=%2341-layout-a-100-da-janela-no-electron) Layout a 100% da [Janela no Electron](https://www.google.com/search?q=%2341-layout-a-100-da-janela-no-electron)
   - [4.2. Minimizar Aplicação para "Modo Bolha"](https://www.google.com/search?q=%2342-minimizar-aplica%C3%A7%C3%A3o-para-modo-bolha)
   - [4.3. Implementar Temas de Cor (Claro/Escuro)](https://www.google.com/search?q=%2343-implementar-temas-de-cor-claroescuro)
   - [4.4. Modo de Foco para QR Code](https://www.google.com/search?q=%2344-modo-de-foco-para-qr-code)
5. [Internacionalização (i18n)](https://www.google.com/search?q=%235-internacionaliza%C3%A7%C3%A3o-i18n)
   - [5.1. Adicionar Suporte para Múltiplos Idiomas](https://www.google.com/search?q=%2351-adicionar-suporte-para-m%C3%BAltiplos-idiomas)
6. [Novas Funcionalidades para Controlo da Sessão](https://www.google.com/search?q=%236-novas-funcionalidades-para-controlo-da-sess%C3%A3o)
   - [6.1. Modo de Sessão Semi-Anónimo (Pseudónimos)](https://www.google.com/search?q=%2361-modo-de-sess%C3%A3o-semi-an%C3%B3nimo-pseud%C3%B3nimos)
   - [6.2. Limite de Respostas por Participante](https://www.google.com/search?q=%2362-limite-de-respostas-por-participante)
   - [6.3. Temporizador para Submissão](https://www.google.com/search?q=%2363-temporizador-para-submiss%C3%A3o)
7. [Modos de Jogo e Gamificação](https://www.google.com/search?q=%237-modos-de-jogo-e-gamifica%C3%A7%C3%A3o)
   - [7.1. Implementar Modo de Jogo com Pontuação e Leaderboard](https://www.google.com/search?q=%2371-implementar-modo-de-jogo-com-pontua%C3%A7%C3%A3o-e-leaderboard)
8. [Novas Funcionalidades de Visualização e Exportação](https://www.google.com/search?q=%238-novas-funcionalidades-de-visualiza%C3%A7%C3%A3o-e-exporta%C3%A7%C3%A3o)
   - [8.1. Exportar Resultados da Sessão](https://www.google.com/search?q=%2381-exportar-resultados-da-sess%C3%A3o)
   - [8.2. Botão para Copiar Todas as Respostas](https://www.google.com/search?q=%2382-bot%C3%A3o-para-copiar-todas-as-respostas)
   - [8.3. Visualização em "Nuvem de Palavras"](https://www.google.com/search?q=%2383-visualiza%C3%A7%C3%A3o-em-nuvem-de-palavras)
   - [8.4. Revelação Sequencial de Respostas](https://www.google.com/search?q=%2384-revela%C3%A7%C3%A3o-sequencial-de-respostas)
9. [Arquitetura e Flexibilidade](https://www.google.com/search?q=%239-arquitetura-e-flexibilidade)
   - [9.1. Permitir que a Aplicação Electron se Ligue a um Servidor Remoto](https://www.google.com/search?q=%2391-permitir-que-a-aplica%C3%A7%C3%A3o-electron-se-ligue-a-um-servidor-remoto)
10. [CI/CD, Qualidade e Distribuição](https://www.google.com/search?q=%2310-cicd-qualidade-e-distribui%C3%A7%C3%A3o)
    - [10.1. Preparar o Servidor para Deployment em Plataformas](https://www.google.com/search?q=%23101-preparar-o-servidor-para-deployment-em-plataformas)
    - [10.2. Configurar Pipeline de CI com GitHub Actions](https://www.google.com/search?q=%23102-configurar-pipeline-de-ci-com-github-actions)
    - [10.3. Integração com SonarCloud para Análise de Código](https://www.google.com/search?q=%23103-integra%C3%A7%C3%A3o-com-sonarcloud-para-an%C3%A1lise-de-c%C3%B3digo)
11. [Documentação e Manutenção](https://www.google.com/search?q=%2311-documenta%C3%A7%C3%A3o-e-manuten%C3%A7%C3%A3o)
    - [11.1. Alterar Licença para GNU GPL v3](https://www.google.com/search?q=%23111-alterar-licen%C3%A7a-para-gnu-gpl-v3)
    - [11.2. Atualizar a Documentação (README.MD)](https://www.google.com/search?q=%23112-atualizar-a-documenta%C3%A7%C3%A3o-readmemd)
    - [11.3. Alinhar Versão do Node.js](https://www.google.com/search?q=%23113-alinhar-vers%C3%A3o-do-nodejs)

## **1\. Correções Críticas e Boas Práticas**

Estas tarefas são de **alta prioridade**, pois corrigem inconsistências, melhoram a robustez e alinham o projeto com as melhores práticas.

### **1.1. Unificar Configuração do ESLint**

- **Descrição:** O projeto contém dois ficheiros de configuração (.eslintrc.cjs e eslint.config.js). É necessário unificar toda a configuração no ficheiro moderno eslint.config.js e remover o antigo .eslintrc.cjs.
- **Justificação:** Evita confusão e garante que uma única fonte de verdade é utilizada para as regras de _linting_.
- **Ficheiros Afetados:** .eslintrc.cjs (remover), eslint.config.js (manter/atualizar).
- **Prioridade:** Alta

### **1.2. Corrigir Inconsistência nos Eventos Socket.IO**

- **Descrição:** O cliente (socket.ts) está a escutar o evento 'atualizarPergunta' usando um _cast_ as any, o que anula a segurança de tipos. É necessário refatorizar para usar a constante EVENTS.UPDATE_QUESTION definida em events.ts. O tipo em global-types.ts também deve ser alinhado.
- **Justificação:** Garante a segurança de tipos de ponta a ponta na comunicação via WebSocket, prevenindo erros e facilitando a manutenção.
- **Ficheiros Afetados:** src/client/services/socket.ts, src/types/global-types.ts.
- **Prioridade:** Alta

### **1.3. Criar um Evento Explícito para Limpeza de Sessão**

- **Descrição:** Em vez de o cliente inferir que uma nova ronda começou quando a sua lista de respostas fica vazia, o servidor deve emitir um evento explícito (ex: SESSION_CLEARED) quando o anfitrião clica em "Próxima Pergunta".
- **Justificação:** Torna a comunicação entre cliente e servidor mais explícita e robusta, evitando lógicas implícitas que podem falhar em cenários inesperados.
- **Ficheiros Afetados:** src/server/socket/handler.ts, src/client/components/ParticipantView.svelte, src/types/events.ts, src/types/global-types.ts.
- **Prioridade:** Média

## **2\. Refatorização e Qualidade de Código**

Estas tarefas de **média prioridade** são cruciais para a manutenibilidade e escalabilidade do projeto a longo prazo.

### **2.1. Componentização da Interface do Cliente**

- **Descrição:** Refatorar os componentes monolíticos HostView.svelte e ParticipantView.svelte, extraindo elementos complexos da UI para os seus próprios componentes dedicados.
- **Justificação:** A componentização é um dos pontos fortes do Svelte. Componentes mais pequenos e focados são mais fáceis de entender, modificar, depurar e reutilizar. Esta refatoração irá limpar drasticamente os componentes principais e isolar a lógica e o estilo de cada elemento.
- **Sugestões de Extração:**
  - **HostView.svelte**:
    1. **ElectronControls.svelte**: Extrair o bloco de botões de controlo da janela Electron (info, modo "espião", fixar, fechar) e a sua lógica associada.
    2. **RespostaGraficoItem.svelte**: Extrair cada item da lista de respostas do anfitrião. Este novo componente encapsularia toda a lógica complexa de _drag-and-drop_, classes CSS dinâmicas, cálculo da barra e eventos de clique para destacar.
  - **ParticipantView.svelte**:
    1. **RespostaItem.svelte**: Extrair cada item da lista de respostas submetidas pelo participante, encapsulando a lógica de edição, remoção e as animações associadas.
- **Ficheiros Afetados:** src/client/components/HostView.svelte, src/client/components/ParticipantView.svelte, src/client/components/host.css, src/client/components/participant.css. Criar novos ficheiros de componentes.
- **Prioridade:** Média

### **2.2. Implementar Lógica para autoResizeHeight**

- **Descrição:** A função autoResizeHeight é chamada pelo _frontend_, mas a sua implementação no processo principal do Electron (main.ts) está vazia. É preciso implementar a lógica que calcula a altura do conteúdo da janela e a redimensiona.
- **Justificação:** Remove "dead code" e implementa uma funcionalidade de UX importante para o anfitrião, que ajusta a janela dinamicamente ao conteúdo.
- **Ficheiros Afetados:** src/server/main.ts, src/server/preload.ts, src/client/components/HostView.svelte.
- **Prioridade:** Média

### **2.3. Remover Duplicação de CSS**

- **Descrição:** A regra CSS .resposta-grafico-item está duplicada no ficheiro host.css.
- **Justificação:** Manutenção de código e boas práticas.
- **Ficheiros Afetados:** src/client/components/host.css.
- **Prioridade:** Baixa

## **3\. Arquitetura Futura: Sistema Multi-Sala**

Esta é uma funcionalidade de **alto impacto** que transformará a aplicação de sessão única para uma plataforma multi-sessão.

### **3.1. Implementar Sistema Multi-Sala ("Ágoras")**

- **Descrição:** Refatorar a arquitetura do servidor para suportar múltiplas sessões (salas) concorrentes. Cada sala terá o seu próprio estado isolado.
- **Justificação:** Permite que múltiplos anfitriões usem a aplicação simultaneamente, escalando o seu caso de uso. A abordagem deve ser segura para impedir que utilizadores adivinhem nomes de salas.
- **Plano de Implementação:**
  1. **Separar Nome de Exibição e ID de Sala:**
     - **Nome** de Sala (Ex: "Atenas"): Um nome temático e legível, apenas para exibição na interface do utilizador.
     - **ID de Sala (roomId, ex: UUID):** Um identificador único, aleatório e não previsível gerado pelo servidor. Este roomId deve ser usado para toda a comunicação (URLs, eventos Socket.IO) para garantir a segurança e o isolamento das salas.
  2. **Refatorar o Estado do Servidor:** A classe ApplicationState será substituída por uma RoomState (para o estado de uma sala) e um RoomManager (para gerir o mapa de salas ativas, Map\<roomId, RoomState\>).
  3. **Adaptar Handlers de Sockets:** Usar as "Rooms" do Socket.IO com o roomId. Implementar eventos como CREATE_ROOM (retorna o roomId e o nome de exibição) e JOIN_ROOM (usa o roomId). Todas as emissões de eventos devem ser direcionadas para um roomId específico (io.to(roomId).emit(...)).
  4. **Modificar o Frontend:**
     - Criar um ecrã de entrada para criar ou juntar-se a uma sala.
     - Ao juntar-se, o utilizador insere o nome de exibição, mas o cliente procura a sala no servidor usando um roomId correspondente (ou vice-versa). A forma mais segura é usar o roomId no URL.
     - O QR Code deve gerar um URL com o roomId no _hash_ (ex: http://...\#\<uuid-da-sala\>) para permitir a entrada automática e segura dos participantes.
- **Ficheiros Afetados:** Praticamente todos os ficheiros centrais do projeto, com maior impacto em src/server/state/ApplicationState.ts, src/server/socket/handler.ts, e no fluxo principal do cliente (App.svelte, client.ts).
- **Prioridade:** Alta (se for um objetivo a curto/médio prazo)

## **4\. Melhorias na Experiência do Anfitrião (UX)**

Funcionalidades de **média prioridade** focadas em tornar a ferramenta mais flexível e agradável de usar durante uma apresentação.

### **4.1. Layout a 100% da Janela no Electron**

- **Descrição:** Alterar o CSS para que, quando a aplicação corre como anfitrião no Electron, o contentor principal ocupe 100% da altura e largura da janela, em vez de ser um modal centrado.
- **Justificação:** Proporciona uma experiência de aplicação nativa e utiliza o espaço de ecrã de forma mais eficiente no ambiente de trabalho.
- **Ficheiros Afetados:** src/client/App.svelte (para adicionar uma classe ao body), src/client/style.css, src/client/components/host.css.
- **Prioridade:** Média

### **4.2. Minimizar Aplicação para "Modo Bolha"**

- **Descrição:** Adicionar um novo botão nos controlos da janela do Electron que minimiza a aplicação para uma pequena "bolha" flutuante (always on top). Clicar na bolha restaura a janela.
- **Justificação:** Solução elegante para o problema de espaço de ecrã durante uma apresentação, permitindo ao anfitrião ocultar a janela principal, mas mantendo-a sempre acessível.
- **Ficheiros Afetados:** src/server/main.ts, src/server/preload.ts, src/client/components/HostView.svelte (ou o novo ElectronControls.svelte).
- **Prioridade:** Média

### **4.3. Implementar Temas de Cor (Claro/Escuro)**

- **Descrição:** Adicionar um botão na interface do anfitrião para alternar entre um tema visual claro (padrão) e um tema escuro.
- **Justificação:** Melhora a usabilidade e a visibilidade em diferentes ambientes de apresentação (salas claras ou escuras).
- **Ficheiros Afetados:** src/client/style.css, src/client/components/HostView.svelte (ou ElectronControls.svelte), src/client/stores.ts.
- **Prioridade:** Média

### **4.4. Modo de Foco para QR Code**

- **Descrição:** Implementar uma funcionalidade onde, ao clicar num QR Code no InfoPanel, este é exibido em tamanho maior, centrado num _overlay_ escuro que ocupa todo o ecrã (efeito _lightbox_).
- **Justificação:** Melhora drasticamente a legibilidade do QR code quando projetado num ecrã, especialmente em salas com muita luz ambiente, facilitando e acelerando o processo de _scan_ pela audiência.
- **Ficheiros Afetados:** src/client/components/InfoPanel.svelte, src/client/components/info.css.
- **Prioridade:** Média

## **5\. Internacionalização (i18n)**

### **5.1. Adicionar Suporte para Múltiplos Idiomas**

- **Descrição:** Implementar um sistema de i18n para que a interface da aplicação possa ser exibida em diferentes idiomas.
- **Justificação:** Aumenta o alcance e a acessibilidade do projeto.
- **Implementação Sugerida:** Usar uma biblioteca como svelte-i18n, extrair todas as strings para ficheiros de tradução JSON e substituir o texto estático nos componentes.
- **Ficheiros Afetados:** Todos os componentes .svelte com texto, stores.ts, criar nova pasta src/client/locales/.
- **Prioridade:** Média

## **6\. Novas Funcionalidades para Controlo da Sessão**

### **6.1. Modo de Sessão Semi-Anónimo (Pseudónimos)**

- **Descrição:** Criar um modo de sessão opcional onde a cada participante é atribuído um pseudónimo aleatório (ex: uma personalidade da Grécia Antiga) ao entrar numa sala. O anfitrião teria uma nova vista para ver as respostas agrupadas por estes pseudónimos.
- **Justificação:** Oferece um meio-termo entre o anonimato total e a identificação. Permite ao anfitrião seguir o "fio de pensamento" de um participante ao longo de uma sessão sem revelar a sua identidade real, o que pode ser útil para fins pedagógicos ou para identificar padrões de resposta.
- **Ficheiros Afetados:** src/types/global-types.ts, src/server/state/ApplicationState.ts, src/server/socket/handler.ts, src/client/components/HostView.svelte, src/client/components/ParticipantView.svelte.
- **Prioridade:** Média

### **6.2. Limite de Respostas por Participante**

- **Descrição:** Adicionar um campo na interface do anfitrião para definir um número máximo de respostas que cada participante pode submeter por ronda.
- **Justificação:** Evita o _spam_ e incentiva respostas mais ponderadas.
- **Ficheiros Afetados:** src/server/state/ApplicationState.ts, src/server/socket/handler.ts, src/client/components/HostView.svelte, src/client/components/ParticipantView.svelte.
- **Prioridade:** Média

### **6.3. Temporizador para Submissão**

- **Descrição:** Adicionar uma opção para o anfitrião definir um temporizador. Quando o tempo expirar, os participantes são automaticamente marcados como "Pronto".
- **Justificação:** Ajuda a gerir o tempo da apresentação.
- **Ficheiros Afetados:** src/server/socket/handler.ts, src/client/components/HostView.svelte, src/client/components/ParticipantView.svelte.
- **Prioridade:** Baixa

## **7\. Modos de Jogo e Gamificação**

### **7.1. Implementar Modo de Jogo com Pontuação e Leaderboard**

- **Descrição:** Introduzir um "Modo de Jogo" opcional que se baseia na funcionalidade de pseudónimos para criar uma experiência competitiva.
- **Justificação:** Aumenta o envolvimento da audiência, transforma a ferramenta numa plataforma de _quizzes_ e jogos interativos, e expande drasticamente os casos de uso para além de um simples ARS.
- **Plano de Implementação:**
  1. **Marcar Respostas Corretas:** Na HostView, permitir que o anfitrião selecione uma ou mais respostas como "corretas" (ex: clicando num ícone) antes de avançar para a próxima pergunta.
  2. **Sistema de Pontuação:** No _backend_, quando o anfitrião avança, o servidor compara as respostas corretas com as submissões de cada participante (identificado pelo pseudónimo) e atribui pontos. O estado do Participante será expandido para incluir um campo score.
  3. **Leaderboard:** Criar um novo componente Leaderboard.svelte que o anfitrião pode mostrar/esconder. O servidor emitirá um evento UPDATE_LEADERBOARD com a lista de { pseudonym, score } ordenada. Os participantes também poderão ver a sua pontuação.
- **Ficheiros Afetados:** src/types/global-types.ts, src/server/state/ApplicationState.ts (ou RoomState), src/server/socket/handler.ts, src/client/components/HostView.svelte, src/client/components/ParticipantView.svelte, stores.ts, e criar Leaderboard.svelte.
- **Prioridade:** Média

## **8\. Novas Funcionalidades de Visualização e Exportação**

### **8.1. Exportar Resultados da Sessão**

- **Descrição:** Adicionar um botão para descarregar um ficheiro (.txt ou .csv) com os resultados da sessão.
- **Justificação:** Permite guardar um registo da sessão para análise posterior.
- **Ficheiros Afetados:** src/client/components/HostView.svelte, src/server/api/routes.ts.
- **Prioridade:** Baixa

### **8.2. Botão para Copiar Todas as Respostas**

- **Descrição:** Adicionar um botão na HostView que copia todas as respostas visíveis (agrupadas e contadas) para a área de transferência.
- **Justificação:** Oferece uma forma rápida e simples de colar os resultados noutra aplicação (ex: um documento, um slide, um email) sem precisar de descarregar um ficheiro.
- **Ficheiros Afetados:** src/client/components/HostView.svelte.
- **Prioridade:** Baixa

### **8.3. Visualização em "Nuvem de Palavras"**

- **Descrição:** Implementar um modo de visualização alternativo em formato de nuvem de palavras.
- **Justificação:** Oferece um forte impacto visual e uma forma diferente de interpretar os resultados.
- **Ficheiros Afetados:** src/client/components/HostView.svelte, potencialmente uma nova biblioteca de cliente.
- **Prioridade:** Baixa

### **8.4. Revelação Sequencial de Respostas**

- **Descrição:** Adicionar controlos para o anfitrião mostrar as respostas uma a uma.
- **Justificação:** Dá ao anfitrião controlo detalhado sobre o ritmo da apresentação e da discussão. Opção de mostrar sucessivamente a resposta com maior popularidade, ou uma aleatória, ou mostrar todas as restantes.
- **Ficheiros Afetados:** src/client/components/HostView.svelte, src/client/stores.ts.
- **Prioridade:** Baixa

## **9\. Arquitetura e Flexibilidade**

### **9.1. Permitir que a Aplicação Electron se Ligue a um Servidor Remoto**

- **Descrição:** Adicionar a capacidade de a aplicação Electron funcionar apenas como um cliente anfitrião, ligando-se a uma instância do servidor Node.js a correr noutra máquina.
- **Justificação:** Aumenta drasticamente a flexibilidade, permitindo que o servidor corra numa máquina mais robusta ou na nuvem, enquanto o apresentador usa a aplicação Electron apenas para controlo.
- **Ficheiros Afetados:** src/server/main.ts, src/client/services/socket.ts, src/server/config.ts, package.json.
- **Prioridade:** Média

## **10\. CI/CD, Qualidade e Distribuição**

### **10.1. Preparar o Servidor para Deployment em Plataformas**

- **Descrição:** Adicionar os scripts e configurações necessários para fazer o _deploy_ do servidor numa plataforma PaaS (Platform as a Service) como o Render.
- **Justificação:** Permite testar e utilizar o servidor num ambiente público sem a necessidade de uma máquina local, facilitando o acesso para audiências remotas.
- **Ficheiros Afetados:** package.json, render.yaml (novo ficheiro).
- **Prioridade:** Média

### **10.2. Configurar Pipeline de CI com GitHub Actions**

- **Descrição:** Criar um workflow de GitHub Actions que, a cada push ou pull request, instala as dependências, executa o linter (npm run lint) e o build do projeto (npm run build).
- **Justificação:** Automatiza a verificação da integridade do código, garantindo que novas alterações não quebram a aplicação nem introduzem erros de formatação.
- **Ficheiros Afetados:** Criar um novo ficheiro de workflow em .github/workflows/ci.yml.
- **Prioridade:** Média

### **10.3. Integração com SonarCloud para Análise de Código**

- **Descrição:** Configurar a integração com o SonarCloud (gratuito para projetos open-source) para realizar uma análise estática aprofundada do código.
- **Justificação:** Fornece métricas valiosas sobre a qualidade do código, deteta "code smells", potenciais bugs e vulnerabilidades de segurança.
- **Ficheiros Afetados:** .github/workflows/ci.yml (adicionar passo do Sonar), sonar-project.properties (novo ficheiro na raiz).
- **Prioridade:** Média

## **11\. Documentação e Manutenção**

### **11.1. Alterar Licença para GNU GPL v3**

- **Descrição:** Substituir a licença MIT atual pela GNU General Public License v3.
- **Justificação:** Alinha o projeto com a filosofia de software livre que garante que todas as versões derivadas permaneçam open-source sob os mesmos termos.
- **Ficheiros Afetados:** LICENSE, package.json, README.MD.
- **Prioridade:** Baixa

### **11.2. Atualizar a Documentação (README.MD)**

- **Descrição:** Rever o README.MD para alinhar os nomes dos eventos Socket.IO com o código, corrigir a versão recomendada do Node.js e rever os scripts de desenvolvimento.
- **Justificação:** Garante que a documentação é uma fonte de informação precisa.
- **Ficheiros Afetados:** README.MD, package.json.
- **Prioridade:** Baixa

### **11.3. Alinhar Versão do Node.js**

- **Descrição:** O package.json exige Node.js \>=24.7.0. Deve ser alterado para uma versão LTS mais comum, como \>=20.0.0.
- **Justificação:** Melhora a compatibilidade e facilita a configuração do ambiente para novos utilizadores.
- **Ficheiros Afetados:** package.json, README.MD.
- **Prioridade:** Baixa
