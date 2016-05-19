angular.module("workstops").controller("HistoryCtrl", function($scope, $location, $localstorage, apiCheck, apiMonths, $interval, $ionicModal){
    
    init();
    
    $interval(10, verifyMonthUpdates);
    var eventsToShow;
    
    function init(){
        eventsToShow = noEventsOnMonth();
        $scope.noWorkload = false;
        $scope.showDayEdit = false;
        apiCheck.updateMonthEvts();
        getMonthDays();
        getMonthName();
    };
    
    function getActualMonth(){
      $scope.actualMonth = $localstorage.getObject("actualMonth");
    };
    
    $scope.noExtraHours = function (day){
        return day.extraHours == "00:00";
    };
    
    $scope.noFaltHours = function (day){
        return day.falthours == "00:00";
    };
    
    $scope.cancelEdition = function(){
        clearEditVariables();
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
                }else if(hoursType == 'NO_WORKED_HOURS'){
                    day.extraHours = "00:00";
                    day.falthours = "00:00";
                    day.workedHours = "00:00"
                    $scope.noWorkload = false;
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
            eventsToShow = true;            
        }else {
            eventsToShow = false;  
         $scope.msg = 'Nothing to be shown yet ...';
         setTimeout(function(){
            $scope.changeRoute("#/app/home", true);
        },3000);
        }
    };
    
    function noEventsOnMonth(){
        getActualMonth();
        if ($scope.actualMonth && $scope.actualMonth.days) {
            eventsToShow = false;
        } else {
            eventsToShow = true;
        }   
    };
    
    function clearEditVariables(){
      $scope.selectedEvtId = null;  
    };
    
    $scope.noEventsToShow = function(){
        noEventsOnMonth();
        return eventsToShow;
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
    
    $scope.onEdit = function (evtId){
        $scope.selectedEvtId = evtId;
    };
    
    $scope.editing = function(evtId){
        if($scope.selectedEvtId && evtId == $scope.selectedEvtId){
            return true;
        }else {
            return false;
        } 
    };
    
    $scope.saveEdit = function (evtId, selectedDay){
        var editedCheck;
        selectedDay.evts.forEach(function(evt){
           if(evt.id == evtId){
               editedCheck = evt.check;
           } 
        });
        $scope.actualMonth.days.forEach(function (day) {
            if (day.day == selectedDay.day) {
                day.evts.forEach(function (evt) {
                    if (evt.id == evtId) {
                        if (editedCheck) {
                            evt.check = editedCheck;
                        }
                    }
                });
            }
        });
        $localstorage.setObject("actualMonth", $scope.actualMonth);
        clearEditVariables();
        init();
    };
    
    $scope.removeEvt = function(selectedDay){
        $scope.actualMonth.days.forEach(function(day){
            if (day.day == selectedDay.day) {
                day.evts.pop();
            } 
        });
        $localstorage.setObject("actualMonth", $scope.actualMonth);
        init();
    };
    
    $scope.editDayEvents = function(day){
      apiCheck.updateMonthEvts();
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
    
    $scope.selectedDayEqualsToday = function(selectedDay){
        var today = $localstorage.getObject("today");
        if(selectedDay && today && selectedDay.day == today.day){
            return true;
        }else {
            return false;
        }
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
    
    function seachCheckOnEvents(checkId, formatedValue){
        $scope.selectedDay.evts.forEach(function(event){
            if(event.id == checkId){
                event.check = formatedValue;
            }
        })
    };
    
    $scope.formatInput = function (checkId, checkValue) {
        var formatedValue;
        if (checkValue.length > 2) {
            if (checkValue.substring(2, 3) != ":") {
                formatedValue = checkValue.substring(0, 2) + ":" + checkValue.substring(2, checkValue.length);
                seachCheckOnEvents(checkId, formatedValue);
            }
        }
    };
    
});