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

exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
};
