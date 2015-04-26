'use strict'

angular.module 'gtranslateApp'
.controller 'TranslatorCtrl', ($scope, $stateParams, $http, $q) ->
  $scope.translation = 'Nothing to show here yet...'
  oldCanceler = null
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
              frequency: if item.length == 4 then (if item[3] >= 0.05 then 2 else 1) else 0
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

  if ($stateParams.search)
    $scope.translate $stateParams.search
