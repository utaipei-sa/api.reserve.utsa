var express = require('express');
var { reservations } = require('../models/mongodb');
var router = express.Router();

router.get('/reservation/:reservationId', function(req, res, next) {
    req.params; // { reservationId: '42' }
    res.json({ title: 'New Reservation' });
});

router.post('/reservation', function(req, res, next) {
    res.json({ title: 'New Reservation' });
});

router.put('/reservation/:reservationId', function(req, res, next) {
    res.json({ title: 'New Reservation' });
});

router.delete('/reservation/:reservationId', function(req, res, next) {
    res.json({ title: 'New Reservation' });
});

module.exports = router;
