var Board = require("../lib/board.js"),
    events = require("events"),
    util = require("util"),
    es6 = require("es6-collections"),
    WeakMap = es6.WeakMap;

/*
/ forward: right cw, left ccw
/ reverse: right ccw, left cw
*/

// Quad H-Bridge Constructor specific arrays
var priv = new WeakMap();

function HBridge( opts ) {

  if ( !(this instanceof HBridge) ) {
    return new HBridge( opts );
  }

  opts = Board.options( opts );

  // Hardware instance properties
  this.board = Board.mount( opts );
  this.firmata = this.board.firmata;
  this.mode = this.firmata.MODES.OUTPUT;

  this.right = {
    "forward" : {
      "pin" : opts.right.forward,
      "isOn" : false
    },
    "reverse" : {
      "pin" : opts.right.reverse,
      "isOn" : false
    }
  };

  this.left = {
    "forward" : {
      "pin" : opts.left.forward,
      "isOn" : false
    },
    "reverse" : {
      "pin" : opts.left.reverse,
      "isOn" : false
    }
  }

  this.firmata.pinMode( this.right.forward.pin, this.mode );
  this.firmata.pinMode( this.right.reverse.pin, this.mode );
  this.firmata.pinMode( this.left.forward.pin, this.mode );
  this.firmata.pinMode( this.left.reverse.pin, this.mode );
}

util.inherits( HBridge, events.EventEmitter );

// Move 
HBridge.prototype.start = function( wheel, direction ) {
  // Send a HIGH signal to turn on the motor
  this.firmata.digitalWrite( wheel[direction].pin, this.firmata.HIGH );

  wheel[direction].isOn = true;

  // "start" event is fired when the motor is started
  this.emit( "start", null, new Date() );

  return this;
};

HBridge.prototype.stop = function( wheel, direction ) {
  // Send a LOW signal to shut off the motor
  this.firmata.digitalWrite( wheel[direction], this.firmata.LOW );

  wheel[direction].isOn = false;

  // "stop" event is fired when the motor is stopped

  return this;
};

HBridge.prototype.forward = function() {
  if( this.right.reverse.isOn || this.left.reverse.isOn ) {
    this.firmata.digitalWrite( this.right.reverse.pin, this.firmata.LOW );
    this.firmata.digitalWrite( this.left.reverse.pin, this.firmata.LOW );

    this.right.reverse.isOn = false;
    this.left.reverse.isOn = false;
  }

  this.firmata.digitalWrite( this.right.forward.pin, this.firmata.HIGH );
  this.firmata.digitalWrite( this.left.forward.pin, this.firmata.HIGH );

  this.emit( "forward", null, new Date() );

  this.right.forward.isOn = true;
  this.left.forward.isOn = true;

};

HBridge.prototype.reverse = function() {
  if( this.right.forward.isOn || this.left.forward.isOn ) {
    this.firmata.digitalWrite( this.right.forward.pin, this.firmata.LOW );
    this.firmata.digitalWrite( this.left.forward.pin, this.firmata.LOW );

    this.right.forward.isOn = false;
    this.left.forward.isOn = false;
  }

  this.firmata.digitalWrite( this.right.reverse.pin, this.firmata.HIGH );
  this.firmata.digitalWrite( this.left.reverse.pin, this.firmata.HIGH );

  this.emit( "reverse", null, new Date() );

  this.right.reverse.isOn = true;
  this.left.reverse.isOn = true;
}

// turn right
HBridge.prototype.gee = function() {
  this.firmata.digitalWrite( this.right.forward.pin, this.firmata.LOW);
  this.firmata.digitalWrite( this.right.reverse.pin, this.firmata.HIGH);
  this.firmata.digitalWrite( this.left.forward.pin, this.firmata.HIGH);
  this.firmata.digitalWrite( this.left.reverse.pin, this.firmata.LOW);
}

// turn left
HBridge.prototype.haw = function() {
  this.firmata.digitalWrite( this.right.forward.pin, this.firmata.HIGH);
  this.firmata.digitalWrite( this.right.reverse.pin, this.firmata.LOW);
  this.firmata.digitalWrite( this.left.forward.pin, this.firmata.LOW);
  this.firmata.digitalWrite( this.left.reverse.pin, this.firmata.HIGH);
}


HBridge.prototype.halt = function() {
  this.firmata.digitalWrite( this.right.forward.pin, this.firmata.LOW);
  this.firmata.digitalWrite( this.right.reverse.pin, this.firmata.LOW);
  this.firmata.digitalWrite( this.left.forward.pin, this.firmata.LOW);
  this.firmata.digitalWrite( this.left.reverse.pin, this.firmata.LOW);
}

module.exports = HBridge;
