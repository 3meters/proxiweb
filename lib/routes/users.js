/**
 * lib/routes/users.js
 *
 * User Management routes
 */

var service = require('../')
var utils = require('../utils')

// Request router
exports.addRoutes = function(app) {
  app.route('/signin')
    .get(showSignin)
    .post(signin)
  app.route('/signout')
    .get(signout)
}


// Display the signin form
function showSignin(req, res) {
  req.locals.prev = req.query.prev  // url to return to after signin
  res.render('signin', req.locals)
}


// Attempt to signin to the service
function signin(req, res, next) {

  service.post('/auth/signin')

    .send({
      email: req.body.email,
      password: req.body.password,
      installId: config.name,
    })

    .end(function(err, sres, body) {

      if (err) return res.send(err)
      if (!sres.ok) return res.status(sres.statusCode).send(body)

      // Session is saved in client's local cookie
      req.session.user = body.user
      req.session.credentials = body.credentials

      // Caller can request to be returned to a particular page
      var next = req.body.prev || '/'
      res.redirect(next)
    })
}


// Sign out
function signout(req, res) {
  req.session = null
  res.redirect('/')
}
