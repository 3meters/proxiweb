/**
 *  server.js
 *
 *    Patchrweb server.
 *
 *    Errors on initialization are thrown, crashing on purpose.
 */

var fs = require('fs')
var path = require('path')
var http = require('http')
var https = require('https')
var cli = require('commander')
var async = require('async')
var request = require('superagent')
var version = require('../package').version
var configFile = 'config.js'


// Globals
global.util = require('util')
global._ = require('lodash')
global.tipe = require('tipe')
global.scrub = require('scrub')
global.config = {}
global.log = function(o, ops) {
  var defaults = {
    showHidden: false,
    depth: 12,
    colors: true
  }
  ops = _.merge(defaults, ops)
  console.log(util.inspect(o, ops))
}
global.schemas = {}


// Command-line options
cli
  .version(version)
  .option('-c, --config <file>', 'config file [config.js]')
  .parse(process.argv)


// Find the config file
if (cli.test) configFile = 'configtest.js'
if (cli.config) configFile = cli.config
config = require(path.join('../config', configFile))


// Allow self-signed certs in development and test mode
if ('development' === config.mode || 'test' === config.mode) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0
}

var app = require('./app')
var ssl = config.ssl

if (ssl) {
  // One SSL key is shared by all subdomains
  var sslOptions = {
    key: fs.readFileSync(ssl.keyFilePath),
    cert: fs.readFileSync(ssl.certFilePath)
  }

  if (tipe.isString(ssl.caFilePath)) {
    sslOptions.ca = fs.readFileSync(ssl.caFilePath)
  }
  else if (tipe.isArray(ssl.caFilePath)) {
    sslOptions.ca = []
    ssl.caFilePath.forEach(function(path) {
      sslOptions.ca.push(fs.readFileSync(path))
    })
  }
}


// Construct the web servers url
config.uri = config.protocol + '://' + config.host
if (config.port !== 80 && config.port !== 443) {
  config.uri += ':' + config.port
}


// Call the service and load the schemas
request.get(config.serviceUri + '/schema')
  .end(function(err, res) {
    if (err) {
      log('No response from ' + config.serviceUri)
      process.exit(1)
    }
    if (!res.ok) {
      log(res.body)
      process.exit(1)
    }
    var schemaUrls = []
    for (var key in res.body.schemas) {
      schemaUrls.push(res.body.schemas[key])
    }
    async.each(schemaUrls, getSchema, startServer)
  })


// Get a schema from the service and add it to the
// global schemas map
function getSchema(url, cb) {
  request.get(url).end(function(err, res) {
    if (err) return cb(err)
    var schema = res.body.schema
    if (!schema) return cb(new Error(url + ' not Found'))
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

// Final error handler. Only fires on bugs.
function handleUncaughtError(err) {

  var stack = err.stack || err.message || err
  if (util.appStack) stack = util.appStack(stack)

  console.error('\n*****************\nCRASH Crash crash\n')
  console.error('appStack:\n' + stack + '\n')

  if (config.log > 1) {
    console.error('stack:\n' + err.stack||err + '\n\n')
  }

  process.exit(1)
}


// Make a final blocking io call to ensure that all open streams finish
function sayGoodbye() {
  console.error('Goodbye from ' + config.name)
}
