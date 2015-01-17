/** @jsx React.DOM */

var React = require('react')
var Layout = require('./layout.jsx')

var SigninForm = React.createClass({
  render: function() {
    var title = config.name + ' Sign In'
    var prev = this.props.prev  // where to return on success
    return (
      <Layout title={title} hideTopBar={true}>
        <div className="row">
          <div className="col-md-6">
            <form id="signin" method="post" action="/signin">
              <div className="row">
                <input className="field" name="email" placeholder="Email" />
              </div>
              <div className="row">
                <input className="field" name="password" placeholder="Password" type="password" />
              </div>
              <div className="row">
                <input className="button" type="submit" name="go" value="Sign in" />
                <input className="hidden" name="prev" value={prev} />
              </div>
            </form>
          </div>
        </div>
      </Layout>
    )
  }
})

module.exports = SigninForm
