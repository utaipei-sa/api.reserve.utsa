import express from 'express'
import { spaces } from '../../models/mongodb.js'

const router = express.Router()

/**
 * @openapi
 * /reserve/spaces:
 *   get:
 *     tags:
 *       - reserve
 *     summary: 取得場地清單
 *     description: 取得場地清單
 *     operationId: GetSpaces
 *     responses:
 *       '200':
 *         description: A list of spaces
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   description: 場地清單
 *                   items:
 *                     $ref: '#/components/schemas/Space'
 */
router.get('/spaces', async function (req, res, next) {
  const data = await spaces
    .find({})
    .project({ _id: 1, name: 1, open: 1, exception_time: 1 })
    .toArray()
  const return_data = data.map((element) => {
    return {
      _id: element._id,
      name: element.name,
      open: element.open,
      exception_time: element.exception_time
    }
  })
  res.json({ data: return_data })
})

export default router
