/**
 * lib/routes/utils.js
 *
 * Shared utils for routes
 */

var _ = require('lodash')
var nodeUtil = require('util')


// Named links that map to service link type and direction
var _links = {
  watches:    {type: 'watch',     direction: 'to',    label: 'Watched',},
  watched:    {type: 'watch',     direction: 'from',  label: 'Watched By',},
  created:    {type: 'create',    direction: 'to',    label: 'Created'},
  createdby:  {type: 'create',    direction: 'from',  label: 'Created By',},
  likes:      {type: 'like',      direction: 'to',    label: 'Likes',},
  liked:      {type: 'like',      direction: 'from',  label: 'Liked By',},
  belongs:    {type: 'content',   direction: 'to',    label: 'Belongs To',},
  has:        {type: 'content',   direction: 'from',  label: 'Has',},
  near:       {type: 'proxmity',  direction: 'to',    label: 'Near',},
  closeto:    {type: 'proxmity',  direction: 'from',  label: 'Near',},
}


// Return a clone of _links
exports.links = function(key) {
  if (key) return _.cloneDeep(_links(key))
  else return _.cloneDeep(_links)
}


// Get a link key by its type and direction values
exports.linksKeyByValue = function(val) {
  for (var key in _links) {
    if (_links[key].type === val.type &&
        _links[key].direction === val.direction) return key
  }
}


// Whitelist of collections viewable by non-admins.
// The create property is an array of collecton:links
// combinations that are valid to create in the ui
// Arguably this information should be provided by
// and enforced by the service schemas
var _cls = {
  users: {create: false},
  patches: {create: {users: 'created'}},
  messages: {create: {patches: 'has'}},
  places: {create: false},
  beacons: {create: false},
}


// Return a clone of _cls
exports.cls = function(key) {
  if (key) return _.cloneDeep(_cls[key])
  else return _.cloneDeep(_cls)
}


// Populated on start from the proxibase service
var _schemas = {}


// Set the schemas
exports.setSchemas = function(schemas) {
  _schemas = _.cloneDeep(schemas)
}


// Return a clone of the schemas
exports.schemas = function(key) {
  if (key) return _.cloneDeep(_schemas(key))
  else return _.cloneDeep(_schemas)
}


// Call the service with the specified query and
// display the results, handling common error cases
exports.renderData = function render(req, res, next) {

  req.sreq.get().debug().end(function(err, sres) {
    if (err) return next(err)
    if (!sres.ok) return res.status(sres.statusCode).send(sres.body) // TODO: nicer error page
    if (!sres.body.data || _.isEmpty(sres.body.data)) {
      return res.status(404).send("Data not found")
    }
    req.locals.canEdit = sres.body.canEdit  // set only for single documents, not arrays

    req.locals.data = sres.body.data

    // debug({util_renderData: req.locals.data})
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
  }
  else if (photo.source && photo.source === 'aircandi') {  // old naming scheme
    url = 'https://aircandi-images.s3.amazonaws.com/' + photo.prefix
  }
  else if (photo.source && photo.source === 'google') {
    var sep = (photo.prefix.indexOf("?") >= 0) ? '&' : '?'
    url = photo.prefix + sep + 'maxwidth=' + pixels
  }
  else if (photo.source && photo.source === 'foursquare') {
    url = photo.prefix + pixels + 'x' + pixels + photo.suffix
  }
  else if (photo.prefix) {
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
    depth: 12,
    colors: true
  }
  ops = _.extend(defaults, ops)
  return nodeUtil.inspect(o, ops)
}


// Logger
exports.log = function(o, ops) {
  console.log(exports.inspect(o, ops))
}

// Debug logger
exports.debug = function(o, ops) {
  console.log(exports.inspect(o, ops))
}

exports.debugKeys = function(o, ops) {
  console.log(exports.inspect(Object.keys(o), ops))
}

// Not yet implemented
exports.nyi = function(req, res, next) {
  res.send('Not Yet Implemented')
}


// Page not found
exports.notFound = function notFound(req, res, next, message) {
  res.status(404).send(message || res.body || 'Not Found')
}
