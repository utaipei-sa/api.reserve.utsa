import express from 'express'
import ItemRepository from '../../repositories/item_repository.js'

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
  const data = await ItemRepository.getAllItems()

  const return_data = data.map((element) => ({
    _id: element._id,
    name: element.name,
    quantity: element.quantity,
    exception_time: element.exception_time
  }))
  res.json({ data: return_data })
})

export default router
