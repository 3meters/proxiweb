
/** @jsx React.DOM */

// List View

var React = require('react')
var Layout = require('./layout')
var utils = require('./utils')

// Top
var Top = React.createClass({

  render: function() {
    var data = this.props.data
    if (!data) return <div />

    var clName = this.props.clName
    var href = "/" + clName + "/" + data._id
    var pictureUrl = utils.pictureUrl(data.photo)

    return (
      <div className="container">
        <a href={href}><img src={pictureUrl} className="pictureMd" /></a>
        <a href={href}>{data.name}</a>
      </div>
    )
  }
})


// Rows
var Rows = React.createClass({

  render: function() {

    var rowMarkup = this.props.data.map(function(ent) {
      // log({ent: ent})
      var type = ""
      var detailsHref = "/" + ent.collection + "/" + ent._id
      var pictureUrl = utils.pictureUrl(ent.photo)
      if (ent.category && ent.category.name) type = ent.category.name
      return (
        <div className="row" key={ent._id}>
          <div className="col-md-4">
            <a href={detailsHref}><img src={pictureUrl} className="pictureSm" /></a>
          </div>
          <div className="col-md-8">
            <a href={detailsHref}>{ent.name}</a>
          </div>
        </div>
      )
    })

    return (<div>{rowMarkup}</div>)
  }
})


var List = React.createClass({

  render: function() {

    var title = this.props.title
    var user = this.props.user
    var data = this.props.data
    var parent = null
    var rows = []

    if (_.isArray(data)) rows = data
    if (_.isPlainObject(data) && _.isArray(data.links)) {
      rows = data.links.map(function(link) {
        if (link.document) {
          link.document.collection = link.collection
          return link.document
        }
      })
      delete data.links
      parent = data
    }

    return (
      <Layout title={title} user={user}>
         <Top data={parent} clName={this.props.clName}/>
         <Rows data={rows} />
      </Layout>
    )
  }
})


module.exports = List
