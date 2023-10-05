const reserve_router = require('express').Router();

const root = '/reserve';

reserve_router.use(root, require('./reservation'));
reserve_router.use(root, require('./items'));
reserve_router.use(root, require('./spaces'));
reserve_router.use(root, require('./spaceAvailability'));
reserve_router.use(root, require('./spaceAvailabilities'));
reserve_router.use(root, require('./itemAvailability'));
reserve_router.use(root, require('./itemAvailabilities'));

module.exports = reserve_router;