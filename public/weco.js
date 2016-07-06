"use strict";

var app = angular.module('wecoApp', ['config', 'ui.router', 'ngAnimate', 'ngFileUpload', 'api']);
app.config(function($stateProvider, $urlRouterProvider, $locationProvider) {
  $locationProvider.html5Mode(true);
  $urlRouterProvider.otherwise('/');

  // remove trailing slashes from URL
  $urlRouterProvider.rule(function($injector, $location) {
    var path = $location.path();
    var hasTrailingSlash = path[path.length-1] === '/';
    if(hasTrailingSlash) {
      //if last charcter is a slash, return the same url without the slash
      var newPath = path.substr(0, path.length - 1);
      return newPath;
    }
  });

  $stateProvider
    // Log In/Sign Up state
    .state('auth', {
      abstract: true,
      templateUrl: '/app/pages/auth/auth.view.html',
      controller: 'authController'
    })
    .state('auth.login', {
      url: '/login'
    })
    .state('auth.signup', {
      url: '/signup'
    })
    // Abstract root state contains nav-bar
    .state('weco', {
      abstract: true,
      resolve: {
        authenticate: function() {
          // TODO
          console.log("This code is ran before any state is reached...");
        }
      },
      template: '<nav-bar></nav-bar><div class="full-page-nav" ui-view></div>'
    })
    // 404 Not Found
    .state('weco.notfound', {
      templateUrl: '/app/pages/notfound/notfound.view.html'
    })
    // Homepage state
    .state('weco.home', {
      url: '/',
      templateUrl: '/app/pages/home/home.view.html'
    })
    // Profile page
    .state('weco.profile', {
      url: '/u/:username',
      abstract: true,
      templateUrl: '/app/pages/profile/profile.view.html',
      controller: 'profileController'
    })
    .state('weco.profile.about', {
      url: '',
      templateUrl: '/app/pages/profile/about/about.view.html'
    })
    .state('weco.profile.timeline', {
      templateUrl: '/app/pages/profile/timeline/timeline.view.html'
    })
    .state('weco.profile.settings', {
      templateUrl: '/app/pages/profile/settings/settings.view.html'
    })
    // Branches
    .state('weco.branch', {
      url: '/b/:branchid',
      abstract: true,
      templateUrl: '/app/pages/branch/branch.view.html',
      controller: 'branchController'
    })
    // Branch Nucleus
    .state('weco.branch.nucleus', {
      url: '/nucleus',
      abstract: true,
      templateUrl: '/app/pages/branch/nucleus/nucleus.view.html',
      controller: 'nucleusController'
    })
    .state('weco.branch.nucleus.about', {
      url: '',
      templateUrl: '/app/pages/branch/nucleus/about/about.view.html'
    })
    .state('weco.branch.nucleus.settings', {
      templateUrl: '/app/pages/branch/nucleus/settings/settings.view.html'
    })
    .state('weco.branch.nucleus.moderators', {
      templateUrl: '/app/pages/branch/nucleus/moderators/moderators.view.html',
      controller: 'nucleusModeratorsController'
    })
    // Subbranches
    .state('weco.branch.subbranches', {
      url: '/subbranches?filter',
      params: {
        filter: 'alltime'
      },
      resolve: {
        filterBranches: function() {
          // TODO: filter the branches according to the filter param
        }
      },
      templateUrl: '/app/pages/branch/subbranches/subbranches.view.html',
      controller: 'subbranchesController'
    })
    // Branch wall
    .state('weco.branch.wall', {
      url: '/wall',
      templateUrl: '/app/pages/branch/wall/wall.view.html'
    });

    $urlRouterProvider.otherwise(function($injector, $location) {
      var state = $injector.get('$state');
      state.go('weco.notfound');
      return $location.path();
    });
});

/* Component to indicate loading on a DOM element.
** Usage:
**  <div>               - Parent must be position: relative
**    <div loading>     - Root element upon which to superimpose a loading indicator
**      ...             - Element's usual child content
**    </div>
**  </div>
*/

var app = angular.module('wecoApp');
app.directive('loading', function() {
  return {
    restrict: 'A',
    templateUrl: '/app/components/loading/loading.view.html',
    scope: {
      when: '&'
    },
    replace: false,
    transclude: true
  };
});

var app = angular.module('wecoApp');
app.directive('modal', ['Modal', function(Modal) {
  return {
    restrict: 'A',
    replace: false,
    scope: {},
    templateUrl: '/app/components/modals/modal.view.html',
    link: function($scope, elem, attrs) {
      $scope.getTemplateUrl = Modal.templateUrl;
      $scope.isOpen = Modal.isOpen;

      // OK/Cancel broadcasts event down to child scopes,
      // which is the injected modal content controller
      $scope.OK = function() {
        $scope.$broadcast('OK');
      };
      $scope.Cancel = function() {
        $scope.$broadcast('Cancel');
      };
    }
  };
}]);

var app = angular.module('wecoApp');
app.factory('Modal', ['$timeout', function($timeout) {
  var Modal = {};

  var templateUrl = '';
  Modal.templateUrl = function() {
    return templateUrl;
  };

  var isOpen = false;
  Modal.isOpen = function() {
    return isOpen;
  };

  var modalInputArgs = {};
  Modal.getInputArgs = function() {
    return modalInputArgs;
  };

  var modalResolve;
  var modalReject;
  Modal.open = function(url, args) {
    templateUrl = url;
    isOpen = true;
    modalInputArgs = args;

    return new Promise(function(resolve, reject) {
      modalResolve = resolve;
      modalReject = reject;
    });
  };

  Modal.OK = function() {
    $timeout(function() {
      isOpen = false;
    });
    modalResolve(true);
  };
  Modal.Cancel = function() {
    $timeout(function() {
      isOpen = false;
    });
    modalResolve(false);
  };
  Modal.Error = function() {
    modalReject();
  };

  return Modal;
}]);

var app = angular.module('wecoApp');
app.controller('modalProfileSettingsController', ['$scope', '$timeout', 'Modal', 'User', function($scope, $timeout, Modal, User) {
  $scope.Modal = Modal;
  $scope.values = [];
  $scope.errorMessage = '';
  $scope.isLoading = false;

  $scope.$on('OK', function() {
    // if not all fields are filled, display message
    if($scope.values.length < Modal.getInputArgs().inputs.length || $scope.values.indexOf('') > -1) {
      $timeout(function() {
        $scope.errorMessage = 'Please fill in all fields';
      });
      return;
    }

    // construct data to update using the proper fieldnames
    var updateData = {};
    for(var i = 0; i < Modal.getInputArgs().inputs.length; i++) {
      updateData[Modal.getInputArgs().inputs[i].fieldname] = $scope.values[i];

      // convert date input values to unix timestamp
      if(Modal.getInputArgs().inputs[i].type == 'date') {
        updateData[Modal.getInputArgs().inputs[i].fieldname] = new Date($scope.values[i]).getTime();
      }
    }

    // perform the update
    $scope.isLoading = true;
    User.update(updateData).then(function() {
      $timeout(function() {
        $scope.values = [];
        $scope.errorMessage = '';
        $scope.isLoading = false;
        Modal.OK();
      });
    }, function(response) {
      $timeout(function() {
        $scope.errorMessage = response.message;
        $scope.isLoading = false;
      });
    });
  });

  $scope.$on('Cancel', function() {
    $timeout(function() {
      $scope.values = [];
      $scope.errorMessage = '';
      $scope.isLoading = false;
      Modal.Cancel();
    });
  });
}]);

var app = angular.module('wecoApp');
app.controller('modalUploadImageController', ['$scope', '$timeout', 'Modal', '$http', 'ENV', 'Upload', function($scope, $timeout, Modal, $http, ENV, Upload) {
  $scope.Modal = Modal;
  $scope.errorMessage = '';
  $scope.uploadUrl = '';
  $scope.file = null;
  $scope.isUploading = false;
  $scope.progress = 0;

  // when the modal opens, fetch the pre-signed url to use to upload
  // the user's profile picture to S3
  $scope.$watch(function() {
    return Modal.isOpen();
  }, function(isOpen) {
    if(isOpen) {
      $http({
        method: 'GET',
        url: ENV.apiEndpoint + 'user/me/' + Modal.getInputArgs().type + '-upload-url'
      }).then(function(response) {
        if(response && response.data && response.data.data) {
          $scope.uploadUrl = response.data.data;
        } else {
          // TODO: handle error
          console.log("error");
        }
      }, function () {
        // TODO: handle error
        console.log("error");
      });
    }
  });

  $scope.setFile = function(file) {
    $scope.file = file;
  };

  $scope.upload = function() {
    if(!$scope.file) {
      console.error("No file selected");
      return;
    }
    Upload.http({
      url: $scope.uploadUrl,
      method: 'PUT',
      headers: {
        'Content-Type': 'image/*'
      },
      data: $scope.file
    }).then(function(resp) {
      $scope.file = null;
      $scope.isUploading = false;
      $scope.progress = 0;
      Modal.OK();
    }, function(err) {
      // TODO: handle error
      $scope.file = null;
      $scope.isUploading = false;
      $scope.progress = 0;
      console.error("Unable to upload photo!");
    }, function(evt) {
      $scope.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
    });
  };

  $scope.$on('Cancel', function() {
    $timeout(function() {
      $scope.file = null;
      $scope.errorMessage = '';
      Modal.Cancel();
    });
  });

  $scope.$on('OK', function() {
    if(!$scope.file) {
      console.error("No file selected");
      return;
    }
    $timeout(function() {
      $scope.errorMessage = '';
      $scope.isUploading = true;
      $scope.progress = 0;
      $scope.upload();
    });
  });

}]);

var app = angular.module('wecoApp');
app.directive('navBar', ['User', '$state', function(User, $state) {
  return {
    restrict: 'E',
    replace: 'true',
    templateUrl: '/app/components/nav/nav.view.html',
    link: function($scope, element, attrs) {
      $scope.user = User.me;
      $scope.isLoggedIn = User.isLoggedIn;
      $scope.logout = function() {
        User.logout().then(function() {
          // successful logout; go to login page
          $state.go('auth.login');
        }, function() {
          // TODO: pretty error
          alert('Unable to log out!');
        });
      };
    }
  };
}]);

var app = angular.module('wecoApp');
app.directive('tabs', ['$state', function($state) {
  return {
    restrict: 'E',
    replace: 'true',
    scope: {
      items: '&',
      states: '&',
      callbacks: '='
    },
    templateUrl: '/app/components/tabs/tabs.view.html',
    link: function($scope, element, attrs) {
      /* NB: states specified in '$scope.states' can be a pure state name, e.g. weco.home,
      **     or they can have parameters, e.g:
      **        weco.branch.subbranches({ "branchid" : "root", "filter": "alltime" })
      **     In the latter case, the parameters must be specified in JSON parsable
      **     format, i.e. with double quotes around property names and values.
      */

      // returns a boolean indicating whether the tab at the given index is selected
      $scope.isSelected = function(index) {
        // for states with parameters, parse the parameters from the state string
        // (i.e. the text within parentheses)
        var openIdx = $scope.states()[index].indexOf('(');
        var closeIdx = $scope.states()[index].indexOf(')');

        // if the specified state has parameters...
        var parsedParams, parsedStateName;
        if(openIdx > -1 && closeIdx > -1) {
          try {
            // parse the parameters from the text between the parentheses
            parsedParams = JSON.parse($scope.states()[index].substr(openIdx + 1, $scope.states()[index].length - openIdx - 2));
            // parse the state name from the text up to the opening parenthesis
            parsedStateName = $scope.states()[index].substr(0, openIdx);
          } catch(err) {
            console.error("Unable to parse JSON!");
          }
        }

        if(parsedParams && parsedStateName) {
          // if the specified state has parameters, the parsed name and state params must match
          return $state.current.name == parsedStateName && JSON.stringify(parsedParams) == JSON.stringify($state.params);
        } else {
          // otherwise, only the state name was given, and it must match the current state
          return $state.current.name == $scope.states()[index];
        }
      };
    }
  };
}]);

"use strict";

 angular.module('config', [])

.constant('ENV', {name:'local',apiEndpoint:'http://localhost:8080/'})

;
var api = angular.module('api', ['ngResource']);
api.config(['$httpProvider', function($httpProvider) {
  // must set withCredentials to keep cookies when making API requests
  $httpProvider.defaults.withCredentials = true;
}]);

'use strict';

var api = angular.module('api');
api.factory('BranchAPI', ['$resource', 'ENV', function($resource, ENV) {

  function makeFormEncoded(data, headersGetter) {
    var str = [];
    for (var d in data)
      str.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
    return str.join("&");
  }

  var Branch = $resource(ENV.apiEndpoint + 'branch/:branchid',
    {
    },
    {
    });

   return Branch;
}]);

'use strict';

var api = angular.module('api');
api.factory('SubbranchesAPI', ['$resource', 'ENV', function($resource, ENV) {

  function makeFormEncoded(data, headersGetter) {
    var str = [];
    for (var d in data)
      str.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
    return str.join("&");
  }

  var Subbranches = $resource(ENV.apiEndpoint + 'subbranches/:parentid',
    {
    },
    {
    });

   return Subbranches;
}]);

'use strict';

var api = angular.module('api');
api.factory('UserAPI', ['$resource', 'ENV', function($resource, ENV) {

  function makeFormEncoded(data, headersGetter) {
    var str = [];
    for (var d in data)
      str.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
    return str.join("&");
  }

  var User = $resource(ENV.apiEndpoint + 'user/:param',
    {
      param: 'me'
    },
    {
      login: {
        method: 'POST',
        params: {
          param: 'login'
        },
        // indicate that the data is x-www-form-urlencoded
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        // transform the request to use x-www-form-urlencoded
        transformRequest: makeFormEncoded
      },
      logout: {
        method: 'GET',
        params: {
          param: 'logout'
        }
      },
      signup: {
        method: 'POST',
        params: {
          param: ''
        }
      },
      update: {
        method: 'PUT',
        // indicate that the data is x-www-form-urlencoded
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        // transform the request to use x-www-form-urlencoded
        transformRequest: makeFormEncoded
      }
    });

   return User;
}]);

'use strict';

var app = angular.module('wecoApp');
app.factory('Branch', ['BranchAPI', 'SubbranchesAPI', '$http', 'ENV', function(BranchAPI, SubbranchesAPI, $http, ENV) {
  var Branch = {};
  var me = {};

  // Get the root branches
  Branch.getRoots = function() {
    return new Promise(function(resolve, reject) {
      SubbranchesAPI.get({ parentid: 'root' }).$promise.catch(function(response) {
        reject({
          status: response.status,
          message: response.data.message
        });
      }).then(function(branches) {
        if(branches && branches.data) {
          resolve(branches.data);
        } else {
          // successful response contains no branches object:
          // treat as 500 Internal Server Error
          reject({
            status: 500,
            message: 'Something went wrong'
          });
        }
      });
    });
  };

  Branch.get = function(branchid) {
    return new Promise(function(resolve, reject) {
      BranchAPI.get({ branchid: branchid }).$promise.catch(function(response) {
        reject({
          status: response.status,
          message: response.data.message
        });
      }).then(function(branch) {
        if(branch && branch.data) {
          resolve(branch.data);
        } else {
          // successful response contains no branches object:
          // treat as 500 Internal Server Error
          reject({
            status: 500,
            message: 'Something went wrong'
          });
        }
      });
    });
  };

  return Branch;
}]);

'use strict';

var app = angular.module('wecoApp');
app.factory('User', ['UserAPI', '$http', 'ENV', function(UserAPI, $http, ENV) {
  var User = {};
  var me = {};

  // fetch the presigned url for the profile picture for the specified user,
  // defaulting to authd user if not specified.
  // Returns the promise from $http.
  function getPictureUrl(username, type) {
    // if no username specified, fetch self
    if(!username) {
      username = 'me';
    }

    // if type not specified, default to profile picture
    if(type != 'picture' && type != 'cover') {
      type = 'picture';
    }
    // fetch signedurl for user profile picture and attach to user object
    return $http.get(ENV.apiEndpoint + 'user/' + username + '/' + type);
  }


  function getMe() {
    return new Promise(function(resolve, reject) {
      // Fetch the authenticated user object
      UserAPI.get().$promise.catch(function() {
        // TODO: handle error
        console.error('Unable to fetch user!');
        return reject();
      }).then(function(user) {
        if(!user) { return reject(); }

        // Attach the profile picture url to the user object if it exists
        getPictureUrl('me', 'picture').then(function(response) {
          if(response && response.data && response.data.data) {
            user.data.profileUrl = response.data.data;
          }
          getPictureUrl('me', 'cover').then(function(response) {
            if(response && response.data && response.data.data) {
              user.data.coverUrl = response.data.data;
            }
            me.data = user.data;
            resolve();
          }, function() {
            // no cover picture to attach
            me.data = user.data;
            resolve();
          });
        }, function() {
          // no profile picture to attach
          me.data = user.data;
          resolve();
        });
      });
    });
  }
  getMe().then(function() {}, function () {
    console.error("Unable to get user!");
  });

  // Get authenticated user object
  User.me = function() {
    return me.data || {};
  };

  // Get the specified user object, with attached profile picture url
  User.get = function(username) {
    return new Promise(function(resolve, reject) {
      UserAPI.get({ param: username }).$promise.catch(function(response) {
        reject({
          status: response.status,
          message: response.data.message
        });
      }).then(function(user) {
        if(user && user.data) {
          getPictureUrl(username, 'picture').then(function(response) {
            if(response && response.data && response.data.data) {
              user.data.profileUrl = response.data.data;
            }
            getPictureUrl(username, 'cover').then(function(response) {
              if(response && response.data && response.data.data) {
                user.data.coverUrl = response.data.data;
              }
              resolve(user.data);
            }, function() {
              // no cover picture to attach
              resolve(user.data);
            });
          }, function(response) {
            // no profile picture url to attach
            resolve(user.data);
          });
        } else {
          // successful response contains no user object:
          // treat as 500 Internal Server Error
          reject({
            status: 500,
            message: 'Something went wrong'
          });
        }
      });
    });
  };

  User.update = function(data) {
    return new Promise(function(resolve, reject) {
      UserAPI.update(data).$promise.catch(function(response) {
        reject({
          status: response.status,
          message: response.data.message
        });
      }).then(function() {
        resolve();
      });
    });
  };

  // if the user data has a username attribute, we're logged in
  User.isLoggedIn = function() {
    return User.me().username || false;
  };

  User.login = function(credentials) {
    return new Promise(function(resolve, reject) {
      UserAPI.login(credentials).$promise.catch(function(response) {
        reject({
          status: response.status,
          message: response.data.message
        });
      }).then(function() {
        getMe().then(resolve, reject);
      });
    });
  };

  User.logout = function() {
    return new Promise(function(resolve, reject) {
      UserAPI.logout().$promise.catch(function(response) {
        reject({
          status: response.status,
          message: response.data.message
        });
      }).then(function() {
        me = UserAPI.get();
        resolve();
      });
    });
  };

  User.signup = function(credentials) {
    return new Promise(function(resolve, reject) {
      UserAPI.signup(credentials).$promise.catch(function(response) {
        reject({
          status: response.status,
          message: response.data.message
        });
      }).then(function() {
        getMe().then(resolve, reject);
      });
    });
  };

  return User;
}]);

'use strict';

var app = angular.module('wecoApp');
app.controller('authController', ['$scope', '$state', 'User', function($scope, $state, User) {
  $scope.credentials = {};
  $scope.user = User.me;
  $scope.isLoading = false;
  $scope.errorMessage = '';

  $scope.isLoginForm = function() {
    return $state.current.name == 'auth.login';
  };

  function login() {
    User.login($scope.credentials).then(function() {
      // successful login; redirect to home page
      $scope.isLoading = false;
      $state.go('weco.home');
    }, function(response) {
      $scope.errorMessage = response.message;
      $scope.isLoading = false;
    });
  }

  function signup() {
    User.signup($scope.credentials).then(function() {
      // successful signup; redirect to home page
      $scope.isLoading = false;
      $state.go('weco.home');
    }, function(response) {
      $scope.errorMessage = response.message;
      $scope.isLoading = false;
    });
  }

  $scope.submit = function() {
    $scope.isLoading = true;
    if($scope.isLoginForm()) {
      login();
    } else {
      signup();
    }
  };
}]);

'use strict';

var app = angular.module('wecoApp');
app.controller('branchController', ['$scope', '$state', 'Branch', function($scope, $state, Branch) {
  $scope.branchid = $state.params.branchid;

  // return true if the given branch control is selected,
  // i.e. if the current state contains the control name
  $scope.isControlSelected = function(control) {
    return $state.current.name.indexOf(control) > -1;
  };

  $scope.branch = {};
  Branch.get($state.params.branchid).then(function(branch) {
    $scope.branch = branch;
  }, function() {
    // TODO: pretty error
    console.error("Unable to get branch");
  });
}]);

'use strict';

var app = angular.module('wecoApp');
app.controller('nucleusModeratorsController', ['$scope', '$state', '$timeout', 'User', function($scope, $state, $timeout, User) {
  $scope.mods = [];

  $scope.getMod = function(username, index) {
    User.get(username).then(function(data) {
      $timeout(function() {
        $scope.mods[index] = data;
      });
    }, function () {
      // TODO: pretty error
      console.error("Unable to get mod!");
    });
  };

  for(var i = 0; i < $scope.branch.mods.length; i++) {
    $scope.getMod($scope.branch.mods[i], i);
  }
}]);

'use strict';

var app = angular.module('wecoApp');
app.controller('nucleusController', ['$scope', '$state', '$timeout', 'Branch', function($scope, $state, $timeout, Branch) {
  $scope.tabItems = ['about', 'settings', 'moderators'];
  $scope.tabStates =
    ['weco.branch.nucleus.about({ "branchid": "' + $scope.branchid + '"})',
     'weco.branch.nucleus.settings({ "branchid": "' + $scope.branchid + '"})',
     'weco.branch.nucleus.moderators({ "branchid": "' + $scope.branchid + '"})'];
}]);

'use strict';

var app = angular.module('wecoApp');
app.controller('subbranchesController', ['$scope', '$state', '$timeout', 'Branch', function($scope, $state, $timeout, Branch) {
  $scope.tabItems = ['all time', 'this year', 'this month', 'this week', 'today', 'this hour'];
  $scope.tabStates =
    ['weco.branch.subbranches({ "branchid": "' + $scope.branchid + '", "filter": "alltime" })',
     'weco.branch.subbranches({ "branchid": "' + $scope.branchid + '", "filter": "year" })',
     'weco.branch.subbranches({ "branchid": "' + $scope.branchid + '", "filter": "month" })',
     'weco.branch.subbranches({ "branchid": "' + $scope.branchid + '", "filter": "week" })',
     'weco.branch.subbranches({ "branchid": "' + $scope.branchid + '", "filter": "today" })',
     'weco.branch.subbranches({ "branchid": "' + $scope.branchid + '", "filter": "hour" })'];

  $scope.branches = [];

  Branch.getRoots().then(function(branches) {
    $timeout(function() {
      $scope.branches = branches;
    });
  }, function() {
    // TODO: pretty error
    console.error("Unable to get branches!");
  });
}]);

'use strict';

var app = angular.module('wecoApp');
app.controller('profileController', ['$scope', '$timeout', '$state', 'User', 'Modal', function($scope, $timeout, $state, User, Modal) {
  $scope.user = {};
  $scope.isLoading = true;

  User.get($state.params.username).then(function(user) {
    $timeout(function() {
      $scope.user = user;
      $scope.isLoading = false;
    });
  }, function(response) {
    // TODO: Handle other error codes
    if(response.status == 404) {
      $state.go('weco.notfound');
    }
    $scope.isLoading = false;
  });

  $scope.tabItems = ['about', 'timeline'];
  $scope.tabStates = ['weco.profile.about', 'weco.profile.timeline'];

  // Watch for changes in the auth'd user's username
  // When set, if this is the auth'd user's profile page, add the 'settings' tab
  $scope.$watch(function() {
    return User.me().username;
  }, function(username) {
    if(username == $state.params.username) {
      if($scope.tabItems.indexOf('settings') == -1 && $scope.tabStates.indexOf('weco.profile.settings') == -1) {
        $scope.tabItems.push('settings');
        $scope.tabStates.push('weco.profile.settings');
      }
    }
  });

  $scope.openProfilePictureModal = function() {
    Modal.open('/app/components/modals/upload/upload-image.modal.view.html', { type: 'picture' })
      .then(function(result) {
        // reload state to force profile reload if OK was pressed
        if(result) {
          $state.go($state.current, {}, {reload: true});
        }
      }, function() {
        // TODO: display pretty message
        console.log('error');
      });
  };

  $scope.openCoverPictureModal = function() {
    Modal.open('/app/components/modals/upload/upload-image.modal.view.html', { type: 'cover' })
      .then(function(result) {
        // reload state to force profile reload if OK was pressed
        if(result) {
          $state.go($state.current, {}, {reload: true});
        }
      }, function() {
        // TODO: display pretty message
        console.log('error');
      });
  };

  $scope.isMyProfile = function() {
    return User.me().username == $state.params.username;
  };
}]);

var app = angular.module('wecoApp');
app.controller('profileSettingsController', ['$scope', '$state', 'Modal', function($scope, $state, Modal) {
  function openModal(args) {
    Modal.open('/app/components/modals/profile/settings/settings.modal.view.html', args)
      .then(function(result) {
        // reload state to force profile reload if OK was pressed
        if(result) {
          $state.go($state.current, {}, {reload: true});
        }
      }, function() {
        // TODO: display pretty message
        console.log('error');
      });
  }

  $scope.openNameModal = function() {
    openModal({
      title: 'Name',
      inputs: [{
          placeholder: 'First name',
          type: 'text',
          fieldname: 'firstname'
        }, {
          placeholder: 'Last name',
          type: 'text',
          fieldname: 'lastname'
        }
      ]
    });
  };

  $scope.openEmailModal = function() {
    openModal({
      title: 'Email',
      inputs: [{
        placeholder: 'Email',
        type: 'email',
        fieldname: 'email'
      }]
    });
  };

  $scope.openDOBModal = function() {
    openModal({
      title: 'Date of Birth',
      inputs: [{
        placeholder: 'Date of Birth',
        type: 'date',
        fieldname: 'dob'
      }]
    });
  };
}]);
