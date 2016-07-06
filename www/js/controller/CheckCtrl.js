angular.module("workstops").controller("CheckCtrl", function($scope, $localstorage, apiCheck){

    $scope.checkin;

    init();

    function init(){
        getActualDay();
        clearEditVariables();
        var actualDay = $localstorage.getObject("today");
        if(actualDay){
            getWorkedHours(actualDay);
        }
        if(!$localstorage.isEmpty($localstorage.getObject("laststate")) && $localstorage.getObject("laststate") == "CHECKIN"){
            $scope.checkin = true;
        }else {
            $scope.checkin = false;
        }
    };

    function getActualDay(){
        var today = $localstorage.getObject("today");
        $scope.workedHours = $localstorage.getObject("workedHours");
        if(!$localstorage.isEmpty(today)){
            $scope.today = today.evts;
            $scope.actualDay = today;
        }
    }

    $scope.check = function(){
        $scope.checkin = !$scope.checkin;
        registerCheck();
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

    $scope.removeEvt = function(){
        var today = apiCheck.removeLastEvent();
        var lastIndex = today.evts.pop();
        if($localstorage.isEmpty(lastIndex)){
            $localstorage.setObject("laststate","");
        }else{
         $localstorage.setObject("laststate",lastIndex.type);
        }
        init();
        apiCheck.updateMonthEvts();
    };

    $scope.saveEdit = function (evtId){
        var today = $localstorage.getObject('today');
        var editedCheck;
        $scope.today.forEach(function(evt){
           if(evt.id == evtId){
               editedCheck = evt.check;
           }
        });
        today.evts.forEach(function (evt){
            if(evt.id == evtId){
                if(editedCheck){
                    evt.check = editedCheck;
                }
            }
        });
        $localstorage.setObject('today', today);
        clearEditVariables();
        init();
        apiCheck.updateMonthEvts();
    };

    $scope.cancelEdition = function(){
        clearEditVariables();
    };

    function clearEditVariables(){
        $scope.evtCheckTimeEdited = null;
        $scope.evtCheckTypeEdited = null;
        $scope.selectedEvtId = null;
    }


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
            $localstorage.setObject("today", actualDay);
            $localstorage.setObject("workedHours", actualDay.workedHours);
            $scope.workedHours = $localstorage.getObject("workedHours");
        }
    };

    function seachCheckOnEvents(checkId, formatedValue){
        $scope.today.forEach(function(event){
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

    $scope.maxDayEvents = function(){
      var today = $localstorage.getObject('today');
      var day = new Date();
      if((today && today.day == apiCheck.addZero(day.getDate())) && $scope.today.evts && $scope.today.evts.length >= 4){
        return true;
      }else {
        return false;
      }
    }

    $scope.saveCommentOnday = function(){
      if($scope.actualDay.comments){
        var today = $localstorage.getObject("today");
        today.comments = $scope.actualDay.comments;
        $localstorage.setObject("today", today);
        init();
      }
    }

});
