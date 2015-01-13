
/** @jsx React.DOM */

// Patches List View


var React = require('react')
var Layout = require('./layout')
var utils = require('../utils')


// Rows
var Rows = React.createClass({

  render: function() {

    var rows = this.props.data.map(function(ent) {
      log({ent: ent})
      var type = ""
      var detailsHref = "/" + ent.collection + "/" + ent._id
      var pictureUrl = utils.pictureUrl(ent.photo)
      if (ent.category && ent.category.name) type = ent.category.name
      return (
        <div className="row">
          <div className="col-md-4" key={ent._id}>
            <a href={detailsHref}><img src={pictureUrl} className="picture" /></a>
          </div>
          <div className="col-md-8">
            {ent.schema}{": "}
            <a href={detailsHref}>{ent.name}</a>
          </div>
        </div>
      )
    })

    return (<div>{rows}</div>)
  }
})


var List = React.createClass({

  render: function() {

    var title = this.props.title
    var data = this.props.data
    var user = this.props.user

    return (
      <Layout title={title} user={user}>
         <Rows data={data} />
      </Layout>
    )
  }
})


module.exports = List
