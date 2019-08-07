# Sandia RPM Lane Simulator

# Creating the Project

## Install the Vue CLI

```
sudo npm install -g @vue/cli
```

## Use Vue CLI to create the project

This project was created using the following commands.

```
vue create from-scratch
    - added TypeScript support
cd from-scratch
vue add electron-builder
    - selected version 4.0.0
vue add vuetify
```

The default typescript code generates many warnings and one error. I fixed the error by adding "vuetify" to tsconfig.json "compilerOptions"."types".

```
{
  "compilerOptions": {
      ...
    "types": [
      "webpack-env",
      "vuetify"
    ],
    ...
}
```

This project was installed without lint support. Using lint is a major POS because of the boilerplate code that the CLI creates. If you chose to use lint, you will need to add rules in tslint.json to ignore warnings from generated code and do some minor edits to App.vue and HelloWorld.vue to remove some warnings.

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

### Compiles and hot-reloads for development

```
npm run serve
```

### Compiles and hot-reloads in Electron

```
npm run electron:serve
```

### Compiles and minifies for production

```
npm run electron:build
```

### Run your unit tests

```
npm run test:unit
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).

# Adding Functionality

## Better toolbar

In App.vue, replace the toolbar markup with the following.

```html
<v-toolbar dark color="primary">
    <v-toolbar-side-icon></v-toolbar-side-icon>

    <v-toolbar-title class="white--text">Title</v-toolbar-title>

    <v-spacer></v-spacer>

    <v-btn icon>
        <v-icon></v-icon>
    </v-btn>

    <v-btn icon>
        <v-icon>apps</v-icon>
    </v-btn>

    <v-btn icon>
        <v-icon>refresh</v-icon>
    </v-btn>

    <v-btn icon>
        <v-icon>more_vert</v-icon>
    </v-btn>
</v-toolbar>
```

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
