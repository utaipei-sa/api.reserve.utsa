import express from 'express'
const reserve_router = express.Router()
// const reserve_router = require('express').Router()

const root = '/reserve'
function useRouter(router) {
    reserve_router.use(root, router)
}

async function useRouters() {
    reserve_router.use(root, (await import('./get_items.js')).default)
    reserve_router.use(root, (await import('./get_spaces.js')).default)
    reserve_router.use(root, (await import('./get_integral_space_availability.js')).default)
    reserve_router.use(root, (await import('./get_interval_space_availability.js')).default)
    reserve_router.use(root, (await import('./get_integral_item_availability.js')).default)
    reserve_router.use(root, (await import('./get_interval_item_availability.js')).default)
    reserve_router.use(root, (await import('./get_reservation.js')).default)
    reserve_router.use(root, (await import('./post_reservation.js')).default)
    reserve_router.use(root, (await import('./put_reservation.js')).default)
    reserve_router.use(root, (await import('./delete_reservation.js')).default)
    reserve_router.use(root, (await import('./get_verify.js')).default)
}

// import('./get_items.js').then(useRouter)
// import('./get_spaces.js').then(useRouter)
// import('./get_integral_space_availability.js').then(useRouter)
// import('./get_interval_space_availability.js').then(useRouter)
// import('./get_integral_item_availability.js').then(useRouter)
// import('./get_interval_item_availability.js').then(useRouter)
// import('./get_reservation.js').then(useRouter)
// import('./post_reservation.js').then(useRouter)
// import('./put_reservation.js').then(useRouter)
// import('./delete_reservation.js').then(useRouter)
// import('./get_verify.js').then(useRouter)

// reserve_router.use(root, require('./get_items'))
// reserve_router.use(root, require('./get_spaces'))
// reserve_router.use(root, require('./get_integral_space_availability'))
// reserve_router.use(root, require('./get_interval_space_availability'))
// reserve_router.use(root, require('./get_integral_item_availability'))
// reserve_router.use(root, require('./get_interval_item_availability'))
// reserve_router.use(root, require('./get_reservation'))
// reserve_router.use(root, require('./post_reservation'))
// reserve_router.use(root, require('./put_reservation'))
// reserve_router.use(root, require('./delete_reservation'))
// reserve_router.use(root, require('./get_verify'))

useRouters()

export default reserve_router
