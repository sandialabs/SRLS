# SRLS - Sandia RPM Lane Simulator

# Creating the Project

## Install the Vue CLI

```
sudo npm install -g @vue/cli
```

The project is ready to build after downloading from GitHub.  For those who
are contemplating creating other electron/vue/vuetify projects, this project 
was created using the following commands.

```
# create the base project
vue create rpmsimulator
   - add TypeScript support when prompted
cd rpmsimulator
vue add electron-builder
    - selected version 4.0.0
vue add vuetify
```


This project was installed without lint support. Using lint is a major annoyance because of the boilerplate code that the CLI creates. If you chose to use lint, you will need to add rules in tslint.json to ignore warnings from generated code and do some minor edits to App.vue and HelloWorld.vue to remove some warnings.

```
"rules": {
    "quotemark": false,
    "indent": [true, "spaces", 4],
    "interface-name": false,
    "ordered-imports": false,
    "object-literal-sort-keys": false,
    "no-consecutive-blank-lines": false,
    "semicolon": false,
    "no-var-requires": false,
    "no-console": false,
    "trailing-comma": false,
    "space-before-function-paren": false
}

```

# Building and Running

## Project setup

```
npm install
```

### Compile and run in Electron (with hot reloads)

```
npm run electron:serve
```

*Note: At the current time, browser-based testing (npm run serve) does not 
work because of an internal JavaScript exception.*

### Compile and minify for production

```
npm run electron:build
```

This produces an installation executable named SRLS*Setup-1.0.0 in the \_electron_dist* subdirectory.

### Run unit tests

```
npm run test:unit
```

# Creating an installer

To create an installer for SRLS, run the following command.

```
npm run electron:build
```
This will create an installer for the platform that you are running on and put it in ./dist_electron.

|Platform |Build Product       |
|---------|--------------------|
|Mac      |SRLS_Setup-1.0.0.dmg| 
|Windows  |SRLS_Setup-1.0.0.exe|
|Linux    |TBD|


### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).

# Developer Notes

1.  If you want to see console output from the main process (e.g. from background.js), you
    need to set an environment variable, ELECTRON_ENABLE_LOGGING, to 1.

## Global model data

To share your Vue model data among components, define and export it in main.js. Then add references to it in the components that need it.

```typescript
# main.js
export let AppData = {
    apptitle: "RPM Simulator"
}


# App.vue

<v-toolbar-title class="white--text">{{apptitle}}</v-toolbar-title>

...

import { AppData } from './main';

...

export default {
    name: "App",
    components: {
        HelloWorld
    },
    data() {
        return AppData;
    }
};


```

