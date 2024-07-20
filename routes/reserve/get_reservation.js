import express from 'express'
import { ObjectId } from 'mongodb'
import { reservations } from '../../models/mongodb.js'
import { error_response, R_ID_NOT_FOUND, R_INVALID_INFO } from '../../utilities/response.js'
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
      .json(error_response(R_INVALID_INFO, 'object_id format error'))
    return
  }

  const result = await reservations.findOne({ _id: new ObjectId(req.params.reservation_id) })
  if (result === null) {
    res
      .status(400)
      .json(error_response(R_ID_NOT_FOUND, 'reservation not found'))
    return
  }

  const { _id, verify, status, history, ...data } = result

  const submitTimestamp = result.history[0].submit_timestamp
  const serverTimestamp = result.history[0].server_timestamp
  const FinalResult = {
    ...data,
    submit_timestamp: submitTimestamp,
    server_timestamp: serverTimestamp
  }
  res.json(FinalResult)
})

export default router
