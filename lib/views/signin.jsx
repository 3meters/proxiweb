/** @jsx React.DOM */

var React = require('react')
var Layout = require('./layout.jsx')

var SigninForm = React.createClass({
  render: function() {
    var title = config.name + ' Sign In'
    var prev = this.props.prev  // where to return on success
    return (
      <Layout title={title} hideTopBar={true}>
        <form id="signin" method="post" action="/signin">
          <div className="row">
            <div className="leftCol">{"Email:"}</div>
            <input className="field" name="email" />
          </div>
          <div className="row">
            <div className="leftCol">{"Password:"}</div>
            <input className="field" name="password" type="password" />
          </div>
          <div className="row">
            <div className="leftCol" />
            <input className="btn btn-default" type="submit" value="Sign in" />
            <input className="hidden" name="prev" value={prev} readOnly="true"/>
          </div>
        </form>
      </Layout>
    )
  }
})

module.exports = SigninForm
