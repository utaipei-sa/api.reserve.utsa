var express = require('express');
//var { reservations } = require('../models/mongodb');
var router = express.Router();

router.get('/reservation/:reservation_id', function(req, res, next) {
    req.params; // { reservationId: '42' }
    res.json({ title: 'New Reservation' });
});

router.post('/reservation', function(req, res, next) {
    //req.body.{{param}}
    res.json({ title: 'New Reservation' });
});

router.put('/reservation/:reservation_id', function(req, res, next) {
    res.json({ title: 'New Reservation' });
});

router.delete('/reservation/:reservation_id', function(req, res, next) {
    res.json({ title: 'New Reservation' });
});

module.exports = router;