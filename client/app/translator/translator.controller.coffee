'use strict'

angular.module 'gtranslateApp'
.controller 'TranslatorCtrl', ($scope, $http) ->
  $scope.translation = 'Nothing to show here yet...'

  $scope.translate = ->
    $http.get('/api/translator/translate', {
      params: { search: $scope.sentenceToTranslate }
    })
    .success (data, status, error, config) ->
      console.log data
      translations = []
      try
        data = JSON.parse(data)
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