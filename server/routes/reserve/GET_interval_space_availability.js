var express = require('express');
//var { spaces } = require('../../models/mongodb');
var router = express.Router();

router.get('/interval_space_availability', function(req, res, next) {
    req.params;
    res.json({ title: 'space availabilities' });
});

module.exports = router;