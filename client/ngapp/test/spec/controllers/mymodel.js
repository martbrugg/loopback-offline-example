'use strict';

describe('Controller: MymodelCtrl', function () {

  // load the controller's module
  beforeEach(module('loopbackExampleFullStackApp'));

  var MymodelCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MymodelCtrl = $controller('MymodelCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(MymodelCtrl.awesomeThings.length).toBe(3);
  });
});
