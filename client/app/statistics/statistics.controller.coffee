'use strict'

angular.module 'gtranslateApp'
.controller 'StatisticsCtrl', ($scope, $http) ->
  $scope.message = 'Hello'

  $scope.update = ->
    $http.get('/api/translator')
    .success (data, status, error, config) ->
      console.log data
      $scope.stats = data
    .error (data, status, error, config) ->
      console.log error

  $scope.showDetails = (search) ->
    console.log search
    $http.get('/api/translator/' + search)
    .success (data, status, error, config) ->
      console.log(data);
      translations = []
      try
        data = JSON.parse(data[0].result)
        _.each(data, (item) ->
          category =
            name: item[0]
            variants: []
          _.each(item[2], (item) ->
            category.variants.push {
              translation: item[0]
              synonyms: item[1]
            }
          )
          translations.push category
        )
        $scope.translations = translations
      catch e
        $scope.translations = [{variant: 'Error occured'}]
    .error (data, status, error, config) ->
      console.log error