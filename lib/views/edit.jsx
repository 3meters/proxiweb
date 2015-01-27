
/** @jsx React.DOM */

// Display create view for a document


var React = require('react')
var Layout = require('./layout')
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
// We could add an optional schema property called label with
// with a default function that created an up
var fieldSpecs = {
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


// Initialize defualt field spec properties on require
;(function() {
  for (var key in fieldSpecs) {
    var err = scrub(fieldSpecs[key], fieldSpec)
    if (err) throw err
  }
})()


// Remove some fields for non-admins
var fieldBlacklist = {
  createdDate: true,
  modifiedDate: true,
  createdIp: true,
  modifiedIp: true,
  activityDate: true,
  restricted: true,
  _creator: true,
  _owner: true,
  _modifier: true,
  _acl: true,
  _id: true,
  namelc: true,
  schema: true,
  locked: true,
  hidden: true,
  public: true,
  subtitle: true,
  position: true,
  data: true,
}


// Render Field inputs
var Fields = React.createClass({

  render: function() {
    var clName = this.props.clName
    var schema = this.props.schema
    var user = this.props.user

    // Move the data field to the bottom of the list
    var fields = _.clone(schema.fields)
    var dataField = _.clone(fields.data)
    delete fields.data
    fields.data = dataField

    // Prune blacklisted fields for non-admins
    if (user.role !== 'admin') {
      for (var name in fields) {
        if (fieldBlacklist[name]) delete fields[name]
      }
    }

    // Make a Title Case label from a camelCase field name
    function makeLabel(name) {
      var label = name.replace(/([A-Z])/g, " $1" ) // insert a space before all caps
      return label[0].toUpperCase() + label.slice(1) // capitalize the first char of all words
    }

    var fieldsMarkup = Object.keys(fields).map(function(name) {
      // Type-specific formatting goes here
      var label = makeLabel(name)
      return (
        <div className="row pad tight" key={name}>
          <p className="fieldLabel">{label}{":"}</p>
          <input className="field" name={name}/>
        </div>
      )
    })

    return <div>{fieldsMarkup}</div>
  }
})


// Create
var Create = React.createClass({

  render: function() {

    var user = this.props.user
    var title = this.props.title
    var clName = this.props.clName
    var schema = this.props.schema

    return (
      <Layout user={user} title={title}>
        <div className="form">
          <form key="create" method="post" action={"/" + clName}>
            <Fields schema={schema} user={user}/>
            <div className="row pad">
              <input className="btn btn-default" type="submit" value="Create" />
            </div>
          </form>
        </div>
      </Layout>
    )
  }
})


module.exports = Create
