/**
 * lib/routes/utils.js
 *
 * Shared utils for routes
 */

var _ = require('lodash')
var nodeUtil = require('util')


// Not yet implemented
exports.nyi = function(req, res, next) {
  res.send('Not Yet Implemented')
}


// Page not found
exports.notFound = function notFound(req, res, next) {
  res.status(404).send(res.body || 'Not Found')
}


// Call the service with the specified query and
// display the results
exports.renderData = function render(req, res, next) {

  req.sreq.get().end(function(err, sres) {
    if (err) return next(err)
    if (!sres.ok) return res.status(sres.statusCode).send(sres.body)
    if (!sres.body.data || _.isEmpty(sres.body.data)) {
      return res.status(404).send("Data not found")
    }
    if (req.locals.transform) {
      req.locals.data = req.locals.transform(sres.body.data)
    }
    else {
      req.locals.data = sres.body.data
    }
    log(sres.body.data)
    res.render(req.locals.view, req.locals)
  })
}


// Generate a picture url from service photo object
exports.pictureUrl = function(photo, size) {

  var pixels = '400'
  switch (size) {
    case 'sm': pixels = '100';  break
    case 'lg': pixels = '800'; break
  }

  var url = ''  // TODO: default to a image-not-found image stored on s3
  if (!photo) return url

  if (photo.source && photo.source.match(/^aircandi\./)) {
    var prefix = photo.source.replace(/\./g, '-')  // replace dots with dashes
    url = 'https://' + prefix + '.s3.amazonaws.com/' + photo.prefix
  } else if (photo.source && photo.source === 'aircandi') {  // old naming scheme
    url = 'https://aircandi-images.s3.amazonaws.com/' + photo.prefix
  } else if (photo.source && photo.source === 'google') {
    var sep = (photo.prefix.indexOf("?") >= 0) ? '&' : '?'
    url = photo.prefix + sep + 'maxwidth=' + pixels
  } else if (photo.source && photo.source === 'foursquare') {
    url = photo.prefix + pixels + 'x' + pixels + photo.suffix
  } else if (photo.prefix) {
    url = photo.prefix
  }

  // log({photo: photo})
  // log({constructedUrl: url})

  return url
}


// Inspctor
exports.inspect = function(o, ops) {
  var defaults = {
    showHidden: false,
    depth: 4,
    colors: true
  }
  ops = _.extend(defaults, ops)
  return nodeUtil.inspect(o, ops)
}

// Logger
exports.log = function(o, ops) {
  console.log(exports.inspect(o, ops))
}


