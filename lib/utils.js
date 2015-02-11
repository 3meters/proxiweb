/**
 * lib/routes/utils.js
 *
 * Shared utils for routes
 */

var _ = require('lodash')
var nodeUtil = require('util')

// Whitelist of collections viewable by non-admins
var _clWhitelist = {
  users: {canPost: false},
  patches: {canPost: true},
  messages: {canPost: true},
  places: {canPost: false},
  beacons: {canPost: false},
}

// Map of url directional link type names to underlying link types and direction
exports.getClWhitelist = function() {
  return _clWhitelist
}

// Return key of _linkTypeMap for any value
var _linkTypeMap = {
  watches:    {type: 'watch', direction: 'to'},
  watched:    {type: 'watch', direction: 'from'},
  created:    {type: 'create', direction: 'to'},
  createdby:  {type: 'create', direction: 'from'},
  likes:      {type: 'like', direction: 'to'},
  liked:      {type: 'like', direction: 'from'},
  belongs:    {type: 'content', direction: 'to'},
  has:        {type: 'content', direction: 'from'},
  near:       {type: 'proxmity', direction: 'to'},
  close:      {type: 'proxmity', direction: 'from'},
}


// Map of url directional link type names to underlying link types and direction
exports.getLinkTypeMap = function() {
  return _linkTypeMap
}

exports.getLinkTypeMapKey = function(val) {
  for (var key in _linkTypeMap) {
    if (_.isEqual(val, _linkTypeMap[key])) return key
  }
}

// Call the service with the specified query and
// display the results, handling common error cases
exports.renderData = function render(req, res, next) {

  log({path: req.path})
  req.sreq.get().debug().end(function(err, sres) {
    if (err) return next(err)
    if (!sres.ok) return res.status(sres.statusCode).send(sres.body) // TODO: nicer error page
    if (!sres.body.data || _.isEmpty(sres.body.data)) {
      return res.status(404).send("Data not found")
    }
    req.locals.path = req.path
    req.locals.canEdit = sres.body.canEdit  // set only for single documents, not arrays

    log({util_renderData_locals: req.locals})
    req.locals.data = sres.body.data

    // log({util_renderData: req.locals.data})
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


// Not yet implemented
exports.nyi = function(req, res, next) {
  res.send('Not Yet Implemented')
}


// Page not found
exports.notFound = function notFound(req, res, next, message) {
  res.status(404).send(message || res.body || 'Not Found')
}
