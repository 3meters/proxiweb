# Proxiweb
Sample Web UI over the Proxibase web service, the
backing service for 3meters patchr.

All requests and responses are logged to stdout.

By default proxiweb points to the 3meters staging
server over the internet.  To point it to different
proxibase server including one running locally, see
the instructions in /config.

Installation
============

    git clone git@github.com:3meters.com/proxiweb
    cd proxiweb
    npm install
    cp config.js.template config.js
    node proxiweb

