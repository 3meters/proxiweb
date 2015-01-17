/*
 * App config file
 */

module.exports = {
  serviceUri: 'https://api.aircandi.com:8443/v1',  // or https://localhost:port
  name: 'Patchr',
  mode: 'development',                  // development | test | stage | production
  protocol: 'https',
  host: 'localhost',
  port: 8843,                           // 8843:dev 8844:test 444:stage 443:production
  ssl: {
    keyFilePath: './keys/dev/dev.pem',
    certFilePath: './keys/dev/dev.crt',
    caFilePath: null,
  },
}
