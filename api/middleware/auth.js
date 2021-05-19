const jwt = require("jsonwebtoken");
const { mensajes } = require("../config");
const secreto = process.env.JWT_SECRET;

const estaAutenticado = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).send({ respuesta: mensajes.forbiddenAccess });
  }
  jwt.verify(token, secreto, (error, decoded) => {
    if (error) {
      return res.status(401).send({ respuesta: mensajes.forbiddenAccess });
    }
    const { _id, numeroPaciente } = decoded;
    req.idPaciente = _id;
    req.numeroPaciente = numeroPaciente;
    next();
  });
};

module.exports = estaAutenticado;
