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


// Maps user friendly type names such as "watches" to underlying
// service link type and directions such direction:to, type:watch
var links = utils.links()
var cls = utils.cls()
var schemas


// Router
exports.addRoutes = function(app) {

  // Schemas are not known at require time.  Add them here,
  // after boostrapping and fetching them from the service
  schemas = utils.schemas()

  app.all('*', setDefaults)

  users.addRoutes(app)

  app.all('*', whitelistMethods)

  app.all('/:cl*', checkCollection, initServiceRequest)

  app.get('/:cl*', setGetOptions)

  // patches.addRoutes(app)

  app.get('/', start)

  app.route('/:cl')
    .get(getCollection)
    .post(post)

  app.route('/:cl/create')
    .get(showCreate)

  app.route('/:cl/:_id/edit')
    .get(showEdit)

  app.route('/:cl/:_id/delete')
    .get(remove)

  app.route('/:cl/:_id/:link/:linkCl*')
    .all(setLinkOptions)
    .get(setGetLinkOptions)

  app.route('/:cl/:_id/:link/:linkCl/create')
    .get(showCreateLinked)

  app.route('/:cl/:_id/:link/:linkCl')
    .get(getLinked)
    .post(post)

  app.route('/:cl/:_id')
    .get(getDocument)
    .post(post)

  app.route('*', utils.notFound)
}


// Set defaults for all requests
function setDefaults(req, res, next) {
  res.isHtml = true
  req.locals = {
    path: req.path
  }

  // Set redirect param
  if (req.query.prev) {
    req.locals.prev = req.query.prev
  }

  // Set user
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

  var cl = req.params.cl

  // Validate the collection
  if (!schemas[cl]) return utils.notFound(req, res)
  req.locals.cl = req.params.cl
  req.locals.schema = schemas[cl]

  // Let admins see anything
  if (req.locals.user && req.locals.user.role === 'admin') return next()

  // Non admins can only see a whitelisted set of collections
  if (!cls[cl]) return utils.notFound(req, res)

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
function setLinkOptions(req, res, next) {

  // Check the linked collection
  var linkCl = req.params.linkCl
  if (!cls[linkCl]) return utils.notFound(req, res, next)

  // Check the link type, mapping to underlying type / direction
  var link = req.params.link

  if (!links[link]) return utils.notFound(req, res, next)

  req.locals.link = link
  req.locals.linkCl = linkCl
  req.locals.linkSchema = schemas[linkCl]

  next()
}


// On gets set the service linked query paramerters
// This unmaps the human-friendly links into the services
// wordier but more general syntax
function setGetLinkOptions(req, res, next) {

  var link = req.locals.link
  var linkQuery = {type: links[link].type}
  linkQuery[links[link].direction] = req.locals.linkCl
  req.sreq.query({linked: [linkQuery]})

  next()
}


// Display details view for a document
function getDocument(req, res, next) {

  req.locals.view = 'details'
  req.locals.mode = 'view'
  req.locals.title = req.locals.schema.name
  req.sreq.path('/data/' + req.locals.cl + '/' + req.params._id)

  utils.renderData(req, res, next)
}


// Display a list of documents
function getCollection(req, res, next) {

  req.locals.view = 'list'
  req.locals.title = req.locals.cl
  req.sreq.path('/data/' + req.locals.cl)

  switch(req.locals.cl) {

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
  req.locals.view = 'list'
  req.locals.title = req.locals.schema.name + ' ' +
      req.locals.link + ' ' + req.locals.linkCl
  req.sreq.path('/data/' + req.locals.cl + '/' + req.params._id)
  utils.renderData(req, res, next)
}



// Show details view in create mode
function showCreate(req, res, next) {

  // Must be signed in to create
  if (!req.locals.user) return res.redirect('/signin?prev=' + req.path)

  // Show details view in create mode
  req.locals.title = 'Create ' + req.locals.schema.name
  req.locals.mode = 'create'
  res.render('details', req.locals)
}

// Show create linked to parent
function showCreateLinked(req, res, next) {

  // Must be signed in to create
  if (!req.locals.user) return res.redirect('/signin?prev=' + req.path)

  // Show details view in create mode
  req.locals.title = 'Create ' + req.locals.linkSchema.name
  req.locals.mode = 'create'
  req.locals.cl = req.locals.linkCl
  res.render('details', req.locals)
}


// Show details view in edit mode
function showEdit(req, res, next) {

  // Must be signed in to edit
  if (!req.locals.user) return res.redirect('/signin?prev=' + req.path)

  // Places are not editable
  if (req.locals.cl === 'places') {
    return res.status(400).send('You cannot edit places')
  }
  req.sreq.path('data').pathAdd(req.locals.cl).pathAdd(req.params._id)

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
  // we only handle strings
  function cast(value, spec) {
    switch (spec.type) {
      case 'string': return value
      case 'boolean': return // beware! round-tripping non-changes and changes is hard
      default: return
    }
  }

  var redirectUrl = req.locals.prev || null
  var data = {}
  data.links = []
  var createLink = {_from: req.locals.user._id, type: 'create'}

  // Whitelist form fields from schema
  for (var field in schema.fields) {
    if (req.body[field] !== undefined) {
      data[field] = cast(req.body[field], schema.fields[field])
    }
  }

  req.sreq.path('/data')

  // Our url schema has a state problem here.  Need a less tricky way to check state
  if (req.params._id && !req.locals.link) {
    // Update.  Consider instead checking if the last path elem is of the form: /cl/_id
    req.sreq.pathAdd(req.locals.cl).pathAdd(req.params._id)
    redirectUrl = req.path
  }
  else {
    // Insert: ensure a create link
    var hasCreateLink = data.links.some(function(link) {
      if (_.isEqual(link, createLink)) return true
    })
    if (!hasCreateLink) data.links.push(createLink)
  }


  // If the request was posted to a url like /usrs/<_user>/watches/patches
  // post to patchs, not users, and attach a new link to the data to be
  // posted to the service like so: {_from: <_user>, type: "watch"}
  if (req.locals.link) {
    var link = req.locals.link
    debug('link')
    debug(link)
    req.sreq.pathAdd(req.locals.linkCl)
    var sLink = {type: links[link].type}
    if (links[link].direction === 'to') {
      sLink._to = req.params._id
    }
    else sLink._from = req.params._id
    data.links.push(sLink)
  }

  // Post the data to the service
  req.sreq.post().body({data: data}).debug().end(function(err, sres) {
    if (err) return next(err)
    if (!sres.ok) return res.status(sres.status).send(sres.body)
    if (sres.status > 201) log({proxireq_partial_save_errors: sres.body})
    res.redirect(redirectUrl || "/")
  })
}

// Attempt to remove a document
// TODO: go to a confirmation page that says
// remove cannot be undone with Delete / Cancel
function remove(req, res, next) {
  utils.nyi(req, res, next)
}
