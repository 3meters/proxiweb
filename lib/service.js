/**
 * /lib/service.js
 *
 *   Wrapper over TJ's superagent request client for calling
 *   the proxibase service.
 */

var superagent = require('superagent')
var _ = global._ || require('lodash')
var log = global.log || console.log

// Default config
var config = {
  serviceUri: 'https://localhost:8843',
  timeout: 5000,
  getOps: {
    refs: 'name',
    datesToUTC: true,
    limit: 20,
  }
}


// Convenience methods to extend superagent
function extendSuperAgent() {


  var RequestProto = superagent.Request.prototype

  // Override the module-global config
  superagent.configure = function(options) {
    for (var key in config) {
      if (options[key]) config[key] = options[key]
    }
  }


  // Create a request instance without presetting the method or
  // the url.  This allows the caller to set query properties
  // of the request intances before specifying the method and url,
  // a feature that superagent doesn't support natively.
  superagent.create = function() {
    return new superagent.Request()
  }


  // For requests created with create
  RequestProto.get = function(url) {
    this.method = 'GET'
    this.url = url
    return this
  }


  // For requests created with create
  RequestProto.post = function(url) {
    this.method = 'POST'
    this.url = url
    return this
  }


  // For requests created with create
  RequestProto.del = function(url)  {
    this.method = 'DELETE'
    this.url = url
    return this
  }


  // For incrementally constructing a service request path
  RequestProto.path = function(pathPart) {
    this._path = this._path || ''
    if (pathPart[0] !== '/') this.reqPath += "/"
    this._path += pathPart
    return this
  }


  // Chainable debug function
  RequestProto.debug = function() {
    this.debugRequest = true
    return this
  }


  // Stash the super's end method
  var _end = RequestProto.end


  // Override super agent's end method to build the request from parts
  // set upstream and provide some default error handling on return
  RequestProto.end = function(cb) {

    // Default timeout
    this._timeout = this._timeout || config.timeout

    // Construct the url, prepending with the service uri
    // prefering the url property to the path property
    var _url = config.serviceUri

    // If url exists and does not begin with service uri prepend it
    if (this.url) {
      if (this.url.indexOf(_url) === 0) {
        _url = this.url    // url is fully-qualified, replace
      }
      else {
        _url += this.url   // url is not fully-qualified, append
      }
    }

    // Append the path property only if the url property has not
    // been set
    if (!this.url && this._path) _url += this._path

    // Set the request url
    this.url = _url

    // For gets, set some find ops to pass to the service
    if (this.method === 'get') {
      this.qs = _.extend(config.getOps, this.qs)
    }

    // Log diagnostics
    if (this.debugRequest) log({debugServiceRequest: this})

    // Call the super
    _end.call(this, function(err, res) {
      if (err) return cb(err)
      cb(null, res, res.body)
    })
  }
}


// Extend
extendSuperAgent()


// Override serviceUri if present
if (global.config && global.config.serviceUri) {
  superagent.configure({serviceUri: global.config.serviceUri})
}


// Export
module.exports = superagent
