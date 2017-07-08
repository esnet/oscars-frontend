# oscars-frontend
A frontend for OSCARS 1.0. 

Building blocks: React, Redux, Bootstrap and visjs .


## Developer guide
### Installing prerequisites
npm install (mvn package will also do that)

### Bring up a standalone server 
npm run start

### Packaging for Maven deployment 
mvn package

### Deploying artifact to github repo
mvn clean deploy


### IntelliJ IDEA notes: 
- Plugins
  - Install NodeJS plugin, restart IDEA
  - Preferences -> Languages & Frameworks -> Node.js and NPM: Enable
- Preferences -> Languages & Frameworks -> Javascript
  - Set project language to React JSX
- Preferences -> Languages & Frameworks -> Javascript -> Libraries
  - Download
  - select 'jasmine', Download and install, Apply