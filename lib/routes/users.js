/**
 * lib/routes/users.js
 *
 * User Management routes
 */

var utils = require('./utils')
var request = require('superagent')

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
  res.render('signup', req.viewData)
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

  request
    .post(serviceUri + '/user/create')
    .send({
      data: {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
      },
      secret: req.body.secret,
      installId: config.name,
    })
    .end(function(err, sres) {
      var body = sres.body
      if (err) return next(err)
      if (!sres.ok) {
        return res.status(sres.statusCode).send(body)
      }
      req.session.user = body.user
      req.session.user.session = body.session.key
      res.redirect('/?'  + qs.stringify({
        user: body.user._id,
        session: body.session.key,
      }))
    })
}


// Display the signin form
function showSignin(req, res) {
  req.viewData.title = 'Sign In'
  res.render('signin', req.viewData)
}


// Attempt to signin to the service
function signin(req, res, next) {
  request.post(serviceUri + '/auth/signin')
    .send({
      email: req.body.email,
      password: req.body.password,
      installId: config.name,
    })
    .end(function(err, sres) {
      if (err) return next(err)
      if (!sres.ok) {
        return res.status(sres.statusCode).send(body)
      }
      var body = sres.body
      req.session.user = body.user
      req.session.user.session = body.session.key
      res.redirect('/?' + qs.stringify({
        user: body.user._id,
        session: body.session.key,
      }))
    })
}


// Sign out
function signout(req, res) {
  req.session = null
  res.redirect('/')
}
