'use strict'

angular.module 'gtranslateApp'
.controller 'TranslatorCtrl', ($scope, $http, $q) ->
  $scope.translation = 'Nothing to show here yet...'
  $scope.translate = ->
    canceler = $q.defer();
    if (oldCanceler)
      oldCanceler.resolve()

    oldCanceler = canceler
    $http.get('/api/translator/translate', {
      params: { search: $scope.sentenceToTranslate },
      timeout: canceler.promise
    })
    .success (data, status, error, config) ->
      console.log data
      translations = []
      try
        #data = JSON.parse(data)
        _.each(data[1], (item) ->
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
        $scope.mainTranslation = data[0][0][0]
        $scope.ruTranslation = data[0][0][2]
      catch e
        $scope.translations = [{variant: 'Error occured'}]
        $scope.mainTranslation = ''
    .error (data, status, error, config) ->
      console.log error