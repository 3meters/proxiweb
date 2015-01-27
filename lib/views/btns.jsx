/** @jsx React.DOM */

var React = require('react')

var ButtonBar = React.createClass({

  render: function() {

    var buttonLayout = this.props.buttons.map(function(btn) {
      return (
        <div className="left" key={btn.key}>
          <a className="btn btn-default" href={btn.href}>{btn.value}</a>
        </div>
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
