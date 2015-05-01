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
      console.log data
      $scope.mainTranslation = data[0].main;
      $scope.ruTranslation = data[0].ru;
      $scope.languages = []
      try
        data = JSON.parse(data[0].result)
        _.each(data, (item) ->
          if (item && item.data)
            language =
              direction: item.direction
              translations: []
              self: item.data[0][0][1]
              mainTranslation: item.data[0][0][0]
            console.log 'Categories'
            if (item.data[1])
              _.each(item.data[1], (item) ->
                category =
                  name: item[0]
                  variants: []
                _.each(item[2], (item) ->
                  category.variants.push {
                    translation: item[0]
                    synonyms: item[1]
                    frequency: if item.length == 4 then (if item[3] >= 0.05 then 2 else 1) else 0
                  }
                )
                language.translations.push category
              )
            console.log 'Pushed!'
            $scope.languages.push language
        )
      catch e
        console.log e
    .error (data, status, error, config) ->
      console.log error