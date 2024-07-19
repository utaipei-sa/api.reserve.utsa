import express from 'express'
import { ObjectId } from 'mongodb'
import { reservations } from '../../models/mongodb.js'
import { error_response, R_SUCCESS, R_ID_NOT_FOUND, R_INVALID_INFO } from '../../utilities/response.js'

const router = express.Router()
/**
 * @openapi
 * /reserve/verify/{reservation_id}:
 *   patch:
 *     tags:
 *       - reserve
 *     summary: 進行預約驗證
 *     description: 進行預約驗證
 *     operationId: PatchVerify
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
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                 message:
 *                   type: string
 *       '400':
 *         description: reservation_id format error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error_code:
 *                   type: string
 *                   example: R_INVALID_INFO
 *                 message:
 *                   type: string
 *                   example: reservation_id format error
 *       '404':
 *         description: reservation_id not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error_code:
 *                   type: string
 *                   example: R_ID_NOT_FOUND
 *                 message:
 *                   type: string
 *                   example: reservation_id not found
 */
router.patch('/verify/:reservation_id', async function (req, res, next) {
  const OBJECT_ID_REGEXP = /^[a-fA-F0-9]{24}$/ // ObjectId 格式 (652765ed3d21844635674e71)
  const reservation_id = req.params.reservation_id
  if (!OBJECT_ID_REGEXP.test(reservation_id)) {
    res
      .status(400)
      .json(error_response(R_INVALID_INFO, 'reservation_id format error'))
    return
  }

  const result = await reservations.updateOne(
    { _id: new ObjectId(req.params.reservation_id) },
    { $set: { verify: 1 } }
  )
  if (result.matchedCount === 0) {
    res
      .status(404)
      .json(error_response(R_ID_NOT_FOUND, 'reservation_id not found'))
    return
  }

  res.status(200).json({
    code: R_SUCCESS,
    message: 'success!'
  })
})

export default router
