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
            check: hr+":"+min
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
    
    function verifyIfNewDay(){
        var newDay = new Date();
        var lastRegisteredDay = $localstorage.getObject("today");
        if (!$localstorage.isEmpty(lastRegisteredDay)) {
            if (lastRegisteredDay.day != addZero(newDay.getDate())) {
                lastRegisteredDay.workedHours = $localstorage.getObject("workedHours");
                pushDaysOnActualMonth(lastRegisteredDay);
                var nextDay = {
                    day: addZero(newDay.getDate()),
                    evts: []
                };
                $localstorage.setObject("workedHours", "00:00");
                $localstorage.setObject("today",nextDay);
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
        actualMonth.days.push(day);
        $localstorage.setObject("actualMonth", actualMonth);
    };
    
    
    function updateDailyEventsOnMonth () {
      var today = $localstorage.getObject('today');
      var month = $localstorage.getObject('actualMonth');
        if (!$localstorage.isEmpty(month.days)) {
            month.days.forEach(function (selectedDay) {
                if (today.day == selectedDay.day) {
                    for (var i = 0; i < today.evts.length; i++) {
                        if (today.evts[i].type != selectedDay.evts[i].type && today.evts[i].check != selectedDay.evts[i].check || !selectedDay.evts[i]) {
                            selectedDay.evts[i] = today.evts[i];
                        }
                    }
                }
            });
        }else {
            month.days.push(today);
        }
      if(month && month.days){
        $localstorage.setObject('actualMonth', month);   
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
    
    this.calculateFaltHours = function (day){
      var workedTime = day.workedHours;
      var configs = $localstorage.getObject('configs');
      var workload = addZero(configs.workload)+":00";
      var hours = calculateWorkedHours(workedTime, workload);
      return hours;
    };
    
    this.calculateTotalWorkedTimeInDay = function(day){
        var firstCheck;
        var lastCheck;
        day.workedHours = "";
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

