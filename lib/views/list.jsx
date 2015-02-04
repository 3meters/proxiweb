
/** @jsx React.DOM */

// List View

var React = require('react')
var Layout = require('./layout')
var utils = require('../utils')

// Top
var Top = React.createClass({

  render: function() {
    var data = this.props.data

    if (!data) return <div />

    var clName = this.props.clName
    var href = "/" + clName + "/" + data._id
    var pictureUrl = utils.pictureUrl(data.photo)

    return (
      <div>
        <div className="row">
          <a href={href}><img src={pictureUrl} className="picture" /></a>
        </div>
        <div className="row">
          <a href={href}>{data.name}</a>
        </div>
      </div>
    )
  }
})


// Rows
var Rows = React.createClass({

  render: function() {

    var outerClName = this.props.clName

    var rowMarkup = this.props.data.map(function(doc) {

      var clName = doc.collection || outerClName
      var detailsHref = "/" + clName + "/" + doc._id
      var pictureUrl = utils.pictureUrl(doc.photo, 'sm')
      var type = ""
      if (doc.category && doc.category.name) type = doc.category.name

      var fieldsMarkup = function() {
        switch(clName) {

          case 'users':
            return <div><a href={detailsHref}>{doc.name}</a></div>

          case 'patches':
            var lc = doc.linkCounts
            var cWatching = 0
            if (lc && lc.users && lc.users.from) cWatching = lc.users.from
            var cMessages = 0
            if (lc && lc.messages && lc.messages.from) cMessages = lc.messages.from
            return (
              <div>
                <div><a href={detailsHref}>{doc.name}</a></div>
                <div>{type}</div>
                <div>{"Owner: "}<a href={"/users/" + doc._owner}>{doc.owner}</a></div>
                <div>{"Visibility: " + doc.visibility}</div>
                <div>{"Watching: "}
                  <a href={detailsHref + "/watch/from/users"}>{cWatching}</a>
                </div>
                <div>{"Messages: "}
                  <a href={detailsHref + "/content/from/messages"}>{cMessages}</a>
                </div>
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
              </div>
            )

          case 'places':
            return (
              <div>
                <div><a href={detailsHref}>{doc.name}</a></div>
                <div>{type}</div>
                <div>{doc.city + ", " + doc.region}</div>
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
