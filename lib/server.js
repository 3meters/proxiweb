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

config.uri = config.protocol + '://' + config.host
if (config.port !== 80 && config.port !== 443) {
  config.uri += ':' + config.port
}


// Stash the ssl credentials
// statics.ssl = _.extend(statics.ssl, sslOptions)


// Start app server
if (config.protocol === 'http') {
  http.createServer(app).listen(config.port)
}
else {
  https.createServer(sslOptions, app).listen(config.port)
}

log('Service: ' + config.serviceUri)
log(config.name + ' listening on ' + config.uri)

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
