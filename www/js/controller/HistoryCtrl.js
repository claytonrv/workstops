angular.module("workstops").controller("HistoryCtrl", function($scope, $localstorage, apiCheck){
    
    init();
    
    function init(){
        $scope.showDayEdit = false;
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
                day.workedHours = apiCheck.calculateTotalWorkedTimeInDay(day);  
                $scope.month.push(day);
            });
        }
    };
    
    $scope.validMonth = function(){
        getActualMonth();
      if($localstorage.isEmpty($scope.actualMonth) || $localstorage.isEmpty($scope.actualMonth.days)){
          return false;
      } else {
          return true;
      }
    };
    
    $scope.editDayEvents = function(day){
      $scope.showDayEdit = true;  
      $scope.selectedDay = day;
    };
    
    $scope.unselectDay = function(){
        $scope.showDayEdit = false;
        $scope.selectedDay = "";
    };
});