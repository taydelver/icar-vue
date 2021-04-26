require('./bootstrap')

// Import modules...
import { createApp, h } from 'vue';

import SearchLayout from './SearchLayout.vue'

const app = createApp({})

app.component('search-layout', SearchLayout)

app.mount('#wbctzSearchLayout')

console.log('app loaded')