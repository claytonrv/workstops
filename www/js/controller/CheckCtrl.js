angular.module("workstops").controller("CheckCtrl", function($scope, $localstorage, apiCheck){
        
    $scope.checkin;
    
    init();
    
    function init(){
        getActualDay();
        var actualDay = $localstorage.getObject("today");
        getFirstAndLastCheck(actualDay);
        if(!$localstorage.isEmpty($localstorage.getObject("laststate")) && $localstorage.getObject("laststate") == "CHECKIN"){
            $scope.checkin = true;    
        }else {
            $scope.checkin = false;    
        }
    };
    
    function getActualDay(){
        var today = $localstorage.getObject("today");
        if(!$localstorage.isEmpty(today)){
            $scope.today = today.evts;
        }
    }
    
    $scope.check = function(){
        $scope.checkin = !$scope.checkin;
        registerCheck();
    };
    
    
    function registerCheck (){
        getActualDay();
        if($scope.checkin){
            apiCheck.createEvent("CHECKIN");
        }
        if(!$scope.checkin){
            apiCheck.createEvent("CHECKOUT");
            var today = $localstorage.getObject("today");
            getFirstAndLastCheck(today);
        }
        getActualDay();
    };
        
    
    function getFirstAndLastCheck(actualDay){
        if(!$localstorage.isEmpty(actualDay)){
            var firstCheck = actualDay.evts[0].check;
            var lastcheck = actualDay.evts[actualDay.evts.length-1].check;
            $scope.workedHours = apiCheck.calculateWorkedTime(firstCheck, lastcheck);
        }
    }
    
    
});


