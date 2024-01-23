var express = require('express');
var ObjectID = require('mongodb').ObjectId;
var { reservations, spaces_reserved_time, items_reserved_time } = require('../../models/mongodb');
//const { Timestamp } = require('mongodb');
var router = express.Router();

/**
 * @openapi
 * /reserve/reservation/{reservation_id}:
 *   put:
 *     tags:
 *       - reserve
 *     summary: 更新單筆預約紀錄
 *     description: 更新單筆預約紀錄
 *     operationId: PutReservation
 *     parameters:
 *       - name: reservation_id
 *         in: path
 *         description: 預約紀錄 ID
 *         required: true
 *         schema:
 *           type: string
 *           format: Object ID
 *     requestBody:
 *       description: 更新的預約紀錄
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReservationUpdate'
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reservation'
 */
router.put('/reservation/:reservation_id', function(req, res, next) {
    res.json({ title: 'New Reservation' });
});

module.exports = router;