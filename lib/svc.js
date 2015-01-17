/**
 * /lib/svc.js
 *
 * superagent wrapper for the proxibase service
 */

var util = require('util')
var sa = require('superagent')
var log = function(o, depth) {console.log(util.inspect(o, true, depth || 10))}

var _get = sa.get
var _post = sa.post

sa.get = function(o)
  if (_.isString(o) return _get(o)

}

sa.get().end(function(err, res) {
  if (err) log(err)
  log(res)
})
