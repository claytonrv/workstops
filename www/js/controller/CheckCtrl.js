/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

angular.module("workstops").controller("CheckCtrl", function($scope, $localstorage){
        
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
            createEvent("CHECKIN");
        }
        if(!$scope.checkin){
            createEvent("CHECKOUT");
        }
    };
    
    function createEvent(eventType){
        var laststate = $localstorage.getObject("laststate");
        if($localstorage.isEmpty(laststate) || laststate == "CHECKOUT"){
            verifyIfNewDay();
        }
        var date = new Date();
        var hr = addZero(date.getHours());
        var min = addZero(date.getMinutes());
        var evt = {
            type: eventType,
            check: hr+":"+min
        };
        var today = $localstorage.getObject("today");
        today.evts.push(evt);
        if(eventType == "CHECKOUT"){
            getFirstAndLastCheck(today);
        }
        $localstorage.setObject("today", today);
        $localstorage.setObject("laststate", eventType);
        getActualDay();
    };   
    
    function verifyIfNewDay(){
        verifyIfNewMonth();
        var newDay = new Date();
        var lastRegisteredDay = $localstorage.getObject("today");
        if (!$localstorage.isEmpty(lastRegisteredDay)) {
            if (lastRegisteredDay.day != addZero(newDay.getDay())) {
                var actualMonth = $localstorage.getObject("actualMonth");
                actualMonth.days.push(lastRegisteredDay);
                $localstorage.setObject("actualMonth", actualMonth);
                var nextDay = {
                    day: addZero(newDay.getDay()),
                    evts: []
                };
                $localstorage.setObject("today",nextDay);
            }
        }else {
            var today = {
                day :  addZero(newDay.getDay()),
                evts: []
            };
            lastRegisteredDay = today;
            $localstorage.setObject("today", lastRegisteredDay);
        }   
    };
    
    function verifyIfNewMonth(){
        var newMonth = new Date();
        var actualMonth = $localstorage.getObject("actualMonth");
        if($localstorage.isEmpty(actualMonth)){
            var month = {
                month: addZero((newMonth.getMonth()+1)),
                days: []
            };
            $localstorage.setObject("actualMonth", month);
        }else { 
            if(actualMonth.month != addZero((newMonth.getMonth()+1))){
                $localstorage.setObject("lastMonth", actualMonth);
                var nextMonth = {
                    month: addZero((newMonth.getMonth()+1)),
                    days: []
                };
                $localstorage.setObject("actualMonth", nextMonth);
            }
        }
    };
    
    function getFirstAndLastCheck(actualDay){
        if(!$localstorage.isEmpty(actualDay)){
            var firstCheck = actualDay.evts[0].check;
            var lastcheck = actualDay.evts[actualDay.evts.length-1].check;
            $scope.workedHours = calculateWorkedHours(firstCheck, lastcheck);
        }
    }
    
    function calculateWorkedHours(firstCheck, lastCheck){
        var firstHour = parseInt(firstCheck.split(':')[0]);
        var firstMinute = parseInt(firstCheck.split(':')[1]);
        var first = new Date (0,0,0,firstHour,firstMinute,0);
        
        var lastHour = parseInt(lastCheck.split(':')[0]);
        var lastMinute = parseInt(lastCheck.split(':')[1]);
        var last = new Date (0,0,0, lastHour, lastMinute, 0);
        
        var diff = last.getTime() - first.getTime();
        var hours = Math.floor(diff /1000/60/60);
        diff -= hours * 1000 * 60 * 60;
        var minutes = Math.floor(diff / 1000 / 60);
        
        if(hours < 0){
            hours = hours + 24;
        }
        
        return (hours <= 9 ? "0" : "") + hours + ":" + (minutes <= 9 ? "0" : "") + minutes;
    };
    
    function addZero(i) {
        if (i < 10) {
            i = "0" + i;
        }
        return i;
    };
});


