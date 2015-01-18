/**
 * lib/routes/utils.js
 *
 * Shared utils for routes
 */


// Not yet implemented
exports.nyi = function(req, res, next) {
  res.send('Not Yet Implemented')
}


// Page not found
exports.notFound = function notFound(req, res, next) {
  res.status(404).send('Page Not Found')
}


// Call the service with the specified query and
// display the results
exports.renderData = function render(req, res, next) {

  req.service.get().end(function(err, sres) {
    if (err) return next(err)
    if (!sres.ok) return res.status(sres.statusCode).send(sres.body)
    if (!sres.body.data || _.isEmpty(sres.body.data)) res.status(404).send("Data not found")
    if (req.locals.transform) {
      req.locals.data = req.locals.transform(sres.body.data)
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


// logger
exports.log = function (o, ops) {
  var defaults = {
    showHidden: false,
    depth: 4,
    colors: true
  }
  ops = _.extend(defaults, ops)
  return console.log(util.inspect(o, ops))
}
