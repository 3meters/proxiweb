/**
 * lib/routes/utils.js
 *
 * Shared utils for routes
 */


var qs = require('qs')
var request = require('superagent')


// Not yet implemented
exports.nyi= function(req, res, next) {
  res.send('NYI')
}


// Page not found
exports.notFound = function(req, res, next) {
  res.status(404).send('Page Not Found')
}


// Render a view with options
exports.render = function render(req, res, next) {

  log(req.locals)
  var svc = req.locals.svc || {
    path: '/data/' + req.locals.clName
  }

  // Construct the service url
  var url = config.serviceUri + '/v1' + svc.path
  var sep = (url.indexOf('?') > 0) ? '&' : '?'
  var defaultQry = {
    refs: 'true',
  }
  var qry = _.merge(defaultQry, svc.qry)

  // Allow passthough of rest query syntax to service
  qry = _.merge(qry, req.query)

  url += sep + qs.stringify(qry)
  log('get ' + url)

  request
    .get(url)
    .end(function(err, sres) {
      if (err) return next(err)
      if (!sres.ok) return res.status(sres.statusCode).send(sres.body)
      if (sres.body.data) {
        if (svc.transform) {
          req.locals.data = options.transform(sres.body.data)
        } else {
          req.locals.data = sres.body.data
        }
      }
      res.render(req.locals.view, req.locals)
    })
}


// Generate a picture url from service photo object
exports.pictureUrl = function(photo) {

  // log({photo: photo})
  var url = ''  // should default to a not-found image stored on s3
  if (!photo) return url

  if (photo.source && photo.source.match(/^aircandi\./)) {
    var prefix = photo.source.replace(/\./g, '-')  // replace dots with dashes
    url = 'https://' + prefix + '.s3.amazonaws.com/' + photo.prefix
  } else if (photo.source && photo.source === 'aircandi') {  // old naming scheme
    url = 'https://aircandi-images.s3.amazonaws.com/' + photo.prefix
  } else if (photo.prefix) {
    url = photo.prefix
  }

  return url
}
