
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

    var outerClName = this.props.clName

    var rowMarkup = this.props.data.map(function(doc) {
      var type = ""
      var clName = doc.collection || outerClName
      var detailsHref = "/" + clName + "/" + doc._id
      var pictureUrl = utils.pictureUrl(doc.photo, 'sz')
      if (doc.category && doc.category.name) type = doc.category.name
      return (
        <div className="row pad" key={doc._id}>
          <div className="col left pad">
            <a href={detailsHref}><img src={pictureUrl} className="pictureSm" /></a>
          </div>
          <div className="col left pad">
            <a href={detailsHref}>{doc.name}</a><br />
            {doc.owner}

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

      // Invert the array of links with nested documents
      // to and array of documents with nested links
      rows = data.links.map(function(link) {
        if (link.document) {
          var linkClone = _.clone(link)
          delete linkClone.document
          link.document.collection = link.collection
          link.document.link = linkClone
          return link.document
        }
      })
      delete data.links
      parent = data
    }

    return (
      <Layout title={title} user={user}>
         <Top data={parent} clName={this.props.clName} />
         <Rows data={rows} clName={this.props.clName} />
      </Layout>
    )
  }
})


module.exports = List
