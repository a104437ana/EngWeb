var express = require('express');
var router = express.Router();
var File = require('../controllers/file')
var path = require('path');
const Auth = require('../auth/auth')

router.get('/:id', Auth.validateGetFile, async function(req, res, next) {
  date = new Date().toISOString();
  const file = await File.findById(req.params.id);
  if (!file) return res.status(404).send('Ficheiro não encontrado');
  const filePath = path.resolve(file.path);
  res.sendFile(filePath);
});

module.exports = router;
