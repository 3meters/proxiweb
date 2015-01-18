/**
 * /lib/service.js
 *
 *   Wrapper over TJ's superagent request client for calling
 *   the proxibase service.
 */

var superagent = require('superagent')


// Convenience methods to extend superagent
function extendSuperAgent() {

  var RequestProto = superagent.Request.prototype

  // For incrementally constructing a service request path
  RequestProto.path = function(pathPart) {
    this.path = this.path || ''
    if (pathPart[0] !== '/') this.path += "/"
    this.path += pathPart
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
    var url = config.serviceUri

    // If url exists and does not begin with service uri prepend it
    if (this.url) {
      if (this.url.indexOf(config.serviceUri) === 0) {
        url = this.url    // url is fully-qualified, replace
      }
      else {
        url += this.url   // url is not fully-qualified, append
      }
    }

    // Append the path property only if the url property has not
    // been set
    if (!this.url && this.path) url += this.path

    // Set the request url
    this.url = url

    // For gets, set some default service find ops and pass through
    // any query options on the website request to the service
    if (this.method === 'get') {
      var defaultFindOps = {
        refs: 'name',
        datesToUTC: true,
        limit: 20,
      }
      this.query(_.extend(defaultFindOpsOps, req.query))
    }

    // Log diagnostics
    if (this.debugRequest) log({serviceRequest: {url: this.url}})

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
