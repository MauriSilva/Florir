const nodemailer = require("nodemailer");
const { Comment } = require("../models/commentModel");

exports.sobre = (req, res) => {
    res.render("sobre", { titulo: "Sobre o Florir" });
};

exports.contatoPage = (req, res) => {
    console.log("Acessando página de contato...");
    res.render("contato", { titulo: "Fale Conosco - Florir" });
};

exports.contato = async (req, res) => {
    const { nome, email, mensagem } = req.body;

    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        await transporter.sendMail({
            from: email,
            to: process.env.EMAIL_USER,
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
};

exports.mapas = (req, res) => {
    res.render('mapas', { titulo: "Mapas Uteis" });
};

exports.termos = (req, res) => {
    res.render('termos', { titulo: "Termos de Uso e Política de Privacidade" });
};

// Community
exports.comunidade = async (req, res) => {
    try {
        const comments = await Comment.findAll({
            where: { approved: true },
            order: [["createdAt", "DESC"]]
        });

        res.render("comunidade", {
            titulo: "Comunidade – Florir",
            comments
        });
    } catch (err) {
        console.error(err);
        res.render("comunidade", { titulo: "Comunidade", comments: [] });
    }
};

exports.postComunidade = async (req, res) => {
    const { name, message } = req.body;

    if (!name || !message) return res.redirect("/comunidade");

    try {
        const novoComentario = await Comment.create({ name, message, approved: false });
        console.log("✅ Comentário salvo no banco:", novoComentario.toJSON());
    } catch (err) {
        console.error("❌ Erro ao salvar comentário:", err);
    }

    res.redirect("/comunidade");
};

exports.deleteComentario = async (req, res) => {
    try {
        await Comment.destroy({ where: { id: req.params.id } });

        // Redirect back to where the request came from (admin or community page)
        const referer = req.get('Referer');
        if (referer && referer.includes('/admin')) {
            res.redirect("/admin/comentarios");
        } else {
            res.redirect("/comunidade");
        }
    } catch (err) {
        console.error("Erro ao deletar comentário:", err);
        res.status(500).send("Erro ao deletar comentário.");
    }
};

exports.approveComentario = async (req, res) => {
    try {
        await Comment.update({ approved: true }, { where: { id: req.params.id } });
        res.redirect("/admin/comentarios");
    } catch (err) {
        console.error("Erro ao aprovar comentário:", err);
        res.status(500).send("Erro ao aprovar comentário.");
    }
};

exports.adminComments = async (req, res) => {
    try {
        const comments = await Comment.findAll({
            where: { approved: false },
            order: [["createdAt", "ASC"]]
        });
        res.render("admin-comments", { comments, titulo: "Moderação de Comentários" });
    } catch (err) {
        console.error("Erro ao carregar comentários para moderação:", err);
        res.status(500).send("Erro ao carregar comentários.");
    }
};
