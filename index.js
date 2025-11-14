const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const session = require('express-session');
const port = 3000;
const bcrypt = require("bcrypt");
const sequelize = require("./models/database");
const { Post } = require("./models/postModel");
const { User } = require("./models/userModel");

function isAdmin(req, res, next) {
  if (req.session && req.session.user && req.session.user.isAdmin) {
    return next();
  }
  return res.redirect("/login");
}

//carrega pelo menos 4 posts para exibir na sessao de leia mais
app.use(async (req, res, next) => {
  try {
    const postsRecentes = await Post.findAll({
      limit: 4,
      order: [["createdAt", "DESC"]],
    });

    res.locals.postsRecentes = postsRecentes;
  } catch (err) {
    console.error("Erro ao carregar posts recentes:", err);
    res.locals.postsRecentes = [];
  }

  next();
});




// Configurações básicas
app.use(express.static("public"));
app.use(session({
  secret: 'florir-secreto', // pode mudar para algo mais aleatório
  resave: false,
  saveUninitialized: false
}));
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.isAdmin = req.session.isAdmin || false;
  next();
});



// sincroniza o banco de dados
(async () => {
  await sequelize.sync();

  // cria admin se nao existir
  const adminExists = await User.findOne({ where: { username: "admin" } });

  if (!adminExists) {
    await User.create({
      username: "admin",
      password: "1234",   // será automaticamente criptografada
      isAdmin: true
    });

    console.log("Usuário admin criado automaticamente.");
  }
})();

// Rotas principais
//home
app.get("/", async (req, res) => {
  try {
    const posts = await Post.findAll({ order: [["id", "DESC"]] });
    res.render("index", { posts, titulo: "Página Inicial - Florir" });
  } catch (err) {
    console.error("Erro ao carregar posts:", err);
    res.render("index", { posts: [] });
  }
});




//sobre
app.get("/sobre", (req, res) => {
  res.render("sobre", { titulo: "Sobre o Florir" });
});




//contato
app.get("/contato", (req, res) => {
  res.render("contato", { titulo: "Fale Conosco" });
});





// Portal de administração
app.get('/admin', isAdmin,async (req, res) => {
  try {
    const posts = await Post.findAll({
      order: [["createdAt", "DESC"]],
    });

    res.render("admin", { posts, titulo:"Painel de administracao" });
  } catch (error) {
    console.error("Erro ao carregar o painel admin:", error);
    res.status(500).send("Erro ao carregar o painel de administração.");
  }
});



app.post('/admin', isAdmin , async (req, res) => {
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




// página de login
app.get('/login', (req, res) => {
  res.render('login', { titulo: "Sobre o Florir" }); 
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.send("Usuário não encontrado.");
    }

    const passwdMatch = await bcrypt.compare(password, user.password);

    if (!passwdMatch) {
      return res.send("Senha incorreta.");
    }

    req.session.user = {
    username: user.username,
    isAdmin: user.isAdmin
    };

    req.session.isAdmin = user.isAdmin;

    console.log("Usuário logado:", user.username);

    return res.redirect('/admin');
    
  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).send("Erro interno no servidor.");
  }
});


//render de posts individuais
app.get('/posts/:id', async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);

    if (!post) {
      return res.status(404).send('Post não encontrado.');
    }

    res.render('artigo', { post , titulo:"Artigos"});
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar o post.');
  }
});


// Página de edição de post
app.get('/admin/edit/:id', isAdmin, async (req, res) => {
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
app.post('/admin/edit/:id', isAdmin, async (req, res) => {
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

// página de termos de uso de dados
app.get('/termos', (req, res) => {
  res.render('termos', { titulo: "Termos de Uso e Política de Privacidade" }); 
});




//logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});



//mapas
app.get('/mapas', (req, res) => {
  res.render('mapas', { titulo: "Mapas Uteis" });
});






// Iniciar servidor
app.listen(port, () => {
  console.log(`🌸 Florir rodando em http://localhost:${port}`);
});
