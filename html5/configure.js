var gulp = require('gulp');
var async = require('async');
var path = require('path');
var pkg = require('./package.json');
var fs = require('fs');
var browserify = require('browserify');
var sh = require('shelljs');
var BootConfigLoader = require('loopback-boot').ConfigLoader;

exports.global = function(env, global) {
  // routes
  global.routes = {
    '/': {
      controller: 'HomeCtrl',
      templateUrl: '/views/welcome.html'
    },
    '/me': {
      controller: 'UserCtrl',
      templateUrl: '/views/me.html',
    },
    '/my/todos/:status': {
      controller: 'TodoCtrl',
      templateUrl: '/views/todos.html'
    },
    '/my/todos': {
      controller: 'TodoCtrl',
      templateUrl: '/views/todos.html'
    },
    '/login': {
      controller: 'LoginCtrl',
      templateUrl: '/views/login.html'
    },
    '/register': {
      controller: 'RegisterCtrl',
      templateUrl: '/views/register.html'
    },
    '/debug': {
      controller: 'ChangeCtrl',
      templateUrl: '/views/changes.html'
    }
  };

  global.bundle = 'bundle.' + pkg.version;
  if(!isDev(env)) global.bundle += '.min';
  global.bundle += '.js';
  global.html5Views = path.join(__dirname, 'views');
  global.html5Bundle = path.join(__dirname, 'build', global.bundle);
  global.bundleURL = '/' + global.bundle;
}

exports.local = function configure(env, global, local) {
  // NOTE: this config will be available in the browser
  local.serverInfo = {
    api: global.api,
    url: global.api.protocol
        + '://'
        + global.api.host
        + ':'
        + global.api.port
        + global.api.root
  };
  local.routes = global.routes;
}

exports.build = function(env, global, local, cb) {
  async.waterfall([
    function(next) {
      buildDataSources(env, next);
    },
    function(next) {
      createBundle(env, global, next);
    }
  ], cb);
};

function buildDataSources(env, cb) {
  var dataSources = BootConfigLoader.loadDataSources(__dirname, env);
  for (var name in dataSources) {
    var cfg = dataSources[name];
    var connector = cfg.connector.toLowerCase();
    if (connector === 'memory' || connector === 'remote') {
      cfg.connector = '::ref::' + connector;
    } else {
      return cb(new Error(
          'Datasource ' + name + ' uses unknown connector ' + connector + '.'));
    }
  }

  var dsconfig = 'var loopback = require(\'loopback\');' +
    '\nmodule.exports = ' +
    JSON.stringify(dataSources, null, 2) +
    ';\n';

  dsconfig = dsconfig
    .replace(/"::ref::memory"/g, 'loopback.Memory')
    .replace(/"::ref::remote"/g, 'loopback.Remote');

  fs.writeFile(
    path.resolve(__dirname, 'build', 'datasources.js'),
    dsconfig,
    'utf-8',
    cb);
}

function createBundle(env, global, cb) {
  var b = browserify({basedir: __dirname});
  b.add('./' + pkg.main);

  var bundleDir = path.dirname(global.html5Bundle);
  if (!fs.existsSync(bundleDir))
    fs.mkdirSync(bundleDir);

  var out = fs.createWriteStream(global.html5Bundle);

  if(!isDev(env)) {
    b.transform({
      global: true
    }, 'uglifyify');
  }

  b.bundle({
    // TODO(bajtos) debug should be always true, the sourcemaps should be
    // saved to a standalone file when !isDev(env)
    debug: isDev(env)
  }).pipe(out);

  out.on('error', cb);
  out.on('close', cb);
}

function isDev(env) {
  return ~['debug', 'development', 'test'].indexOf(env);
}
