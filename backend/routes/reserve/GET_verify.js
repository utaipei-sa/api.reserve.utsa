const express = require('express')
const { reservations } = require('../../models/mongodb')
const { ObjectId } = require('mongodb')
const router = express.Router()

/**
 * @openapi
 * /reserve/verify:
 *   get:
 *     tags:
 *       - reserve
 *     summary: 驗證預約紀錄
 *     description: 驗證預約紀錄
 *     operationId: GetVerify
 *     parameters:
 *       - name: id
 *         in: query
 *         description: 預約紀錄 ID
 *         required: true
 *         schema:
 *           type: string
 *           format: Object ID
 *     responses:
 *       '200':
 *         description: OK
 */
router.get('/verify', async function(req, res, next) {
    // get input and check
    const OBJECT_ID_REGEXP = /^[a-fA-F0-9]{24}$/  // ObjectId 格式 (652765ed3d21844635674e71)
    const id = req.query.id

    if (!OBJECT_ID_REGEXP.test(id)) {
        res
            .status(400)
            .json({ error: 'id format error' })
        return
    }

    // update reservation.verify from 0 to 1
    const result = await reservations.updateOne(
        { _id: new ObjectId(id) },
        { $set: { verify: 1 } },
    )

    // check result
    if (result.matchedCount === 0) {
        res
            .status(400)
            .json({ error: 'reservation not found' })
        return
    }
    if (result.modifiedCount === 0) {
        res
            .status(400)
            .json({ error: 'the reservation has been verified' })
        return
    }

    res.json({ message: 'success!' })
})

module.exports = router