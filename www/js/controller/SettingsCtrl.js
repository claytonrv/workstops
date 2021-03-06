angular.module("workstops").controller("SettingsCtrl", function($scope, $localstorage, $ionicModal){
    
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
        
        lastChanged = $localstorage.getObject("lastWorkloadOptionSelected");
    };
    
    $scope.selectLastOption = function(){
      if(!$localstorage.isEmpty(lastChanged)){
        if(document.getElementById(lastChanged)){
          document.getElementById(lastChanged).style.borderColor="#66B2FF";
        } 
      }  
    };
    
    $scope.saveWorkload = function (value){
      var configs = $localstorage.getObject("configs");
      
      if($localstorage.isEmpty(configs)){
        var configs = {};
      }
      
      configs.workload = value;
      $localstorage.setObject('configs', configs);
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
        $localstorage.setObject("lastWorkloadOptionSelected", lastChanged);
    };
    
    $ionicModal.fromTemplateUrl('configurationSavedModal.html', {
        scope: $scope, animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.savedConfigurationModal = modal;
    });  

    $scope.openModal = function() {
        $scope.savedConfigurationModal.show();
        setTimeout(function(){
            $scope.closeModal();
        }, 2000);
    };

    $scope.closeModal = function() {
        $scope.savedConfigurationModal.hide();
    };
    
});
