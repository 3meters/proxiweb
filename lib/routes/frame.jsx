/** @jsx React.DOM */

/*
 * Outer frame for content
 */


var React = require('react')
var Layout = require('./layout.jsx')
var Home = require('./home.jsx')
var Trending = require('./trending.jsx')



var Frame = React.createClass({

  render: function() {

    var title = config.name
    var user = this.props.user
    var cred = null

    if (user) {
      cred = 'user=' + user._id + '&session=' + user.session
      return (
        <Layout title={title}>
          <h1>{title}</h1>
          <TopBar user={user} />
          <Home user={user}  />
          <BottomBar />
        </Layout>
      )
    } else {
      return (
        <Layout title={title}>
          <h1>{title}</h1>
          <TopBar user={user} />
          <Trending user={user} />
          <BottomBar />
        </Layout>
      )
    }
  }
})

module.exports = Frame
