const { Post } = require("../models/postModel");
let marked;

(async () => {
    const m = await import("marked");
    marked = m.marked;
})();

exports.index = async (req, res) => {
    try {
        const posts = await Post.findAll({ order: [["id", "DESC"]] });
        res.render("index", { posts, titulo: "Página Inicial - Florir" });
    } catch (err) {
        console.error("Erro ao carregar posts:", err);
        res.render("index", { posts: [] });
    }
};

exports.show = async (req, res) => {
    try {
        const post = await Post.findByPk(req.params.id);

        if (!post) return res.status(404).send("Post não encontrado");

        // Ensure marked is loaded
        if (!marked) {
            const m = await import("marked");
            marked = m.marked;
        }

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
};

exports.conteudo = async (req, res) => {
    const categoria = req.query.categoria || null;

    try {
        const posts = await Post.findAll();

        // pegar categorias únicas com base no summary (Wait, original code used category field but comment said summary? checking original code... yes, p.category.trim())
        const categorias = [...new Set(posts.map(p => p.category ? p.category.trim() : 'Geral'))];

        let postsFiltrados = posts;

        if (categoria) {
            postsFiltrados = posts.filter(p => p.category && p.category.trim() === categoria);
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
};

// Admin actions
exports.adminPanel = async (req, res) => {
    try {
        const posts = await Post.findAll({
            order: [["createdAt", "DESC"]],
        });

        res.render("admin", { posts, titulo: "Painel de administracao" });
    } catch (error) {
        console.error("Erro ao carregar o painel admin:", error);
        res.status(500).send("Erro ao carregar o painel de administração.");
    }
};

exports.createPage = (req, res) => {
    res.render("admin-create", { titulo: "Criar Novo Post" });
};

exports.create = async (req, res) => {
    const { title, summary, content, category, image } = req.body;

    try {
        await Post.create({
            title,
            summary,
            content,
            category: category ? category.trim().toLowerCase() : 'geral',
            image: image || '/default.jpg'
        });

        res.redirect("/admin");
    } catch (err) {
        console.error("Erro ao criar post:", err);
        res.status(500).send("Erro ao criar post.");
    }
};

exports.editPage = async (req, res) => {
    const postId = req.params.id;

    try {
        const post = await Post.findByPk(postId);
        if (!post) return res.status(404).send('Post não encontrado');

        res.render('edit', { post });
    } catch (err) {
        console.error('Erro ao carregar post para edição:', err);
        res.status(500).send('Erro ao carregar post');
    }
};

exports.update = async (req, res) => {
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
        res.redirect('/');
    } catch (err) {
        console.error('Erro ao atualizar post:', err);
        res.status(500).send('Erro ao atualizar post');
    }
};

exports.delete = async (req, res) => {
    const postId = req.params.id;

    try {
        const post = await Post.findByPk(postId);

        if (!post) {
            return res.status(404).send("Post não encontrado.");
        }

        await post.destroy();

        console.log("🗑️ Post deletado:", post.title);
        res.redirect('/admin');
    } catch (err) {
        console.error("Erro ao deletar post:", err);
        res.status(500).send("Erro ao deletar o post.");
    }
};
