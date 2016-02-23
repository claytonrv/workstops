angular.module("workstops").controller("HistoryCtrl", function($scope, $location, $localstorage, apiCheck, apiMonths, $interval, $ionicModal){
    
    init();
    
    $interval(10000, verifyMonthUpdates);
    
    function init(){
        $scope.eventsToShow = false;
        $scope.noWorkload = false;
        $scope.showDayEdit = false;
        getMonthDays();
        getMonthName();
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
                var hoursType = apiCheck.verifyHoursType(day);
                if(hoursType == 'NO_WORKLOAD'){
                    $scope.noWorkload = true;
                }else if(hoursType == 'EXTRA_HOURS'){
                    var extraHours = apiCheck.calculateDifferenceHours(day,'EXTRA');
                    day.extraHours = extraHours;
                    day.falthours = '00:00';
                    $scope.noWorkload = false;
                }else {
                    var faultHours = apiCheck.calculateDifferenceHours(day,'FAULT');
                    day.falthours = faultHours;
                    day.extraHours = '00:00';
                    $scope.noWorkload = false;
                }   
                $scope.month.push(day);
            });
        }
    };
    
    function getMonthName(){
        if($scope.actualMonth){
            $scope.monthName = apiMonths.verifyMonthName($scope.actualMonth.month);
            $scope.eventsToShow = false;            
        }else {
         $scope.eventsToShow = false;  
         $scope.msg = 'Nothing to be shown now ...';
         setTimeout(function(){
            $scope.changeRoute("#/app/home", true);
        },3000);
        }
    };
    
    $scope.workloadSelected = function (){
      init();
      if($scope.noWorkload){
          $scope.openModal();
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
      $scope.workloadSelected();
      if(!$scope.noWorkload){
          init();
      }
      $scope.showDayEdit = true;  
      $scope.selectedDay = day;
    };
    
    $scope.unselectDay = function(){
        $scope.showDayEdit = false;
        $scope.selectedDay = "";
    };
    
    
    function verifyMonthUpdates (){
        init();
        if(apiMonths.getUpdateMonth()){
            apiMonths.monthUpdated();
        }
    };
    
    $ionicModal.fromTemplateUrl('unselectedWorkload.html', {
        scope: $scope, animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.noWorkloadModal = modal;
    });  

    $scope.openModal = function() {
        $scope.noWorkloadModal.show();
        setTimeout(function(){
            $scope.closeModal();
        },3000);
    };

    $scope.closeModal = function() {
        $scope.noWorkloadModal.hide();
        $scope.unselectDay();
        $scope.changeRoute("#/app/settings", true);
    };
    
    $scope.changeRoute = function(url, forceReload) {
        $scope = $scope || angular.element(document).scope();
        if(forceReload || $scope.$$phase) { // that's right TWO dollar signs: $$phase
            window.location = url;
        } else {
            $location.path(url);
            $scope.$apply();
        }
    };
    
});