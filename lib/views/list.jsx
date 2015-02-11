
/** @jsx React.DOM */

// List View

var React = require('react')
var Layout = require('./layout')
var utils = require('../utils')


// Top
var Top = React.createClass({
  render: function() {

    var data = this.props.data
    if (!data) return <div/>

    var clName = this.props.clName
    var href = "/" + clName + "/" + data._id
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
    var linkName
    var linkLevel
    var markup = []

    for (var direction in lc) {
      for (var clName in lc[direction]) {
        for (var type in lc[direction][clName]) {
          linkName = utils.getLinkTypeMapKey({direction: direction, type: type})
          linkLabel = linkName[0].toUpperCase() + linkName.slice(1) + ":"
          markup.push(
            <div key={linkName + clName}>{linkLabel}
              <a href={href + "/" + linkName + "/" + clName}>
                {lc[direction][clName][type]}
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

var ActionBar = React.createClass({

  render: function() {

    var createName = this.props.createName
    var href = this.props.path + "/create"
    return (
      <div>
        <a className="btn btn-default" href={href}>New {createName}</a>
      </div>
    )
  }
})

var List = React.createClass({

  render: function() {

    var title = this.props.title
    var user = this.props.user
    var data = this.props.data
    var clName = this.props.clName
    var schema = this.props.schema
    var linkName = this.props.linkName
    var linkedClName = this.props.linkedClName
    var linkedSchema = this.props.linkedSchema
    var path = this.props.path
    var createName = ''
    var parent = null
    var rows = []

    if (linkedClName) {
      // Rows will be displayed as children
      rows = data.linked  // data is a document with linked children
      parent = data
      createName = linkedSchema.name
    }
    else {
      // Rows will be at the top level
      rows = data  // data is an array
      createName = clSchema.name
    }

    return (
      <Layout title={title} user={user}>
         <Top data={parent} clName={clName}/>
         <ActionBar path={path} createName={createName}/>
         <Rows data={rows} clName={clName}/>
         <ActionBar path={path} createName={createName}/>
      </Layout>
    )
  }
})


module.exports = List
