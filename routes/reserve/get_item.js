import express from 'express'
import { ObjectId } from 'mongodb'
import { items } from '../../models/mongodb.js'
import { error_response, R_ID_NOT_FOUND, R_INVALID_INFO } from '../../utilities/response.js'

const router = express.Router()

/**
 * @openapi
 * /reserve/item/{item_id}:
 *   get:
 *     tags:
 *       - reserve
 *     summary: 查詢物品資料
 *     description: 查詢物品資料
 *     operationId: GetItem
 *     parameters:
 *       - name: item_id
 *         in: path
 *         description: 物品 _id
 *         required: true
 *         schema:
 *           type: string
 *           format: Object ID
 *     responses:
 *       '200':
 *         description: item data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Item'
 *       '400':
 *         description: item_id format error
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
 *                   example: item_id format error
 *       '404':
 *         description: item_id not found
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
 *                   example: item_id not found
 */
router.get('/item/:item_id', async function (req, res, next) {
  const OBJECT_ID_REGEXP = /^[a-fA-F0-9]{24}$/ // ObjectId 格式 (652765ed3d21844635674e71)
  const item_id = req.params.item_id

  // check item_id format
  if (!OBJECT_ID_REGEXP.test(item_id)) {
    res
      .status(400)
      .json(error_response(R_INVALID_INFO, 'item_id format error'))
    return
  }

  // get data
  const data = await items.findOne({ _id: new ObjectId(req.params.item_id) })

  // check if data is found
  if (data === null) {
    res
      .status(404)
      .json(error_response(R_ID_NOT_FOUND, 'item_id not found'))
    return
  }

  // return
  res.json({
    _id: data._id,
    name: data.name,
    quantity: data.quantity,
    exception_time: data.exception_time
  })
})

export default router
