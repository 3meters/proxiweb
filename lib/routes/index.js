/**
 * lib/routes/index.js
 *
 * Base router
 */


var service = require('../')
var utils = require('../utils')
var users = require('./users')
var patches = require('./patches')


// Router
exports.addRoutes = function(app) {

  app.all('*', setDefaults)

  users.addRoutes(app)

  app.all('*', whitelistMethods)

  app.all('/:clName*', setCollection, initServiceRequest)

  app.get('*', passThroughQuery)

  patches.addRoutes(app)

  app.get('/', start)

  app.route('/:clName/create')
    .get(showCreate)

  app.route('/:clName/:_id/edit?')
    .get(showEdit)

  app.route('/:clName/:_id/delete?')
    .get(remove)

  app.route('/:clName?/:_id?')
    .get(get)
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
  if (req.locals.user && (method === 'post' || method === 'del' || method === 'delete')) {
    return next()
  }
  res.status(400).send('Invalid Request')
}


// Set the collection name
function setCollection(req, res, next) {
  var clName = req.params.clName

  // Validate the collection
  if (!schemas[clName]) return utils.notFound(req, res)
  req.locals.clName = req.params.clName
  req.locals.schema = schemas[clName]

  // Let admins see anything
  if (req.locals.user && req.locals.user.role === 'admin') return next()

  // Whitelist collections for non-admins
  var whitelist = {
    users: true,
    patches: true,
    messages: true,
    places: true,
  }

  if (!whitelist[clName]) return utils.notFound(req, res)

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
  res.redirect('/patches')
  // if (user) res.redirect('/patches/watching')
  // else res.redirect('/patches/active')
}


// Pass through web query prams to the service
function passThroughQuery(req, res, next) {
  if (!_.isEmpty(req.query)) req.sreq.query(req.query)
  next()
}


// Get data from the service and display it
function get(req, res, next) {

  // Determine details or list
  if (req.params._id) {
    req.locals.view = 'details'
    req.locals.mode = 'view'
    req.locals.title = req.locals.clName
    req.sreq.path('data').path(req.locals.clName).path(req.params._id)
  }
  else {
    req.locals.view = 'list'
    req.locals.title = req.locals.schema.name
    req.sreq.path('/data/' + req.locals.clName)
  }

  // Set some default safeFind query params
  req.sreq.query({
    refs: 'name',
    datesToUTC: true,
  })

  utils.renderData(req, res, next)
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

  var data = {}
  // Whitelist form fields from schema
  for (var field in schemas[req.locals.clName].fields) {
    if (req.body[field] !== undefined) data[field] = req.body[field]
  }

  // If request includes contains an _id, update, othewise insert
  req.sreq.path('/data/' + req.locals.clName)
  if (req.params._id) req.sreq.path(req.params._id)

  // Post the data to the service
  req.sreq.post().body({data: data}).end(function(err, sres) {
    if (err) return next(err)
    log({ok: sres.ok})
    log({body: sres.body})
    log({schema: schemas[req.locals.clName]})
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
