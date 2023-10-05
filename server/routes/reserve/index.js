const reserve_router = require('express').Router();

reserve_router.use('/reserve', require('./reservation'));
reserve_router.use('/reserve', require('./spaces'));
reserve_router.use('/reserve', require('./items'));
reserve_router.use('/reserve', require('./spaceAvailability'));
reserve_router.use('/reserve', require('./spaceAvailabilities'));
reserve_router.use('/reserve', require('./itemAvailability'));
reserve_router.use('/reserve', require('./itemAvailabilities'));

module.exports = reserve_router;