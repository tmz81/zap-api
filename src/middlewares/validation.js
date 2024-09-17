const validateRequest = (req, res, next) => {
  const { number, message, repeatTimes } = req.body;

  if (!number || !message || !repeatTimes) {
    return res
      .status(400)
      .send({
        error:
          "Todos os campos são obrigatórios: número, mensagem e repetição.",
      });
  }

  if (isNaN(number) || number.length !== 8) {
    return res
      .status(400)
      .send({ error: "Número inválido. Deve conter 8 dígitos." });
  }

  if (isNaN(repeatTimes) || repeatTimes <= 0) {
    return res
      .status(400)
      .send({ error: "Quantidade de vezes deve ser um número positivo." });
  }

  next();
};

module.exports = validateRequest;
