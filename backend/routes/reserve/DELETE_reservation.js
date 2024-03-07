var express = require('express');
var ObjectID = require('mongodb').ObjectId;
var { reservations, spaces_reserved_time, items_reserved_time } = require('../../models/mongodb');
//const { Timestamp } = require('mongodb');
var router = express.Router();

/**
 * @openapi
 * /reserve/reservation/{reservation_id}:
 *   delete:
 *     tags:
 *       - reserve
 *     summary: 刪除單筆預約紀錄
 *     description: 刪除單筆預約紀錄
 *     operationId: DeleteReservation
 *     parameters:
 *       - name: reservation_id
 *         in: path
 *         description: 預約紀錄 ID
 *         required: true
 *         schema:
 *           type: string
 *           format: Object ID
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reservation'
 */
router.delete('/reservation/:reservation_id', function(req, res, next) {
    res.json({ title: 'New Reservation' });
});

module.exports = router;