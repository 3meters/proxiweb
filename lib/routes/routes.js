/**
 * lib/routes/index.js
 *
 * Base router
 */


var qs = require('qs')
var request = require('superagent')
var utils = require('./utils')
var users = require('./users')
var patches = require('./patches')


// Request router
exports.addRoutes = function(app) {

  app.all('*', setDefaults)

  users.addRoutes(app)

  app.all('*', whitelistMethods)

  app.all('/:clName*', setCollection)

  patches.addRoutes(app)

  app.get('/', start)

  app.route('/:cl/create')
    .get(showCreate)

  app.route('/:cl?')
    .get(list)
    .post(insert)

  app.route('/:cl/:_id/edit?')
    .get(showEdit)

  app.route('/:cl/:_id/delete?')
    .get(utils.nyi)

  app.route('/:cl/:_id?')
    .get(details)
    .post(update)
    .delete(remove)

  app.route('*', utils.notFound)
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
  if (schemas[clName] && !schemas[clName].system) {
    req.locals.clName = req.params.clName
    return next()
  }
  return utils.notFound(req, res, next)
}


// Show a different home page depending on whether user is signed in
function start(req, res, next) {
  var user = req.locals.user
  if (user) res.redirect('/patches/watching')
  else res.redirect('/patches/active')
}



// Show list view
function list(req, res, next) {
  req.locals.view = 'list'
  req.locals.title = req.locals.clName
  utils.renderData(req, res, next)
}


// Show details view
function details(req, res, next) {
  req.locals.view = 'details'
  req.locals.svc = {
    path: '/data/' + req.locals.clName + '/' + req.params._id
  }
  utils.renderData(req, res, next)
}


// Show create view
function showCreate(req, res, next) {
  if (!req.locals.user) res.redirect('/signin?prev=' + req.path)
  if (req.locals.clName === 'users') {
    return next(new Error('You must sign up to create a user record'))
  }
  req.locals.schema = schemas[req.locals.clName]
  req.locals.title = 'Create ' + req.locals.schema.name
  res.render('create', req.locals)
}


// Show edit view
function showEdit(req, res, next) {

  // Must be signed in to edit
  if (!req.locals.user) res.redirect('/signin?prev=' + req.path)
  var url = config.serviceUri + '/find/' + req.locals.clName + '/' + req.params._id + '?'
  url += qs.stringify({
    user: req.locals.user._id,
    session: req.locals.user.session,
  })

  // Re-read the document from the service then pupulate the edit view
  request.get(url).end(function(err, sres) {
    if (err) return next(err)
    log(sres.body)
    if (!sres.body.data || _.isEmpty(sres.body.data)) return utils.notFound(req, res)
    req.locals.schema = schemas[req.locals.clName]
    req.locals.data = sres.body.data
    res.render('edit', req.locals)
  })
}


// Attempt to insert a new document
function insert(req, res, next) {
  var url = config.serviceUri + '/data/' + req.locals.clName + '?'
  url += qs.stringify({
    user: req.locals.user._id,
    session: req.locals.user.session,
  })
  res.send(res.body)
}


// Attempt to update a document
function update(req, res, next) {
  utils.nyi()
}

// Attempt to remove a document
function remove(req, res, next) {
  utils.nyi()
}
