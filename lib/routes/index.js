/**
 * lib/routes/index.js
 *
 * Base router
 */


var users = require('./users')
var utils = require('./utils')


// Request router
exports.addRoutes = function(app) {

  app.all('*', setDefaults)

  users.addRoutes(app)

  app.all('*', whitelistMethods)

  app.all('/:clName*', setCollection)

  app.get('/', start)

  app.route('/patches/:view')
    .get(patches)

  app.route('/:cl/create')
    .post(showCreate)

  app.route('/:cl?')
    .get(list)
    .post(insert)

  app.route('/:cl/:_id/edit?')
    .get(showEdit)

  app.route('/:cl/:_id?')
    .get(details)
    .post(update)
    .delete(remove)

  app.route('*', notFound)
}


// Set defaults for all requests
function setDefaults(req, res, next) {
  res.isHtml = true
  req.locals = {}
  req.locals.user = req.session.user
  next()
}


// Whitelist methods, checking for user in order to write
function whitelistMethods(req, res, next) {
  log({method: req.method})
  var method = req.method.toLowerCase()
  if (method === 'get') return next()
  if (req.locals.user && (method === 'post' || method === 'del' || method === 'delete')) {
    return next()
  }
  res.status(400).send('Invalid Request')
}


// For now we accept any name
function setCollection(req, res, next) {
  req.locals.clName = req.params.clName
  next()
}


// Show a different home page depending on whether user is signed in
function start(req, res, next) {
  var user = req.locals.user
  if (user) res.redirect('/patches/watching')
  else res.redirect('/patches/active')
}


// Special-case common patch queries
function patches(req, res, next) {

  var locals = req.locals

  switch (req.params.view) {

    case 'active':
      locals.svc = {path: '/stats/from/messages/to/patches'}
      locals.title = 'Active Patches'
      break

    case 'popular':
      locals.svc = {
        path: '/stats/from/users/to/patches',
        qry: {filter: {type: 'watch'}},
      }
      locals.title = 'Popular Patches'
      break

    case 'watching':
      if (!locals.user) return res.redirect('/signin')
      locals.svc = {
        path: '/data/users/' + locals.user._id,
        qry: {
          links: {to: {patches: 1}, filter: {type: 'watch'},
          sort: '-modifiedDate', limit: 100, skip: 0},
        }
      }
      locals.title = "Patches I'm Watching"
      break

    case 'own':
      if (!locals.user) return res.redirect('/signin')
      locals.svc = {
        path: '/data/patches/',
        qry: {query: {_owner: locals.user._id,}},
      }
      locals.title = "Patches I Own"
      break

    default: return next()
  }

  locals.view = 'list'
  utils.render(req, res, next)
}


// Show list view
function list(req, res, next) {
  req.locals.view = 'list'
  utils.render(req, res, next)
}

// Show details view
function details(req, res, next) {
  req.locals.view = 'details'
  req.locals.svc = {
    path: '/data/' + req.locals.clName + '/' + req.params._id
  }
  utils.render(req, res, next)
}

// Show add view
function showCreate(req, res, next) {
  if (!req.locals.user) res.redirect('/signin?prev=' + req.path)
  req.locals.view = 'create'
  utils.render(req, res, next)
}


// Show edit view
function showEdit(req, res, next) {
  if (!req.locals.user) res.redirect('/signin?prev=' + req.path)
  req.locals.view = 'edit'
  utils.render(req, res, next)
}


// Attempt to insert a new document
function insert(req, res, next) {
  utils.nyi()
}

// Attempt to update a document
function update(req, res, next) {
  utils.nyi()
}

// Attempt to remove a document
function remove(req, res, next) {
  utils.nyi()
}

function notFound(req, res, next) {
  utils.notFound(req, res, next)
}
