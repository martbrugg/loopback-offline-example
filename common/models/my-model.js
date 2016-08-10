// Copyright IBM Corp. 2014,2015. All Rights Reserved.
// Node module: loopback-example-offline-sync
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

var async = require('async');

module.exports = function(MyModel) {
  MyModel.definition.properties.created.default = Date.now;

  MyModel.stats = function(filter, cb) {
    var stats = {};
    cb = arguments[arguments.length - 1];
    var MyModel = this;

    async.parallel([
      countComplete,
      count
    ], function(err) {
      if (err) return cb(err);
      stats.remaining = stats.total - stats.completed;
      cb(null, stats);
    });

    function countComplete(cb) {
      Todo.count({completed: true}, function(err, count) {
        stats.completed = count;
        cb(err);
      });
    }

    function count(cb) {
      MyModel.count(function(err, count) {
        stats.total = count;
        cb(err);
      });
    }
  };

  MyModel.handleChangeError = function(err) {
    console.warn('Cannot update change records for MyModel:', err);
  };

  MyModel.remoteMethod('stats', {
    accepts: {arg: 'filter', type: 'object'},
    returns: {arg: 'stats', type: 'object'},
    http: { path: '/stats' }
  }, MyModel.stats);
};
