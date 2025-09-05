# **Agora**

**Agora** é um sistema de resposta de audiência (_Audience Response System_) de código aberto, construído com **Svelte**, **TypeScript**, **Node.js** e **Electron**.

## **O Conceito**

O nome **Agora** tem um duplo significado que resume a sua função e propósito:

1. **A Ágora Grega:** Na Grécia Antiga, a **Ágora** (_agorá_) era a praça pública onde ocorriam debates e assembleias. A aplicação inspira-se neste conceito ao criar um espaço digital onde as opiniões da audiência, partilhadas anonimamente, servem de base para a discussão.
2. **O Advérbio "Agora":** O nome remete também para a natureza instantânea da aplicação. A interação ocorre em tempo real, uma funcionalidade suportada pelo uso de **Socket.IO** para a comunicação de baixa latência. Esta característica permite aferir a perceção da audiência no momento exato em que um tema é abordado.

## **Objetivo**

O principal objetivo do **Agora** é aumentar a participação em contextos onde o receio de dar uma resposta errada possa inibir a audiência. Ao garantir o **anonimato**, a aplicação remove essa barreira, criando um ambiente seguro para que todos possam participar ativamente. Isto permite não só aumentar a interatividade, mas também utilizar as respostas — certas e erradas — como uma ferramenta eficaz para provocar a discussão, corrigir perceções e consolidar o conhecimento do grupo.

## **Funcionalidades**

### **Para os Participantes**

- **Submissão Anónima:** Os participantes submetem respostas de forma anónima, garantindo um ambiente seguro para a partilha de ideias.
- **Edição de Respostas:** É possível editar as respostas submetidas a qualquer momento, antes de se marcarem como "Pronto".
- **Feedback Intuitivo:** A interface fornece feedback claro sobre o estado da sessão e a submissão de respostas.
- **Contexto da Pergunta:** Visualização da pergunta ou tema definido pelo anfitrião para a ronda atual.

### **Para o Anfitrião**

- **Gestão Avançada de Respostas:**
  - **Agrupamento por Arrastar e Soltar:** O anfitrião pode agrupar respostas semelhantes (ex: "JS", "Javascript") simplesmente arrastando uma resposta para cima de outra, condensando os resultados em tempo real.
  - **Destaque e Ordenação:** Para guiar a discussão, o anfitrião pode destacar respostas específicas e ordenar a lista de resultados por popularidade ou ordem alfabética.
- **Fluxo de Apresentação Otimizado:**
  - **Ciclo de "Próxima Pergunta":** Um único botão para limpar a sessão anterior e preparar a aplicação para uma nova ronda de respostas.
  - **Definição de Contexto:** Um campo de texto opcional e discreto para definir a pergunta da ronda.
- **Revelação Sincronizada:** Controlo total sobre o momento de revelação de todas as respostas em simultâneo.
- **Modo de Visualização ao Vivo:** Um modo "espião" que permite ao anfitrião ver as respostas a chegar em tempo real, antes de as revelar a toda a audiência.
- **Arquitetura Híbrida:** Flexibilidade para usar uma aplicação de desktop (Electron) ou um browser como anfitrião.

## **Tecnologias Utilizadas**

A aplicação foi construída com um conjunto de tecnologias modernas para garantir uma experiência robusta e reativa:

- **Frontend:** [Svelte](https://svelte.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Backend:** [Node.js](https://nodejs.org/), [Express](https://expressjs.com/)
- **Comunicação Real-time:** [Socket.IO](https://socket.io/)
- **Aplicação Desktop:** [Electron](https://www.electronjs.org/)

## **Arquitetura e Estrutura do Projeto**

A aplicação é um monorepo com uma separação clara entre o cliente (frontend), o servidor (backend) e o processo principal do Electron.  
agora-ars/  
├── dist/ \# Ficheiros compilados para produção  
├── out/ \# Binários e instaladores gerados pelo Electron Forge  
├── src/  
│ ├── client/ \# Todo o código do frontend (Svelte)  
│ │ ├── components/ \# Componentes Svelte reutilizáveis  
│ │ ├── services/ \# Lógica de comunicação (ex: Socket.IO)  
│ │ ├── App.svelte \# Componente raiz do Svelte  
│ │ └── client.ts \# Ponto de entrada que monta a aplicação Svelte  
│ │  
│ ├── server/ \# Todo o código do backend (Node.js) e Electron  
│ │ ├── api/ \# Rotas da API REST (Express)  
│ │ ├── socket/ \# Lógica dos handlers de eventos Socket.IO  
│ │ ├── state/ \# Gestão do estado central da aplicação  
│ │ ├── main.ts \# Ponto de entrada do processo principal do Electron  
│ │ ├── preload.ts \# Script de preload para a comunicação segura (IPC)  
│ │ └── server.ts \# Configuração e arranque do servidor Express e Socket.IO  
│ │  
│ └── types/ \# Tipos TypeScript partilhados entre cliente e servidor  
│  
├── package.json \# Scripts, dependências e configuração do projeto  
└── vite.config.mts \# Configuração do Vite para o frontend

### **Como Funciona**

A aplicação pode ser executada de duas formas:

1. **Modo Anfitrião (via Electron):**
   - O anfitrião inicia a aplicação de desktop **Agora**. Esta ação inicia o servidor Node.js em segundo plano.
   - A aplicação mostra uma janela com os controlos de anfitrião e a informação de acesso (IP e QR Code) para partilhar com a audiência.
   - Os participantes conectam-se à mesma rede, abrem um browser e navegam para o IP fornecido (ex: http://192.168.1.10:4321).
2. **Modo Servidor (Standalone):**
   - O servidor é iniciado manualmente no terminal.
   - Para ser anfitrião, é necessário aceder ao endereço do servidor através de um browser com o parâmetro host=true (ex: http://\<ip-servidor\>:4321?host=true).
   - Todos os utilizadores que acederem ao mesmo endereço sem o parâmetro serão participantes.

## **API de Eventos (Socket.IO)**

A comunicação em tempo real é gerida pelos seguintes eventos:  
Eventos Emitidos pelo Cliente:

- registerAsHost: Tenta registar o cliente como anfitrião.
- submeterResposta: Envia uma nova resposta para o servidor.
- removerResposta: Pede a remoção de uma resposta específica.
- participantePronto: Informa o servidor que o participante concluiu as suas submissões.
- cancelarPronto: Informa o servidor que o participante deseja voltar ao estado "a responder".
- revelarRespostas: (Anfitrião) Pede ao servidor para enviar todas as respostas a todos os clientes.
- limparRespostas: (Anfitrião) Pede ao servidor para apagar todas as respostas e reiniciar o estado.
- fundirRespostas: (Anfitrião) Envia a informação de duas respostas a serem fundidas.
- definirPergunta: (Anfitrião) Envia o texto da pergunta/contexto da ronda atual.

**Eventos Emitidos pelo Servidor:**

- isHost: Confirma ao cliente que foi definido como anfitrião.
- hostAlreadyExists: Informa o cliente que já existe um anfitrião.
- estadoParticipantes: Envia a contagem de participantes prontos e a responder.
- respostas: Envia a lista completa de respostas (usado para atualizações gerais).
- respostasReveladas: Envia a lista de respostas a todos os clientes quando o anfitrião as revela.
- atualizarPergunta: Envia a pergunta/contexto atual a todos os clientes.

## **Futuro do Projeto: Salas Temáticas**

Está prevista a implementação de um sistema multi-sala. Para manter a coerência conceptual, cada sala criada receberá o nome de uma **ágora histórica do mundo grego antigo**. Em vez de códigos alfanuméricos, os participantes juntar-se-ão a salas como _Atenas_, _Esparta_, _Corinto_ ou _Mileto_.

## **Instalação e Execução**

**Pré-requisitos:**

- Node.js (versão 20.x ou superior recomendada)

Para executar o projeto localmente:

1. **Clonar o repositório:**  
   git clone \<url-do-repositorio\>  
   cd agora-ars

2. **Instalar as dependências:**  
   npm install

3. **Iniciar a aplicação (escolha um dos modos):**
   - **Modo de Desenvolvimento (recomendado):**  
     npm run dev

     Este comando utiliza o **Vite** para o frontend com _hot reload_ e o **Nodemon** para o servidor, reiniciando automaticamente em caso de alterações.

   - **Modo de Produção (com Electron):**  
     npm start

     Este comando compila o código e inicia a janela da aplicação Electron para o anfitrião.

   - **Modo Servidor (Standalone):**  
     npm run build:server  
     npm run start:server

     Este comando compila e inicia apenas o servidor usando o **Nodemon**. Para se tornar anfitrião, o primeiro utilizador deve aceder ao endereço IP do servidor no browser com o parâmetro ?host=true (ex: http://192.168.1.100:4321?host=true).

## **Nota sobre o Desenvolvimento**

Este projeto foi desenvolvido com o apoio de ferramentas de IA para a geração de documentação e revisão de código.

## **Licença**

Este projeto está licenciado sob a Licença MIT.
