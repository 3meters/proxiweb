/**
 *  index.js
 *
 *    Connect to the proixbase server and load the schemas
 *    Start the web server
 *    Export the service request client
 */


// Module dependencies
var fs = require('fs')
var path = require('path')
var http = require('http')
var https = require('https')
var cli = require('commander')
var async = require('async')
var express = require('express')
var version = require('../package.json').version
var utils = require('./utils')


// Command-line options
cli
  .version(version)
  .option('-c, --config <file>', 'config file [config.js]')
  .parse(process.argv)


// Find the config file
var configFileName = 'config.js'
if (cli.config) configFileName = cli.config
var config = require(path.join('../config', configFileName))
utils.log(config)


// Slothware
global._ = require('lodash')
global.tipe = require('tipe')
global.scrub = require('scrub')
global.config = config
global.inspect = utils.inspect
global.debug = utils.debug
global.debugKeys = utils.debugKeys


// Load the proxibase service http request client
var service = require('proxireq').config({serviceUri: config.serviceUri})


// Must export the service be for loading the app
module.exports = service


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
else {
  if (tipe.isArray(ssl.caFilePath)) {
    sslOptions.ca = []
    ssl.caFilePath.forEach(function(path) {
      sslOptions.ca.push(fs.readFileSync(path))
    })
  }
}


// Construct the web server's uri
config.uri = config.protocol + '://' + config.host
if (config.port !== 80 && config.port !== 443) {
  config.uri += ':' + config.port
}


// http => https redirector if app listens on default https port
if (config.protocol === 'https' && config.port === 443) {
  express().get('*', function(req, res) {
    res.redirect(config.uri)
  }).listen(80)
}


// Call the service and load the schemas
service.get('/schemas').end(function(err, sres, body) {

  if (err) { console.error(err); process.exit(1) }
  if (sres.statusCode !== 200) { console.error(sres.body); process.exit(1) }

  utils.log('Proxibase service listening on ' + config.serviceUri)

  utils.setSchemas(body.schemas)
  startWebServer()
})


// Start the web server
function startWebServer() {

  // The app uses the schemas as a static.  Delay requiring the app
  // until the schemas have been retreived from the service and set
  var app = require('./app')

  https.createServer(sslOptions, app).listen(config.port)
  utils.log(config.name + ' listening on ' + config.uri)
}
