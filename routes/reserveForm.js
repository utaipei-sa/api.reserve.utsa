var express = require('express');
var router = express.Router();

/* GET reserve page. */
router.get('/form', function(req, res, next) {
    res.render('index', { title: 'Reserve form' });
});

module.exports = router;