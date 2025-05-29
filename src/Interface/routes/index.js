var express = require('express');
var router = express.Router();
var axios = require('axios');
const session = require('express-session');
const upload = require('../../API_de_dados/models/upload');

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

router.get('/file/:id', async (req, res) => {
  const fileId = req.params.id;
  const token = req.session.token;
  try {
    const axiosConfig = {
      responseType: 'stream',
      headers: {}
    };
    if (token) {
      axiosConfig.headers.Authorization = `Bearer ${token}`;
    }
    const axiosResponse = await axios.get(`http://localhost:3001/upload/files/${fileId}`, axiosConfig);
    res.setHeader('Content-Type', axiosResponse.headers['content-type']);
    axiosResponse.data.pipe(res);
  } catch (err) {
    console.error('Erro ao obter ficheiro:', err.message);
    res.status(500).send('Erro ao obter ficheiro');
  }
});

router.get('/users', (req, res) => {
  const user = req.query.user;
  var date = new Date().toLocaleString('pt-PT', { hour12: false });
  axios.get(`http://localhost:3001/upload/diary/${user}`, {
    headers: {
      Authorization: `Bearer ${req.session.token}`
    }
  }).then(resp => {
    res.render('diary',{title: `Diário de ${user}`, date: date, diary: resp.data, role: req.session.level, username: req.session.user});
  }).catch(function (error) {
    res.render('error',{title: "Erro", date: date, message : "Erro ao ler o diário", error: error});
  });
});

router.get('/myDiary', function(req, res, next) {
  var date = new Date().toLocaleString('pt-PT', { hour12: false });
  axios.get(`http://localhost:3001/upload/diary/${req.session.user}`, {
    headers: {
      Authorization: `Bearer ${req.session.token}`
    }
  }).then(resp => {
    res.render('myDiary',{title: "O Meu Diário", date: date, diary: resp.data, role: req.session.level, username: req.session.user});
  }).catch(function (error) {
    res.render('error',{title: "Erro", date: date, message : "Erro ao ler o diário", error: error});
  });
});

router.get('/uploads/:id', function(req, res, next) {
  var date = new Date().toLocaleString('pt-PT', { hour12: false });
  axios.get(`http://localhost:3001/upload/${req.params.id}`, {
    headers: {
      Authorization: `Bearer ${req.session.token}`
    }
  }).then(resp => {
    res.render('upload',{title: resp.data.description, date: date, upload: resp.data, role: req.session.level, username: req.session.user, token: req.session.token});
  }).catch(function (error) {
    res.render('error',{title: "Erro", date: date, message : "Erro ao ler o upload", error: error});
  });
});

router.get('/registar', function(req, res, next) {
  var date = new Date().toLocaleString('pt-PT', { hour12: false });
  res.render('registar',{title: "Adicionar Item", date: date, role: req.session.level, username: req.session.user});
});

router.post('/registar', function(req, res, next) {
  var date = new Date().toLocaleString('pt-PT', { hour12: false });
  req.body.user = req.session.user;
  req.body.token = req.session.token;
  axios.post('http://localhost:3001/upload/', req.body, {
    headers: {
      Authorization: `Bearer ${req.session.token}`
    }
  }).then(resp => {
    res.redirect('/myDiary');
  }).catch(function (error) {
    res.render('error',{title: "Erro", date: date, message : "Erro ao fazer upload", error: error});
  });
});


router.get('/logout', function(req, res, next) {
  delete req.session.user;
  delete req.session.level;
  delete req.session.token;
  res.redirect('/');
});

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
    req.session.token = resp.data.token;
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
    req.session.token = resp.data.token;
    res.redirect('/')
  }).catch(function (error) {
    req.session.signupError = "Erro ao criar utilizador: " + (error.response?.data?.message || "Tente novamente.");
    res.redirect('/signup');
  });
});

module.exports = router;
