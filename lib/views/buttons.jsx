/** @jsx React.DOM */

var React = require('react')

var ButtonBar = React.createClass({

  render: function() {

    var buttonLayout = this.props.buttons.map(function(btn) {
      return (
        <div className="left" key={btn.key}>
          <form method="link" action={btn.href}>
             <input type="submit" value={btn.value} className="button"/>
          </form>
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
