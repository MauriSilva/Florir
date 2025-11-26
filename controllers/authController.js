const bcrypt = require("bcrypt");
const { User } = require("../models/userModel");

exports.loginPage = (req, res) => {
    res.render('login', { titulo: "Login - Florir" });
};

exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ where: { username } });

        if (!user) {
            return res.status(404).json({ erro: "Usuário não encontrado." });
        }

        const passwdMatch = await bcrypt.compare(password, user.password);

        if (!passwdMatch) {
            return res.status(400).json({ erro: "Senha incorreta." });
        }

        req.session.user = {
            username: user.username,
            isAdmin: user.isAdmin
        };

        req.session.isAdmin = user.isAdmin;

        return res.json({ sucesso: true });

    } catch (err) {
        console.error("Erro no login:", err);
        res.status(500).json({ erro: "Erro interno no servidor." });
    }
};

exports.registerPage = (req, res) => {
    res.render('registrar', { titulo: "Criar Conta" });
};

exports.register = async (req, res) => {
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
};

// Admin: Create User Page (Lists users)
exports.createUserPage = async (req, res) => {
    try {
        const users = await User.findAll();
        res.render('admin-register', { titulo: "Gerenciar Usuários - Admin", users });
    } catch (err) {
        console.error("Erro ao listar usuários:", err);
        res.status(500).send("Erro ao carregar página de usuários.");
    }
};

exports.createUser = async (req, res) => {
    const { username, password, isAdmin } = req.body;

    try {
        const userExists = await User.findOne({ where: { username } });

        if (userExists) {
            return res.status(400).send("Usuário já existe.");
        }

        await User.create({
            username,
            password,
            isAdmin: isAdmin === 'on'
        });

        console.log(`👤 Novo usuário criado por admin: ${username}`);
        res.redirect('/admin/users/create'); // Reload page to show new user

    } catch (err) {
        console.error("Erro ao criar usuário (admin):", err);
        res.status(500).send("Erro ao criar usuário.");
    }
};

// Admin: Edit User Page
exports.editUserPage = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).send("Usuário não encontrado.");
        }
        res.render('admin-user-edit', { titulo: "Editar Usuário", user });
    } catch (err) {
        console.error("Erro ao carregar usuário para edição:", err);
        res.status(500).send("Erro interno.");
    }
};

// Admin: Update User
exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { username, password, isAdmin } = req.body;

    try {
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).send("Usuário não encontrado.");
        }

        user.username = username;
        user.isAdmin = isAdmin === 'on';

        // Only update password if provided
        if (password && password.trim() !== "") {
            user.password = password; // Hook will hash it
        }

        await user.save();
        console.log(`👤 Usuário atualizado: ${username}`);
        res.redirect('/admin/users/create');

    } catch (err) {
        console.error("Erro ao atualizar usuário:", err);
        res.status(500).send("Erro ao atualizar usuário.");
    }
};

// Admin: Delete User
exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        await User.destroy({ where: { id } });
        console.log(`🗑️ Usuário excluído: ID ${id}`);
        res.redirect('/admin/users/create');
    } catch (err) {
        console.error("Erro ao excluir usuário:", err);
        res.status(500).send("Erro ao excluir usuário.");
    }
};

exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
};
