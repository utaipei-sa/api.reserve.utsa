import express from 'express'
import { ObjectId } from 'mongodb'
import { spaces } from '../../models/mongodb.js'

const router = express.Router()

/**
 * @openapi
 * /reserve/space/{space_id}:
 *   get:
 *     tags:
 *       - reserve
 *     summary: 查詢場地資料
 *     description: 查詢場地資料
 *     operationId: GetSpace
 *     parameters:
 *       - name: space_id
 *         in: path
 *         description: 場地 _id
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
 *               $ref: '#/components/schemas/Space'
 *       '400':
 *         description: space_id format error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error_code:
 *                   type: string
 *                   example: R_FORMAT_ERROR
 *                 message:
 *                   type: string
 *                   example: space_id format error
 *       '404':
 *         description: space_id not found
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
 *                   example: space_id not found
 */
router.get('/space/:space_id', async function (req, res, next) {
  const OBJECT_ID_REGEXP = /^[a-fA-F0-9]{24}$/ // ObjectId 格式 (652765ed3d21844635674e71)
  const space_id = req.params.space_id

  // check space_id format
  if (!OBJECT_ID_REGEXP.test(space_id)) {
    res
      .status(400)
      .json({
        error_code: 'R_FORMAT_ERROR',
        message: 'space_id format error'
      })
    return
  }

  // get data
  const data = await spaces.findOne({ _id: new ObjectId(req.params.space_id) })

  // check if data is found
  if (data === null) {
    res
      .status(404)
      .json({
        error_code: 'R_ID_NOT_FOUND',
        message: 'space_id not found'
      })
    return
  }

  // return
  res.json({
    _id: data._id,
    name: data.name,
    open: data.open,
    exception_time: data.exception_time
  })
})

export default router
