/** @jsx React.DOM */

var React = require('react')

var ButtonBar = React.createClass({

  render: function() {

    var buttonLayout = this.props.buttons.map(function(btn) {
      return (
        <a className="btn btn-default left" key={btn.key} href={btn.href}>{btn.value}</a>
      )
    })

    return (
      <div className="row pad">
        {buttonLayout}
      </div>
    )
  }
})


module.exports = ButtonBar
