
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
      var location = ""
      if (doc.city) {
        location = doc.city
        if (doc.region) location += ", " + doc.region
      }

      var fieldsMarkup = function() {
        switch(clName) {

          case 'users':
            return (
              <div>
                <div><a href={detailsHref}>{doc.name}</a></div>
                <div>{location}</div>
                <div>{"Watching: "}
                  <a href={detailsHref + "/watch/to/patches"}>
                    {doc.linkedCount.to.patches}
                  </a>
                </div>
                <div>{"Owns: "}
                  <a href={detailsHref + "/create/to/patches"}>
                    {doc.linkedCount.to.patches}
                  </a>
                </div>
                <div>{"Likes: "}
                  <a href={detailsHref + "/create/to/patches"}>
                    {doc.linkedCount.to.patches}
                  </a>
                </div>
              </div>
            )

          case 'patches':
            return (
              <div>
                <div><a href={detailsHref}>{doc.name}</a></div>
                <div>{type}</div>
                <div>{"Owner: "}<a href={"/users/" + doc._owner}>{doc.owner}</a></div>
                <div>{"Visibility: " + doc.visibility}</div>
                <div>{"Watching: "}
                  <a href={detailsHref + "/watch/from/users"}>
                    {doc.linkedCount.from.users}
                  </a>
                </div>
                <div>{"Messages: "}
                  <a href={detailsHref + "/content/from/messages"}>
                    {doc.linkedCount.from.messages}
                  </a>
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
                <div>{location}</div>
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
    if (_.isPlainObject(data) && _.isArray(data.linked)) {
      rows = data.linked
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
