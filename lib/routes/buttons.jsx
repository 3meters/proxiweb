/** @jsx React.DOM */

var React = require('react')

var ButtonBar = React.createClass({

  render: function() {

    var buttonLayout = this.props.buttons.map(function(btn) {
      return (
        <div className="button">
          <form key={btn.key} method="link" action={btn.href}>
             <input type="submit" value={btn.value} />
          </form>
        </div>
      )
    })

    return (
      <div className="container">
        {buttonLayout}
      </div>
    )
  }
})


module.exports = ButtonBar
