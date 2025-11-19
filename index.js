const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const session = require('express-session');
const port = 3000;
const bcrypt = require("bcrypt");
const sequelize = require("./models/database");
const { Post } = require("./models/postModel");
const { User } = require("./models/userModel");
const { Comment } = require("./models/commentModel");

let marked;

(async () => {
  const m = await import("marked");
  marked = m.marked;
})();
const nodemailer = require("nodemailer");


app.get("/trocar", async (req, res) => {
  try {
    const bcrypt = require("bcrypt");
    const novaSenha = "Florir2025@"; // troque aqui

    const admin = await User.findOne({ where: { username: "admin" } });

    if (!admin) return res.send("Admin não encontrado.");

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(novaSenha, salt);

    admin.password = hash;
    await admin.save();

    res.send("Senha do admin trocada com sucesso!");
  } catch (err) {
    console.error(err);
    res.send("Erro ao trocar senha.");
  }
});



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

//garente que todas as paginas sempre tenham um Titulo e evita o erro de referencia
app.use((req, res, next) => {
  res.locals.titulo = "Florir";
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
  await Comment.sync();

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

// Forum / comunidade
app.get("/comunidade", async (req, res) => {
  const comments = await Comment.findAll({
    order: [["createdAt", "DESC"]]
  });

  res.render("comunidade", {
    titulo: "Comunidade – Florir",
    comments
  });
});

app.post("/comunidade", async (req, res) => {
  const { name, message } = req.body;

  if (!name || !message) return res.redirect("/comunidade");

  await Comment.create({ name, message });

  res.redirect("/comunidade");
});

//sobre
app.get("/sobre", (req, res) => {
  res.render("sobre", { titulo: "Sobre o Florir" });
});




//contato
app.get("/contato", (req, res) => {
  res.render("contato", {
    titulo: "Fale Conosco",
    enviado: req.query.enviado || null   // <-- enviando variável para o EJS
  });
});

// ROTA PARA PROCESSAR ENVIO DE EMAIL
app.post("/contato", async (req, res) => {
  const { nome, email, mensagem } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "projetoflorirfmu@gmail.com",
        pass: "wsob exxh cfur serm"
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    await transporter.sendMail({
      from: email,
      to: "projetoflorirfmu@gmail.com",
      subject: `Nova mensagem do Florir - Enviado por ${nome}`,
      text: `
        Nome: ${nome}
        Email: ${email}
        Mensagem:
        ${mensagem}
      `
    });

    console.log("📨 E-mail enviado com sucesso!");
    res.redirect("/contato?enviado=1");

  } catch (error) {
    console.error("❌ ERRO:", error);
    res.send("Ocorreu um erro ao enviar sua mensagem.");
  }
});



// Portal de administração
app.get('/admin', isAdmin, async (req, res) => {
  try {
    const posts = await Post.findAll({
      order: [["createdAt", "DESC"]],
    });

    res.render("admin", { posts, titulo: "Painel de administracao" });
  } catch (error) {
    console.error("Erro ao carregar o painel admin:", error);
    res.status(500).send("Erro ao carregar o painel de administração.");
  }
});
app.post('/admin', isAdmin, async (req, res) => {
  const { title, summary, content, image, category } = req.body;

  try {
    await Post.create({
      title,
      summary,
      content,
      category: category.trim().toLowerCase(),
      image: image || '/default.jpg'
    });
    console.log("Novo artigo adicionado:", title);
    res.redirect('/');
  } catch (err) {
    console.error("Erro ao salvar artigo:", err);
    res.status(500).send("Erro ao salvar artigo");
  }
});

//criar posts
app.get("/admin/create", isAdmin, (req, res) => {
  res.render("admin-create", { titulo: "Criar Novo Post" });
});

app.post("/admin/create", isAdmin, async (req, res) => {
  const { title, summary, content, category, image } = req.body;

  try {
    await Post.create({
      title,
      summary,
      content,
      category: category.trim().toLowerCase(),
      image: image || '/default.jpg'
    });

    res.redirect("/admin");
  } catch (err) {
    console.error("Erro ao criar post:", err);
    res.status(500).send("Erro ao criar post.");
  }
});

app.post("/comunidade/deletar/:id", isAdmin, async (req, res) => {
  try {
    await Comment.destroy({ where: { id: req.params.id } });
    res.redirect("/comunidade");
  } catch (err) {
    console.error("Erro ao deletar comentário:", err);
    res.status(500).send("Erro ao deletar comentário.");
  }
});

// página de cadastro
app.get('/registrar', (req, res) => {
  res.render('registrar', { titulo: "Criar Conta" });
});

app.post('/registrar', async (req, res) => {
  const { username, password } = req.body;

  try {
    // verifica se o username já existe
    const userExists = await User.findOne({ where: { username } });

    if (userExists) {
      return res.send("Esse nome de usuário já está em uso.");
    }

    // cria o usuário — senha será hash automaticamente pelo hook
    await User.create({
      username,
      password,   // NÃO HASH AQUI — seu model já faz isso automaticamente
      isAdmin: false
    });

    console.log("Novo usuário criado:", username);

    res.redirect('/login');

  } catch (err) {
    console.error("Erro ao cadastrar usuário:", err);
    res.status(500).send("Erro ao criar usuário.");
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

    return res.redirect('/');

  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).send("Erro interno no servidor.");
  }
});


//render de posts individuais. usa markdown
app.get('/posts/:id', async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);

    if (!post) return res.status(404).send("Post não encontrado");

    const htmlContent = marked.parse(post.content);

    res.render('artigo', {
      post,
      htmlContent,
      titulo: post.title
    });

  } catch (err) {
    console.error("Erro ao carregar post:", err);
    res.status(500).send("Erro ao carregar o post");
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
  const { title, summary, content, image, category } = req.body;

  try {
    const post = await Post.findByPk(postId);
    if (!post) return res.status(404).send('Post não encontrado');

    await post.update({
      title,
      summary,
      content,
      image,
      category
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
    res.redirect('/');
  });
});



//mapas
app.get('/mapas', (req, res) => {
  res.render('mapas', { titulo: "Mapas Uteis" });
});


// Página de Conteúdos Educativos
app.get("/conteudo", async (req, res) => {
  const categoria = req.query.categoria || null;

  try {
    const posts = await Post.findAll();

    // pegar categorias únicas com base no summary
    const categorias = [...new Set(posts.map(p => p.category.trim()))];

    let postsFiltrados = posts;

    if (categoria) {
      postsFiltrados = posts.filter(p => p.category.trim() === categoria);
    }

    res.render("conteudo", {
      posts: postsFiltrados,
      categorias,
      categoriaSelecionada: categoria,
      titulo: "Conteúdos Educativos"
    });

  } catch (err) {
    console.error("Erro ao carregar conteúdos:", err);
    res.status(500).send("Erro ao carregar conteúdos.");
  }
});



// Iniciar servidor
app.listen(port, () => {
  console.log(`🌸 Florir rodando em http://localhost:${port}`);
});
