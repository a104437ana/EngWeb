var express = require('express');
var router = express.Router();
var axios = require('axios');
const session = require('express-session');

/* GET home page. */
router.get('/', function(req, res, next) {
  var date = new Date().toLocaleString('pt-PT', { hour12: false });
  res.render('home',{title: "O Meu Eu Digital", date: date, role: req.session.level, username: req.session.user});
});

//router.get('/home', function(req, res, next) {
//  var date = new Date().toLocaleString('pt-PT', { hour12: false });
//  res.render('home',{title: "I am ... (in bits and bytes)", date: date,role:"cons"});
//});

//router.get('/users', function(req, res, next) {
//  var date = new Date().toLocaleString('pt-PT', { hour12: false });
//  res.render('users',{title: "Utilizadores", date: date,role:"admin"});
//});

//router.get('/recursos', function(req, res, next) {
//  var date = new Date().toLocaleString('pt-PT', { hour12: false });
//  res.render('recursos',{title: "Recursos", date: date,role:"admin"});
//});

//router.get('/stats', function(req, res, next) {
//  var date = new Date().toLocaleString('pt-PT', { hour12: false });
//  res.render('stats',{title: "Estatísticas", date: date,role:"admin"});
//});

//router.get('/news', function(req, res, next) {
//  var date = new Date().toLocaleString('pt-PT', { hour12: false });
//  res.render('news',{title: "Notícias", date: date,role:"admin"});
//});

//router.get('/diary', function(req, res, next) {
//  var date = new Date().toLocaleString('pt-PT', { hour12: false });
//  res.render('diary',{title: "O Meu Diário", date: date,role:"cons"});
//});

//router.get('/registar', function(req, res, next) {
//  var date = new Date().toLocaleString('pt-PT', { hour12: false });
//  res.render('registar',{title: "Adicionar Item", date: date,role:"cons"});
//});

router.get('/login', function(req, res, next) {
  var date = new Date().toLocaleString('pt-PT', { hour12: false });
  const errorMsg = req.session.loginError;
  delete req.session.loginError;
  res.render('login',{title: "Log in", date: date, error: errorMsg});
});

router.post('/login', function(req, res, next) {
  if(req.body.username=="ADMIN"){
    req.body.level = 1;
  }
  else{
    req.body.level = 0;
  }
  axios.post(`http://localhost:3002/users/login`, req.body).then(resp => {
    req.session.user = req.body.username;
    req.session.level = req.body.level;
    res.redirect('/');
  }).catch(function (error) {
    req.session.loginError = "Erro no login: " + (error.response?.data?.message || "Tente novamente.");
    res.redirect('/login');
  });
});

router.get('/signup', function(req, res, next) {
  var date = new Date().toLocaleString('pt-PT', { hour12: false });
  const errorMsg = req.session.signupError;
  delete req.session.signupError;
  res.render('signup', {title: "Sign up", date: date, error: errorMsg });
});

router.post('/signup', function(req, res, next) {
  axios.post(`http://localhost:3002/users/`, req.body).then(resp => {
    req.session.user = req.body.username;
    req.session.level = 0;
    res.redirect('/')
  }).catch(function (error) {
    req.session.signupError = "Erro ao criar utilizador: " + (error.response?.data?.message || "Tente novamente.");
    res.redirect('/signup');
  });
});

module.exports = router;
