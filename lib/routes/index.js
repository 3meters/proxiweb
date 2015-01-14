/**
 * lib/routes/index.js
 *
 * Base router
 */

var qs = require('qs')
var request = require('superagent')
var moment = require('moment')
var serviceUri = config.serviceUri + '/v1'


// Request router
exports.addRoutes = function(app) {

  app.all('*', setDefaults)

  app.get('/', start)

  app.route('/signup')
    .get(showSignup)
    .post(signup)

  app.route('/signin')
    .get(showSignin)
    .post(signin)

  app.route('/signout')
    .get(signout)

  app.all('/:view', whitelistRoutes)

  app.all('*', whitelistMethods)

  app.route('/users?')
    .get(users)

  app.route('/patches?')
    .get(patches)
    .post(insert)

  app.route('/patches/trending')
    .get(patchesTrending)

  app.route('/patches/popular')
    .get(patchesPopular)

  app.route('/messages?')
    .post(insert)

  app.route('/:cl/:_id?')
    .get(details)
    .post(update)
    .delete(delete)

  app.route('/:cl/insert')
    .get(showInsert)

  app.route('/:cl/:_id?/update')
    .get(showUpdate)
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
  var user = req.viewData.user
  if (user) res.redirect('/users/' + user._id + '/patches/watching')
  else res.redirect('/patches/trending')
}


// filter out unrecognized routes
function whitelistRoutes(req, res, next) {
  switch (req.params.view) {
    case 'users':
    case 'patches':
    case 'messages':
      return next()
  }
  res.status(404).send('Not Found')
}


// Whitelist methods, checking for user in order to write
function whitelistMethods(req, res, next) {
  log({method: req.method})
  var method = req.method.toLowerCase()
  if (method === 'get') return next()
  if (req.viewData.user && (method === 'post' || method === 'del' || method === 'delete')) {
    return next()
  }
  res.status(400).send('Invalid Request')
}


function patches(req, res, next) {
  res.redirect('/patches/trending')
}


// Show trending patches
function watchedPatches(req, res, next) {
  var path = ''

  if (req.viewData.user) {
    path = '/data/users/' + req.viewData.user._id + "?"
    path += qs.stringify({
      refs: 'name',
      links: {to: {patches: 1}, filter: {type: 'watch'},
          sort: '-modifiedDate', limit: 100, skip: 0}
    })
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
      if (link.document) {
        link.document.collection = link.collection
        results.push(link.document)
      }
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

