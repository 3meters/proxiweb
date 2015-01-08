/*
 * App config file
 */

module.exports = {
  serviceUri: 'https://localhost:6643',  // or https://api.aircandi.com
  name: 'Patchr',
  mode: 'development',                  // development | test | stage | production
  protocol: 'https',
  host: 'localhost',
  host_external: 'www.patchr.com',
  port: 8843,                           // 8843:dev 8844:test 444:stage 443:production
  ssl: {
    keyFilePath: './keys/dev/dev.pem',
    certFilePath: './keys/dev/dev.crt',
    caFilePath: null,
  },
}
