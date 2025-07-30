# 🛒 API Carrinho com Estoque Reativo

API REST desenvolvida em **Node.js + Express** com **SQLite** para gerenciar produtos, carrinhos e estoque em tempo real.  
Inclui autenticação via JWT, controle de concorrência no checkout, permissões de administrador e testes automatizados.

---
## Requisitos
- **Node.js v18** (ou superior)

## 🚀 Funcionalidades

- Criar produtos com estoque inicial (**apenas ADMIN**)
- Criar carrinhos de compra
- Adicionar/remover produtos ao carrinho
- Finalizar compra decrementando estoque
- Impedir finalizações simultâneas no mesmo carrinho (**controle de concorrência**)
- Autenticação via JWT
- Testes automatizados (Jest)

---


## ⚙️ Configuração do Projeto


1️⃣ Clonar o repositório
```bash
git clone https://github.com/mauricioc08/cart-api.git
cd cart-api
```
2️⃣ Instalar dependências
```bash
npm install
```
3️⃣ Configurar variáveis de ambiente

Use o arquivo env.sample como base:
```bash
cp .env.sample .env
```
Edite o .env com suas chaves:
```bash
PORT=4000
JWT_SECRET=secret_key
ADMIN_SECRET=YWRtaW5pc3RyYWRvcg
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

## 🛠 Testando Manualmente com Postman

Incluímos no repositório o arquivo de collection do Postman:  
[📥 **Baixar Collection do Postman**](./reactive-cart-api.postman_collection.json)

Ele contém todas as requisições necessárias para testar a API.

### Passos:

1. Baixe o arquivo acima ou localize-o na raiz do projeto.
2. Abra o **Postman**.
3. Vá em **File → Import**.
4. Selecione o arquivo `reactive-cart-api.postman_collection.json`.
5. Configure a variável de ambiente `base_url` para:

```bash
http://localhost:4000
```
5️⃣ Execute as requisições nesta ordem:
   1. **register** → Criar um novo usuário.
   2. **login** → Obter o token JWT.
   3. **ADMIN create-product** → Criar produto no estoque.  
      - No header envie:
      ```
      Authorization: Bearer SEU_TOKEN
      x-admin-secret: SEU_ADMIN_SECRET
      ```
   4. **create-cart** → Criar um carrinho para o usuário.
   5. **get-products** → Listar todos os produtos e estoques atuais.
   6. **add-product-cart** → Adicionar produto ao carrinho.
   7. **remove-product-cart** → Remover produto do carrinho (opcional).
   8. **checkout** → Finalizar compra e atualizar estoque.



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

1. Usuário se registra ou faz login (gera JWT).

2. Admin cria produtos com estoque inicial usando ADMIN_SECRET.

3. Usuário cria seu carrinho.

4. Adiciona produtos ao carrinho.

5. Faz checkout:

    Aplica lock para evitar concorrência.

    Verifica estoque.

    Atualiza estoque.

    Finaliza pedido.



### 🔐 Controle de Concorrência

O controle de concorrência usa um lock em memória (utils/locks.js) para impedir que dois checkouts sejam processados ao mesmo tempo no mesmo carrinho.

Se um segundo checkout for iniciado antes do primeiro terminar:

    O segundo recebe 409 Conflict.

    Apenas o primeiro é processado.

---

### 📜 Licença

Este projeto é de uso livre para fins de estudo.

