/** @jsx React.DOM */

var React = require('react')

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


var Layout = React.createClass({
  render: function() {
    var user = this.props.user
    var title = this.props.title || config.name
    return (
      <html>
        <head>
          <title>{title}</title>
          <link rel="stylesheet" href="/v1/assets/styles/style.css" />
        </head>
        <body>
          <h1>{title}</h1>
          <TopBar user={user} />
          {this.props.children}
          <BottomBar user={user} />
        </body>
      </html>
    )
  }
})

module.exports = Layout
