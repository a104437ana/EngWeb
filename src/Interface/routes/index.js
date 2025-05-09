var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/home', function(req, res, next) {
  var date = new Date().toLocaleString('pt-PT', { hour12: false });
  res.render('home',{title: "I am ...", date: date});
});

router.get('/login', function(req, res, next) {
  var date = new Date().toLocaleString('pt-PT', { hour12: false });
  res.render('login',{title: "Erro", date: date});
});

router.get('/signup', function(req, res, next) {
  var date = new Date().toLocaleString('pt-PT', { hour12: false });
  res.render('signup',{title: "Erro", date: date});
});

module.exports = router;
