/* 
 * FORK BY Webranking, support picker API v3 and npm-ready
 * 
 * angular-google-picker
 *
 * Interact with the Google API Picker
 * More information about the Google API can be found at https://developers.google.com/picker/
 *
 * (c) 2014 Loic Kartono
 * License: MIT
 */
(function () {
  angular.module('w-google-picker', [])

    .provider('wGoogleSettings', function () {
      this.developerKey = null;
      this.clientId = null;
      this.appId = null;
      this.scope = ['https://www.googleapis.com/auth/drive'];
      this.locale = 'it';
      this.features = ['MULTISELECT_ENABLED', 'SUPPORT_TEAM_DRIVES'];
      this.views = [
        'DocsView().setIncludeFolders(true).setSelectFolderEnabled(true).setEnableTeamDrives(true)',
      ];

      /**
       * Provider factory $get method
       * Return Google Picker API settings
       */
      this.$get = ['$window', function ($window) {
        return {
          developerKey: this.developerKey,
          clientId: this.clientId,
          appId: this.appId,
          scope: this.scope,
          features: this.features,
          views: this.views,
          locale: this.locale,
          origin: this.origin || $window.location.protocol + '//' + $window.location.host
        }
      }];

      /**
       * Set the API config params using a hash
       */
      this.configure = function (config) {
        for (var key in config) {
          this[key] = config[key];
        }
      };
    })

    .directive('wGooglePicker', ['$window', 'wGoogleSettings', function ($window, wGoogleSettings) {
      return {
        restrict: 'A',
        scope: {
          onLoaded: '&',
          onCancel: '&',
          onPicked: '&'
        },
        link: function (scope, element, attrs) {
          var pickerApiLoaded = false;
          var oauthToken = null;

          /**
           * Load required modules
           */
          function instantiate() {
            gapi.load('auth', { 'callback': onAuthApiLoad });
            gapi.load('picker', { 'callback': onPickerApiLoad });
          }

          /**
           * OAuth autorization
           * If user is already logged in, then open the Picker modal
           */
          function onAuthApiLoad() {
            if (oauthToken) {
              createPicker();
            } else {
              gapi.auth.authorize(
                {
                  'client_id': wGoogleSettings.clientId,
                  'scope': wGoogleSettings.scope,
                  'immediate': false
                },
                handleAuthResult);
            }
          }

          function onPickerApiLoad() {
            pickerApiLoaded = true;
            createPicker();
          }

          function handleAuthResult(authResult) {
            if (authResult && !authResult.error) {
              oauthToken = authResult.access_token;
              createPicker();
            }
          }

          /**
           * Everything is good, open the files picker
           */
          function createPicker() {
            if (pickerApiLoaded && oauthToken) {
              var picker = new $window.google.picker.PickerBuilder()
                .setAppId(wGoogleSettings.appId)
                .setOAuthToken(oauthToken)
                .setDeveloperKey(wGoogleSettings.developerKey)
                .setLocale(wGoogleSettings.locale)
                .setCallback(pickerCallback)
                .setOrigin(wGoogleSettings.origin);

              if (wGoogleSettings.features.length > 0) {
                wGoogleSettings.features.forEach(function (feature, key) {
                  picker.enableFeature(google.picker.Feature[feature]);
                });
              }

              if (wGoogleSettings.views.length > 0) {
                wGoogleSettings.views.forEach(function (view, key) {
                  view = eval('new google.picker.' + view);
                  picker.addView(view);
                });
              }

              picker.build().setVisible(true);
            }
          }

          /**
           * Callback invoked when interacting with the Picker
           * data: Object returned by the API
           */
          function pickerCallback(data) {
            gapi.client.load('drive', 'v3', function () {
              if (data.action == google.picker.Action.LOADED && scope.onLoaded) {
                (scope.onLoaded || angular.noop)();
              }
              if (data.action == google.picker.Action.CANCEL && scope.onCancel) {
                (scope.onCancel || angular.noop)();
              }
              if (data.action == google.picker.Action.PICKED && scope.onPicked) {
                (scope.onPicked || angular.noop)({ docs: data.docs });
              }
              scope.$apply();
            });
          }

          element.bind('click', function (e) {
            /* dynamically load dependencies only on click */
            instantiate();
          });
        }
      }
    }]);
})();
