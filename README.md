# Barbearia AlphaClub - Sistema de Gestão

Este é um sistema de gestão completo para a barbearia AlphaClub, desenvolvido em Next.js. O painel administrativo permite o gerenciamento de agendamentos, serviços, barbeiros e configurações gerais do estabelecimento, tudo integrado a um backend via webhooks.

## Funcionalidades Principais

O sistema conta com um painel de controle robusto dividido em cinco seções principais:

### 1. Relatórios
Dashboard dinâmico que apresenta métricas de desempenho da barbearia, incluindo:
- **Total de Agendamentos:** Número de agendamentos para o período selecionado.
- **Serviços Mais Vendidos:** Gráfico com os serviços mais populares.
- **Barbeiros com Mais Clientes:** Ranking de atendimentos por barbeiro.
- **Horários de Pico:** Gráfico de linha mostrando os horários com maior movimento.

### 2. Agenda
Calendário interativo com visão semanal para gerenciar os agendamentos.
- Visualização de todos os agendamentos por dia e hora.
- Criação de novos agendamentos em horários vagos.
- Edição de detalhes, confirmação e cancelamento de agendamentos existentes.

### 3. Serviços
Gerenciamento completo do catálogo de serviços oferecidos.
- Listagem de todos os serviços com preço, duração e status (ativo/inativo).
- Adição, edição e desativação de serviços através de um formulário integrado.

### 4. Barbeiros
Gerenciamento da equipe de barbeiros.
- Listagem dos barbeiros com suas especialidades e status.
- Adição de novos barbeiros, edição de informações e desativação de perfis.

### 5. Configurações
Página para configurar as informações gerais e operacionais da barbearia.
- Edição do nome, telefone e endereço.
- Definição do horário de funcionamento e formas de pagamento.
- Configuração de automações, como respostas por áudio.

## Tecnologias Utilizadas

- **Framework:** Next.js (com App Router)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS e ShadCN/UI
- **Backend:** Integração com APIs externas via webhooks.
- **Gráficos:** Recharts
- **Formulários:** React Hook Form com Zod para validação.

## Como Executar o Projeto

Para executar o projeto em seu ambiente local, siga os passos abaixo:

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

3. **Abra o navegador:**
   Acesse [http://localhost:9002](http://localhost:9002) para visualizar a aplicação.
