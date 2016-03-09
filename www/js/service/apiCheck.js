angular.module("workstops").service("apiCheck", function($localstorage, apiMonths){
    
    this.createEvent = function(eventType){
        var laststate = $localstorage.getObject("laststate");
        if($localstorage.isEmpty(laststate) || laststate == "CHECKOUT"){
            verifyIfNewDay();
        }
        var date = new Date();
        var hr = addZero(date.getHours());
        var min = addZero(date.getMinutes());
        var evt = {
            type: eventType,
            check: hr+":"+min,
            id: eventType+"-"+hr+":"+min
        };
        var today = $localstorage.getObject("today");
        if($localstorage.isEmpty(today)){
            var actualDay = new Date;
            today = {
                day : addZero(actualDay.getDate()),
                evts: []
            };
        }
        today.evts.push(evt);
        $localstorage.setObject("today", today);
        $localstorage.setObject("laststate", eventType);
        updateDailyEventsOnMonth();
        apiMonths.monthUpdated();
    }; 
    
    this.removeLastEvent = function(){
        var today = $localstorage.getObject("today");
        if(today.evts.length >= 1){
            today.evts.pop();
        }
        $localstorage.setObject("today", today);
        return today;
    };
    
    this.updateMonthEvts = function(){
        updateDailyEventsOnMonth();
    };
    
    function verifyIfNewDay(){
        var newDay = new Date();
        var lastRegisteredDay = $localstorage.getObject("today");
        if (!$localstorage.isEmpty(lastRegisteredDay)) {
            if (lastRegisteredDay.day != addZero(newDay.getDate())) {
                lastRegisteredDay.workedHours = $localstorage.getObject("workedHours");
                updateDailyEventsOnMonth();
                var nextDay = {
                    day: addZero(newDay.getDate()),
                    evts: []
                };
                $localstorage.setObject("workedHours", "00:00");
                $localstorage.setObject("today",nextDay);
                pushDaysOnActualMonth(nextDay);
            }
        }else {
            var today = {
                day :  addZero(newDay.getDate()),
                evts: []
            };
            lastRegisteredDay = today;
            $localstorage.setObject("today", lastRegisteredDay);
            pushDaysOnActualMonth(today);
        }   
        verifyIfNewMonth();
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
    
    function pushDaysOnActualMonth(day){
        var actualMonth = $localstorage.getObject("actualMonth");
        if($localstorage.isEmpty(actualMonth)){
            verifyIfNewMonth();
            actualMonth = $localstorage.getObject('actualMonth');
        }
        var dayOnMonth = false;
        var today;
        actualMonth.days.forEach(function(mDay){
           if(mDay.day == day.day){
               dayOnMonth = true;
           } 
        });
        if(!dayOnMonth){
            actualMonth.days.push(day);
        }else {
            for(var i=0; i<actualMonth.days.length; i++){
                if(actualMonth.days[i].day == day.day){
                    actualMonth.days[i] = day;
                    today = day;
                }
            }
            $localstorage.setObject("today", today);
        }
        $localstorage.setObject("actualMonth", actualMonth);
    };
    
    
    function updateDailyEventsOnMonth() {
        var today = $localstorage.getObject('today');
        var month = $localstorage.getObject('actualMonth');
        if (month && month.days && !$localstorage.isEmpty(month.days)) {
            if (today && today.evts && !$localstorage.isEmpty(today.evts)) {
                month.days.forEach(function (selectedDay) {
                    if (today.day == selectedDay.day) {
                        for (var i = 0; i < today.evts.length; i++) {
                            if (today.evts[i] && selectedDay.evts[i] && today.evts[i].type != selectedDay.evts[i].type && today.evts[i].check != selectedDay.evts[i].check || !selectedDay.evts[i]) {
                                selectedDay.evts[i] = today.evts[i];
                            }else if(today.evts[i] && selectedDay.evts[i] && today.evts[i].check != selectedDay.evts[i].check){
                                selectedDay.evts[i].check = today.evts[i].check;
                            }else if(selectedDay[i] && !today[i]){
                                selectedDay = today;
                            }
                        }
                    }
                });
            }
        } else {
            if(month && month.days && today){
                month.days.push(today);   
            }
        }
        if (month && month.days) {
            $localstorage.setObject('actualMonth', month);
        }
    };
    
    
    function greaterThan(firstValue, secondValue){
        firstHours = parseInt(firstValue.split(':')[0]);
        firstMinutes = parseInt(firstValue.split(':')[1]);
        secondHours = parseInt(secondValue.split(':')[0]);
        secondMinutes = parseInt(secondValue.split(':')[1]);
        
        if(firstHours > secondHours){
            return true;
        }else if(firstHours == secondHours){
            if(firstMinutes > secondMinutes){
                return true;
            }else {
                return false;
            }
        }else if(firstHours < secondHours){
            return false;
        }
    };
    
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
    
    function incrementWorkedHours(workedHours, newRegister){
        var registeredTime = ((+workedHours.split(":")[0]) * 3600) + ((+workedHours.split(":")[1]) * 60);
        
        var newTimeRegister = ((+newRegister.split(":")[0]) * 60 * 60) + ((+newRegister.split(":")[1]) * 60);

        var totalseconds = parseInt(registeredTime,10) + parseInt(newTimeRegister,10);

        var totalTime = parseInt(totalseconds,10);
        var hours = Math.floor(totalTime / 3600);
        var minutes = Math.floor((totalTime - (hours * 3600)) / 60);

        if(hours < 10) {hours = "0"+hours;}
        if(minutes < 10) {minutes = "0"+minutes;}

        var totalWorkedHours = hours+":"+minutes;
        return totalWorkedHours;
    };
    
    
    this.verifyHoursType = function (day) {
        var workedHours = day.workedHours;
        var configs = $localstorage.getObject('configs');
        var workload;
        if (!$localstorage.isEmpty(configs) && configs.workload != '' && configs.workload != null && configs.workload != 'undefined') {
            workload = addZero(configs.workload) + ":00";
        }
        if (workload) {
            if (workedHours) {
                if (greaterThan(workedHours, workload)) {
                    hours = 'EXTRA_HOURS';
                } else {
                    hours = 'FALT_HOURS';
                }
            } else {
                hours = 'NO_WORKED_HOURS';
            }
        } else {
            hours = 'NO_WORKLOAD';
        }
        return hours;
    };
    
    this.calculateDifferenceHours = function (day, type){
      var workedTime = day.workedHours;
      var configs = $localstorage.getObject('configs');
      var hours;
      var workload;
      if(!$localstorage.isEmpty(configs) && configs.workload != '' && configs.workload != null && configs.workload != 'undefined'){
        workload = addZero(configs.workload)+":00";
        if(type == 'EXTRA'){
            hours = calculateWorkedHours(workload, workedTime);   
        }else { 
            hours = calculateWorkedHours(workedTime, workload);      
        }
      }else {
          hours = 'NO_WORKLOAD';
      }
      return hours;
    };
    
    this.calculateTotalWorkedTimeInDay = function(day){
        var firstCheck;
        var lastCheck;
        day.workedHours = "00:00";
        if (day.evts) {
            for (var i = 0; i < day.evts.length; i++) {
                if (day.evts[i].type == "CHECKIN") {
                    firstCheck = day.evts[i].check;
                } else if (day.evts[i].type == "CHECKOUT") {
                    lastCheck = day.evts[i].check;
                    if ($localstorage.isEmpty(day.workedHours)) {
                        day.workedHours = calculateWorkedHours(firstCheck, lastCheck);
                    } else {
                        var newResgister = calculateWorkedHours(firstCheck, lastCheck);
                        day.workedHours = incrementWorkedHours(day.workedHours, newResgister);
                    }
                }
            }
        }
        return day.workedHours;
    };
    
    function addZero(i) {
        if (i < 10) {
            i = "0" + i;
        }
        return i;
    };
});

