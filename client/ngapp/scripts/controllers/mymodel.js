'use strict';

/**
 * @ngdoc function
 * @name loopbackExampleFullStackApp.controller:MymodelCtrl
 * @description
 * # MymodelCtrl
 * Controller of the loopbackExampleFullStackApp
 */
angular.module('loopbackExampleFullStackApp')
  .controller('MymodelCtrl', function ($scope, $routeParams, $filter, MyModel,
                                            $location, sync, network,
                                            getReadableModelId) {
    this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
    console.log('Init Modelcontroller');
    MyModel.create({name: 'Martin'})
    .then(function() {
        console.log('New model created', arguments);
    });

    MyModel.find({
      sort: 'order DESC'
    }, function(err, mymodels) {
      console.log(mymodels);
    });
  });
