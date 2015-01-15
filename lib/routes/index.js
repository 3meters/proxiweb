/**
 * lib/routes/index.js
 *
 * Base router
 */

var users = require('./users')
var patches = require('./patches')
var signin = require('./signin')


// Request router
exports.addRoutes = function(app) {

  app.all('*', setDefaults)

  signin.addRoutes(app)

  app.all('*', whitelistMethods)

  app.all('/:route', whitelistRoutes)

  app.get('/', start)

  app.route('/:cl/insert?')
    .post(showInsert)

  app.route('/:cl?')
    .post(insert)

  app.route('/:cl/:_id/update?')
    .get(showUpdate)

  app.route('/:cl/:_id?')
    .get(details)
    .post(update)
    .delete(remove)

  users.addRoutes(app)
  patches.addRoutes(app)
  messages.addRoutes(app)

  app.route('*', notFound)
}


// Set defaults for all requests
function setDefaults(req, res, next) {
  res.isHtml = true
  req.viewData = {}
  req.viewData.user = req.session.user
  next()
}


function whitelistMethods(req, res, next) {
  log({method: req.method})
  var method = req.method.toLowerCase()
  if (method === 'get') return next()
  if (req.viewData.user && (method === 'post' || method === 'del' || method === 'delete')) {
    return next()
  }
  res.status(400).send('Invalid Request')
}


// Explicity filter out unrecognized routes, set base collection
function whitelistRoutes(req, res, next) {
  switch (req.params.route) {
    case 'users':
    case 'patches':
      break
    default:
      return res.status(404).send('Not Found')
  }
  req.viewData.clName = req.params.view
  next()
}


// Show a different home page depending on whether user is signed in
function start(req, res, next) {
  var user = req.viewData.user
  if (user) res.redirect('/users/' + user._id + '/patches/watching')
  else res.redirect('/patches/trending')
}


// Whitelist methods, checking for user in order to write
