var express = require('express');
var { spaces } = require('../../models/mongodb');
var router = express.Router();

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
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Space'
 */
router.get('/spaces', async function(req, res, next) {
    const data = await spaces.find({})
                             .project({ _id: 1, name: 1})
                             .toArray(function(err, results){
                                 console.log(results);
                             });
    res.json({data: data});
});

module.exports = router;