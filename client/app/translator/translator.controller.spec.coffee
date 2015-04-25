'use strict'

describe 'Controller: TranslatorCtrl', ->

  # load the controller's module
  beforeEach module 'gtranslateApp'
  TranslatorCtrl = undefined
  scope = undefined

  # Initialize the controller and a mock scope
  beforeEach inject ($controller, $rootScope) ->
    scope = $rootScope.$new()
    TranslatorCtrl = $controller 'TranslatorCtrl',
      $scope: scope

  it 'should ...', ->
    expect(1).toEqual 1
