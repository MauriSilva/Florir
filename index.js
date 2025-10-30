const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const session = require('express-session');

app.use(session({
  secret: 'florir-secreto', // pode mudar para algo mais aleatório
  resave: false,
  saveUninitialized: false
}));
const port = 3000;
const { sequelize, Post } = require("./models/postModel");

// Configurações básicas
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Banco de dados
(async () => {
  await sequelize.sync(); // não apaga os dados
})();

// Rotas principais
app.get("/", async (req, res) => {
  try {
    const posts = await Post.findAll({ order: [["id", "DESC"]] });
    res.render("index", { posts, titulo: "Página Inicial - Florir" });
  } catch (err) {
    console.error("Erro ao carregar posts:", err);
    res.render("index", { posts: [] });
  }
});

app.get("/sobre", (req, res) => {
  res.render("sobre", { titulo: "Sobre o Florir" });
});

app.get("/contato", (req, res) => {
  res.render("contato", { titulo: "Fale Conosco" });
});

function checkAuth(req, res, next) {
  if (req.session.user) {
    return next();
  }
  res.redirect('/login', { titulo: "Sobre o Florir" });
}

// Portal de administração
app.get('/admin', checkAuth, (req, res) => {
  res.render('admin', { titulo: "Sobre o Florir" });
});

app.post('/admin', checkAuth, async (req, res) => {
  const { title, summary, content, image } = req.body;

  try {
    await Post.create({ title, summary, content, image: image || '/default.jpg' });
    console.log("Novo artigo adicionado:", title);
    res.redirect('/');
  } catch (err) {
    console.error("Erro ao salvar artigo:", err);
    res.status(500).send("Erro ao salvar artigo");
  }
});

app.get('/login', (req, res) => {
  res.render('login', { titulo: "Sobre o Florir" }); // página de login
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // login simples (só pra exemplo)
  if (username === 'admin' && password === '1234') {
    req.session.user = username; // cria sessão
    return res.redirect('/admin');
  }

  res.send('Usuário ou senha incorretos!');
});

// Página de edição de post
app.get('/admin/edit/:id', async (req, res) => {
  const postId = req.params.id;

  try {
    const post = await Post.findByPk(postId);
    if (!post) return res.status(404).send('Post não encontrado');

    res.render('edit', { post });
  } catch (err) {
    console.error('Erro ao carregar post para edição:', err);
    res.status(500).send('Erro ao carregar post');
  }
});

// Atualiza o post no banco
app.post('/admin/edit/:id', async (req, res) => {
  const postId = req.params.id;
  const { title, summary, content, image } = req.body;

  try {
    const post = await Post.findByPk(postId);
    if (!post) return res.status(404).send('Post não encontrado');

    await post.update({
      title,
      summary,
      content,
      image
    });

    console.log('✅ Post atualizado:', post.title);
    res.redirect('/'); // ou res.redirect('/admin') se quiser voltar ao painel
  } catch (err) {
    console.error('Erro ao atualizar post:', err);
    res.status(500).send('Erro ao atualizar post');
  }
});



app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});


// Iniciar servidor
app.listen(port, () => {
  console.log(`🌸 Florir rodando em http://localhost:${port}`);
});
