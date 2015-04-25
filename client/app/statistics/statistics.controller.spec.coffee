'use strict'

describe 'Controller: StatisticsCtrl', ->

  # load the controller's module
  beforeEach module 'gtranslateApp'
  StatisticsCtrl = undefined
  scope = undefined

  # Initialize the controller and a mock scope
  beforeEach inject ($controller, $rootScope) ->
    scope = $rootScope.$new()
    StatisticsCtrl = $controller 'StatisticsCtrl',
      $scope: scope

  it 'should ...', ->
    expect(1).toEqual 1
