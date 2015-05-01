'use strict'

angular.module 'gtranslateApp'
.controller 'TranslatorCtrl', ($scope, $stateParams, $http, $q) ->
  $scope.translation = 'Nothing to show here yet...'
  oldCanceler = null

  $scope.directionTest = (regexp, search) ->
    return (new RegExp(regexp)).test(search)

  $scope.translate = (searchParam) ->
    if (oldCanceler)
      oldCanceler.resolve()
    canceler = $q.defer();
    oldCanceler = canceler

    if (searchParam)
      $scope.sentenceToTranslate = searchParam

    $http.get('/api/translator/translate', {
      params: { search: searchParam || $scope.sentenceToTranslate },
      timeout: canceler.promise
    })
    .success (data, status, error, config) ->
      console.log data
      $scope.languages = []
      try
        #data = JSON.parse(data)
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
        #$scope.translations = [{variant: 'Error occured'}]
        #$scope.mainTranslation = ''
    .error (data, status, error, config) ->
      if typeof error != 'function'
        console.log error

  if ($stateParams.search)
    $scope.translate $stateParams.search
