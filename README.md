# fluent-logger for Node.js

fluent-logger implementation for Node.js inspired by [fluent-logger-python].

## Install

    $ npm install fluent-logger

## Prerequistes

Fluent daemon should listen on TCP port.

## Usage

### Send an event record to Fluentd

Singleton style

    

Instance style

    


The emit method has following signature

   .emit([label string], <record object>, [timestamp number/date], [callback function])

Where only the `record` argument is required. If the label is set it will be
appended to the configured tag.

## Logging Library Support

### log4js

Before using [log4js] support, you should install it IN YOUR APPLICATION.


    var log4js = require('log4js');
    log4js.addAppender(require('fluent-logger').support.log4jsAppender('mytag', {
       host: 'localhost',
       port: 24224,
       timeout: 3.0
    }));

    var logger = log4js.getLogger('foo');
    logger.info('this log record is sent to fluent daemon');

You can add log level after tag automatically.

    var log4js = require('log4js');
    log4js.addAppender(require('fluent-logger').support.log4jsAppender('mytag', {
       host: 'localhost',
       port: 24224,
       timeout: 3.0,
       levelTag: true
    }));

    var logger = log4js.getLogger('foo');
    logger.info('this log record is sent to fluent daemon');

If `levelTag` is `true`, tag is "mytag.INFO". If `levelTag` is `false`, tag is "mytag".

You can handle inner events such as 'error' it is raised when fluentd
is down.

    var log4js = require('log4js');
    var appender = require('fluent-logger').support.log4jsAppender('mytag', {
      host: 'localhost',
      port: 24224,
      timeout: 3.0
    });
    appender.on('error', function(err) {
      // Handle err object
      console.log(err);
    });
    log4js.addAppender(appender);

## Options

**tag**

The tag string.

**host**

The hostname. Default value = 'localhost'.

See [socket.connect][1]

**port**

The port to listen to. Default value = 24224.

See [socket.connect][1]

**path**

The path to your Unix Domain Socket.
If you set `path` then fluent-logger ignores `host` and `port`.

See [socket.connect][1]

**timeout**

Set the socket to timetout after `timeout` milliseconds of inactivity
on the socket.

See [socket.setTimeout][2]

**reconnectInterval**

Set the reconnect interval in milliseconds.
If error occurs then reconnect after this interval.

**verbose**

If set `true`, verbose output.

[1]: https://nodejs.org/api/net.html#net_socket_connect_path_connectlistener
[2]: https://nodejs.org/api/net.html#net_socket_settimeout_timeout_callback

## License

Apache License, Version 2.0.

[fluent-logger-python]: https://github.com/fluent/fluent-logger-python


## Abour NodeJS versions

This package is compatible with NodeJS versions > 0.10.
