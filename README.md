# oscars-frontend
A frontend for OSCARS 1.0. 

Building blocks: React, Redux, Bootstrap and visjs .


## Developer guide
### Installing prerequisites
`npm install` (`mvn package` will also do that)

### Bring up a standalone server 
`npm run start`

### Packaging for Maven deployment 
`mvn package`

### Deploying artifact to github repo
`mvn clean deploy`


### IntelliJ IDEA notes: 
- Plugins
  - Install NodeJS plugin, restart IDEA
  - Preferences -> Languages & Frameworks -> Node.js and NPM: Enable
- Preferences -> Languages & Frameworks -> Javascript
  - Set project language to React JSX
- Preferences -> Languages & Frameworks -> Javascript -> Libraries
  - Download
  - select 'jasmine', Download and install, Apply
  
### Misc development notes
- The version number is important; any changes must be consistent between all the following files:
  - `package.json`
  - `pom.xml`
  - `webpack.config.js`
  - `main/resources/frontend/index.html`
  - `main/js/stores/commonStore.js`
- After changing the version number, `npm run start` will stop working until you run a `mvn package`