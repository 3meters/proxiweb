/**
 * /lib/service.js
 *
 *   Wrapper over TJ's superagent request client for calling
 *   the proxibase service.
 */

var superagent = require('superagent')
var _ = require('lodash')
var config = global[config] || {}


// Convenience methods to extend superagent
function extendSuperAgent() {

  var RequestProto = superagent.Request.prototype


  // For creating a raw request instance without presetting
  // either the method or the url
  superagent.create = function(options) {
    var request = new superagent.Request()
    if (_.isObject(options)) {
       request = _.extend(request, options)
    }
    return request
  }


  // For requests created with create
  RequestProto.get = function(url) {
    this.method = 'get'
    this.url = url
    return this
  }


  // For requests created with create
  RequestProto.post = function(url) {
    this.method = 'post'
    this.url = url
    return this
  }


  // For requests created with create
  RequestProto.del = function(url)  {
    this.method = 'del'
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

    // this refers to the request instance

    var options = {
      serviceUri: 'http://localhost',
      timeout: 5000,
    }

    options = _.mapValues(options, function(val, key) {
      if (config[key]) return config[key]
      else return val
    })

    if (!this._timeout) this._timeout = options.timeout || 5000

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
    if (!this.url && this._path) url += this._path

    // Set the request url
    this.url = _url

    // For gets, set some default service find ops and pass through
    // any query options on the website request to the service
    if (this.method === 'get') {
      var defaultFindOps = {
        refs: 'name',
        datesToUTC: true,
        limit: 20,
      }
      this.qs = _.extend(defaultFindOpsOps, this.qs)
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

// Export
module.exports = superagent
