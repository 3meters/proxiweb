
/** @jsx React.DOM */

// Display details view for a document


var React = require('react')
var Layout = require('./layout')
var utils = require('../utils')


// Remove fields that should not be displayed in the web
// UI.  If blacklist value is true, always remove them.
// If it is an object, removed them in the modes specified
// but display them in the modes not specified
function buildFields(cl, oldFields, mode, asAdmin) {

  var fields = {}

  var whitelist = {
    before: {
      photo: {view: true, edit: true},
      name: true,
      _id:  {view: true},
      owner: {view: true},
      description: true,
    },
    cls: {
      messages: {
        _root: true,
        _replyTo: true,
      },
      patches: {
        visibility: true,
      },
      places: {
        phone: true,
        address: true,
        city: true,
        region: true,
        postalCode: true,
      },
      users: {
        bio: true,
      },
    },
    after: {
      createdDate: {view: true},
      modifiedDate: {view: true},
    },
  }

  // Conditionally add fields depending on specification and mode
  function add(name, spec) {
    if (!spec) return
    if (_.isBoolean(spec) || spec[mode]) {
      fields[name] = oldFields[name] || {type: 'string'}  // Not in schema, like owner, guess string
    }
  }

  // Beginning common fields
  for (var fieldName in whitelist.before) {
    add(fieldName, whitelist.before[fieldName])
  }
  // Collection-specific fields
  if (whitelist.cls[cl]) {
    for (fieldName in whitelist.cls[cl]) {
      add(fieldName, whitelist.cls[cl][fieldName])
    }
  }
  // Ending common fields
  for (var fieldName in whitelist.after) {
    add(fieldName, whitelist.after[fieldName])
  }
  // Admins see all fields
  if (asAdmin) fields = _.merge(fields, oldFields)

  return fields
}


// Construct the display properties for any field
function buildDisplayProperties(fields) {

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

  // Non-default display properties
  var exceptions = {
    _id:  {label: 'Id'},
    photo: {component: 'Picture'},
  }

  // Construct default display properties
  for (var fieldName in fields) {
    for (var prop in defaults) {
      if (_.isFunction(defaults[prop])) {
        fields[fieldName][prop] =
          defaults[prop].call(fields[fieldName], fieldName, fields[fieldName].type)
      }
      else fields[fieldName][prop] = defaults[prop]
    }
  }

  // Override defaults with exceptions
  for (var fieldName in fields) {
    if (exceptions[fieldName]) {
      for (var prop in exceptions[fieldName]) {
        fields[fieldName][prop] = exceptions[fieldName][prop]
      }
    }
  }
  return fields
}


// Frame: outer container for fields. Div if view mode otherwise form
var Frame = React.createClass({
  render: function() {
    var mode = this.props.mode
    var cl = this.props.cl
    var data = this.props.data || {}
    var children = this.props.children

    switch (mode) {
      case 'view':   return <div>{children}</div>
      case 'create': return <form method="post" action={"/" + cl}>{children}</form>
      case 'edit':   return <form method="post" action={"/" + cl + "/" + data._id}>{children}</form>
    }
  }
})


// Render a picture
var Picture = React.createClass({
  render: function() {
    var picUrl = utils.pictureUrl(this.props.value)
    return <img src={picUrl} className="picture" />
  }
})


// Field
var Field = React.createClass({
  render: function() {

    var name = this.props.name
    var value = this.props.value
    var fieldSpec = this.props.fieldSpec

    if (fieldSpec.component === 'Picture') {
      return <Picture name={name} value={value} />
    } else {
      var defaultValue = value
      if (fieldSpec.type === 'object') defaultValue=null
      switch (this.props.mode) {
        case 'view': return <p>{value}</p>
        case 'create': return <input className={fieldSpec.className} name={name} />
        case 'edit': return <input className={fieldSpec.className} name={name} defaultValue={defaultValue} />
      }
    }
  }
})


// Render Field inputs
var Fields = React.createClass({

  render: function() {

    var cl = this.props.cl
    var fields = this.props.fields
    var user = this.props.user
    var mode = this.props.mode
    var data = this.props.data || {}

    var fieldsMarkup = Object.keys(fields).map(function(fieldName) {
      return (
        <div className="row" key={fieldName}>
          <div className="col1">
            <p>{fields[fieldName].label + ":"}</p>
          </div>
          <div className="col2">
            <Field mode={mode} name={fieldName} value={data[fieldName]} fieldSpec={fields[fieldName]} />
          </div>
        </div>
      )
    })

    return <div>{fieldsMarkup}</div>
  }
})


// Action bar
//
// TODO: Add a Cancel button.  This sould execute a client-side javascript window.back
//   command, but I haven't figured out how to send client-side script down yet.  Solution
//   possibly involves creating a React component directly, bypassing the .jsx transpiler.
//
var Actions = React.createClass({

  render: function() {

    var mode = this.props.mode
    var cl = this.props.cl
    var data = this.props.data || {}
    var canEdit = this.props.canEdit
    var hrefDoc = "/" + cl + "/" + data._id

    var actionMarkup = function() {
      switch (mode) {
        case 'view':
          if (!canEdit) return <div/>
          return (
            <div>
              <a className="btn btn-default" href={hrefDoc + "/edit"}>Edit</a>
              <a className="btn btn-default" href={hrefDoc + "/delete"}>Delete</a>
            </div>
          )
        case 'create':
        case 'edit':
            return (
            <div>
              <input className="btn btn-default" type="submit" value="Save" />
            </div>
          )
      }
    }()

    return (
      <div className="row pad">
        <div className="col1" />
        <div>{actionMarkup}</div>
      </div>
    )
  }
})


// Details
var Details = React.createClass({

  render: function() {

    var data = this.props.data
    var mode = this.props.mode  // 'view', 'edit', 'create'
    var user = this.props.user
    var title = this.props.title
    var cl = this.props.cl
    var canEdit = this.props.canEdit
    var schema = this.props.schema
    var fields = {}

    var asAdmin = (user && user.role === 'admin')

    if (asAdmin) fields = _.cloneDeep(schema.fields)

    // Build the display field list
    fields = buildFields(cl, fields, mode, asAdmin)

    // Set field display properties
    fields = buildDisplayProperties(fields, mode)

    return (
      <Layout user={user} title={title}>
        <Frame mode={mode} cl={cl} data={data}>
          <Fields mode={mode} fields={fields} cl={cl} user={user} data={data} />
          <Actions mode={mode} cl={cl} data={data} canEdit={canEdit}/>
        </Frame>
      </Layout>
    )
  }
})


module.exports = Details
