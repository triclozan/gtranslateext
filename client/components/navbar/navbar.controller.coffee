'use strict'

angular.module 'gtranslateApp'
.controller 'NavbarCtrl', ($scope, $location) ->
  $scope.menu = [{
    title: 'Home'
    link: '/'
  },{
    title: 'Translator'
    link: '/translator'
  },{
    title: 'Statistics'
    link: '/statistics'
  }]
  $scope.isCollapsed = true

  $scope.isActive = (route) ->
    route is $location.path()