let mix = require('laravel-mix');

mix.js('src/js/app.js', 'js/webcitz_search.js')
    .sass('src/scss/app.scss', 'css/webcitz_search.css')
    .setPublicPath('dist')
    .vue()