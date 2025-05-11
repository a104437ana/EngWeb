var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  var date = new Date().toLocaleString('pt-PT', { hour12: false });
  res.render('home',{title: "O Meu Eu Digital", date: date});
});

router.get('/home', function(req, res, next) {
  var date = new Date().toLocaleString('pt-PT', { hour12: false });
  res.render('home',{title: "I am ... (in bits and bytes)", date: date,role:"cons"});
});

router.get('/users', function(req, res, next) {
  var date = new Date().toLocaleString('pt-PT', { hour12: false });
  res.render('users',{title: "Utilizadores", date: date,role:"admin"});
});

router.get('/recursos', function(req, res, next) {
  var date = new Date().toLocaleString('pt-PT', { hour12: false });
  res.render('recursos',{title: "Recursos", date: date,role:"admin"});
});

router.get('/stats', function(req, res, next) {
  var date = new Date().toLocaleString('pt-PT', { hour12: false });
  res.render('stats',{title: "Estatísticas", date: date,role:"admin"});
});

router.get('/news', function(req, res, next) {
  var date = new Date().toLocaleString('pt-PT', { hour12: false });
  res.render('news',{title: "Notícias", date: date,role:"admin"});
});

router.get('/diary', function(req, res, next) {
  var date = new Date().toLocaleString('pt-PT', { hour12: false });
  res.render('diary',{title: "O Meu Diário", date: date,role:"cons"});
});

router.get('/registar', function(req, res, next) {
  var date = new Date().toLocaleString('pt-PT', { hour12: false });
  res.render('registar',{title: "Adicionar Item", date: date,role:"cons"});
});

router.get('/login', function(req, res, next) {
  var date = new Date().toLocaleString('pt-PT', { hour12: false });
  res.render('login',{title: "Log in", date: date});
});

router.get('/signup', function(req, res, next) {
  var date = new Date().toLocaleString('pt-PT', { hour12: false });
  res.render('signup',{title: "Sign up", date: date});
});

module.exports = router;
