angular.module("workstops").controller("HistoryCtrl", function($scope, $localstorage, apiCheck){
    
    init();
    
    function init(){
        getActualMonth();
        getMonthDays();
    };
    
    function getActualMonth(){
      $scope.actualMonth = $localstorage.getObject("actualMonth");
    };
    
    function getMonthDays(){
        getActualMonth();
        $scope.month = [];
        if(!$localstorage.isEmpty($scope.actualMonth) && !$localstorage.isEmpty($scope.actualMonth.days)){
            var days = $scope.actualMonth.days;
            days.forEach(function(day){
                var firstCheck = day.evts[0].check;
                console.log("FIRST EVENT OF DAY :"+firstCheck);
                var lastcheck = day.evts[day.evts.length-1].check;
                console.log("LAST EVENT OF DAY :"+lastcheck);
                day.workedHours = apiCheck.calculateWorkedTime(firstCheck, lastcheck);
                $scope.month.push(day);
            });
        }
    };
    
    $scope.validMonth = function(){
        getActualMonth();
        console.log($scope.actualMonth);
      if($localstorage.isEmpty($scope.actualMonth) || $localstorage.isEmpty($scope.actualMonth.days)){
          return false;
      } else {
          return true;
      }
    };
});