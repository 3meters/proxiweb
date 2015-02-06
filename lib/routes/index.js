/**
 * lib/routes/index.js
 *
 * Base router
 */


var service = require('../')
var utils = require('../utils')
var users = require('./users')
var patches = require('./patches')
var tipe = require('tipe')


// Whitelist of collections viewable by non-admins
var clWhitelist = {
  users: true,
  patches: true,
  messages: true,
  places: true,
  beacons: true,
}


// Router
exports.addRoutes = function(app) {

  app.all('*', setDefaults)

  users.addRoutes(app)

  app.all('*', whitelistMethods)

  app.all('/:clName*', checkCollection, initServiceRequest)

  app.get('/:clName*', setGetOptions)

  // patches.addRoutes(app)

  app.get('/', start)

  app.route('/:clName')
    .get(getCollection)
    .post(post)

  app.route('/:clName/create')
    .get(showCreate)

  app.route('/:clName/:_id/edit')
    .get(showEdit)

  app.route('/:clName/:_id/delete')
    .get(remove)

  app.route('/:clName/:_id/:linkType/:linkedClName')
    .all(setLinkedOptions)

  app.route('/:clName/:_id/:linkType/:linkedClName/create')
    .get(showCreateLinked)

  app.route('/:clName/:_id/:linkType/:linkedClName')
    .get(getDocument)
    .post(post)

  app.route('/:clName/:_id')
    .get(getDocument)
    .post(post)

  app.route('*', utils.notFound)
}


// Set defaults for all requests
function setDefaults(req, res, next) {
  res.isHtml = true
  req.locals = {}
  if (req.session) {
    req.locals.user = req.session.user
  }
  next()
}


// Whitelist methods, checking for user in order to write
function whitelistMethods(req, res, next) {
  var method = req.method.toLowerCase()
  if (method === 'get') return next()
  if ((method === 'post' ||
        method === 'del' ||
        method === 'delete') &&
      req.locals.user) {
    return next()
  }
  res.status(400).send('Invalid Request')
}


// Validate the collection
function checkCollection(req, res, next) {

  var clName = req.params.clName

  // Validate the collection
  if (!schemas[clName]) return utils.notFound(req, res)
  req.locals.clName = req.params.clName
  req.locals.schema = schemas[clName]

  // Let admins see anything
  if (req.locals.user && req.locals.user.role === 'admin') return next()

  // Non admins can only see a whitelisted set of collections
  if (!clWhitelist[clName]) return utils.notFound(req, res)

  return next()
}


// Initialize a service request for this web site request
// The service module extends TJ's superagent to make
// requests to the proxibase service.
function initServiceRequest(req, res, next) {

  // Init a service request instance
  req.sreq = service()

  // Sign the request with the users credentials if she is signed in
  if (req.locals.user) req.sreq.sign(req.session.credentials)
  next()
}


// Show a different home page depending on whether user is signed in
function start(req, res, next) {
  var user = req.locals.user
  if (user) res.redirect('/users/' + user._id + '/watch/to/patches')
  else res.redirect('/patches')
}


// Set default service get request options
function setGetOptions(req, res, next) {

  // Set find options
  req.sreq.query({
    refs: 'name',   // look up name field of _owner prop and put in owner
    datesToUTC: true,
  })

  // Pass through web site query prams to the service
  if (!_.isEmpty(req.query)) req.sreq.query(req.query)

  next()
}


// Set linked document params
function setLinkedOptions(req, res, next) {

  // Check the linked collection
  var linkedClName = req.params.linkedClName
  if (!clWhitelist[linkedClName]) return utils.notFound(req, res, next)

  // Check the link type, mapping to underlying type / direction
  var linkType = req.params.linkType
  var typeMap = utils.getLinkTypeMap()

  if (!typeMap[linkType]) return utils.notFound(req, res, next)

  // Build the link query
  var linkQuery = {type: typeMap[linkType].type}
  linkQuery[typeMap[linkType].direction] = linkedClName
  log({linkQuery: linkQuery})
  req.sreq.query({links: linkQuery})

  next()
}


// Display details view for a document
function getDocument(req, res, next) {

  req.locals.view = 'details'
  req.locals.mode = 'view'
  req.locals.title = req.locals.schema.name
  req.sreq.path('/data/' + req.locals.clName + '/' + req.params._id)

  utils.renderData(req, res, next)
}


// Display a list of documents
function getCollection(req, res, next) {

  req.locals.view = 'list'
  req.locals.title = req.locals.clName
  req.sreq.path('/data/' + req.locals.clName)

  switch(req.locals.clName) {

    case 'patches':
      req.sreq.query({links: [
        {from: 'users', type: 'watch', count: true},
        {from: 'messages', type: 'content', count: true},
      ]})
    break

    case 'users':
      req.sreq.query({links: [
        {to: 'patches', type: 'watch', count: 1,},
        {to: 'patches', type: 'create', count: 1,},
        {to: 'patches', type: 'like', count: 1,},
      ]})
    break

    case 'places':
      req.sreq.query({links: [
        {to: 'patches', type: 'poximity', count: true},
      ]})
    break

    case 'beacons':
      req.sreq.query({links: [
        {to: 'patches', type: 'poximity', count: true},
      ]})
    break
  }
  utils.renderData(req, res, next)
}


// Display a document with linked doucments
function getLinked(req, res, next) {
  req.sreq.path('/data/' + req.locals.clName + '/' + req.params._id)
  if (req.params.direction === 'to') {
    req.sreq.query({links: {
      to: req.params.linkedClName,
      type: req.params.linkType,
    }})
  } else {
    req.sreq.query({links: {
      from: req.params.linkedClName,
      type: req.params.linkType,
    }})
  }
  req.locals.view = 'list'
  utils.renderData(req, res, next)
}


function postLinked(req, res, next) {
  return utils.nyi(req, res, next)
}


function showCreateLinked(req, res, next) {
  req.locals.view = 'createLinked'
  return utils.nyi(req, res, next)
}


// Show details view in create mode
function showCreate(req, res, next) {

  // Must be signed in to create
  if (!req.locals.user) return res.redirect('/signin?prev=' + req.path)

  // Must create users via signup
  if (req.locals.clName === 'users') {
    return res.status(400).send('You must sign up to create a user record')
  }

  // Places are not editable
  if (req.locals.clName === 'places') {
    return res.status(400).send('You cannot edit places')
  }

  // Show details view in create mode
  req.locals.title = 'Create ' + req.locals.schema.name
  req.locals.mode = 'create'
  res.render('details', req.locals)
}


// Show details view in edit mode
function showEdit(req, res, next) {

  // Must be signed in to edit
  if (!req.locals.user) return res.redirect('/signin?prev=' + req.path)

  // Places are not editable
  if (req.locals.clName === 'places') {
    return res.status(400).send('You cannot edit places')
  }
  req.sreq.path('data').path(req.locals.clName).path(req.params._id)
  req.locals.title = 'Edit ' + req.locals.schema.name
  req.locals.view = 'details'
  req.locals.mode = 'edit'

  utils.renderData(req, res, next)
}


// Attempt to insert or update a document in the service with data
// posted from a create or edit view
function post(req, res, next) {

  var schema = req.locals.schema

  // Cast a string from an html post to the type expected by the service
  // returns undefined for types we can't handle yet, which for now means
  // only strings
  function cast(value, spec) {
    switch (spec.type) {
      case 'string': return value
      case 'boolean': return // beware! round-tripping non-changes and changes is hard
      default: return
    }
  }

  var data = {}
  // Whitelist form fields from schema
  for (var field in schema.fields) {
    if (req.body[field] !== undefined) {
      data[field] = cast(req.body[field], schema.fields[field])
    }
  }

  // If request includes contains an _id, update, othewise insert
  req.sreq.path('/data/' + req.locals.clName)
  if (req.params._id) req.sreq.path(req.params._id)

  // Post the data to the service
  req.sreq.post().body({data: data}).end(function(err, sres) {
    if (err) return next(err)
    if (!sres.ok) return res.status(sres.status).send(sres.body)
    var url = '/'
    if (sres.body.data && sres.body.data._id) {
      url = '/' + req.locals.clName + '/' + sres.body.data._id
    }
    res.redirect(url)
  })
}

// Attempt to remove a document
// TODO: go to a confirmation page that says
// remove cannot be undone with Delete / Cancel
function remove(req, res, next) {
  utils.nyi(req, res, next)
}
