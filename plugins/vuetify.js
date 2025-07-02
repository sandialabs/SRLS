// import 'vuetify/styles'
// import { createVuetify } from 'vuetify'

// export default createVuetify()
// import '@mdi/font/css/materialdesignicons.css'
// import '../public/css/material-icons.css'
import 'vuetify/styles'

import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
// import { aliases, mdi } from 'vuetify/iconsets/mdi'  // web-font iconset
import { aliases, mdi } from 'vuetify/iconsets/mdi'  // SVG set

// export default createVuetify({})
export default createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    // sets: { mdi },
    md: {
        component: (props) => h(VLigatureIcon, { ...props, class: 'material-icons' })
      }
  },
  // theme: {
  //   themes: {
  //     light: {
  //       dark: false,
  //       colors: {
  //         primary: colors.red.darken1, // #E53935
  //         secondary: colors.red.lighten4, // #FFCDD2
  //       }
  //     },
  //   },
  // },
})