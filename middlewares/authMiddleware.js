function isAdmin(req, res, next) {
    // Verifica se existe sessão, usuário e se é admin
    if (req.session && req.session.user && req.session.user.isAdmin) {
        return next();
    }
    // Se não for admin, redireciona para login
    return res.redirect("/login");
}

module.exports = { isAdmin };
