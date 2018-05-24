# oscars-frontend
A frontend for OSCARS 1.0. 

Building blocks: React, MobX, React-Bootstrap v4, vis.js .


## Developer guid``e
### Installing prerequisites
`npm install` (`mvn package` will also do that)

### Bring up a dev server 
`npm run start`

### Packaging for Maven deployment 
`mvn clean package`

### Deploying artifact to github repo
`mvn clean package deploy`


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
- The version number is important; it should be the same in all of these files:
  - `package.json` 
  - `pom.xml`
  - `main/resources/frontend/index.html`
