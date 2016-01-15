angular.module("workstops").controller("SettingsCtrl", function($scope, $localstorage){
    
    init();
    var lastChanged;
    
    function init(){
        $scope.data = {
          workload : null,
          workloadOptions: [
              {number: 1},
              {number: 2},
              {number: 3},
              {number: 4},
              {number: 5},
              {number: 6},
              {number: 7},
              {number: 8}
          ] 
        };
    };
    
    $scope.saveWorkload = function (value){
      $localstorage.setObject("workload",value);  
    };
    
    $scope.changeColor = function (id){
        if(!$localstorage.isEmpty(lastChanged)){
            document.getElementById(lastChanged).style.borderColor="rgb(220, 220, 220)";
            document.getElementById(id).style.borderColor="#73AD21";
            lastChanged = id;
        }else {
            document.getElementById(id).style.borderColor="#73AD21";
            lastChanged = id;
        }
    };
    
});
