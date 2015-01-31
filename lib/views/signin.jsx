/** @jsx React.DOM */

var React = require('react')
var Layout = require('./layout.jsx')

var SigninForm = React.createClass({
  render: function() {
    var title = config.name + ' Sign In'
    var prev = this.props.prev  // where to return on success
    return (
      <Layout title={title} hideTopBar={true}>
        <div className="top" />
        <form id="signin" method="post" action="/signin">
          <div className="row">
            <div className="col1">{"Email:"}</div>
            <div className="col2"><input className="field" name="email" /></div>
          </div>
          <div className="row">
            <div className="col1">{"Password:"}</div>
            <div className="col2"><input className="field" name="password" type="password" /></div>
          </div>
          <div className="row">
            <div className="col2">
              <input className="btn btn-default" type="submit" value="Sign in" />
              <input className="hidden" name="prev" value={prev} readOnly="true"/>
            </div>
          </div>
        </form>
      </Layout>
    )
  }
})

module.exports = SigninForm
