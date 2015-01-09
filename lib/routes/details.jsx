
/** @jsx React.DOM */

// Display details view for an entity

var React = require('react')
var Layout = require('./layout')
var scrub = require('scrub')


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


// Helper to generate a picture Url from service photo object
var pictureUrl = function(photo) {
  // log({photo: photo})
  var url = ''  // should go to our not found image
  if (photo.source && photo.source.match(/^aircandi\./)) {
    var prefix = photo.source.replace(/\./g, '-')  // replace dots with dashes
    url = 'https://' + prefix + '.s3.amazonaws.com/' + photo.prefix
  } else if (photo.source && photo.source === 'aircandi') {  // old naming scheme
    url = 'https://aircandi-images.s3.amazonaws.com/' + photo.prefix
  } else if (photo.prefix) {
    url = photo.prefix
  }
  return url
}


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
        var picUrl = pictureUrl(ent[key])
        return (
          <div className="row" key={key}>
            <img src={picUrl} className='picture' />
          </div>
        )
      } else {
        return (<div className="row" key={key}>{ent[key]}</div>)
      }
    })

    return (<div className="col-center pad">{rows}</div>)
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
