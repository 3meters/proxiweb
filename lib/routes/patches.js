/**
 * lib/routes/patches.js
 *
 * Patch routes
 */


var utils = require('../utils')


// Add special-cased patch routes
exports.addRoutes = function(app) {

  app.route('/patches/:view')
    .get(patches)

}


// Patch views
function patches(req, res, next) {

  var locals = req.locals

  switch (req.params.view) {

    case 'active':

      req.sreq.path('/stats/from/messages/to/patches')
      locals.title = 'Active Patches'
      break

    case 'popular':

      req.sreq.path('/stats/from/users/to/patches')
      req.sreq.query({query: {filter: {type: 'watch'}}})
      locals.title = 'Popular Patches'
      break

    case 'watching':

      // Must be signed in to see patches watched
      if (!locals.user) return res.redirect('/signin?prev=' + req.path)

      // Construct service request query
      req.sreq.path('/data/users/' + locals.user._id)
      req.sreq.query({
        query: {
          links: {to: {patches: 1}, filter: {type: 'watch'},
          sort: '-modifiedDate', limit: 100, skip: 0},
        }
      })

      locals.title = "Patches I'm Watching"
      break

    case 'own':

      // Must be signed in to see patches I own
      if (!locals.user) return res.redirect('/signin?prev=' + req.path)

      // Construct sreq query
      req.sreq.path('/data/patches')
      req.sreq.query({query: {_owner: locals.user._id,}})

      locals.title = "Patches I Own"
      break

    default: return next()
  }

  locals.view = 'list'
  utils.renderData(req, res, next)
}
