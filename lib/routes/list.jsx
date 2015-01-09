
/** @jsx React.DOM */

// Trending patches

var React = require('react')
var Layout = require('./layout')


var Trending = React.createClass({
  render: function() {
    var title = config.name + " Trending Patches"
    var data = this.props.data
    var user = this.props.user
    return (
      <Layout title={title} user={user}>
        Some Data!
        <br />
        {data}
        <br />
        Yummy!
      </Layout>
    )
  }
})


module.exports = Trending
