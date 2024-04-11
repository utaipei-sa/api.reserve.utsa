import express from 'express'
import swagger_jsdoc from 'swagger-jsdoc'
import swagger_ui from 'swagger-ui-express'
import fs from 'fs'
import YAML from 'yaml'
import path from 'path'
import { fileURLToPath } from 'url'
// const swagger_jsdoc = require('swagger-jsdoc');
// const swagger_ui = require('swagger-ui-express');
// const fs = require("fs")
// const YAML = require('yaml')
// const path = require('path');

const __filename = fileURLToPath(import.meta.url) // get the resolved path to the file
const __dirname = path.dirname(__filename) // get the name of the directory

const docs_router = express.Router()

const file  = fs.readFileSync('./docs/openapi.yaml', 'utf8')
const definition = YAML.parse(file)

const options = {
  definition: definition,
  apis: ['./routes/reserve/*.js'], // files containing annotations
}
const openapi_specification = swagger_jsdoc(options)  // generate full openAPI json data

// openapi.json
docs_router.get('/openapi.json', async function(req, res, next) {
  res.send(openapi_specification)
})

// swagger ui
docs_router.use('/docs', swagger_ui.serve, swagger_ui.setup(openapi_specification))

// redoc
docs_router.get('/redoc', async function(req, res, next) {
  res.sendFile(path.join(__dirname, '../public/redoc.html'))
})

export default docs_router
