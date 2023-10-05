var express = require('express');
//var { items } = require('../models/mongodb');
var router = express.Router();

router.get('/items/:item_id', function(req, res, next) {
    req.params;
    res.json({ title: 'items' });
});

module.exports = router;