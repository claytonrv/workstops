angular.module("workstops").controller("CheckCtrl", function($scope, $localstorage, apiCheck){
        
    $scope.checkin;
    
    init();
    
    function init(){
        getActualDay();
        var actualDay = $localstorage.getObject("today");
        getWorkedHours(actualDay);
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
        if($scope.checkin){
            apiCheck.createEvent("CHECKIN");
        }
        if(!$scope.checkin){
            apiCheck.createEvent("CHECKOUT");
            var today = $localstorage.getObject("today");
            getWorkedHours(today);
        }
        getActualDay();
    };
        
    
    function getWorkedHours(actualDay){
        if(!$localstorage.isEmpty(actualDay)){
            actualDay.workedHours = apiCheck.calculateTotalWorkedTimeInDay(actualDay);
            console.log(actualDay.workedHours);
            $scope.workedHours = actualDay.workedHours;
        }
    }
    
    
});


