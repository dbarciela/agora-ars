# **Agora**

**Agora** é um sistema de resposta de audiência (Audience Response System) de código aberto, construído com **Svelte**, **TypeScript**, **Node.js** e **Electron**.

## **O Conceito**

O nome **Agora** tem um duplo significado que resume a sua função e propósito:

1. **A Ágora Grega:** Na Grécia Antiga, a **Ágora** (_agorá_) era a praça pública onde ocorriam debates e assembleias. A aplicação inspira-se neste conceito ao criar um espaço digital onde as opiniões da audiência, partilhadas anonimamente, servem de base para a discussão.
2. **O Advérbio "Agora":** O nome remete também para a natureza instantânea da aplicação. A interação ocorre em tempo real, uma funcionalidade suportada pelo uso de **Socket.IO** para a comunicação de baixa latência. Esta característica permite aferir a perceção da audiência no momento exato em que um tema é abordado.

## **Objetivo**

O principal objetivo do **Agora** é aumentar a participação em contextos onde o receio de dar uma resposta errada possa inibir a audiência.

Ao garantir o **anonimato**, a aplicação remove essa barreira, criando um ambiente seguro para que todos possam participar ativamente. Isto permite não só aumentar a interatividade, mas também utilizar as respostas — certas e erradas — como uma ferramenta eficaz para provocar a discussão, corrigir perceções e consolidar o conhecimento do grupo.

## **Funcionalidades**

- **Frontend Moderno e Reativo:** A interface do utilizador é construída com **Svelte**, garantindo uma experiência rápida e fluida.
- **Submissão Anónima:** Os participantes submetem respostas de forma anónima.
- **Revelação Sincronizada:** O anfitrião controla a revelação de todas as respostas em simultâneo.
- **Arquitetura Híbrida:** O anfitrião pode utilizar uma aplicação de desktop (Electron) ou ser o primeiro a aceder via browser.
- **Sessões Voláteis:** As respostas são armazenadas apenas em memória. Ao fechar a aplicação, a sessão termina e todos os dados são eliminados.
- **Segurança Reforçada:** Inclui medidas de segurança básicas como sanitização de entradas para prevenir XSS e limitação de pedidos para evitar sobrecarga do servidor.

## **Arquitetura e Funcionamento**

A aplicação opera com um servidor **Node.js** (Express e Socket.IO) e um _frontend_ construído em **Svelte** e **TypeScript**, servido por **Vite**.

A aplicação pode ser executada de duas formas:

1. **Modo Anfitrião (via Electron):**
   - O anfitrião inicia a aplicação de desktop **Agora**. Esta ação inicia o servidor em segundo plano.
   - Partilha o seu endereço de IP local com a audiência.
   - Os participantes conectam-se à mesma rede, abrem um browser e navegam para o IP fornecido (ex: http://192.168.1.10:4321).
2. **Modo Servidor (Standalone):**
   - O servidor é iniciado manualmente no terminal.
   - Para ser anfitrião, é necessário aceder ao endereço do servidor através de um browser com o parâmetro host=true (ex: http://&lt;ip-servidor>:4321?host=true).
   - Todos os utilizadores que acederem ao mesmo endereço sem o parâmetro serão participantes.

## **API de Eventos (Socket.IO)**

A comunicação em tempo real é gerida pelos seguintes eventos:

**Eventos Emitidos pelo Cliente:**

- registerAsHost: Tenta registar o cliente como anfitrião.
- submeterResposta: Envia uma nova resposta para o servidor.
- removerResposta: Pede a remoção de uma resposta específica.
- participantePronto: Informa o servidor que o participante concluiu as suas submissões.
- cancelarPronto: Informa o servidor que o participante deseja voltar ao estado "a responder".
- revelarRespostas: (Apenas anfitrião) Pede ao servidor para enviar todas as respostas a todos os clientes.
- limparRespostas: (Apenas anfitrião) Pede ao servidor para apagar todas as respostas e reiniciar o estado dos participantes.

**Eventos Emitidos pelo Servidor:**

- isHost: Confirma ao cliente que foi definido como anfitrião.
- hostAlreadyExists: Informa o cliente que já existe um anfitrião.
- estadoParticipantes: Envia a contagem de participantes prontos e a responder.
- respostas: Envia a lista completa de respostas a todos os clientes.

## **Futuro do Projeto: Salas Temáticas**

Está prevista a implementação de um sistema multi-sala. Para manter a coerência conceptual, cada sala criada receberá o nome de uma **ágora histórica do mundo grego antigo**. Em vez de códigos alfanuméricos, os participantes juntar-se-ão a salas como Atenas, Esparta, Corinto ou Mileto.

## **Instalação e Execução**

**Pré-requisitos:**

- Node.js (versão 20.x ou superior recomendada)

Para executar o projeto localmente:

1. **Clonar o repositório:** \
   git clone &lt;url-do-repositorio> \
   cd agora-ars \

2. **Instalar as dependências:** \
   npm install \

3. **Iniciar a aplicação (escolha um dos modos):**
   - **Modo de Desenvolvimento:** \
     npm run dev \
      \
     Este comando utiliza o **Vite** para o _frontend_ Svelte e o **Nodemon** para o servidor, com recarregamento automático.
   - **Modo de Produção (com Electron):** \
     npm start \
      \
     Este comando compila o código e inicia a janela da aplicação Electron para o anfitrião. \* **Modo Servidor (Standalone):** \
     npm run build:server \
     node dist/server/server.js \
      \
     Este comando compila e inicia apenas o servidor. O primeiro utilizador a aceder ao endereço IP do servidor no browser será o anfitrião.
