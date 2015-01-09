/**
 * lib/routes/index.js
 *
 * Base router
 */

var qs = require('qs')
var request = require('superagent')
var moment = require('moment')


// Data router
exports.addRoutes = function(app) {
  app.all('*', setDefaults)
  app.get('/signup', showSignupForm)
  app.post('/signup', signup)
  app.get('/signin', showSigninForm)
  app.post('/signin', signin)
  app.get('/signout', signout)
  app.get('/', start)
}


// Set some defaults for all requests
function setDefaults(req, res, next) {
  res.isHtml = true
  // req.viewData is the base object passed to all views, set some defaults
  req.viewData = req.vewData || {}
  req.viewData.user = req.session.user
  next()
}


// Show a different home page depending on whether user is signed in
function start(req, res, next) {
  if (req.user) showHome(req, res, next)
  else showTrending(req, res, next)
}


// Show trending patches
function showTrending(req, res, next) {
  var sevenDaysAgo = moment() - (7 * 24 * 60 * 60 * 1000)
  var sevenDaysAgoString = moment(sevenDaysAgo).format('YYMMDD')
  request
    .get(config.serviceUri + '/v1/stats/to/patches/from/messages')
    //.send({day: {$gt: sevenDaysAgoString}})
    .end(function(err, sres) {
      if (err) return next(err)
      if (!sres.ok) return res.status(sres.statusCode).send(body)
      var body = sres.body
      req.viewData.data = body.data
      res.render('trending', req.viewData)
    })
}


function showHome(req, res, next) {
  res.render('home')
}


// Display signup form
function showSignupForm(req, res) {
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
    .post(config.serviceUri + '/v1/user/create')
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
function showSigninForm(req, res) {
  req.viewData.title = 'Sign In'
  res.render('signin', req.viewData)
}


// Attempt to signin to the service
function signin(req, res, next) {
  request.post(config.serviceUri + '/v1/auth/signin')
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
