/**
 * lib/routes/patches.js
 *
 * /patches router
 */


var shared = require('./index')


exports.addRoutes = function(app) {

  app.route('/patches?')
    .get(patches)
    .post(insert)

  app.route('/patches/:_id')
    .post()

  app.route('/patches/tending')
    .get(nyi)

  app.route('/patches/popular')
    .get(nyi)

  app.route('/patches/:_id/messages')
    .get(nyi)
    .post(nyi)
}


function patches(req, res, next) {
  res.redirect('/patches/trending')
}


function nyi(req, res) {
  res.send('NYI')
}
