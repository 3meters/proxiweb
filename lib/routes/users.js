/**
 * lib/routes/users.js
 *
 * /users router
 */


var shared = require('./index')


exports.addRoutes = function(app) {

  app.route('/users?')
    .get(nyi)

  app.route('/users/:_id/patches')
    .get(nyi)

  app.route('/users/:_id/patches/watching')
    .get(nyi)

  app.route('/users/:_id/patches/owned')
    .get(nyi)
}


function nyi(req, res, next) {
  res.send('NYI')
}

function patches(req, res, next) {
  res.redirect('/users/' + req.params._id + '/patches/watching'
}

// Show watched patches
function watching(req, res, next) {

  var path = '/data/users/' + req.viewData.user._id
  var qry = {
    links: {to: {patches: 1}, filter: {type: 'watch'},
        sort: '-modifiedDate', limit: 100, skip: 0}
  }

  // Extract the linked patch documents from the query
  function transform(data) {
    var results = []
    if (!data.links) return results
    data.links.forEach(function(link) {
      if (link.document) {
        link.document.collection = link.collection
        results.push(link.document)
      }
    })
    return results
  }

  // Render options
  var options = {
    view: 'patches',
    path: path,
    qry: qry,
    transform: transform,
  }

  shared.render(req, res, options, next)
}
