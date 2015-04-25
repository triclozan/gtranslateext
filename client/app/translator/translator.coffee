'use strict'

angular.module 'gtranslateApp'
.config ($stateProvider) ->
  $stateProvider.state 'translator',
    url: '/translator'
    templateUrl: 'app/translator/translator.html'
    controller: 'TranslatorCtrl'
