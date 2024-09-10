function errorHandler(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send({ error: 'Algo deu errado!' });
}

module.exports = errorHandler;
