# workstops
Working time management application.
The main idea of this app is to mark the entrances and outputs of the work, with simple and easy commands. Each month the user will be abble to got reports of your working time and send this throught email or export that. The final version predict more automation for this events, for exemple, auto check-in and check out, to know automaticaly wen the person finished to work and left his job.  

# That project is been stoped by a long time and now, it's descontinued.  
# That's because the android 6 compatibility that only                     
# can implemented with the ionic2 .                                                                      

Dependencies of the project: 

NodeJS :
(apt-get install nodejs)
curl --silent --location https://deb.nodesource.com/setup_0.12 | sudo bash -
sudo apt-get install --yes nodejs

NPM:
sudo apt-get install npm

IONIC CORDOVA: 
npm install -g cordova ionic

BOWER: 
npm install -g bower

Android SDK configuration (for linux): 
export ANDROID_HOME=[android-studio]/sdk/
export PATH=${PATH}:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools

To run the project you need to add the platform first, runing this command on the project folder:
ionic platform add android
