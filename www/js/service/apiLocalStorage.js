angular.module("workstops").service("$localstorage", ['$window', function ($window){
        
         var _isEmpty = function (obj) {
            obj = obj || {};
            return Object.keys(obj).length === 0;
        };

        var _setObject = function (key, value) {
            $window.localStorage[key] = JSON.stringify(value);
        };

        var _getObject = function (key) {
            var value = $window.localStorage[key];
            if (value == 'undefined') {
                value = null;
            }
            return JSON.parse(value || null);
        };

        return {
            setObject: _setObject,
            getObject: _getObject,
            isEmpty: _isEmpty
        };
}]);

