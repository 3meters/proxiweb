/**
 * lib/routes/index.js
 *
 * Base router
 */

var qs = require('qs')
var request = require('superagent')
var moment = require('moment')
var serviceUri = config.serviceUri + '/v1'


// Data router
exports.addRoutes = function(app) {
  app.all('*', setDefaults)
  app.get('/signup', showSignupForm)
  app.post('/signup', signup)
  app.get('/signin', showSigninForm)
  app.post('/signin', signin)
  app.get('/signout', signout)
  app.get('/patches', patches)
  app.get('/users', users)
  app.get('/messages', messages)
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
  res.redirect('/patches')
}


// Show patches
function patches(req, res, next) {
  var path = ''

  if (req.viewData.user) {
    path = '/data/users/' + req.viewData.user._id + "?"
        + qs.stringify({links: {to: {patches: 1}}, linkFilter: {type: 'watch'}, refs: 'name'})
  } else {
    var sevenDaysAgo = moment() - (7 * 24 * 60 * 60 * 1000)
    var sevenDaysAgoString = moment(sevenDaysAgo).format('YYMMDD')
    path = '/stats/to/patches/from/messages?'
      + qs.stringify({refs: 'name'})
      //+ qs.stringify({lookups: 1, day: {$gt: sevenDaysAgoString}})
  }

  // Render options
  var options = {
    view: 'patches',
    path: path,
    transform: transform,
  }

  // Extract the linked patch documents from the query
  function transform(data) {
    var results = []
    if (!data.links) return results
    data.links.forEach(function(link) {
      if (link.document) results.push(link.document)
    })
    return results
  }
  render(req, res, options, next)
}


// Show users
function users(req, res, next) {
  res.send('NYI')
}


// Show messages
function messages(req, res, next) {
  res.send('NYI')
}


// Execute a rest query against the service defined by path.
// Optionally transform the results with the passed-in function.
// Then and rendor the specified page passing in the results.
function render(req, res, options, next) {
  var url = serviceUri + options.path
  log('get ' + url)
  request
    .get(url)
    .end(function(err, sres) {
      if (err) return next(err)
      if (!sres.ok) return res.status(sres.statusCode).send(sres.body)
      if (sres.body.data) {
        if (options.transform) {
          req.viewData.data = options.transform(sres.body.data)
        } else {
          req.viewData.data = sres.body.data
        }
      }
      res.render(options.view, req.viewData)
    })
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
function showSigninForm(req, res) {
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

