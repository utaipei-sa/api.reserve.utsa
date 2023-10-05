var express = require('express');
//var { items } = require('../models/mongodb');
var router = express.Router();

router.get('/itemAvailabilities/:item_id', function(req, res, next) {
    req.params;
    res.json({ title: 'item availabilities' });
});

module.exports = router;