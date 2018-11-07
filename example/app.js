angular.module('GooglePickerExample', ['w-google-picker'])

.config(['wGoogleSettingsProvider', function (wGoogleSettingsProvider) {

  // Configure the API credentials here
  wGoogleSettingsProvider.configure({
    developerKey: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    clientId: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    appId: 'XXXXXXXXXXXXXXX'
  });
}])

.filter('getExtension', function () {
  return function (url) {
    return url.split('.').pop();
  };
})

.controller('ExampleCtrl', ['$scope', 'wGoogleSettings', function ($scope, wGoogleSettings) {
  $scope.files     = [];
  $scope.languages = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국' },
  ];

  // Check for the current language depending on wGoogleSettings.locale
  $scope.initialize = function () {
    angular.forEach($scope.languages, function (language, index) {
      if (wGoogleSettings.locale === language.code) {
        $scope.selectedLocale = $scope.languages[index];
      }
    });
  };

  // Callback triggered after Picker is shown
  $scope.onLoaded = function () {
    console.log('Google Picker loaded!');
  }

  // Callback triggered after selecting files
  $scope.onPicked = function (docs) {
    angular.forEach(docs, function (file, index) {
      $scope.files.push(file);
    });
  }

  // Callback triggered after clicking on cancel
  $scope.onCancel = function () {
    console.log('Google picker close/cancel!');
  }

  // Define the locale to use
  $scope.changeLocale = function (locale) {
    wGoogleSettings.locale = locale.code;
  };
}]);
