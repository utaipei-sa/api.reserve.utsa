import express from 'express'
import { items } from '../../models/mongodb.js'

const router = express.Router()

/**
 * @openapi
 * /reserve/items:
 *   get:
 *     tags:
 *       - reserve
 *     summary: 取得物品清單
 *     description: 取得物品清單
 *     operationId: GetItems
 *     responses:
 *       '200':
 *         description: A list of items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   description: 物品清單
 *                   items:
 *                     $ref: '#/components/schemas/Item'
 */
router.get('/items', async function (req, res, next) {
  const data = await items
    .find({})
    .project({ _id: 1, name: 1, quantity: 1, exception_time: 1 })
    .toArray()
  console.log('\x1B[34m%s\x1B[0m', 'data:----------------------------')
  console.log(data)
  console.log('\x1B[34m%s\x1B[0m', 'data:----------------------------end')

  const return_data = data.map((element) => ({
    _id: element._id,
    name: element.name,
    quantity: element.quantity,
    exception_time: element.exception_time
  }))
  console.log('\x1B[34m%s\x1B[0m', 'return_data:--------------------------------')
  console.log(return_data)
  res.json({ data: return_data })
  console.log('\x1B[34m%s\x1B[0m', 'return_data:--------------------------------end')
})

export default router
