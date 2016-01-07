/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

angular.module("workstops").controller("CheckCtrl", function($scope, $localstorage){
        
    $scope.checkin;
    
    init();
    
    function init(){
        $scope.checkin = false;
    };
    
    $scope.check = function(){
        $scope.checkin = !$scope.checkin;
        registerCheck();
    };
    
    
    function registerCheck (){
        if($scope.checkin){
            createEvent("CHECKIN");
        }
        if(!$scope.checkin){
            createEvent("CHECKOUT");
        }
    };
    
    function createEvent(eventType){
        verifyIfNewDay();
        var date = new Date();
        var hr = addZero(date.getHours());
        var min = addZero(date.getMinutes());
        var evt = {
            type: eventType,
            check: hr+":"+min
        };
        var today = $localstorage.getObject("today");
        today.evts.push(evt);
        $localstorage.setObject("today", today);
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
    
    function addZero(i) {
        if (i < 10) {
            i = "0" + i;
        }
        return i;
    };
});


