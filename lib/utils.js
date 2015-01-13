/*
 * utils.js
 *
 *    shared utilities
 */


// Helper to generate a picture Url from service photo object
exports.pictureUrl = function(photo) {

  // log({photo: photo})
  var url = ''  // should default to a not-found image stored on s3
  if (!photo) return url

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
