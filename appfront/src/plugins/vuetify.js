/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Composables
import { createVuetify } from 'vuetify'
import { VDatePicker } from 'vuetify/labs/VDatePicker'
import { VuetifyDateAdapter } from 'vuetify/labs/date/adapters/vuetify'
// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  date: {
    adapter: VuetifyDateAdapter,
  },
  components: {
    VDatePicker,
  },
  theme: {
    themes: {
      light: {
        colors: {
          primary: '#1867C0',
          secondary: '#5CBBF6',
        },
      },
    },
  },
})
