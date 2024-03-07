var express = require('express');
var ObjectID = require('mongodb').ObjectId;
var { reservations, spaces_reserved_time, items_reserved_time } = require('../../models/mongodb');
//const { Timestamp } = require('mongodb');
var router = express.Router();

/**
 * @openapi
 * /reserve/reservation/{reservation_id}:
 *   get:
 *     tags:
 *       - reserve
 *     summary: 取得單筆預約紀錄
 *     description: 取得單筆預約紀錄
 *     operationId: GetReservation
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
router.get('/reservation/:reservation_id', async function(req, res, next) {
    const objectId_format = new RegExp('^[a-fA-F0-9]{24}$');  // ObjectId 
    const reservation_id=req.params.reservation_id
    if(!objectId_format.test(reservation_id)){
        return res.status(400).json({ error: 'object_id format error' });
    }
    const result = await reservations.findOne({"_id": new ObjectID(req.params.reservation_id)});
    if(result === null){
        return res.status(400).json({ error: '請提供有效的預約紀錄ID' });
    }
    res.json(result);
});

module.exports = router;