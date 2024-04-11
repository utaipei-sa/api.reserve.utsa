import createError from 'http-errors'
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import cors from 'cors'
import env from 'dotenv/config'
import { default as home_router } from './routes/home.js'
import { default as reserve_router } from './routes/reserve/index.js'
import { default as docs_router } from './docs/docs.js'
// var createError = require('http-errors')
// var express = require('express')
// var path = require('path')
// var cookieParser = require('cookie-parser')
// var logger = require('morgan')
// var cors = require('cors')
// var env = require('dotenv').config();
// var home_router = require('./routes/home')
// var reserve_router = require('./routes/reserve/index')
// var docs_router = require('./docs/docs')

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
app.use(function(req, res, next) {
  next(createError(404))
})

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

export default app
