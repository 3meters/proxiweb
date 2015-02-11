
/** @jsx React.DOM */

// List View

var React = require('react')
var Layout = require('./layout')
var utils = require('../utils')
var cls = utils.cls()
var links = utils.links()


// Top
var Top = React.createClass({
  render: function() {

    var data = this.props.data
    if (!data) return <div/>

    var cl = this.props.cl
    var href = "/" + cl + "/" + data._id
    var pictureUrl = utils.pictureUrl(data.photo)

    return (
      <div>
        <div className="row">
          <a href={href}><img src={pictureUrl} className="picture"/></a>
        </div>
        <div className="row">
          <a href={href}>{data.name}</a>
        </div>
      </div>
    )
  }
})


// Linked Document Counts
var LinkedCount = React.createClass({
  render: function() {

    var lc = this.props.linkedCount
    if (!lc) return <div/>

    var href = this.props.href
    var markup = []

    for (var direction in lc) {
      for (var cl in lc[direction]) {
        for (var type in lc[direction][cl]) {
          var link = utils.linksKeyByValue({direction: direction, type: type})
          var linkLabel = links[link].label || link[0].toUpperCase() + link.slice(1) + ": "
          markup.push(
            <div key={link + cl}>{linkLabel}
              <a href={href + "/" + link + "/" + cl}>
                {lc[direction][cl][type]}
              </a>
            </div>
          )
        }
      }
    }
    return <div>{markup}</div>
  }
})


// Rows
var Rows = React.createClass({

  render: function() {

    var outerCl = this.props.cl

    var rowMarkup = this.props.data.map(function(doc) {

      var cl = doc.collection || outerCl
      var detailsHref = "/" + cl + "/" + doc._id
      var pictureUrl = utils.pictureUrl(doc.photo, 'sm')
      var type = ""
      if (doc.category && doc.category.name) type = doc.category.name
      var location = ""
      if (doc.city) {
        location = doc.city
        if (doc.region) location += ", " + doc.region
      }

      var fieldsMarkup = function() {
        switch(cl) {

          case 'users':
            return (
              <div>
                <div><a href={detailsHref}>{doc.name}</a></div>
                <div>{location}</div>
                <LinkedCount href={detailsHref} linkedCount={doc.linkedCount}/>
              </div>
            )

          case 'patches':
            return (
              <div>
                <div><a href={detailsHref}>{doc.name}</a></div>
                <div>{type}</div>
                <div>{"Owner: "}<a href={"/users/" + doc._owner}>{doc.owner}</a></div>
                <div>{"Visibility: " + doc.visibility}</div>
                <LinkedCount href={detailsHref} linkedCount={doc.linkedCount}/>
              </div>
            )

          case 'messages':
            var message = "Message"
            if (doc.description) {
              message = doc.description.slice(0,50)
              if (doc.description.length > message.length) message+= "..."
            }
            return (
              <div>
                <div><a href={detailsHref}>{message}</a></div>
                <div>{"From: "}<a href={"/users/" + doc._owner}>{doc.owner}</a></div>
                <LinkedCount href={detailsHref} linkedCount={doc.linkedCount}/>
              </div>
            )

          case 'places':
            return (
              <div>
                <div><a href={detailsHref}>{doc.name}</a></div>
                <div>{type}</div>
                <div>{location}</div>
                <LinkedCount href={detailsHref} linkedCount={doc.linkedCount}/>
              </div>
            )
        }
      }()

      return (
        <div className="row pad list" key={doc._id}>
          <div className="col1 text-right">
            <a href={detailsHref}><img src={pictureUrl} className="pictureSm" /></a>
          </div>
          <div className="col2">
            {fieldsMarkup}
          </div>
        </div>
      )
    })

    return <div>{rowMarkup}</div>
  }
})


var List = React.createClass({

  render: function() {

    var title = this.props.title
    var user = this.props.user
    var data = this.props.data
    var cl = this.props.cl
    var schema = this.props.schema
    var link = this.props.link
    var linkCl = this.props.linkCl
    var linkSchema = this.props.linkSchema
    var path = this.props.path
    var createName = ''
    var parent = null
    var rows = []

    if (linkCl) {
      // Rows will be displayed as children
      rows = data.linked  // data is a document with linked children
      parent = data
      createName = linkSchema.name
    }
    else {
      // Rows will be at the top level
      rows = data  // data is an array
      createName = schema.name
    }

    var actionBar = function() {
      return null
    }()

    return (
      <Layout title={title} user={user}>
        <Top data={parent} cl={cl}/>
        <div>{actionBar}</div>
        <Rows data={rows} cl={cl}/>
      </Layout>
    )
  }
})


module.exports = List
