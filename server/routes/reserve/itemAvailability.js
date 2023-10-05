var express = require('express');
//var { items } = require('../models/mongodb');
var router = express.Router();

router.get('/itemAvailability/:item_id', function(req, res, next) {
    req.params;
    res.json({ title: 'item availability' });
});

module.exports = router;