/**
 * lib/routes/users.js
 *
 * User Management routes
 */

var utils = require('../utils')
var service = require('../service')

// Request router
exports.addRoutes = function(app) {

  app.route('/signup')
    .get(showSignup)
    .post(signup)

  app.route('/signin')
    .get(showSignin)
    .post(signin)

  app.route('/signout')
    .get(signout)

  app.route('/profile')
    .get(utils.nyi)
    .post(utils.nyi)
}


// Display signup form
function showSignup(req, res) {
  res.render('signup', req.locals)
}


// Send signup request to service
function signup(req, res, next) {

  var err = scrub(req.body, {
    name: {required: true},
    email: {required: true},
    password: {required: true},
    secret: {required: true},
  })

  if (err) return res.error(err)
  if (req.body.password !== req.body.password2) {
    return res.status(400).send('Passwords do not match')
  }

  service.post('/user/create')
    .send({
      data: {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
      },
      secret: req.body.secret,
      installId: config.name,
    })
    .end(function(err, sres, body) {
      if (err) return next(err)
      if (!sres.ok) {
        return res.status(sres.statusCode).send(body)
      }
      body.user.session = body.session.key
      req.session.user = body.user
      res.redirect('/')
    })
}


// Display the signin form
function showSignin(req, res) {
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

    .debug()

    .end(function(err, sres, body) {

      if (err) return log({svcErr: err}) // next(err)
      if (!sres.ok) return res.status(sres.statusCode).send(body)

      // Session is saved in client's local cookie
      req.session.user = body.user
      req.session.user.session = body.session.key

      // Caller can request a page to be returned to
      var next = req.query.prev || '/'
      res.redirect(next)
    })
}


// Sign out
function signout(req, res) {
  req.session = null
  res.redirect('/')
}
