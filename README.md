# 🛒 API Carrinho com Estoque Reativo

API REST desenvolvida em **Node.js + Express** com **SQLite** para gerenciar produtos, carrinhos e estoque em tempo real.  
Inclui autenticação via JWT, controle de concorrência no checkout e testes automatizados.

---

## 🚀 Funcionalidades

- Criar produtos com estoque inicial
- Criar carrinhos de compra
- Adicionar/remover produtos ao carrinho
- Finalizar compra decrementando estoque
- Impedir finalizações simultâneas no mesmo carrinho (**controle de concorrência**)
- Autenticação via JWT
- Testes automatizados (Jest)

---


## ⚙️ Configuração do Projeto


### 1️⃣ Clonar o repositório
```bash
git clone https://github.com/seu-usuario/cart-api.git
cd cart-api
```
2️⃣ Instalar dependências
```bash
npm install
```
3️⃣ Configurar variáveis de ambiente

Crie um arquivo .env na raiz com:
```bash
JWT_SECRET=seu_token_secreto
PORT=4000
```
4️⃣ Rodar em modo desenvolvimento
```bash
npm run dev
```
A API estará disponível em:
```bash
http://localhost:4000
```
---

### 🛠 Testando Manualmente com Postman

Incluímos no repositório o arquivo:
```bash
postman_collection.json
```
Ele contém todas as requisições necessárias para testar a API.

### Passos:

1 - Abra o Postman.

2 - Vá em File → Import.

3 - Selecione o arquivo postman_collection.json.

4 - Configure a variável de ambiente base_url para:
```bash
http://localhost:4000
```
### 5 Siga esta ordem de execução:

        Auth → Register: Criar usuário.

        Auth → Login: Obter token JWT.

        Products → Create Product: Criar produto com estoque inicial.

        Cart → Create Cart: Criar carrinho vinculado ao usuário.

        Cart → Add Item: Adicionar produto ao carrinho.

        Cart → Checkout: Finalizar compra e atualizar estoque.

📌 Importante:

    Sempre envie o token JWT no header:

    Authorization: Bearer SEU_TOKEN


### ✅ Rodando Testes Automatizados

Rodar todos os testes:
```bash
npm test
```
Rodar teste específico:
```bash
npm test -- tests/concurrency.test.js
```
### 🔄 Fluxo de Funcionamento

1 - Usuário se registra ou faz login (gera JWT).

2 - Admin cria produtos com estoque inicial.

3 - Usuário cria seu carrinho.

4 - Adiciona produtos ao carrinho.

Faz checkout:

    Aplica lock para evitar concorrência.

    Verifica estoque.

    Atualiza estoque.

    Finaliza pedido.


### 🔐 Controle de Concorrência

O controle de concorrência usa um lock em memória (utils/locks.js) para impedir que dois checkouts sejam processados ao mesmo tempo no mesmo carrinho.

Se um segundo checkout for iniciado antes do primeiro terminar:

    O segundo recebe 409 Conflict.

    Apenas o primeiro é processado.


### 📜 Licença

Este projeto é de uso livre para fins de estudo.

