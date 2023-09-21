var express = require('express');
var router = express.Router();

/* GET signin page. */
router.get('/signin', function(req, res, next) {
    res.render('signin', { title: 'Sign in or sign up' });
});

/* POST signin process */
router.post('/signin', function(req, res, next) {
    res.redirect('/dashboard');
});

module.exports = router;
