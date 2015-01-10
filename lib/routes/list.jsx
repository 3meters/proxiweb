
/** @jsx React.DOM */

// List view

var React = require('react')
var Layout = require('./layout')
var utils = require('../utils')


// Left Column, pictures
var LeftCol = React.createClass({

  render: function() {

    var rows = this.props.data.links.from.map(function(ent) {
      var picUrl = utils.pictureUrl(ent.photo)
      var detailsHref = "/" + ent.schema + "/" + ent._id
      return (
        <a href={detailsHref}>
          <img src={pictureUrl} className="picture-preview" />
        </a>
      )
    })

    return (<div className="col-left pad">{rows}</div>)
  }
})


// Right column, text
var RightCol = React.createClass({

  render: function() {

    var rows = this.props.data.links.from.map(function(ent) {
      var detailsHref = "/" + ent.schema + "/" + ent._id
      var type = ''
      if (ent.category && ent.category.name) type = ent.category.name
      return (
        <div className="contanier">
          <a href={detailsHref}>{ent.name}</a>
          {type}

        </div
      }
    })
  }
})


var List = React.createClass({

  render: function() {

    var title = this.props.title
    var data = this.props.data
    var user = this.props.user

    rowsLayout = data.map(function(ent) {
      var picUrl = utils.pictureUrl(ent.photo)
      return (
        <div className="container">
          <div 
        </div>
      )
    })

    return (
      <Layout title={title} user={user}>
      </Layout>
    )
  }
})


module.exports = List
