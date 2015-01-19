/**
 *  server.js
 *
 *    Patchr web server
 */


// Module dependencies
var fs = require('fs')
var path = require('path')
var https = require('https')
var cli = require('commander')
var async = require('async')
var service = require('./service')
var version = require('../package').version
var utils = require('./utils')


// Command-line options
cli
  .version(version)
  .option('-c, --config <file>', 'config file [config.js]')
  .parse(process.argv)


// Find the config file
var configFile = 'config.js'
if (cli.config) configFile = cli.config
var cfg = require(path.join('../config', configFile))


// Set globals
global.util = require('util')
global._ = require('lodash')
global.tipe = require('tipe')
global.scrub = require('scrub')
global.config = cfg
global.log = utils.log
global.schemas = {}


// Load the app
var app = require('./app')


// Accept unsigned ssl certs in dev and test modes
if ('development' === config.mode || 'test' === config.mode) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0
}


// Figure out SSL keys
var ssl = config.ssl

// One SSL key is shared by all subdomains
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


log({config: config})


// Call the service and load the schemas
service.get('/schema').end(function(err, sres) {

  if (err) { log(err); process.exit(1) }
  if (!sres.ok) { log(sres.body); process.exit(1) }

  var schemaUrls = []
  for (var key in sres.body.schemas) {
    schemaUrls.push(sres.body.schemas[key])
  }
  async.each(schemaUrls, getSchema, startServer)
})


// Get a schema from the service and add it to the
// global schemas map
function getSchema(url, cb) {

  service.get(url).end(function(err, res, body) {
    if (err) return cb(err)
    var schema = res.body.schema
    if (!schema) return cb(new Error(url + ' not Found!!!'))
    schemas[schema.collection] = schema
    cb()
  })
}


// Start the web server
function startServer(err) {

  if (err) {
    log(err)
    process.exit(1)
  }

  // Start app server
  if (config.protocol === 'http') {
    http.createServer(app).listen(config.port)
  }
  else {
    https.createServer(sslOptions, app).listen(config.port)
  }

  log('Service: ' + config.serviceUri)
  log(config.name + ' listening on ' + config.uri)

}
