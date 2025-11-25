require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const session = require('express-session');
const sequelize = require("./models/database");
const { Post } = require("./models/postModel");
const { User } = require("./models/userModel");
const { Comment } = require("./models/commentModel");

const app = express();
const port = process.env.PORT || 3000;

// Routes imports
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const mainRoutes = require('./routes/mainRoutes');

// Configurações básicas
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'segredo-padrao-dev',
  resave: false,
  saveUninitialized: false
}));

// Global Middlewares
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.isAdmin = req.session.user && req.session.user.isAdmin; // Ensure boolean
  res.locals.titulo = "Florir";
  next();
});

// Carrega posts recentes para o footer/sidebar
app.use(async (req, res, next) => {
  try {
    const postsRecentes = await Post.findAll({
      limit: 6,
      order: [["createdAt", "DESC"]],
    });
    res.locals.postsRecentes = postsRecentes;
  } catch (err) {
    console.error("Erro ao carregar posts recentes:", err);
    res.locals.postsRecentes = [];
  }
  next();
});

// Database Sync
(async () => {
  try {
    await sequelize.sync({ alter: true });
    await Comment.sync({ alter: true });

    // Create admin if not exists
    const adminExists = await User.findOne({ where: { username: "admin" } });
    if (!adminExists) {
      await User.create({
        username: "admin",
        password: "1234",
        isAdmin: true
      });
      console.log("Usuário admin criado automaticamente.");
    }
  } catch (err) {
    console.error("Erro ao sincronizar banco de dados:", err);
  }
})();

// Use Routes
app.use('/', authRoutes);
app.use('/', mainRoutes);
app.use('/', postRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).render("404", { titulo: "Página não encontrada" });
});

// Start Server
app.listen(port, () => {
  console.log(`🌸 Florir rodando em http://localhost:${port}`);
});
