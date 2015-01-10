/** @jsx React.DOM */

var React = require('react')
var Layout = require('./layout.jsx')

var SigninForm = React.createClass({
  render: function() {
    var title = config.name + ' Sign In'
    return (
      <Layout title={title}>
        <form id="signin" method="post" action="/signin">
          <div className="row">
            <input className="field" id="email" name="email" placeholder="Email" />
          </div>
          <div className="row">
            <input className="field" id="password" name="password" placeholder="Password" type="password" />
          </div>
          <div className="button">
            <input type="submit", name: "go", value: "Sign in" />
          </div>
        </form>
      </Layout>
    )
  }
})

module.exports = SigninForm
