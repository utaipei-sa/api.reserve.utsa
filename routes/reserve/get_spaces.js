import express from 'express'
import SpaceRepository from '../../repositories/space_repository.js'

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
  const data = await SpaceRepository.getAllSpaces()
  const return_data = data.map((element) => ({
    _id: element._id,
    name: element.name,
    open: element.open,
    exception_time: element.exception_time
  }))
  res.json({ data: return_data })
})

export default router
