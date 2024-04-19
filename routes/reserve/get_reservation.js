import express from 'express'
import { ObjectId } from 'mongodb'
import { reservations, spaces_reserved_time, items_reserved_time } from '../../models/mongodb.js'
import dayjs from 'dayjs'
// import { Timestamp } from 'mongodb'

const router = express.Router()

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
router.get('/reservation/:reservation_id', async function (req, res, next) {
  const OBJECT_ID_REGEXP = /^[a-fA-F0-9]{24}$/ // ObjectId 格式 (652765ed3d21844635674e71)
  const reservation_id = req.params.reservation_id

  if (!OBJECT_ID_REGEXP.test(reservation_id)) {
    res
      .status(400)
      .json({ error: 'object_id format error' })
    return
  }

  const result = await reservations.findOne({ _id: new ObjectId(req.params.reservation_id) })
  if (result === null) {
    res
      .status(400)
      .json({ error: 'reservation not found' })
    return
  }
  res.json(result)
})

export default router
