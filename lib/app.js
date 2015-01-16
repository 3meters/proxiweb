/**
 * app: Express app config and top-level router
 */

var fs = require('fs')
var url = require('url')
var path = require('path')
var express = require('express')
var favicon = require('serve-favicon')
var robots = require('robots.txt')
var compression = require('compression')
var serveStatic = require('serve-static')
var cookieParser = require('cookie-parser')
var cookieSession = require('cookie-session')
var bodyParser = require('body-parser')
var app = express()
var routeDir = path.join(__dirname, 'routes')


// Init on module load
init()


// Set up the app middleware and routes
function init() {

  app.use(favicon(path.join(__dirname, '../assets/favicon.ico')))
  app.use(robots(path.join(__dirname, '../assets/robots.txt')))

  // Set up view engine
  app.set('views', routeDir)
  app.set('view engine', 'jsx');
  app.engine('jsx', require('express-react-views').createEngine({jsx: {harmony: true}}));

  app.use('/assets/', serveStatic(path.join(__dirname, '../assets')))

  app.use(compression())
  // see https://github.com/expressjs/body-parser
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({extended: true}))
  app.use(cookieParser())
  app.use(cookieSession({
    key: 'candi.sess',
    secret: 'yeudkdtyldishfdjfuetddywtwhd',
    cookie: {maxAge: 60 * 60 * 24 * 1000, httpOnly: false},
    proxy: true,
  }))
  addPreRoutes(app)
  addRoutes(app)
  addPostRoutes(app)
}


// All requests pass through these routes first, in order
function addPreRoutes(app) {

  // Parse pathname and query string
  app.all('*', function(req, res, next) {
    req.method = req.method.toLowerCase()
    var urlObj = url.parse(req.url, true)
    var paths = urlObj.pathname.split('/')
    paths.shift() // remove leading empty element
    if (paths[paths.length - 1] === '') paths.pop() // url had trailing slash
    req.paths = paths
    // accept body params on the query string
    if (_.isEmpty(req.body) && tipe.isObject(req.query) && !_.isEmpty(req.query)) {
      req.body = req.query
    }
    next()
  })


  // If a post contains base params hoist them to req.query
  app.post('*', processBody)

  function processBody(req, res, next) {
    if (req.body) {
      if (req.body.lang && !req.query.lang) req.query.lang = req.body.lang
      if (req.body.user && !req.query.user) req.query.user = req.body.user
      if (req.body.session && !req.query.session) req.query.session = req.body.session
      if (req.body.version && !req.query.version) req.query.version = req.body.version
    }
    next()
  }


  // Set the default language per Royal British Navy AD 1600-1900
  app.all('*', function(req, res, next) {
    req.lang = req.query.lang || 'en'
    next()
  })

}



// Load routes from the routes directory.  Route order is not garanteed,
// so cross-route dependencies should be made explicity
function addRoutes(app) {
  callAllSync(routeDir, 'init', app)
  callAllSync(routeDir, 'addRoutes', app)
}


function addPostRoutes(app) {
  // Nobody answered, fall through
  app.all('*', function(req, res) {
    return res.status(404).send('Not Found')
  })
}


// Synchronously execute the specified method in all javascript files in a directory
function callAllSync(dir, method) {

  var args = [].slice.call(arguments, 2) // slice off dir and method

  fs.readdirSync(dir).forEach(function(fileName) {

    var module = null
    var filePath = path.join(dir, fileName)
    var fileExt = path.extname(fileName)

    if (fileExt === '.js' || fs.statSync(filePath).isDirectory()) {
      module = require(filePath)
      if (module && (typeof module[method] === 'function')) {
        module[method].apply(null, args) // run it, applying all args
      }
    }
  })
}


module.exports = app
