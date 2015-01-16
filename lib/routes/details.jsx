
/** @jsx React.DOM */

// Display details view for an entity

var React = require('react')
var Layout = require('./layout')
var ButtonBar = require('./buttons')
var scrub = require('scrub')
var utils = require('./utils')


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


// Field
var Field = React.createClass({
  render: function() {
    var name = this.props.name
    var value = this.props.value
    if (fields[name].className.indexOf('picture') >= 0) {
      var picUrl = utils.pictureUrl(value)
      return <img src={picUrl} className={fields[name].className} />
    } else {
      return <div className={fields[name].className}>{value}</div>
    }
  }
})


// Fields
var Fields = React.createClass({
  render: function() {
    var data = this.props.data
    var rows = Object.keys(fields).map(function(key) {
      if (!data[key]) return <div />
      return (
        <div className="row" key={key}>
          <div className="col-md-4">
            {fields[key].label}
          </div>
          <div className="col-md-8">
            <Field name={key} val={data[key]} />
          </div>
        </div>
      )
    })
    return <div>{rows}</div>
  }
})

var Details = React.createClass({

  render: function() {

    var data = this.props.data
    var user = this.props.user
    var title = this.props.user
    var clName = this.props.clName

    if (_.isArray(data)) data = data[0]

    var buttons = [
      {key: "update", value: "Update", href: "/" + clName + "/" + data._id + "/edit"},
      {key: "delete", value: "Delete", href: "/" + clName + "/" + data._id + "/delete"},
    ]

    return (
      <Layout user={user}>
        <Fields user={user} data={data} />
        <ButtonBar buttons={buttons} />
      </Layout>
    )
  }
})


module.exports = Details
