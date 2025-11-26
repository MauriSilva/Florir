require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const session = require('express-session');
const sequelize = require("./models/database");
const { Post } = require("./models/postModel");
const { User } = require("./models/userModel");
const { Comment } = require("./models/commentModel");

const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// Routes imports
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const mainRoutes = require('./routes/mainRoutes');

const app = express();
const port = process.env.PORT || 3000;

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

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://kit.fontawesome.com", "https://cdn.jsdelivr.net", "https://unpkg.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://unpkg.com", "https://maxcdn.bootstrapcdn.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://ka-f.fontawesome.com", "https://maxcdn.bootstrapcdn.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https://ka-f.fontawesome.com", "http://localhost:3000", "ws://localhost:3000", "https://unpkg.com", "https://overpass.kumi.systems"]
    },
  },
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // limit each IP to 1000 requests per windowMs
});
app.use(limiter);

// ...

// Database Sync
(async () => {
  try {
    await sequelize.sync();
    await Comment.sync();

    // Create admin if not exists
    const adminExists = await User.findOne({ where: { username: "admin" } });
    if (!adminExists) {
      const adminPassword = process.env.ADMIN_PASSWORD || "1234";
      if (adminPassword === "1234") {
        console.warn("⚠️  AVISO DE SEGURANÇA: Usando senha padrão '1234' para admin. Configure ADMIN_PASSWORD no .env.");
      }
      await User.create({
        username: "admin",
        password: adminPassword,
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

// DEBUG: Direct Route Definition
const authController = require('./controllers/authController');
const { isAdmin } = require('./middlewares/authMiddleware');
app.get('/admin/users/create', isAdmin, authController.createUserPage);
app.post('/admin/users/create', isAdmin, authController.createUser);
app.get('/admin/users/edit/:id', isAdmin, authController.editUserPage);
app.post('/admin/users/edit/:id', isAdmin, authController.updateUser);
app.post('/admin/users/delete/:id', isAdmin, authController.deleteUser);

// 404 Handler
app.use((req, res) => {
  res.status(404).render("404", { titulo: "Página não encontrada" });
});

// Start Server
app.listen(port, () => {
  console.log(`🌸 Florir rodando em http://localhost:${port}`);
});
