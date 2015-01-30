/** @jsx React.DOM */

var React = require('react')

var TopBar = React.createClass({
  render: function() {
    var user = this.props.user

    if (this.props.hide) return <div />

    if (user) {
      return (
        <div className="top">
          Welcome {user.name}{": "}
          <a href="/signout">Sign out</a>{" "}
        </div>
      )
    } else {
      return (
        <div className="top">
          <a href="/signup">Sign up</a>{" "}
          <a href="/signin">Sign in</a>
        </div>
      )
    }
  }
})

var BottomBar = React.createClass({
  render: function() {
    return (
      <div>
        <div className="bottom">
          <div className="leftCol" />
          <div>{"Service: " + config.serviceUri}</div>
        </div>
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
          <link rel="stylesheet" href="/assets/css/bootstrap.css" />
          <link rel="stylesheet" href="/assets/css/style.css" />
        </head>
        <body>
          <h1>{title}</h1>
          <TopBar user={user} hide={this.props.hideTopBar}/>
          {this.props.children}
          <BottomBar />
        </body>
      </html>
    )
  }
})

module.exports = Layout
