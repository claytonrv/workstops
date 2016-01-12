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
            var firstCheck;
            var lastCheck;
            for(var i=0; i<actualDay.evts.length; i++){
                if(actualDay.evts[i].type == "CHECKIN"){
                     firstCheck = actualDay.evts[i].check;
                }else if(actualDay.evts[i].type == "CHECKOUT"){
                    lastCheck = actualDay.evts[i].check;
                    if($localstorage.isEmpty($scope.workedHours)){
                        $scope.workedHours = apiCheck.calculateWorkedTime(firstCheck, lastCheck);
                    }else {
                        //TODO move to a function on apiCheck, something like incrementWorkedTime();
                        var registeredTime = ((+$scope.workedHours.split(":")[0]) * 3600) + ((+$scope.workedHours.split(":")[1]) * 60);
                        
                        var newResgister = apiCheck.calculateWorkedTime(firstCheck, lastCheck);
                        var newTimeRegister = ((+newResgister.split(":")[0]) * 60 * 60) + ((+newResgister.split(":")[1]) * 60);
                        
                        var totalseconds = parseInt(registeredTime,10) + parseInt(newTimeRegister,10);
                        
                        var totalTime = parseInt(totalseconds,10);
                        var hours = Math.floor(totalTime / 3600);
                        var minutes = Math.floor((totalTime - (hours * 3600)) / 60);
                        
                        if(hours < 10) {hours = "0"+hours;}
                        if(minutes < 10) {minutes = "0"+minutes;}
                        
                        $scope.workedHours = hours+":"+minutes;
                    }
                }
            }
        }
    }
    
    
});


