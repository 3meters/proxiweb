/** @jsx React.DOM */

/*
 * Outer frame for content
 */


var React = require('react')
var Layout = require('./layout.jsx')
var Home = require('./home.jsx')
var Trending = require('./trending.jsx')


var TopBar = React.createClass({
  render: function() {
    var user = this.props.user
    var cred = null

    if (user) {
      cred = 'user=' + user._id + '&session=' + user.session
      return (
        <div className="content pad">
            Welcome {user.name}{": "}
            <a href="/signout">Sign out</a>{" "}
            <br /><br />
        </div>
      )
    } else {
      return (
        <div className="content pad">
          <a href="/signup">Sign up</a>{" "}
          <a href="/signin">Sign in</a>
          <br /><br />
        </div>
      )
    }
  }
})


var BottomBar = React.createClass({
  render: function() {
    return (
      <div className="content pad">
        <br />
      </div>
    )
  }
})


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
