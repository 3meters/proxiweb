/**
 * app: Express app config
 *
 *    installs middleware, render engine and routes
 */


// Module dependencies
var path = require('path')
var express = require('express')
var favicon = require('serve-favicon')
var robots = require('robots.txt')
var compression = require('compression')
var serveStatic = require('serve-static')
var cookieParser = require('cookie-parser')
var cookieSession = require('cookie-session')
var bodyParser = require('body-parser')

// Router
var routes = require('./routes')

// App
var app = express()

// Set up the app middleware and routes
function init() {

  app.use(favicon(path.join(__dirname, '../assets/favicon.ico')))
  app.use(robots(path.join(__dirname, '../assets/robots.txt')))

  // Set up view engine
  app.set('views', path.join(__dirname, 'views'))
  app.set('view engine', 'jsx');
  app.engine('jsx', require('express-react-views').createEngine({jsx: {harmony: true}}));

  // Static files
  app.use('/assets/', serveStatic(path.join(__dirname, '../assets')))

  // Middleware
  app.use(compression())
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({extended: true}))
  app.use(cookieParser())
  app.use(cookieSession({
    key: 'candi.sess',
    secret: 'yeudkdtyldishfdjfuetddywtwhd',
    cookie: {maxAge: 60 * 60 * 24 * 1000, httpOnly: false},
    proxy: true,
  }))

  // Load router
  routes.addRoutes(app)
}

// Init
init()

// Export
module.exports = app
