import express from 'express'
import { v4 as uuidv4 } from 'uuid'
const router = express.Router()

router.get('/', function (req, res, next) {
  res.json({ title: 'home' })
})

router.use((req, res, next) => {
  req.id = uuidv4()
  console.log(req.id + '\n', req.body)
  next()
})

export default router
