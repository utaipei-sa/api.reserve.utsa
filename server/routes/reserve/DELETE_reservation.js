var express = require('express');
var ObjectID = require('mongodb').ObjectId;
var { reservations, spaces_reserved_time, items_reserved_time } = require('../../models/mongodb');
//const { Timestamp } = require('mongodb');
var router = express.Router();

router.delete('/reservation/:reservation_id', function(req, res, next) {
    res.json({ title: 'New Reservation' });
});

module.exports = router;