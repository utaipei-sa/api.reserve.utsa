import createError from 'http-errors'
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import cors from 'cors'
import home_router from './routes/home.js'
import reserve_router from './routes/reserve/index.js'
import docs_router from './docs/docs.js'
import RateLimit from 'express-rate-limit';

const app = express()

// view engine setup
// app.set('views', path.join(__dirname, 'views'))
// app.set('view engine', 'hbs')

const __filename = fileURLToPath(import.meta.url) // get the resolved path to the file
const __dirname = path.dirname(__filename) // get the name of the directory

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

const limiter = RateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);
// cors
const corsOptions = {
  origin: [
    'http://localhost:7414'
  ],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: ['Content-Type', 'Authorization']
}

app.use(cors())
app.use(cors(corsOptions))

// routes
app.use(home_router)
app.use('/api/v1', reserve_router)
app.use(docs_router)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  // res.render('error')
  console.error(err.stack)
  res.send('error')
})

export default app
