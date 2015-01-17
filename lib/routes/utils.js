/**
 * lib/routes/utils.js
 *
 * Shared utils for routes
 */


var qs = require('qs')
var request = require('superagent')


// Not yet implemented
exports.nyi = function(req, res, next) {
  res.send('Not Yet Implemented')
}


// Page not found
exports.notFound = function notFound(req, res, next) {
  res.status(404).send('Page Not Found')
}


// Anonymous user requested a page that required signin.
// Present the signin page.  If signin is successful redirect
// back to the page that the user originally requested.
exports.mustSignIn = function(req, res, next) {
  exports.nyi()
}


// Call the service with the specified query and
// Display the results
exports.renderData = function render(req, res, next) {

  var svc = req.locals.svc || {
    path: '/data/' + req.locals.clName
  }

  // Construct the service url
  var url = config.serviceUri + svc.path
  var sep = (url.indexOf('?') > 0) ? '&' : '?'

  // Default options for all service queries
  var defaultQry = {
    refs: 'name',
    datesToUTC: true,
    limit: 20,
  }
  var qry = _.extend(defaultQry, svc.qry)

  // Allow passthough of rest query syntax to service
  qry = _.extend(qry, req.query)

  // Add the users credentials to the request
  var user = req.locals.user
  if (user) qry = _.extend(qry, {user: user._id, session: user.session})

  url += sep + qs.stringify(qry)
  log('get ' + url)

  request
    .get(url)
    .end(function(err, sres) {
      if (err) return next(err)
      if (!sres.ok) return res.status(sres.statusCode).send(sres.body)
      if (!sres.body.data || _.isEmpty(sres.body.data)) res.status(404).send("Data not found")
      if (svc.transform) {
        req.locals.data = options.transform(sres.body.data)
      } else {
        req.locals.data = sres.body.data
      }
      res.render(req.locals.view, req.locals)
    })
}


// Generate a picture url from service photo object
exports.pictureUrl = function(photo) {

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
