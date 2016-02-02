"use strict";
const util = require('util');
const msgpack = require('msgpack-lite');
const net = require('net');


class FluentSender {
  constructor (tag, options) {
    options = options || {};
    this.tag = tag;
    this.host = options.host || 'localhost';
    this.port = options.port || 24224;
    this.path = options.path;
    this.timeout = options.timeout || 3.0;
    this.reconnectInterval = options.reconnectInterval || 600000; // Default is 10 minutes
    this.verbose = this.verbose || false;
    this._timeResolution = options.milliseconds ? 1 : 1000;
    this._socket = null;
    this._sendQueue  = [];

    this._init();
  }

  _init () {
    let self = this;
    self._bindEvents();
  }

  _bindEvents () {
    let self = this;

    //self._setupErrorHandler();
  }

  _setupErrorHandler () {
    let self = this;

    if (!self.reconnectInterval) {
      return false;
    }

    self.on('error', function(error) {
      setTimeout(function() {
        self._connect(function() {});
      }, self.reconnectInterval);
    });
  }

  _connect (callback) {
    let self = this;

    if(self._socket === null) {
      self._socket = new net.Socket();
      self._socket.setTimeout(self.timeout);
      self._socket.on('error', function(err){
        if(self._socket){
          self._socket.destroy();
          self._socket = null;
        }
      });
      if (self.path) {
        self._socket.connect(self.path, function() {
          callback();
        });
      } else {
        self._socket.connect(self.port, self.host, function() {
          callback();
        });
      }
    }else{
      if(!self._socket.writable){
        self._socket.destroy();
        self._socket = null;
        process.nextTick(function(){
          self._connect(callback);
        });
      }else{
        process.nextTick(function(){
          callback();
        });
      }
    }
  }

  _makePacketItem (label, data, time) {
    let self = this;

    var tag = label ? [self.tag, label].join('.') : self.tag;

    if (typeof time != "number") {
      time = (time ? time.getTime() : Date.now()) / this._timeResolution;
    }

    var packet = [tag, time, data];
    return {
      packet: msgpack.encode(packet),
      tag: tag,
      time: time,
      data: data
    };
  }

  _flushSendQueue () {
    let self = this;

    if(self._sendQueue.length && self._sendQueue[0] !== undefined) {
      let item = self._sendQueue.shift();
      self._socket.write(new Buffer(item.packet), function() {
        item.callback && item.callback();
      });
      process.nextTick(function(){
        // socket is still available
        if( self._socket && self._socket.writable ){
          self._flushSendQueue();
        }
      });
    }
  }

  _close () {
    let self = this;

    if(self._socket){
      self._socket.end();
      self._socket = null;
    }
  }

  emit (label, data, timestamp, callback) {
    let self = this;

    let item = self._makePacketItem(label, data, timestamp);
    item.callback = callback;
    self._sendQueue.push(item);
    self._sendQueueTail++;
    self._connect(function () {
      self._flushSendQueue();
    });
  }

  end (label, end, callback) {
    let self = this;

    if((label != null && data != null)) {
      self.emit(label, data, function(err){
        self._close();
        callback(err);
      });
    } else {
      process.nextTick(function(){
        self._close();
      });
    }
  }
}

module.exports.FluentSender = FluentSender;
