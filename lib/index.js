/**
 *  index.js
 *
 *    Start the web server
 */


// Module dependencies
var fs = require('fs')
var path = require('path')
var https = require('https')
var cli = require('commander')
var async = require('async')
var utils = require('./utils')
var version = require('../package.json').version
var service = require('proxireq')
var log = console.error


// Module vars
var configFileName = 'config.json'
var _config


// Command-line options
cli
  .version(version)
  .option('-c, --config <file>', 'config file [config.json]')
  .parse(process.argv)


// Find the config file
if (cli.config) configFileName = cli.config
_config = require(path.join('../config', configFileName))
log(_config)


// Set globals
global.util = require('util')
global._ = require('lodash')
global.tipe = require('tipe')
global.scrub = require('scrub')
global.config = _config
global.log = utils.log
global.schemas = {}


// Load the proxibase service http request client
var service = require('proxireq').config({serviceUri: config.serviceUri})


// Load the app
var app = require('./app')


// Accept unsigned ssl certs in dev and test modes
if ('development' === config.mode || 'test' === config.mode) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0
}


// Figure out SSL keys
var ssl = config.ssl
var sslOptions = {
  key: fs.readFileSync(ssl.keyFilePath),
  cert: fs.readFileSync(ssl.certFilePath)
}


// Set up the certificate authority
if (tipe.isString(ssl.caFilePath)) {
  sslOptions.ca = fs.readFileSync(ssl.caFilePath)
}
else if (tipe.isArray(ssl.caFilePath)) {
  sslOptions.ca = []
  ssl.caFilePath.forEach(function(path) {
    sslOptions.ca.push(fs.readFileSync(path))
  })
}


// Construct the web server's uri
config.uri = config.protocol + '://' + config.host
if (config.port !== 80 && config.port !== 443) {
  config.uri += ':' + config.port
}


// Call the service and load the schemas
service.get('/schemas').end(function(err, sres, body) {
  if (err) { log(err); process.exit(1) }
  if (!sres.statusCode === 200) { log(sres.body); process.exit(1) }
  schemas = body.schemas
  startWebServer()
})


// Start the server
function startWebServer() {
  https.createServer(sslOptions, app).listen(config.port)
  log('Service: ' + config.serviceUri)
  log(config.name + ' listening on ' + config.uri)
}


exports.service = service
