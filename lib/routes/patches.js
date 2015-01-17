/**
 * lib/routes/index.js
 *
 * Patch route
 */


var utils = require('./utils')


// Request router
exports.addRoutes = function(app) {

  app.route('/patches/:view')
    .get(patches)

}

// Common patch queries
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
      if (!locals.user) return res.redirect('/signin?prev=' + req.path)
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
      if (!locals.user) return res.redirect('/signin?prev=' + req.path)
      locals.svc = {
        path: '/data/patches/',
        qry: {query: {_owner: locals.user._id,}},
      }
      locals.title = "Patches I Own"
      break

    default: return next()
  }

  locals.view = 'list'
  utils.renderData(req, res, next)
}
