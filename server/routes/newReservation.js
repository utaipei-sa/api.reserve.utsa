var express = require('express');
var { reservations } = require('../models/mongodb');
var router = express.Router();

router.post('/NewReservation', function(req, res, next) {
    // check req and insert into database
    res.json({ title: 'NewReservation' });
});

module.exports = router;
