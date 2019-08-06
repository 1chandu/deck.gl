"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

importScripts('./util.js');
var result = [];
var count = 0;
var blob = '';
var timestamp = 0;
var pattern = /^(.)(.+)\x01(.{4})(.{4})(.+)$/;

onmessage = function onmessage(e) {
  var lines = (blob + e.data.text).split('\n');
  blob = lines.pop();
  lines.forEach(function (line) {
    if (!line) {
      return;
    }

    var parts = line.match(pattern);
    parts.shift();

    var _parts$map = parts.map(function (x) {
      return decodeNumber(x, 90, 32);
    }),
        _parts$map2 = (0, _slicedToArray2.default)(_parts$map, 5),
        mag = _parts$map2[0],
        dt = _parts$map2[1],
        lat = _parts$map2[2],
        lon = _parts$map2[3],
        d = _parts$map2[4];

    timestamp += dt;
    result.push({
      timestamp: timestamp,
      latitude: (lat - 9e5) / 1e4,
      longitude: (lon - 1.8e6) / 1e4,
      depth: (d - 300) / 100,
      magnitude: (mag + 30) / 10
    });
    count++;
  });

  if (e.data.event === 'load') {
    flush();
    postMessage({
      action: 'end'
    });
  }
};

function flush() {
  postMessage({
    action: 'add',
    data: result,
    meta: {
      count: count
    }
  });
  result = [];
}