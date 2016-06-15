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
        return day && day.extraHours == "00:00";
    };

    $scope.noFaltHours = function (day){
        return day && day.falthours == "00:00";
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
          $scope.changeRoute("#/app/settings", true);
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

    $scope.removeDay = function(day){
      var dayToRemove = null;
      for(var i=0; i<$scope.actualMonth.days.length; i++){
        if($scope.actualMonth.days[i] && $scope.actualMonth.days[i].day == day.day){
          for(var j=i; j<$scope.actualMonth.days.length; j++){
            $scope.actualMonth.days[j] = $scope.actualMonth.days[j+1];
          }
        }
      }
      $scope.actualMonth.days.pop();
      $localstorage.setObject("actualMonth", $scope.actualMonth);
      init();
    }

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

    function uploadDayOnMonth(day){
      var month = $localstorage.getObject('actualMonth');
      var position = 0;
      // for (var i = month.days.length+1; i > month.days[month.days.length]; i--) {
      //   month.days[i] = month.days[i-1];
      // }
      console.log(month.days);
      console.log(month.days.length);
      console.log(month.days[position].day);
      console.log(position);
      console.log(day.day);
      while(month.days[position] && parseInt(month.days[position].day) < parseInt(day.day) && (position <= (month.days.length - 1))){
        position++;
      }

      if(position == 0){
        var newMonth = [];
        newMonth.push(day);
        month.days.forEach(function(dayOfMonth){
          newMonth.push(dayOfMonth);
        });
        month.days = newMonth;
      }else if(month.days.length-1 > position){
        for(var i=month.days.length-1; i>=position; i--){
          month.days[i+1] = month.days[i];
        }
          month.days[position] = day;
      }else {
        month.days.push(day);
      }
      $localstorage.setObject('actualMonth', month);
      init();
    };

    $ionicModal.fromTemplateUrl('addNewDay.html', {
        scope: $scope, animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.addNeDayModal = modal;
    });

    $scope.openModal = function() {
        $scope.addNeDayModal.show();
    };

    $scope.closeModal = function() {
        $scope.addNeDayModal.hide();
        $scope.unselectDay();
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

    $scope.noDaysOnMonth = function(){
       if($scope.actualMonth && $scope.actualMonth.days && $scope.actualMonth.days != null &&
       $scope.actualMonth.days.length > 1 ){
         return true;
       }else {
         return false;
       }
    }

    $scope.convertToCSV = function(elementId){
        var yearnName = new Date();
        var monthName = $scope.actualMonth.month;
        var archivename = monthName+"/"+yearnName.getFullYear()+".csv";
        var table = document.getElementById(elementId).innerHTML;
        var data = table.replace(/<thead</g, "")
                        .replace(/<\/thead>/g, "")
                        .replace(/<tbody>/g, "")
                        .replace(/<\/tbody>/g, "")
                        .replace(/<tr>/g, "")
                        .replace(/<\/tr>/g, "\r\n")
                        .replace(/<th>/g, "")
                        .replace(/<\/th>/g, ";")
                        .replace(/<td>/g, "")
                        .replace(/<\/td>/g, ";")
                        .replace(/<td class="ng-binding">/g, "")
                        .replace(/<tr ng-repeat="day in month" class="">/g , "")
                        .replace(/<!-- ngRepeat: day in month -->/g, "")
                        .replace(/<!-- ngRepeat: evt in day.evts -->/g, "")
                        .replace(/<!-- end ngRepeat: evt in day.evts -->/g , "")
                        .replace(/<!-- end ngRepeat: day in month -->/g , "")
                        .replace(/<td ng-repeat="evt in day.evts" class="ng-binding">/g , "")
                        .replace(/\t/g, "")
                        .replace(/\n/g, "");

        var myLink = document.createElement('a');
        myLink.download = archivename;
        myLink.href = "data:application/csv," +escape(data);
        myLink.click();
    }

    $scope.formatInput = function(check, id){
      var formatedValue;
      if (check.length > 2) {
          if (check.substring(2, 3) != ":") {
              formatedValue = check.substring(0, 2) + ":" + check.substring(2, check.length);
              if(id == 'firstCheckin'){
                  $scope.newDay.firstCheckin = formatedValue;
              }else if( id == 'firstCheckout'){
                  $scope.newDay.firstCheckout = formatedValue;
              }else if(id == 'lastCheckin'){
                  $scope.newDay.lastCheckin = formatedValue;
              }else if(id == 'lastCheckout'){
                  $scope.newDay.lastCheckout = formatedValue;
              }
          }
      }
    };

    $scope.addNewDay = function(){
      $scope.newDay = {
        day: "",
        firstCheckin: "",
        firstCheckout: "",
        lastCheckin: "",
        lastCheckout: ""
      }
      $scope.openModal();
    };


    $scope.saveNewDay = function(){
      var dayToSave = {
        day: $scope.newDay.day,
        evts:[
          {
            type: 'CHECKIN',
            check: $scope.newDay.firstCheckin,
            id: '0CHECKIN-'+$scope.newDay.firstCheckin
          },
          {
            type: 'CHECKOUT',
            check: $scope.newDay.firstCheckout,
            id: '1CHECKOUT-'+$scope.newDay.firstCheckout
          },
          {
            type: 'CHECKIN',
            check: $scope.newDay.lastCheckin,
            id: '2CHECKIN-'+$scope.newDay.lastCheckin
          },
          {
            type: 'CHECKOUT',
            check: $scope.newDay.lastCheckout,
            id: '3CHECKOUT-'+$scope.newDay.lastCheckout
          }
        ]
      }
      dayToSave.workedHours = apiCheck.calculateTotalWorkedTimeInDay(dayToSave);
      uploadDayOnMonth(dayToSave);
      $scope.closeModal();
    };

});
