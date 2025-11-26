# 🌸 Projeto Florir
**Florescem sonhos onde há acolhimento.**

![Logo Florir](/public/img/florir-semdesc.png)

---

## 📖 Sobre o Projeto

O **Florir** é uma plataforma acolhedora voltada para **adolescentes grávidas**, oferecendo:

- Artigos educativos  
- Mapas de unidades de saúde e ONGs  
- Espaço de comunidade  
- Suporte informativo e emocional  

O sistema foi criado com foco em **acolhimento, acessibilidade e informação confiável**.

---

## 🚀 Tecnologias Utilizadas

### **Backend**
- Node.js (v18+)
- Express  
- Sequelize (ORM)
- **Banco de Dados Flexível**: Suporta SQLite (padrão) e MySQL.

### **Frontend**
- HTML + EJS  
- CSS puro (Design System próprio)
- Font Awesome

### **Extras**
- Leaflet (mapas)  
- Sessions para autenticação

---

## ⚙️ Como Rodar o Projeto (Guia Rápido)

Qualquer pessoa pode rodar este projeto seguindo os passos abaixo.

### 1️⃣ Pré-requisitos
- **Node.js** instalado (versão 18 ou superior).
- **Git** instalado.

### 2️⃣ Instalação

Clone o repositório e instale as dependências:

```bash
git clone https://github.com/MauriSilva/Florir.git
cd Florir
npm install
```

### 3️⃣ Configuração do Banco de Dados

O projeto aceita **SQLite** (mais fácil, não precisa instalar nada) ou **MySQL**.

#### Opção A: SQLite (Recomendado para Testes Rápido)
Não precisa configurar nada! O sistema já vem configurado para criar um arquivo de banco de dados local em `./database/florir.db`.

#### Opção B: MySQL (Para Produção ou Preferência)
1. Crie um arquivo `.env` na raiz do projeto (copie do `.env.example`).
2. Edite o `.env` com suas credenciais:

```env
DB_DIALECT=mysql
DB_HOST=localhost
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=florir
```

### 4️⃣ Rodar o Servidor

```bash
npm start
```

Acesse no navegador: **http://localhost:3000**

---

## 🔐 Usuário Admin Padrão

Na primeira execução, um administrador é criado automaticamente:

- **Usuário:** admin
- **Senha:** 1234

---

## ✨ Funcionalidades

- 🔒 Login + painel administrador
- 📝 CRUD de artigos educativos (Markdown)
- 💬 Moderação de comentários
- 🗺️ Mapa com unidades de saúde e ONGs
- 📬 Formulário de contato
- 🌼 Layout acolhedor e responsivo

---

## 🤝 Como Contribuir

1. Faça um fork
2. Crie uma branch: `git checkout -b feature/nome-da-feature`
3. Commit: `git commit -m "feat: adiciona nova feature"`
4. Push: `git push origin feature/nome-da-feature`
5. Abra um Pull Request

---

## 💜 Agradecimentos & Equipe

### 👑 Maurício Silva — **Lead Programmer**
Responsável pelo desenvolvimento completo do sistema, backend, lógica do projeto, integrações e estrutura principal do Florir.

### 🌼 Sara Chacon — **Creative Direction & UX Support**
Contribuiu com ideias essenciais, direcionamento criativo, sugestões de layout e apoio nos momentos críticos de concepção das telas.

### 🎨 Evellyn Florencio — **Visual Designer & Brand Artist**
Criadora dos assets visuais, identidade da marca, logo oficial e elementos gráficos que deram personalidade ao Florir.

### 📚 Amanda Oliveira — **Documentation & Case Study Specialist**
Responsável pela documentação, estudo de caso, organização textual e toda a parte escrita fundamental para apresentação do projeto.

---

“Florescem sonhos onde há acolhimento.”
