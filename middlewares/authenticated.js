const autenticacion = (req, res, next) => {
    let token = req.headers.authorization;
    token == process.env.TOKEN_AUTORIZACION
      ? next()
      : res.status(403).send({ message: "No tienes autorización" });
  };

  module.exports = { autenticacion };
