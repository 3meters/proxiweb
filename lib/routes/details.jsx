
/** @jsx React.DOM */

// Display details view for an entity

var React = require('react')
var Layout = require('./layout')
var ButtonBar = require('./buttons')
var scrub = require('scrub')
var utils = require('../utils')


// Default display properties for fields
var fieldSpec = {
  label: {
    type: 'string',
  },
  className: {
    type: 'string',
    default: 'field',
  }
}


// Map entity fields and their diplay properties
var fields = {
  name: {
    label: 'Name',
  },
  _id:  {
    label: 'Id',
  },
  owner: {
    label: 'Owner',
  },
  createdDate: {
    label: 'Created'
  },
  photo: {
    label: 'Picture',
    className: 'picture',
  },
}


// Initialize defualt field properties on require
;(function() {
  for (var key in fields) {
    var err = scrub(fields[key], fieldSpec)
    if (err) throw err
  }
})()


// Left column of field labels
var LeftCol = React.createClass({
  render: function() {
    var rows = Object.keys(fields).map(function(key) {
      return <div className="row" key={key}>{fields[key].label}</div>
    })
    return (<div className="col-left pad">{rows}</div>)
  }
})


// Right column of field values
var RightCol = React.createClass({
  render: function() {
    var ent = this.props.data

    var rows = Object.keys(fields).map(function(key) {
      if (fields[key].className === 'picture') {
        var picUrl = utils.pictureUrl(ent[key])
        return (
          <div className="row" key={key}>
            <img src={picUrl} className='picture' />
          </div>
        )
      } else {
        return (<div className="row" key={key}>{ent[key]}</div>)
      }
    })

    var buttons = [
      {key: "update", value: "Update", href: "/update/" + ent.schema + '/' + ent._id},
      {key: "delete", value: "Delete", href: "/delete/" + ent.schema + '/' + ent._id},
    ]

    return (
      <div className="col-center pad">
        {rows}
        <ButtonBar buttons={buttons} />
      </div>
    )
  }
})


var Details = React.createClass({
  render: function() {
    var data = this.props.data
    var user = this.props.user
    if (_.isArray(data)) data = data[0]
    return (
      <Layout user={user}>
        <LeftCol />
        <RightCol user={user} data={data} />
      </Layout>
    )
  }
})


module.exports = Details
