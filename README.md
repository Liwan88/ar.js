# ar.js
OSS AR Javascript Library 4 Browser

# Install & Run Tenken Application
## Install InterstageAR
1. Install following apk into Android device
applications/Tenken/mobile_nativeclient/Android/OSSFJAR_20160808.apk
2. Start application, and Click on "AR Custom Web Application"

## Setup InterstageAR
1. In "Server URL", set https://sv0.augmentedreality.jp.fujitsu.com/app/tenken/index.html
  * [note] This is to specify where the Tenken Web application is hosted. We have setup above URL for testing.
2. In the next dialog, click "Download scenario information", then select "TenkenSample for Topcoder"
  * [note] This is to download AR content data from AR server. We have shared AR server for anyone to use.
3. In the next dialog, click "Download" to download additional resources, then select any of the operator to start Tenken application.

## Running Tenken Application
1. Open fake AR Marker file located at applications/Tenken/demo_marker.pdf
2. Navigate android to capture AR Marker on camera view. You will see AR contents displayed on the device.

Note: Although it should not be necessay to understand details of Tenken application, entire manual of Tenken is at applications/Tenken/arapptenken.pdf

# Developing Tenken Application
Tenken application is pure html/css/js web application that needs to be hosted on some web server. Source code is located at applications/Tenken/mobile_browsersource/

1. Download entire directory of applications/Tenken/mobile_browsersource/
2. With your favorite web server, host the above files (we'll assume http://localhost:8080/tenken)
3. Start mobile application. In the first dialog to specify "Server URL", put http://localhost:8080/tenken
4. Change html/css/js files with your favorite editor

Note: **Tenken application will cache html/css/js files in the device. Whenever you change the same html/css/js files, you would need to force to reload the pages from the web server.** One way to do this is clearing the web cache by tapping settings while running Tenken, where you will see button to "Clear Web Cache"
