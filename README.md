# Barbearia AlphaClub - Sistema de Gestão

Este é um sistema de gestão completo para a barbearia AlphaClub, desenvolvido com Next.js, TypeScript e Tailwind CSS. O painel administrativo permite o gerenciamento de relatórios, agenda, finanças, serviços, barbeiros e configurações, oferecendo uma solução completa para a operação do negócio.

## Funcionalidades Principais

O sistema conta com um painel de controle robusto dividido em seis seções principais:

### 1. Relatórios
Dashboard dinâmico que apresenta métricas de desempenho da barbearia com filtro por período.
- **KPIs Principais:** Cards com os principais indicadores e comparação com o período anterior:
  - **Total de Agendamentos:** Número total de atendimentos realizados.
  - **Receita Total Estimada:** Soma dos valores de todos os serviços agendados.
  - **Ticket Médio:** Valor médio gasto por cliente.
  - **Taxa de Comissão Média:** Custo percentual médio das comissões sobre a receita.
- **Gráficos de Desempenho:**
  - **Serviços Mais Vendidos:** Ranking dos serviços mais populares por volume.
  - **Barbeiros com Mais Clientes:** Ranking de atendimentos por barbeiro.
  - **Comissões por Barbeiro:** Valor total de comissão a pagar para cada barbeiro.
  - **Horários de Pico:** Gráfico de linha mostrando os horários com maior movimento.

### 2. Agenda
Calendário interativo com visão semanal para um gerenciamento de agendamentos ágil e eficiente.
- Visualização clara dos agendamentos por dia e hora.
- Criação de novos agendamentos diretamente em horários vagos.
- **Gerenciamento Unificado:** Um único modal permite visualizar detalhes, editar informações ou cancelar um agendamento de forma rápida e intuitiva.

### 3. Financeiro
Um painel financeiro completo para acompanhar a saúde financeira do negócio, com filtro por período.
- **Visão Geral:**
  - **KPIs Financeiros:** Cards com Receita Bruta, Despesas Totais e Lucro Líquido, com comparação percentual.
  - **Gráfico de Receita vs. Despesas:** Gráfico de barras diário comparando entradas e saídas.
  - **Receita por Forma de Pagamento:** Gráfico de pizza que mostra a distribuição da receita.
- **Histórico de Lançamentos:**
  - Aba dedicada para gerenciar todas as despesas.
  - Funcionalidade completa de **Adicionar, Editar e Excluir** lançamentos.

### 4. Serviços
Gerenciamento completo do catálogo de serviços oferecidos.
- Listagem de todos os serviços com preço, duração e status (ativo/inativo).
- Tabela com ordenação por colunas.
- Adição, edição e desativação de serviços através de um formulário integrado.

### 5. Barbeiros
Gerenciamento da equipe de barbeiros.
- Listagem dos barbeiros com especialidade, comissão, status e observações.
- Tabela com ordenação por colunas.
- Adição de novos barbeiros, edição de informações e desativação de perfis.

### 6. Configurações
Página para configurar as informações gerais e operacionais da barbearia.
- Edição do nome, telefone e endereço.
- Definição do horário de funcionamento e formas de pagamento aceitas.
- Configuração de automações, como respostas por áudio via webhook.

## Tecnologias Utilizadas

- **Framework:** Next.js (com App Router)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS e ShadCN/UI
- **Gráficos:** Recharts
- **Formulários:** React Hook Form com Zod para validação.
- **Backend (Simulado):** Integração com APIs externas via webhooks para prototipagem.

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
