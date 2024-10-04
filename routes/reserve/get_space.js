import express from 'express'
import { param, validationResult } from 'express-validator'
import SpaceRepository from '../../repositories/space_repository.js'
import {
  error_response,
  R_ID_NOT_FOUND,
  R_INVALID_INFO
} from '../../utilities/response.js'
import { OBJECT_ID_REGEXP } from '../../utilities/input_format.js'

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
 *                   example: R_INVALID_INFO
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
router.get('/space/:space_id', [
  param('space_id').matches(OBJECT_ID_REGEXP).withMessage('space_id format error')
], async function (req, res, next) {
  // check space_id format
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res
      .status(400)
      .json(error_response(R_INVALID_INFO, errors.array().map(error => error.msg).join('\n')))
    return
  }

  // get data
  const data = await SpaceRepository.findSpaceById(req.params.space_id)

  // check if data is found
  if (data === null) {
    res.status(404).json(error_response(R_ID_NOT_FOUND, 'space_id not found'))
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
