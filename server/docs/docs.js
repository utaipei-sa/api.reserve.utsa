const docs_router = require('express').Router();
const swagger_jsdoc = require('swagger-jsdoc');
const swagger_ui = require('swagger-ui-express');
const fs = require("fs")
const YAML = require('yaml')

const file  = fs.readFileSync('./docs/openapi.yaml', 'utf8')
const definition = YAML.parse(file)

const options = {
    definition: definition,
    apis: ['./routes/reserve/*.js'], // files containing annotations
};
const openapi_specification = swagger_jsdoc(options);
docs_router.use('/docs', swagger_ui.serve, swagger_ui.setup(openapi_specification));

module.exports = docs_router;