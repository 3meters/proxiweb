
/** @jsx React.DOM */

// Display details view for a document


var React = require('react')
var Layout = require('./layout')
var ButtonBar = require('./buttons')
var scrub = require('scrub')
var utils = require('./utils')


// Remove fields that should not be displayed in the web
// UI.  If blacklist value is true, always remove them.
// If it is an object, removed them in the modes specified
// but display them in the modes not specified
function pruneFields(schema, mode) {

  var blacklist = {
    _acl: true,
    _id: {create: true, edit: true},
    _creator: true,
    _modifier: true,
    _owner: true,
    activityDate: true,
    createdDate: {create: true, edit: true},
    createdIp: true,
    data: true,
    hidden: true,
    modifiedDate: {create: true, edit: true},
    location: true,
    locked: true,
    modifiedIp: true,
    namelc: true,
    position: true,
    photo: {create: true},
    public: true,
    restricted: true,
    schema: true,
    subtitle: true,
  }

  // Prune
  for (var fieldName in schema.fields) {
    if (blacklist[fieldName]) {
      if (_.isBoolean(blacklist[fieldName])) {
        delete schema.fields[fieldName]
      }
      else if (blacklist[fieldName][mode]) {
        delete schema.fields[fieldName]
      }
    }
  }
  return schema
}


// Construct the display properties for any field
function buildDisplayProperties(schema) {

  // Default field display properties
  var defaults = {
    className: 'field',
    label: function(fieldName) {
      // Make a Title Case label from a camelCase field name
      var label = fieldName.replace(/([A-Z])/g, " $1" ) // insert a space before all caps
      return label[0].toUpperCase() + label.slice(1) // capitalize the first char of all words
    },
    component: null,
  }

  // Non-default field diplay properties
  var exceptions = {
    _id:  {label: 'Id'},
    photo: {component: 'Picture'},
  }

  // Construct default display properties
  for (var fieldName in schema.fields) {
    for (var prop in defaults) {
      if (_.isFunction(defaults[prop])) {
        schema.fields[fieldName][prop] = defaults[prop].call(
            schema.fields[fieldName], fieldName, schema.fields[fieldName].type
          )
      }
      else schema.fields[fieldName][prop] = defaults[prop]
    }
  }

  // Override exceptions
  for (var fieldName in schema.fields) {
    if (exceptions[fieldName]) {
      for (var prop in exceptions[fieldName]) {
        schema.fields[fieldName][prop] = exceptions[fieldName][prop]
      }
    }
  }
  return schema
}


// Frame: outer container for fields. Div if view mode otherwise form
var Frame = React.createClass({
  render: function() {
    var mode = this.props.mode
    var clName = this.props.clName
    var data = this.props.data || {}
    var children = this.props.children

    switch (mode) {
      case 'view':   return <div>{children}</div>
      case 'create': return <form method="post" action={"/" + clName}>{children}</form>
      case 'edit':   return <form method="post" action={"/" + clName + "/" + data._id}>{children}</form>
    }
  }
})


var Picture = React.createClass({
  render: function() {
    var name = this.props.name
    var value = this.props.value
    var picUrl = utils.pictureUrl(value)
    return <img src={picUrl} className="picture" />
  }
})


// Field
var Field = React.createClass({
  render: function() {

    var name = this.props.name
    var value = this.props.value
    var fieldSpec = this.props.schema.fields[name]

    if (fieldSpec.component === 'Picture') {
      return <Picture name={name} value={value} />
    } else {
      switch (this.props.mode) {
        case 'view': return <p className="fieldDisplay">{value}</p>
        case 'create': return <input className={fieldSpec.className} name={name} />
        case 'edit': return <input className={fieldSpec.className} name={name} defaultValue={value} />
      }
    }
  }
})


// Render Field inputs
var Fields = React.createClass({

  render: function() {

    var clName = this.props.clName
    var schema = this.props.schema
    var user = this.props.user
    var mode = this.props.mode
    var data = this.props.data || {}

    var fieldsMarkup = Object.keys(schema.fields).map(function(fieldName) {
      return (
        <div className="row pad" key={fieldName}>
          <p className="fieldLabel">{schema.fields[fieldName].label}{":"}</p>
          <Field mode={mode} name={fieldName} value={data[fieldName]} schema={schema} />
        </div>
      )
    })

    return <div>{fieldsMarkup}</div>
  }
})


// Details
var Details = React.createClass({

  render: function() {

    var data = this.props.data
    var mode = this.props.mode  // 'view', 'edit', 'create'
    var user = this.props.user
    var title = this.props.title
    var clName = this.props.clName
    var schema = this.props.schema

    // Prune blacklisted fields for non-admins
    if (!user || user.role !== 'admin') {
      schema = pruneFields(schema, mode)
    }

    // Set display properties
    schema = buildDisplayProperties(schema, mode)

    /*
    var buttons = [
      {key: "update", value: "Update", href: "/" + clName + "/" + data._id + "/edit"},
      {key: "delete", value: "Delete", href: "/" + clName + "/" + data._id + "/delete"},
    ]

    <ButtonBar mode={mode}, clName={clName}, data={data} />

    <div className="row pad">
      <input className="btn btn-default" type="submit" value="Create" />
    </div>
    */

    return (
      <Layout user={user} title={title}>
        <Frame mode={mode} clName={clName} data={data}>
          <Fields mode={mode} schema={schema} clName={clName} user={user} data={data} />
        </Frame>
      </Layout>
    )
  }
})


module.exports = Details
