var express = require('express');
var { spaces } = require('../../models/mongodb');
var router = express.Router();

router.get('/spaces', async function(req, res, next) {
    const data = await spaces.find({})
                             .project({ _id: 1, name: 1})
                             .toArray(function(err, results){
                                 console.log(results);
                             });
    res.json({data: data});
});

module.exports = router;