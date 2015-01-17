
/** @jsx React.DOM */

// Display create view for a document


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

    var fieldsMarkup = Object.keys(fields).map(function(name) {
      // Type-specific formatting goes here
      return (
        <div className="row">
          <input className="field" key={name} name={name} placeholder={name} />
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
            <input type="submit" name="cmdRun" value="Create" />
          </form>
        </div>
      </Layout>
    )
  }
})


module.exports = Create
