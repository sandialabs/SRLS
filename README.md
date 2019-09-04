# SRLS - Sandia RPM Lane Simulator

# Building and Running

## Project setup

```
npm install
```

### Compile and run in Electron (with hot reloads)

```
npm run electron:serve
```

_Note: At the current time, browser-based testing (npm run serve) does not
work because of an internal JavaScript exception._

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

| Platform | Build Product        |
| -------- | -------------------- |
| Mac      | SRLS_Setup-1.0.1.dmg |
| Windows  | SRLS_Setup-1.0.1.exe |
| Linux    | TBD                  |

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).

# Developer Notes

## 1. Console output

If you want to see console output from the main process (e.g. from background.js), you
need to set an environment variable, ELECTRON_ENABLE_LOGGING, to 1.

## 2. Global model data

A simple way to share Vue model data among components is to define and export it in main.ts. Then add references to it in the components that need it.

```
# main.ts
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

## License

This project is licensed under the MIT license.

## Copyright

Copyright 2019 National Technology & Engineering Solutions of Sandia, LLC (NTESS). Under the terms of Contract DE-NA0003525 with NTESS, the U.S. Government retains certain rights in this software.

Sandia National Laboratories is a multimission laboratory managed and operated by National Technology & Engineering Solutions of Sandia, LLC, a wholly owned subsidiary of Honeywell International Inc., for the U.S. Department of Energy’s National Nuclear Security Administration under contract DE-NA0003525

## Acknowledgement

The Sandia RPM Lane Simulator was developed with funds from the National Nuclear Security Administration of the US Department of Energy.

## Privacy Policy

The Sandia RPM Lane Simulator (SRLS) application does not collect or store any personal information. SRLS stores application configuration information locally on your computer. This information does not leave your computer, and can be deleted by removing the application data folder in the operating system's standard location for the application.
